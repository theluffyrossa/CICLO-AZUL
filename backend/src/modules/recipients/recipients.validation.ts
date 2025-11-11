import Joi from 'joi';
import { RecipientType } from '@shared/types';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const createRecipientSchema = Joi.object({
  name: Joi.string().min(3).max(255).required().messages({
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 255 characters',
    'any.required': 'Name is required',
  }),
  type: Joi.string().valid(...Object.values(RecipientType)).required().messages({
    'any.only': 'Invalid recipient type',
    'any.required': 'Recipient type is required',
  }),
  document: Joi.string().max(20).optional().allow(''),
  secondaryDocument: Joi.string().max(20).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  zipCode: Joi.string().max(10).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(255).optional().allow(''),
  responsibleName: Joi.string().max(255).optional().allow(''),
  responsiblePhone: Joi.string().max(20).optional().allow(''),
  notes: Joi.string().optional().allow(''),
  acceptedWasteTypes: Joi.array().items(Joi.string().uuid()).optional(),
});

export const updateRecipientSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional(),
  type: Joi.string().valid(...Object.values(RecipientType)).optional(),
  document: Joi.string().max(20).optional().allow(''),
  secondaryDocument: Joi.string().max(20).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  zipCode: Joi.string().max(10).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(255).optional().allow(''),
  responsibleName: Joi.string().max(255).optional().allow(''),
  responsiblePhone: Joi.string().max(20).optional().allow(''),
  notes: Joi.string().optional().allow(''),
  acceptedWasteTypes: Joi.array().items(Joi.string().uuid()).optional(),
  active: Joi.boolean().optional(),
});

export const recipientFiltersSchema = Joi.object({
  search: Joi.string().optional().allow(''),
  type: Joi.string().valid(...Object.values(RecipientType)).optional(),
  active: Joi.boolean().optional(),
  city: Joi.string().optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
