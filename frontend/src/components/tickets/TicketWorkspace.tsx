"use client"

import { useState } from "react";
import { TicketList } from "./TicketList";
import { TicketDetails } from "./TicketDetails";
import { TicketAiAssistant } from "./TicketAiAssistant";

interface TicketWorkspaceProps {
  initialTicketId?: string;
}

export function TicketWorkspace({ initialTicketId }: TicketWorkspaceProps) {
  const activeTicketId = initialTicketId || null;
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  return (
    <div className="flex flex-col h-full bg-background rounded-tl-lg overflow-hidden border-t border-l">
      <div className="flex h-full w-full overflow-hidden bg-surface">
        {/* LEFT: Ticket List */}
        <div className={`${
          viewMode === 'kanban' 
            ? 'w-full' 
            : `${activeTicketId ? 'hidden md:flex' : 'flex'} w-full md:w-4/12 lg:w-3/12`
        } border-r border-border flex-col h-full bg-background overflow-hidden`}>
          <TicketList activeTicketId={activeTicketId} viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
        
        {viewMode !== 'kanban' && (
          <>
            {/* CENTER: Ticket Details */}
            <div className={`${!activeTicketId ? 'hidden md:flex' : 'flex'} w-full md:w-8/12 lg:w-6/12 flex-col h-full bg-background overflow-hidden relative`}>
              <TicketDetails activeTicketId={activeTicketId} />
            </div>
            
            {/* RIGHT: AI Assistant */}
            <div className="hidden lg:flex lg:w-3/12 border-l border-border flex-col h-full bg-surface overflow-hidden">
              <TicketAiAssistant activeTicketId={activeTicketId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
