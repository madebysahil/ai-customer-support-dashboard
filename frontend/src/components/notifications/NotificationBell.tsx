"use client"

import { useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUnreadCount, useNotifications, useMarkRead } from "@/hooks/useNotifications"
import { useSocket } from "@/hooks/useSocket"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

export function NotificationBell() {
  const { data: countData } = useUnreadCount();
  const { data: inboxData } = useNotifications();
  const markRead = useMarkRead();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    socket.on("notification:received", (payload) => {
      // Optimistically update counts
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    return () => {
      socket.off("notification:received");
    }
  }, [socket, queryClient]);

  const count = countData?.data?.count || 0;
  const notifications = inboxData?.data || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {count > 0 && <span className="text-xs text-muted-foreground">{count} unread</span>}
        </div>
        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
          ) : (
            notifications.map((n: any) => (
              <Link
                key={n.id}
                href={n.linkUrl || '#'}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium ${n.priorityTier === 'CRITICAL' ? 'text-red-500' : ''}`}>{n.title}</span>
                    {!n.isRead && <span className="h-2 w-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleTimeString()}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
