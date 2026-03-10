/**
 * ============================================================================
 * FRONTEND API ERROR HANDLING
 * ============================================================================
 * Standardized error handling for API calls
 */

// ============================================================================
// API ERROR CLASS
// ============================================================================

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ApiError);
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

// ============================================================================
// ERROR FACTORIES
// ============================================================================

export const Errors = {
  unauthorized: (message: string = 'Authentication required') =>
    new ApiError('UNAUTHORIZED', message, 401),

  forbidden: (message: string = 'Access denied') =>
    new ApiError('FORBIDDEN', message, 403),

  notFound: (resource: string, id?: string) =>
    new ApiError(
      'NOT_FOUND',
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      id ? { resource, id } : { resource }
    ),

  validation: (message: string, details?: Record<string, unknown>) =>
    new ApiError('VALIDATION_ERROR', message, 422, details),

  server: (message: string = 'Internal server error') =>
    new ApiError('INTERNAL_ERROR', message, 500),

  network: (message: string = 'Network error') =>
    new ApiError('NETWORK_ERROR', message, 0),
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError('UNKNOWN_ERROR', error.message, 500);
  }

  return new ApiError('UNKNOWN_ERROR', 'An unknown error occurred', 500);
}

// ============================================================================
// API RESPONSE HANDLER
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || `HTTP ${response.status}`,
      response.status,
      data.error?.details
    );
  }

  return data.data as T;
}

// ============================================================================
// SAFE JSON UTILITIES
// ============================================================================

export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify<T>(data: T, fallback: string = '{}'): string {
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
}

// ============================================================================
// ERROR MESSAGES FOR USERS
// ============================================================================

export function getUserFriendlyErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 'Please sign in to continue';
      case 'FORBIDDEN':
        return 'You do not have permission to do this';
      case 'NOT_FOUND':
        return 'The requested item was not found';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please try again later';
      case 'NETWORK_ERROR':
        return 'Connection failed. Please check your internet';
      default:
        return 'Something went wrong. Please try again';
    }
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection';
  }

  return 'An unexpected error occurred';
}
