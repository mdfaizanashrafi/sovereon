/**
 * ============================================================================
 * CACHE CONFIGURATION - Enhanced Caching Service
 * ============================================================================
 * Enterprise-grade caching layer with Redis connection management,
 * cache-aside pattern, stampede protection, versioning, and comprehensive
 * invalidation strategies.
 */

import Redis from 'ioredis';
import { getRedisClient, createRedisClient } from '../infrastructure/cache/redis';
import type { Redis as RedisType } from 'ioredis';

// ============================================================================
// CACHE TTL CONSTANTS
// ============================================================================

/**
 * Cache TTL configuration by data type
 * - DYNAMIC: Frequently changing data (5 minutes)
 * - STATIC: Semi-static data (1 hour)
 * - RARE: Rarely changing data (24 hours)
 * - SESSION: User session data (7 days)
 * - REALTIME: Real-time data (1 minute)
 */
export const CACHE_TTL = {
  DYNAMIC: 300,        // 5 minutes
  STATIC: 3600,        // 1 hour
  RARE: 86400,         // 24 hours
  SESSION: 604800,     // 7 days
  REALTIME: 60,        // 1 minute
  
  // Resource-specific TTLs
  CMS_CONTENT: 300,    // 5 minutes
  TEAM_MEMBERS: 300,   // 5 minutes
  SERVICES: 600,       // 10 minutes
  TESTIMONIALS: 900,   // 15 minutes
  FAQS: 1800,          // 30 minutes
  SETTINGS: 3600,      // 1 hour
  USER_PROFILE: 600,   // 10 minutes
  API_RESPONSE: 60,    // 1 minute
} as const;

// ============================================================================
// CACHE CONFIGURATION OPTIONS
// ============================================================================

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
  tags?: string[];
  version?: string;
  staleWhileRevalidate?: boolean;
  staleTtl?: number;
}

export interface CacheSetOptions extends CacheOptions {
  nx?: boolean; // Only set if key doesn't exist
  xx?: boolean; // Only set if key exists
  keepttl?: boolean; // Keep existing TTL
}

export interface CacheGetOrSetOptions extends CacheOptions {
  lockTimeout?: number; // Lock timeout for stampede protection (ms)
  retryDelay?: number;  // Delay between retries (ms)
  maxRetries?: number;  // Maximum retry attempts
}

// ============================================================================
// CACHE METRICS
// ============================================================================

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  stampedePreventions: number;
  lastReset: Date;
}

// ============================================================================
// ENHANCED CACHE SERVICE
// ============================================================================

export class EnhancedCacheService {
  private redis: RedisType;
  private enabled: boolean;
  private defaultVersion: string;
  private metrics: CacheMetrics;
  private localCache: Map<string, { value: any; expiry: number }>;
  private localCacheEnabled: boolean;
  private localCacheTtl: number;

  constructor(redis?: RedisType) {
    this.redis = redis || getRedisClient();
    this.enabled = process.env.CACHE_ENABLED !== 'false';
    this.defaultVersion = process.env.CACHE_VERSION || 'v1';
    this.localCache = new Map();
    this.localCacheEnabled = process.env.LOCAL_CACHE_ENABLED === 'true';
    this.localCacheTtl = parseInt(process.env.LOCAL_CACHE_TTL || '5000', 10); // 5 seconds default
    
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      stampedePreventions: 0,
      lastReset: new Date(),
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('error', (err) => {
      console.error('[Cache] Redis error:', err.message);
      this.metrics.errors++;
    });

    this.redis.on('connect', () => {
      console.log('[Cache] Redis connected');
    });

    this.redis.on('reconnecting', () => {
      console.log('[Cache] Redis reconnecting...');
    });
  }

  // ========================================================================
  // KEY MANAGEMENT
  // ========================================================================

  /**
   * Generate cache key with versioning
   */
  private generateKey(key: string, prefix?: string, version?: string): string {
    const parts = ['sovereon'];
    
    const cacheVersion = version || this.defaultVersion;
    parts.push(cacheVersion);
    
    if (prefix) {
      parts.push(prefix);
    }
    
    parts.push(key);
    
    return parts.join(':');
  }

  /**
   * Generate lock key for stampede protection
   */
  private generateLockKey(key: string): string {
    return `${key}:lock`;
  }

  // ========================================================================
  // LOCAL CACHE (L1 CACHE)
  // ========================================================================

