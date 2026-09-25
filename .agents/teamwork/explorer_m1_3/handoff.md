# Handoff Report: Explorer 3 — Memoization & Virtualization

**Agent**: Explorer 3 (`explorer_m1_3`)  
**Mission**: Runtime Performance & Virtualization Investigation (`FEAT-OPT-05` to `FEAT-OPT-10`)  
**Date**: 2026-09-25T13:18:00Z  
**Target Codebase**: `/Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend`  
**Milestone**: Milestone 1 (Bundle & Runtime Optimization)  

---

## 1. Observation

Direct empirical observations from inspecting the codebase, component state trees, render triggers, and virtual scroll requirements:

### 1.1 Dependency Inventory (`frontend/package.json`)
- Framework: Next.js `16.3.0`, React `19.2.8`, ReactDOM `19.2.8`.
- Virtualization: `@tanstack/react-virtual` is **NOT currently installed** in `frontend/package.json:11-38`.
- Requirement: Authorized in `ORIGINAL_REQUEST.md:28` (*"Do not restructure the existing architecture or add new UI dependencies (except `@tanstack/react-virtual` if needed)"*). Installing `@tanstack/react-virtual: ^3.13.0` is required.

### 1.2 `ChatPanel.tsx` Re-Render & Keystroke Bottlenecks (`frontend/src/components/chat/ChatPanel.tsx`)
- **Keystroke Trigger** (`ChatPanel.tsx:25, 130-133`):
  `const [input, setInput] = useState("")` is declared at the top of the parent `ChatPanel` component.
  The textarea calls `handleTyping` (`onChange={(e) => { setInput(e.target.value); socket?.emit('chat:typing.start', { chatId }); }}`).
  Every keystroke updates state in `ChatPanel`, forcing a full re-render of:
  - Header with 2 Lucide icons (`Search`, `Loader2`).
  - Search input element and state.
  - Message scroll container (`ChatPanel.tsx:165-215`).
  - Every single message item mapped inline:
    `<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>` runs repeatedly for every visible message on every character typed!
  - Quote (`Quote`), Reply (`Reply`), and Copy (`Copy`) buttons recreated inline.
- **Unthrottled Socket Emission** (`ChatPanel.tsx:132`):
  `socket?.emit('chat:typing.start', { chatId })` fires on *every single keystroke* without debouncing or throttling, flooding the WebSocket connection.
- **Missing Memoization** (`ChatPanel.tsx:95-133`):
  `handleSend`, `handleKeyDown`, and the inline quote/reply callbacks (`onClick={() => setInput(prev => \`> \${msg.content}\\n\\n\${prev}\`)}`) are recreated on every render.
- **Unvirtualized DOM** (`ChatPanel.tsx:164-239`):
  Messages are rendered in a flat `<div>` with `space-y-4`. When a conversation contains 100+ turns, 100+ message DOM subtrees remain mounted, causing layout thrashing and scroll hitching.

### 1.3 `TicketDetails.tsx` Comment Composer Bottlenecks (`frontend/src/components/tickets/TicketDetails.tsx`)
- **Keystroke Trigger** (`TicketDetails.tsx:14-15, 195`):
  `const [comment, setComment] = useState("")` and `const [isInternal, setIsInternal] = useState(false)` are held in the root of `TicketDetails`.
  The comment textarea binds `onChange={(e) => setComment(e.target.value)}`.
  Every keystroke re-renders:
  - Ticket header (subject, ticket number, customer badge, resolve button).
  - Properties bar (status, priority, assignee, SLA breach badge).
  - Original customer description box.
  - The entire comment history timeline (`TicketDetails.tsx:130-161`), where each comment executes `<ReactMarkdown>{c.content}</ReactMarkdown>`.
- **Extraneous Mutation Hook** (`TicketDetails.tsx:11`):
  `const addComment = useAddTicketComment()` is mounted in `TicketDetails` but only invoked when submitting comments.

