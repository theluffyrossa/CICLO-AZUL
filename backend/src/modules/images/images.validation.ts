import Joi from 'joi';

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

export const createImageSchema = Joi.object({
  collectionId: Joi.string().uuid().required().messages({
    'string.guid': 'Collection ID must be a valid UUID',
    'any.required': 'Collection ID is required',
  }),
  latitude: Joi.number().min(LATITUDE_MIN).max(LATITUDE_MAX).optional(),
  longitude: Joi.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX).optional(),
  capturedAt: Joi.date().iso().optional(),
  deviceInfo: Joi.string().max(100).optional().allow(''),
  consentGiven: Joi.boolean().required().messages({
    'any.required': 'LGPD consent is required',
  }),
  description: Joi.string().optional().allow(''),
});

export const updateImageSchema = Joi.object({
  consentGiven: Joi.boolean().optional(),
  description: Joi.string().optional().allow(''),
});

export const imageFiltersSchema = Joi.object({
  collectionId: Joi.string().uuid().optional(),
  consentGiven: Joi.boolean().optional(),
});
