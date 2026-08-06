"use client"

import { useState } from "react"
import { useAiMetrics } from "@/hooks/useAnalytics"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, TrendingUp, TrendingDown, Bot, ShieldAlert, Sparkles, Activity } from "lucide-react"

export default function AnalyticsDashboardPage() {
  const [daysRange, setDaysRange] = useState(30);
  const { data: metricsResponse, isLoading } = useAiMetrics(daysRange, 30000); // 30s refresh
  
  const metrics = metricsResponse?.data;
  const isCritical = metrics?.thresholdAlerts?.escalationCritical;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time operational observability across the platform.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-md">
           <button onClick={() => setDaysRange(7)} className={`px-4 py-1.5 text-sm font-medium rounded-sm ${daysRange === 7 ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>7D</button>
           <button onClick={() => setDaysRange(30)} className={`px-4 py-1.5 text-sm font-medium rounded-sm ${daysRange === 30 ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>30D</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Conversations</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-2xl font-bold">{metrics?.totalResponses || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" /> +12% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Escalation Rate</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${isCritical ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className={`text-2xl font-bold ${isCritical ? 'text-destructive' : ''}`}>
                  {(metrics?.escalationRate || 0).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {isCritical ? (
                    <span className="text-destructive font-medium">Threshold Exceeded</span>
                  ) : (
                    <><TrendingDown className="h-3 w-3 mr-1 text-emerald-500" /> -2% from last period</>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-2xl font-bold">{Math.round((metrics?.avgConfidence || 0) * 100)}%</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" /> Stable
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart Placeholders */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>AI Token Usage (Tokens / Day)</CardTitle>
            <CardDescription>Volume of tokens consumed via Gemini API</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed bg-muted/10 m-6 rounded-md">
             <span className="text-sm text-muted-foreground">Recharts Time-Series (Implementation Pending)</span>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Escalation Distribution</CardTitle>
            <CardDescription>Breakdown by Ticket Priority Category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed bg-muted/10 m-6 rounded-md">
             <span className="text-sm text-muted-foreground">Recharts PieChart (Implementation Pending)</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
