/**
 * ============================================================================
 * MIDDLEWARE - Barrel Export
 * ============================================================================
 */

// Cache middleware (enhanced)
export {
  // Main middleware factory
  cacheMiddleware,
  
  // Pre-configured middleware creators
  cmsCacheMiddleware,
  servicesCacheMiddleware,
  teamCacheMiddleware,
  testimonialCacheMiddleware,
  faqCacheMiddleware,
  settingsCacheMiddleware,
  
  // Invalidation middleware
  invalidateCacheMiddleware,
  conditionalInvalidateCache,
  cacheWarmingTrigger,
  
  // Configurations
  cacheConfig,
  
  // Types
  type CacheMiddlewareOptions,
} from './cache.middleware';
