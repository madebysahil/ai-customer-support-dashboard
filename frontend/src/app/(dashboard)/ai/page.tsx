"use client"

import React, { useState, useEffect, useRef } from 'react';
import { SidebarHistory } from '@/components/ai/SidebarHistory';
import { ChatWorkspace } from '@/components/ai/ChatWorkspace';
import { ContextPanel } from '@/components/ai/ContextPanel';
import { aiStorageService, AiSession, AiMessage } from '@/services/aiStorage.service';
import { api, getAccessToken } from '@/lib/api';

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeContext, setActiveContext] = useState<any>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadSessions = React.useCallback(async () => {
    const data = await aiStorageService.getSessions();
    setSessions(data);
    if (data.length > 0 && !activeSessionId) {
      setActiveSessionId(data[0].id);
    }
  }, [activeSessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const activeSession = activeSessionId 
    ? sessions.find(s => s.id === activeSessionId) 
    : { id: '', title: 'New Chat', messages: [], isPinned: false, createdAt: '', updatedAt: '' };

  const handleSendMessage = async (content: string) => {
    if (isStreaming) return;
    setIsStreaming(true);

    const userMessage: AiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    let session = activeSession as AiSession;
    if (!activeSessionId) {
      session = {
        id: crypto.randomUUID(),
        title: content.substring(0, 30) + '...',
        messages: [userMessage],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setActiveSessionId(session.id);
    } else {
      session = {
        ...session,
        messages: [...session.messages, userMessage],
        updatedAt: new Date().toISOString()
      };
    }

    await aiStorageService.saveSession(session);
    loadSessions();

    const aiMessageId = crypto.randomUUID();
    const modelMessage: AiMessage = {
      id: aiMessageId,
      role: 'model',
      content: '',
      timestamp: new Date().toISOString()
    };
    
    // Add empty model message to start streaming into
    session = {
      ...session,
      messages: [...session.messages, modelMessage]
    };
    await aiStorageService.saveSession(session);
    loadSessions();

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/ai/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken() || ''}`
        },
        body: JSON.stringify({
          messages: session.messages
            .filter(m => m.id !== aiMessageId)
            .slice(-15) // Conversational memory window limit
            .map(m => ({ role: m.role, content: m.content })),
          context: { query: content, ...activeContext }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let streamedContent = '';
      let metadata: any = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                const errorMsg = `⚠️ AI Error: ${data.error}`;
                
                // 1. Update UI state
                setSessions(prev => prev.map(s => {
                  if (s.id === session.id) {
                    return {
                      ...s,
                      messages: s.messages.map(m => m.id === aiMessageId ? { ...m, content: errorMsg } : m)
                    };
                  }
                  return s;
                }));
                
                // 2. Persist error to storage
                session = {
                  ...session,
                  messages: session.messages.map(m => m.id === aiMessageId ? { ...m, content: errorMsg } : m)
                };
                await aiStorageService.saveSession(session);
                
                // 3. Break stream loop
                break;
              }

              if (data.text) {
                streamedContent += data.text;
                // Update local state temporarily for smooth rendering
                setSessions(prev => prev.map(s => {
                  if (s.id === session.id) {
                    return {
                      ...s,
                      messages: s.messages.map(m => m.id === aiMessageId ? { ...m, content: streamedContent } : m)
                    };
                  }
                  return s;
                }));
              }
              if (data.metadata) {
                metadata = data.metadata;
              }
            } catch (e: any) {
              if (e.message.includes('AI Error:')) throw e; // Re-throw AI errors to break the loop
              console.warn("SSE JSON Parse error on chunk", line);
            }
          }
        }
      }

      // Final save
      session = {
        ...session,
        messages: session.messages.map(m => m.id === aiMessageId ? { ...m, content: streamedContent, metadata } : m)
      };
      await aiStorageService.saveSession(session);
      loadSessions();

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeSessionId) return;
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session || session.messages.length < 2) return;
    
    // Remove last model message
    session.messages.pop();
    const lastUserMessage = session.messages[session.messages.length - 1];
    
    await aiStorageService.saveSession(session);
    loadSessions();
    handleSendMessage(lastUserMessage.content);
  };

  const handleEditMessage = async (id: string, newContent: string) => {
    if (!activeSessionId) return;
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;

    const messageIndex = session.messages.findIndex(m => m.id === id);
    if (messageIndex === -1) return;

    // Truncate history up to the message before the edited one
    session.messages = session.messages.slice(0, messageIndex);
    await aiStorageService.saveSession(session);
    loadSessions();
    
    handleSendMessage(newContent);
  };

  const handleDelete = async (id: string) => {
    await aiStorageService.deleteSession(id);
    if (activeSessionId === id) setActiveSessionId(null);
    loadSessions();
  };

  const handleTogglePin = async (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      await aiStorageService.saveSession({ ...session, isPinned: !session.isPinned });
      loadSessions();
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      await aiStorageService.saveSession({ ...session, title: newTitle });
      loadSessions();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-lg border overflow-hidden shadow-sm">
      <div className="w-64 shrink-0 border-r hidden md:block">
        <SidebarHistory 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onNew={handleNewChat}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
          onRename={handleRename}
        />
      </div>
      <div className="flex-1 min-w-0 bg-background/50">
        <ChatWorkspace 
          messages={activeSession?.messages || []}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
          onStop={handleStop}
          onRegenerate={handleRegenerate}
          onEditMessage={handleEditMessage}
        />
      </div>
      <div className="w-80 shrink-0 border-l hidden lg:block">
        <ContextPanel 
          activeContext={activeContext}
          onContextChange={(type, id) => setActiveContext((prev: any) => ({ ...prev, [`${type}Id`]: id }))} 
        />
      </div>
    </div>
  );
}