### 1.4 `TicketList.tsx` Render Bottlenecks (`frontend/src/components/tickets/TicketList.tsx`)
- **Unmemoized Status Aggregation** (`TicketList.tsx:40-44`):
  `ticketsByStatus` is calculated via unmemoized `reduce()` on every single render:
  ```typescript
  const ticketsByStatus = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.status]) acc[ticket.status] = [];
    acc[ticket.status].push(ticket);
    return acc;
  }, {} as Record<StatusType, Ticket[]>)
  ```
  Whenever `search` changes or `activeTicketId` updates, `ticketsByStatus` creates completely new object and array references.
- **Unmemoized Ticket Cards** (`TicketList.tsx:114-135, 157-179`):
  In both list mode and kanban mode, ticket cards are rendered inline without `React.memo`. When `activeTicketId` changes, all 20–50 cards in the list and kanban columns re-render, recalculating `PRIORITY_COLORS`, dates, and DOM nodes.
- **Unvirtualized List Mode** (`TicketList.tsx:110-137`):
  List view renders all tickets in a flat column. For high ticket volumes (e.g. 100+ items), DOM nodes are not recycled.

### 1.5 `ConversationList.tsx` Re-render & Debounce Gaps (`frontend/src/components/chat/ConversationList.tsx`)
- **Un-debounced Filter Execution** (`ConversationList.tsx:15, 18-50`):
  `filteredChats` runs immediately on `searchQuery` via `useMemo([data, searchQuery, activeTab])`. Rapid keystrokes execute regex/string scans across all chats on every keystroke.
- **Unmemoized Conversation Rows** (`ConversationList.tsx:103-160`):
  Every conversation row is rendered inline. Selecting a chat (`activeChatId`) re-renders every item in the list, recalculating initial initials (`substring(0, 2)`), date format strings, and class interpolations.

### 1.6 AI Streaming Re-render Thrashing (`ChatWorkspace.tsx` & `TicketAiAssistant.tsx`)
- **`ChatWorkspace.tsx:96-156`**:
  All messages are mapped inline with `<ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>`.
  When SSE streaming chunks arrive (at up to 30–50 chunks per second in `app/(dashboard)/ai/page.tsx:152-164`), the active session `messages` array updates on every token. Every historical message bubble in the conversation is re-rendered and re-parsed through `ReactMarkdown` on every single token.
- **`TicketAiAssistant.tsx:116-119`**:
  `setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: streamedContent } : m))` runs on every SSE text token. This triggers a full re-render of the assistant view and re-runs `ReactMarkdown` on all previous messages in the ticket's copilot pane.

### 1.7 Audit Log Virtualization Gap (`frontend/src/app/(dashboard)/users/page.tsx`)
- Lines 128-160:
  The `Immutable Audit Log` tab renders an HTML `TableBody` mapping `logs.map((log: any) => ...)`.
  In enterprise deployments with hundreds or thousands of audit events, this table renders without pagination or DOM recycling, causing significant browser DOM memory bloat.

---

## 2. Logic Chain

```
[Observation 1.1] @tanstack/react-virtual not installed
       │
       └─► Add `@tanstack/react-virtual: ^3.13.0` to frontend/package.json
               │
               ├─► [Observation 1.2 & 1.4 & 1.7] High-volume lists lack DOM recycling
               │       ├─► ChatPanel.tsx: Implement `useVirtualizer` with `measureElement` & sticky bottom scroll
               │       ├─► TicketList.tsx (list view): Implement `useVirtualizer` for high-volume queue
               │       └─► users/page.tsx (audit logs): Implement table virtualization via spacer rows
               │
               ├─► [Observation 1.2 & 1.3] Input states in parent cause full page re-renders
               │       ├─► ChatPanel.tsx: Extract `ChatComposer` with internal input state & imperative handle
               │       ├─► ChatPanel.tsx: Wrap `ChatMessageItem` in `React.memo` with custom equality check
               │       └─► TicketDetails.tsx: Extract `TicketCommentComposer` and wrap `TicketCommentItem` in `React.memo`
               │
               ├─► [Observation 1.4] Ticket status grouping & card re-renders
               │       ├─► TicketList.tsx: Memoize `ticketsByStatus` with `useMemo([tickets])`
               │       └─► TicketList.tsx: Extract `TicketListItem` & `TicketKanbanCard` wrapped in `React.memo`
               │
               ├─► [Observation 1.5] Conversation search typing churn
               │       ├─► ConversationList.tsx: Debounce search filter by 200ms
               │       └─► ConversationList.tsx: Extract `ConversationListItem` with `React.memo`
               │
               └─► [Observation 1.6] AI SSE streaming triggers historical message re-renders
                       ├─► ChatWorkspace.tsx: Wrap historical `AiMessageItem` in `React.memo`
                       └─► TicketAiAssistant.tsx: Decouple streaming token buffer into dedicated `StreamingAiBubble`
```

