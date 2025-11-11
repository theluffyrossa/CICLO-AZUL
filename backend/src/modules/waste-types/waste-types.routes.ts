import { Router } from 'express';
import { WasteTypesController } from './waste-types.controller';
import { authenticate, isAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import {
  createWasteTypeSchema,
  updateWasteTypeSchema,
  wasteTypeFiltersSchema,
} from './waste-types.validation';

const router = Router();
const wasteTypesController = new WasteTypesController();

router.use(authenticate);

router.post(
  '/',
  isAdmin,
  validate(createWasteTypeSchema),
  asyncHandler(wasteTypesController.create)
);

router.get(
  '/',
  validate(wasteTypeFiltersSchema, 'query'),
  asyncHandler(wasteTypesController.findAll)
);

router.get('/active', asyncHandler(wasteTypesController.findAllActive));

router.get('/:id', asyncHandler(wasteTypesController.findById));

router.put(
  '/:id',
  isAdmin,
  validate(updateWasteTypeSchema),
  asyncHandler(wasteTypesController.update)
);

router.delete('/:id', isAdmin, asyncHandler(wasteTypesController.delete));

export { router as wasteTypesRouter };
