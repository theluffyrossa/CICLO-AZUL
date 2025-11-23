import Joi from 'joi';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const documentPattern = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2})$/;

export const createClientSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 200 characters',
    'any.required': 'Name is required',
  }),
  document: Joi.string().pattern(documentPattern).required().messages({
    'string.pattern.base': 'Document must be a valid CNPJ or CPF format',
    'any.required': 'Document is required',
  }),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(255).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  zipCode: Joi.string().max(9).optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  document: Joi.string().pattern(documentPattern).optional(),
  phone: Joi.string().max(20).optional().allow(''),
  email: Joi.string().email().max(255).optional().allow(''),
  address: Joi.string().max(255).optional().allow(''),
  city: Joi.string().max(100).optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  zipCode: Joi.string().max(9).optional().allow(''),
  notes: Joi.string().optional().allow(''),
  active: Joi.boolean().optional(),
});

export const clientFiltersSchema = Joi.object({
  search: Joi.string().optional().allow(''),
  active: Joi.boolean().optional(),
  city: Joi.string().optional().allow(''),
  state: Joi.string().valid(...BRAZILIAN_STATES).optional().allow(''),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(10000).optional(),
});
