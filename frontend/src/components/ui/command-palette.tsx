"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, LayoutDashboard, MessageSquare, Ticket, Users, BarChart3, BookOpen, Settings } from "lucide-react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[20%] z-50 w-full max-w-xl translate-x-[-50%] border bg-surface p-0 shadow-modal duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl overflow-hidden">
          <div className="flex items-center border-b border-border-subtle px-4 bg-background-subtle">
            <Search className="h-5 w-5 text-foreground-muted mr-2" />
            <Input 
              ref={inputRef}
              className="h-14 border-0 focus-visible:ring-0 bg-transparent px-0 text-base shadow-none" 
              placeholder="Type a command or search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[350px] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="p-8 text-center text-sm text-foreground-muted">No results found.</p>
            )}
            {filtered.map((item) => (
              <button
                key={item.href}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-background-subtle text-left transition-colors font-medium text-foreground"
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
