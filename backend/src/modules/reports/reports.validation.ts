import Joi from 'joi';
import { CollectionStatus } from '@shared/types';

export const reportFiltersSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  clientId: Joi.string().uuid().optional(),
  unitId: Joi.string().uuid().optional(),
  wasteTypeId: Joi.string().uuid().optional(),
  status: Joi.string()
    .valid(...Object.values(CollectionStatus))
    .optional(),
  format: Joi.string().valid('csv', 'xlsx').optional().default('xlsx'),
});
