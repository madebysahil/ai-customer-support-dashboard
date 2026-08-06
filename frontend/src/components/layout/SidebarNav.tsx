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
  Bell
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Chats", href: "/chats", icon: MessageSquare },
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Customers", href: "/customers", icon: Users },
    { title: "Analytics", href: "/analytics", icon: BarChart3 },
    { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
    { title: "Notifications", href: "/notifications", icon: Bell },
    { title: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <nav className={cn("flex flex-col space-y-1 p-4", className)} {...props}>
      <div className="mb-8 px-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary">AI Support</h2>
      </div>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent text-muted-foreground"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}
