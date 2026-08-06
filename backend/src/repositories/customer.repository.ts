import { prisma } from '../utils/prisma';
import { Prisma, Customer } from '@prisma/client';

export class CustomerRepository {
  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findMany(args: Prisma.CustomerFindManyArgs): Promise<Customer[]> {
    // Inject soft delete check automatically
    return prisma.customer.findMany({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async count(args: Prisma.CustomerCountArgs): Promise<number> {
    return prisma.customer.count({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const customerRepository = new CustomerRepository();
