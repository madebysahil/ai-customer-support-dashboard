import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters'),
    companyName: z.string().optional(),
    phoneNumber: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    displayName: z.string().min(2).optional(),
    companyName: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
    metadata: z.record(z.any()).optional(),
    version: z.number().int().optional(), // For optimistic concurrency if needed
  }),
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
});

export const getCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid customer ID format'),
  }),
});

export const listCustomersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    search: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    status: z.string().optional(),
    company: z.string().optional(),
    tags: z.string().optional(), // comma separated
    createdAfter: z.string().datetime().optional(),
  }),
});
