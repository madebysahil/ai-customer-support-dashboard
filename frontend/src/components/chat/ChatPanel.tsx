"use client"

import { useEffect, useState, useRef } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useChatMessages } from "@/hooks/useChats"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"
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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, aiState]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const tempMsg = {
      id: `temp_${Date.now()}`,
      content: input,
      authorId: user?.id,
      authorType: 'SUPPORT_AGENT',
      createdAt: new Date().toISOString()
    };
    
    // Optimistic UI
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    socket.emit('chat:typing.stop', { chatId });

    socket.emit('chat:message.send', { chatId, content: tempMsg.content }, (res: any) => {
      if (res.status === 'ok') {
        // Swap temp message with real message
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.message : m));
      }
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socket?.emit('chat:typing.start', { chatId });
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-r-xl border-l">
      {/* Header */}
      <div className="h-16 border-b flex items-center px-6 gap-3 shrink-0">
        <h3 className="font-semibold text-lg">Active Conversation</h3>
        {!isConnected && <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">Reconnecting...</span>}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
        {messages.map((msg, i) => {
          const isMe = msg.authorId === user?.id;
          const isAi = msg.authorType === 'AI_ASSISTANT';
          
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 
                  isAi ? 'bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-tl-sm' : 
                  'bg-muted/60 text-foreground rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] opacity-70 mt-1 block text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {isAi && <AiBadge confidenceScore={msg.metadata?.confidenceScore} />}
              </div>
            </div>
          )
        })}
        
        {/* Typing Indicators */}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-muted/60 rounded-2xl px-4 py-3 rounded-tl-sm flex gap-1 items-center">
               <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
             </div>
          </div>
        )}
        
        {/* AI State Indicators */}
        {(aiState === 'THINKING' || aiState === 'RESPONDING') && (
          <div className="flex justify-start">
             <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 rounded-tl-sm flex gap-2 items-center">
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
               <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
               <span className="text-xs text-indigo-500 font-medium ml-1">
                 {aiState === 'THINKING' ? 'AI is thinking...' : 'AI is responding...'}
               </span>
             </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t bg-background shrink-0 flex flex-col">
        <SuggestedReplies 
          replies={suggestedReplies} 
          onSelect={(r) => setInput(r)} 
        />
        <form onSubmit={handleSend} className="flex items-center gap-2 p-4">
          <Input 
            value={input}
            onChange={handleTyping}
            placeholder="Type your message..." 
            className="flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-1"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
