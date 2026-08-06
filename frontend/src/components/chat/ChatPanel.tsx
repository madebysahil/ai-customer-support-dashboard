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
      if (res.status === 'ok') console.log(`Joined chat ${chatId}`);
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
      <div className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-background/95 backdrop-blur z-10 sticky top-0">
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5 scroll-smooth" ref={scrollRef} onScroll={handleScroll}>
        {filteredMessages.map((msg, i) => {
          const isMe = msg.authorId === user?.id;
          const isAi = msg.authorType === 'AI_ASSISTANT';
          const isFailed = msg.status === 'FAILED';
          
          return (
            <div key={msg.id || i} className={`group flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {/* Left Actions (if Me) */}
              {isMe && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => navigator.clipboard.writeText(msg.content)}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setInput(prev => `> ${msg.content}\n\n${prev}`)}><Quote className="h-3 w-3" /></Button>
                  {isFailed && <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><RotateCcw className="h-3 w-3" /></Button>}
                </div>
              )}

              <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 relative shadow-sm ${
                  isMe ? (isFailed ? 'bg-destructive/10 border-destructive/20 text-destructive border rounded-tr-sm' : 'bg-primary text-primary-foreground rounded-tr-sm') : 
                  isAi ? 'bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-tl-sm' : 
                  'bg-muted/80 text-foreground rounded-tl-sm border border-border/50'
                }`}>
                  <div className={`prose prose-sm max-w-none break-words ${isMe ? 'text-primary-foreground prose-invert' : 'dark:prose-invert'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="flex items-center justify-end gap-1 mt-1.5 opacity-70">
                    <span className="text-[9px] font-medium tracking-wide">
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
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => navigator.clipboard.writeText(msg.content)}><Copy className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setInput(prev => `> ${msg.content}\n\n${prev}`)}><Reply className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Forward className="h-3 w-3" /></Button>
                </div>
              )}
            </div>
          )
        })}
        
        {/* Typing Indicators */}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-muted/60 border rounded-2xl px-4 py-4 rounded-tl-sm flex gap-1.5 items-center shadow-sm">
               <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
             </div>
          </div>
        )}
        
        {/* AI State Indicators */}
        {(aiState === 'THINKING' || aiState === 'RESPONDING') && (
          <div className="flex justify-start">
             <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 rounded-tl-sm flex gap-2 items-center shadow-sm">
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
               <span className="text-[10px] text-indigo-500 font-semibold ml-1 uppercase tracking-wider">
                 {aiState === 'THINKING' ? 'AI is thinking...' : 'AI is responding...'}
               </span>
             </div>
          </div>
        )}
      </div>

      {/* Jump to bottom */}
      {showScrollBottom && (
        <div className="absolute bottom-40 right-6 z-20">
          <Button size="icon" className="rounded-full shadow-lg h-8 w-8 bg-background border text-foreground hover:bg-muted" onClick={scrollToBottom}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Composer */}
      <div className="border-t bg-background shrink-0 flex flex-col p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        {/* AI Tools Bar */}
        <div className="flex items-center gap-2 mb-3">
          <Button variant="outline" size="sm" className="h-7 text-xs font-medium rounded-full bg-indigo-50/50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 opacity-50 cursor-not-allowed" title="Requires AI backend support. Upgrade to unlock rewrite capabilities.">
            <Wand2 className="h-3 w-3 mr-1.5" /> Rewrite
          </Button>

          <Button variant="outline" size="sm" className="h-7 text-xs font-medium rounded-full bg-blue-50/50 text-blue-600 border-blue-100 hover:bg-blue-100 opacity-50 cursor-not-allowed" title="Requires AI backend support. Upgrade to unlock tone adjustments.">
            <Sparkles className="h-3 w-3 mr-1.5" /> Professional Tone
          </Button>

          <Button variant="outline" size="sm" className="h-7 text-xs font-medium rounded-full bg-teal-50/50 text-teal-600 border-teal-100 hover:bg-teal-100 opacity-50 cursor-not-allowed" title="Requires AI backend support. Upgrade to unlock translation.">
            <Globe className="h-3 w-3 mr-1.5" /> Translate
          </Button>
        </div>

        <SuggestedReplies 
          replies={suggestedReplies} 
          onSelect={(r) => setInput(r)} 
        />
        
        <div className="relative flex items-end shadow-sm border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-all bg-muted/20">
          <Textarea 
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)" 
            className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 pb-12 text-sm"
          />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg opacity-50 cursor-not-allowed" title="Attachment upload requires backend storage configuration.">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <Button type="button" onClick={handleSend} size="icon" className="rounded-lg h-8 w-8 shadow-sm transition-all active:scale-95" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
