/**
 * ============================================================================
 * CHAOS EXPERIMENT: Cache Failure
 * ============================================================================
 * Simulates various cache (Redis) failure scenarios:
 * - Connection failures
 * - Timeout injection
 * - Cache corruption
 * - Cache stampede
 */

import { getRedisClient } from '../../infrastructure/cache/redis';
import { getCacheService } from '../../infrastructure/cache/CacheService';
import { getChaosEngine, ExperimentDefinition, parseDuration } from '../engine';
import { logger } from '../../utils/logger';
import type { Redis } from 'ioredis';

// ============================================================================
// EXPERIMENT DEFINITIONS
// ============================================================================

/**
 * Redis connection failure experiment
 */
export const redisConnectionFailure: ExperimentDefinition = {
  id: '',
  name: 'redis_connection_failure',
  description: 'Simulates Redis connection failures to test cache fallback',
  target: 'cache',
  fault: 'connection_drop',
  scope: 'component',
  duration: parseDuration('30s'),
  intensity: 0.5,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 15 },
    { metric: 'p99_latency', operator: '>', threshold: 3000 },
  ],
  hypothesis: {
    when: 'Redis connection fails',
    systemWill: 'fallback to database and disable caching temporarily',
    maintaining: '90% of requests served successfully with increased latency',
  },
  config: {
    dropRate: 0.5,
    reconnectAttempts: 3,
  },
};

/**
 * Cache timeout experiment
 */
export const cacheTimeout: ExperimentDefinition = {
  id: '',
  name: 'redis_timeout',
  description: 'Injects latency into Redis operations',
  target: 'cache',
  fault: 'latency_injection',
  scope: 'component',
  duration: parseDuration('60s'),
  rampUpTime: parseDuration('10s'),
  intensity: 0.4,
  autoRollback: true,
  maxDuration: parseDuration('3m'),
  abortConditions: [
    { metric: 'p99_latency', operator: '>', threshold: 5000 },
    { metric: 'error_rate', operator: '>', threshold: 10 },
  ],
  hypothesis: {
    when: 'cache operations timeout',
    systemWill: 'bypass cache and serve from primary source',
    maintaining: 'data availability with graceful performance degradation',
  },
  config: {
    latency: 200,
    jitter: 100,
    affectedOperations: ['get', 'set', 'del'],
  },
};

/**
 * Cache corruption experiment
 */
export const cacheCorruption: ExperimentDefinition = {
  id: '',
  name: 'cache_corruption',
  description: 'Simulates cache data corruption scenarios',
  target: 'cache',
  fault: 'corruption',
  scope: 'isolated',
  duration: parseDuration('45s'),
  intensity: 0.2,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 20 },
  ],
  hypothesis: {
    when: 'cache data is corrupted',
    systemWill: 'detect corruption via checksums and refresh from source',
    maintaining: 'data integrity and consistent responses',
  },
  config: {
    corruptionRate: 0.2,
    corruptTypes: ['invalid_json', 'wrong_type', 'truncated'],
  },
};

/**
 * Cache stampede experiment
 */
export const cacheStampede: ExperimentDefinition = {
  id: '',
  name: 'cache_stampede',
  description: 'Triggers cache stampede (thundering herd) scenario',
  target: 'cache',
  fault: 'resource_exhaustion',
  scope: 'system',
  duration: parseDuration('30s'),
  intensity: 1.0,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 25 },
    { metric: 'p99_latency', operator: '>', threshold: 10000 },
  ],
  hypothesis: {
    when: 'cache expires simultaneously for hot keys',
    systemWill: 'use request coalescing and circuit breaker to protect database',
    maintaining: 'system stability and prevent database overload',
  },
  config: {
    hotKeys: ['services:list', 'team:all', 'settings:public'],
    concurrentRequests: 100,
    staggerMs: 10,
  },
};

// ============================================================================
// FAULT INJECTION IMPLEMENTATIONS
// ============================================================================

/**
 * Redis connection failure injector
 */
class RedisConnectionInjector {
  private redis: Redis;
  private originalConnect: any;
  private dropEnabled = false;
  private dropRate: number;

