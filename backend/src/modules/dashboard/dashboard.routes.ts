import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { dashboardFiltersSchema } from './dashboard.validation';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get(
  '/',
  validate(dashboardFiltersSchema, 'query'),
  asyncHandler(dashboardController.getDashboard)
);

export { router as dashboardRouter };
