import Joi from 'joi';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

export const createUnitSchema = Joi.object({
  clientId: Joi.string().uuid().required().messages({
    'string.guid': 'Client ID must be a valid UUID',
    'any.required': 'Client ID is required',
  }),
  name: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 200 characters',
    'any.required': 'Name is required',
  }),
  type: Joi.string().max(100).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  zipCode: Joi.string().max(9).optional().allow(''),
  latitude: Joi.number().min(LATITUDE_MIN).max(LATITUDE_MAX).optional(),
  longitude: Joi.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX).optional(),
  responsibleName: Joi.string().max(100).optional().allow(''),
  responsiblePhone: Joi.string().max(20).optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

export const updateUnitSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  type: Joi.string().max(100).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  zipCode: Joi.string().max(9).optional().allow(''),
  latitude: Joi.number().min(LATITUDE_MIN).max(LATITUDE_MAX).optional(),
  longitude: Joi.number().min(LONGITUDE_MIN).max(LONGITUDE_MAX).optional(),
  responsibleName: Joi.string().max(100).optional().allow(''),
  responsiblePhone: Joi.string().max(20).optional().allow(''),
  notes: Joi.string().optional().allow(''),
  active: Joi.boolean().optional(),
});

export const unitFiltersSchema = Joi.object({
  clientId: Joi.string().uuid().optional(),
  search: Joi.string().optional().allow(''),
  active: Joi.boolean().optional(),
  city: Joi.string().optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