---

## 3. Caveats

1. **React 19 Compatibility**:
   - `frontend/package.json` uses React `^19.2.8`.
   - `@tanstack/react-virtual` v3 (`^3.13.0`) is fully compatible with React 19. It uses standard DOM refs and `requestAnimationFrame`.
2. **Dynamic Height Virtualization in Chat (`measureElement`)**:
   - Chat bubbles have variable heights due to markdown content, code blocks, images, and AI badges.
   - Using static item sizing (`estimateSize`) alone causes text clipping or overlapping.
   - The virtualizer must attach `ref={virtualizer.measureElement}` and `data-index={virtualRow.index}` to every item wrapper.
3. **Sticky Auto-Scroll Guard**:
   - When a user is actively reading historical messages (scrolled up > 100px), incoming socket messages or streaming tokens must NOT jerk the scroll position down. Auto-scroll must only fire if `showScrollBottom === false` (user is already at the bottom).
4. **Table Virtualization with Semantic HTML `<table>`**:
   - Absolute positioning on `<tr>` breaks HTML table layout in many browsers unless `display: block` or flex is forced, which breaks automatic column widths.
   - For `users/page.tsx`, the authoritative and bulletproof approach is **Spacer Rows** (`<tr><td colSpan={4} style={{ height: paddingTop }} /></tr>`), which maintains standard `<table>` semantics and preserves sticky `<thead>`.
5. **Imperative Handle for ChatComposer**:
   - Actions like "Quote" and "Reply" from memoized message items require injecting text into the composer.
   - To avoid putting `input` back into parent state (which would defeat keystroke isolation), `ChatComposer` exposes an imperative handle (`ref: ChatComposerHandle`) with `appendQuote(text)` and `setInput(text)`.

---

## 4. Conclusion & Technical Implementation Blueprints

### 4.1 Dependency Addition (`frontend/package.json`)
Add to `"dependencies"`:
```json
"@tanstack/react-virtual": "^3.13.0"
```

---

### 4.2 `FEAT-OPT-05`: `ChatPanel.tsx` Keystroke Isolation & Memoization

#### A. Isolated `ChatComposer` Component (`frontend/src/components/chat/ChatComposer.tsx`)
```tsx
"use client";

import React, { useState, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Smile } from "lucide-react";
import { SuggestedReplies } from "./ai/SuggestedReplies";

export interface ChatComposerHandle {
  setInput: (value: string | ((prev: string) => string)) => void;
  appendQuote: (content: string) => void;
  focus: () => void;
}

export interface ChatComposerProps {
  chatId: string;
  onSend: (content: string) => void;
  suggestedReplies: string[];
  socket: any;
  disabled?: boolean;
}

export const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(
  function ChatComposer({ chatId, onSend, suggestedReplies, socket, disabled }, ref) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastTypingEmitRef = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      setInput: (val) => {
        setInput(val);
        textareaRef.current?.focus();
      },
      appendQuote: (quoteText: string) => {
        setInput((prev) => (prev ? `> ${quoteText}\n\n${prev}` : `> ${quoteText}\n\n`));
        textareaRef.current?.focus();
      },
      focus: () => textareaRef.current?.focus(),
    }));

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const now = Date.now();
      // Throttle typing.start to once every 2.5 seconds
      if (now - lastTypingEmitRef.current > 2500) {
        socket?.emit("chat:typing.start", { chatId });
        lastTypingEmitRef.current = now;
      }
    };

    const handleSend = useCallback((e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || disabled) return;

      onSend(trimmed);
      setInput("");
      socket?.emit("chat:typing.stop", { chatId });
    }, [input, disabled, onSend, socket, chatId]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleSelectSuggestedReply = useCallback((reply: string) => {
      setInput(reply);
      textareaRef.current?.focus();
    }, []);

    return (
      <div className="border-t border-border-subtle bg-surface shrink-0 flex flex-col p-4">
        <SuggestedReplies
          replies={suggestedReplies}
          onSelect={handleSelectSuggestedReply}
        />

        <div className="relative flex items-end border border-border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all bg-background">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="min-h-[60px] max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-3 pb-12 text-[13px]"
          />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-foreground-muted hover:text-foreground rounded-md opacity-50 cursor-not-allowed"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-foreground-muted hover:text-foreground rounded-md"
              >
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleSend}
              size="icon"
              className="rounded-md h-7 w-7 transition-all active:scale-95"
              disabled={!input.trim() || disabled}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
```

