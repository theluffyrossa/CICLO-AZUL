import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendValidationError } from '../utils/response.util';
import { ValidationError } from '../types';

type ValidationSource = 'body' | 'query' | 'params';

const convertJoiErrors = (error: Joi.ValidationError): ValidationError[] => {
  return error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));
};

export const validate = (schema: Joi.ObjectSchema, source: ValidationSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors = convertJoiErrors(error);
      sendValidationError(res, validationErrors);
      return;
    }

    req[source] = value;
    next();
  };
};
