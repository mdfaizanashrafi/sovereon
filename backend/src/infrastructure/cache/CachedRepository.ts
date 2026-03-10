/**
 * ============================================================================
 * CACHED REPOSITORY DECORATOR
 * ============================================================================
 * Adds caching capabilities to any repository
 */

import { CacheService, DEFAULT_TTLS } from './CacheService';
import type { QueryOptions, PaginatedResult } from '../../repositories/BaseRepository';

/**
 * Cache configuration for repository methods
 */
export interface RepositoryCacheConfig {
  ttl?: number;
  keyPrefix: string;
  invalidateOnUpdate?: boolean;
}

/**
 * Abstract cached repository base class
 * Extend this instead of BaseRepository for caching
 */
export abstract class CachedRepository<T> {
  protected cache: CacheService;
  protected cacheConfig: RepositoryCacheConfig;

  constructor(config: RepositoryCacheConfig, cache?: CacheService) {
    this.cache = cache || new CacheService();
    this.cacheConfig = {
      invalidateOnUpdate: true,
      ...config,
    };
  }

  /**
   * Generate cache key for method call
   */
  protected generateCacheKey(method: string, ...args: any[]): string {
    const argsHash = args.length > 0 
      ? ':' + JSON.stringify(args).replace(/[^a-zA-Z0-9]/g, '_')
      : '';
    return `${this.cacheConfig.keyPrefix}:${method}${argsHash}`;
  }

  /**
   * Invalidate all cache entries for this repository
   */
  protected async invalidateCache(): Promise<void> {
    if (this.cacheConfig.invalidateOnUpdate) {
      await this.cache.deletePattern('*', this.cacheConfig.keyPrefix);
    }
  }

  /**
   * Get or set cache
   */
  protected async getOrSetCache<R>(
    key: string,
    factory: () => Promise<R>,
    ttl?: number
  ): Promise<R> {
    return this.cache.getOrSet(
      key,
      factory,
      ttl || this.cacheConfig.ttl || DEFAULT_TTLS.CMS_CONTENT,
      this.cacheConfig.keyPrefix
    );
  }
}

export default CachedRepository;
