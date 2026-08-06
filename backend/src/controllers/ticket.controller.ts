import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';

export class TicketController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.createTicket(req.body);
      res.status(201).json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketRepository } = require('../repositories/ticket.repository'); // inline to avoid circular if any
      const ticket = await ticketRepository.findById(req.params.id);
      if (!ticket) return res.status(404).json({ error: 'Not found' });
      res.status(200).json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketService.listTickets(req.query);
      res.status(200).json(result); // result already has { data, meta }
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user!.sub);
      res.status(200).json({ data: ticket });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, isInternal } = req.body;
      const comment = await ticketService.addComment(req.params.id, content, req.user!.sub, isInternal);
      res.status(201).json({ data: comment });
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
