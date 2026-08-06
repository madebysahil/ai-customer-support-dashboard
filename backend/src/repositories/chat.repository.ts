import { prisma } from '../utils/prisma';
import { Prisma, Chat } from '@prisma/client';

export class ChatRepository {
  async findById(id: string): Promise<Chat | null> {
    return prisma.chat.findUnique({
      where: { id },
      include: { customer: true }
    });
  }

  async findMany(args: Prisma.ChatFindManyArgs) {
    return prisma.chat.findMany(args);
  }

  async count(args: Prisma.ChatCountArgs): Promise<number> {
    return prisma.chat.count(args);
  }

  async update(id: string, data: Prisma.ChatUpdateInput): Promise<Chat> {
    return prisma.chat.update({
      where: { id },
      data,
    });
  }
}

export const chatRepository = new ChatRepository();
