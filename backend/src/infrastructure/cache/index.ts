/**
 * ============================================================================
 * CACHE INFRASTRUCTURE - Barrel Export
 * ============================================================================
 * 
 * This module provides caching infrastructure for the Sovereon backend.
 * For new code, prefer importing from '@/config/cache' for enhanced features.
 * 
 * Backward compatibility is maintained for existing code.
 */

// Redis client
export {
  getRedisClient,
  createRedisClient,
  disconnectRedis,
  checkRedisHealth,
} from './redis';

// Legacy CacheService (for backward compatibility)
export {
  CacheService,
  getCacheService,
  resetCacheService,
  DEFAULT_TTLS,
  type CacheConfig,
} from './CacheService';

// Legacy CachedRepository (for backward compatibility)
export {
  CachedRepository,
  type RepositoryCacheConfig,
} from './CachedRepository';

// ============================================================================
// RECOMMENDED: Enhanced Cache (from config/cache)
// ============================================================================
// For new implementations, import from here or directly from '@/config/cache':
//
//   import { getEnhancedCache, cached, CACHE_TTL } from '@/config/cache';
//
// Or use the re-export from this module:
//
//   import { getEnhancedCache, CACHE_TTL } from '@/infrastructure/cache';
//
// ============================================================================

// Re-export enhanced cache for convenience
export {
  EnhancedCacheService,
  getEnhancedCache,
  resetEnhancedCache,
  cached,
  CACHE_TTL,
} from '../../config/cache';

export type {
  CacheOptions,
  CacheSetOptions,
  CacheGetOrSetOptions,
} from '../../config/cache';
