"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  MessageSquare,
  Ticket,
  Zap,
  Activity,
  TrendingUp,
  BrainCircuit,
  Clock,
  ChevronRight
} from "lucide-react"

import { useAiMetrics } from "@/hooks/useAnalytics"
import { useTickets, Ticket as TicketType } from "@/hooks/useTickets"
import { useChats } from "@/hooks/useChats"

export default function DashboardPage() {
  const { data: aiMetrics, isLoading: aiLoading } = useAiMetrics()
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets({ status: 'OPEN' })
  const { data: highPriorityTickets } = useTickets({ priority: 'HIGH' })
  const { data: liveChatsData, isLoading: chatsLoading } = useChats()
  
  // Data Mapping
  const totalResponses = aiMetrics?.data?.totalResponses || 0
  const escalationRate = aiMetrics?.data?.escalationRate || 0
  const resolutionRate = totalResponses > 0 ? (100 - escalationRate).toFixed(1) : "0"
  
  const openTicketsCount = ticketsData?.meta?.total || 0
  const liveConvosCount = liveChatsData?.meta?.total || (liveChatsData?.data?.length || 0)

  return (
    <div className="flex flex-col gap-8 pb-20 md:pb-6 p-4 md:p-6 w-full max-w-[1200px] mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-foreground-muted mt-1">Real-time pulse of your operations and AI assistant performance.</p>
        </div>
      </div>

      {/* Primary Metrics (System Pulse) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard 
          title="Open Tickets" 
          value={ticketsLoading ? "..." : openTicketsCount} 
          icon={Ticket} 
        />
        <MetricCard 
          title="Live Chats" 
          value={chatsLoading ? "..." : liveConvosCount} 
          icon={MessageSquare}
        />
        <MetricCard 
          title="AI Resolution" 
          value={aiLoading ? "..." : `${resolutionRate}%`} 
          icon={Zap}
        />
      </div>

      {/* Two Column Layout for Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Priority Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Priority Queue</CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary -mr-3">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(!highPriorityTickets?.data || highPriorityTickets.data.length === 0) ? (
              <EmptyState 
                icon={Ticket} 
                title="Inbox Zero" 
                description="No high priority tickets in the queue right now." 
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {highPriorityTickets.data.slice(0, 5).map((t: TicketType) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium text-xs">{t.ticketNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{t.subject}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="h-8">Open</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Right Column: AI Analytics & Recent Activity */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Operations</CardTitle>
              <CardDescription>Automation metrics for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-raised border border-border">
                      <BrainCircuit className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Responses</p>
                      <p className="text-xs text-foreground-muted">Messages generated by AI</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{aiLoading ? "..." : totalResponses}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-raised border border-border">
                      <Activity className="h-5 w-5 text-foreground-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Escalation Rate</p>
                      <p className="text-xs text-foreground-muted">Handed off to humans</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{aiLoading ? "..." : `${escalationRate.toFixed(1)}%`}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Active Chats</CardTitle>
              <StatusBadge status="live" className="bg-success/10 text-success border-success/20" />
            </CardHeader>
            <CardContent>
              {(!liveChatsData?.data || liveChatsData.data.length === 0) ? (
                <EmptyState 
                  icon={MessageSquare} 
                  title="No Active Chats" 
                  description="All quiet on the support front." 
                  className="min-h-[150px]"
                />
              ) : (
                <div className="space-y-4 mt-2">
                  {liveChatsData.data.slice(0, 3).map((chat: any) => (
                    <div key={chat.id} className="flex items-center justify-between border-b border-border-subtle pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{chat.customer?.displayName || 'Unknown Customer'}</span>
                        <span className="text-xs text-foreground-subtle flex items-center mt-0.5">
                          {chat.status}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-primary">Resume</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Analytics Coming Soon */}
      <div className="mt-2">
        <Card className="bg-surface-raised border-border-subtle shadow-none">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <TrendingUp className="h-8 w-8 text-foreground-subtle mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">Advanced Reporting</h3>
            <p className="text-sm text-foreground-muted max-w-sm mb-4">Time-series metrics and sentiment analysis are currently being provisioned.</p>
            <Button variant="outline" size="sm" disabled>Awaiting Connection</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
