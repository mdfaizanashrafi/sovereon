/**
 * ============================================================================
 * USER REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../UserRepository';

// Mock Prisma client
const mockPrismaClient = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrismaClient)),
};

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new UserRepository(mockPrismaClient as any);
  });

  describe('findAllForAdmin', () => {
    it('should return users with admin-safe fields', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          companyName: 'Acme Inc',
          role: 'user',
          status: 'active',
          createdAt: new Date(),
        },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findAllForAdmin();

      expect(result).toEqual(mockUsers);
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });
    });

    it('should apply filters when provided', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      await repository.findAllForAdmin({
        filters: { status: 'active' },
        sort: { field: 'createdAt', direction: 'desc' },
        pagination: { page: 1, limit: 10 },
      });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          skip: 0,
          take: 10,
        })
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      mockPrismaClient.user.count.mockResolvedValue(1);

      const result = await repository.emailExists('test@example.com');

      expect(result).toBe(true);
      expect(mockPrismaClient.user.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return false if email does not exist', async () => {
      mockPrismaClient.user.count.mockResolvedValue(0);

      const result = await repository.emailExists('new@example.com');

      expect(result).toBe(false);
    });

    it('should exclude specific user when checking email', async () => {
      mockPrismaClient.user.count.mockResolvedValue(0);

      await repository.emailExists('test@example.com', 'user-123');

      expect(mockPrismaClient.user.count).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          id: { not: 'user-123' },
        },
      });
    });
  });

  describe('inherited methods', () => {
    it('should call findById on the model', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById('1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: undefined,
      });
    });

    it('should call create on the model', async () => {
      const mockUser = { id: '1', email: 'new@example.com' };
      mockPrismaClient.user.create.mockResolvedValue(mockUser);

      const result = await repository.create({ email: 'new@example.com' } as any);

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: { email: 'new@example.com' },
      });
    });

    it('should call update on the model', async () => {
      const mockUser = { id: '1', email: 'updated@example.com' };
      mockPrismaClient.user.update.mockResolvedValue(mockUser);

      const result = await repository.update('1', { email: 'updated@example.com' } as any);

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { email: 'updated@example.com' },
      });
    });

    it('should call delete on the model', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPrismaClient.user.delete.mockResolvedValue(mockUser);

      const result = await repository.delete('1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should call findAll on the model', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
    });

    it('should call findPaginated on the model', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaClient.user.count.mockResolvedValue(1);

      const result = await repository.findPaginated({ pagination: { page: 1, limit: 10 } });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should call count on the model', async () => {
      mockPrismaClient.user.count.mockResolvedValue(5);

      const result = await repository.count({ status: 'active' });

      expect(result).toBe(5);
      expect(mockPrismaClient.user.count).toHaveBeenCalledWith({
        where: { status: 'active' },
      });
    });

    it('should call exists on the model', async () => {
      mockPrismaClient.user.count.mockResolvedValue(1);

      const result = await repository.exists({ email: 'test@example.com' });

      expect(result).toBe(true);
    });
  });
});
