/**
 * ============================================================================
 * USERS ROUTES TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock dependencies
const mockFindAllForAdmin = vi.fn();

vi.mock('../../repositories', () => ({
  RepositoryFactory: {
    getUserRepository: vi.fn().mockReturnValue({
      findAllForAdmin: mockFindAllForAdmin,
    }),
  },
}));

vi.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    // Simulate authenticated user
    req.user = { userId: 'admin-1', role: 'admin' };
    next();
  },
  asyncHandler: (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },
}));

describe('Users Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    
    // Import the router after mocks are set up
    const usersRouter = (await import('../users.routes')).default;
    app.use('/api/users', usersRouter);
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', firstName: 'John', role: 'user' },
        { id: '2', email: 'user2@example.com', firstName: 'Jane', role: 'user' },
      ];
      mockFindAllForAdmin.mockResolvedValue(mockUsers);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(mockFindAllForAdmin).toHaveBeenCalled();
    });

    it('should return empty array when no users', async () => {
      mockFindAllForAdmin.mockResolvedValue([]);

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      mockFindAllForAdmin.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(500);
    });
  });
});
