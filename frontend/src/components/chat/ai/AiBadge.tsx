import { Sparkles } from 'lucide-react';

export function AiBadge({ confidenceScore }: { confidenceScore?: number }) {
  return (
    <div className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1">
      <Sparkles className="h-3 w-3" />
      <span>AI Assistant</span>
      {confidenceScore && (
        <span className="opacity-70 ml-1 border-l border-indigo-500/20 pl-1">
          {Math.round(confidenceScore * 100)}% Match
        </span>
      )}
    </div>
  );
}
