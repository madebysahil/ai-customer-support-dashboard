"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Ticket,
  BarChart3,
  BookOpen,
  Settings,
  Bell,
  Sparkles
} from "lucide-react"

import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const workspaceItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Inbox", href: "/notifications", icon: Bell },
    { title: "Live Chat", href: "/chats", icon: MessageSquare },
    { title: "AI Assistant", href: "/ai", icon: Sparkles },
    { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  ]
  
  const operationItems = [
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  const settingsItems = [
    { title: "Settings", href: "/settings", icon: Settings },
  ]

  const NavGroup = ({ title, items }: { title?: string, items: any[] }) => (
    <div className="mb-6">
      {title && <h4 className="mb-3 px-6 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h4>}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2.5 mx-3 text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-primary/10 text-primary shadow-inner-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary animate-fade-in" />
                )}
                <item.icon className={cn("mr-3 h-5 w-5 transition-transform duration-200", isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:scale-110")} />
                <span>{item.title}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <nav className={cn("flex flex-col h-full", className)} {...props}>
      <div className="mb-8 mt-2 px-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-soft">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">SupportPilot</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <NavGroup title="Workspace" items={workspaceItems} />
        <NavGroup title="Operations" items={operationItems} />
        <NavGroup title="Configuration" items={settingsItems} />
      </div>
    </nav>
  )
}
