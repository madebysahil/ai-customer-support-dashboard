import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service';
import { messageService } from '../services/message.service';

export class ChatController {
  async listChats(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await chatService.listActiveChats(req.user!.sub, req.user!.role, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.id;
      // Authorize access
      const hasAccess = await chatService.verifyAccess(chatId, req.user!.sub, req.user!.role);
      if (!hasAccess) {
        return res.status(403).json({ status: 403, detail: 'Forbidden' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.listMessagesForChat(chatId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
