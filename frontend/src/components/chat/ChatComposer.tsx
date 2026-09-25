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
