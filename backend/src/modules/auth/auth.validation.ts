import Joi from 'joi';
import { PASSWORD_RULES } from '@shared/constants';

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
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
