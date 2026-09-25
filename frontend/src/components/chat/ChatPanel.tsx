"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useChatMessages } from "@/hooks/useChats";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChatComposer, ChatComposerHandle } from "./ChatComposer";
import { ChatMessageItem } from "./ChatMessageItem";

export function ChatPanel({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { data: history, isLoading } = useChatMessages(chatId);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiState, setAiState] = useState<"IDLE" | "THINKING" | "RESPONDING" | "FAILED" | "ESCALATED">("IDLE");
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ChatComposerHandle>(null);

  // Sync historical messages
  useEffect(() => {
    if (history?.data) {
      setMessages(history.data);
    }
  }, [history]);

  // Handle Socket Subscriptions
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit("chat:join", chatId);

    const onMessageReceive = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
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

    socket.on("chat:message.receive", onMessageReceive);
    socket.on("chat:typing.start", onTypingStart);
    socket.on("chat:typing.stop", onTypingStop);
    socket.on("ai:state.update", onAiStateUpdate);

    return () => {
      socket.emit("chat:leave", chatId);
      socket.off("chat:message.receive", onMessageReceive);
      socket.off("chat:typing.start", onTypingStart);
      socket.off("chat:typing.stop", onTypingStop);
      socket.off("ai:state.update", onAiStateUpdate);
    };
  }, [socket, chatId, user?.id]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    return messages.filter((m) => m.content?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [messages, searchQuery]);

  // Dynamic Height Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredMessages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 5,
  });

  const scrollToBottom = useCallback((smooth = true) => {
    if (filteredMessages.length > 0) {
      rowVirtualizer.scrollToIndex(filteredMessages.length - 1, {
        align: "end",
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, [filteredMessages.length, rowVirtualizer]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  // Sticky Auto-Scroll Guard
  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(false);
    }
  }, [messages.length, isTyping, aiState, showScrollBottom, scrollToBottom]);

  // Stable Callbacks
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleQuote = useCallback((content: string) => {
    composerRef.current?.appendQuote(content);
  }, []);

  const handleReply = useCallback((content: string) => {
    composerRef.current?.appendQuote(content);
  }, []);

  const handleRetry = useCallback((failedMsg: any) => {
    if (!socket) return;
    setMessages((prev) => prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "SENDING" } : m)));
    socket.emit("chat:message.send", { chatId, content: failedMsg.content }, (res: any) => {
      if (res.status === "ok") {
        setMessages((prev) => prev.map((m) => (m.id === failedMsg.id ? { ...res.message, status: "DELIVERED" } : m)));
      } else {
        setMessages((prev) => prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "FAILED" } : m)));
      }
    });
  }, [socket, chatId]);

  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim() || !socket) return;

    const tempMsg = {
      id: `temp_${Date.now()}`,
      content,
      authorId: user?.id,
      authorType: "SUPPORT_AGENT",
      createdAt: new Date().toISOString(),
      status: "SENDING",
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("chat:message.send", { chatId, content: tempMsg.content }, (res: any) => {
      if (res.status === "ok") {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? { ...res.message, status: "DELIVERED" } : m)));
      } else {
        setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? { ...m, status: "FAILED" } : m)));
      }
    });
  }, [socket, chatId, user?.id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative border-r overflow-hidden shadow-sm">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-surface z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-[15px]">Active Conversation</h3>
          {!isConnected && (
            <span className="text-[10px] bg-destructive/10 text-destructive font-medium px-2 py-0.5 rounded-full">
              Reconnecting...
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8 h-8 w-48 text-xs bg-muted/50 border-transparent focus-visible:bg-background transition-all focus:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Virtualized Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-6 bg-background scroll-smooth"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const msg = filteredMessages[virtualRow.index];
            const isMe = msg.authorId === user?.id;

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pb-4">
                  <ChatMessageItem
                    msg={msg}
                    isMe={isMe}
                    onCopy={handleCopy}
                    onQuote={handleQuote}
                    onReply={handleReply}
                    onRetry={handleRetry}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicators Flowing at End of Timeline */}
        <div className="space-y-2 pt-2">
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border-subtle rounded-md px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-foreground-muted/60 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-foreground-muted/60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 h-1.5 bg-foreground-muted/60 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          {(aiState === "THINKING" || aiState === "RESPONDING") && (
            <div className="flex justify-start">
              <div className="bg-ai-surface border border-ai-border rounded-md px-3 py-2 flex gap-2 items-center">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[11px] text-foreground-muted font-medium">
                  {aiState === "THINKING" ? "AI is thinking..." : "AI is responding..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jump to bottom */}
      {showScrollBottom && (
        <div className="absolute bottom-32 right-6 z-20">
          <Button
            size="icon"
            className="rounded-full shadow-md h-8 w-8 bg-surface border text-foreground hover:bg-background-subtle"
            onClick={() => scrollToBottom(true)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Keystroke Isolated Composer */}
      <ChatComposer
        ref={composerRef}
        chatId={chatId}
        socket={socket}
        onSend={handleSendMessage}
        suggestedReplies={suggestedReplies}
      />
    </div>
  );
}
