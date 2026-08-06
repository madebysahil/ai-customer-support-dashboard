"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useTicket, useAddTicketComment, useUpdateTicket } from "@/hooks/useTickets"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Send, Lock, User as UserIcon } from "lucide-react"

export default function TicketDetailsPage() {
  const { id } = useParams()
  const { data: response, isLoading } = useTicket(id as string)
  const addComment = useAddTicketComment()
  const updateTicket = useUpdateTicket()
  
  const [comment, setComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)

  const ticket = response?.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addComment.mutate({ id: ticket!.id, content: comment, isInternal }, {
      onSuccess: () => {
        setComment("");
        setIsInternal(false);
      }
    });
  }

  const toggleStatus = () => {
    if (!ticket) return;
    const nextStatus = ticket.status === 'RESOLVED' ? 'REOPENED' : 'RESOLVED';
    updateTicket.mutate({ id: ticket.id, data: { status: nextStatus as any } });
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  if (!ticket) {
    return <div className="text-center p-12">Ticket not found.</div>
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tickets"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="font-mono">{ticket.ticketNumber}</span>
              <span>•</span>
              <span>{ticket.customer?.displayName}</span>
              <span>•</span>
              <span className="uppercase text-xs font-semibold">{ticket.status.replace('_', ' ')}</span>
            </p>
          </div>
        </div>
        <Button variant={ticket.status === 'RESOLVED' ? 'outline' : 'default'} onClick={toggleStatus}>
          {ticket.status === 'RESOLVED' ? 'Reopen Ticket' : 'Mark Resolved'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeline */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> 
                {ticket.customer?.displayName} <span className="text-muted-foreground text-sm font-normal">reported via {ticket.origin}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Comments Feed */}
          <div className="space-y-4">
            {ticket.comments?.map((c) => (
              <Card key={c.id} className={c.isInternal ? 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10' : ''}>
                <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {c.authorUser?.fullName || c.authorCustomer?.displayName || 'System'}
                    {c.isInternal && <span className="flex items-center gap-1 text-[10px] uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded-full"><Lock className="h-3 w-3" /> Internal Note</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Composer */}
          <Card>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-4">
                <textarea 
                  className={`w-full min-h-[100px] p-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-ring ${isInternal ? 'bg-amber-50/30 border-amber-200' : 'bg-background'}`}
                  placeholder={isInternal ? "Add a private internal note..." : "Type your public reply here..."}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className={isInternal ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' : 'text-muted-foreground'}
                  onClick={() => setIsInternal(!isInternal)}
                >
                  <Lock className="mr-2 h-4 w-4" /> {isInternal ? 'Internal Note Mode' : 'Make Internal Note'}
                </Button>
                <Button type="submit" disabled={!comment.trim() || addComment.isPending}>
                  {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Send {isInternal ? 'Note' : 'Reply'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Sidebar Properties */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Assignee</span>
                <span className="font-medium">{ticket.assignedTo?.fullName || 'Unassigned'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium">{ticket.priority}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">SLA Target</span>
                <span className="font-medium">{new Date(ticket.dueDate).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Origin</span>
                <span className="font-medium">{ticket.origin}</span>
              </div>
              {(ticket as any).originChatId && (
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">Related Chat</span>
                  <Link href="/chats" className="font-medium text-indigo-500 hover:underline">View Conversation</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
