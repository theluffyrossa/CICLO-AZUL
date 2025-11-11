import Joi from 'joi';
import { CollectionStatus } from '@shared/types';

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

export const createCollectionSchema = Joi.object({
  clientId: Joi.string().uuid().required().messages({
    'string.guid': 'Client ID must be a valid UUID',
    'any.required': 'Client ID is required',
  }),
  unitId: Joi.string().uuid().required().messages({
    'string.guid': 'Unit ID must be a valid UUID',
    'any.required': 'Unit ID is required',
  }),
  wasteTypeId: Joi.string().uuid().required().messages({
    'string.guid': 'Waste Type ID must be a valid UUID',
    'any.required': 'Waste Type ID is required',
  }),
  userId: Joi.string().uuid().required().messages({
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required',
  }),
  recipientId: Joi.string().uuid().required().messages({
    'string.guid': 'Recipient ID must be a valid UUID',
    'any.required': 'Recipient ID is required',
  }),
  collectionDate: Joi.date().iso().required().messages({
    'date.base': 'Collection date must be a valid date',
    'any.required': 'Collection date is required',
  }),
  status: Joi.string()
    .valid(...Object.values(CollectionStatus))
    .optional(),
  notes: Joi.string().optional().allow(''),
  latitude: Joi.number().min(LATITUDE_MIN).max(LATITUDE_MAX).optional(),
  longitude: Joi.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX).optional(),
});

export const updateCollectionSchema = Joi.object({
  wasteTypeId: Joi.string().uuid().optional(),
  recipientId: Joi.string().uuid().optional(),
  collectionDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(...Object.values(CollectionStatus))
    .optional(),
  notes: Joi.string().optional().allow(''),
  latitude: Joi.number().min(LATITUDE_MIN).max(LATITUDE_MAX).optional(),
  longitude: Joi.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX).optional(),
});

export const collectionFiltersSchema = Joi.object({
  clientId: Joi.string().uuid().optional(),
  unitId: Joi.string().uuid().optional(),
  wasteTypeId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  recipientId: Joi.string().uuid().optional(),
  status: Joi.string()
    .valid(...Object.values(CollectionStatus))
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
