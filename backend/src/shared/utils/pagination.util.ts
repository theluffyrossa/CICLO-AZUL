import { PaginationParams, PaginatedResponse } from '../types';
import { PAGINATION } from '../constants';

export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): PaginationParams => {
  const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const validPage = parsedPage && parsedPage > 0 ? parsedPage : PAGINATION.DEFAULT_PAGE;
  const validLimit =
    parsedLimit && parsedLimit > 0 && parsedLimit <= PAGINATION.MAX_LIMIT
      ? parsedLimit
      : PAGINATION.DEFAULT_LIMIT;

  const offset = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    offset,
  };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
    },
  };
};
