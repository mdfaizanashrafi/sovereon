/**
 * ============================================================================
 * CHAOS EXPERIMENT: Memory Pressure
 * ============================================================================
 * Simulates various memory-related failure scenarios:
 * - Memory leak simulation
 * - Heap exhaustion
 * - Garbage collection pressure
 * - Large payload handling
 */

import { getChaosEngine, ExperimentDefinition, parseDuration } from '../engine';
import { logger } from '../../utils/logger';

// ============================================================================
// EXPERIMENT DEFINITIONS
// ============================================================================

/**
 * Memory leak simulation experiment
 */
export const memoryLeakSimulation: ExperimentDefinition = {
  id: '',
  name: 'memory_leak_simulation',
  description: 'Simulates gradual memory leak to test leak detection',
  target: 'memory',
  fault: 'resource_exhaustion',
  scope: 'component',
  duration: parseDuration('2m'),
  rampUpTime: parseDuration('30s'),
  intensity: 0.3,
  autoRollback: true,
  maxDuration: parseDuration('5m'),
  abortConditions: [
    { metric: 'memory_usage', operator: '>', threshold: 1024 }, // 1GB
    { metric: 'error_rate', operator: '>', threshold: 10 },
  ],
  hypothesis: {
    when: 'memory leaks occur',
    systemWill: 'trigger garbage collection and alert monitoring',
    maintaining: 'service availability with memory warnings',
  },
  config: {
    leakRate: 10, // MB per second
    maxLeak: 500, // MB
  },
};

/**
 * Heap exhaustion experiment
 */
export const heapExhaustion: ExperimentDefinition = {
  id: '',
  name: 'heap_exhaustion',
  description: 'Simulates heap memory exhaustion scenarios',
  target: 'memory',
  fault: 'resource_exhaustion',
  scope: 'system',
  duration: parseDuration('30s'),
  intensity: 1.0,
  autoRollback: true,
  maxDuration: parseDuration('1m'),
  abortConditions: [
    { metric: 'memory_usage', operator: '>', threshold: 1536 }, // 1.5GB
    { metric: 'error_rate', operator: '>', threshold: 20 },
  ],
  hypothesis: {
    when: 'heap is exhausted',
    systemWill: 'return 503 and restart gracefully',
    maintaining: 'zero downtime with container orchestration',
  },
  config: {
    targetHeapSize: 1024, // MB
    allocationChunk: 50, // MB
  },
};

/**
 * Garbage collection pressure experiment
 */
export const garbageCollectionPressure: ExperimentDefinition = {
  id: '',
  name: 'gc_pressure',
  description: 'Creates high garbage collection pressure',
  target: 'memory',
  fault: 'resource_exhaustion',
  scope: 'component',
  duration: parseDuration('45s'),
  intensity: 0.7,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'p99_latency', operator: '>', threshold: 5000 },
  ],
  hypothesis: {
    when: 'GC pressure is high',
    systemWill: 'batch allocations and use object pools',
    maintaining: 'response times under 1s',
  },
  config: {
    allocationRate: 1000, // objects per second
    objectSize: 1024, // bytes
    retentionTime: 100, // ms
  },
};

/**
 * Large payload handling experiment
 */
export const largePayloadHandling: ExperimentDefinition = {
  id: '',
  name: 'large_payload_handling',
  description: 'Tests handling of unexpectedly large payloads',
  target: 'memory',
  fault: 'error_injection',
  scope: 'component',
  duration: parseDuration('30s'),
  intensity: 0.4,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'memory_usage', operator: '>', threshold: 800 },
    { metric: 'error_rate', operator: '>', threshold: 15 },
  ],
  hypothesis: {
    when: 'large payloads are received',
    systemWill: 'validate size limits and stream large responses',
    maintaining: 'memory safety with proper error handling',
  },
  config: {
    minPayloadSize: 1024 * 1024, // 1MB
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    payloadType: 'json', // 'json' | 'buffer' | 'string'
  },
};

// ============================================================================
// FAULT INJECTION IMPLEMENTATIONS
// ============================================================================

/**
 * Memory leak simulator
 */
class MemoryLeakSimulator {
  private leakRate: number; // MB per second
  private maxLeak: number; // MB
  private allocatedObjects: any[] = [];
  private interval?: NodeJS.Timeout;
  private totalLeaked = 0;

