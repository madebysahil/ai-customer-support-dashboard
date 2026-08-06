import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  badgeText?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  badgeText = "Awaiting Data Source",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/5 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4 shadow-sm">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <Badge variant="secondary" className="mb-3 text-xs font-normal">
        {badgeText}
      </Badge>
      <h3 className="mb-1 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
