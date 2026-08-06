"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpRight, MessageSquare, Ticket, Users, Zap } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 inline-flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> +19%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Resolution Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.4%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 inline-flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> +4.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-rose-500 inline-flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> +12</span> requiring attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,520</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 inline-flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> +201</span> new this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart Placeholder */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Conversation Volume</CardTitle>
            <CardDescription>AI vs Human handled interactions over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t mt-4 pt-4">
            <div className="w-full flex items-end justify-between h-full gap-2 px-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-sm flex flex-col justify-end" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}>
                  <div className="w-full bg-primary rounded-t-sm" style={{ height: `${Math.max(10, Math.random() * 60)}%` }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Escalations</CardTitle>
            <CardDescription>Conversations requiring human intervention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Acme Corp", issue: "Billing dispute", time: "2 min ago", sentiment: "Negative" },
                { name: "TechNova", issue: "API integration failure", time: "15 min ago", sentiment: "Neutral" },
                { name: "Globex", issue: "Account locked", time: "1 hour ago", sentiment: "Negative" },
                { name: "Initech", issue: "Feature request", time: "3 hours ago", sentiment: "Positive" },
              ].map((escalation, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{escalation.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{escalation.issue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={escalation.sentiment === "Negative" ? "destructive" : "secondary"}>
                      {escalation.sentiment}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-16 text-right">{escalation.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Tickets</CardTitle>
          <CardDescription>Highest priority pending resolutions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "TCK-1923", customer: "Stark Industries", subject: "Enterprise SSO Config", status: "Open" },
                { id: "TCK-1922", customer: "Wayne Ent.", subject: "Database Latency", status: "Pending Internal" },
                { id: "TCK-1921", customer: "Oscorp", subject: "User Access Revoked", status: "Open" },
              ].map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.id}</TableCell>
                  <TableCell>{t.customer}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
