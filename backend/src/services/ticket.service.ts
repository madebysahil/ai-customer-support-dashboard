import { Prisma, Ticket } from '@prisma/client';
import { ticketRepository } from '../repositories/ticket.repository';
import { env } from '../config/env';

export class TicketService {
  async createTicket(data: Omit<Prisma.TicketUncheckedCreateInput, 'ticketNumber' | 'dueDate'>) {
    const ticketNumber = await ticketRepository.getNextTicketNumber();
    
    // Simplistic due date assignment based on priority
    const dueDate = new Date();
    if (data.priority === 'URGENT') dueDate.setHours(dueDate.getHours() + 4);
    else if (data.priority === 'HIGH') dueDate.setHours(dueDate.getHours() + 24);
    else dueDate.setHours(dueDate.getHours() + 72);

    return ticketRepository.create({
      ...data,
      ticketNumber,
      dueDate,
    });
  }

  async updateTicket(id: string, updates: Prisma.TicketUncheckedUpdateInput, actorId: string) {
    const ticket = await ticketRepository.findById(id);
    if (!ticket) throw new Error('Ticket not found');

    const updateData: Prisma.TicketUncheckedUpdateInput = { ...updates };

    // Resolve milestone handling
    if (updates.status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
      
      // Calculate SLA Breach implicitly
      if (ticket.dueDate < new Date()) {
        updateData.slaBreached = true;
      }
    }

    // Auto-assignment check
    if (updates.assignedToId && updates.assignedToId !== ticket.assignedToId) {
      const { eventBus } = require('../events/memory.event.bus');
      eventBus.publish({
        eventId: require('crypto').randomUUID(),
        type: 'ticket:assigned',
        timestamp: new Date(),
        payload: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          assigneeId: updates.assignedToId as string
        }
      });
    }

    return ticketRepository.update(id, updateData);
  }

  async addComment(ticketId: string, content: string, authorId: string, isInternal: boolean) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const comment = await ticketRepository.addComment({
      ticketId,
      content,
      isInternal,
      authorUserId: authorId // Assumes agent for now based on Dashboard usage
    });

    // Update firstResponseAt SLA if this is the first public reply from an agent
    if (!isInternal && !ticket.firstResponseAt) {
      await ticketRepository.update(ticketId, { firstResponseAt: new Date() });
    }

    return comment;
  }

  async listTickets(options: any) {
    const { page = 1, limit = 20, status, priority, assignedToId, search } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      ticketRepository.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { customer: true, assignedTo: true }
      }),
      ticketRepository.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const ticketService = new TicketService();
