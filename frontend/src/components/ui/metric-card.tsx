import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
}

export function MetricCard({ title, value, icon: Icon, trend, className, ...props }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-foreground-muted">{title}</p>
          {Icon && <Icon className="h-4 w-4 text-foreground-subtle" />}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
          {trend && (
            <p className="text-xs text-foreground-muted">
              <span
                className={cn(
                  "font-medium tabular-nums",
                  trend.positive === true ? "text-success" : 
                  trend.positive === false ? "text-critical" : "text-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