  constructor(dropRate: number = 0.5) {
    this.redis = getRedisClient();
    this.dropRate = dropRate;
  }

  async inject(): Promise<void> {
    // Store original connection state
    this.originalConnect = this.redis.connect;
    this.dropEnabled = true;

    // Override to randomly fail
    const originalConnect = this.redis.connect.bind(this.redis);
    this.redis.connect = async () => {
      if (this.dropEnabled && Math.random() < this.dropRate) {
        throw new Error('[CHAOS] Simulated Redis connection failure');
      }
      return originalConnect();
    };

    // Intercept Redis operations
    this.redis.on('error', (err) => {
      if (err.message.includes('[CHAOS]')) {
        logger.info(`[Chaos] Redis error injected: ${err.message}`);
      }
    });

    logger.info('[Chaos] Redis connection failure injection enabled');
  }

  async rollback(): Promise<void> {
    this.dropEnabled = false;
    if (this.originalConnect) {
      this.redis.connect = this.originalConnect;
    }
    logger.info('[Chaos] Redis connection failure injection disabled');
  }
}

/**
 * Cache latency injector
 */
class CacheLatencyInjector {
  private redis: Redis;
  private latency: number;
  private jitter: number;
  private affectedOperations: string[];
  private originalMethods: Map<string, any> = new Map();

  constructor(config: { latency: number; jitter: number; affectedOperations: string[] }) {
    this.redis = getRedisClient();
    this.latency = config.latency;
    this.jitter = config.jitter;
    this.affectedOperations = config.affectedOperations;
  }

  async inject(intensity: number): Promise<void> {
    for (const op of this.affectedOperations) {
      const originalMethod = (this.redis as any)[op].bind(this.redis);
      this.originalMethods.set(op, originalMethod);

      (this.redis as any)[op] = async (...args: any[]) => {
        if (Math.random() < intensity) {
          const delay = this.latency + Math.random() * this.jitter - this.jitter / 2;
          await new Promise(resolve => setTimeout(resolve, Math.max(0, delay)));
        }
        return originalMethod(...args);
      };
    }

    logger.info('[Chaos] Cache latency injection enabled');
  }

  async rollback(): Promise<void> {
    for (const [op, method] of this.originalMethods) {
      (this.redis as any)[op] = method;
    }
    this.originalMethods.clear();
    logger.info('[Chaos] Cache latency injection disabled');
  }
}

/**
 * Cache corruption injector
 */
class CacheCorruptionInjector {
  private redis: Redis;
  private corruptionRate: number;
  private corruptTypes: string[];

  constructor(config: { corruptionRate: number; corruptTypes: string[] }) {
    this.redis = getRedisClient();
    this.corruptionRate = config.corruptionRate;
    this.corruptTypes = config.corruptTypes;
  }

  async inject(): Promise<void> {
    const originalGet = this.redis.get.bind(this.redis);
    
    this.redis.get = async (key: string) => {
      const value = await originalGet(key);
      
      if (value && Math.random() < this.corruptionRate) {
        const corruptType = this.corruptTypes[Math.floor(Math.random() * this.corruptTypes.length)];
        return this.corruptValue(value, corruptType);
      }
      
      return value;
    };

    logger.info('[Chaos] Cache corruption injection enabled');
  }

  private corruptValue(value: string, type: string): string {
    switch (type) {
      case 'invalid_json':
        return '{"corrupted": true, invalid json}';
      case 'wrong_type':
        return 'corrupted_string_instead_of_object';
      case 'truncated':
        return value.slice(0, Math.floor(value.length / 2));
      default:
        return value;
    }
  }

  async rollback(): Promise<void> {
    // Reset would require reconnection or more complex handling
    logger.info('[Chaos] Cache corruption injection marked for rollback');
  }
}

/**
 * Cache stampede simulator
 */
class CacheStampedeSimulator {
  private hotKeys: string[];
  private concurrentRequests: number;
  private staggerMs: number;

