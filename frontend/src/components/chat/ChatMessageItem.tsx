"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Quote, Reply, RotateCcw, Forward } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { AiBadge } from "./ai/AiBadge";

export interface ChatMessageItemProps {
  msg: any;
  isMe: boolean;
  onCopy: (content: string) => void;
  onQuote: (content: string) => void;
  onReply: (content: string) => void;
  onRetry?: (msg: any) => void;
}

export const ChatMessageItem = React.memo(function ChatMessageItem({
  msg,
  isMe,
  onCopy,
  onQuote,
  onReply,
  onRetry,
}: ChatMessageItemProps) {
  const isAi = msg.authorType === "AI_ASSISTANT";
  const isFailed = msg.status === "FAILED";

  return (
    <div className={`group flex ${isMe ? "justify-end" : "justify-start"}`}>
      {/* Left Actions (if Me) */}
      {isMe && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground-muted hover:text-foreground"
            onClick={() => onCopy(msg.content)}
            title="Copy message"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground-muted hover:text-foreground"
            onClick={() => onQuote(msg.content)}
            title="Quote in composer"
          >
            <Quote className="h-3 w-3" />
          </Button>
          {isFailed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-critical hover:text-critical"
              onClick={() => onRetry?.(msg)}
              title="Retry sending"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-md px-3 py-2 relative ${
            isMe
              ? isFailed
                ? "bg-critical/10 border-critical/20 text-critical border"
                : "bg-primary text-primary-foreground"
              : isAi
              ? "bg-ai-surface border border-ai-border text-foreground"
              : "bg-surface text-foreground border border-border-subtle"
          }`}
        >
          <div className={`text-[13px] leading-relaxed break-words ${isMe ? "text-primary-foreground" : "text-foreground"}`}>
            <MarkdownRenderer content={msg.content} />
          </div>

          <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
            <span className="text-[10px] font-medium tracking-wide">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isMe && !isFailed && msg.status && (
              <span className="text-[9px] uppercase ml-1 tracking-widest">
                {msg.status === "SENDING" ? "..." : msg.status}
              </span>
            )}
          </div>
        </div>
        {isAi && <AiBadge confidenceScore={msg.metadata?.confidenceScore} />}
      </div>

      {/* Right Actions (if NOT Me) */}
      {!isMe && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground-muted hover:text-foreground"
            onClick={() => onCopy(msg.content)}
            title="Copy message"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground-muted hover:text-foreground"
            onClick={() => onReply(msg.content)}
            title="Reply with quote"
          >
            <Reply className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground-muted hover:text-foreground"
          >
            <Forward className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.msg.id === next.msg.id &&
    prev.msg.content === next.msg.content &&
    prev.msg.status === next.msg.status &&
    prev.msg.createdAt === next.msg.createdAt &&
    prev.isMe === next.isMe &&
    prev.msg.metadata?.confidenceScore === next.msg.metadata?.confidenceScore &&
    prev.onCopy === next.onCopy &&
    prev.onQuote === next.onQuote &&
    prev.onReply === next.onReply &&
    prev.onRetry === next.onRetry
  );
});
