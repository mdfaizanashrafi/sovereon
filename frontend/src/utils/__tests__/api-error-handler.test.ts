/**
 * ============================================================================
 * API ERROR HANDLER TESTS
 * ============================================================================
 * Tests for centralized error handling utilities
 */

import { describe, it, expect } from 'vitest';
import {
  ApiError,
  Errors,
  isApiError,
  toApiError,
  safeJsonParse,
  safeJsonStringify,
} from '../api-errors';

describe('ApiError', () => {
  it('creates error with correct properties', () => {
    const error = new ApiError('TEST_CODE', 'Test message', 400, { field: 'test' });

    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: 'test' });
    expect(error.timestamp).toBeDefined();
  });

  it('serializes to JSON correctly', () => {
    const error = new ApiError('TEST', 'Test', 500);
    const json = error.toJSON();

    expect(json.success).toBe(false);
    expect(json.error.code).toBe('TEST');
    expect(json.error.message).toBe('Test');
    expect(json.timestamp).toBe(error.timestamp);
  });
});

describe('Error Factories', () => {
  it('creates unauthorized error', () => {
    const error = Errors.unauthorized();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('creates not found error with resource', () => {
    const error = Errors.notFound('User', '123');
    expect(error.statusCode).toBe(404);
    expect(error.message).toContain('User');
    expect(error.message).toContain('123');
  });

  it('creates validation error with details', () => {
    const error = Errors.validation('Invalid input', { field: 'email' });
    expect(error.statusCode).toBe(422);
    expect(error.details).toEqual({ field: 'email' });
  });
});

describe('isApiError', () => {
  it('returns true for ApiError instance', () => {
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
    expect(error.message).toBe('Something went wrong');
  });

  it('handles unknown errors', () => {
    const error = toApiError('string error');
    expect(isApiError(error)).toBe(true);
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"key": "value"}', {})).toEqual({ key: 'value' });
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('invalid', { default: true })).toEqual({ default: true });
  });

  it('returns fallback for null/undefined', () => {
    expect(safeJsonParse(null, [])).toEqual([]);
    expect(safeJsonParse(undefined, [])).toEqual([]);
  });
});

describe('safeJsonStringify', () => {
  it('stringifies valid object', () => {
    expect(safeJsonStringify({ key: 'value' })).toBe('{"key":"value"}');
  });

  it('returns fallback for circular reference', () => {
    const obj: any = { a: 1 };
    obj.circular = obj;
    expect(safeJsonStringify(obj, '{}')).toBe('{}');
  });
});
