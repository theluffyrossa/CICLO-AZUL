import Joi from 'joi';
import { WasteCategory } from '@shared/types';

export const createWasteTypeSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  category: Joi.string()
    .valid(...Object.values(WasteCategory))
    .required()
    .messages({
      'any.only': 'Invalid waste category',
      'any.required': 'Category is required',
    }),
  description: Joi.string().optional().allow(''),
  unit: Joi.string().max(50).optional().allow(''),
});

export const updateWasteTypeSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  category: Joi.string()
    .valid(...Object.values(WasteCategory))
    .optional(),
  description: Joi.string().optional().allow(''),
  unit: Joi.string().max(50).optional().allow(''),
  active: Joi.boolean().optional(),
});

export const wasteTypeFiltersSchema = Joi.object({
  category: Joi.string()
    .valid(...Object.values(WasteCategory))
    .optional(),
  active: Joi.boolean().optional(),
  search: Joi.string().optional().allow(''),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
