/**
 * ============================================================================
 * CACHE MIDDLEWARE - HTTP Response Caching
 * ============================================================================
 * Express middleware for caching HTTP responses with configurable TTL,
 * cache key generation, invalidation hooks, and cache status headers.
 */

import { Request, Response, NextFunction } from 'express';
import { getEnhancedCache, CACHE_TTL } from '../config/cache';
import type { EnhancedCacheService } from '../config/cache';
import crypto from 'crypto';

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export interface CacheMiddlewareOptions {
  ttl?: number;
  keyPrefix?: string;
  tags?: readonly string[];
  version?: string;
  includeUser?: boolean;
  includeHeaders?: string[];
  varyByQuery?: string[];
  condition?: (req: Request) => boolean;
  onHit?: (req: Request, key: string) => void;
  onMiss?: (req: Request, key: string) => void;
}

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string | number | string[]>;
  body: any;
  cachedAt: number;
  etag?: string;
}

// ============================================================================
// CACHE KEY GENERATION
// ============================================================================

/**
 * Generate cache key from request
 */
function generateCacheKey(
  req: Request,
  options: CacheMiddlewareOptions = {}
): string {
  const {
    includeUser = true,
    varyByQuery = [],
  } = options;

  const url = req.originalUrl || req.url;
  const method = req.method;
  
  // Build query string component
  let queryComponent = '';
  if (Object.keys(req.query).length > 0) {
    if (varyByQuery.length > 0) {
      // Only include specified query parameters
      const filtered: Record<string, any> = {};
      for (const key of varyByQuery) {
        if (key in req.query) {
          filtered[key] = req.query[key];
        }
      }
      if (Object.keys(filtered).length > 0) {
        queryComponent = ':' + JSON.stringify(filtered);
      }
    } else {
      // Include all query params
      queryComponent = ':' + JSON.stringify(req.query);
    }
  }
  
  // Include user ID for authenticated requests
  let userComponent = '';
  if (includeUser) {
    const userId = (req as any).user?.id || (req as any).adminUser?.id;
    if (userId) {
      userComponent = `:u:${userId}`;
    }
  }

  // Build base key
  let key = `${method}:${url}${queryComponent}${userComponent}`;
  
  // Sanitize key (remove/replace special characters)
  key = key.replace(/[^a-zA-Z0-9:_/-]/g, '_');
  
  // Hash if too long
  if (key.length > 200) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    key = `${method}:${hash}`;
  }
  
  return key;
}

/**
 * Generate ETag for response
 */
function generateETag(body: any): string {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  return crypto.createHash('md5').update(content).digest('hex');
}

// ============================================================================
// CACHE MIDDLEWARE FACTORY
// ============================================================================

