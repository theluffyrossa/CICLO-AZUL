import Joi from 'joi';
import { GravimetricDataSource } from '@shared/types';

const MAX_WEIGHT_KG = 100000;

export const createGravimetricDataSchema = Joi.object({
  collectionId: Joi.string().uuid().required().messages({
    'string.guid': 'Collection ID must be a valid UUID',
    'any.required': 'Collection ID is required',
  }),
  weightKg: Joi.number().min(0).max(MAX_WEIGHT_KG).required().messages({
    'number.min': 'Weight must be non-negative',
    'number.max': `Weight cannot exceed ${MAX_WEIGHT_KG} kg`,
    'any.required': 'Weight is required',
  }),
  source: Joi.string()
    .valid(...Object.values(GravimetricDataSource))
    .required()
    .messages({
      'any.only': 'Invalid data source',
      'any.required': 'Source is required',
    }),
  deviceId: Joi.string().max(100).optional().allow(''),
  metadata: Joi.object().optional(),
});

export const updateGravimetricDataSchema = Joi.object({
  weightKg: Joi.number().min(0).max(MAX_WEIGHT_KG).optional(),
  source: Joi.string()
    .valid(...Object.values(GravimetricDataSource))
    .optional(),
  deviceId: Joi.string().max(100).optional().allow(''),
  metadata: Joi.object().optional(),
});
