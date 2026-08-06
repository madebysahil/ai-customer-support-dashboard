import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// In a real production app, add role authorization specifically for MANAGER/ADMINISTRATOR here
router.use(requireAuth); 

router.get('/ai', analyticsController.getAiMetrics);

export default router;