/**
 * Create cache middleware with specified options
 */
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    ttl = CACHE_TTL.API_RESPONSE,
    keyPrefix = 'api:response',
    tags = [],
    version,
    condition,
    onHit,
    onMiss,
  } = options;

  const cache = getEnhancedCache();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET and HEAD requests
    if (!['GET', 'HEAD'].includes(req.method)) {
      return next();
    }

    // Skip if cache disabled
    if (!cache.isEnabled()) {
      res.setHeader('X-Cache', 'DISABLED');
      return next();
    }

    // Check bypass header
    if (req.headers['x-bypass-cache'] === 'true') {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // Check custom condition
    if (condition && !condition(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req, options);

    try {
      // Try to get from cache
      const cached = await cache.get<CachedResponse>(cacheKey, keyPrefix, version);

      if (cached) {
        // Check ETag for conditional request
        const clientETag = req.headers['if-none-match'];
        if (clientETag && clientETag === cached.etag) {
          res.status(304).end();
          return;
        }

        // Return cached response
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Age', `${Math.floor((Date.now() - cached.cachedAt) / 1000)}`);
        res.setHeader('X-Cache-TTL', `${ttl}`);
        
        if (cached.etag) {
          res.setHeader('ETag', cached.etag);
        }

        // Restore cached headers
        for (const [name, value] of Object.entries(cached.headers)) {
          if (name !== 'x-cache' && name !== 'etag') {
            res.setHeader(name, value);
          }
        }

        // Callback
        if (onHit) {
          onHit(req, cacheKey);
        }

        // For HEAD requests, don't send body
        if (req.method === 'HEAD') {
          return res.status(cached.statusCode).end();
        }

        return res.status(cached.statusCode).json(cached.body);
      }

      // Cache miss - intercept response
      if (onMiss) {
        onMiss(req, cacheKey);
      }

      // Store original methods
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);
      const originalStatus = res.status.bind(res);
      
      let statusCode = 200;
      let responseBody: any;
      let isJson = false;

      // Override status
      res.status = function(code: number) {
        statusCode = code;
        return originalStatus(code);
      };

      // Override json
      res.json = function(body: any) {
        responseBody = body;
        isJson = true;
        
        // Only cache successful responses
        if (statusCode >= 200 && statusCode < 300) {
          const etag = generateETag(body);
          
          const cachedResponse: CachedResponse = {
            statusCode,
            headers: {
              'Content-Type': 'application/json',
            },
            body,
            cachedAt: Date.now(),
            etag,
          };

          // Cache the response
          cache.set(cacheKey, cachedResponse, {
            ttl,
            keyPrefix,
            tags: tags as string[],
            version,
          }).catch(err => {
            console.error('[Cache Middleware] Error storing response:', err);
          });

          res.setHeader('ETag', etag);
        }

        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      // Override send (for non-JSON responses)
      res.send = function(body: any) {
        // Only cache JSON responses through send
        if (typeof body === 'object' && statusCode >= 200 && statusCode < 300) {
          responseBody = body;
          
          const cachedResponse: CachedResponse = {
            statusCode,
            headers: {},
            body,
            cachedAt: Date.now(),
          };

          cache.set(cacheKey, cachedResponse, {
            ttl,
            keyPrefix,
            tags: tags as string[],
            version,
          }).catch(err => {
            console.error('[Cache Middleware] Error storing response:', err);
          });
        }

        res.setHeader('X-Cache', 'MISS');
        return originalSend(body);
      };

      next();
    } catch (error) {
      console.error('[Cache Middleware] Error:', error);
      res.setHeader('X-Cache', 'ERROR');
      next();
    }
  };
}

// ============================================================================
// CACHE INVALIDATION MIDDLEWARE
// ============================================================================

/**
 * Invalidate cache by pattern after successful mutation
 */
