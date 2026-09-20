"use client"

import { useState, useMemo } from "react"
import { useChats } from "@/hooks/useChats"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search, Clock, Bot, User, CheckCircle2, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type FilterTab = 'all' | 'unread' | 'assigned' | 'waiting' | 'ai';

export function ConversationList({ activeChatId, onSelect }: { activeChatId: string | null, onSelect: (id: string) => void }) {
  const { data, isLoading } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredChats = useMemo(() => {
    if (!data?.data) return [];
    let chats = data.data as any[];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      chats = chats.filter(c => 
        c.customer.displayName?.toLowerCase().includes(q) || 
        c.customer.email?.toLowerCase().includes(q) ||
        c.messages?.[0]?.content?.toLowerCase().includes(q)
      );
    }

    switch (activeTab) {
      case 'unread':
        chats = chats.filter(c => {
          const lastMsg = c.messages?.[c.messages.length - 1] || c.messages?.[0];
          return lastMsg && !lastMsg.isRead && lastMsg.authorType !== 'SUPPORT_AGENT';
        });
        break;
      case 'assigned':
        chats = chats.filter(c => c.assignedToId || c.assignedAgentId);
        break;
      case 'waiting':
        chats = chats.filter(c => c.status === 'PENDING_INTERNAL');
        break;
      case 'ai':
        chats = chats.filter(c => c.messages?.some((m: any) => m.authorType === 'AI_ASSISTANT'));
        break;
    }

    return chats;
  }, [data, searchQuery, activeTab]);

  if (isLoading) {
    return <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="p-3 border-b border-border-subtle space-y-3 shrink-0 bg-background z-10 sticky top-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9 bg-surface border-border-subtle focus-visible:ring-primary text-sm h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'unread', 'assigned', 'waiting', 'ai'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-transparent hover:bg-surface text-foreground-muted'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-foreground-muted">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No conversations found.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredChats.map((chat: any) => {
              const lastMessage = chat.messages?.[chat.messages.length - 1] || chat.messages?.[0];
              const isUnread = lastMessage && !lastMessage.isRead && lastMessage.authorType !== 'SUPPORT_AGENT';
              const isRecentlyActive = new Date(chat.updatedAt).getTime() > Date.now() - 15 * 60 * 1000;
              const isActive = activeChatId === chat.id;
              
              return (
                <button 
                  key={chat.id} 
                  onClick={() => onSelect(chat.id)}
                  className={`flex items-start gap-3 p-3 text-left cursor-pointer transition-colors border-b border-border-subtle last:border-0 relative ${
                    isActive 
                      ? 'bg-primary/5 border-l-2 border-l-primary' 
                      : 'hover:bg-surface border-l-2 border-l-transparent'
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
                      <span className={`font-semibold text-sm truncate ${isUnread ? 'text-foreground' : 'text-foreground'}`}>
                        {chat.customer.displayName}
                      </span>
                      <span className={`text-[10px] whitespace-nowrap ml-2 ${isUnread ? 'text-primary font-medium' : 'text-foreground-muted'}`}>
                        {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${isUnread ? 'text-foreground font-medium' : 'text-foreground-muted'}`}>
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
                    {chat.status === 'PENDING_INTERNAL' && (
                      <Badge variant="warning" className="text-[9px] px-1 h-4 flex items-center gap-1 rounded-sm">
                        <Clock className="h-2.5 w-2.5" /> Waiting
                      </Badge>
                    )}
                  </div>
                </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
