import { Request, Response } from 'express';
import { knowledgeService } from '../services/knowledge.service';

export class KnowledgeController {
  list = async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || '';
      const category = req.query.category as string;
      const status = req.query.status as any;
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 20;

      const result = await knowledgeService.listDocuments(query, category, status, skip, take);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      const doc = await knowledgeService.getDocument(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      res.json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      // Assuming req.user is set by auth middleware
      const authorId = (req as any).user?.id || 'system';
      const doc = await knowledgeService.createDocument({
        ...req.body,
        authorId,
      });
      res.status(201).json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const doc = await knowledgeService.updateDocument(req.params.id, req.body);
      res.json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await knowledgeService.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}

export const knowledgeController = new KnowledgeController();
