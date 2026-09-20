import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SuggestedRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  isLoading?: boolean;
}

export function SuggestedReplies({ replies, onSelect, isLoading }: SuggestedRepliesProps) {
  if (isLoading) {
    return (
      <div className="flex gap-2 pb-3 overflow-x-auto">
        <div className="h-7 w-24 bg-border-subtle animate-pulse rounded-md" />
        <div className="h-7 w-32 bg-border-subtle animate-pulse rounded-md" />
      </div>
    );
  }

  if (!replies.length) return null;

  return (
    <div className="flex gap-2 pb-3 overflow-x-auto items-center no-scrollbar">
      <Sparkles className="h-4 w-4 text-primary shrink-0 ml-1" />
      {replies.map((reply, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="rounded-md text-xs h-7 shrink-0 bg-ai-surface border-ai-border hover:bg-surface text-foreground"
          onClick={() => onSelect(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
