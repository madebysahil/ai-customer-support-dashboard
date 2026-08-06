import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import chatRoutes from './chat.routes';
import ticketRoutes from './ticket.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import knowledgeRoutes from './knowledge.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/chats', chatRoutes);
router.use('/tickets', ticketRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/ai', aiRoutes);

// Additional routes will be mounted here in future phases

export default router;
