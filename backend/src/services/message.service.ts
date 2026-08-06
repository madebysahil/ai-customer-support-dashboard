import { messageRepository } from '../repositories/message.repository';
import { chatRepository } from '../repositories/chat.repository';
import { Prisma, Message } from '@prisma/client';

export class MessageService {
  async createMessage(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    const message = await messageRepository.create(data);
    
    // Automatically update the chat's updatedAt timestamp to bubble it up in sorting
    await chatRepository.update(data.chatId, { updatedAt: new Date() });
    
    return message;
  }

  async markAsRead(messageId: string): Promise<Message> {
    return messageRepository.update(messageId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async listMessagesForChat(chatId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      messageRepository.findMany({
        where: { chatId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // Latest first for infinite scroll upwards
      }),
      messageRepository.count({ where: { chatId } }),
    ]);

    // Reverse data so it's chronologically ordered when passed to the UI
    const chronologicalData = data.reverse();

    return {
      data: chronologicalData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const messageService = new MessageService();
