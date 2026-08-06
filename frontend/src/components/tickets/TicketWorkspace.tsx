"use client"

import { TicketList } from "./TicketList";
import { TicketDetails } from "./TicketDetails";
import { TicketAiAssistant } from "./TicketAiAssistant";

interface TicketWorkspaceProps {
  initialTicketId?: string;
}

export function TicketWorkspace({ initialTicketId }: TicketWorkspaceProps) {
  const activeTicketId = initialTicketId || null;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* LEFT: Ticket List (Visible on mobile if no ticket selected, always visible on md+) */}
      <div className={`${activeTicketId ? 'hidden md:flex' : 'flex'} w-full md:w-4/12 lg:w-3/12 border-r flex-col h-full bg-background overflow-hidden`}>
        <TicketList activeTicketId={activeTicketId} />
      </div>
      
      {/* CENTER: Ticket Details (Visible on mobile if ticket selected, always visible on md+) */}
      <div className={`${!activeTicketId ? 'hidden md:flex' : 'flex'} w-full md:w-8/12 lg:w-6/12 flex-col h-full bg-muted/10 overflow-hidden relative`}>
        <TicketDetails activeTicketId={activeTicketId} />
      </div>
      
      {/* RIGHT: AI Assistant (Hidden on md, visible on lg+) */}
      <div className="hidden lg:flex lg:w-3/12 border-l flex-col h-full bg-background overflow-hidden">
        <TicketAiAssistant activeTicketId={activeTicketId} />
      </div>
    </div>
  );
}
