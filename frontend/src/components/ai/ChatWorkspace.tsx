import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, RefreshCcw, Sparkles, Copy, Download, Edit2, Check, X, FileText, Paperclip } from "lucide-react";
import { AiMessage } from "@/services/aiStorage.service";
import { ResponseDetails } from "./ResponseDetails";

interface ChatWorkspaceProps {
  messages: AiMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  onStop: () => void;
  onRegenerate: () => void;
  onEditMessage?: (id: string, newContent: string) => void;
  contextParams?: any; // To pass context filters
}

export function ChatWorkspace({ messages, isStreaming, onSendMessage, onStop, onRegenerate, onEditMessage }: ChatWorkspaceProps) {
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExport = (text: string, format: 'md' | 'pdf') => {
    if (format === 'pdf') {
      window.print(); // Simple PDF export fallback
      return;
    }
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${format}`;
    a.click();
  };

  const handleStartEdit = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditContent(content);
  };

  const handleSaveEdit = (id: string) => {
    if (onEditMessage && editContent.trim()) {
      onEditMessage(id, editContent.trim());
    }
    setEditingMessageId(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">AI Copilot</h2>
            <p className="text-muted-foreground max-w-md">
              Your intelligent assistant. Ask questions, analyze customer sentiment, or generate professional responses.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['Summarize active chat', 'Write a professional apology', 'Explain billing policy'].map(prompt => (
                <BadgeButton key={prompt} onClick={() => setInput(prompt)}>{prompt}</BadgeButton>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-muted text-foreground rounded-tl-sm border'
              }`}>
                {msg.role === 'model' ? (
                  <div className="group relative">
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {!isStreaming && (
                      <div className="absolute -bottom-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background" onClick={() => handleCopy(msg.content)} title="Copy text">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background" onClick={() => handleExport(msg.content, 'md')} title="Export Markdown">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-md bg-background" onClick={() => onSendMessage("Please continue")} title="Continue Generation">
                          <RefreshCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap group relative">
                    {editingMessageId === msg.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <Textarea 
                          value={editContent} 
                          onChange={e => setEditContent(e.target.value)} 
                          className="text-foreground min-h-[60px] text-sm p-2"
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleSaveEdit(msg.id)}>Save & Send</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.content}
                        {!isStreaming && onEditMessage && (
                          <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 bg-primary/20 text-primary-foreground hover:bg-primary/40 rounded-full" onClick={() => handleStartEdit(msg.id, msg.content)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {msg.role === 'model' && msg.metadata && (
                  <ResponseDetails metadata={msg.metadata} timestamp={msg.timestamp} />
                )}
              </div>
            </div>
          ))
        )}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-muted border text-foreground rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
              <div className="flex space-x-1.5 items-center h-5">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex items-end shadow-sm border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-all">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the Copilot anything..."
            className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 pb-12"
          />
          {attachedDocs.length > 0 && (
            <div className="absolute top-2 left-4 flex gap-2">
              {attachedDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md border border-primary/20">
                  <FileText className="h-3 w-3" />
                  <span>{doc}</span>
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setAttachedDocs(prev => prev.filter((_, i) => i !== idx))} />
                </div>
              ))}
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" title="Attach Context" onClick={() => setAttachedDocs(prev => [...prev, 'Knowledge Doc ' + (prev.length + 1)])}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-medium">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-medium">Enter</kbd> to add a new line
              </div>
            </div>
            <div className="flex gap-2">
              {isStreaming ? (
                <Button size="icon" variant="destructive" onClick={onStop} className="h-8 w-8 rounded-lg shadow-sm">
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <>
                  {messages.length > 0 && messages[messages.length-1].role === 'model' && (
                    <Button size="icon" variant="outline" onClick={onRegenerate} className="h-8 w-8 rounded-lg">
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="h-8 w-8 rounded-lg shadow-sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-3 py-1.5 bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground border rounded-full text-xs transition-colors"
    >
      {children}
    </button>
  );
}
