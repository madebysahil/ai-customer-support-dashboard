import { prisma } from '../utils/prisma';
import { Prisma, Message } from '@prisma/client';

export class MessageRepository {
  async create(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    return prisma.message.create({
      data,
      include: { attachments: true }
    });
  }

  async findMany(args: Prisma.MessageFindManyArgs) {
    return prisma.message.findMany({
      ...args,
      where: { ...args.where, deletedAt: null },
      include: { attachments: true }
    });
  }

  async count(args: Prisma.MessageCountArgs): Promise<number> {
    return prisma.message.count({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.MessageUpdateInput): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data,
    });
  }
}

export const messageRepository = new MessageRepository();
