"use client";

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

const DynamicMarkdownCore = dynamic(
  () => import('./markdown-core').then((mod) => mod.MarkdownCore),
  {
    ssr: false,
    loading: () => <span className="opacity-0">Loading...</span>,
  }
);

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
  isStreaming = false,
}: MarkdownRendererProps) {
  const [throttledContent, setThrottledContent] = useState(content);
  const lastUpdateRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Streaming Token Throttling Engine:
  // Throttles rapid Markdown AST re-parsing during high-frequency token generation (e.g. 30-60 tokens/sec)
  useEffect(() => {
    if (!isStreaming) {
      // Immediate update when not actively streaming
      setThrottledContent(content);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastUpdateRef.current;

    if (elapsed > 100) {
      lastUpdateRef.current = now;
      setThrottledContent(content);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        lastUpdateRef.current = Date.now();
        setThrottledContent(content);
      }, 100);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, isStreaming]);

  // Fallback while dynamic module loads or during active streaming
  const fallback = (
    <div className={cn("whitespace-pre-wrap break-words leading-relaxed text-foreground", className)}>
      {isStreaming ? content : throttledContent}
      {isStreaming && <span className="inline-block w-1.5 h-3.5 bg-primary/70 animate-pulse ml-0.5 align-middle" />}
    </div>
  );

  return (
    <React.Suspense fallback={fallback}>
      <DynamicMarkdownCore content={throttledContent} className={className} />
    </React.Suspense>
  );
});
