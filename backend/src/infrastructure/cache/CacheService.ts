/**
 * ============================================================================
 * CACHE SERVICE
 * ============================================================================
 * High-level caching abstraction with multiple strategies
 */

import { getRedisClient } from './redis';
import type { Redis } from 'ioredis';

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix?: string;
  tags?: string[]; // For cache invalidation by tag
}

/**
 * Default cache TTLs by resource type
 */
export const DEFAULT_TTLS = {
  CMS_CONTENT: 300,      // 5 minutes
  TEAM_MEMBERS: 300,     // 5 minutes
  SERVICES: 600,         // 10 minutes
  TESTIMONIALS: 900,     // 15 minutes
  FAQS: 1800,            // 30 minutes
  SETTINGS: 3600,        // 1 hour
  USER_SESSION: 86400,   // 24 hours
  API_RESPONSE: 60,      // 1 minute (for dynamic content)
} as const;

/**
 * Cache service for application-wide caching
 */
export class CacheService {
  private redis: Redis;
  private enabled: boolean;

  constructor(redis?: Redis) {
    this.redis = redis || getRedisClient();
    this.enabled = process.env.CACHE_ENABLED !== 'false';
  }

  /**
   * Check if caching is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generate cache key
   */
  private generateKey(key: string, prefix?: string): string {
    const basePrefix = 'sovereon:';
    const fullPrefix = prefix ? `${basePrefix}${prefix}:` : basePrefix;
    return `${fullPrefix}${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const fullKey = this.generateKey(key, prefix);
      const value = await this.redis.get(fullKey);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('[Cache] Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = DEFAULT_TTLS.CMS_CONTENT,
    prefix?: string
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const fullKey = this.generateKey(key, prefix);
      const serialized = JSON.stringify(value);
      
      await this.redis.setex(fullKey, ttl, serialized);
    } catch (error) {
      console.error('[Cache] Set error:', error);
    }
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = DEFAULT_TTLS.CMS_CONTENT,
    prefix?: string
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, prefix);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await factory();

    // Store in cache
    await this.set(key, value, ttl, prefix);

    return value;
  }

  /**
   * Delete key from cache
   */
  async delete(key: string, prefix?: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const fullKey = this.generateKey(key, prefix);
      await this.redis.del(fullKey);
    } catch (error) {
      console.error('[Cache] Delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string, prefix?: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const fullPattern = this.generateKey(pattern, prefix);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('[Cache] Delete pattern error:', error);
    }
  }

  /**
   * Clear entire cache (use with caution!)
   */
  async clear(): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('[Cache] Clear error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const fullKey = this.generateKey(key, prefix);
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
  async getTtl(key: string, prefix?: string): Promise<number> {
    if (!this.enabled) return -1;

    try {
      const fullKey = this.generateKey(key, prefix);
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
    try {
      const fullKey = this.generateKey(key, prefix);
      return await this.redis.incrby(fullKey, amount);
    } catch (error) {
      console.error('[Cache] Increment error:', error);
      return 0;
    }
  }

  /**
   * Set cache enabled/disabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
let cacheServiceInstance: CacheService | null = null;

/**
 * Get cache service singleton
 */
export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
}

/**
 * Reset cache service (useful for testing)
 */
export function resetCacheService(): void {
  cacheServiceInstance = null;
}

export default CacheService;
