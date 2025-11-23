import Joi from 'joi';
import { PASSWORD_RULES } from '@shared/constants';

export const loginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Username must contain only alphanumeric characters',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 50 characters',
      'any.required': 'Username is required',
    }),
  password: Joi.string()
    .min(PASSWORD_RULES.MIN_LENGTH)
    .required()
    .messages({
      'string.min': `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`,
      'any.required': 'Password is required',
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
    }),
});
