"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { MessageSquare } from "lucide-react"
import { ChatContextPanel } from "@/components/chat/ChatContextPanel"

export default function ChatsPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full bg-background rounded-tl-lg overflow-hidden border-t border-l">
      <div className="flex h-full w-full overflow-hidden bg-surface">
        {/* Left Pane: Chat List */}
        <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-4/12 lg:w-3/12 border-r border-border flex-col h-full bg-background overflow-hidden`}>
          <ConversationList activeChatId={activeChatId} onSelect={setActiveChatId} />
        </div>
        
        {/* Center Pane: Active Chat */}
        <div className={`${!activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-8/12 lg:w-6/12 flex-col h-full bg-background overflow-hidden relative`}>
          {activeChatId ? (
            <ChatPanel chatId={activeChatId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-foreground-muted gap-4 bg-background">
              <MessageSquare className="h-6 w-6 text-foreground-subtle" />
              <p className="text-sm font-medium">Select a conversation</p>
            </div>
          )}
        </div>

        {/* Right Pane: Customer Context */}
        <div className="hidden lg:flex lg:w-3/12 border-l border-border flex-col h-full bg-surface overflow-hidden">
          <ChatContextPanel chatId={activeChatId} />
        </div>
      </div>
    </div>
  )
}
