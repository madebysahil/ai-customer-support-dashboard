import { Router } from 'express';
import { knowledgeController } from '../controllers/knowledge.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', knowledgeController.list);
router.post('/', knowledgeController.create);
router.get('/:id', knowledgeController.get);
router.patch('/:id', knowledgeController.update);
router.delete('/:id', knowledgeController.delete);

export default router;
