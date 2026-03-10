/**
 * ============================================================================
 * REDIS CLIENT - Infrastructure
 * ============================================================================
 * Redis connection configuration and client factory
 */

import Redis from 'ioredis';

// Redis configuration from environment
const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

/**
 * Create Redis client instance
 */
export function createRedisClient(): Redis {
  if (REDIS_URL) {
    // Use connection string if provided (Upstash, Redis Cloud, etc.)
    return new Redis(REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });
  }

  // Use individual config for local development
  return new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });
}

// Singleton instance
let redisInstance: Redis | null = null;

/**
 * Get Redis client singleton
 */
export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = createRedisClient();

    // Error handling
    redisInstance.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisInstance.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
  }

  return redisInstance;
}

/**
 * Disconnect Redis (for graceful shutdown)
 */
export async function disconnectRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
    console.log('[Redis] Disconnected');
  }
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.ping();
    return true;
  } catch (error) {
    console.error('[Redis] Health check failed:', error);
    return false;
  }
}

export default getRedisClient;
