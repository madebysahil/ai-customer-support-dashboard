import { Server } from 'socket.io';
import { AuthenticatedSocket } from './index';
import { messageService } from '../services/message.service';
import { chatService } from '../services/chat.service';
import { aiOrchestrator } from '../services/ai/ai.orchestrator';
import { logger } from '../utils/logger';

// In-memory debounce tracker to prevent typing spam
const typingTimeouts = new Map<string, NodeJS.Timeout>();

export const registerChatHandlers = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.user.sub;

  socket.on('chat:join', async (chatId: string, callback: (res: { status: string, error?: string }) => void) => {
    try {
      // Security Check: Verify user has access to this chat
      const hasAccess = await chatService.verifyAccess(chatId, userId, socket.user.role);
      if (!hasAccess) {
        if (callback) callback({ status: 'error', error: 'Forbidden' });
        return;
      }
      socket.join(`chat_${chatId}`);
      if (callback) callback({ status: 'ok' });
    } catch (error: any) {
      logger.error('Error joining chat', { error: error.message });
      if (callback) callback({ status: 'error', error: 'Internal Server Error' });
    }
  });

  socket.on('chat:leave', (chatId: string) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on('chat:message.send', async (payload: { chatId: string; content: string; authorType?: string }, callback: (res: { status: string, message?: any, error?: string }) => void) => {
    try {
      // 1. Save to database using MessageService
      const savedMessage = await messageService.createMessage({
        chatId: payload.chatId,
        authorId: userId,
        authorType: (payload.authorType || 'SUPPORT_AGENT') as any,
        content: payload.content,
      });

      // 2. Broadcast to room
      socket.to(`chat_${payload.chatId}`).emit('chat:message.receive', savedMessage);

      // 3. Acknowledge success to sender
      if (callback) callback({ status: 'ok', message: savedMessage });

      // 4. Trigger AI if customer sent message
      if (savedMessage.authorType === 'CUSTOMER') {
        const ioServer = (socket as any).server; // access to root io instance
        aiOrchestrator.handleCustomerMessage(ioServer, payload.chatId, payload.content);
      }
    } catch (error: any) {
      logger.error('Error sending message', { error: error.message });
      if (callback) callback({ status: 'error', error: 'Failed to send message' });
    }
  });

  socket.on('chat:typing.start', (payload: { chatId: string }) => {
    const key = `${payload.chatId}-${userId}`;
    
    // Server-side debounce: Clear existing timeout
    if (typingTimeouts.has(key)) {
      clearTimeout(typingTimeouts.get(key));
    }
    
    socket.to(`chat_${payload.chatId}`).emit('chat:typing.start', { userId, chatId: payload.chatId });
    
    // Auto-stop after 3 seconds if we don't get another event
    const timeout = setTimeout(() => {
      socket.to(`chat_${payload.chatId}`).emit('chat:typing.stop', { userId, chatId: payload.chatId });
      typingTimeouts.delete(key);
    }, 3000);
    
    typingTimeouts.set(key, timeout);
  });

  socket.on('chat:typing.stop', (payload: { chatId: string }) => {
    const key = `${payload.chatId}-${userId}`;
    if (typingTimeouts.has(key)) {
      clearTimeout(typingTimeouts.get(key));
      typingTimeouts.delete(key);
    }
    socket.to(`chat_${payload.chatId}`).emit('chat:typing.stop', { userId, chatId: payload.chatId });
  });

  socket.on('chat:message.read', async (payload: { messageId: string; chatId: string }, callback: Function) => {
    try {
      const updatedMsg = await messageService.markAsRead(payload.messageId);
      socket.to(`chat_${payload.chatId}`).emit('chat:message.read', { messageId: payload.messageId, readAt: updatedMsg.readAt });
      if (callback) callback({ status: 'ok' });
    } catch (error: any) {
      if (callback) callback({ status: 'error' });
    }
  });
};
