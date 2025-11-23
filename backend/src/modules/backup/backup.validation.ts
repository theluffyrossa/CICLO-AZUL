import Joi from 'joi';

export const restoreBackupSchema = Joi.object({
  filename: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9-_.]+\.(sql|sql\.gz)$/)
    .messages({
      'string.pattern.base': 'Invalid filename format',
      'any.required': 'Filename is required',
    }),
  createSafetyBackup: Joi.boolean().optional().default(true),
});

export const deleteBackupSchema = Joi.object({
  filename: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9-_.]+\.(sql|sql\.gz)$/)
    .messages({
      'string.pattern.base': 'Invalid filename format',
      'any.required': 'Filename is required',
    }),
});
