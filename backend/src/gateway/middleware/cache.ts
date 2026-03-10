/**
 * ============================================================================
 * CACHE MIDDLEWARE
 * ============================================================================
 * HTTP response caching middleware for Express routes
 */

import { Request, Response, NextFunction } from 'express';
import { getCacheService, DEFAULT_TTLS } from '../../infrastructure/cache';
import crypto from 'crypto';

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request): string {
  const url = req.originalUrl || req.url;
  const method = req.method;
  
  // Include query params in key
  const queryString = Object.keys(req.query).length > 0
    ? ':' + JSON.stringify(req.query)
    : '';
  
  // For authenticated requests, include user ID
  const userId = (req as any).adminUser?.id || (req as any).user?.id;
  const userSegment = userId ? `:user_${userId}` : '';
  
  // Create hash for long keys
  const key = `${method}:${url}${queryString}${userSegment}`;
  
  if (key.length > 200) {
    return crypto.createHash('md5').update(key).digest('hex');
  }
  
  return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
}

/**
 * Cache middleware factory
 */
export function cacheMiddleware(
  ttl: number = DEFAULT_TTLS.API_RESPONSE,
  keyPrefix: string = 'api'
) {
  const cache = getCacheService();
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Skip if cache disabled
    if (!cache.isEnabled()) {
      return next();
    }
    
    // Skip if cache-bypass header present
    if (req.headers['x-bypass-cache'] === 'true') {
      return next();
    }
    
    const cacheKey = generateCacheKey(req);
    
    try {
      // Try to get from cache
      const cached = await cache.get(cacheKey, keyPrefix);
      
      if (cached) {
        // Return cached response
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache successful responses
      res.json = function(body: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
          cache.set(cacheKey, body, ttl, keyPrefix).catch(err => {
            console.error('[Cache Middleware] Error storing response:', err);
          });
        }
        
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };
      
      next();
    } catch (error) {
      // On error, proceed without caching
      console.error('[Cache Middleware] Error:', error);
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string, keyPrefix: string = 'api') {
  const cache = getCacheService();
  
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json
    const originalJson = res.json.bind(res);
    
    // Override res.json to invalidate cache on successful mutations
    res.json = function(body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
        cache.deletePattern(pattern, keyPrefix).catch(err => {
          console.error('[Cache Middleware] Error invalidating cache:', err);
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Cache configuration by resource type
 */
export const cacheConfig = {
  cms: {
    ttl: DEFAULT_TTLS.CMS_CONTENT,
    prefix: 'api:cms',
  },
  teamMembers: {
    ttl: DEFAULT_TTLS.TEAM_MEMBERS,
    prefix: 'api:team',
  },
  services: {
    ttl: DEFAULT_TTLS.SERVICES,
    prefix: 'api:services',
  },
  testimonials: {
    ttl: DEFAULT_TTLS.TESTIMONIALS,
    prefix: 'api:testimonials',
  },
  faqs: {
    ttl: DEFAULT_TTLS.FAQS,
    prefix: 'api:faqs',
  },
  settings: {
    ttl: DEFAULT_TTLS.SETTINGS,
    prefix: 'api:settings',
  },
};

export default cacheMiddleware;
