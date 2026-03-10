/**
 * ============================================================================
 * CACHED REPOSITORY - Repository Caching Decorator
 * ============================================================================
 * Wrapper class that adds intelligent caching capabilities to any repository.
 * Provides automatic cache key generation, write-through caching, and
 * comprehensive invalidation strategies.
 */

import { getEnhancedCache, CACHE_TTL } from '../config/cache';
import type { EnhancedCacheService, CacheGetOrSetOptions } from '../config/cache';
import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RepositoryCacheConfig {
  /** Cache key prefix for this repository */
  keyPrefix: string;
  /** Default TTL for cached items (seconds) */
  defaultTtl?: number;
  /** Cache tags for tag-based invalidation */
  tags?: string[];
  /** Auto-invalidate on write operations */
  autoInvalidate?: boolean;
  /** Cache version for global invalidation */
  version?: string;
  /** Enable stampede protection */
  stampedeProtection?: boolean;
}

export interface CacheableMethodOptions {
  /** Cache TTL (seconds) */
  ttl?: number;
  /** Custom cache key */
  key?: string;
  /** Cache tags */
  tags?: string[];
  /** Skip cache for this call */
  skipCache?: boolean;
  /** Enable stale-while-revalidate pattern */
  staleWhileRevalidate?: boolean;
}

// ============================================================================
// METHOD DECORATOR
// ============================================================================

/**
 * Decorator to cache method results
 * Usage:
 *   @cacheable({ ttl: 300, key: 'findAll', tags: ['users'] })
 *   async findAll() { ... }
 */
export function cacheable(options: CacheableMethodOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = getEnhancedCache();

    descriptor.value = async function (...args: any[]) {
      const config = (this as any).cacheConfig as RepositoryCacheConfig;
      
      // Skip if cache disabled for this repository or method
      if (!cache.isEnabled() || options.skipCache) {
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const cacheKey = options.key 
        ? `${propertyKey}:${options.key}`
        : generateMethodCacheKey(propertyKey, args);

      const prefix = config?.keyPrefix;
      const ttl = options.ttl || config?.defaultTtl || CACHE_TTL.DYNAMIC;
      const tags = [...(config?.tags || []), ...(options.tags || [])];
      const version = config?.version;

      // Use getOrSet with stampede protection
      return cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        {
          ttl,
          keyPrefix: prefix,
          tags,
          version,
          lockTimeout: config?.stampedeProtection !== false ? 10000 : undefined,
        }
      );
    };

    // Store metadata for introspection
    descriptor.value._cacheable = options;

    return descriptor;
  };
}

/**
 * Generate cache key from method arguments
 */
function generateMethodCacheKey(method: string, args: any[]): string {
  if (args.length === 0) {
    return method;
  }

  // Hash arguments for key
  const argsHash = args
    .map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        // Sort keys for consistent hashing
        return JSON.stringify(arg, Object.keys(arg).sort());
      }
      return String(arg);
    })
    .join(':');

  return `${method}:${argsHash}`;
}

// ============================================================================
// INVALIDATION DECORATOR
// ============================================================================

/**
 * Decorator to invalidate cache after method execution
 * Usage:
 *   @invalidate({ patterns: ['findAll*'], tags: ['users'] })
 *   async create(data) { ... }
 */
export function invalidate(options: {
  patterns?: string[];
  tags?: string[];
  all?: boolean;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = getEnhancedCache();

    descriptor.value = async function (...args: any[]) {
      const config = (this as any).cacheConfig as RepositoryCacheConfig;
      const result = await originalMethod.apply(this, args);

      // Perform invalidation
      try {
        if (options.all) {
          // Invalidate all entries for this repository
          await cache.deletePattern('*', config?.keyPrefix);
        } else {
          // Invalidate by patterns
          if (options.patterns) {
            for (const pattern of options.patterns) {
              await cache.deletePattern(pattern, config?.keyPrefix);
            }
          }

          // Invalidate by tags
          if (options.tags || config?.tags) {
            const tagsToInvalidate = [
              ...(options.tags || []),
              ...(config?.tags || []),
            ];
            if (tagsToInvalidate.length > 0) {
              await cache.invalidateByTags(tagsToInvalidate);
            }
          }
        }
      } catch (error) {
        console.error('[CachedRepository] Invalidation error:', error);
      }

      return result;
    };

    return descriptor;
  };
}

// ============================================================================
// CACHED REPOSITORY WRAPPER
// ============================================================================

