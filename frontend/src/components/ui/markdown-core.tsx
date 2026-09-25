"use client";

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export interface MarkdownCoreProps {
  content: string;
  className?: string;
}

export const MarkdownCore = memo(function MarkdownCore({ content, className }: MarkdownCoreProps) {
  return (
    <div className={cn("markdown-content break-words leading-relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className: codeClass, children, ...props }: any) {
            const isInline = !props['data-meta'] && !String(children).includes('\n');
            if (isInline) {
              return (
                <code
                  className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground font-medium", codeClass)}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("font-mono text-xs block", codeClass)} {...props}>
                {children}
              </code>
            );
          },
          pre({ children, ...props }: any) {
            return (
              <pre
                className="my-2 rounded-md bg-muted/80 p-3 overflow-x-auto border border-border-subtle font-mono text-xs text-foreground"
                {...props}
              >
                {children}
              </pre>
            );
          },
          table({ children, ...props }: any) {
            return (
              <div className="my-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-border border border-border-subtle text-xs" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }: any) {
            return (
              <th className="bg-background-subtle px-3 py-2 text-left font-semibold text-foreground border-b border-border-subtle" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }: any) {
            return (
              <td className="px-3 py-1.5 border-b border-border-subtle text-foreground-muted" {...props}>
                {children}
              </td>
            );
          },
          a({ children, href, ...props }: any) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                {...props}
              >
                {children}
              </a>
            );
          },
          ul({ children, ...props }: any) {
            return (
              <ul className="list-disc pl-4 my-1.5 space-y-0.5" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }: any) {
            return (
              <ol className="list-decimal pl-4 my-1.5 space-y-0.5" {...props}>
                {children}
              </ol>
            );
          },
          p({ children, ...props }: any) {
            return (
              <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
                {children}
              </p>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
