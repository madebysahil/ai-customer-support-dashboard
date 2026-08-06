import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export class NotificationController {
  async getInbox(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [data, total] = await Promise.all([
        prisma.notification.findMany({
          where: { 
            recipientId: userId,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.notification.count({ where: { recipientId: userId } })
      ]);

      res.status(200).json({ data, meta: { total, page: Number(page) } });
    } catch (e) {
      next(e);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await prisma.notification.count({
        where: { 
          recipientId: req.user!.sub, 
          isRead: false,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
        }
      });
      res.status(200).json({ data: { count } });
    } catch (e) {
      next(e);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { id: req.params.id, recipientId: req.user!.sub },
        data: { isRead: true }
      });
      res.status(200).json({ status: 'ok' });
    } catch (e) {
      next(e);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.notification.updateMany({
        where: { recipientId: req.user!.sub, isRead: false },
        data: { isRead: true }
      });
      res.status(200).json({ status: 'ok' });
    } catch (e) {
      next(e);
    }
  }
}

export const notificationController = new NotificationController();