#### B. Memoized `ChatMessageItem` (`frontend/src/components/chat/ChatMessageItem.tsx`)
```tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Quote, Reply, RotateCcw, Forward } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
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
```

---

### 4.3 `FEAT-OPT-09`: Chat Timeline Virtualization (`useVirtualizer` in `ChatPanel.tsx`)

#### Full Refactored `ChatPanel.tsx` Blueprint:
```tsx
"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useChatMessages } from "@/hooks/useChats";
import { useAuth } from "@/hooks/useAuth";
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
```

---

### 4.4 `FEAT-OPT-06`: `TicketDetails.tsx` Comment Composer Isolation & `TicketList.tsx` Status Grouping Memoization

#### A. Isolated `TicketCommentComposer` in `TicketDetails.tsx`
Extract into a dedicated component inside `frontend/src/components/tickets/TicketDetails.tsx`:
```tsx
interface TicketCommentComposerProps {
  ticketId: string;
}

export const TicketCommentComposer = React.memo(function TicketCommentComposer({ ticketId }: TicketCommentComposerProps) {
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const addComment = useAddTicketComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addComment.mutate(
      { id: ticketId, content: comment, isInternal },
      {
        onSuccess: () => {
          setComment("");
        },
      }
    );
  };

  return (
    <div className="p-4 bg-background border-t border-border-subtle shrink-0">
      <form
        onSubmit={handleSubmit}
        className={`max-w-3xl mx-auto rounded-md border flex flex-col transition-colors bg-surface ${
          isInternal
            ? "border-warning/40 ring-1 ring-warning/20"
            : "border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary"
        }`}
      >
        <div
          className={`px-3 py-1.5 text-[11px] font-medium border-b flex items-center gap-2 ${
            isInternal
              ? "bg-warning/10 text-warning-muted border-warning/20"
              : "bg-background-subtle text-foreground-muted border-border-subtle"
          }`}
        >
          {isInternal ? <Lock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
          {isInternal ? "Private Internal Note" : "Public Reply"}
        </div>
        <textarea
          className="w-full min-h-[80px] p-3 text-[13px] resize-none focus:outline-none bg-transparent"
          placeholder={isInternal ? "Type a private note visible only to your team..." : "Type your reply to the customer (Markdown supported)..."}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div
          className={`flex justify-between items-center px-2 py-2 border-t ${
            isInternal ? "bg-warning/5 border-warning/20" : "bg-background-subtle border-border-subtle"
          }`}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 text-[11px] ${
              isInternal
                ? "text-warning-muted hover:bg-warning/10 hover:text-warning"
                : "text-foreground-muted hover:text-foreground"
            }`}
            onClick={() => setIsInternal(!isInternal)}
          >
            <Lock className="mr-1.5 h-3 w-3" /> {isInternal ? "Switch to Public Reply" : "Make Internal"}
          </Button>
          <Button
            type="submit"
            size="sm"
            className={`h-7 text-[11px] ${isInternal ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}`}
            disabled={!comment.trim() || addComment.isPending}
          >
            {addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Send className="h-3 w-3 mr-1.5" />}
            {isInternal ? "Add Note" : "Send Reply"}
          </Button>
        </div>
      </form>
    </div>
  );
});
```

#### B. Memoized `TicketList.tsx` Status Grouping & Card Memoization
In `frontend/src/components/tickets/TicketList.tsx`:
```tsx
// 1. Status Grouping Memoization:
const ticketsByStatus = useMemo(() => {
  const grouped: Record<StatusType, Ticket[]> = {
    OPEN: [],
    PENDING_INTERNAL: [],
    PENDING_CLIENT: [],
    RESOLVED: [],
    CLOSED: [],
  };
  for (const ticket of tickets) {
    if (grouped[ticket.status as StatusType]) {
      grouped[ticket.status as StatusType].push(ticket);
    }
  }
  return grouped;
}, [tickets]);