/**
 * Cached Repository Wrapper
 * Wraps any repository to add caching capabilities
 */
export class CachedRepositoryWrapper<T, CreateInput, UpdateInput, WhereUniqueInput> {
  protected repository: BaseRepository<T, CreateInput, UpdateInput, WhereUniqueInput>;
  protected cache: EnhancedCacheService;
  protected config: RepositoryCacheConfig;

  constructor(
    repository: BaseRepository<T, CreateInput, UpdateInput, WhereUniqueInput>,
    config: RepositoryCacheConfig,
    cache?: EnhancedCacheService
  ) {
    this.repository = repository;
    this.cache = cache || getEnhancedCache();
    this.config = {
      autoInvalidate: true,
      stampedeProtection: true,
      ...config,
    };
  }

  // ========================================================================
  // CACHED READ OPERATIONS
  // ========================================================================

  /**
   * Find by ID with caching
   */
  async findById(
    id: string,
    options?: { include?: Record<string, any> } & CacheableMethodOptions
  ): Promise<T | null> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.findById(id, options);
    }

    const key = cacheOptions.key || `id:${id}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.findById(id, options),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.DYNAMIC)
    );
  }

  /**
   * Find unique with caching
   */
  async findUnique(
    where: WhereUniqueInput,
    options?: { include?: Record<string, any> } & CacheableMethodOptions
  ): Promise<T | null> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.findUnique(where, options);
    }

    const key = cacheOptions.key || `unique:${JSON.stringify(where)}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.findUnique(where, options),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.DYNAMIC)
    );
  }

  /**
   * Find first with caching
   */
  async findFirst(
    where: Record<string, any>,
    options?: { include?: Record<string, any> } & CacheableMethodOptions
  ): Promise<T | null> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.findFirst(where, options);
    }

    const key = cacheOptions.key || `first:${JSON.stringify(where)}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.findFirst(where, options),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.DYNAMIC)
    );
  }

  /**
   * Find all with caching (typically longer TTL for lists)
   */
  async findAll(
    options?: QueryOptions & CacheableMethodOptions
  ): Promise<T[]> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.findAll(options);
    }

    const key = cacheOptions.key || `all:${this.hashQueryOptions(options)}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.findAll(options),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.STATIC)
    );
  }

  /**
   * Find paginated with caching
   */
  async findPaginated(
    options?: QueryOptions & CacheableMethodOptions
  ): Promise<PaginatedResult<T>> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.findPaginated(options);
    }

    const key = cacheOptions.key || `paginated:${this.hashQueryOptions(options)}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.findPaginated(options),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.STATIC)
    );
  }

  /**
   * Count with caching (shorter TTL as it changes frequently)
   */
  async count(
    where?: Record<string, any>,
    options?: CacheableMethodOptions
  ): Promise<number> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.count(where);
    }

    const key = cacheOptions.key || `count:${JSON.stringify(where || {})}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.count(where),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.DYNAMIC)
    );
  }

  /**
   * Check if exists with caching
   */
  async exists(
    where: Record<string, any>,
    options?: CacheableMethodOptions
  ): Promise<boolean> {
    const cacheOptions = this.extractCacheOptions(options);
    
    if (cacheOptions.skipCache) {
      return this.repository.exists(where);
    }

    const key = cacheOptions.key || `exists:${JSON.stringify(where)}`;

    return this.cache.getOrSet(
      key,
      () => this.repository.exists(where),
      this.buildCacheOptions(cacheOptions, CACHE_TTL.DYNAMIC)
    );
  }

  // ========================================================================
  // WRITE OPERATIONS WITH AUTO-INVALIDATION
  // ========================================================================

  /**
   * Create with cache invalidation
   */
  async create(data: CreateInput): Promise<T> {
    const result = await this.repository.create(data);
    
    if (this.config.autoInvalidate) {
      await this.invalidateListCaches();
    }
    
    return result;
  }

  /**
   * Create many with cache invalidation
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    const result = await this.repository.createMany(data);
    
    if (this.config.autoInvalidate) {
      await this.invalidateListCaches();
    }
    
    return result;
  }

  /**
   * Update with cache invalidation
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    const result = await this.repository.update(id, data);
    
    if (this.config.autoInvalidate) {
      await this.invalidateEntityCache(id);
    }
    
    return result;
  }

  /**
   * Update where with cache invalidation
   */
  async updateWhere(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    const result = await this.repository.updateWhere(where, data);
    
    if (this.config.autoInvalidate) {
      await this.invalidateAllCaches();
    }
    
    return result;
  }

  /**
   * Update many with cache invalidation
   */
  async updateMany(
    where: Record<string, any>,
    data: UpdateInput
  ): Promise<{ count: number }> {
    const result = await this.repository.updateMany(where, data);
    
    if (this.config.autoInvalidate) {
      await this.invalidateAllCaches();
    }
    
    return result;
  }

  /**
   * Delete with cache invalidation
   */
  async delete(id: string): Promise<T> {
    const result = await this.repository.delete(id);
    
    if (this.config.autoInvalidate) {
      await this.invalidateEntityCache(id);
    }
    
    return result;
  }

  /**
   * Delete where with cache invalidation
   */
  async deleteWhere(where: WhereUniqueInput): Promise<T> {
    const result = await this.repository.deleteWhere(where);
    
    if (this.config.autoInvalidate) {
      await this.invalidateAllCaches();
    }
    
    return result;
  }

  /**
   * Delete many with cache invalidation
   */
  async deleteMany(where: Record<string, any>): Promise<{ count: number }> {
    const result = await this.repository.deleteMany(where);
    
    if (this.config.autoInvalidate) {
      await this.invalidateAllCaches();
    }
    
    return result;
  }

  // ========================================================================
  // TRANSACTION OPERATIONS
  // ========================================================================

  /**
   * Execute transaction (no caching)
   */
  async transaction<R>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<R>
  ): Promise<R> {
    return this.repository.transaction(fn);
  }

  // ========================================================================
  // CACHE MANAGEMENT
  // ========================================================================

  /**
   * Invalidate cache for a specific entity
   */
  async invalidateEntityCache(id: string): Promise<void> {
    // Invalidate specific entity
    await this.cache.deletePattern(`id:${id}*`, this.config.keyPrefix);
    
    // Invalidate list caches
    await this.invalidateListCaches();
  }

  /**
   * Invalidate all list caches
   */
  async invalidateListCaches(): Promise<void> {
    await this.cache.deletePattern('all:*', this.config.keyPrefix);
    await this.cache.deletePattern('paginated:*', this.config.keyPrefix);
    await this.cache.deletePattern('count:*', this.config.keyPrefix);
    await this.cache.deletePattern('first:*', this.config.keyPrefix);
  }

  /**
   * Invalidate all caches for this repository
   */
  async invalidateAllCaches(): Promise<void> {
    await this.cache.deletePattern('*', this.config.keyPrefix);
    
    if (this.config.tags) {
      await this.cache.invalidateByTags(this.config.tags);
    }
  }

  /**
   * Warm cache for specific queries
   */
  async warmCache(
    queries: Array<{
      method: 'findAll' | 'findById' | 'findPaginated';
      args?: any[];
      ttl?: number;
    }>
  ): Promise<void> {
    for (const query of queries) {
      try {
        switch (query.method) {
          case 'findAll':
            await this.findAll({ ...query.args?.[0], skipCache: false });
            break;
          case 'findById':
            if (query.args?.[0]) {
              await this.findById(query.args[0]);
            }
            break;
          case 'findPaginated':
            await this.findPaginated(query.args?.[0]);
            break;
        }
      } catch (error) {
        console.error(`[CachedRepository] Cache warming failed for ${query.method}:`, error);
      }
    }
  }

  /**
   * Get cache metrics for this repository
   */
  getCacheMetrics() {
    return {
      config: this.config,
      stats: this.cache.getStats(),
    };
  }

  // ========================================================================
  // PRIVATE HELPERS
  // ========================================================================

  private extractCacheOptions(
    options?: Record<string, any>
  ): CacheableMethodOptions {
    if (!options) return {};
    
    const {
      ttl,
      key,
      tags,
      skipCache,
      staleWhileRevalidate,
      ...repositoryOptions
    } = options;

    // Store remaining options for repository call
    Object.assign(options, repositoryOptions);

    return { ttl, key, tags, skipCache, staleWhileRevalidate };
  }

  private buildCacheOptions(
    options: CacheableMethodOptions,
    defaultTtl: number
  ): CacheGetOrSetOptions {
    return {
      ttl: options.ttl || this.config.defaultTtl || defaultTtl,
      keyPrefix: this.config.keyPrefix,
      tags: [...(this.config.tags || []), ...(options.tags || [])],
      version: this.config.version,
    };
  }

  private hashQueryOptions(options?: QueryOptions): string {
    if (!options) return 'default';
    
    // Create deterministic hash of query options
    const sorted = JSON.stringify(options, Object.keys(options).sort());
    return sorted.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  }
}

