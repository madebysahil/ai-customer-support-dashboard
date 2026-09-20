"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { useNotifications, useMarkAllRead, useMarkRead } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const { data: notificationsData, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  
  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-foreground-muted mt-1">Alerts, mentions, and system updates.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 text-xs font-medium bg-surface border border-border-subtle px-3 py-1.5 rounded-md hover:bg-background-subtle transition-colors text-foreground"
          >
            {markAllRead.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-surface border border-border-subtle rounded-md overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 border-b border-border-subtle bg-background-subtle flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Bell className="h-4 w-4 text-foreground-muted" /> Recent Alerts
          </div>
          <span className="text-[11px] font-medium text-foreground-muted bg-background border border-border-subtle px-2 py-0.5 rounded-sm">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </span>
        </div>
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-foreground-muted animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex-1 p-8 flex items-center justify-center">
              <EmptyState 
                icon={Bell} 
                title="No notifications yet" 
                description="When you receive alerts, system updates, or mentions, they will appear here." 
              />
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {notifications.map((notification: any) => (
                <div 
                  key={notification.id} 
                  className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'opacity-70 bg-background/50' : 'bg-surface hover:bg-background-subtle'}`}
                  onClick={() => {
                    if (!notification.isRead) markRead.mutate(notification.id);
                  }}
                >
                  <div className="shrink-0 mt-1">
                    <div className={`h-2 w-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`}></div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-sm ${notification.isRead ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-foreground-muted whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground-muted">{notification.message}</p>
                    <div className="pt-2">
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${
                        notification.priorityTier === 'CRITICAL' ? 'border-critical text-critical' :
                        notification.priorityTier === 'WARNING' ? 'border-warning text-warning' :
                        'border-info text-info'
                      }`}>
                        {notification.priorityTier}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
