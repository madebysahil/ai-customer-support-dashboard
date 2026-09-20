export interface BaseEvent {
  eventId: string;
  correlationId?: string;
  timestamp: Date;
}

export interface TicketAssignedEvent extends BaseEvent {
  type: 'ticket:assigned';
  payload: {
    ticketId: string;
    ticketNumber: string;
    assigneeId: string;
  };
}

export interface AiEscalationEvent extends BaseEvent {
  type: 'ai:escalated';
  payload: {
    chatId: string;
    reason: string;
  };
}

export type ApplicationEvent = TicketAssignedEvent | AiEscalationEvent; // Expandable

export interface IEventBus {
  publish(event: ApplicationEvent): Promise<void>;
  subscribe<T extends ApplicationEvent['type']>(
    eventType: T,
    handler: (event: Extract<ApplicationEvent, { type: T }>) => Promise<void>
  ): void;
}