// 2. Extract Memoized TicketListItem:
export const TicketListItem = React.memo(function TicketListItem({
  ticket,
  isActive,
  onClick,
}: {
  ticket: Ticket;
  isActive: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(ticket.id)}
      className={`flex flex-col p-4 border-b border-border-subtle cursor-pointer transition-colors hover:bg-surface ${
        isActive ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-foreground-muted">{ticket.ticketNumber}</span>
        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-medium border ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <h4 className="font-medium text-sm mb-1 truncate pr-4 text-foreground">{ticket.subject}</h4>
      <div className="flex items-center justify-between text-[11px] text-foreground-muted mt-2">
        <span className="truncate">{ticket.customer?.displayName || "Unknown Customer"}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}, (prev, next) => prev.ticket === next.ticket && prev.isActive === next.isActive);
```

---

### 4.5 `FEAT-OPT-07`: `ConversationList.tsx` Debounced Search & Memoization

In `frontend/src/components/chat/ConversationList.tsx`:
```tsx
// 1. Debounced Search Query Hook / Effect:
const [searchQuery, setSearchQuery] = useState("");
const [debouncedQuery, setDebouncedQuery] = useState("");

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 200);
  return () => clearTimeout(handler);
}, [searchQuery]);

// 2. Filter computation now listens to debouncedQuery:
const filteredChats = useMemo(() => {
  if (!data?.data) return [];
  let chats = data.data as any[];

  if (debouncedQuery.trim()) {
    const q = debouncedQuery.toLowerCase();
    chats = chats.filter((c) =>
      c.customer.displayName?.toLowerCase().includes(q) ||
      c.customer.email?.toLowerCase().includes(q) ||
      c.messages?.[0]?.content?.toLowerCase().includes(q)
    );
  }

  switch (activeTab) {
    case "unread":
      chats = chats.filter((c) => {
        const lastMsg = c.messages?.[c.messages.length - 1] || c.messages?.[0];
        return lastMsg && !lastMsg.isRead && lastMsg.authorType !== "SUPPORT_AGENT";
      });
      break;
    case "assigned":
      chats = chats.filter((c) => c.assignedToId || c.assignedAgentId);
      break;
    case "waiting":
      chats = chats.filter((c) => c.status === "PENDING_INTERNAL");
      break;
    case "ai":
      chats = chats.filter((c) => c.messages?.some((m: any) => m.authorType === "AI_ASSISTANT"));
      break;
  }

  return chats;
}, [data, debouncedQuery, activeTab]);

// 3. Extract and Memoize ConversationListItem:
export const ConversationListItem = React.memo(function ConversationListItem({
  chat,
  isActive,
  onSelect,
}: {
  chat: any;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const lastMessage = chat.messages?.[chat.messages.length - 1] || chat.messages?.[0];
  const isUnread = lastMessage && !lastMessage.isRead && lastMessage.authorType !== "SUPPORT_AGENT";
  const isRecentlyActive = new Date(chat.updatedAt).getTime() > Date.now() - 15 * 60 * 1000;

  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`flex items-start gap-3 p-3 text-left cursor-pointer transition-colors border-b border-border-subtle last:border-0 relative w-full ${
        isActive
          ? "bg-primary/5 border-l-2 border-l-primary"
          : "hover:bg-surface border-l-2 border-l-transparent"
      }`}
    >
      <div className="relative shrink-0 mt-0.5">
        <Avatar className="h-9 w-9 border border-border-subtle">
          <AvatarFallback className="bg-surface-raised text-foreground-muted font-medium text-xs">
            {chat.customer.displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isRecentlyActive && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-success shadow-sm" />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="font-semibold text-sm truncate text-foreground">
            {chat.customer.displayName}
          </span>
          <span className={`text-[10px] whitespace-nowrap ml-2 ${isUnread ? "text-primary font-medium" : "text-foreground-muted"}`}>
            {new Date(chat.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs truncate ${isUnread ? "text-foreground font-medium" : "text-foreground-muted"}`}>
            {lastMessage?.content || "No messages yet"}
          </span>
          {isUnread && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          {chat.assignedToId && (
            <Badge variant="secondary" className="text-[9px] px-1 h-4 flex items-center gap-1 rounded-sm bg-background-subtle">
              <User className="h-2.5 w-2.5" /> Assigned
            </Badge>
          )}
          {chat.status === "PENDING_INTERNAL" && (
            <Badge variant="warning" className="text-[9px] px-1 h-4 flex items-center gap-1 rounded-sm">
              <Clock className="h-2.5 w-2.5" /> Waiting
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}, (prev, next) => {
  return (
    prev.chat.id === next.chat.id &&
    prev.isActive === next.isActive &&
    prev.chat.updatedAt === next.chat.updatedAt &&
    prev.chat.status === next.chat.status &&
    prev.chat.assignedToId === next.chat.assignedToId &&
    prev.chat.messages?.length === next.chat.messages?.length &&
    prev.onSelect === next.onSelect
  );
});
```

---

### 4.6 `FEAT-OPT-08`: AI Streaming Token Isolation

#### Strategy in `TicketAiAssistant.tsx`:
Separate the actively streaming token buffer from historical messages:
```tsx
// Inside TicketAiAssistant:
const [messages, setMessages] = useState<AiMessage[]>([]);
const [streamingText, setStreamingText] = useState<string | null>(null);
const [streamingMetadata, setStreamingMetadata] = useState<any>(null);

// In the stream loop:
let streamedContent = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  ...
  for (const line of lines) {
    if (line.startsWith("data: ") && line !== "data: [DONE]") {
      const data = JSON.parse(line.slice(6));
      if (data.text) {
        streamedContent += data.text;
        setStreamingText(streamedContent); // Only updates the streaming bubble!
      }
      if (data.metadata) {
        setStreamingMetadata(data.metadata);
      }
    }
  }
}

// Upon completion:
setMessages((prev) => [
  ...prev,
  { id: aiMessageId, role: "assistant", content: streamedContent, metadata: streamingMetadata },
]);
setStreamingText(null);
setStreamingMetadata(null);
```

#### Dedicated Streaming Bubble Component:
```tsx
const StreamingAiBubble = React.memo(function StreamingAiBubble({
  content,
  metadata,
}: {
  content: string;
  metadata?: any;
}) {
  return (
    <div className="flex flex-col gap-1 max-w-[90%] mr-auto">
      <div className="text-[10px] font-semibold px-1 text-primary flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Copilot
      </div>
      <div className="p-3 text-[13px] leading-relaxed max-w-none break-words bg-ai-surface border border-ai-border text-foreground rounded-md">
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <span className="flex items-center gap-2 text-foreground-muted">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </span>
        )}
      </div>
    </div>
  );
});
```

And wrap historical items in `React.memo(AiAssistantMessageItem)`.  
**Result**: Historical messages are mounted once and NEVER re-rendered while hundreds of tokens stream into `StreamingAiBubble`.

---

### 4.7 `FEAT-OPT-10`: High-Volume Ticket & Audit Table Virtualization

#### A. List View Virtualization in `TicketList.tsx`
Add virtualizer attached to the main scroll container:
```tsx
const scrollContainerRef = useRef<HTMLDivElement>(null);

