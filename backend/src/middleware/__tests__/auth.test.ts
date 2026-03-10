/**
 * ============================================================================
 * AUTH MIDDLEWARE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware, asyncHandler } from '../auth';

// Import the mocked module
import { verifyToken } from '../../utils/jwt';

// Mock JWT utils
vi.mock('../../utils/jwt', () => ({
  verifyToken: vi.fn(),
}));

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('authMiddleware', () => {
    it('should throw error when authorization header is missing', () => {
      expect(() => {
        authMiddleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow('Unauthorized');
    });

    it('should throw error when token is invalid', () => {
      vi.mocked(verifyToken).mockReturnValue(null);

      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      expect(() => {
        authMiddleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow('Invalid or expired token');
    });

    it('should set user and call next when token is valid', () => {
      const mockPayload = { userId: 'user-1', email: 'test@example.com', role: 'user' };
      vi.mocked(verifyToken).mockReturnValue(mockPayload as any);

      mockReq.headers = {
        authorization: 'Bearer valid-token',
      };

      authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract token from Bearer format', () => {
      vi.mocked(verifyToken).mockReturnValue({ userId: '1' } as any);

      mockReq.headers = {
        authorization: 'Bearer my-token-123',
      };

      authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith('my-token-123');
    });
  });

  describe('asyncHandler', () => {
    it('should handle async function success', async () => {
      const asyncFn = vi.fn().mockResolvedValue(undefined);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass errors to next', async () => {
      const error = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle sync errors', async () => {
      const error = new Error('Sync error');
      const asyncFn = vi.fn().mockImplementation(() => {
        throw error;
      });
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should preserve request and response objects', async () => {
      const asyncFn = vi.fn().mockResolvedValue(undefined);
      const handler = asyncHandler(asyncFn);

      mockReq.body = { test: 'data' };
      (mockRes as any).locals = { user: 'test' };

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });
  });
});
