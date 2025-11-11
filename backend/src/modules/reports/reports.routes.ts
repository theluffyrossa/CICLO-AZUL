import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { reportFiltersSchema } from './reports.validation';

const router = Router();
const reportsController = new ReportsController();

router.use(authenticate);

router.get(
  '/export',
  validate(reportFiltersSchema, 'query'),
  asyncHandler(reportsController.export)
);

export { router as reportsRouter };
