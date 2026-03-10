/**
 * ============================================================================
 * SERVICE REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceRepository } from '../ServiceRepository';

const mockPrismaClient = {
  service: {
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

describe('ServiceRepository', () => {
  let repository: ServiceRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new ServiceRepository(mockPrismaClient as any);
  });

  describe('findBySlug', () => {
    it('should find service by slug', async () => {
      const mockService = {
        id: 'service-1',
        slug: 'web-development',
        name: 'Web Development',
      };
      mockPrismaClient.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.findBySlug('web-development');

      expect(result).toEqual(mockService);
      expect(mockPrismaClient.service.findUnique).toHaveBeenCalledWith({
        where: { slug: 'web-development' },
      });
    });

    it('should return null when service not found', async () => {
      mockPrismaClient.service.findUnique.mockResolvedValue(null);

      const result = await repository.findBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findActive', () => {
    it('should find all active services', async () => {
      const mockServices = [
        { id: 'service-1', isActive: true },
        { id: 'service-2', isActive: true },
      ];
      mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

      const result = await repository.findActive();

      expect(result).toEqual(mockServices);
      expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
      });
    });

    it('should apply pagination and sorting', async () => {
      const mockServices = [{ id: 'service-1' }];
      mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

      await repository.findActive({
        pagination: { page: 1, limit: 10 },
        sort: { field: 'name', direction: 'asc' },
      });

      expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          skip: 0,
          take: 10,
          orderBy: { name: 'asc' },
        })
      );
    });
  });

  describe('findByCategory', () => {
    it('should find services by category with active filter', async () => {
      const mockServices = [
        { id: 'service-1', category: 'development', isActive: true },
      ];
      mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

      const result = await repository.findByCategory('development');

      expect(result).toEqual(mockServices);
      expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
        filters: { category: 'development', isActive: true },
      });
    });

    it('should find services by category without active filter', async () => {
      const mockServices = [
        { id: 'service-1', category: 'development', isActive: false },
      ];
      mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

      const result = await repository.findByCategory('development', false);

      expect(result).toEqual(mockServices);
      expect(mockPrismaClient.service.findMany).toHaveBeenCalledWith({
        filters: { category: 'development' },
      });
    });
  });

  describe('slugExists', () => {
    it('should return true if slug exists', async () => {
      mockPrismaClient.service.count.mockResolvedValue(1);

      const result = await repository.slugExists('web-development');

      expect(result).toBe(true);
      expect(mockPrismaClient.service.count).toHaveBeenCalledWith({
        where: { slug: 'web-development' },
      });
    });

    it('should return false if slug does not exist', async () => {
      mockPrismaClient.service.count.mockResolvedValue(0);

      const result = await repository.slugExists('new-service');

      expect(result).toBe(false);
    });

    it('should exclude specific service when checking slug', async () => {
      mockPrismaClient.service.count.mockResolvedValue(0);

      await repository.slugExists('web-development', 'service-1');

      expect(mockPrismaClient.service.count).toHaveBeenCalledWith({
        where: {
          slug: 'web-development',
          id: { not: 'service-1' },
        },
      });
    });
  });

  describe('inherited CRUD operations', () => {
    it('should find by ID', async () => {
      const mockService = { id: 'service-1', name: 'Test Service' };
      mockPrismaClient.service.findUnique.mockResolvedValue(mockService);

      const result = await repository.findById('service-1');

      expect(result).toEqual(mockService);
    });

    it('should find all', async () => {
      const mockServices = [{ id: 'service-1' }];
      mockPrismaClient.service.findMany.mockResolvedValue(mockServices);

      const result = await repository.findAll();

      expect(result).toEqual(mockServices);
    });

    it('should find paginated', async () => {
      const mockServices = [{ id: 'service-1' }];
      mockPrismaClient.service.findMany.mockResolvedValue(mockServices);
      mockPrismaClient.service.count.mockResolvedValue(1);

      const result = await repository.findPaginated();

      expect(result.data).toEqual(mockServices);
      expect(result.meta.total).toBe(1);
    });

    it('should create service', async () => {
      const mockService = { id: 'service-1', name: 'New Service' };
      mockPrismaClient.service.create.mockResolvedValue(mockService);

      const result = await repository.create({ name: 'New Service' } as any);

      expect(result).toEqual(mockService);
    });

    it('should update service', async () => {
      const mockService = { id: 'service-1', name: 'Updated Service' };
      mockPrismaClient.service.update.mockResolvedValue(mockService);

      const result = await repository.update('service-1', { name: 'Updated Service' } as any);

      expect(result).toEqual(mockService);
    });

    it('should delete service', async () => {
      const mockService = { id: 'service-1' };
      mockPrismaClient.service.delete.mockResolvedValue(mockService);

      const result = await repository.delete('service-1');

      expect(result).toEqual(mockService);
    });

    it('should count services', async () => {
      mockPrismaClient.service.count.mockResolvedValue(10);

      const result = await repository.count({ isActive: true });

      expect(result).toBe(10);
    });

    it('should check existence', async () => {
      mockPrismaClient.service.count.mockResolvedValue(1);

      const result = await repository.exists({ category: 'development' });

      expect(result).toBe(true);
    });
  });
});
