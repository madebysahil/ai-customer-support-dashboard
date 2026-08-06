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
import { EmptyState } from "@/components/ui/empty-state"
import {
  ArrowUpRight,
  MessageSquare,
  Ticket,
  Users,
  Zap,
  Sparkles,
  ShieldCheck,
  Banknote,
  BarChart2,
  PieChart,
  Activity,
  Clock,
  TrendingUp,
  BrainCircuit,
  HelpCircle,
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
  const resolutionRate = totalResponses > 0 ? (100 - escalationRate).toFixed(1) : 0
  const avgConfidence = aiMetrics?.data?.avgConfidence || 0
  
  const openTicketsCount = ticketsData?.meta?.total || 0
  const liveConvosCount = liveChatsData?.meta?.total || (liveChatsData?.data?.length || 0)

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening in your AI operations center today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex">
            Generate Report
          </Button>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" /> Optimize AI
          </Button>
        </div>
      </div>

      {/* KPI Cards: Ops & AI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Open Tickets" 
          value={openTicketsCount} 
          icon={Ticket} 
          loading={ticketsLoading} 
          trend="Total awaiting resolution"
          trendUp={false}
        />
        <KpiCard 
          title="Live Conversations" 
          value={liveConvosCount} 
          icon={MessageSquare} 
          loading={chatsLoading} 
          trend="Active chat sessions"
          trendUp={true}
        />
        <EmptyKpiCard title="Avg Response Time" icon={Clock} />
        <EmptyKpiCard title="Customer Satisfaction" icon={Users} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="AI Resolution Rate" 
          value={`${resolutionRate}%`} 
          icon={Zap} 
          loading={aiLoading} 
          trend="Tickets resolved by AI"
          trendUp={true}
          valueColor="text-success"
        />
        <KpiCard 
          title="Escalation Rate" 
          value={`${escalationRate.toFixed(1)}%`} 
          icon={Activity} 
          loading={aiLoading} 
          trend="Handed off to agents"
          trendUp={false}
        />
        <KpiCard 
          title="Today's AI Usage" 
          value={totalResponses} 
          icon={BrainCircuit} 
          loading={aiLoading} 
          trend="Total responses handled"
          trendUp={true}
        />
        <EmptyKpiCard title="Knowledge Coverage" icon={HelpCircle} />
      </div>

      {/* Centerpiece: AI Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold tracking-tight mt-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Performance Deep Dive
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 shadow-sm border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="flex items-end gap-3 mt-2">
                  <div className="text-4xl font-bold">{(avgConfidence * 100).toFixed(1)}%</div>
                  <Badge variant="outline" className="text-success border-success/30 bg-success/10 mb-1.5 px-2">Optimal</Badge>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-1 shadow-sm">
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Model Health</CardTitle>
            </CardHeader>
            <CardContent>
               <EmptyState 
                icon={ShieldCheck} 
                title="Model Health Checks" 
                description="Endpoint requires implementation." 
                className="min-h-[100px] p-4 border-0 bg-transparent"
                badgeText="Coming Soon"
               />
            </CardContent>
          </Card>
           <Card className="col-span-1 shadow-sm">
             <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Cost Today</CardTitle>
            </CardHeader>
            <CardContent>
               <EmptyState 
                icon={Banknote} 
                title="Cost Tracking" 
                description="Awaiting billing API." 
                className="min-h-[100px] p-4 border-0 bg-transparent"
                badgeText="Awaiting Data"
               />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-xl font-bold tracking-tight">Analytics & Trends</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Conversation Trend</CardTitle>
              <CardDescription>Volume of human vs AI conversations over the past 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <EmptyState 
                icon={TrendingUp} 
                title="Trend Data Unavailable" 
                description="The analytics engine is currently being upgraded to support time-series metrics." 
                actionLabel="Connect Analytics API"
                className="h-full border-none bg-muted/10"
              />
            </CardContent>
          </Card>
          
          <Card className="col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle>Resolution Trend</CardTitle>
              <CardDescription>First contact resolution rates over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <EmptyState 
                icon={BarChart2} 
                title="Resolution Metrics" 
                description="Time-series resolution API endpoint is not yet configured." 
                className="h-full border-none bg-muted/10"
              />
            </CardContent>
          </Card>

          <Card className="col-span-1 shadow-sm">
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Customer sentiment across all live channels.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <EmptyState 
                icon={PieChart} 
                title="Sentiment Analysis" 
                description="Connect the sentiment analysis module to unlock donut charts." 
                className="h-full border-none bg-muted/10"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Priority Queue</CardTitle>
            <CardDescription>High and urgent tickets requiring immediate attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {(!highPriorityTickets?.data || highPriorityTickets.data.length === 0) ? (
              <EmptyState 
                icon={Ticket} 
                title="Inbox Zero" 
                description="There are no high priority tickets in the queue right now." 
                badgeText="All Clear"
                className="min-h-[200px] bg-muted/5"
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
                      <TableCell className="max-w-[200px] truncate">{t.subject}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>Active and recently closed live chats.</CardDescription>
          </CardHeader>
          <CardContent>
             {(!liveChatsData?.data || liveChatsData.data.length === 0) ? (
              <EmptyState 
                icon={MessageSquare} 
                title="No Active Chats" 
                description="There are no recent conversations to display." 
                badgeText="Quiet"
                className="min-h-[200px] bg-muted/5"
              />
            ) : (
              <div className="space-y-4">
                {liveChatsData.data.slice(0, 4).map((chat: any) => (
                  <div key={chat.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{chat.customer?.displayName || 'Unknown Customer'}</span>
                      <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                         <span className="inline-block w-2 h-2 rounded-full bg-success mr-2"></span>
                         {chat.status}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">Open</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, loading, trend, trendUp, valueColor = "" }: any) {
  return (
    <Card className="transition-all duration-200 hover:shadow-soft group border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mb-1" />
        ) : (
          <div className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-2 flex items-center">
          {trendUp ? (
            <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
          ) : null}
          <span className={trendUp ? "text-emerald-500" : ""}>{trend}</span>
        </p>
      </CardContent>
    </Card>
  )
}

function EmptyKpiCard({ title, icon: Icon }: any) {
  return (
    <Card className="border-dashed border-border/60 bg-muted/5 opacity-80 transition-opacity hover:opacity-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {title} <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-tight">Soon</Badge>
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground/50" />
      </CardHeader>
      <CardContent>
        <div className="text-lg font-medium text-muted-foreground/50 italic mt-1 mb-2">Unavailable</div>
        <p className="text-[11px] text-muted-foreground">Awaiting API integration</p>
      </CardContent>
    </Card>
  )
}
