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
      <div className="flex gap-2 p-2 overflow-x-auto">
        <div className="h-8 w-24 bg-muted animate-pulse rounded-full" />
        <div className="h-8 w-32 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  if (!replies.length) return null;

  return (
    <div className="flex gap-2 p-2 overflow-x-auto items-center">
      <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 ml-1" />
      {replies.map((reply, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="rounded-full text-xs shrink-0 bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-700"
          onClick={() => onSelect(reply)}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
