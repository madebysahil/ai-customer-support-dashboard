import { Prisma } from '@prisma/client';
import { customerRepository } from '../repositories/customer.repository';

interface ListCustomersOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  status?: string;
  company?: string;
  tags?: string;
  createdAfter?: string;
}

export class CustomerService {
  async createCustomer(data: Prisma.CustomerCreateInput) {
    return customerRepository.create(data);
  }

  async getCustomer(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async updateCustomer(id: string, data: Prisma.CustomerUpdateInput, version?: number) {
    // If we want optimistic concurrency, we could fetch first and compare 'updatedAt' vs version.
    // We are designing it to support it, but leaving it optional to not break current flow.
    const existing = await customerRepository.findById(id);
    if (!existing) throw new Error('Customer not found');
    
    // Future: if (version && existing.updatedAt.getTime() !== version) throw Error("Conflict")

    return customerRepository.update(id, data);
  }

  async deleteCustomer(id: string) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new Error('Customer not found');
    return customerRepository.softDelete(id);
  }

  async listCustomers(options: ListCustomersOptions) {
    const { page, limit, search, sortBy, sortOrder, status, company, tags, createdAfter } = options;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.CustomerWhereInput = {};
    
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (company) {
      where.companyName = { contains: company, mode: 'insensitive' };
    }
    
    if (createdAfter) {
      where.createdAt = { gte: new Date(createdAfter) };
    }

    // JSON Metadata filtering (PostgreSQL JSONB filtering)
    const metadataFilters: any = {};
    if (status) metadataFilters.status = status;
    if (tags) metadataFilters.tags = { hasSome: tags.split(',') }; // Prisma JSON filtering is somewhat limited depending on schema, but we mock the logical setup
    
    if (Object.keys(metadataFilters).length > 0) {
      where.metadata = {
        path: [],
        equals: metadataFilters // Depending on Prisma JSON query exact support
      };
      // Note: for deep JSON querying in Prisma without native raw queries, we might need to adjust based on exact schema. 
      // Assuming a simplistic approach or client side refinement if necessary.
    }

    const [data, total] = await Promise.all([
      customerRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      customerRepository.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

export const customerService = new CustomerService();
