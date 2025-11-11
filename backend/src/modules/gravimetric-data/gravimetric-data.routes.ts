import { Router } from 'express';
import { GravimetricDataController } from './gravimetric-data.controller';
import { authenticate, isOperatorOrAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import {
  createGravimetricDataSchema,
  updateGravimetricDataSchema,
} from './gravimetric-data.validation';

const router = Router();
const gravimetricDataController = new GravimetricDataController();

router.use(authenticate);

router.post(
  '/',
  isOperatorOrAdmin,
  validate(createGravimetricDataSchema),
  asyncHandler(gravimetricDataController.create)
);

router.post('/import-csv', isOperatorOrAdmin, asyncHandler(gravimetricDataController.importCsv));

router.post('/api-input', isOperatorOrAdmin, asyncHandler(gravimetricDataController.createFromApi));

router.get('/collection/:collectionId', asyncHandler(gravimetricDataController.findByCollection));

router.get('/:id', asyncHandler(gravimetricDataController.findById));

router.put(
  '/:id',
  isOperatorOrAdmin,
  validate(updateGravimetricDataSchema),
  asyncHandler(gravimetricDataController.update)
);

router.delete('/:id', isOperatorOrAdmin, asyncHandler(gravimetricDataController.delete));

export { router as gravimetricDataRouter };
