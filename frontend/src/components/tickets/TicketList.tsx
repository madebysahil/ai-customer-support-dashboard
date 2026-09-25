"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { useTickets, Ticket, useUpdateTicket } from "@/hooks/useTickets";
import { Input } from "@/components/ui/input";
import { Search, LayoutList, LayoutGrid, AlertCircle, Clock, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useVirtualizer } from "@tanstack/react-virtual";

type ViewMode = "list" | "kanban";
type StatusType = 'OPEN' | 'PENDING_INTERNAL' | 'PENDING_CLIENT' | 'RESOLVED' | 'CLOSED';

const STATUS_MAP: Record<StatusType, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: "New", color: "text-success bg-success/10", icon: <AlertCircle className="w-4 h-4" /> },
  PENDING_INTERNAL: { label: "In Progress", color: "text-info bg-info/10", icon: <Clock className="w-4 h-4" /> },
  PENDING_CLIENT: { label: "Waiting for Customer", color: "text-warning bg-warning/10", icon: <Clock className="w-4 h-4" /> },
  RESOLVED: { label: "Resolved", color: "text-foreground-muted bg-surface-raised border border-border-subtle", icon: <CheckCircle2 className="w-4 h-4" /> },
  CLOSED: { label: "Closed", color: "text-foreground-muted bg-muted", icon: <X className="w-4 h-4" /> },
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "text-critical border-critical/20 bg-critical/10",
  HIGH: "text-warning border-warning/20 bg-warning/10",
  MEDIUM: "text-info border-info/20 bg-info/10",
  LOW: "text-foreground-muted border-border-subtle bg-background-subtle",
};