export function invalidateCacheMiddleware(
  patterns: string[],
  options: {
    keyPrefix?: string;
    tags?: string[];
  } = {}
) {
  const { keyPrefix = 'api:response', tags = [] } = options;
  const cache = getEnhancedCache();

  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function(body: any) {
      // Invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate by patterns
        for (const pattern of patterns) {
          cache.deletePattern(pattern, keyPrefix).catch(err => {
            console.error('[Cache Middleware] Error invalidating cache:', err);
          });
        }

        // Invalidate by tags
        if (tags.length > 0) {
          cache.invalidateByTags(tags).catch(err => {
            console.error('[Cache Middleware] Error invalidating tags:', err);
          });
        }

        res.setHeader('X-Cache-Invalidated', 'true');
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Conditional cache invalidation based on response
 */
export function conditionalInvalidateCache(
  condition: (req: Request, body: any) => boolean,
  patterns: string[],
  options: { keyPrefix?: string; tags?: string[] } = {}
) {
  const { keyPrefix = 'api:response', tags = [] } = options;
  const cache = getEnhancedCache();

  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function(body: any) {
      if (condition(req, body)) {
        // Invalidate cache
        for (const pattern of patterns) {
          cache.deletePattern(pattern, keyPrefix).catch(console.error);
        }
        if (tags.length > 0) {
          cache.invalidateByTags(tags).catch(console.error);
        }
      }

      return originalJson(body);
    };

    next();
  };
}

// ============================================================================
// PRECONFIGURED CACHE CONFIGURATIONS
// ============================================================================

export const cacheConfig = {
  /**
   * Cache configuration for CMS content (5 minutes)
   */
  cms: {
    ttl: CACHE_TTL.CMS_CONTENT,
    keyPrefix: 'api:cms',
    tags: ['cms'],
  },

  /**
   * Cache configuration for team members (5 minutes)
   */
  teamMembers: {
    ttl: CACHE_TTL.TEAM_MEMBERS,
    keyPrefix: 'api:team',
    tags: ['team'],
  },

  /**
   * Cache configuration for services (10 minutes)
   */
  services: {
    ttl: CACHE_TTL.SERVICES,
    keyPrefix: 'api:services',
    tags: ['services'],
  },

  /**
   * Cache configuration for testimonials (15 minutes)
   */
  testimonials: {
    ttl: CACHE_TTL.TESTIMONIALS,
    keyPrefix: 'api:testimonials',
    tags: ['testimonials'],
  },

  /**
   * Cache configuration for FAQs (30 minutes)
   */
  faqs: {
    ttl: CACHE_TTL.FAQS,
    keyPrefix: 'api:faqs',
    tags: ['faqs'],
  },

  /**
   * Cache configuration for settings (1 hour)
   */
  settings: {
    ttl: CACHE_TTL.SETTINGS,
    keyPrefix: 'api:settings',
    tags: ['settings'],
  },

  /**
   * Cache configuration for user profiles (10 minutes, user-specific)
   */
  userProfile: {
    ttl: CACHE_TTL.USER_PROFILE,
    keyPrefix: 'api:user',
    tags: ['users'],
    includeUser: true,
  },

  /**
   * Short-lived cache for dynamic content (1 minute)
   */
  dynamic: {
    ttl: CACHE_TTL.API_RESPONSE,
    keyPrefix: 'api:dynamic',
  },

  /**
   * Long-lived cache for static content (1 hour)
   */
  static: {
    ttl: CACHE_TTL.STATIC,
    keyPrefix: 'api:static',
    tags: ['static'],
  },
};

// ============================================================================
// CONVENIENCE MIDDLEWARE CREATORS
// ============================================================================

/**
 * Create CMS content cache middleware
 */
export function cmsCacheMiddleware(customOptions: Partial<CacheMiddlewareOptions> = {}) {
  return cacheMiddleware({ ...cacheConfig.cms, ...customOptions });
}

/**
 * Create services cache middleware
 */
export function servicesCacheMiddleware(customOptions: Partial<CacheMiddlewareOptions> = {}) {
  return cacheMiddleware({ ...cacheConfig.services, ...customOptions });
}

/**
 * Create team members cache middleware
 */
export function teamCacheMiddleware(customOptions: Partial<CacheMiddlewareOptions> = {}) {
  return cacheMiddleware({ ...cacheConfig.teamMembers, ...customOptions });
}

/**
 * Create testimonials cache middleware
 */
export function testimonialCacheMiddleware(customOptions: Partial<CacheMiddlewareOptions> = {}) {
  return cacheMiddleware({ ...cacheConfig.testimonials, ...customOptions });
}

/**
 * Create FAQs cache middleware
 */
export function faqCacheMiddleware(customOptions: Partial<CacheMiddlewareOptions> = {}) {
  return cacheMiddleware({ ...cacheConfig.faqs, ...customOptions });
}

/**
 * Create settings cache middleware
 */
export function settingsCacheMiddleware(customOptions: Partial<CacheMiddlewareOptions> = {}) {
  return cacheMiddleware({ ...cacheConfig.settings, ...customOptions });
}

// ============================================================================
// CACHE WARMING TRIGGER
// ============================================================================

/**
 * Middleware to trigger cache warming for specific routes
 */
export function cacheWarmingTrigger(
  warmFunction: () => Promise<void>,
  options: { interval?: number; onStartup?: boolean } = {}
) {
  const { interval, onStartup = false } = options;

  if (onStartup) {
    // Warm cache on startup
    setImmediate(() => {
      warmFunction().catch(console.error);
    });
  }

  if (interval) {
    // Periodic warming
    setInterval(() => {
      warmFunction().catch(console.error);
    }, interval);
  }

  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
}

export default cacheMiddleware;
