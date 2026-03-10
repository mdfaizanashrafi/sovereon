/**
 * ============================================================================
 * CHAOS ENGINEERING FRAMEWORK - Main Export
 * ============================================================================
 * Centralized exports for the chaos engineering framework.
 */

// Core engine
export {
  ChaosEngine,
  getChaosEngine,
  resetChaosEngine,
  parseDuration,
  createExperiment,
  type ChaosFaultType,
  type ChaosTarget,
  type ExperimentDefinition,
  type ExperimentResult,
  type RunningExperiment,
  type SystemMetrics,
  type AbortCondition,
  type ExperimentScope,
  type ExperimentStatus,
} from './engine';

// Probes
export {
  databaseProbe,
  cacheProbe,
  externalServiceProbe,
  diskSpaceProbe,
  memoryProbe,
  eventLoopProbe,
  dnsProbe,
  createHttpEndpointProbe,
  registerProbe,
  getProbe,
  getAllProbes,
  runProbe,
  runAllProbes,
  ProbeMonitor,
  type Probe,
  type ProbeResult,
  type ProbeStatus,
} from './probes';

// Experiments
export {
  allExperiments,
  getAllExperimentsList,
  findExperiment,
  getExperimentsByTarget,
  getExperimentCatalog,
  runExperimentByName,
  
  // Database
  databaseExperiments,
  databaseExperimentRunners,
  runDatabaseConnectionLoss,
  runDatabaseTimeout,
  runSlowQuerySimulation,
  runTransactionFailure,
  runConnectionPoolExhaustion,
  
  // Cache
  cacheExperiments,
  cacheExperimentRunners,
  runRedisConnectionFailure,
  runCacheTimeout,
  runCacheCorruption,
  runCacheStampede,
  
  // Network
  networkExperiments,
  networkExperimentRunners,
  runApiLatencyInjection,
  runNetworkPartition,
  runExternalServiceTimeout,
  runDnsResolutionFailure,
  
  // Memory
  memoryExperiments,
  memoryExperimentRunners,
  runMemoryLeakSimulation,
  runHeapExhaustion,
  runGCPressure,
  runLargePayloadHandling,
} from './experiments';
