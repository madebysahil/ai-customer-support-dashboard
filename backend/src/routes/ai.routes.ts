import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireAccess } from '../middleware/requireAccess';

const router = Router();

// Copilot workspace endpoint for streaming responses
router.post('/stream', requireAuth, requireAccess({ roles: ['ADMINISTRATOR', 'MANAGER', 'SUPPORT_AGENT'] }), aiController.stream);

export default router;
