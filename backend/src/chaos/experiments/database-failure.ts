/**
 * ============================================================================
 * CHAOS EXPERIMENT: Database Failure
 * ============================================================================
 * Simulates various database failure scenarios to test resilience:
 * - Connection loss
 * - Connection timeouts
 * - Slow queries
 * - Transaction failures
 * - Connection pool exhaustion
 */

import { PrismaClient } from '@prisma/client';
import { getChaosEngine, ExperimentDefinition, parseDuration } from '../engine';
import { logger } from '../../utils/logger';
import { getDatabaseManager } from '../../config/database';

// ============================================================================
// EXPERIMENT DEFINITIONS
// ============================================================================

/**
 * Database connection loss experiment
 * Simulates sudden database connection failures
 */
export const databaseConnectionLoss: ExperimentDefinition = {
  id: '',
  name: 'database_connection_loss',
  description: 'Simulates sudden database connection failures to test reconnection logic',
  target: 'database',
  fault: 'connection_drop',
  scope: 'component',
  duration: parseDuration('30s'),
  intensity: 0.5,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 10 },
    { metric: 'p99_latency', operator: '>', threshold: 5000 },
  ],
  hypothesis: {
    when: 'database connections fail',
    systemWill: 'fallback to cache and queue writes for retry',
    maintaining: '95% of requests served successfully',
  },
  config: {
    connectionDropRate: 0.5,
    reconnectDelay: 1000,
  },
};

/**
 * Database timeout experiment
 * Simulates slow database responses
 */
export const databaseTimeout: ExperimentDefinition = {
  id: '',
  name: 'database_timeout',
  description: 'Simulates slow database query responses',
  target: 'database',
  fault: 'timeout',
  scope: 'component',
  duration: parseDuration('60s'),
  rampUpTime: parseDuration('10s'),
  intensity: 0.3,
  autoRollback: true,
  maxDuration: parseDuration('3m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 15 },
    { metric: 'p99_latency', operator: '>', threshold: 10000 },
  ],
  hypothesis: {
    when: 'database queries timeout',
    systemWill: 'return cached data or graceful degradation',
    maintaining: '99% availability with acceptable latency',
  },
  config: {
    minDelay: 100,
    maxDelay: 5000,
    affectedQueries: ['findMany', 'aggregate', 'count'],
  },
};

/**
 * Slow query experiment
 * Injects latency into specific query types
 */
export const slowQuerySimulation: ExperimentDefinition = {
  id: '',
  name: 'database_slow_query',
  description: 'Simulates slow query execution for performance testing',
  target: 'database',
  fault: 'latency_injection',
  scope: 'isolated',
  duration: parseDuration('45s'),
  intensity: 0.4,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'p99_latency', operator: '>', threshold: 8000 },
  ],
  hypothesis: {
    when: 'queries execute slowly',
    systemWill: 'trigger circuit breaker and use cache',
    maintaining: 'response times under 5s for cached data',
  },
  config: {
    delayPerQuery: 2000,
    targetModels: ['User', 'Order', 'Invoice'],
  },
};

/**
 * Transaction failure experiment
 * Simulates transaction rollbacks and failures
 */
export const transactionFailure: ExperimentDefinition = {
  id: '',
  name: 'database_transaction_failure',
  description: 'Simulates database transaction failures and rollbacks',
  target: 'database',
  fault: 'error_injection',
  scope: 'component',
  duration: parseDuration('30s'),
  intensity: 0.25,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 20 },
  ],
  hypothesis: {
    when: 'transactions fail',
    systemWill: 'rollback changes and return meaningful error',
    maintaining: 'data consistency and user notification',
  },
  config: {
    failureRate: 0.25,
    errorTypes: ['deadlock', 'timeout', 'constraint_violation'],
  },
};

/**
 * Connection pool exhaustion experiment
 * Simulates running out of database connections
 */
export const connectionPoolExhaustion: ExperimentDefinition = {
  id: '',
  name: 'database_pool_exhaustion',
  description: 'Simulates database connection pool exhaustion',
  target: 'database',
  fault: 'resource_exhaustion',
  scope: 'system',
  duration: parseDuration('20s'),
  intensity: 1.0,
  autoRollback: true,
  maxDuration: parseDuration('1m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 30 },
    { metric: 'p99_latency', operator: '>', threshold: 15000 },
  ],
  hypothesis: {
    when: 'connection pool is exhausted',
    systemWill: 'queue requests and return 503 with retry-after header',
    maintaining: 'system stability and gradual recovery',
  },
  config: {
    maxConnections: 2,
    queueTimeout: 5000,
  },
};

// ============================================================================
// FAULT INJECTION IMPLEMENTATIONS
// ============================================================================

interface DatabaseFaultInjector {
  inject(experiment: any): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * Connection drop injector
 */
class ConnectionDropInjector implements DatabaseFaultInjector {
  private originalConnect: any;
  private dropEnabled = false;

  async inject(experiment: any): Promise<void> {
    const manager = getDatabaseManager();
    this.originalConnect = manager.primary.$connect.bind(manager.primary);
    this.dropEnabled = true;

    // Override connect to randomly fail
    manager.primary.$connect = async () => {
      if (this.dropEnabled && Math.random() < experiment.definition.config.connectionDropRate) {
        throw new Error('[CHAOS] Simulated connection failure');
      }
      return this.originalConnect();
    };

    logger.info('[Chaos] Connection drop injection enabled');
  }

  async rollback(): Promise<void> {
    this.dropEnabled = false;
    const manager = getDatabaseManager();
    if (this.originalConnect) {
      manager.primary.$connect = this.originalConnect;
    }
    logger.info('[Chaos] Connection drop injection disabled');
  }
}

/**
 * Query latency injector
 */
class QueryLatencyInjector implements DatabaseFaultInjector {
  private originalQuery: any;
  private middlewareInstalled = false;

