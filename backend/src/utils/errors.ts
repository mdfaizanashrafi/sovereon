/**
 * Error Handling Utilities
 * Standardized error classes and response formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * Application-specific error class
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super('VALIDATION_ERROR', message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error for login/auth failures
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'AuthError';
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Standard error codes with HTTP status and messages
 */
export const ErrorCodes = {
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  EMAIL_EXISTS: { status: 409, message: 'Email already exists' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  VALIDATION_ERROR: { status: 400, message: 'Validation error' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
  DATABASE_ERROR: { status: 500, message: 'Database error' },
  RATE_LIMITED: { status: 429, message: 'Too many requests' },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

/**
 * Format successful API response
 */
export function formatResponse<T>(success: boolean, data?: T, error?: any): ApiResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format error API response from AppError
 */
export function formatErrorResponse(error: AppError | Error): ApiResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    };
  }
  
  // Generic error fallback
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON with fallback
 */
export function safeJsonStringify<T>(data: T, fallback: string = '{}'): string {
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
}
