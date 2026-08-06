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
            <span className="px-2 py-1 rounded-md border font-medium text-red-600 bg-red-50 border-red-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> SLA Breached
            </span>
          )}
        </div>
      </div>

      {/* Timeline & Conversation */}
      <div className="flex-1 overflow-y-auto p-6 bg-muted/5 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-24">
          
          {/* Original Request */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold border border-indigo-200">
              {ticket.customer?.displayName?.[0] || '?'}
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{ticket.customer?.displayName}</span>
                <span className="text-xs text-muted-foreground">reported via {ticket.origin}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
              <div className="bg-background border rounded-2xl rounded-tl-sm p-4 text-sm whitespace-pre-wrap shadow-sm">
                {ticket.description}
              </div>
            </div>
          </div>

          {/* Timeline Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed"></div></div>
            <div className="relative bg-muted/5 px-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Timeline Started
            </div>
          </div>

          {/* Comments Feed */}
          {ticket.comments?.map((c) => (
            <div key={c.id} className={`flex gap-4 ${c.isInternal ? 'pl-8' : ''}`}>
              {!c.isInternal && (
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-bold border">
                  {c.authorUser?.fullName?.[0] || c.authorCustomer?.displayName?.[0] || 'S'}
                </div>
              )}
              {c.isInternal && (
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold border border-amber-200 mt-1">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {c.authorUser?.fullName || c.authorCustomer?.displayName || 'System'}
                  </span>
                  {c.isInternal && (
                    <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Internal Note</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className={`border p-4 text-sm shadow-sm prose prose-sm max-w-none ${
                  c.isInternal 
                    ? 'bg-amber-50/50 border-amber-200 rounded-2xl rounded-tl-sm' 
                    : 'bg-background rounded-2xl rounded-tl-sm'
                }`}>
                  <ReactMarkdown>{c.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {ticket.status === 'RESOLVED' && (
            <div className="relative flex items-center justify-center py-6 mt-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-200"></div></div>
              <div className="relative bg-purple-50 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Ticket marked as resolved
              </div>
            </div>
          )}

          {ticket.status === 'CLOSED' && (
            <div className="relative flex items-center justify-center py-6 mt-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative bg-slate-50 border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
                <X className="w-4 h-4" /> Ticket permanently closed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      {ticket.status !== 'CLOSED' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t">
          <form onSubmit={handleSubmit} className={`max-w-3xl mx-auto rounded-xl border shadow-sm overflow-hidden flex flex-col transition-colors ${isInternal ? 'border-amber-300 ring-4 ring-amber-500/10' : 'border-input focus-within:ring-2 focus-within:ring-ring focus-within:border-ring'}`}>
            <div className={`px-4 py-2 text-xs font-medium border-b flex items-center gap-2 ${isInternal ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-muted/50 text-muted-foreground'}`}>
              {isInternal ? <Lock className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {isInternal ? 'Private Internal Note' : 'Public Reply'}
            </div>
            <textarea 
              className={`w-full min-h-[100px] p-4 text-sm resize-none focus:outline-none ${isInternal ? 'bg-amber-50/30' : 'bg-background'}`}
              placeholder={isInternal ? "Type a private note visible only to your team..." : "Type your reply to the customer (Markdown supported)..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className={`flex justify-between items-center px-3 py-2 border-t ${isInternal ? 'bg-amber-50/80 border-amber-200' : 'bg-muted/20'}`}>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className={`h-8 text-xs ${isInternal ? 'text-amber-700 hover:bg-amber-200/50 hover:text-amber-800' : 'text-muted-foreground'}`}
                onClick={() => setIsInternal(!isInternal)}
              >
                <Lock className="mr-2 h-3 w-3" /> {isInternal ? 'Switch to Public Reply' : 'Make Internal'}
              </Button>
              <Button type="submit" size="sm" className={`h-8 ${isInternal ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`} disabled={!comment.trim() || addComment.isPending}>
                {addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Send className="h-3 w-3 mr-2" />}
                {isInternal ? 'Add Note' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