export const TicketListItem = React.memo(function TicketListItem({
  ticket,
  isActive,
  index,
  onClick,
}: {
  ticket: Ticket;
  isActive: boolean;
  index: number;
  onClick: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(ticket.id)}
      style={{ animationDelay: `${index < 20 ? index * 50 : 0}ms`, animationFillMode: 'backwards' }}
      className={`animate-slide-up flex flex-col p-4 border-b border-border-subtle cursor-pointer transition-colors hover:bg-surface ${
        isActive ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] text-foreground-muted tabular-nums">{ticket.ticketNumber}</span>
        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-medium border ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <h4 className="font-medium text-sm mb-1 truncate pr-4 text-foreground">{ticket.subject}</h4>
      <div className="flex items-center justify-between text-[11px] text-foreground-muted mt-2">
        <span className="truncate">{ticket.customer?.displayName || "Unknown Customer"}</span>
        <span className="flex items-center gap-1 tabular-nums">
          <Clock className="w-3 h-3" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}, (prev, next) => prev.ticket === next.ticket && prev.isActive === next.isActive && prev.index === next.index);

export const TicketKanbanCard = React.memo(function TicketKanbanCard({
  ticket,
  isActive,
  index,
  onClick,
  onDragStart,
}: {
  ticket: Ticket;
  isActive: boolean;
  index: number;
  onClick: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={() => onClick(ticket.id)}
      style={{ animationDelay: `${index < 20 ? index * 50 : 0}ms`, animationFillMode: 'backwards' }}
      className={`animate-slide-up bg-background p-3 rounded-md border border-border-subtle shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
        isActive ? "ring-1 ring-primary" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono text-foreground-muted tabular-nums">{ticket.ticketNumber}</span>
        <span className={`px-1 py-0.5 rounded-sm text-[9px] font-medium border uppercase tracking-wider ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-3 text-foreground">{ticket.subject}</h4>
      <div className="flex items-center gap-2 text-[11px] text-foreground-muted mt-auto pt-2 border-t border-border-subtle">
        <div className="h-5 w-5 rounded-full bg-surface-raised flex items-center justify-center text-[10px] font-medium text-foreground border border-border-subtle">
          {ticket.customer?.displayName?.[0] || "?"}
        </div>
        <span className="truncate flex-1">{ticket.customer?.displayName || "Unknown"}</span>
      </div>
    </div>
  );
}, (prev, next) => prev.ticket === next.ticket && prev.isActive === next.isActive && prev.index === next.index);

export function TicketList({
  activeTicketId,
  viewMode,
  onViewModeChange,
  onSelect,
}: {
  activeTicketId: string | null;
  viewMode: "list" | "kanban";
  onViewModeChange: (mode: "list" | "kanban") => void;
  onSelect?: (id: string) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useTickets({ page: 1, limit: viewMode === "kanban" ? 50 : 50, search });
  const updateTicket = useUpdateTicket();

  const tickets = useMemo(() => data?.data || [], [data?.data]);

  // Memoized Kanban Status Grouping
  const kanbanColumns = useMemo(() => Object.keys(STATUS_MAP) as StatusType[], []);
  const ticketsByStatus = useMemo(() => {
    const grouped: Record<StatusType, Ticket[]> = {
      OPEN: [],
      PENDING_INTERNAL: [],
      PENDING_CLIENT: [],
      RESOLVED: [],
      CLOSED: [],
    };
    for (const ticket of tickets) {
      if (grouped[ticket.status as StatusType]) {
        grouped[ticket.status as StatusType].push(ticket);
      }
    }
    return grouped;
  }, [tickets]);

  const handleTicketClick = useCallback((id: string) => {
    if (onSelect) {
      onSelect(id);
    }
    router.push(`/tickets/${id}`);
  }, [onSelect, router]);

  const handleDragStart = useCallback((e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, status: StatusType) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("ticketId");
    if (ticketId) {
      updateTicket.mutate({ id: ticketId, data: { status } });
    }
  }, [updateTicket]);

  // Virtualizer for List Mode
  const listVirtualizer = useVirtualizer({
    count: tickets.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 92,
    overscan: 5,
    enabled: viewMode === "list",
  });

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border min-w-0">
      <div className="p-3 border-b border-border-subtle flex flex-col gap-3 bg-surface sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm tracking-tight text-foreground">Inbox</h2>
          <div className="flex items-center border border-border-subtle rounded-md overflow-hidden bg-background-subtle p-0.5">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1 transition-colors rounded-[4px] ${
                viewMode === "list" ? "bg-surface shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
              }`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("kanban")}
              className={`p-1 transition-colors rounded-[4px] ${
                viewMode === "kanban" ? "bg-surface shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search tickets..."
            className="pl-8 bg-background h-8 text-xs border-border-subtle"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background relative min-w-0" ref={scrollContainerRef}>
        {isLoading ? (
          <div className="flex flex-col p-4 gap-4">
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
          </div>
        ) : viewMode === "list" ? (
          tickets.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted text-sm">No tickets found.</div>
          ) : (
            <div
              style={{
                height: `${listVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {listVirtualizer.getVirtualItems().map((virtualRow) => {
                const ticket = tickets[virtualRow.index];
                return (
                  <div
                    key={ticket.id}
                    ref={listVirtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <TicketListItem
                      ticket={ticket}
                      isActive={activeTicketId === ticket.id}
                      index={virtualRow.index}
                      onClick={handleTicketClick}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex h-full p-4 gap-4 overflow-x-auto min-w-max items-start">
            {kanbanColumns.map((status) => (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                className="flex flex-col w-72 bg-surface rounded-md border border-border-subtle p-2 max-h-full shrink-0"
              >
                <div className="flex items-center gap-2 p-1.5 mb-1">
                  <span className={`p-1 rounded-sm ${STATUS_MAP[status].color}`}>
                    {STATUS_MAP[status].icon}
                  </span>
                  <span className="font-medium text-xs text-foreground">{STATUS_MAP[status].label}</span>
                  <span className="ml-auto text-[10px] text-foreground-muted font-medium bg-background-subtle px-1.5 py-0.5 rounded-sm border border-border-subtle tabular-nums">
                    {ticketsByStatus[status]?.length || 0}
                  </span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-1 flex-1">
                  {ticketsByStatus[status]?.map((ticket, index) => (
                    <TicketKanbanCard
                      key={ticket.id}
                      ticket={ticket}
                      isActive={activeTicketId === ticket.id}
                      index={index}
                      onClick={handleTicketClick}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
