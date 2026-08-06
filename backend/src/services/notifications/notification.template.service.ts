import { ApplicationEvent } from '../../events/event.bus.interface';
import { PriorityTier } from '@prisma/client';

export interface NotificationContent {
  title: string;
  message: string;
  linkUrl: string;
  priority: PriorityTier;
  expiresInHours?: number;
}

export class NotificationTemplateService {
  render(event: ApplicationEvent): NotificationContent | null {
    switch (event.type) {
      case 'ticket:assigned':
        return {
          title: 'Ticket Assigned',
          message: `Ticket ${event.payload.ticketNumber} has been assigned to you.`,
          linkUrl: `/tickets/${event.payload.ticketId}`,
          priority: 'INFO',
          expiresInHours: 72 // Expire old assignment notifications
        };
      
      case 'ai:escalated':
        return {
          title: 'AI Escalation Required',
          message: `A chat required human escalation. Reason: ${event.payload.reason}`,
          linkUrl: `/chats/${event.payload.chatId}`,
          priority: 'WARNING',
        };

      default:
        return null; // Unknown event, skip notification
    }
  }
}

export const notificationTemplateService = new NotificationTemplateService();
