import React from 'react';
import { useCustomer } from '@/hooks/useCustomers';
import { useTickets } from '@/hooks/useTickets';
import { useChats } from '@/hooks/useChats';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, AlertTriangle, MessageSquare, Zap, Activity, Briefcase } from "lucide-react";

export function ChatContextPanel({ chatId }: { chatId: string | null }) {
  // 1. Fetch all chats to find the active chat's customerId
  const { data: chatsData } = useChats();
  const activeChat = chatsData?.data?.find((c: any) => c.id === chatId);
  const customerId = activeChat?.customerId;

  // 2. Fetch customer details
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(customerId || '');

  // 3. Fetch recent tickets for this customer
  const { data: ticketsData, isLoading: isLoadingTickets } = useTickets(customerId ? { customerId } : {});
  const openTickets = ticketsData?.data?.filter((t: any) => t.status !== 'RESOLVED' && t.status !== 'CLOSED') || [];

  if (!chatId || (!isLoadingCustomer && !customer)) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <h4 className="text-sm font-semibold mb-2">No Customer Context</h4>
        <p className="text-xs text-muted-foreground">
          Select an active conversation to view the customer profile, open tickets, and AI insights.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="p-4 border-b bg-muted/20 sticky top-0 z-10 shrink-0">
        <h3 className="font-semibold text-sm">Customer Context</h3>
      </div>
      
      {isLoadingCustomer ? (
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <div className="h-20 w-20 rounded-full bg-muted"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
            <div className="h-3 w-24 bg-muted rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </div>
      ) : customer ? (
        <div className="p-4 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
              {customer.displayName?.charAt(0) || customer.email.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-base">{customer.displayName || 'Unknown'}</h4>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Profile Details</h5>
            <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4"/> Company
              </span>
              <span className="font-medium">{customer.companyName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4"/> Avg CSAT
              </span>
              <Badge variant={Number(customer.csatAverage) >= 4 ? 'default' : 'secondary'} className="text-xs">
                {customer.csatAverage ? `${customer.csatAverage}/5.0` : 'N/A'}
              </Badge>
            </div>
          </div>

          {/* Tickets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Open Tickets</h5>
              <Badge variant="outline" className="text-[10px]">{openTickets.length}</Badge>
            </div>
            
            {isLoadingTickets ? (
              <div className="h-16 bg-muted animate-pulse rounded-lg"></div>
            ) : openTickets.length > 0 ? (
              <div className="space-y-2">
                {openTickets.map((ticket: any) => (
                  <div key={ticket.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-xs group-hover:text-primary transition-colors">{ticket.ticketNumber}</span>
                      <Badge className="text-[9px] h-4" variant={ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{ticket.subject}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-muted/20 rounded-lg border border-dashed">
                <FileText className="h-5 w-5 mx-auto text-muted-foreground opacity-50 mb-1" />
                <p className="text-xs text-muted-foreground">No open tickets</p>
              </div>
            )}
          </div>

          {/* AI Intelligence (Premium Disabled State as per instructions) */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Copilot Intelligence
            </h5>
            
            <div className="rounded-xl border bg-gradient-to-br from-background to-muted/50 p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground"/> Escalation Risk
                </span>
                <Badge variant="secondary" className="opacity-50 text-[10px]">Unsupported</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground"/> Current Sentiment
                </span>
                <Badge variant="secondary" className="opacity-50 text-[10px]">Unsupported</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-[10px] text-muted-foreground leading-relaxed text-center italic">
                  Live sentiment analysis and escalation predictions require a dedicated NLP backend stream. Upgrade your backend AI configuration to enable these features.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
