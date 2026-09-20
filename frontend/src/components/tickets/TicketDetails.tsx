"use client"

import { useState } from "react"
import { useTicket, useAddTicketComment, useUpdateTicket } from "@/hooks/useTickets"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Lock, User as UserIcon, CheckCircle2, Clock, Inbox, AlertCircle, FileText, CornerDownLeft, X } from "lucide-react"
import ReactMarkdown from "react-markdown"

export function TicketDetails({ activeTicketId }: { activeTicketId: string | null }) {
  const { data: response, isLoading } = useTicket(activeTicketId || "")
  const addComment = useAddTicketComment()
  const updateTicket = useUpdateTicket()
  
  const [comment, setComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)

  if (!activeTicketId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center h-full bg-muted/10">
        <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mb-6">
          <Inbox className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">No ticket selected</h3>
        <p className="text-sm max-w-sm">Select a ticket from the inbox to view its history, timeline, and collaborate with your team.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const ticket = response?.data;
  if (!ticket) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Ticket not found.</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment.mutate({ id: ticket.id, content: comment, isInternal }, {
      onSuccess: () => {
        setComment("");
      }
    });
  }

  const toggleStatus = () => {
    const nextStatus = ticket.status === 'RESOLVED' ? 'REOPENED' : 'RESOLVED';
    updateTicket.mutate({ id: ticket.id, data: { status: nextStatus as any } });
  }

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="p-5 border-b bg-background z-10 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="sm" className="h-8 px-2 -ml-2" onClick={() => window.history.back()}>
            <CornerDownLeft className="w-4 h-4 mr-1 transform rotate-90" /> Back to Inbox
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-xl leading-tight">{ticket.subject}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted">{ticket.ticketNumber}</span>
              <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {ticket.customer?.displayName}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Button variant={ticket.status === 'RESOLVED' ? 'outline' : 'default'} onClick={toggleStatus} className="shrink-0">
            {ticket.status === 'RESOLVED' ? 'Reopen Ticket' : <><CheckCircle2 className="w-4 h-4 mr-2" /> Resolve</>}
          </Button>
        </div>
        
        {/* Properties Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-md border font-medium uppercase bg-muted/30">
            {ticket.status.replace('_', ' ')}
          </span>
          <span className="px-2 py-1 rounded-md border font-medium uppercase text-muted-foreground bg-muted/10">
            Priority: {ticket.priority}
          </span>
          <span className="px-2 py-1 rounded-md border font-medium text-muted-foreground bg-muted/10">
            Assignee: {ticket.assignedTo?.fullName || 'Unassigned'}
          </span>
          {ticket.slaBreached && (
            <span className="px-2 py-1 rounded-md border font-medium text-critical bg-critical/10 border-critical/20 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> SLA Breached
            </span>
          )}
        </div>
      </div>

      {/* Timeline & Conversation */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          
          {/* Original Request */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold border border-primary/20 text-xs">
              {ticket.customer?.displayName?.[0] || '?'}
            </div>
            <div className="flex flex-col flex-1 gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{ticket.customer?.displayName}</span>
                <span className="text-xs text-foreground-muted whitespace-nowrap">via {ticket.origin}</span>
                <span className="text-[10px] text-foreground-muted ml-auto whitespace-nowrap">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
              <div className="bg-surface border border-border-subtle rounded-md p-3 text-[13px] whitespace-pre-wrap text-foreground mt-1">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Timeline Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-border-subtle"></div></div>
            <div className="relative bg-background px-4 text-[10px] text-foreground-muted font-semibold uppercase tracking-widest">
              Timeline Started
            </div>
          </div>

          {/* Comments Feed */}
          {ticket.comments?.map((c) => (
            <div key={c.id} className={`flex gap-4 ${c.isInternal ? 'pl-8' : ''}`}>
              {!c.isInternal && (
                <div className="w-8 h-8 rounded-full bg-background-subtle text-foreground-muted flex items-center justify-center shrink-0 font-semibold border border-border-subtle text-xs">
                  {c.authorUser?.fullName?.[0] || c.authorCustomer?.displayName?.[0] || 'S'}
                </div>
              )}
              {c.isInternal && (
                <div className="w-6 h-6 rounded-full bg-warning/10 text-warning-muted flex items-center justify-center shrink-0 border border-warning/20 mt-1">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <div className="flex flex-col flex-1 gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">
                    {c.authorUser?.fullName || c.authorCustomer?.displayName || 'System'}
                  </span>
                  {c.isInternal && (
                    <span className="text-[9px] uppercase font-bold text-warning-muted tracking-wider">Internal</span>
                  )}
                  <span className="text-[10px] text-foreground-muted ml-auto whitespace-nowrap">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className={`border p-3 text-[13px] mt-1 ${
                  c.isInternal 
                    ? 'bg-warning/5 border-warning/20 rounded-md text-foreground' 
                    : 'bg-surface border-border-subtle rounded-md text-foreground'
                }`}>
                  <ReactMarkdown>{c.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {ticket.status === 'RESOLVED' && (
            <div className="relative flex items-center justify-center py-6 mt-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-success/30"></div></div>
              <div className="relative bg-success/10 border border-success/30 text-success px-4 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ticket marked as resolved
              </div>
            </div>
          )}

          {ticket.status === 'CLOSED' && (
            <div className="relative flex items-center justify-center py-6 mt-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle"></div></div>
              <div className="relative bg-background-subtle border border-border-subtle text-foreground-muted px-4 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-2">
                <X className="w-3.5 h-3.5" /> Ticket permanently closed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      {ticket.status !== 'CLOSED' && (
        <div className="p-4 bg-background border-t border-border-subtle shrink-0">
          <form onSubmit={handleSubmit} className={`max-w-3xl mx-auto rounded-md border flex flex-col transition-colors bg-surface ${isInternal ? 'border-warning/40 ring-1 ring-warning/20' : 'border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary'}`}>
            <div className={`px-3 py-1.5 text-[11px] font-medium border-b flex items-center gap-2 ${isInternal ? 'bg-warning/10 text-warning-muted border-warning/20' : 'bg-background-subtle text-foreground-muted border-border-subtle'}`}>
              {isInternal ? <Lock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {isInternal ? 'Private Internal Note' : 'Public Reply'}
            </div>
            <textarea 
              className={`w-full min-h-[80px] p-3 text-[13px] resize-none focus:outline-none bg-transparent`}
              placeholder={isInternal ? "Type a private note visible only to your team..." : "Type your reply to the customer (Markdown supported)..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={`flex justify-between items-center px-2 py-2 border-t ${isInternal ? 'bg-warning/5 border-warning/20' : 'bg-background-subtle border-border-subtle'}`}>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className={`h-7 text-[11px] ${isInternal ? 'text-warning-muted hover:bg-warning/10 hover:text-warning' : 'text-foreground-muted hover:text-foreground'}`}
                onClick={() => setIsInternal(!isInternal)}
              >
                <Lock className="mr-1.5 h-3 w-3" /> {isInternal ? 'Switch to Public Reply' : 'Make Internal'}
              </Button>
              <Button type="submit" size="sm" className={`h-7 text-[11px] ${isInternal ? 'bg-warning text-warning-foreground hover:bg-warning/90' : ''}`} disabled={!comment.trim() || addComment.isPending}>
                {addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Send className="h-3 w-3 mr-1.5" />}
                {isInternal ? 'Add Note' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
