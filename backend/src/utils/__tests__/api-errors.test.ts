/**
 * ============================================================================
 * API ERRORS TESTS (Backend)
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { ApiError, Errors, isApiError, toApiError, asyncHandler } from '../api-errors';
// Use inline constants to avoid module resolution issues in tests
const HttpStatus = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

describe('ApiError', () => {
  it('creates error with all properties', () => {
    const error = new ApiError(
      'TEST_CODE',
      'Test message',
      HttpStatus.BAD_REQUEST,
      { field: 'test' }
    );

    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(error.details).toEqual({ field: 'test' });
    expect(error.timestamp).toBeDefined();
  });

  it('serializes to JSON correctly', () => {
    const error = new ApiError('TEST', 'Test message', HttpStatus.OK);
    const json = error.toJSON();

    expect(json.success).toBe(false);
    expect(json.error.code).toBe('TEST');
    expect(json.error.message).toBe('Test message');
    expect(json.timestamp).toBe(error.timestamp);
  });
});

describe('Error Factories', () => {
  it('creates unauthorized error', () => {
    const error = Errors.unauthorized();
    expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('creates not found error', () => {
    const error = Errors.notFound('User', '123');
    expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(error.message).toContain('User');
    expect(error.message).toContain('123');
  });

  it('creates validation error', () => {
    const error = Errors.validation('Invalid input', { field: 'email' });
    expect(error.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(error.details).toEqual({ field: 'email' });
  });

  it('creates internal error', () => {
    const error = Errors.internal('Database connection failed');
    expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(error.message).toBe('Database connection failed');
  });

  it('creates rate limit error', () => {
    const error = Errors.rateLimit();
    expect(error.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
  });
});

describe('isApiError', () => {
  it('returns true for ApiError', () => {
    expect(isApiError(new ApiError('TEST', 'Test'))).toBe(true);
  });

  it('returns false for regular Error', () => {
    expect(isApiError(new Error('Test'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isApiError(null)).toBe(false);
  });
});

describe('toApiError', () => {
  it('returns same ApiError instance', () => {
    const error = new ApiError('TEST', 'Test');
    expect(toApiError(error)).toBe(error);
  });

  it('converts Error to ApiError', () => {
    const error = toApiError(new Error('Something went wrong'));
    expect(isApiError(error)).toBe(true);
  });
});

describe('asyncHandler', () => {
  it('should call next with error when promise rejects', async () => {
    const mockError = new Error('Test error');
    const mockFn = () => Promise.reject(mockError);
    const next = vi.fn();

    const handler = asyncHandler(mockFn);
    await handler({} as any, {} as any, next);

    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should not call next when promise resolves', async () => {
    const mockFn = () => Promise.resolve();
    const next = vi.fn();

    const handler = asyncHandler(mockFn);
    await handler({} as any, {} as any, next);

    expect(next).not.toHaveBeenCalled();
  });
});
