/**
 * ============================================================================
 * GLOBAL ERROR HANDLING MIDDLEWARE
 * ============================================================================
 * Centralized error handling for Express application
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError, toApiError } from '../utils/api-errors';
import { HttpStatus } from '../../../shared/dist/constants';

/**
 * Global error handler middleware
 * Must be registered AFTER all routes
 */
export function globalErrorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Convert to ApiError if needed
  const error = isApiError(err) ? err : toApiError(err);

  // Log error details
  logError(error, req);

  // Send response
  res.status(error.statusCode).json(error.toJSON());
}

/**
 * Not found handler for undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log error with context
 */
function logError(error: ApiError, req: Request): void {
  const logData = {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: error.timestamp,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };

  // Log to console (can be replaced with proper logging service)
  if (error.statusCode >= 500) {
    console.error('[API Error]', logData);
  } else if (error.statusCode >= 400) {
    console.warn('[API Warning]', logData);
  } else {
    console.log('[API Info]', logData);
  }
}

/**
 * Unhandled rejection handler for process
 */
export function setupUnhandledRejectionHandler(): void {
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[Unhandled Rejection]', reason);
    // In production, you might want to restart the process gracefully
    if (process.env.NODE_ENV === 'production') {
      // Give time for logs to flush before exiting
      setTimeout(() => process.exit(1), 1000);
    }
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('[Uncaught Exception]', error);
    // Always exit on uncaught exceptions
    setTimeout(() => process.exit(1), 1000);
  });
}
