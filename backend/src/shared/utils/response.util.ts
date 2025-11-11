import { Response } from 'express';
import { ApiResponse, ValidationError } from '../types';
import { HTTP_STATUS } from '../constants';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message?: string): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: ValidationError[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: ValidationError[],
  message: string = 'Validation failed'
): Response => {
  return sendError(res, message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
};

export const sendBadRequest = (res: Response, message: string): Response => {
  return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
};

export const sendUnauthorized = (res: Response, message: string): Response => {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
};

export const sendForbidden = (res: Response, message: string): Response => {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN);
};

export const sendNotFound = (res: Response, message: string): Response => {
  return sendError(res, message, HTTP_STATUS.NOT_FOUND);
};

export const sendConflict = (res: Response, message: string): Response => {
  return sendError(res, message, HTTP_STATUS.CONFLICT);
};
