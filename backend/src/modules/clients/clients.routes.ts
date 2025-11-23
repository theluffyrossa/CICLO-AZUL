import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate, isAdmin, isClientOrAdmin, ensureOwnClientData } from '@shared/middleware/auth.middleware';
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
  isClientOrAdmin,
  validate(clientFiltersSchema, 'query'),
  asyncHandler(clientsController.findAll)
);

router.get('/me', isClientOrAdmin, asyncHandler(clientsController.getMyProfile));

router.get(
  '/:id',
  isClientOrAdmin,
  ensureOwnClientData,
  asyncHandler(clientsController.findById)
);

router.get(
  '/:id/waste-types',
  isClientOrAdmin,
  ensureOwnClientData,
  asyncHandler(clientsController.getClientWasteTypes)
);

router.put(
  '/:id',
  isAdmin,
  validate(updateClientSchema),
  asyncHandler(clientsController.update)
);

router.delete('/:id', isAdmin, asyncHandler(clientsController.delete));

export { router as clientsRouter };