  private getFromLocalCache<T>(key: string): T | null {
    if (!this.localCacheEnabled) return null;
    
    const item = this.localCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.localCache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  private setLocalCache(key: string, value: any, ttl: number): void {
    if (!this.localCacheEnabled) return;
    
    // Use shorter TTL for local cache
    const localTtl = Math.min(ttl * 1000, this.localCacheTtl);
    this.localCache.set(key, {
      value,
      expiry: Date.now() + localTtl,
    });
  }

  private invalidateLocalCache(key?: string): void {
    if (!this.localCacheEnabled) return;
    
    if (key) {
      this.localCache.delete(key);
    } else {
      this.localCache.clear();
    }
  }

  // ========================================================================
  // CORE OPERATIONS
  // ========================================================================

  /**
   * Check if caching is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.redis.status === 'ready';
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, prefix?: string, version?: string): Promise<T | null> {
    if (!this.isEnabled()) return null;

    const fullKey = this.generateKey(key, prefix, version);

    // Try local cache first
    const localValue = this.getFromLocalCache<T>(fullKey);
    if (localValue !== null) {
      this.metrics.hits++;
      return localValue;
    }

    try {
      const value = await this.redis.get(fullKey);
      
      if (!value) {
        this.metrics.misses++;
        return null;
      }

      const parsed = JSON.parse(value) as T;
      
      // Populate local cache
      this.setLocalCache(fullKey, parsed, 60); // Short TTL for local
      
      this.metrics.hits++;
      return parsed;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      this.metrics.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheSetOptions = {}
  ): Promise<void> {
    if (!this.isEnabled()) return;

    const {
      ttl = CACHE_TTL.DYNAMIC,
      keyPrefix: prefix,
      tags = [],
      version,
      nx,
      xx,
      keepttl,
    } = options;

    const fullKey = this.generateKey(key, prefix, version);

    try {
      const serialized = JSON.stringify(value);
      
      // Build Redis arguments
      if (keepttl) {
        await this.redis.set(fullKey, serialized, 'KEEPTTL');
      } else if (nx) {
        await this.redis.set(fullKey, serialized, 'EX', ttl, 'NX');
      } else if (xx) {
        await this.redis.set(fullKey, serialized, 'EX', ttl, 'XX');
      } else {
        await this.redis.setex(fullKey, ttl, serialized);
      }

      // Add to tag index for tag-based invalidation
      if (tags.length > 0) {
        await this.addToTagIndex(fullKey, tags);
      }

      // Update local cache
      this.setLocalCache(fullKey, value, ttl);
      
      this.metrics.sets++;
    } catch (error) {
      console.error('[Cache] Set error:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Cache-aside pattern with stampede protection
   * Uses Redis distributed lock to prevent cache stampedes
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheGetOrSetOptions = {}
  ): Promise<T> {
    const {
      ttl = CACHE_TTL.DYNAMIC,
      keyPrefix: prefix,
      tags = [],
      version,
      lockTimeout = 10000,
      retryDelay = 100,
      maxRetries = 50,
      staleWhileRevalidate = false,
      staleTtl = 60,
    } = options;

    const fullKey = this.generateKey(key, prefix, version);

    // Try to get from cache first
    const cached = await this.get<T>(key, prefix, version);
    if (cached !== null) {
      return cached;
    }

    // Stampede protection: Try to acquire lock
    const lockKey = this.generateLockKey(fullKey);
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    let lockAcquired = false;
    let retries = 0;

    try {
      // Try to acquire lock
      lockAcquired = await this.acquireLock(lockKey, lockValue, lockTimeout);

      if (!lockAcquired) {
        // Another process is computing the value
        this.metrics.stampedePreventions++;
        
        // Wait and retry getting from cache
        while (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          const value = await this.get<T>(key, prefix, version);
          if (value !== null) {
            return value;
          }
          
          retries++;
        }
        
        // Timeout - fallback to computing the value
        console.warn(`[Cache] Stampede protection timeout for key: ${fullKey}`);
      }

      // Double-check cache after acquiring lock (prevent redundant computation)
      const doubleCheck = await this.get<T>(key, prefix, version);
      if (doubleCheck !== null) {
        return doubleCheck;
      }

      // Compute value
      const value = await factory();

      // Store in cache
      await this.set(key, value, { ttl, keyPrefix: prefix, tags, version });

      // If using stale-while-revalidate, also store a stale version
      if (staleWhileRevalidate) {
        await this.redis.setex(
          `${fullKey}:stale`,
          ttl + staleTtl,
          JSON.stringify(value)
        );
      }

      return value;
    } finally {
      // Release lock
      if (lockAcquired) {
        await this.releaseLock(lockKey, lockValue);
      }
    }
  }

  /**
   * Acquire distributed lock using Redis
   */
  private async acquireLock(
    lockKey: string,
    lockValue: string,
    timeout: number
  ): Promise<boolean> {
    try {
      const result = await this.redis.set(lockKey, lockValue, 'PX', timeout, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error('[Cache] Lock acquisition error:', error);
      return false;
    }
  }

  /**
   * Release distributed lock (safe release using Lua script)
   */
  private async releaseLock(lockKey: string, lockValue: string): Promise<void> {
    try {
      // Use Lua script for atomic check-and-delete
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await this.redis.eval(script, 1, lockKey, lockValue);
    } catch (error) {
      console.error('[Cache] Lock release error:', error);
    }
  }

  // ========================================================================
  // INVALIDATION STRATEGIES
  // ========================================================================

  /**
   * Delete single key from cache
   */
  async delete(key: string, prefix?: string, version?: string): Promise<void> {
    if (!this.isEnabled()) return;

    const fullKey = this.generateKey(key, prefix, version);

    try {
      await this.redis.del(fullKey);
      this.invalidateLocalCache(fullKey);
      this.metrics.deletes++;
    } catch (error) {
      console.error('[Cache] Delete error:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string, prefix?: string, version?: string): Promise<void> {
    if (!this.isEnabled()) return;

    const fullPattern = this.generateKey(pattern, prefix, version);

    try {
      // Use SCAN to find keys (safer than KEYS for production)
      let cursor = '0';
      let deleted = 0;
      
      do {
        const result = await this.redis.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];
        
        if (keys.length > 0) {
          await this.redis.del(...keys);
          deleted += keys.length;
          
          // Invalidate local cache for deleted keys
          keys.forEach(key => this.invalidateLocalCache(key));
        }
      } while (cursor !== '0');

      this.metrics.deletes += deleted;
    } catch (error) {
      console.error('[Cache] Delete pattern error:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Invalidate by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    if (!this.isEnabled() || tags.length === 0) return;

    try {
      for (const tag of tags) {
        const tagKey = `tag:index:${tag}`;
        const keys = await this.redis.smembers(tagKey);
        
        if (keys.length > 0) {
          await this.redis.del(...keys);
          keys.forEach(key => this.invalidateLocalCache(key));
        }
        
        // Clean up tag index
        await this.redis.del(tagKey);
      }
    } catch (error) {
      console.error('[Cache] Tag invalidation error:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Add key to tag index
   */
  private async addToTagIndex(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      const tagKey = `tag:index:${tag}`;
      pipeline.sadd(tagKey, key);
      // Set expiry on tag index slightly longer than typical cache entries
      pipeline.expire(tagKey, 86400 * 2); // 2 days
    }
    
    await pipeline.exec();
  }

  /**
   * Clear entire cache (USE WITH CAUTION!)
   */
  async clear(): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      await this.redis.flushdb();
      this.invalidateLocalCache();
      console.warn('[Cache] Cache cleared');
    } catch (error) {
      console.error('[Cache] Clear error:', error);
      this.metrics.errors++;
    }
  }

  /**
   * Increment global cache version (nuclear option for cache invalidation)
   */
  async bumpVersion(): Promise<void> {
    const newVersion = `v${Date.now()}`;
    this.defaultVersion = newVersion;
    
    // Store version in Redis for consistency across instances
    await this.redis.set('sovereon:cache:version', newVersion);
    
    console.log(`[Cache] Version bumped to ${newVersion}`);
  }

  /**
   * Load cache version from Redis
   */
  async loadVersion(): Promise<void> {
    try {
      const version = await this.redis.get('sovereon:cache:version');
      if (version) {
        this.defaultVersion = version;
      }
    } catch (error) {
      console.error('[Cache] Failed to load version:', error);
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if key exists
   */
  async exists(key: string, prefix?: string, version?: string): Promise<boolean> {
    if (!this.isEnabled()) return false;

    const fullKey = this.generateKey(key, prefix, version);

    try {
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('[Cache] Exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async getTtl(key: string, prefix?: string, version?: string): Promise<number> {
    if (!this.isEnabled()) return -1;

    const fullKey = this.generateKey(key, prefix, version);

    try {
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error('[Cache] TTL error:', error);
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1, prefix?: string): Promise<number> {
    const fullKey = this.generateKey(key, prefix);

    try {
      return await this.redis.incrby(fullKey, amount);
    } catch (error) {
      console.error('[Cache] Increment error:', error);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, amount: number = 1, prefix?: string): Promise<number> {
    return this.increment(key, -amount, prefix);
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      stampedePreventions: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): { hitRate: number; missRate: number; totalRequests: number } {
    const total = this.metrics.hits + this.metrics.misses;
    if (total === 0) {
      return { hitRate: 0, missRate: 0, totalRequests: 0 };
    }
    
    return {
      hitRate: this.metrics.hits / total,
      missRate: this.metrics.misses / total,
      totalRequests: total,
    };
  }

  /**
   * Set cache enabled/disabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get Redis client for advanced operations
   */
  getRedis(): RedisType {
    return this.redis;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let enhancedCacheInstance: EnhancedCacheService | null = null;

/**
 * Get enhanced cache service singleton
 */
export function getEnhancedCache(): EnhancedCacheService {
  if (!enhancedCacheInstance) {
    enhancedCacheInstance = new EnhancedCacheService();
  }
  return enhancedCacheInstance;
}

/**
 * Reset cache service (useful for testing)
 */
export function resetEnhancedCache(): void {
  enhancedCacheInstance = null;
}

// ============================================================================
// DECORATOR FACTORY
// ============================================================================

/**
 * Method decorator for caching function results
 * Usage:
 *   @cached({ ttl: 300, key: 'user', tags: ['users'] })
 *   async getUser(id: string) { ... }
 */
export function cached(options: CacheGetOrSetOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = getEnhancedCache();

    descriptor.value = async function (...args: any[]) {
      // Generate cache key from method name and arguments
      const keyParts = [propertyKey];
      if (args.length > 0) {
        keyParts.push(JSON.stringify(args));
      }
      const cacheKey = keyParts.join(':');

      return cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CACHE_TTL as TTL };
export default EnhancedCacheService;
