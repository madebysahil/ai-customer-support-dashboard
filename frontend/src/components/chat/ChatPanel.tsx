"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useChatMessages } from "@/hooks/useChats"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Send, Loader2, Paperclip, Smile, Search, 
  ChevronDown, Copy, Quote, Forward, Reply, Edit2, RotateCcw,
  Wand2, Globe, Sparkles, AlertCircle
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AiBadge } from "./ai/AiBadge"
import { SuggestedReplies } from "./ai/SuggestedReplies"

export function ChatPanel({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { data: history, isLoading } = useChatMessages(chatId);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiState, setAiState] = useState<'IDLE' | 'THINKING' | 'RESPONDING' | 'FAILED' | 'ESCALATED'>('IDLE');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync historical messages
  useEffect(() => {
    if (history?.data) {
      setMessages(history.data);
    }
  }, [history]);

  // Handle Socket Subscriptions
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('chat:join', chatId, (res: any) => {
      // Join chat silently
    });

    const onMessageReceive = (msg: any) => {
      setMessages(prev => [...prev, msg]);
    };

    const onTypingStart = (data: any) => {
      if (data.userId !== user?.id) setIsTyping(true);
    };

    const onTypingStop = (data: any) => {
      if (data.userId !== user?.id) setIsTyping(false);
    };

    const onAiStateUpdate = (data: { chatId: string; state: any }) => {
      if (data.chatId === chatId) setAiState(data.state);
    };

    socket.on('chat:message.receive', onMessageReceive);
    socket.on('chat:typing.start', onTypingStart);
    socket.on('chat:typing.stop', onTypingStop);
    socket.on('ai:state.update', onAiStateUpdate);

    return () => {
      socket.emit('chat:leave', chatId);
      socket.off('chat:message.receive', onMessageReceive);
      socket.off('chat:typing.start', onTypingStart);
      socket.off('chat:typing.stop', onTypingStop);
      socket.off('ai:state.update', onAiStateUpdate);
    };
  }, [socket, chatId, user?.id]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, aiState]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !socket) return;

    const tempMsg = {
      id: `temp_${Date.now()}`,
      content: input,
      authorId: user?.id,
      authorType: 'SUPPORT_AGENT',
      createdAt: new Date().toISOString(),
      status: 'SENDING' // New status
    };
    
    // Optimistic UI
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    socket.emit('chat:typing.stop', { chatId });

    socket.emit('chat:message.send', { chatId, content: tempMsg.content }, (res: any) => {
      if (res.status === 'ok') {
        // Swap temp message with real message
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...res.message, status: 'DELIVERED' } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'FAILED' } : m));
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    socket?.emit('chat:typing.start', { chatId });
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="flex flex-col h-full bg-background relative border-r overflow-hidden shadow-sm">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-surface z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[15px]">Active Conversation</h3>
          {!isConnected && <span className="text-[10px] bg-destructive/10 text-destructive font-medium px-2 py-0.5 rounded-full">Reconnecting...</span>}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-8 h-8 w-48 text-xs bg-muted/50 border-transparent focus-visible:bg-background transition-all focus:w-64" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-background scroll-smooth" ref={scrollRef} onScroll={handleScroll}>
        {filteredMessages.map((msg, i) => {
          const isMe = msg.authorId === user?.id;
          const isAi = msg.authorType === 'AI_ASSISTANT';
          const isFailed = msg.status === 'FAILED';
          
          return (
            <div key={msg.id || i} className={`group flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {/* Left Actions (if Me) */}
              {isMe && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground-muted hover:text-foreground" onClick={() => navigator.clipboard.writeText(msg.content)}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground-muted hover:text-foreground" onClick={() => setInput(prev => `> ${msg.content}\n\n${prev}`)}><Quote className="h-3 w-3" /></Button>
                  {isFailed && <Button variant="ghost" size="icon" className="h-6 w-6 text-critical hover:text-critical"><RotateCcw className="h-3 w-3" /></Button>}
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-md px-3 py-2 relative ${
                  isMe ? (isFailed ? 'bg-critical/10 border-critical/20 text-critical border' : 'bg-primary text-primary-foreground') : 
                  isAi ? 'bg-ai-surface border border-ai-border text-foreground' : 
                  'bg-surface text-foreground border border-border-subtle'
                }`}>
                  <div className={`text-[13px] leading-relaxed break-words ${isMe ? 'text-primary-foreground' : 'text-foreground'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                    <span className="text-[10px] font-medium tracking-wide">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && !isFailed && msg.status && (
                      <span className="text-[9px] uppercase ml-1 tracking-widest">{msg.status === 'SENDING' ? '...' : msg.status}</span>
                    )}
                  </div>
                </div>
                {isAi && <AiBadge confidenceScore={msg.metadata?.confidenceScore} />}
              </div>

              {/* Right Actions (if NOT Me) */}
              {!isMe && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground-muted hover:text-foreground" onClick={() => navigator.clipboard.writeText(msg.content)}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground-muted hover:text-foreground" onClick={() => setInput(prev => `> ${msg.content}\n\n${prev}`)}><Reply className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground-muted hover:text-foreground"><Forward className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Typing Indicators */}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-surface border border-border-subtle rounded-md px-4 py-3 flex gap-1.5 items-center">
               <span className="w-1.5 h-1.5 bg-foreground-muted/60 rounded-full animate-pulse"></span>
               <span className="w-1.5 h-1.5 bg-foreground-muted/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-1.5 h-1.5 bg-foreground-muted/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
             </div>
          </div>
        )}
        
        {/* AI State Indicators */}
        {(aiState === 'THINKING' || aiState === 'RESPONDING') && (
          <div className="flex justify-start">
             <div className="bg-ai-surface border border-ai-border rounded-md px-3 py-2 flex gap-2 items-center">
               <Sparkles className="h-3 w-3 text-primary animate-pulse" />
               <span className="text-[11px] text-foreground-muted font-medium">
                 {aiState === 'THINKING' ? 'AI is thinking...' : 'AI is responding...'}
               </span>
             </div>
          </div>
        )}
      </div>

      {/* Jump to bottom */}
      {showScrollBottom && (
        <div className="absolute bottom-32 right-6 z-20">
          <Button size="icon" className="rounded-full shadow-md h-8 w-8 bg-surface border text-foreground hover:bg-background-subtle" onClick={scrollToBottom}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-border-subtle bg-surface shrink-0 flex flex-col p-4">
        <SuggestedReplies 
          replies={suggestedReplies} 
          onSelect={(r) => setInput(r)} 
        />
        
        <div className="relative flex items-end border border-border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all bg-background">
          <Textarea 
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)" 
            className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-3 pb-12 text-[13px]"
          />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-foreground-muted hover:text-foreground rounded-md opacity-50 cursor-not-allowed">
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-foreground-muted hover:text-foreground rounded-md">
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <Button type="button" onClick={handleSend} size="icon" className="rounded-md h-7 w-7 transition-all active:scale-95" disabled={!input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
