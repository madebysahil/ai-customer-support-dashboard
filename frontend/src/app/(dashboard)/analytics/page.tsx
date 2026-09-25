"use client"

import { useState } from "react"
import { useAiMetrics } from "@/hooks/useAnalytics"
import { Loader2, Bot, ShieldAlert, Sparkles } from "lucide-react"
import { MetricCard } from "@/components/ui/metric-card"
import { DynamicTokenUsageChart, DynamicEscalationDistributionChart } from "@/components/charts"

export default function AnalyticsDashboardPage() {
  const [daysRange, setDaysRange] = useState(30);
  const { data: metricsResponse, isLoading } = useAiMetrics(daysRange, 30000); // 30s refresh
  
  const metrics = metricsResponse?.data;
  const isCritical = metrics?.thresholdAlerts?.escalationCritical;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Analytics Overview</h1>
          <p className="text-sm text-foreground-muted">Real-time operational observability across the platform.</p>
        </div>
        <div className="flex bg-background-subtle p-0.5 rounded-md border border-border-subtle shrink-0">
           <button 
             onClick={() => setDaysRange(7)} 
             className={`px-4 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${daysRange === 7 ? 'bg-surface shadow-sm text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
           >
             7D
           </button>
           <button 
             onClick={() => setDaysRange(30)} 
             className={`px-4 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${daysRange === 30 ? 'bg-surface shadow-sm text-foreground' : 'text-foreground-muted hover:text-foreground'}`}
           >
             30D
           </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="AI Conversations"
          value={isLoading ? "-" : (metrics?.totalResponses || 0)}
          icon={Bot}
        />
        
        <MetricCard 
          title="AI Escalation Rate"
          value={isLoading ? "-" : `${(metrics?.escalationRate || 0).toFixed(1)}%`}
          icon={ShieldAlert}
          className={isCritical ? "border-critical ring-1 ring-critical/20" : ""}
          trend={isCritical ? { value: 0, label: "Threshold Exceeded", positive: false } : undefined}
        />

        <MetricCard 
          title="Avg Confidence"
          value={isLoading ? "-" : `${Math.round((metrics?.avgConfidence || 0) * 100)}%`}
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart Placeholders */}
        <div className="bg-surface border border-border-subtle rounded-md flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-subtle bg-background-subtle">
            <h3 className="text-sm font-semibold text-foreground">AI Token Usage (Tokens / Day)</h3>
            <p className="text-xs text-foreground-muted">Volume of tokens consumed via Gemini API</p>
          </div>
          <DynamicTokenUsageChart data={metrics?.timeSeries || []} height={300} />
        </div>

        <div className="bg-surface border border-border-subtle rounded-md flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-subtle bg-background-subtle">
            <h3 className="text-sm font-semibold text-foreground">Escalation Distribution</h3>
            <p className="text-xs text-foreground-muted">Breakdown by Ticket Priority Category</p>
          </div>
          <DynamicEscalationDistributionChart data={metrics?.escalationByPriority || []} height={300} />
        </div>
      </div>
    </div>
  )
}
