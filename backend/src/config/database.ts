/**
 * ============================================================================
 * DATABASE CONFIGURATION - Connection Pooling & Read Replicas
 * ============================================================================
 * Advanced Prisma configuration with connection pooling, health checks,
 * and read replica support for enterprise-grade scalability.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { getRedisClient } from '../infrastructure/cache/redis';

// ============================================================================
// CONNECTION POOL CONFIGURATION
// ============================================================================

/**
 * Connection pool settings based on environment
 */
const POOL_CONFIG = {
  development: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
  },
  staging: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 60000,
    reapIntervalMillis: 1000,
  },
  production: {
    min: 10,
    max: 50,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 120000,
    reapIntervalMillis: 1000,
  },
} as const;

/**
 * Query timeout settings by environment
 */
const QUERY_TIMEOUTS = {
  development: 30000,
  staging: 45000,
  production: 60000,
} as const;

// Environment detection
const NODE_ENV = (process.env.NODE_ENV as keyof typeof POOL_CONFIG) || 'development';
const currentPoolConfig = POOL_CONFIG[NODE_ENV] || POOL_CONFIG.development;
const queryTimeout = QUERY_TIMEOUTS[NODE_ENV] || QUERY_TIMEOUTS.development;

// Read replica URL (optional)
const READ_REPLICA_URL = process.env.DATABASE_READ_REPLICA_URL;

// ============================================================================
// PRISMA CLIENT FACTORY
// ============================================================================

/**
 * Create a Prisma client with connection pooling configuration
 */
function createPrismaClient(options?: {
  isReadReplica?: boolean;
  databaseUrl?: string;
}): PrismaClient {
  const databaseUrl = options?.databaseUrl || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Build connection string with pool parameters
  const url = new URL(databaseUrl);
  
  // Add connection pool parameters
  url.searchParams.set('connection_limit', String(currentPoolConfig.max));
  url.searchParams.set('pool_timeout', String(Math.floor(currentPoolConfig.acquireTimeoutMillis / 1000)));
  
  const logLevels: Prisma.LogLevel[] = NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'];

  return new PrismaClient({
    datasources: {
      db: {
        url: url.toString(),
      },
    },
    log: logLevels,
  });
}

// ============================================================================
// PRISMA CLIENT MANAGER
// ============================================================================

interface PrismaClientManager {
  primary: PrismaClient;
  readReplica?: PrismaClient;
  getReadClient(): PrismaClient;
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (prisma: PrismaClient) => Promise<T>, options?: { timeout?: number }): Promise<T>;
}

class DatabaseManager implements PrismaClientManager {
  primary: PrismaClient;
  readReplica?: PrismaClient;
  private metrics: {
    queryCount: number;
    slowQueries: number;
    errors: number;
    lastHealthCheck: Date | null;
  };

  constructor() {
    this.primary = createPrismaClient();
    this.metrics = {
      queryCount: 0,
      slowQueries: 0,
      errors: 0,
      lastHealthCheck: null,
    };

    // Initialize read replica if configured
    if (READ_REPLICA_URL) {
      try {
        this.readReplica = createPrismaClient({ 
          isReadReplica: true, 
          databaseUrl: READ_REPLICA_URL 
        });
        console.log('[Database] Read replica configured');
      } catch (error) {
        console.warn('[Database] Failed to initialize read replica:', error);
      }
    }

    this.setupMiddleware();
  }

