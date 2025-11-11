import { Router } from 'express';
import { RecipientsController } from './recipients.controller';
import { authenticate, isAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { createRecipientSchema, updateRecipientSchema, recipientFiltersSchema } from './recipients.validation';

const router = Router();
const recipientsController = new RecipientsController();

router.use(authenticate);

router.post('/', isAdmin, validate(createRecipientSchema), asyncHandler(recipientsController.create));

router.get('/', validate(recipientFiltersSchema, 'query'), asyncHandler(recipientsController.findAll));

router.get('/active', asyncHandler(recipientsController.findActive));

router.get('/:id', asyncHandler(recipientsController.findById));

router.put('/:id', isAdmin, validate(updateRecipientSchema), asyncHandler(recipientsController.update));

router.delete('/:id', isAdmin, asyncHandler(recipientsController.delete));

export { router as recipientsRouter };
