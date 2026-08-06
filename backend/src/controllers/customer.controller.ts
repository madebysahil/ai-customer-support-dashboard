import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';

export class CustomerController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.getCustomer(req.params.id);
      res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // The query object is already validated and typed by Zod middleware
      const result = await customerService.listCustomers(req.query as any);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { version, ...updateData } = req.body;
      const customer = await customerService.updateCustomer(req.params.id, updateData, version);
      res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await customerService.deleteCustomer(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