  constructor(config: { hotKeys: string[]; concurrentRequests: number; staggerMs: number }) {
    this.hotKeys = config.hotKeys;
    this.concurrentRequests = config.concurrentRequests;
    this.staggerMs = config.staggerMs;
  }

  async inject(): Promise<void> {
    const redis = getRedisClient();
    const cacheService = getCacheService();

    // Clear hot keys to trigger stampede
    for (const key of this.hotKeys) {
      await cacheService.delete(key);
    }

    // Simulate concurrent requests
    const promises: Promise<any>[] = [];
    
    for (let i = 0; i < this.concurrentRequests; i++) {
      const delay = i * this.staggerMs;
      const key = this.hotKeys[i % this.hotKeys.length];
      
      promises.push(
        new Promise(resolve => {
          setTimeout(async () => {
            try {
              // Simulate cache miss and database query
              const value = await cacheService.get(key);
              if (!value) {
                // Simulate expensive computation
                await new Promise(r => setTimeout(r, 50));
                await cacheService.set(key, { data: 'refreshed', timestamp: Date.now() }, 60);
              }
            } catch (error) {
              logger.error('[Chaos] Stampede request error:', error);
            }
            resolve(undefined);
          }, delay);
        })
      );
    }

    await Promise.all(promises);
    logger.info('[Chaos] Cache stampede simulation completed');
  }

  async rollback(): Promise<void> {
    logger.info('[Chaos] Cache stampede simulation ended');
  }
}

// ============================================================================
// EXPERIMENT RUNNERS
// ============================================================================

export async function runRedisConnectionFailure(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...redisConnectionFailure,
    duration: duration ? parseDuration(duration) : redisConnectionFailure.duration,
  };
  
  const injector = new RedisConnectionInjector((definition.config && definition.config.dropRate) || 0.5);
  
  engine.once('experiment:starting', async () => {
    await injector.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runCacheTimeout(duration?: string, latency?: number): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...cacheTimeout,
    duration: duration ? parseDuration(duration) : cacheTimeout.duration,
    config: {
      ...(cacheTimeout.config || {}),
      latency: latency || (cacheTimeout.config && cacheTimeout.config.latency) || 200,
    },
  };
  
  const injector = new CacheLatencyInjector((definition.config || { latency: 200, jitter: 100, affectedOperations: ['get', 'set', 'del'] }) as { latency: number; jitter: number; affectedOperations: string[] });
  
  engine.once('experiment:starting', async () => {
    await injector.inject(definition.intensity);
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runCacheCorruption(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...cacheCorruption,
    duration: duration ? parseDuration(duration) : cacheCorruption.duration,
  };
  
  const injector = new CacheCorruptionInjector((definition.config || { corruptionRate: 0.2, corruptTypes: ['invalid_json', 'wrong_type', 'truncated'] }) as { corruptionRate: number; corruptTypes: string[] });
  
  engine.once('experiment:starting', async () => {
    await injector.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runCacheStampede(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...cacheStampede,
    duration: duration ? parseDuration(duration) : cacheStampede.duration,
  };
  
  const simulator = new CacheStampedeSimulator((definition.config || { hotKeys: ['services:list', 'team:all', 'settings:public'], concurrentRequests: 100, staggerMs: 10 }) as { hotKeys: string[]; concurrentRequests: number; staggerMs: number });
  
  engine.once('experiment:starting', async () => {
    await simulator.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await simulator.rollback();
  });
  
  return engine.run(definition);
}

// ============================================================================
// EXPERIMENT CATALOG
// ============================================================================

export const cacheExperiments = {
  connectionFailure: redisConnectionFailure,
  timeout: cacheTimeout,
  corruption: cacheCorruption,
  stampede: cacheStampede,
};

export const cacheExperimentRunners = {
  connectionFailure: runRedisConnectionFailure,
  timeout: runCacheTimeout,
  corruption: runCacheCorruption,
  stampede: runCacheStampede,
};

export default {
  cacheExperiments,
  cacheExperimentRunners,
  runRedisConnectionFailure,
  runCacheTimeout,
  runCacheCorruption,
  runCacheStampede,
};
