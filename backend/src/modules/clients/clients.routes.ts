import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate, isAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import {
  createClientSchema,
  updateClientSchema,
  clientFiltersSchema,
} from './clients.validation';

const router = Router();
const clientsController = new ClientsController();

router.use(authenticate);

router.post(
  '/',
  isAdmin,
  validate(createClientSchema),
  asyncHandler(clientsController.create)
);

router.get(
  '/',
  validate(clientFiltersSchema, 'query'),
  asyncHandler(clientsController.findAll)
);

router.get('/:id', asyncHandler(clientsController.findById));

router.put(
  '/:id',
  isAdmin,
  validate(updateClientSchema),
  asyncHandler(clientsController.update)
);

router.delete('/:id', isAdmin, asyncHandler(clientsController.delete));

export { router as clientsRouter };
