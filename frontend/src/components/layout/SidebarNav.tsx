"use client"

import * as React from "react"
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Monitor
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored) {
      setIsCollapsed(stored === "true")
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const topItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ]

  const conversationsItems = [
    { title: "Inbox", href: "/chats", icon: MessageSquare, badge: 2 },
    { title: "AI Assistant", href: "/ai", icon: Sparkles },
  ]
  
  const supportItems = [
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  ]

  const insightsItems = [
    { title: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  const bottomItems = [
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Settings", href: "/settings", icon: Settings },
  ]

  const NavGroup = ({ title, items }: { title?: string, items: any[] }) => (
    <div className="mb-4">
      {title && !isCollapsed && (
        <h4 className="mb-2 px-6 text-[11px] font-semibold tracking-wider text-foreground-muted uppercase">
          {title}
        </h4>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block group">
              <span
                className={cn(
                  "relative flex items-center rounded-md px-3 py-2 mx-3 text-sm font-medium transition-colors duration-150 ease-out",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-muted hover:bg-background hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", !isCollapsed && "mr-3", isActive ? "text-primary" : "text-foreground-muted")} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary tabular-nums">
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )

  // Prevent layout shift by rendering a placeholder matching default state before hydration
  if (!mounted) {
    return (
      <nav className={cn("flex flex-col h-full border-r bg-surface w-[240px]", className)} {...props}>
        <div className="mb-6 mt-4 px-6 flex items-center gap-3 h-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
            <span className="font-bold">S</span>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={cn("flex flex-col h-full border-r bg-surface transition-all duration-300", isCollapsed ? "w-[80px]" : "w-[240px]", className)} {...props}>
      <div className="mb-6 mt-4 px-5 flex items-center justify-between h-8">
        <div className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && "justify-center w-full")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background shadow-sm">
            <span className="font-bold text-lg">S</span>
          </div>
          {!isCollapsed && <h2 className="text-base font-semibold tracking-tight text-foreground truncate">SupportPilot</h2>}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <NavGroup items={topItems} />
        <NavGroup title="Conversations" items={conversationsItems} />
        <NavGroup title="Support" items={supportItems} />
        <NavGroup title="Insights" items={insightsItems} />
      </div>

      <div className="mt-auto pt-4 pb-4">
        <NavGroup items={bottomItems} />
        <div className={cn("px-4 mt-2 flex", isCollapsed ? "justify-center" : "justify-end")}>
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8 text-foreground-muted">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}
