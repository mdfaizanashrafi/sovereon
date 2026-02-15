export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 400
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const ErrorCodes = {
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  EMAIL_EXISTS: { status: 409, message: 'Email already exists' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Access denied' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  VALIDATION_ERROR: { status: 400, message: 'Validation error' },
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
};

export function formatResponse<T>(success: boolean, data?: T, error?: any): ApiResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    timestamp: new Date().toISOString(),
  };
}
