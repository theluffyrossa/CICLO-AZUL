import { Router } from 'express';
import { CollectionsController } from './collections.controller';
import { authenticate, isClientOrAdmin, ensureOwnClientData, isAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionFiltersSchema,
  rejectCollectionSchema,
} from './collections.validation';

const router = Router();
const collectionsController = new CollectionsController();

router.use(authenticate);

router.post(
  '/',
  isClientOrAdmin,
  ensureOwnClientData,
  validate(createCollectionSchema),
  asyncHandler(collectionsController.create)
);

router.get(
  '/',
  isClientOrAdmin,
  ensureOwnClientData,
  validate(collectionFiltersSchema, 'query'),
  asyncHandler(collectionsController.findAll)
);

router.get(
  '/:id',
  isClientOrAdmin,
  asyncHandler(collectionsController.findById)
);

router.put(
  '/:id',
  isClientOrAdmin,
  ensureOwnClientData,
  validate(updateCollectionSchema),
  asyncHandler(collectionsController.update)
);

router.delete(
  '/:id',
  isClientOrAdmin,
  asyncHandler(collectionsController.delete)
);

router.get(
  '/pending/list',
  isAdmin,
  asyncHandler(collectionsController.getPendingCollections)
);

router.patch(
  '/:id/approve',
  isAdmin,
  asyncHandler(collectionsController.approveCollection)
);

router.patch(
  '/:id/reject',
  isAdmin,
  validate(rejectCollectionSchema),
  asyncHandler(collectionsController.rejectCollection)
);

export { router as collectionsRouter };
