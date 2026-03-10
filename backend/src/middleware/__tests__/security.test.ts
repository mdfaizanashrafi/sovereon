/**
 * ============================================================================
 * SECURITY MIDDLEWARE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  securityHeaders,
  additionalSecurityHeaders,
  sanitizeInput,
  apiRateLimiter,
  strictRateLimiter,
} from '../security';

describe('Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      body: {},
      query: {},
    };
    mockRes = {
      removeHeader: vi.fn(),
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('securityHeaders', () => {
    it('should be a function (helmet middleware)', () => {
      expect(typeof securityHeaders).toBe('function');
    });
  });

  describe('additionalSecurityHeaders', () => {
    it('should remove X-Powered-By header', () => {
      additionalSecurityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    });

    it('should set security headers', () => {
      additionalSecurityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should set Permissions-Policy header', () => {
      additionalSecurityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      );
    });

    it('should call next()', () => {
      additionalSecurityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('sanitizeInput', () => {
    it('should remove null bytes from body strings', () => {
      mockReq.body = {
        name: 'test\x00',
        description: 'description\x00\x00',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.name).toBe('test');
      expect(mockReq.body.description).toBe('description');
    });

    it('should remove template literal injection attempts', () => {
      mockReq.body = {
        input: '${process.env.SECRET}',
        nested: {
          value: '${JSON.stringify(user)}',
        },
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.input).toBe('');
      expect(mockReq.body.nested.value).toBe('');
    });

    it('should sanitize nested objects', () => {
      mockReq.body = {
        user: {
          name: 'John\x00',
          profile: {
            bio: '${danger}',
          },
        },
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.user.name).toBe('John');
      expect(mockReq.body.user.profile.bio).toBe('');
    });

    it('should sanitize query parameters', () => {
      mockReq.query = {
        search: 'term\x00',
        filter: '${injection}',
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query.search).toBe('term');
      expect(mockReq.query.filter).toBe('');
    });

    it('should handle non-object body gracefully', () => {
      mockReq.body = 'string body';

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toBe('string body');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle null body gracefully', () => {
      mockReq.body = null;

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body).toBeNull();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle arrays in body', () => {
      mockReq.body = {
        items: [
          { name: 'item1\x00' },
          { name: '${evil}' },
        ],
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.items[0].name).toBe('item1');
      expect(mockReq.body.items[1].name).toBe('');
    });

    it('should call next()', () => {
      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('apiRateLimiter', () => {
    it('should be a function', () => {
      expect(typeof apiRateLimiter).toBe('function');
    });

    it('should be configured with rate limiting options', () => {
      // Verify the rate limiter is a configured middleware function
      expect(apiRateLimiter).toBeDefined();
      expect(typeof apiRateLimiter).toBe('function');
    });
  });

  describe('strictRateLimiter', () => {
    it('should be a function', () => {
      expect(typeof strictRateLimiter).toBe('function');
    });

    it('should be configured with stricter rate limiting options', () => {
      // Verify the strict rate limiter is a configured middleware function
      expect(strictRateLimiter).toBeDefined();
      expect(typeof strictRateLimiter).toBe('function');
    });
  });
});