// ============================================================================
// BASE CACHED REPOSITORY CLASS
// ============================================================================

/**
 * Base class for cached repositories
 * Extend this class to create a repository with built-in caching
 */
export abstract class CachedRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereUniqueInput
> extends BaseRepository<T, CreateInput, UpdateInput, WhereUniqueInput> {
  protected cache: EnhancedCacheService;
  protected cacheConfig: RepositoryCacheConfig;

  constructor(
    config: RepositoryCacheConfig,
    prismaClient?: PrismaClient,
    cache?: EnhancedCacheService
  ) {
    super(prismaClient);
    this.cache = cache || getEnhancedCache();
    this.cacheConfig = {
      autoInvalidate: true,
      stampedeProtection: true,
      defaultTtl: CACHE_TTL.DYNAMIC,
      ...config,
    };
  }

  // ========================================================================
  // CACHED READ METHODS (Override base class methods)
  // ========================================================================

  async findById(
    id: string,
    options?: { include?: Record<string, any> }
  ): Promise<T | null> {
    const key = `id:${id}`;
    
    return this.cache.getOrSet(
      key,
      () => super.findById(id, options),
      {
        ttl: this.cacheConfig.defaultTtl,
        keyPrefix: this.cacheConfig.keyPrefix,
        tags: this.cacheConfig.tags,
        version: this.cacheConfig.version,
      }
    );
  }

  async findAll(options?: QueryOptions): Promise<T[]> {
    const key = `all:${this.hashOptions(options)}`;
    
    return this.cache.getOrSet(
      key,
      () => super.findAll(options),
      {
        ttl: CACHE_TTL.STATIC,
        keyPrefix: this.cacheConfig.keyPrefix,
        tags: this.cacheConfig.tags,
        version: this.cacheConfig.version,
      }
    );
  }

  async findPaginated(options?: QueryOptions): Promise<PaginatedResult<T>> {
    const key = `paginated:${this.hashOptions(options)}`;
    
    return this.cache.getOrSet(
      key,
      () => super.findPaginated(options),
      {
        ttl: CACHE_TTL.STATIC,
        keyPrefix: this.cacheConfig.keyPrefix,
        tags: this.cacheConfig.tags,
        version: this.cacheConfig.version,
      }
    );
  }

  // ========================================================================
  // WRITE METHODS WITH INVALIDATION
  // ========================================================================

  async create(data: CreateInput): Promise<T> {
    const result = await super.create(data);
    await this.invalidateLists();
    return result;
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    const result = await super.update(id, data);
    await this.invalidateEntity(id);
    return result;
  }

  async delete(id: string): Promise<T> {
    const result = await super.delete(id);
    await this.invalidateEntity(id);
    return result;
  }

  // ========================================================================
  // CACHE MANAGEMENT HELPERS
  // ========================================================================

  protected async invalidateEntity(id: string): Promise<void> {
    await this.cache.deletePattern(`id:${id}*`, this.cacheConfig.keyPrefix);
    await this.invalidateLists();
  }

  protected async invalidateLists(): Promise<void> {
    await this.cache.deletePattern('all:*', this.cacheConfig.keyPrefix);
    await this.cache.deletePattern('paginated:*', this.cacheConfig.keyPrefix);
  }

  protected async invalidateAll(): Promise<void> {
    await this.cache.deletePattern('*', this.cacheConfig.keyPrefix);
    if (this.cacheConfig.tags) {
      await this.cache.invalidateByTags(this.cacheConfig.tags);
    }
  }

  private hashOptions(options?: QueryOptions): string {
    if (!options) return 'default';
    return JSON.stringify(options, Object.keys(options).sort())
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 100);
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a cached wrapper for any repository
 */
export function withCaching<T, CreateInput, UpdateInput, WhereUniqueInput>(
  repository: BaseRepository<T, CreateInput, UpdateInput, WhereUniqueInput>,
  config: RepositoryCacheConfig
): CachedRepositoryWrapper<T, CreateInput, UpdateInput, WhereUniqueInput> {
  return new CachedRepositoryWrapper(repository, config);
}

export default CachedRepositoryWrapper;
