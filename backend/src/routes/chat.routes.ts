import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', chatController.listChats);
router.get('/:id/messages', chatController.listMessages);

export default router;
