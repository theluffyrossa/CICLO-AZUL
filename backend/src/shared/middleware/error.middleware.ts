import { Request, Response, NextFunction } from 'express';
import { ValidationError as JoiValidationError } from 'joi';
import { logger } from '@config/logger.config';
import { sendError, sendValidationError } from '../utils/response.util';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { ValidationError } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

const convertJoiErrors = (error: JoiValidationError): ValidationError[] => {
  return error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));
};

export const errorHandler = (
  error: Error | AppError | JoiValidationError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error.name === 'ValidationError' && 'details' in error) {
    const joiError = error as JoiValidationError;
    const validationErrors = convertJoiErrors(joiError);
    sendValidationError(res, validationErrors);
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode);
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    sendError(res, 'Resource already exists', HTTP_STATUS.CONFLICT);
    return;
  }

  if (error.name === 'SequelizeValidationError') {
    sendError(res, 'Validation error', HTTP_STATUS.UNPROCESSABLE_ENTITY);
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    sendError(res, ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, HTTP_STATUS.NOT_FOUND);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
