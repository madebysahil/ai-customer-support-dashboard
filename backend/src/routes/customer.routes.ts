import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/requireAuth';
import { requireAccess } from '../middleware/requireAccess';
import { 
  createCustomerSchema, 
  updateCustomerSchema, 
  getCustomerSchema, 
  listCustomersSchema 
} from '../validators/customer.validator';

const router = Router();

// Protect all customer routes
router.use(requireAuth);

const canModify = requireAccess({ roles: ['ADMINISTRATOR', 'MANAGER', 'SUPPORT_AGENT'] });
const canRead = requireAccess({ roles: ['ADMINISTRATOR', 'MANAGER', 'SUPPORT_AGENT'] }); // Modify as needed

router.post('/', canModify, validate(createCustomerSchema), customerController.create);
router.get('/', canRead, validate(listCustomersSchema), customerController.list);
router.get('/:id', canRead, validate(getCustomerSchema), customerController.get);
router.patch('/:id', canModify, validate(updateCustomerSchema), customerController.update);
router.delete('/:id', canModify, validate(getCustomerSchema), customerController.delete);

export default router;
