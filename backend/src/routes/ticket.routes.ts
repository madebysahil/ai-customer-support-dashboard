import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import { createTicketSchema, updateTicketSchema, addCommentSchema } from '../validators/ticket.validator';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createTicketSchema), ticketController.create);
router.get('/', ticketController.list);
router.get('/:id', ticketController.get);
router.patch('/:id', validate(updateTicketSchema), ticketController.update);
router.post('/:id/comments', validate(addCommentSchema), ticketController.addComment);

export default router;