  async inject(experiment: any): Promise<void> {
    const manager = getDatabaseManager();
    const { minDelay, maxDelay } = experiment.definition.config;

    // Add middleware for latency injection
    manager.primary.$use(async (params, next) => {
      if (Math.random() < experiment.definition.intensity) {
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return next(params);
    });

    this.middlewareInstalled = true;
    logger.info('[Chaos] Query latency injection enabled');
  }

  async rollback(): Promise<void> {
    // Note: Prisma middleware cannot be easily removed
    // In production, use feature flags or environment variables
    logger.info('[Chaos] Query latency injection marked for rollback (restart required)');
  }
}

/**
 * Transaction failure injector
 */
class TransactionFailureInjector implements DatabaseFaultInjector {
  private failureRate: number;
  private errorTypes: string[];

  constructor(config: { failureRate: number; errorTypes: string[] }) {
    this.failureRate = config.failureRate;
    this.errorTypes = config.errorTypes;
  }

  async inject(experiment: any): Promise<void> {
    const manager = getDatabaseManager();
    const originalTransaction = manager.primary.$transaction.bind(manager.primary);

    manager.primary.$transaction = async (arg: any, options?: any) => {
      if (Math.random() < this.failureRate) {
        const errorType = this.errorTypes[Math.floor(Math.random() * this.errorTypes.length)];
        throw new Error(`[CHAOS] Simulated transaction failure: ${errorType}`);
      }
      return originalTransaction(arg, options);
    };

    logger.info('[Chaos] Transaction failure injection enabled');
  }

  async rollback(): Promise<void> {
    // Restore would require keeping reference to original
    logger.info('[Chaos] Transaction failure injection marked for rollback');
  }
}

/**
 * Pool exhaustion simulator
 */
class PoolExhaustionSimulator implements DatabaseFaultInjector {
  private connections: PrismaClient[] = [];
  private maxConnections: number;

  constructor(config: { maxConnections: number }) {
    this.maxConnections = config.maxConnections;
  }

  async inject(experiment: any): Promise<void> {
    // Create connections to exhaust pool
    for (let i = 0; i < this.maxConnections; i++) {
      const client = new PrismaClient();
      await client.$connect();
      this.connections.push(client);
    }

    logger.info(`[Chaos] Pool exhaustion simulation: ${this.maxConnections} connections held`);
  }

  async rollback(): Promise<void> {
    // Release all held connections
    for (const client of this.connections) {
      await client.$disconnect();
    }
    this.connections = [];
    logger.info('[Chaos] Pool exhaustion simulation ended, connections released');
  }
}

// ============================================================================
// EXPERIMENT RUNNERS
// ============================================================================

export async function runDatabaseConnectionLoss(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...databaseConnectionLoss,
    duration: duration ? parseDuration(duration) : databaseConnectionLoss.duration,
  };
  
  const injector = new ConnectionDropInjector();
  
  engine.once('experiment:starting', async () => {
    await injector.inject({ definition });
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runDatabaseTimeout(duration?: string, delay?: number): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...databaseTimeout,
    duration: duration ? parseDuration(duration) : databaseTimeout.duration,
    config: {
      ...(databaseTimeout.config || {}),
      maxDelay: delay || (databaseTimeout.config && databaseTimeout.config.maxDelay) || 5000,
    },
  };
  
  const injector = new QueryLatencyInjector();
  
  engine.once('experiment:starting', async () => {
    await injector.inject({ definition });
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runSlowQuerySimulation(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...slowQuerySimulation,
    duration: duration ? parseDuration(duration) : slowQuerySimulation.duration,
  };
  
  const injector = new QueryLatencyInjector();
  
  engine.once('experiment:starting', async () => {
    await injector.inject({ definition });
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runTransactionFailure(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...transactionFailure,
    duration: duration ? parseDuration(duration) : transactionFailure.duration,
  };
  
  const injector = new TransactionFailureInjector((definition.config || { failureRate: 0.25, errorTypes: ['deadlock', 'timeout', 'constraint_violation'] }) as { failureRate: number; errorTypes: string[] });
  
  engine.once('experiment:starting', async () => {
    await injector.inject({ definition });
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runConnectionPoolExhaustion(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...connectionPoolExhaustion,
    duration: duration ? parseDuration(duration) : connectionPoolExhaustion.duration,
  };
  
  const injector = new PoolExhaustionSimulator((definition.config || { maxConnections: 2, queueTimeout: 5000 }) as { maxConnections: number; queueTimeout?: number });
  
  engine.once('experiment:starting', async () => {
    await injector.inject({ definition });
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

// ============================================================================
// EXPERIMENT CATALOG
// ============================================================================

export const databaseExperiments = {
  connectionLoss: databaseConnectionLoss,
  timeout: databaseTimeout,
  slowQuery: slowQuerySimulation,
  transactionFailure: transactionFailure,
  poolExhaustion: connectionPoolExhaustion,
};

export const databaseExperimentRunners = {
  connectionLoss: runDatabaseConnectionLoss,
  timeout: runDatabaseTimeout,
  slowQuery: runSlowQuerySimulation,
  transactionFailure: runTransactionFailure,
  poolExhaustion: runConnectionPoolExhaustion,
};

export default {
  databaseExperiments,
  databaseExperimentRunners,
  runDatabaseConnectionLoss,
  runDatabaseTimeout,
  runSlowQuerySimulation,
  runTransactionFailure,
  runConnectionPoolExhaustion,
};
