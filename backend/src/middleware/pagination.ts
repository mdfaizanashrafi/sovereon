/**
 * ============================================================================
 * PAGINATION MIDDLEWARE
 * ============================================================================
 * Standardized pagination for list endpoints
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Pagination parameters extracted from query
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Pagination metadata for response
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Default values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from request query
 */
export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Pagination middleware
 * Attaches pagination params to request object
 */
export function paginationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.pagination = parsePagination(req);
  next();
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationParams;
    }
  }
}

export default paginationMiddleware;
