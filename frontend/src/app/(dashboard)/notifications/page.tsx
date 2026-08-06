"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "SLA Breach Warning", desc: "Ticket TCK-1921 is about to breach SLA in 30 mins.", type: "destructive", time: "10 mins ago" },
              { title: "New AI Model Deployed", desc: "v2.4 of the resolution model is now active.", type: "default", time: "1 hour ago" },
              { title: "High Volume Alert", desc: "Chat volume is 40% higher than average.", type: "secondary", time: "3 hours ago" },
            ].map((notif, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{notif.title}</span>
                    <Badge variant={notif.type as any}>{notif.type === 'destructive' ? 'Critical' : 'Info'}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{notif.desc}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
