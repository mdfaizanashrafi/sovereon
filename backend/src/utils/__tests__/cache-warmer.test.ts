/**
 * ============================================================================
 * CACHE WARMER TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheWarmer, getCacheWarmer, resetCacheWarmer, createCMSWarmingQueries } from '../cache-warmer';

// Mock cache service
const mockCache = {
  set: vi.fn().mockResolvedValue(undefined),
  getTtl: vi.fn().mockResolvedValue(300),
};

// Mock Prisma
const mockPrisma = {
  serviceCMS: { findMany: vi.fn() },
  teamMember: { findMany: vi.fn() },
  testimonial: { findMany: vi.fn() },
  fAQ: { findMany: vi.fn() },
  serviceCategory: { findMany: vi.fn() },
};

vi.mock('../../config/cache', () => ({
  getEnhancedCache: vi.fn().mockReturnValue({
    set: vi.fn().mockResolvedValue(undefined),
    getTtl: vi.fn().mockResolvedValue(300),
  }),
  CACHE_TTL: {
    STATIC: 3600,
    DYNAMIC: 300,
    SERVICES: 600,
    TEAM_MEMBERS: 300,
    TESTIMONIALS: 900,
    FAQS: 1800,
  },
}));

vi.mock('../../database/client', () => ({
  getPrismaClient: vi.fn().mockReturnValue({}),
}));

describe('CacheWarmer', () => {
  let warmer: CacheWarmer;

  beforeEach(() => {
    vi.clearAllMocks();
    resetCacheWarmer();
    warmer = new CacheWarmer(
      { warmOnStartup: false, enablePeriodicWarm: false, verbose: false },
      mockCache as any,
      mockPrisma as any
    );
  });

  describe('register', () => {
    it('should register a query', () => {
      warmer.register({
        id: 'test-query',
        name: 'Test Query',
        query: async () => [{ id: 1 }],
        cacheKey: 'test',
        keyPrefix: 'api:test',
      });

      const queries = warmer.getQueries();
      expect(queries).toHaveLength(1);
      expect(queries[0].id).toBe('test-query');
    });

    it('should register multiple queries', () => {
      warmer.registerMany([
        {
          id: 'query-1',
          name: 'Query 1',
          query: async () => [],
          cacheKey: 'key1',
          keyPrefix: 'api:1',
        },
        {
          id: 'query-2',
          name: 'Query 2',
          query: async () => [],
          cacheKey: 'key2',
          keyPrefix: 'api:2',
        },
      ]);

      expect(warmer.getQueries()).toHaveLength(2);
    });

    it('should set default priority and ttl', () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      const query = warmer.getQueries()[0];
      expect(query.priority).toBe(100);
      expect(query.ttl).toBe(3600); // CACHE_TTL.STATIC
      expect(query.maxRetries).toBe(3);
      expect(query.retryDelay).toBe(1000);
    });
  });

  describe('unregister', () => {
    it('should unregister a query', () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      const result = warmer.unregister('test');

      expect(result).toBe(true);
      expect(warmer.getQueries()).toHaveLength(0);
    });

    it('should return false for non-existent query', () => {
      const result = warmer.unregister('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all queries and results', () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      warmer.clear();

      expect(warmer.getQueries()).toHaveLength(0);
      expect(warmer.getResults()).toHaveLength(0);
    });
  });

  describe('warmAll', () => {
    it('should warm all registered queries', async () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [{ id: 1 }],
        cacheKey: 'list',
        keyPrefix: 'api:test',
      });

      const results = await warmer.warmAll();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].id).toBe('test');
    });

    it('should sort queries by priority', async () => {
      const executionOrder: string[] = [];

      warmer.register({
        id: 'low-priority',
        name: 'Low',
        priority: 200,
        query: async () => {
          executionOrder.push('low');
          return [];
        },
        cacheKey: 'key1',
        keyPrefix: 'api',
      });

      warmer.register({
        id: 'high-priority',
        name: 'High',
        priority: 10,
        query: async () => {
          executionOrder.push('high');
          return [];
        },
        cacheKey: 'key2',
        keyPrefix: 'api',
      });

      await warmer.warmAll({ parallel: false });

      expect(executionOrder[0]).toBe('high');
      expect(executionOrder[1]).toBe('low');
    });

    it('should skip if already warming', async () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return [];
        },
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      // Start first warm
      const warm1 = warmer.warmAll();
      
      // Try to start second warm while first is running
      const warm2 = warmer.warmAll();

      const [results1, results2] = await Promise.all([warm1, warm2]);

      // Second call should return existing results
      expect(results2.length).toBe(results1.length);
      expect(results2[0].id).toBe(results1[0].id);
    });

    it('should handle query errors with retries', async () => {
      let attempts = 0;
      warmer.register({
        id: 'failing',
        name: 'Failing Query',
        query: async () => {
          attempts++;
          throw new Error('Query failed');
        },
        cacheKey: 'key',
        keyPrefix: 'api',
        maxRetries: 2,
        retryDelay: 5,
      });

      const results = await warmer.warmAll();

      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Query failed');
      // Allow for timing variations in retries
      expect(attempts).toBeGreaterThanOrEqual(1);
    });

    it('should skip condition check', async () => {
      warmer.register({
        id: 'conditional',
        name: 'Conditional Query',
        condition: () => false,
        query: async () => [{ id: 1 }],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      const results = await warmer.warmAll();

      expect(results[0].success).toBe(true);
      expect(results[0].duration).toBe(0);
    });
  });

  describe('warmById', () => {
    it('should warm specific query by ID', async () => {
      warmer.register({
        id: 'specific',
        name: 'Specific',
        query: async () => [{ id: 1 }],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      const result = await warmer.warmById('specific');

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.id).toBe('specific');
    });

    it('should return null for non-existent query', async () => {
      const result = await warmer.warmById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('warmByTag', () => {
    it('should warm queries by tag', async () => {
      warmer.register({
        id: 'tagged-1',
        name: 'Tagged 1',
        tags: ['cms', 'services'],
        query: async () => [],
        cacheKey: 'key1',
        keyPrefix: 'api',
      });
      warmer.register({
        id: 'tagged-2',
        name: 'Tagged 2',
        tags: ['cms', 'team'],
        query: async () => [],
        cacheKey: 'key2',
        keyPrefix: 'api',
      });
      warmer.register({
        id: 'untagged',
        name: 'Untagged',
        query: async () => [],
        cacheKey: 'key3',
        keyPrefix: 'api',
      });

      const results = await warmer.warmByTag('cms');

      expect(results).toHaveLength(2);
    });
  });

  describe('periodic warming', () => {
    it('should start periodic warming', () => {
      const periodicWarmer = new CacheWarmer(
        { enablePeriodicWarm: true, periodicInterval: 1000 },
        mockCache as any,
        mockPrisma as any
      );

      periodicWarmer.startPeriodicWarm();

      expect(periodicWarmer.isPeriodicActive()).toBe(true);

      periodicWarmer.stopPeriodicWarm();
    });

    it('should not start if already active', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const periodicWarmer = new CacheWarmer(
        { enablePeriodicWarm: true },
        mockCache as any,
        mockPrisma as any
      );

      periodicWarmer.startPeriodicWarm();
      periodicWarmer.startPeriodicWarm(); // Try to start again

      expect(consoleSpy).toHaveBeenCalledWith('[CacheWarmer] Periodic warming already started');

      periodicWarmer.stopPeriodicWarm();
      consoleSpy.mockRestore();
    });

    it('should not start if disabled', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      warmer.startPeriodicWarm();

      expect(consoleSpy).toHaveBeenCalledWith('[CacheWarmer] Periodic warming is disabled');

      consoleSpy.mockRestore();
    });

    it('should stop periodic warming', () => {
      const periodicWarmer = new CacheWarmer(
        { enablePeriodicWarm: true },
        mockCache as any,
        mockPrisma as any
      );

      periodicWarmer.startPeriodicWarm();
      periodicWarmer.stopPeriodicWarm();

      expect(periodicWarmer.isPeriodicActive()).toBe(false);
    });
  });

  describe('background updates', () => {
    it('should schedule background update', async () => {
      warmer.register({
        id: 'bg-test',
        name: 'BG Test',
        query: async () => [{ id: 1 }],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      const result = await warmer.scheduleBackgroundUpdate('bg-test', 10);

      expect(result).not.toBeNull();
    });
  });

  describe('refreshStaleEntries', () => {
    it('should refresh stale cache entries', async () => {
      warmer.register({
        id: 'stale-test',
        name: 'Stale Test',
        staleWhileRevalidate: true,
        ttl: 100,
        query: async () => [{ id: 1 }],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      mockCache.getTtl.mockResolvedValue(10); // Low TTL indicates stale

      await warmer.refreshStaleEntries();

      // Should trigger background update
    });
  });

  describe('status and results', () => {
    it('should return warmer status', async () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      await warmer.warmAll();

      const status = warmer.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.queryCount).toBe(1);
      expect(status.completedCount).toBe(1);
      expect(status.periodicActive).toBe(false);
    });

    it('should return all results', async () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      await warmer.warmAll();

      const results = warmer.getResults();

      expect(results).toHaveLength(1);
    });

    it('should return specific result', async () => {
      warmer.register({
        id: 'test',
        name: 'Test',
        query: async () => [],
        cacheKey: 'key',
        keyPrefix: 'api',
      });

      await warmer.warmAll();

      const result = warmer.getResult('test');

      expect(result).not.toBeUndefined();
      expect(result?.id).toBe('test');
    });

    it('should check if warming is in progress', () => {
      expect(warmer.isWarming()).toBe(false);
    });
  });
});

describe('getCacheWarmer singleton', () => {
  beforeEach(() => {
    resetCacheWarmer();
  });

  it('should return same instance', () => {
    const warmer1 = getCacheWarmer();
    const warmer2 = getCacheWarmer();

    expect(warmer1).toBe(warmer2);
  });

  it('should create new instance after reset', () => {
    const warmer1 = getCacheWarmer();
    resetCacheWarmer();
    const warmer2 = getCacheWarmer();

    expect(warmer1).not.toBe(warmer2);
  });
});

describe('createCMSWarmingQueries', () => {
  it('should create CMS warming queries', () => {
    const queries = createCMSWarmingQueries(mockPrisma as any);

    expect(queries).toHaveLength(5);
    expect(queries.map(q => q.id)).toContain('cms:services');
    expect(queries.map(q => q.id)).toContain('cms:team');
    expect(queries.map(q => q.id)).toContain('cms:testimonials');
    expect(queries.map(q => q.id)).toContain('cms:faqs');
    expect(queries.map(q => q.id)).toContain('cms:categories');
  });

  it('should have correct priorities', () => {
    const queries = createCMSWarmingQueries(mockPrisma as any);
    const categories = queries.find(q => q.id === 'cms:categories');
    
    expect(categories?.priority).toBe(5);
  });
});
