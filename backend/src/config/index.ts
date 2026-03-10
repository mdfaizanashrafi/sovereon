/**
 * ============================================================================
 * CONFIGURATION - Barrel Export
 * ============================================================================
 * Centralized configuration exports for database, cache, and other services.
 */

// Database configuration
export {
  // Client management
  getDatabaseManager,
  getPrismaClient,
  getReadPrismaClient,
  connectDatabase,
  disconnectDatabase,
  
  // Health checks & metrics
  checkDatabaseHealth,
  getDatabaseMetrics,
  resetDatabaseMetrics,
  
  // Query helpers
  executeReadQuery,
  executeWriteQuery,
  executeCachedQuery,
  
  // Backward compatibility
  prisma,
  
  // Types
  type DatabaseHealthStatus,
} from './database';

// Cache configuration
export {
  // Cache service
  EnhancedCacheService,
  getEnhancedCache,
  resetEnhancedCache,
  
  // Decorators
  cached,
  
  // Constants
  CACHE_TTL,
  TTL,
  
  // Types
  type CacheOptions,
  type CacheSetOptions,
  type CacheGetOrSetOptions,
} from './cache';
