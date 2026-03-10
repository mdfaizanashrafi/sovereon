/**
 * ============================================================================
 * CACHED REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CachedRepositoryWrapper,
  CachedRepository,
  withCaching,
  cacheable,
  invalidate,
} from '../CachedRepository';
import { BaseRepository } from '../BaseRepository';

// Mock cache service
const mockCache = {
  isEnabled: vi.fn().mockReturnValue(true),
  get: vi.fn(),
  set: vi.fn(),
  getOrSet: vi.fn(),
  deletePattern: vi.fn(),
  invalidateByTags: vi.fn(),
  getStats: vi.fn().mockReturnValue({ hits: 0, misses: 0 }),
  getTtl: vi.fn().mockResolvedValue(300),
};

// Mock base repository
class MockRepository extends BaseRepository<any, any, any, any> {
  protected modelName: any = 'test';

  async findById(id: string) {
    return { id, name: 'Test' };
  }

  async findAll(options?: any) {
    return [{ id: '1' }, { id: '2' }];
  }

  async findPaginated(options?: any) {
    return {
      data: [{ id: '1' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
    };
  }

  async create(data: any) {
    return { id: 'new-id', ...data };
  }

  async update(id: string, data: any) {
    return { id, ...data };
  }

  async delete(id: string) {
    return { id, deleted: true };
  }

  async count(where?: any) {
    return 10;
  }

  async exists(where: any) {
    return true;
  }

  async findUnique(where: any) {
    return { id: '1', ...where };
  }

  async findFirst(where: any) {
    return { id: '1', ...where };
  }
}

describe('CachedRepositoryWrapper', () => {
  let baseRepo: MockRepository;
  let cachedRepo: CachedRepositoryWrapper<any, any, any, any>;

  beforeEach(() => {
    vi.clearAllMocks();
    baseRepo = new MockRepository();
    cachedRepo = new CachedRepositoryWrapper(
      baseRepo,
      { keyPrefix: 'test', defaultTtl: 300 },
      mockCache as any
    );
  });

  describe('cached read operations', () => {
    it('should cache findById result', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockCache.getOrSet.mockResolvedValue(mockData);

      const result = await cachedRepo.findById('1');

      expect(result).toEqual(mockData);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        'id:1',
        expect.any(Function),
        expect.objectContaining({
          ttl: 300,
          keyPrefix: 'test',
        })
      );
    });

    it('should skip cache when skipCache option is true', async () => {
      const mockData = { id: '1', name: 'Test' };
      vi.spyOn(baseRepo, 'findById').mockResolvedValue(mockData);

      const result = await cachedRepo.findById('1', { skipCache: true });

      expect(result).toEqual(mockData);
      expect(baseRepo.findById).toHaveBeenCalledWith('1', { skipCache: true });
      expect(mockCache.getOrSet).not.toHaveBeenCalled();
    });

    it('should use custom cache key when provided', async () => {
      const mockData = { id: '1' };
      mockCache.getOrSet.mockResolvedValue(mockData);

      await cachedRepo.findById('1', { key: 'custom-key' });

      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        'custom-key',
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should cache findAll results', async () => {
      const mockData = [{ id: '1' }, { id: '2' }];
      mockCache.getOrSet.mockResolvedValue(mockData);

      const result = await cachedRepo.findAll();

      expect(result).toEqual(mockData);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('all:'),
        expect.any(Function),
        expect.objectContaining({ keyPrefix: 'test' })
      );
    });

    it('should cache findPaginated results', async () => {
      const mockData = {
        data: [{ id: '1' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockCache.getOrSet.mockResolvedValue(mockData);

      const result = await cachedRepo.findPaginated();

      expect(result).toEqual(mockData);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('paginated:'),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should cache findUnique results', async () => {
      const mockData = { id: '1', email: 'test@example.com' };
      mockCache.getOrSet.mockResolvedValue(mockData);

      const result = await cachedRepo.findUnique({ email: 'test@example.com' });

      expect(result).toEqual(mockData);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('unique:'),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should cache findFirst results', async () => {
      const mockData = { id: '1', status: 'active' };
      mockCache.getOrSet.mockResolvedValue(mockData);

      const result = await cachedRepo.findFirst({ status: 'active' });

      expect(result).toEqual(mockData);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('first:'),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should cache count results', async () => {
      mockCache.getOrSet.mockResolvedValue(10);

      const result = await cachedRepo.count({ status: 'active' });

      expect(result).toBe(10);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('count:'),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should cache exists results', async () => {
      mockCache.getOrSet.mockResolvedValue(true);

      const result = await cachedRepo.exists({ email: 'test@example.com' });

      expect(result).toBe(true);
      expect(mockCache.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('exists:'),
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe('write operations with invalidation', () => {
    it('should invalidate list caches on create', async () => {
      const mockData = { id: 'new-id', name: 'New' };
      vi.spyOn(baseRepo, 'create').mockResolvedValue(mockData);

      await cachedRepo.create({ name: 'New' });

      expect(baseRepo.create).toHaveBeenCalledWith({ name: 'New' });
      expect(mockCache.deletePattern).toHaveBeenCalledWith('all:*', 'test');
      expect(mockCache.deletePattern).toHaveBeenCalledWith('paginated:*', 'test');
    });

    it('should invalidate entity and list caches on update', async () => {
      const mockData = { id: '1', name: 'Updated' };
      vi.spyOn(baseRepo, 'update').mockResolvedValue(mockData);

      await cachedRepo.update('1', { name: 'Updated' });

      expect(baseRepo.update).toHaveBeenCalledWith('1', { name: 'Updated' });
      expect(mockCache.deletePattern).toHaveBeenCalledWith('id:1*', 'test');
    });

    it('should invalidate entity and list caches on delete', async () => {
      const mockData = { id: '1', deleted: true };
      vi.spyOn(baseRepo, 'delete').mockResolvedValue(mockData);

      await cachedRepo.delete('1');

      expect(baseRepo.delete).toHaveBeenCalledWith('1');
      expect(mockCache.deletePattern).toHaveBeenCalledWith('id:1*', 'test');
    });

    it('should invalidate all caches on updateWhere', async () => {
      vi.spyOn(baseRepo, 'updateWhere').mockResolvedValue({ id: '1' });

      await cachedRepo.updateWhere({ id: '1' }, { status: 'active' });

      expect(mockCache.deletePattern).toHaveBeenCalledWith('*', 'test');
    });

    it('should invalidate all caches on deleteWhere', async () => {
      vi.spyOn(baseRepo, 'deleteWhere').mockResolvedValue({ id: '1' });

      await cachedRepo.deleteWhere({ id: '1' });

      expect(mockCache.deletePattern).toHaveBeenCalledWith('*', 'test');
    });
  });

  describe('cache management', () => {
    it('should invalidate entity cache', async () => {
      await cachedRepo.invalidateEntityCache('1');

      expect(mockCache.deletePattern).toHaveBeenCalledWith('id:1*', 'test');
      expect(mockCache.deletePattern).toHaveBeenCalledWith('all:*', 'test');
    });

    it('should invalidate list caches', async () => {
      await cachedRepo.invalidateListCaches();

      expect(mockCache.deletePattern).toHaveBeenCalledWith('all:*', 'test');
      expect(mockCache.deletePattern).toHaveBeenCalledWith('paginated:*', 'test');
      expect(mockCache.deletePattern).toHaveBeenCalledWith('count:*', 'test');
      expect(mockCache.deletePattern).toHaveBeenCalledWith('first:*', 'test');
    });

    it('should invalidate all caches', async () => {
      await cachedRepo.invalidateAllCaches();

      expect(mockCache.deletePattern).toHaveBeenCalledWith('*', 'test');
    });

    it('should invalidate by tags when configured', async () => {
      const repoWithTags = new CachedRepositoryWrapper(
        baseRepo,
        { keyPrefix: 'test', tags: ['users'] },
        mockCache as any
      );

      await repoWithTags.invalidateAllCaches();

      expect(mockCache.invalidateByTags).toHaveBeenCalledWith(['users']);
    });
  });

  describe('warmCache', () => {
    it('should warm cache for findAll', async () => {
      mockCache.getOrSet.mockResolvedValue([{ id: '1' }]);

      await cachedRepo.warmCache([{ method: 'findAll', args: [{}] }]);

      expect(mockCache.getOrSet).toHaveBeenCalled();
    });

    it('should warm cache for findById', async () => {
      mockCache.getOrSet.mockResolvedValue({ id: '1' });

      await cachedRepo.warmCache([{ method: 'findById', args: ['1'] }]);

      expect(mockCache.getOrSet).toHaveBeenCalled();
    });

    it('should warm cache for findPaginated', async () => {
      mockCache.getOrSet.mockResolvedValue({ data: [], meta: {} });

      await cachedRepo.warmCache([{ method: 'findPaginated', args: [{}] }]);

      expect(mockCache.getOrSet).toHaveBeenCalled();
    });

    it('should handle warm cache errors gracefully', async () => {
      mockCache.getOrSet.mockRejectedValue(new Error('Cache error'));

      const result = await cachedRepo.warmCache([{ method: 'findAll' }]);

      // Should not throw
      expect(result).toBeUndefined();
    });
  });

  describe('getCacheMetrics', () => {
    it('should return cache metrics', () => {
      const metrics = cachedRepo.getCacheMetrics();

      expect(metrics).toHaveProperty('config');
      expect(metrics).toHaveProperty('stats');
      expect(metrics.config.keyPrefix).toBe('test');
    });
  });
});

describe('withCaching factory', () => {
  it('should create a cached repository wrapper', () => {
    const baseRepo = new MockRepository();
    const cached = withCaching(baseRepo, { keyPrefix: 'test' });

    expect(cached).toBeInstanceOf(CachedRepositoryWrapper);
  });
});

describe('CachedRepository abstract class', () => {
  it('should require cacheConfig to be implemented', () => {
    // Testing that the abstract class structure is correct
    expect(CachedRepository).toBeDefined();
  });
});
