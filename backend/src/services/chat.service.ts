import { chatRepository } from '../repositories/chat.repository';
import { Prisma } from '@prisma/client';

export class ChatService {
  async verifyAccess(chatId: string, userId: string, role: string): Promise<boolean> {
    if (role === 'ADMINISTRATOR' || role === 'MANAGER') return true;
    
    const chat = await chatRepository.findById(chatId);
    if (!chat) return false;
    
    // Support agents can only join chats they are assigned to or unassigned queued chats
    if (chat.assignedAgentId === userId) return true;
    if (chat.status === 'QUEUED') return true; // Allows agent to view and claim
    
    return false;
  }

  async listActiveChats(userId: string, role: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ChatWhereInput = {};
    
    if (role === 'SUPPORT_AGENT') {
      where.assignedAgentId = userId;
    }
    // Omit resolved chats from default active view
    where.status = { not: 'RESOLVED' };

    const [data, total] = await Promise.all([
      chatRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }, // Orders by most recently active conversation
        include: {
          customer: { select: { id: true, displayName: true, email: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      chatRepository.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const chatService = new ChatService();
