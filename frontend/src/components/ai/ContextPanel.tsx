import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, User, MessageSquare, Briefcase, FileText, Activity } from "lucide-react";
import { useCustomer } from '@/hooks/useCustomers';
import { useTicket } from '@/hooks/useTickets';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContextPanelProps {
  activeContext?: any;
  onContextChange: (type: 'knowledge' | 'customer' | 'conversation', id?: string) => void;
}

export function ContextPanel({ activeContext = {}, onContextChange }: ContextPanelProps) {
  const { data: customer, isLoading: isLoadingCustomer } = useCustomer(activeContext.customerId || '');
  const { data: ticketData, isLoading: isLoadingTicket } = useTicket(activeContext.ticketId || '');
  const ticket = ticketData?.data;

  return (
    <div className="flex flex-col h-full bg-background border-l shadow-sm">
      <div className="p-4 border-b bg-muted/20">
        <h3 className="font-semibold text-sm">Context</h3>
      </div>
      <Tabs defaultValue="knowledge" className="flex-1 flex flex-col w-full h-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-10">
          <TabsTrigger value="knowledge" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs">
            <Book className="h-3.5 w-3.5 mr-2" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs">
            <User className="h-3.5 w-3.5 mr-2" />
            Customer
          </TabsTrigger>
          <TabsTrigger value="conversation" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs">
            <MessageSquare className="h-3.5 w-3.5 mr-2" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="flex-1 p-0 overflow-y-auto m-0">
          <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Knowledge Base</h4>
            <p className="text-xs text-muted-foreground mb-4">
              As you chat, relevant knowledge articles will appear here automatically.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="flex-1 p-0 overflow-y-auto m-0">
          {isLoadingCustomer ? (
            <div className="p-4 space-y-4">
              <div className="h-12 w-full bg-muted animate-pulse rounded-md"></div>
              <div className="h-32 w-full bg-muted animate-pulse rounded-md"></div>
            </div>
          ) : customer ? (
            <div className="p-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                  {customer.displayName?.charAt(0) || customer.email.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{customer.displayName || 'Unknown'}</h4>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3"/> Company</span>
                  <span className="font-medium">{customer.companyName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3"/> CSAT</span>
                  <Badge variant={Number(customer.csatAverage) >= 4 ? 'default' : 'secondary'} className="text-[10px] h-4">
                    {customer.csatAverage ? `${customer.csatAverage} / 5.0` : 'N/A'}
                  </Badge>
                </div>
              </div>
              
              {ticket && (
                <div className="border rounded-lg p-3 bg-muted/10 space-y-2">
                  <h5 className="text-xs font-semibold flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Active Ticket
                  </h5>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{ticket.ticketNumber}</span>: {ticket.subject}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{ticket.status}</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-semibold mb-1">No Customer Context</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Link a customer to this conversation to view their profile, tickets, and sentiment history.
              </p>
              <Button variant="outline" size="sm" className="text-xs h-7">Link Customer</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="conversation" className="flex-1 p-0 overflow-y-auto m-0">
          <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Conversation Analysis</h4>
            <p className="text-xs text-muted-foreground mb-4">
              The AI Copilot will generate summaries and suggest replies here.
            </p>
            <Button size="sm" variant="secondary" className="text-xs h-7">Generate Summary</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
