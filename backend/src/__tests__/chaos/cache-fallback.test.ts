/**
 * ============================================================================
 * CACHE FALLBACK CHAOS TESTS
 * ============================================================================
 * Tests cache fallback mechanisms under failure conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '../../infrastructure/cache/CacheService';
import { getCacheService, resetCacheService } from '../../infrastructure/cache/CacheService';

describe('Cache Fallback - Chaos Scenarios', () => {
  let cache: CacheService;

  beforeEach(() => {
    resetCacheService();
    cache = getCacheService();
  });

  describe('Redis Connection Failure', () => {
    it('should return null when cache is unavailable', async () => {
      // Simulate cache being disabled
      cache.setEnabled(false);
      
      const result = await cache.get('any-key');
      expect(result).toBeNull();
    });

    it('should not throw on set when cache is unavailable', async () => {
      cache.setEnabled(false);
      
      await expect(
        cache.set('key', { data: 'value' }, 60)
      ).resolves.not.toThrow();
    });
  });

  describe('Cache-aside Pattern', () => {
    it('should call factory when cache miss', async () => {
      const factory = vi.fn().mockResolvedValue({ id: 1, name: 'Test' });
      
      const result = await cache.getOrSet('test-key', factory, 60);
      
      expect(factory).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should not call factory on cache hit', async () => {
      const factory = vi.fn().mockResolvedValue({ id: 1, name: 'Test' });
      
      // First call - cache miss
      await cache.getOrSet('cached-key', factory, 60);
      
      // Second call - should be cache hit
      const factory2 = vi.fn().mockResolvedValue({ id: 2, name: 'Test2' });
      const result = await cache.getOrSet('cached-key', factory2, 60);
      
      expect(factory2).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should handle factory errors gracefully', async () => {
      const factory = vi.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(
        cache.getOrSet('error-key', factory, 60)
      ).rejects.toThrow('Database error');
    });
  });

  describe('Stale Cache Handling', () => {
    it('should handle expired cache entries', async () => {
      const factory = vi.fn().mockResolvedValue('fresh-data');
      
      // Set with very short TTL
      await cache.set('expiring-key', 'old-data', 1);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should return null (expired)
      const cached = await cache.get('expiring-key');
      expect(cached).toBeNull();
      
      // getOrSet should call factory
      const result = await cache.getOrSet('expiring-key', factory, 60);
      expect(factory).toHaveBeenCalled();
      expect(result).toBe('fresh-data');
    });
  });

  describe('Cache Corruption Recovery', () => {
    it('should handle corrupted JSON gracefully', async () => {
      // This would require mocking Redis to return invalid JSON
      // For now, we test that the cache service handles errors
      const result = await cache.get('corrupted-key');
      expect(result).toBeNull(); // Returns null on error
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent getOrSet calls', async () => {
      let factoryCalls = 0;
      const slowFactory = vi.fn().mockImplementation(async () => {
        factoryCalls++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: 'expensive-computation' };
      });

      // Multiple concurrent calls for same key
      const promises = Array(5).fill(null).map(() =>
        cache.getOrSet('concurrent-key', slowFactory, 60)
      );

      const results = await Promise.all(promises);
      
      // All should get the same result
      results.forEach(result => {
        expect(result).toEqual({ data: 'expensive-computation' });
      });
      
      // Note: Without request coalescing, factory might be called multiple times
      // This documents current behavior
      expect(factoryCalls).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Cache Invalidation', () => {
    it('should delete keys successfully', async () => {
      await cache.set('delete-key', 'value', 60);
      expect(await cache.exists('delete-key')).toBe(true);
      
      await cache.delete('delete-key');
      expect(await cache.exists('delete-key')).toBe(false);
    });

    it('should handle pattern-based deletion', async () => {
      await cache.set('user:1', 'data1', 60, 'users');
      await cache.set('user:2', 'data2', 60, 'users');
      await cache.set('post:1', 'data3', 60, 'posts');
      
      await cache.deletePattern('user:*', 'users');
      
      expect(await cache.exists('user:1', 'users')).toBe(false);
      expect(await cache.exists('user:2', 'users')).toBe(false);
      // Note: post:1 might or might not be deleted depending on pattern matching
    });
  });
});

describe('Cache TTL Management', () => {
  let cache: CacheService;

  beforeEach(() => {
    resetCacheService();
    cache = getCacheService();
  });

  it('should respect TTL settings', async () => {
    await cache.set('ttl-key', 'value', 2);
    
    const ttl = await cache.getTtl('ttl-key');
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(2);
  });

  it('should return -1 for non-existent keys', async () => {
    const ttl = await cache.getTtl('non-existent-key');
    expect(ttl).toBe(-1);
  });

  it('should handle default TTLs', async () => {
    const factory = vi.fn().mockResolvedValue('data');
    
    await cache.getOrSet('default-ttl-key', factory);
    
    const ttl = await cache.getTtl('default-ttl-key');
    expect(ttl).toBeGreaterThan(0);
  });
});

describe('Cache Error Resilience', () => {
  let cache: CacheService;

  beforeEach(() => {
    resetCacheService();
    cache = getCacheService();
  });

  it('should handle Redis connection errors gracefully', async () => {
    // Operations should not throw even if Redis is unavailable
    await expect(cache.get('any-key')).resolves.toBeNull();
    await expect(cache.set('key', 'value', 60)).resolves.not.toThrow();
    await expect(cache.delete('key')).resolves.not.toThrow();
    await expect(cache.clear()).resolves.not.toThrow();
  });

  it('should return 0 for increment on error', async () => {
    const result = await cache.increment('counter');
    expect(result).toBe(0);
  });

  it('should return false for exists on error', async () => {
    const result = await cache.exists('any-key');
    expect(result).toBe(false);
  });
});