  constructor(config: { leakRate: number; maxLeak: number }) {
    this.leakRate = config.leakRate;
    this.maxLeak = config.maxLeak;
  }

  async inject(): Promise<void> {
    const chunkSize = this.leakRate * 1024 * 1024; // Convert to bytes
    
    this.interval = setInterval(() => {
      if (this.totalLeaked >= this.maxLeak) {
        return;
      }

      // Create large objects that won't be garbage collected
      const leakChunk = new Array(chunkSize / 8).fill(0).map(() => ({
        data: Buffer.alloc(1024).toString('hex'),
        timestamp: Date.now(),
        id: Math.random().toString(36),
      }));

      this.allocatedObjects.push(...leakChunk);
      this.totalLeaked += this.leakRate;

      logger.info(`[Chaos] Memory leak: ${this.totalLeaked}MB allocated`);
    }, 1000);

    logger.info('[Chaos] Memory leak simulation started');
  }

  async rollback(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    // Release references for garbage collection
    const leakedCount = this.allocatedObjects.length;
    this.allocatedObjects = [];
    this.totalLeaked = 0;

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    logger.info(`[Chaos] Memory leak simulation ended. Released ${leakedCount} objects`);
  }
}

/**
 * Heap exhaustion simulator
 */
class HeapExhaustionSimulator {
  private targetHeapSize: number;
  private allocationChunk: number;
  private allocatedObjects: Buffer[] = [];

  constructor(config: { targetHeapSize: number; allocationChunk: number }) {
    this.targetHeapSize = config.targetHeapSize;
    this.allocationChunk = config.allocationChunk;
  }

  async inject(): Promise<void> {
    const chunkBytes = this.allocationChunk * 1024 * 1024;
    const targetBytes = this.targetHeapSize * 1024 * 1024;

    try {
      while (process.memoryUsage().heapUsed < targetBytes) {
        const buffer = Buffer.alloc(chunkBytes);
        // Fill with data to ensure it's actually allocated
        buffer.fill(Math.random().toString(36));
        this.allocatedObjects.push(buffer);

        const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
        logger.info(`[Chaos] Heap exhaustion: ${heapUsedMB.toFixed(2)}MB used`);

        // Small delay to allow logging
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      logger.error('[Chaos] Heap exhaustion simulation hit limit:', error);
    }

    logger.info('[Chaos] Heap exhaustion simulation completed');
  }

  async rollback(): Promise<void> {
    this.allocatedObjects = [];
    
    if (global.gc) {
      global.gc();
    }

    logger.info('[Chaos] Heap exhaustion simulation rolled back');
  }
}

/**
 * Garbage collection pressure generator
 */
class GCPressureGenerator {
  private allocationRate: number;
  private objectSize: number;
  private retentionTime: number;
  private interval?: NodeJS.Timeout;
  private tempObjects: any[] = [];

  constructor(config: { allocationRate: number; objectSize: number; retentionTime: number }) {
    this.allocationRate = config.allocationRate;
    this.objectSize = config.objectSize;
    this.retentionTime = config.retentionTime;
  }

  async inject(): Promise<void> {
    const intervalMs = 1000 / (this.allocationRate / 100); // Allocate in batches

    this.interval = setInterval(() => {
      // Create temporary objects
      for (let i = 0; i < 100; i++) {
        this.tempObjects.push({
          data: Buffer.alloc(this.objectSize).fill('x'),
          id: Math.random().toString(36),
          created: Date.now(),
        });
      }

      // Clean up old objects to create GC pressure
      const cutoff = Date.now() - this.retentionTime;
      this.tempObjects = this.tempObjects.filter(obj => obj.created > cutoff);

      logger.debug(`[Chaos] GC pressure: ${this.tempObjects.length} objects in temp storage`);
    }, intervalMs);

    logger.info('[Chaos] GC pressure generation started');
  }

  async rollback(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.tempObjects = [];
    
    if (global.gc) {
      global.gc();
    }

    logger.info('[Chaos] GC pressure generation stopped');
  }
}

/**
 * Large payload generator
 */
class LargePayloadGenerator {
  private minPayloadSize: number;
  private maxPayloadSize: number;
  private payloadType: string;
  private originalBodyParser: any;

