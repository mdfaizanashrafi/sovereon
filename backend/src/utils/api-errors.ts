/**
 * ============================================================================
 * CENTRALIZED ERROR HANDLING SYSTEM
 * ============================================================================
 * Standardized API errors with proper typing and HTTP status codes
 */

import { Request, Response, NextFunction } from 'express';
import { ApiErrorCode, HttpStatus } from '../../../shared/dist/constants';

/**
 * Standardized API Error class
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    code: string,
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
      timestamp: this.timestamp,
    };
  }
}

/**
 * Predefined error factories for common scenarios
 */
export const Errors = {
  // Authentication errors
  unauthorized: (message: string = 'Authentication required') =>
    new ApiError(ApiErrorCode.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED),

  forbidden: (message: string = 'Access denied') =>
    new ApiError(ApiErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN),

  invalidCredentials: (message: string = 'Invalid email or password') =>
    new ApiError(
      ApiErrorCode.INVALID_CREDENTIALS,
      message,
      HttpStatus.UNAUTHORIZED
    ),

  tokenExpired: (message: string = 'Token has expired') =>
    new ApiError(ApiErrorCode.TOKEN_EXPIRED, message, HttpStatus.UNAUTHORIZED),

  // Validation errors
  validation: (message: string, details?: Record<string, unknown>) =>
    new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      details
    ),

  invalidInput: (field: string, reason: string) =>
    new ApiError(
      ApiErrorCode.INVALID_INPUT,
      `Invalid input: ${field}`,
      HttpStatus.BAD_REQUEST,
      { field, reason }
    ),

  missingField: (field: string) =>
    new ApiError(
      ApiErrorCode.MISSING_FIELD,
      `Missing required field: ${field}`,
      HttpStatus.BAD_REQUEST,
      { field }
    ),

  // Resource errors
  notFound: (resource: string, id?: string) =>
    new ApiError(
      ApiErrorCode.NOT_FOUND,
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      HttpStatus.NOT_FOUND,
      id ? { resource, id } : { resource }
    ),

  alreadyExists: (resource: string, field: string, value: string) =>
    new ApiError(
      ApiErrorCode.ALREADY_EXISTS,
      `${resource} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
      { resource, field, value }
    ),

  conflict: (message: string) =>
    new ApiError(ApiErrorCode.CONFLICT, message, HttpStatus.CONFLICT),

  // Server errors
  internal: (message: string = 'Internal server error') =>
    new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR
    ),

  database: (message: string = 'Database error') =>
    new ApiError(
      ApiErrorCode.DATABASE_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR
    ),

  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    new ApiError(
      ApiErrorCode.SERVICE_UNAVAILABLE,
      message,
      HttpStatus.SERVICE_UNAVAILABLE
    ),

  // Rate limiting
  rateLimit: (message: string = 'Too many requests') =>
    new ApiError(
      ApiErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      HttpStatus.TOO_MANY_REQUESTS
    ),
};

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Convert unknown error to ApiError
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return Errors.internal(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message
    );
  }

  return Errors.internal();
}

/**
 * Async handler wrapper for Express routes
 * Eliminates need for try-catch in every route handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string | null | undefined,
  fallback: T
): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe JSON stringify with error handling
 */
export function safeJsonStringify<T>(
  data: T,
  fallback: string = '{}'
): string {
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
}
