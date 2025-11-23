import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate, isClientOrAdmin, ensureOwnClientData } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { dashboardFiltersSchema } from './dashboard.validation';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get(
  '/',
  isClientOrAdmin,
  ensureOwnClientData,
  validate(dashboardFiltersSchema, 'query'),
  asyncHandler(dashboardController.getDashboard)
);

router.get(
  '/my-waste-types',
  isClientOrAdmin,
  asyncHandler(dashboardController.getMyWasteTypes)
);

router.get(
  '/export/pdf',
  isClientOrAdmin,
  ensureOwnClientData,
  validate(dashboardFiltersSchema, 'query'),
  asyncHandler(dashboardController.exportPDF)
);

router.get(
  '/export/csv',
  isClientOrAdmin,
  ensureOwnClientData,
  validate(dashboardFiltersSchema, 'query'),
  asyncHandler(dashboardController.exportCSV)
);

export { router as dashboardRouter };
