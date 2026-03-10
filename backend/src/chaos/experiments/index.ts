/**
 * ============================================================================
 * CHAOS EXPERIMENTS INDEX
 * ============================================================================
 * Central export for all chaos experiments organized by target system.
 */

// Database experiments
export {
  databaseExperiments,
  databaseExperimentRunners,
  runDatabaseConnectionLoss,
  runDatabaseTimeout,
  runSlowQuerySimulation,
  runTransactionFailure,
  runConnectionPoolExhaustion,
} from './database-failure';

// Cache experiments
export {
  cacheExperiments,
  cacheExperimentRunners,
  runRedisConnectionFailure,
  runCacheTimeout,
  runCacheCorruption,
  runCacheStampede,
} from './cache-failure';

// Network experiments
export {
  networkExperiments,
  networkExperimentRunners,
  runApiLatencyInjection,
  runNetworkPartition,
  runExternalServiceTimeout,
  runDnsResolutionFailure,
} from './network-failure';

// Memory experiments
export {
  memoryExperiments,
  memoryExperimentRunners,
  runMemoryLeakSimulation,
  runHeapExhaustion,
  runGCPressure,
  runLargePayloadHandling,
} from './memory-pressure';

// ============================================================================
// COMBINED CATALOG
// ============================================================================

import { databaseExperiments } from './database-failure';
import { cacheExperiments } from './cache-failure';
import { networkExperiments } from './network-failure';
import { memoryExperiments } from './memory-pressure';
import type { ExperimentDefinition } from '../engine';

/**
 * All available experiments organized by category
 */
export const allExperiments = {
  database: databaseExperiments,
  cache: cacheExperiments,
  network: networkExperiments,
  memory: memoryExperiments,
};

/**
 * Get all experiments as a flat list
 */
export function getAllExperimentsList(): ExperimentDefinition[] {
  return [
    ...Object.values(databaseExperiments),
    ...Object.values(cacheExperiments),
    ...Object.values(networkExperiments),
    ...Object.values(memoryExperiments),
  ];
}

/**
 * Find experiment by name
 */
export function findExperiment(name: string): ExperimentDefinition | undefined {
  return getAllExperimentsList().find(exp => exp.name === name);
}

/**
 * Get experiments by target
 */
export function getExperimentsByTarget(target: string): ExperimentDefinition[] {
  return getAllExperimentsList().filter(exp => exp.target === target);
}

/**
 * Get experiment names by category
 */
export function getExperimentCatalog(): Record<string, string[]> {
  return {
    database: Object.keys(databaseExperiments),
    cache: Object.keys(cacheExperiments),
    network: Object.keys(networkExperiments),
    memory: Object.keys(memoryExperiments),
  };
}

/**
 * Run experiment by name
 */
export async function runExperimentByName(
  name: string,
  duration?: string
): Promise<any> {
  const { databaseExperimentRunners } = await import('./database-failure');
  const { cacheExperimentRunners } = await import('./cache-failure');
  const { networkExperimentRunners } = await import('./network-failure');
  const { memoryExperimentRunners } = await import('./memory-pressure');

  const allRunners = {
    ...databaseExperimentRunners,
    ...cacheExperimentRunners,
    ...networkExperimentRunners,
    ...memoryExperimentRunners,
  };

  const runner = allRunners[name as keyof typeof allRunners];
  if (!runner) {
    throw new Error(`Unknown experiment: ${name}. Available: ${Object.keys(allRunners).join(', ')}`);
  }

  return runner(duration);
}

export default {
  allExperiments,
  getAllExperimentsList,
  findExperiment,
  getExperimentsByTarget,
  getExperimentCatalog,
  runExperimentByName,
};
