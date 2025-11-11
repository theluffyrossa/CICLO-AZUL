import { Router } from 'express';
import { UnitsController } from './units.controller';
import { authenticate, isAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { createUnitSchema, updateUnitSchema, unitFiltersSchema } from './units.validation';

const router = Router();
const unitsController = new UnitsController();

router.use(authenticate);

router.post('/', isAdmin, validate(createUnitSchema), asyncHandler(unitsController.create));

router.get('/', validate(unitFiltersSchema, 'query'), asyncHandler(unitsController.findAll));

router.get('/client/:clientId', asyncHandler(unitsController.findByClient));

router.get('/:id', asyncHandler(unitsController.findById));

router.put('/:id', isAdmin, validate(updateUnitSchema), asyncHandler(unitsController.update));

router.delete('/:id', isAdmin, asyncHandler(unitsController.delete));

export { router as unitsRouter };
