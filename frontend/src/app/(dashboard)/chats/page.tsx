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
    <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Live Chats</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
        {/* Left Pane: Chat List */}
        <Card className="col-span-1 lg:col-span-3 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
            <ConversationList activeChatId={activeChatId} onSelect={setActiveChatId} />
          </div>
        </Card>
        
        {/* Center Pane: Active Chat */}
        <Card className="col-span-1 lg:col-span-6 overflow-hidden shadow-md">
          {activeChatId ? (
            <ChatPanel chatId={activeChatId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-50" />
              </div>
              <p className="font-medium text-lg">Select a conversation to start messaging</p>
            </div>
          )}
        </Card>

        {/* Right Pane: Customer Context */}
        <Card className="col-span-1 lg:col-span-3 flex flex-col overflow-hidden hidden lg:flex">
          <ChatContextPanel chatId={activeChatId} />
        </Card>
      </div>
    </div>
  )
}
