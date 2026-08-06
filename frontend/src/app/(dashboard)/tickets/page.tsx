"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, Loader2, Clock, AlertCircle } from "lucide-react"
import { useTickets } from "@/hooks/useTickets"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TicketsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  
  const { data, isLoading, isError } = useTickets({ page, limit: 10, search })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'RESOLVED': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'CLOSED': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Inbox</CardTitle>
          <CardDescription>Manage and resolve customer inquiries and escalations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tickets..." 
                className="pl-8" 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-destructive">
                      Error loading tickets.
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">{ticket.ticketNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[250px]">{ticket.subject}</span>
                          <span className="text-xs text-muted-foreground">{ticket.customer?.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                           {ticket.status.replace('_', ' ')}
                         </span>
                      </TableCell>
                      <TableCell>
                         <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                           {ticket.priority}
                         </span>
                      </TableCell>
                      <TableCell>
                        {ticket.slaBreached ? (
                          <div className="flex items-center gap-1 text-destructive text-xs font-medium">
                            <AlertCircle className="h-3 w-3" /> Breached
                          </div>
                        ) : ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                          <span className="text-xs text-muted-foreground">Met</span>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="sm" asChild>
                           <Link href={`/tickets/${ticket.id}`}>View</Link>
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.meta.hasPrevPage}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!data.meta.hasNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
