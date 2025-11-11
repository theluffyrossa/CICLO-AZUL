import { Router } from 'express';
import { CollectionsController } from './collections.controller';
import { authenticate, isOperatorOrAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionFiltersSchema,
} from './collections.validation';

const router = Router();
const collectionsController = new CollectionsController();

router.use(authenticate);

router.post(
  '/',
  isOperatorOrAdmin,
  validate(createCollectionSchema),
  asyncHandler(collectionsController.create)
);

router.get(
  '/',
  validate(collectionFiltersSchema, 'query'),
  asyncHandler(collectionsController.findAll)
);

router.get('/:id', asyncHandler(collectionsController.findById));

router.put(
  '/:id',
  isOperatorOrAdmin,
  validate(updateCollectionSchema),
  asyncHandler(collectionsController.update)
);

router.delete('/:id', isOperatorOrAdmin, asyncHandler(collectionsController.delete));

export { router as collectionsRouter };
