/**
 * ============================================================================
 * CACHE WARMER
 * ============================================================================
 * Pre-populates cache with critical data on startup and provides
 * periodic cache refresh capabilities for optimal performance.
 */

import { getEnhancedCache, CACHE_TTL } from '../config/cache';
import type { EnhancedCacheService } from '../config/cache';
import { getPrismaClient } from '../database/client';
import type { PrismaClient } from '@prisma/client';

// ============================================================================
// TYPES
// ============================================================================

export interface WarmableQuery {
  /** Unique identifier for this query */
  id: string;
  /** Query name for logging */
  name: string;
  /** Priority (lower = warmed first) */
  priority?: number;
  /** Query execution function */
  query: (prisma: PrismaClient) => Promise<any>;
  /** Cache key */
  cacheKey: string;
  /** Cache prefix */
  keyPrefix: string;
  /** Cache TTL */
  ttl?: number;
  /** Cache tags */
  tags?: string[];
  /** Enable stale-while-revalidate */
  staleWhileRevalidate?: boolean;
  /** Dependencies (other query IDs that must complete first) */
  dependencies?: string[];
  /** Condition to check before warming */
  condition?: () => boolean | Promise<boolean>;
  /** Maximum retries on failure */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
}

export interface CacheWarmerConfig {
  /** Enable automatic warming on startup */
  warmOnStartup?: boolean;
  /** Enable periodic warming */
  enablePeriodicWarm?: boolean;
  /** Interval for periodic warming (ms) */
  periodicInterval?: number;
  /** Warm critical data only */
  criticalOnly?: boolean;
  /** Log warming progress */
  verbose?: boolean;
}

export interface WarmResult {
  id: string;
  name: string;
  success: boolean;
  duration: number;
  cacheKey: string;
  error?: string;
  warmedAt: Date;
}

// ============================================================================
// CACHE WARMER CLASS
// ============================================================================

export class CacheWarmer {
  private cache: EnhancedCacheService;
  private prisma: PrismaClient;
  private queries: Map<string, WarmableQuery>;
  private results: Map<string, WarmResult>;
  private isRunning: boolean;
  private periodicTimer?: NodeJS.Timeout;
  private config: Required<CacheWarmerConfig>;

  constructor(
    config: CacheWarmerConfig = {},
    cache?: EnhancedCacheService,
    prisma?: PrismaClient
  ) {
    this.cache = cache || getEnhancedCache();
    this.prisma = prisma || getPrismaClient();
    this.queries = new Map();
    this.results = new Map();
    this.isRunning = false;
    
    this.config = {
      warmOnStartup: true,
      enablePeriodicWarm: false,
      periodicInterval: 5 * 60 * 1000, // 5 minutes
      criticalOnly: false,
      verbose: process.env.NODE_ENV === 'development',
      ...config,
    };
  }

  // ========================================================================
  // QUERY REGISTRATION
  // ========================================================================

  /**
   * Register a query for cache warming
   */
  register(query: WarmableQuery): void {
    this.queries.set(query.id, {
      priority: 100,
      ttl: CACHE_TTL.STATIC,
      maxRetries: 3,
      retryDelay: 1000,
      ...query,
    });

    if (this.config.verbose) {
      console.log(`[CacheWarmer] Registered query: ${query.name} (${query.id})`);
    }
  }

  /**
   * Register multiple queries
   */
  registerMany(queries: WarmableQuery[]): void {
    for (const query of queries) {
      this.register(query);
    }
  }

  /**
   * Unregister a query
   */
  unregister(queryId: string): boolean {
    return this.queries.delete(queryId);
  }

  /**
   * Clear all registered queries
   */
  clear(): void {
    this.queries.clear();
    this.results.clear();
  }

  // ========================================================================
  // CACHE WARMING
  // ========================================================================

