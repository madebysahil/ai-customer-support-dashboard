"use client"

import { useChats } from "@/hooks/useChats"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export function ConversationList({ activeChatId, onSelect }: { activeChatId: string | null, onSelect: (id: string) => void }) {
  const { data, isLoading } = useChats();

  if (isLoading) {
    return <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {data?.data?.map((chat: any) => (
        <div 
          key={chat.id} 
          onClick={() => onSelect(chat.id)}
          className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b last:border-0 ${activeChatId === chat.id ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{chat.customer.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-semibold text-sm truncate">{chat.customer.displayName}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <span className="text-sm text-muted-foreground truncate">
              {chat.messages?.[0]?.content || "No messages yet"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
