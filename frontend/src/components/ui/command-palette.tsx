"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutDashboard, MessageSquare, Ticket, Users, BarChart3, BookOpen, Settings } from "lucide-react"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function CommandPalette({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const items = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Inbox", href: "/chats", icon: MessageSquare },
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Analytics", href: "/analytics", icon: BarChart3 },
    { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
    { title: "Settings", href: "/settings", icon: Settings },
  ]

  const filtered = items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearch("")
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="w-full sm:max-w-xl mx-auto mt-20 p-0 rounded-lg shadow-lg border">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-foreground-muted mr-2" />
          <Input 
            ref={inputRef}
            className="h-14 border-0 focus-visible:ring-0 bg-transparent px-0 text-base" 
            placeholder="Type a command or search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="p-4 text-center text-sm text-foreground-muted">No results found.</p>
          )}
          {filtered.map((item) => (
            <button
              key={item.href}
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm hover:bg-muted text-left transition-colors"
              onClick={() => {
                router.push(item.href)
                onOpenChange(false)
              }}
            >
              <item.icon className="h-5 w-5 text-foreground-muted" />
              {item.title}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
