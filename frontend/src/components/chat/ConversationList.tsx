"use client"

import { useState, useMemo } from "react"
import { useChats } from "@/hooks/useChats"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search, Clock, Bot, User, CheckCircle2, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

type FilterTab = 'all' | 'unread' | 'assigned' | 'waiting' | 'ai';

export function ConversationList({ activeChatId, onSelect }: { activeChatId: string | null, onSelect: (id: string) => void }) {
  const { data, isLoading } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredChats = useMemo(() => {
    if (!data?.data) return [];
    let chats = data.data as any[];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      chats = chats.filter(c => 
        c.customer.displayName?.toLowerCase().includes(q) || 
        c.customer.email?.toLowerCase().includes(q) ||
        c.messages?.[0]?.content?.toLowerCase().includes(q)
      );
    }

    // 2. Tab filter
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Tabs */}
      <div className="p-3 border-b space-y-3 shrink-0 bg-background/95 backdrop-blur z-10 sticky top-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'unread', 'assigned', 'waiting', 'ai'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredChats.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-muted-foreground"
          >
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No conversations found.</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredChats.map((chat: any, idx: number) => {
              const lastMessage = chat.messages?.[chat.messages.length - 1] || chat.messages?.[0];
              const isUnread = lastMessage && !lastMessage.isRead && lastMessage.authorType !== 'SUPPORT_AGENT';
              // Calculate online status based on recent activity (within last 15 mins)
              const isRecentlyActive = new Date(chat.updatedAt).getTime() > Date.now() - 15 * 60 * 1000;
              
              return (
                <motion.div 
                  key={chat.id} 
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  onClick={() => onSelect(chat.id)}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b last:border-0 relative ${
                    activeChatId === chat.id 
                      ? 'bg-primary/5 border-l-2 border-l-primary' 
                      : 'hover:bg-muted/40 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-muted">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {chat.customer.displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isRecentlyActive && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-semibold text-sm truncate ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>
                        {chat.customer.displayName}
                      </span>
                      <span className={`text-xs whitespace-nowrap ml-2 ${isUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {lastMessage?.content || "No messages yet"}
                      </span>
                      {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                  
                  {/* Status Badges */}
                  <div className="flex items-center gap-1 mt-2">
                    {chat.assignedToId && (
                      <Badge variant="secondary" className="text-[9px] px-1 h-4 flex items-center gap-1">
                        <User className="h-2.5 w-2.5" /> Assigned
                      </Badge>
                    )}
                    {chat.status === 'PENDING_INTERNAL' && (
                      <Badge variant="outline" className="text-[9px] px-1 h-4 border-amber-500/30 text-amber-600 flex items-center gap-1 bg-amber-50">
                        <Clock className="h-2.5 w-2.5" /> Waiting
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