  constructor(config: { minPayloadSize: number; maxPayloadSize: number; payloadType: string }) {
    this.minPayloadSize = config.minPayloadSize;
    this.maxPayloadSize = config.maxPayloadSize;
    this.payloadType = config.payloadType;
  }

  async inject(intensity: number): Promise<void> {
    // This experiment simulates receiving large payloads
    // In a real implementation, this would be integrated with the Express middleware
    
    logger.info('[Chaos] Large payload simulation enabled', {
      minSize: this.minPayloadSize,
      maxSize: this.maxPayloadSize,
      type: this.payloadType,
    });

    // Log warning about payload size
    const samplePayload = this.generatePayload(
      this.minPayloadSize + Math.random() * (this.maxPayloadSize - this.minPayloadSize)
    );
    
    logger.info(`[Chaos] Sample payload size: ${Buffer.byteLength(JSON.stringify(samplePayload))} bytes`);
  }

  private generatePayload(targetSize: number): any {
    const payload: any = {
      timestamp: Date.now(),
      data: [],
    };

    const itemSize = 1000; // Approximate size of each item in bytes
    const numItems = Math.floor(targetSize / itemSize);

    for (let i = 0; i < numItems; i++) {
      payload.data.push({
        id: i,
        content: 'x'.repeat(500),
        metadata: {
          index: i,
          random: Math.random().toString(36).repeat(10),
        },
      });
    }

    return payload;
  }

  async rollback(): Promise<void> {
    logger.info('[Chaos] Large payload simulation disabled');
  }
}

// ============================================================================
// EXPERIMENT RUNNERS
// ============================================================================

export async function runMemoryLeakSimulation(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...memoryLeakSimulation,
    duration: duration ? parseDuration(duration) : memoryLeakSimulation.duration,
  };
  
  const simulator = new MemoryLeakSimulator((definition.config || { leakRate: 10, maxLeak: 500 }) as { leakRate: number; maxLeak: number });
  
  engine.once('experiment:starting', async () => {
    await simulator.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await simulator.rollback();
  });
  
  return engine.run(definition);
}

export async function runHeapExhaustion(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...heapExhaustion,
    duration: duration ? parseDuration(duration) : heapExhaustion.duration,
  };
  
  const simulator = new HeapExhaustionSimulator((definition.config || { targetHeapSize: 1024, allocationChunk: 50 }) as { targetHeapSize: number; allocationChunk: number });
  
  engine.once('experiment:starting', async () => {
    await simulator.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await simulator.rollback();
  });
  
  return engine.run(definition);
}

export async function runGCPressure(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...garbageCollectionPressure,
    duration: duration ? parseDuration(duration) : garbageCollectionPressure.duration,
  };
  
  const generator = new GCPressureGenerator((definition.config || { allocationRate: 1000, objectSize: 1024, retentionTime: 100 }) as { allocationRate: number; objectSize: number; retentionTime: number });
  
  engine.once('experiment:starting', async () => {
    await generator.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await generator.rollback();
  });
  
  return engine.run(definition);
}

export async function runLargePayloadHandling(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...largePayloadHandling,
    duration: duration ? parseDuration(duration) : largePayloadHandling.duration,
  };
  
  const generator = new LargePayloadGenerator((definition.config || { minPayloadSize: 1024 * 1024, maxPayloadSize: 10 * 1024 * 1024, payloadType: 'json' }) as { minPayloadSize: number; maxPayloadSize: number; payloadType: string });
  
  engine.once('experiment:starting', async () => {
    await generator.inject(definition.intensity);
  });
  
  engine.once('experiment:rolled_back', async () => {
    await generator.rollback();
  });
  
  return engine.run(definition);
}

// ============================================================================
// EXPERIMENT CATALOG
// ============================================================================

export const memoryExperiments = {
  memoryLeak: memoryLeakSimulation,
  heapExhaustion: heapExhaustion,
  gcPressure: garbageCollectionPressure,
  largePayload: largePayloadHandling,
};

export const memoryExperimentRunners = {
  memoryLeak: runMemoryLeakSimulation,
  heapExhaustion: runHeapExhaustion,
  gcPressure: runGCPressure,
  largePayload: runLargePayloadHandling,
};

export default {
  memoryExperiments,
  memoryExperimentRunners,
  runMemoryLeakSimulation,
  runHeapExhaustion,
  runGCPressure,
  runLargePayloadHandling,
};