  /**
   * Warm cache with all registered queries
   */
  async warmAll(options?: {
    parallel?: boolean;
    batchSize?: number;
  }): Promise<WarmResult[]> {
    if (this.isRunning) {
      console.warn('[CacheWarmer] Warming already in progress');
      return Array.from(this.results.values());
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      // Sort queries by priority
      const sortedQueries = Array.from(this.queries.values()).sort(
        (a, b) => (a.priority || 100) - (b.priority || 100)
      );

      if (this.config.verbose) {
        console.log(`[CacheWarmer] Starting cache warming for ${sortedQueries.length} queries...`);
      }

      const results: WarmResult[] = [];

      if (options?.parallel !== false) {
        // Execute in parallel with dependency resolution
        results.push(...(await this.warmInParallel(sortedQueries)));
      } else {
        // Execute sequentially
        for (const query of sortedQueries) {
          results.push(await this.warmQuery(query));
        }
      }

      const duration = Date.now() - startTime;
      const successCount = results.filter(r => r.success).length;

      console.log(
        `[CacheWarmer] Warming complete: ${successCount}/${results.length} queries warmed in ${duration}ms`
      );

      return results;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Warm a single query by ID
   */
  async warmById(queryId: string): Promise<WarmResult | null> {
    const query = this.queries.get(queryId);
    if (!query) {
      console.warn(`[CacheWarmer] Query not found: ${queryId}`);
      return null;
    }

    return this.warmQuery(query);
  }

  /**
   * Warm queries by tag
   */
  async warmByTag(tag: string): Promise<WarmResult[]> {
    const queries = Array.from(this.queries.values()).filter(
      q => q.tags?.includes(tag)
    );

    const results: WarmResult[] = [];
    for (const query of queries) {
      results.push(await this.warmQuery(query));
    }

    return results;
  }

  /**
   * Execute query warming with retries
   */
  private async warmQuery(query: WarmableQuery): Promise<WarmResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;
    let success = false;

    // Check condition if provided
    if (query.condition) {
      const conditionMet = await query.condition();
      if (!conditionMet) {
        return {
          id: query.id,
          name: query.name,
          success: true,
          duration: 0,
          cacheKey: query.cacheKey,
          warmedAt: new Date(),
        };
      }
    }

    // Execute with retries
    const maxRetries = query.maxRetries || 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Execute query
        const data = await query.query(this.prisma);

        // Store in cache
        await this.cache.set(query.cacheKey, data, {
          ttl: query.ttl,
          keyPrefix: query.keyPrefix,
          tags: query.tags,
        });

        success = true;

        if (this.config.verbose) {
          console.log(`[CacheWarmer] ✓ Warmed: ${query.name}`);
        }

        break;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = (query.retryDelay || 1000) * attempt;
          if (this.config.verbose) {
            console.log(`[CacheWarmer] Retry ${attempt}/${maxRetries} for ${query.name} in ${delay}ms`);
          }
          await this.delay(delay);
        }
      }
    }

    const result: WarmResult = {
      id: query.id,
      name: query.name,
      success,
      duration: Date.now() - startTime,
      cacheKey: query.cacheKey,
      error: lastError?.message,
      warmedAt: new Date(),
    };

    this.results.set(query.id, result);

    if (!success && this.config.verbose) {
      console.error(`[CacheWarmer] ✗ Failed to warm: ${query.name} - ${lastError?.message}`);
    }

    return result;
  }

  /**
   * Warm queries in parallel with dependency resolution
   */
  private async warmInParallel(queries: WarmableQuery[]): Promise<WarmResult[]> {
    const results: WarmResult[] = [];
    const completed = new Set<string>();
    const inProgress = new Set<string>();

    // Build dependency graph
    const dependencyMap = new Map<string, string[]>();
    for (const query of queries) {
      dependencyMap.set(
        query.id,
        query.dependencies?.filter(d => this.queries.has(d)) || []
      );
    }

    // Process queries that have no pending dependencies
    const processReadyQueries = async (): Promise<void> => {
      const readyQueries = queries.filter(
        q =>
          !completed.has(q.id) &&
          !inProgress.has(q.id) &&
          dependencyMap.get(q.id)?.every(depId => completed.has(depId))
      );

      if (readyQueries.length === 0) return;

      // Mark as in progress
      readyQueries.forEach(q => inProgress.add(q.id));

      // Execute in parallel
      const batchResults = await Promise.all(
        readyQueries.map(q => this.warmQuery(q))
      );

      results.push(...batchResults);
      readyQueries.forEach(q => {
        completed.add(q.id);
        inProgress.delete(q.id);
      });
    };

    // Process all queries
    while (completed.size < queries.length) {
      const previousCount = completed.size;
      await processReadyQueries();

      // Check for circular dependencies or stuck state
      if (completed.size === previousCount) {
        const stuckQueries = queries.filter(q => !completed.has(q.id));
        console.error(
          `[CacheWarmer] Circular dependency detected for queries:`,
          stuckQueries.map(q => q.id)
        );
        break;
      }
    }

    return results;
  }

  // ========================================================================
  // PERIODIC WARMING
  // ========================================================================

  /**
   * Start periodic cache warming
   */
  startPeriodicWarm(): void {
    if (this.periodicTimer) {
      console.warn('[CacheWarmer] Periodic warming already started');
      return;
    }

    if (!this.config.enablePeriodicWarm) {
      console.warn('[CacheWarmer] Periodic warming is disabled');
      return;
    }

    console.log(`[CacheWarmer] Starting periodic warming (interval: ${this.config.periodicInterval}ms)`);

    this.periodicTimer = setInterval(async () => {
      try {
        await this.warmAll();
      } catch (error) {
        console.error('[CacheWarmer] Periodic warming error:', error);
      }
    }, this.config.periodicInterval);

    // Prevent timer from keeping process alive
    if (this.periodicTimer.unref) {
      this.periodicTimer.unref();
    }
  }

  /**
   * Stop periodic cache warming
   */
  stopPeriodicWarm(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = undefined;
      console.log('[CacheWarmer] Periodic warming stopped');
    }
  }

  /**
   * Check if periodic warming is active
   */
  isPeriodicActive(): boolean {
    return !!this.periodicTimer;
  }

  // ========================================================================
  // BACKGROUND UPDATES
  // ========================================================================

  /**
   * Schedule a background cache update (non-blocking)
   */
  scheduleBackgroundUpdate(
    queryId: string,
    delay: number = 0
  ): Promise<WarmResult | null> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.warmById(queryId);
        resolve(result);
      }, delay);
    });
  }

  /**
   * Refresh stale cache entries in background
   */
  async refreshStaleEntries(): Promise<void> {
    const staleQueries = Array.from(this.queries.values()).filter(
      q => q.staleWhileRevalidate
    );

    for (const query of staleQueries) {
      // Check if entry is stale (near expiration)
      const ttl = await this.cache.getTtl(query.cacheKey, query.keyPrefix);
      
      if (ttl > 0 && ttl < (query.ttl || CACHE_TTL.STATIC) * 0.2) {
        // Refresh in background
        this.scheduleBackgroundUpdate(query.id).catch(console.error);
      }
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get warming results
   */
  getResults(): WarmResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Get last result for a specific query
   */
  getResult(queryId: string): WarmResult | undefined {
    return this.results.get(queryId);
  }

  /**
   * Check if warming is in progress
   */
  isWarming(): boolean {
    return this.isRunning;
  }

  /**
   * Get registered queries
   */
  getQueries(): WarmableQuery[] {
    return Array.from(this.queries.values());
  }

  /**
   * Get warmer status
   */
  getStatus(): {
    isRunning: boolean;
    queryCount: number;
    completedCount: number;
    periodicActive: boolean;
  } {
    return {
      isRunning: this.isRunning,
      queryCount: this.queries.size,
      completedCount: this.results.size,
      periodicActive: this.isPeriodicActive(),
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let cacheWarmerInstance: CacheWarmer | null = null;

/**
 * Get cache warmer singleton
 */
export function getCacheWarmer(config?: CacheWarmerConfig): CacheWarmer {
  if (!cacheWarmerInstance) {
    cacheWarmerInstance = new CacheWarmer(config);
  }
  return cacheWarmerInstance;
}

/**
 * Reset cache warmer (useful for testing)
 */
export function resetCacheWarmer(): void {
  if (cacheWarmerInstance) {
    cacheWarmerInstance.stopPeriodicWarm();
  }
  cacheWarmerInstance = null;
}

// ============================================================================
// PRE-CONFIGURED WARMING STRATEGIES
// ============================================================================

/**
 * Create default warming queries for CMS content
 */
export function createCMSWarmingQueries(prisma: PrismaClient): WarmableQuery[] {
  return [
    {
      id: 'cms:services',
      name: 'CMS Services List',
      priority: 10,
      query: (p) => p.serviceCMS.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { order: 'asc' },
      }),
      cacheKey: 'list:all',
      keyPrefix: 'api:services',
      ttl: CACHE_TTL.SERVICES,
      tags: ['services', 'cms'],
    },
    {
      id: 'cms:team',
      name: 'Team Members List',
      priority: 10,
      query: (p) => p.teamMember.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      cacheKey: 'list:all',
      keyPrefix: 'api:team',
      ttl: CACHE_TTL.TEAM_MEMBERS,
      tags: ['team', 'cms'],
    },
    {
      id: 'cms:testimonials',
      name: 'Testimonials List',
      priority: 20,
      query: (p) => p.testimonial.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      cacheKey: 'list:all',
      keyPrefix: 'api:testimonials',
      ttl: CACHE_TTL.TESTIMONIALS,
      tags: ['testimonials', 'cms'],
    },
    {
      id: 'cms:faqs',
      name: 'FAQs List',
      priority: 30,
      query: (p) => p.fAQ.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      cacheKey: 'list:all',
      keyPrefix: 'api:faqs',
      ttl: CACHE_TTL.FAQS,
      tags: ['faqs', 'cms'],
    },
    {
      id: 'cms:categories',
      name: 'Service Categories',
      priority: 5,
      query: (p) => p.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      cacheKey: 'categories:all',
      keyPrefix: 'api:services',
      ttl: CACHE_TTL.STATIC,
      tags: ['services', 'categories', 'cms'],
    },
  ];
}

/**
 * Initialize cache warming for the application
 */
export async function initializeCacheWarming(
  prisma?: PrismaClient
): Promise<CacheWarmer> {
  const client = prisma || getPrismaClient();
  const warmer = getCacheWarmer({ warmOnStartup: true });

  // Register CMS warming queries
  const cmsQueries = createCMSWarmingQueries(client);
  warmer.registerMany(cmsQueries);

  // Warm on startup if enabled
  if (warmer['config'].warmOnStartup) {
    // Delay slightly to allow app to start
    setTimeout(() => {
      warmer.warmAll().catch(console.error);
    }, 5000);
  }

  return warmer;
}

export default CacheWarmer;
