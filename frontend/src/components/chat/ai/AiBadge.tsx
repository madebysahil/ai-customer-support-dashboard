import { Sparkles } from 'lucide-react';

export function AiBadge({ confidenceScore }: { confidenceScore?: number }) {
  return (
    <div className="inline-flex items-center gap-1 bg-ai-surface text-foreground-muted border border-ai-border px-2 py-0.5 rounded-sm text-[10px] font-medium mt-1">
      <Sparkles className="h-3 w-3 text-primary" />
      <span>AI Assistant</span>
      {confidenceScore && (
        <span className="opacity-70 ml-1 border-l border-ai-border pl-1">
          {Math.round(confidenceScore * 100)}% Match
        </span>
      )}
    </div>
  );
}