  /**
   * Set up Prisma middleware for metrics and query optimization
   */
  private setupMiddleware(): void {
    // Query performance monitoring middleware
    this.primary.$use(async (params, next) => {
      const start = Date.now();
      this.metrics.queryCount++;

      try {
        const result = await next(params);
        
        const duration = Date.now() - start;
        
        // Log slow queries (over 1 second)
        if (duration > 1000) {
          this.metrics.slowQueries++;
          console.warn(`[Database] Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
        }

        // Log errors
        if (params.action === 'findUnique' && !result) {
          // Cache miss indicator - could be used for cache warming
        }

        return result;
      } catch (error) {
        this.metrics.errors++;
        throw error;
      }
    });
  }

  /**
   * Get client for read operations (uses read replica if available)
   */
  getReadClient(): PrismaClient {
    return this.readReplica || this.primary;
  }

  /**
   * Connect to database
   */
  async $connect(): Promise<void> {
    await this.primary.$connect();
    if (this.readReplica) {
      await this.readReplica.$connect();
    }
    console.log(`[Database] Connected (pool: ${currentPoolConfig.min}-${currentPoolConfig.max})`);
  }

  /**
   * Disconnect from database
   */
  async $disconnect(): Promise<void> {
    await this.primary.$disconnect();
    if (this.readReplica) {
      await this.readReplica.$disconnect();
    }
    console.log('[Database] Disconnected');
  }

  /**
   * Execute transaction with timeout
   */
  async $transaction<T>(
    fn: (prisma: any) => Promise<T>,
    options?: { timeout?: number }
  ): Promise<T> {
    // Use Prisma's built-in transaction with timeout
    return this.primary.$transaction(fn, {
      maxWait: options?.timeout || queryTimeout,
      timeout: options?.timeout || queryTimeout,
    });
  }

  /**
   * Get database metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      poolSize: currentPoolConfig.max,
      environment: NODE_ENV,
      hasReadReplica: !!this.readReplica,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      queryCount: 0,
      slowQueries: 0,
      errors: 0,
      lastHealthCheck: this.metrics.lastHealthCheck,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let dbManager: DatabaseManager | null = null;

/**
 * Get database manager singleton
 */
export function getDatabaseManager(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager();
  }
  return dbManager;
}

/**
 * Get primary Prisma client
 */
export function getPrismaClient(): PrismaClient {
  return getDatabaseManager().primary;
}

/**
 * Get read-optimized Prisma client (may be read replica)
 */
export function getReadPrismaClient(): PrismaClient {
  return getDatabaseManager().getReadClient();
}

/**
 * Connect to database with retry logic
 */
export async function connectDatabase(maxRetries = 3): Promise<void> {
  const manager = getDatabaseManager();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await manager.$connect();
      console.log('[Database] Connection established');
      return;
    } catch (error) {
      console.error(`[Database] Connection attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (dbManager) {
    await dbManager.$disconnect();
    dbManager = null;
  }
}

// ============================================================================
// HEALTH CHECKS & MONITORING
// ============================================================================

export interface DatabaseHealthStatus {
  healthy: boolean;
  primary: {
    connected: boolean;
    latency: number;
    poolSize?: number;
  };
  readReplica?: {
    connected: boolean;
    latency: number;
  };
  error?: string;
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const manager = getDatabaseManager();
  const status: DatabaseHealthStatus = {
    healthy: false,
    primary: { connected: false, latency: -1 },
  };

  try {
    // Check primary
    const primaryStart = Date.now();
    await manager.primary.$queryRaw`SELECT 1 as health_check`;
    status.primary = {
      connected: true,
      latency: Date.now() - primaryStart,
    };
    status.healthy = true;

    // Check read replica if configured
    if (manager.readReplica) {
      const replicaStart = Date.now();
      try {
        await manager.readReplica.$queryRaw`SELECT 1 as health_check`;
        status.readReplica = {
          connected: true,
          latency: Date.now() - replicaStart,
        };
      } catch (error) {
        status.readReplica = {
          connected: false,
          latency: -1,
        };
      }
    }
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return status;
}

/**
 * Get database metrics for monitoring
 */
export function getDatabaseMetrics() {
  return getDatabaseManager().getMetrics();
}

/**
 * Reset database metrics
 */
export function resetDatabaseMetrics(): void {
  getDatabaseManager().resetMetrics();
}

// ============================================================================
// QUERY OPTIMIZATION HELPERS
// ============================================================================

/**
 * Execute query with automatic read replica routing for read operations
 */
export async function executeReadQuery<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getReadPrismaClient();
  return operation(client);
}

/**
 * Execute query on primary database (for writes)
 */
export async function executeWriteQuery<T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient();
  return operation(client);
}

/**
 * Cache-aware query execution
 * Tries cache first, then database, then populates cache
 */
export async function executeCachedQuery<T>({
  key,
  operation,
  ttl = 300,
  tags = [],
}: {
  key: string;
  operation: (prisma: PrismaClient) => Promise<T>;
  ttl?: number;
  tags?: string[];
}): Promise<T> {
  const redis = getRedisClient();
  const cacheKey = `query:${key}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Execute query on read replica
  const result = await executeReadQuery(operation);
  
  // Store in cache
  await redis.setex(cacheKey, ttl, JSON.stringify(result));
  
  // Add to tag index for invalidation
  if (tags.length > 0) {
    for (const tag of tags) {
      await redis.sadd(`tag:${tag}`, cacheKey);
    }
  }
  
  return result;
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

// Export prisma instance for backward compatibility
export const prisma = getPrismaClient();

export default getDatabaseManager;
