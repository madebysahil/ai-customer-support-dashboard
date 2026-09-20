import * as React from "react"
import { Badge } from "@/components/ui/badge"

export type StatusType = "open" | "in_progress" | "pending" | "resolved" | "closed" | "urgent" | "ai"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline" }> = {
  // Common states
  open: { label: "Open", variant: "success" },
  new: { label: "New", variant: "success" },
  active: { label: "Active", variant: "success" },
  in_progress: { label: "In Progress", variant: "info" },
  pending: { label: "Pending", variant: "warning" },
  resolved: { label: "Resolved", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
  archived: { label: "Archived", variant: "outline" },
  urgent: { label: "Urgent", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  critical: { label: "Critical", variant: "destructive" },
  ai: { label: "AI Generated", variant: "secondary" },
  online: { label: "Online", variant: "success" },
  offline: { label: "Offline", variant: "secondary" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(" ", "_")
  const mapped = statusMap[normalizedStatus] || { label: status, variant: "outline" }

  return (
    <Badge variant={mapped.variant} className={className}>
      {mapped.label}
    </Badge>
  )
}
