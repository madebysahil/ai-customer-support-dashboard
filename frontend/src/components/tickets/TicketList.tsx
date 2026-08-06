"use client"

import { useState } from "react"
import { useTickets, Ticket, useUpdateTicket } from "@/hooks/useTickets"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, LayoutList, LayoutGrid, AlertCircle, Clock, CheckCircle2, ChevronRight, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

type ViewMode = "list" | "kanban"
type StatusType = 'OPEN' | 'PENDING_INTERNAL' | 'PENDING_CLIENT' | 'RESOLVED' | 'CLOSED'

const STATUS_MAP: Record<StatusType, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: "New", color: "text-emerald-500 bg-emerald-500/10", icon: <AlertCircle className="w-4 h-4" /> },
  PENDING_INTERNAL: { label: "In Progress", color: "text-blue-500 bg-blue-500/10", icon: <Clock className="w-4 h-4" /> },
  PENDING_CLIENT: { label: "Waiting for Customer", color: "text-amber-500 bg-amber-500/10", icon: <Clock className="w-4 h-4" /> },
  RESOLVED: { label: "Resolved", color: "text-purple-500 bg-purple-500/10", icon: <CheckCircle2 className="w-4 h-4" /> },
  CLOSED: { label: "Closed", color: "text-slate-500 bg-slate-500/10", icon: <X className="w-4 h-4" /> },
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "text-red-500 border-red-500/20 bg-red-500/10",
  HIGH: "text-orange-500 border-orange-500/20 bg-orange-500/10",
  MEDIUM: "text-blue-500 border-blue-500/20 bg-blue-500/10",
  LOW: "text-slate-500 border-slate-500/20 bg-slate-500/10",
}

export function TicketList({ activeTicketId }: { activeTicketId: string | null }) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [search, setSearch] = useState("")
  
  // We'll fetch a larger limit for Kanban, but paginate normally for list
  const { data, isLoading } = useTickets({ page: 1, limit: viewMode === 'kanban' ? 50 : 20, search })
  const updateTicket = useUpdateTicket()

  const tickets = data?.data || []

  // Kanban Grouping
  const kanbanColumns = Object.keys(STATUS_MAP) as StatusType[]
  const ticketsByStatus = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.status]) acc[ticket.status] = [];
    acc[ticket.status].push(ticket);
    return acc;
  }, {} as Record<StatusType, Ticket[]>)

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: StatusType) => {
    e.preventDefault()
    const ticketId = e.dataTransfer.getData("ticketId")
    if (ticketId) {
      updateTicket.mutate({ id: ticketId, data: { status } })
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg tracking-tight">Inbox</h2>
          <div className="flex items-center border rounded-md overflow-hidden bg-muted/20">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets..." 
            className="pl-8 bg-muted/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/5 relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col p-4 gap-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </motion.div>
          ) : viewMode === "list" ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No tickets found.</div>
              ) : (
                tickets.map((ticket, idx) => (
                  <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                    className={`flex flex-col p-4 border-b cursor-pointer transition-colors hover:bg-muted/30 ${activeTicketId === ticket.id ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1 truncate pr-4">{ticket.subject}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span className="truncate">{ticket.customer?.displayName || 'Unknown Customer'}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="kanban"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex h-full min-w-max p-4 gap-4 overflow-x-auto"
            >
              {kanbanColumns.map(status => (
                <div 
                  key={status}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                  className="flex flex-col w-72 bg-muted/30 rounded-xl border p-2 h-full"
                >
                  <div className="flex items-center gap-2 p-2 mb-2">
                    <span className={`p-1 rounded-md ${STATUS_MAP[status].color}`}>
                      {STATUS_MAP[status].icon}
                    </span>
                    <span className="font-semibold text-sm">{STATUS_MAP[status].label}</span>
                    <span className="ml-auto text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border">
                      {ticketsByStatus[status]?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2 flex-1">
                    <AnimatePresence>
                      {ticketsByStatus[status]?.map(ticket => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, height: 0 }}
                          key={ticket.id}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, ticket.id)}
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                          className={`bg-background p-3 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-colors ${activeTicketId === ticket.id ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono text-muted-foreground">{ticket.ticketNumber}</span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border uppercase tracking-wider ${PRIORITY_COLORS[ticket.priority]}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-3">{ticket.subject}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-muted/50">
                            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-foreground uppercase border">
                              {ticket.customer?.displayName?.[0] || '?'}
                            </div>
                            <span className="truncate flex-1">{ticket.customer?.displayName}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
