import { prisma } from '../utils/prisma';
import { Prisma, Ticket, TicketComment } from '@prisma/client';

export class TicketRepository {
  async create(data: Prisma.TicketUncheckedCreateInput): Promise<Ticket> {
    return prisma.ticket.create({ data });
  }

  async findById(id: string) {
    return prisma.ticket.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        assignedTo: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { authorUser: true, authorCustomer: true }
        }
      }
    });
  }

  async findMany(args: Prisma.TicketFindManyArgs) {
    return prisma.ticket.findMany({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async count(args: Prisma.TicketCountArgs): Promise<number> {
    return prisma.ticket.count({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.TicketUpdateInput): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data,
    });
  }

  async addComment(data: Prisma.TicketCommentUncheckedCreateInput): Promise<TicketComment> {
    return prisma.ticketComment.create({
      data,
      include: { authorUser: true, authorCustomer: true }
    });
  }

  // Utility to generate sequences
  async getNextTicketNumber(): Promise<string> {
    // In a highly concurrent system, this should use a sequence table or Redis INCR.
    // Doing a raw count approximation for this example.
    const count = await prisma.ticket.count();
    const nextNum = (count + 1).toString().padStart(6, '0');
    return `SUP-${nextNum}`;
  }
}

export const ticketRepository = new TicketRepository();