const listVirtualizer = useVirtualizer({
  count: tickets.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => 92,
  overscan: 5,
  enabled: viewMode === "list",
});

// Inside render when viewMode === "list":
<div className="flex-1 overflow-auto bg-background relative min-w-0" ref={scrollContainerRef}>
  {tickets.length === 0 ? (
    <div className="p-8 text-center text-foreground-muted text-sm">No tickets found.</div>
  ) : (
    <div
      style={{
        height: `${listVirtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {listVirtualizer.getVirtualItems().map((virtualRow) => {
        const ticket = tickets[virtualRow.index];
        return (
          <div
            key={ticket.id}
            ref={listVirtualizer.measureElement}
            data-index={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <TicketListItem
              ticket={ticket}
              isActive={activeTicketId === ticket.id}
              onClick={handleTicketClick}
            />
          </div>
        );
      })}
    </div>
  )}
</div>
```

#### B. Audit Log Table Virtualization in `users/page.tsx`
Use Spacer Rows pattern:
```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

// In UsersPage component:
const tableContainerRef = useRef<HTMLDivElement>(null);

const auditVirtualizer = useVirtualizer({
  count: logs.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 48,
  overscan: 8,
  enabled: activeTab === "audit" && logs.length > 0,
});

const virtualItems = auditVirtualizer.getVirtualItems();
const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
const paddingBottom = virtualItems.length > 0
  ? auditVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
  : 0;

// JSX for Audit Log Tab:
<div className="bg-surface border border-border-subtle rounded-md flex flex-col">
  <div className="p-4 border-b border-border-subtle bg-background-subtle">
    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
      <Activity className="w-4 h-4" /> Immutable Audit Log
    </h3>
  </div>
  {auditLoading ? (
    <div className="p-12 flex justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
    </div>
  ) : (
    <div ref={tableContainerRef} className="max-h-[560px] overflow-auto border-b">
      <Table>
        <TableHeader className="sticky top-0 bg-background-subtle z-10 shadow-sm">
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td colSpan={4} style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const log = logs[virtualRow.index];
            return (
              <TableRow
                key={log.id}
                ref={auditVirtualizer.measureElement}
                data-index={virtualRow.index}
              >
                <TableCell className="text-xs text-foreground-muted whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.executedAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-sm font-medium">{log.actor?.fullName || "System"}</TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                      log.action.includes("Modif") || log.action.includes("Updat")
                        ? "border-warning/30 text-warning bg-warning/10"
                        : "border-info/30 text-info bg-info/10"
                    }`}
                  >
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-foreground-muted">
                  {log.resourceType}: {log.resourceId} {log.newState ? JSON.stringify(log.newState) : ""}
                </TableCell>
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td colSpan={4} style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  )}
</div>
```

---

## 5. Verification Method

### 5.1 Package Installation Verification
Command:
```bash
export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
cd /Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend
npm i @tanstack/react-virtual
```
*Expected*: Installs `@tanstack/react-virtual` cleanly without peer dependency conflicts on React 19.

### 5.2 Build & TypeScript Verification
Command:
```bash
export PATH="/Users/sahil/.nvm/versions/node/v24.21.0/bin:$PATH"
cd /Users/sahil/Documents/Code/ai-customer-support-dashboard/frontend
npm run build
```
*Expected*: Zero TypeScript errors across all 7 modified files (`ChatPanel.tsx`, `ChatComposer.tsx`, `ChatMessageItem.tsx`, `TicketDetails.tsx`, `TicketList.tsx`, `ConversationList.tsx`, `users/page.tsx`).

### 5.3 React DevTools Keystroke Isolation Profiling
1. Launch DevTools > Profiler > enable "Record why each component rendered".
2. Open `/chats`, focus the chat textarea, and type 20 characters:
   - *Verification*: Only `ChatComposer` logs renders; `ChatPanel`, `ChatMessageItem`, and `ReactMarkdown` show 0 renders.
3. Open `/tickets`, select a ticket, type into the comment textarea:
   - *Verification*: Only `TicketCommentComposer` renders; `TicketDetails`, timeline comments, and ticket header show 0 renders.
4. Open `/chats`, select conversation row 2:
   - *Verification*: Only conversation row 1 and row 2 update active state. All other rows skip rendering.

### 5.4 DOM Node Virtualization Count Verification
1. In `/chats` with 100 messages loaded:
   - Open Chrome DevTools Elements tab, inspect `div[data-index]`.
   - *Verification*: Exactly 8–12 message elements exist in the DOM tree, matching the visible viewport + overscan, rather than 100 nodes.
2. In `/users` (Audit Logs tab) with 100+ audit logs:
   - *Verification*: Exactly ~12–16 `<tr>` elements exist between the top and bottom spacer rows.
