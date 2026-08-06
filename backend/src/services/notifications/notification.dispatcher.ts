import { eventBus } from '../../events/memory.event.bus';
import { notificationTemplateService } from './notification.template.service';
import { notificationPreferencesService } from './notification.preferences.service';
import { prisma } from '../../utils/prisma';
import { logger } from '../../utils/logger';

// We abstract out the Socket logic to an interface
export interface IInAppPusher {
  pushToUser(userId: string, payload: any): void;
}

export class NotificationDispatcher {
  constructor(private inAppPusher: IInAppPusher) {
    this.registerSubscribers();
  }

  private registerSubscribers() {
    eventBus.subscribe('ticket:assigned', this.handleEvent.bind(this));
    eventBus.subscribe('ai:escalated', this.handleEvent.bind(this));
    // Additional event registrations...
  }

  private async handleEvent(event: any) {
    const template = notificationTemplateService.render(event);
    if (!template) return;

    // Determine recipient
    let recipientId = null;
    if (event.type === 'ticket:assigned') {
      recipientId = event.payload.assigneeId;
    }
    // If global broadcast or role-based, we'd fetch users here.
    if (!recipientId) return;

    const channels = await notificationPreferencesService.getChannelsForUserAndEvent(recipientId, event.type);

    // Save to Database (Serves as IN_APP persistence)
    if (channels.includes('IN_APP')) {
      const expiresAt = template.expiresInHours ? new Date(Date.now() + template.expiresInHours * 3600000) : null;
      
      const savedNotification = await prisma.notification.create({
        data: {
          recipientId,
          title: template.title,
          message: template.message,
          linkUrl: template.linkUrl,
          priorityTier: template.priority,
          expiresAt
        }
      });

      // Push real-time event to connected sockets
      this.inAppPusher.pushToUser(recipientId, savedNotification);
    }

    // Future Channels:
    // if (channels.includes('EMAIL')) { emailService.send(...) }
  }
}

// Inversion of control: we pass an adapter connecting to the Socket Server
import { getSocketServer } from '../../socket'; // Assumes a getter exists or we pass it during bootstrap

class SocketInAppPusher implements IInAppPusher {
  pushToUser(userId: string, payload: any): void {
    const io = getSocketServer();
    if (io) {
       io.to(`user_${userId}`).emit('notification:received', payload);
    }
  }
}

export const notificationDispatcher = new NotificationDispatcher(new SocketInAppPusher());
