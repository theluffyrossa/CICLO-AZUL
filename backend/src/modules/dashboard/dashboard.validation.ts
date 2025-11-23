import Joi from 'joi';

export const dashboardFiltersSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  clientId: Joi.string().uuid().optional(),
}).unknown(true);
