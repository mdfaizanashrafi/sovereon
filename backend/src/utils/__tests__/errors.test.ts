/**
 * ============================================================================
 * ERRORS UTILITIES TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  ErrorCodes,
  formatResponse,
  formatErrorResponse,
  safeJsonParse,
  safeJsonStringify,
} from '../errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('CUSTOM_ERROR', 'Something went wrong', 400);

      expect(error.code).toBe('CUSTOM_ERROR');
      expect(error.message).toBe('Something went wrong');
      expect(error.status).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should use default status of 400', () => {
      const error = new AppError('ERROR', 'Message');

      expect(error.status).toBe(400);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with default message', () => {
      const error = new ValidationError();

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(error.status).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should create validation error with custom message', () => {
      const error = new ValidationError('Email is required');

      expect(error.message).toBe('Email is required');
    });
  });

  describe('AuthError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthError();

      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Authentication failed');
      expect(error.status).toBe(401);
      expect(error.name).toBe('AuthError');
    });

    it('should create auth error with custom message', () => {
      const error = new AuthError('Token expired');

      expect(error.message).toBe('Token expired');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default resource', () => {
      const error = new NotFoundError();

      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Resource not found');
      expect(error.status).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create not found error with custom resource', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
    });
  });
});

describe('ErrorCodes', () => {
  it('should have all standard error codes', () => {
    expect(ErrorCodes.INVALID_CREDENTIALS).toEqual({
      status: 401,
      message: 'Invalid email or password',
    });
    expect(ErrorCodes.EMAIL_EXISTS).toEqual({
      status: 409,
      message: 'Email already exists',
    });
    expect(ErrorCodes.NOT_FOUND).toEqual({
      status: 404,
      message: 'Resource not found',
    });
  });

  it('should have all error codes defined', () => {
    const expectedCodes = [
      'INVALID_CREDENTIALS',
      'EMAIL_EXISTS',
      'USER_NOT_FOUND',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'VALIDATION_ERROR',
      'INTERNAL_ERROR',
      'DATABASE_ERROR',
      'RATE_LIMITED',
    ];

    expectedCodes.forEach(code => {
      expect(ErrorCodes).toHaveProperty(code);
      expect(ErrorCodes[code as keyof typeof ErrorCodes]).toHaveProperty('status');
      expect(ErrorCodes[code as keyof typeof ErrorCodes]).toHaveProperty('message');
    });
  });
});

describe('formatResponse', () => {
  it('should format success response with data', () => {
    const data = { id: '1', name: 'Test' };
    const response = formatResponse(true, data);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response).toHaveProperty('timestamp');
  });

  it('should format error response with error details', () => {
    const error = { code: 'ERROR', message: 'Something failed' };
    const response = formatResponse(false, undefined, error);

    expect(response.success).toBe(false);
    expect(response.error).toEqual(error);
    expect(response).toHaveProperty('timestamp');
  });

  it('should include both data and error when provided', () => {
    const data = { partial: true };
    const error = { code: 'PARTIAL_ERROR', message: 'Partial failure' };
    const response = formatResponse(true, data, error);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.error).toEqual(error);
  });

  it('should generate ISO timestamp', () => {
    const before = Date.now();
    const response = formatResponse(true, {});
    const after = Date.now();
    const responseTime = new Date(response.timestamp).getTime();

    expect(responseTime).toBeGreaterThanOrEqual(before);
    expect(responseTime).toBeLessThanOrEqual(after);
  });
});

describe('formatErrorResponse', () => {
  it('should format AppError response', () => {
    const error = new AppError('CUSTOM_ERROR', 'Custom error message', 422);
    const response = formatErrorResponse(error);

    expect(response.success).toBe(false);
    expect(response.error).toEqual({
      code: 'CUSTOM_ERROR',
      message: 'Custom error message',
    });
  });

  it('should format generic Error response', () => {
    const error = new Error('Generic error');
    const response = formatErrorResponse(error);

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('INTERNAL_ERROR');
    expect(response.error?.message).toBe('Generic error');
  });

  it('should hide detailed message in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Sensitive details');
    const response = formatErrorResponse(error);

    expect(response.error?.message).toBe('Internal server error');

    process.env.NODE_ENV = originalEnv;
  });
});

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    const json = '{"key": "value", "number": 123}';
    const result = safeJsonParse(json, {});

    expect(result).toEqual({ key: 'value', number: 123 });
  });

  it('should return fallback for invalid JSON', () => {
    const fallback = { default: true };
    const result = safeJsonParse('invalid json', fallback);

    expect(result).toBe(fallback);
  });

  it('should return fallback for null input', () => {
    const fallback = { default: true };
    const result = safeJsonParse(null as any, fallback);

    expect(result).toBe(fallback);
  });

  it('should return fallback for undefined input', () => {
    const fallback = { default: true };
    const result = safeJsonParse(undefined as any, fallback);

    expect(result).toBe(fallback);
  });

  it('should return fallback for empty string', () => {
    const fallback = { default: true };
    const result = safeJsonParse('', fallback);

    expect(result).toBe(fallback);
  });
});

describe('safeJsonStringify', () => {
  it('should stringify valid object', () => {
    const obj = { key: 'value', number: 123 };
    const result = safeJsonStringify(obj);

    expect(result).toBe('{"key":"value","number":123}');
  });

  it('should return fallback for circular reference', () => {
    const obj: any = { key: 'value' };
    obj.circular = obj;

    const result = safeJsonStringify(obj, '{}');

    expect(result).toBe('{}');
  });

  it('should use default fallback', () => {
    const obj: any = { key: 'value' };
    obj.circular = obj;

    const result = safeJsonStringify(obj);

    expect(result).toBe('{}');
  });

  it('should stringify arrays', () => {
    const arr = [1, 2, 3];
    const result = safeJsonStringify(arr);

    expect(result).toBe('[1,2,3]');
  });

  it('should stringify primitives', () => {
    expect(safeJsonStringify('string')).toBe('"string"');
    expect(safeJsonStringify(123)).toBe('123');
    expect(safeJsonStringify(true)).toBe('true');
    expect(safeJsonStringify(null)).toBe('null');
  });
});
