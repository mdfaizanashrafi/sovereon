/**
 * ============================================================================
 * PERFORMANCE MODULE - Index
 * ============================================================================
 * Central export point for all performance-related utilities
 */

// Benchmarks
export {
  runBenchmark,
  runCriticalEndpointBenchmarks,
  benchmarkDatabaseQueries,
  benchmarkCacheOperations,
  benchmark,
  getBenchmarkResults,
  getBenchmarkResult,
  clearBenchmarkResults,
  generateBenchmarkReport,
  BenchmarkResult,
} from './benchmarks';

// Metrics
export {
  trackRequestLatency,
  requestLatencyTracker,
  trackDatabaseQuery,
  trackDbOperation,
  trackCacheOperation,
  trackCacheRatio,
  trackMemoryUsage,
  startMemoryTracking,
  startEventLoopMonitoring,
  getAverageEventLoopLag,
  trackConnection,
  incrementConnection,
  decrementConnection,
  trackRequest,
  updateRequestRates,
  startRequestRateTracking,
  trackExternalApiCall,
  trackExternalRequest,
  getMetrics,
  getMetricsByName,
  getMetricsSummary,
  clearMetrics,
  initializePerformanceMetrics,
} from './metrics';

// Re-export from middleware for convenience
export {
  createCounter,
  createGauge,
  createHistogram,
  incrementCounter,
  setGauge,
  observeHistogram,
  getMetricsSnapshot,
  generateMetrics,
} from '../middleware/metrics.middleware';
