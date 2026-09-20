import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    subject: z.string().min(5).max(255),
    description: z.string().min(10),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    category: z.string().optional(),
    assignedToId: z.string().uuid().optional(),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['OPEN', 'PENDING_CLIENT', 'PENDING_INTERNAL', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedToId: z.string().uuid().nullable().optional(),
    category: z.string().optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    content: z.string().min(1),
    isInternal: z.boolean().default(false),
  }),
});
