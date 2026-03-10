/**
 * ============================================================================
 * PERFORMANCE METRICS COLLECTION
 * ============================================================================
 * Comprehensive metrics collection for monitoring and observability
 */

import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';
import { 
  createHistogram, 
  createGauge, 
  observeHistogram, 
  setGauge,
  incrementCounter,
} from '../middleware/metrics.middleware';

/**
 * Metric value types
 */
type MetricValue = number | string | boolean | Record<string, unknown>;

/**
 * Performance metric interface
 */
interface PerformanceMetric {
  name: string;
  value: MetricValue;
  timestamp: number;
  labels?: Record<string, string>;
  unit?: string;
}

/**
 * Latency histogram bucket configuration
 */
const LATENCY_BUCKETS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

/**
 * Memory tracking configuration
 */
const MEMORY_TRACKING_INTERVAL = 60000; // 1 minute

// ============================================================================
// HISTOGRAMS
// ============================================================================

// Request latency histogram
const requestLatencyHistogram = createHistogram(
  'app_request_latency_ms',
  'Application request latency in milliseconds',
  ['route', 'method', 'status'],
  LATENCY_BUCKETS
);

// Database query latency histogram
const dbQueryLatencyHistogram = createHistogram(
  'db_query_latency_ms',
  'Database query latency in milliseconds',
  ['operation', 'table'],
  LATENCY_BUCKETS
);

// Cache operation latency histogram
const cacheLatencyHistogram = createHistogram(
  'cache_operation_latency_ms',
  'Cache operation latency in milliseconds',
  ['operation', 'result'],
  [1, 5, 10, 25, 50, 100, 250]
);

// External API call latency
const externalApiLatencyHistogram = createHistogram(
  'external_api_latency_ms',
  'External API call latency in milliseconds',
  ['service', 'endpoint'],
  LATENCY_BUCKETS
);

// ============================================================================
// GAUGES
// ============================================================================

// Memory heap tracking
const memoryHeapGauge = createGauge(
  'app_memory_heap_bytes',
  'Application memory heap usage in bytes',
  ['type']
);

// Event loop lag gauge
const eventLoopLagGauge = createGauge(
  'app_event_loop_lag_ms',
  'Event loop lag in milliseconds',
  []
);

// Active connections gauge
const activeConnectionsGauge = createGauge(
  'app_active_connections',
  'Number of active connections',
  ['type']
);

// Request rate gauge
const requestRateGauge = createGauge(
  'app_requests_per_second',
  'Requests per second',
  ['route']
);

// ============================================================================
// METRIC STORAGE
// ============================================================================

const metricsStore = new Map<string, PerformanceMetric[]>();
const MAX_METRICS_HISTORY = 10000;

/**
 * Store a metric value
 */
function storeMetric(metric: PerformanceMetric): void {
  if (!metricsStore.has(metric.name)) {
    metricsStore.set(metric.name, []);
  }
  
  const history = metricsStore.get(metric.name)!;
  history.push(metric);
  
  // Trim old metrics
  if (history.length > MAX_METRICS_HISTORY) {
    history.shift();
  }
}

// ============================================================================
// REQUEST LATENCY TRACKING
// ============================================================================

/**
 * Track request latency
 */
export function trackRequestLatency(
  route: string,
  method: string,
  status: number,
  durationMs: number
): void {
  const statusCode = status.toString();
  observeHistogram('app_request_latency_ms', { route, method, status: statusCode }, durationMs);
  
  storeMetric({
    name: 'request_latency',
    value: durationMs,
    timestamp: Date.now(),
    labels: { route, method, status: statusCode },
    unit: 'ms',
  });
}

/**
 * Middleware to track request latency
 */
export function requestLatencyTracker() {
  return (req: any, res: any, next: any) => {
    const start = performance.now();
    
    res.on('finish', () => {
      const duration = performance.now() - start;
      const route = req.route?.path || req.path;
      trackRequestLatency(route, req.method, res.statusCode, duration);
    });
    
    next();
  };
}

// ============================================================================
// DATABASE QUERY TRACKING
// ============================================================================

/**
 * Track database query duration
 */
export function trackDatabaseQuery(
  operation: string,
  table: string,
  durationMs: number
): void {
  observeHistogram('db_query_latency_ms', { operation, table }, durationMs);
  
  storeMetric({
    name: 'db_query_latency',
    value: durationMs,
    timestamp: Date.now(),
    labels: { operation, table },
    unit: 'ms',
  });
  
  // Log slow queries
  if (durationMs > 100) {
    logger.warn('Slow database query detected', {
      operation,
      table,
      duration: durationMs.toFixed(2) + 'ms',
    });
  }
}

/**
 * Decorator/wrapper for database operations
 */
export async function trackDbOperation<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    trackDatabaseQuery(operation, table, performance.now() - start);
    return result;
  } catch (e) {
    trackDatabaseQuery(operation, table, performance.now() - start);
    throw e;
  }
}

// ============================================================================
// CACHE OPERATION TRACKING
// ============================================================================

/**
 * Track cache operation timing
 */
export function trackCacheOperation(
  operation: 'get' | 'set' | 'delete' | 'clear',
  result: 'hit' | 'miss' | 'success' | 'error',
  durationMs: number
): void {
  observeHistogram('cache_operation_latency_ms', { operation, result }, durationMs);
  
  storeMetric({
    name: 'cache_operation_latency',
    value: durationMs,
    timestamp: Date.now(),
    labels: { operation, result },
    unit: 'ms',
  });
}

/**
 * Calculate and track cache hit/miss ratio
 */
export function trackCacheRatio(hits: number, misses: number): void {
  const total = hits + misses;
  const hitRate = total > 0 ? hits / total : 0;
  
  setGauge('cache_hit_rate', {}, hitRate);
  
  storeMetric({
    name: 'cache_hit_rate',
    value: hitRate,
    timestamp: Date.now(),
    unit: 'ratio',
  });
}

// ============================================================================
// MEMORY HEAP TRACKING
// ============================================================================

let lastMemorySnapshot: NodeJS.MemoryUsage | null = null;

/**
 * Capture and track memory usage
 */
export function trackMemoryUsage(): void {
  const usage = process.memoryUsage();
  
  setGauge('app_memory_heap_bytes', { type: 'used' }, usage.heapUsed);
  setGauge('app_memory_heap_bytes', { type: 'total' }, usage.heapTotal);
  setGauge('app_memory_heap_bytes', { type: 'rss' }, usage.rss);
  setGauge('app_memory_heap_bytes', { type: 'external' }, usage.external || 0);
  
  // Calculate growth rate if we have a previous snapshot
  if (lastMemorySnapshot) {
    const growthRate = usage.heapUsed - lastMemorySnapshot.heapUsed;
    setGauge('app_memory_heap_bytes', { type: 'growth_rate' }, growthRate);
    
    // Warn if memory is growing rapidly
    if (growthRate > 50 * 1024 * 1024) { // 50MB growth
      logger.warn('Rapid memory growth detected', {
        growthRate: (growthRate / 1024 / 1024).toFixed(2) + 'MB',
        currentHeap: (usage.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
      });
    }
  }
  
  lastMemorySnapshot = usage;
  
  storeMetric({
    name: 'memory_heap_used',
    value: usage.heapUsed,
    timestamp: Date.now(),
    unit: 'bytes',
  });
}

/**
 * Start automatic memory tracking
 */
export function startMemoryTracking(): void {
  trackMemoryUsage();
  setInterval(trackMemoryUsage, MEMORY_TRACKING_INTERVAL);
  logger.info('Memory tracking started', { interval: MEMORY_TRACKING_INTERVAL + 'ms' });
}

// ============================================================================
// EVENT LOOP LAG MONITORING
// ============================================================================

let eventLoopLagHistogram: number[] = [];
const EVENT_LOOP_LAG_INTERVAL = 1000;

/**
 * Measure event loop lag
 */
function measureEventLoopLag(): void {
  const start = performance.now();
  
  setImmediate(() => {
    const lag = performance.now() - start;
    eventLoopLagHistogram.push(lag);
    
    // Keep only last 60 seconds
    if (eventLoopLagHistogram.length > 60) {
      eventLoopLagHistogram.shift();
    }
    
    setGauge('app_event_loop_lag_ms', {}, lag);
    
    // Warn if event loop is lagging significantly
    if (lag > 100) {
      logger.warn('Event loop lag detected', {
        lag: lag.toFixed(2) + 'ms',
        avgLag: (eventLoopLagHistogram.reduce((a, b) => a + b, 0) / eventLoopLagHistogram.length).toFixed(2) + 'ms',
      });
    }
  });
}

/**
 * Start event loop lag monitoring
 */
export function startEventLoopMonitoring(): void {
  setInterval(measureEventLoopLag, EVENT_LOOP_LAG_INTERVAL);
  logger.info('Event loop monitoring started');
}

/**
 * Get average event loop lag
 */
export function getAverageEventLoopLag(): number {
  if (eventLoopLagHistogram.length === 0) return 0;
  return eventLoopLagHistogram.reduce((a, b) => a + b, 0) / eventLoopLagHistogram.length;
}

// ============================================================================
// CONNECTION TRACKING
// ============================================================================

const connectionCounts = new Map<string, number>();

/**
 * Track active connections
 */
export function trackConnection(type: string, delta: number): void {
  const current = connectionCounts.get(type) || 0;
  const updated = Math.max(0, current + delta);
  connectionCounts.set(type, updated);
  setGauge('app_active_connections', { type }, updated);
}

/**
 * Increment active connections
 */
export function incrementConnection(type: string): void {
  trackConnection(type, 1);
}

/**
 * Decrement active connections
 */
export function decrementConnection(type: string): void {
  trackConnection(type, -1);
}

// ============================================================================
// REQUEST RATE TRACKING
// ============================================================================

const requestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_WINDOW_MS = 60000; // 1 minute window

/**
 * Track request for rate calculation
 */
export function trackRequest(route: string): void {
  const now = Date.now();
  const entry = requestCounts.get(route);
  
  if (!entry || now - entry.lastReset > RATE_WINDOW_MS) {
    requestCounts.set(route, { count: 1, lastReset: now });
  } else {
    entry.count++;
  }
}

/**
 * Calculate and update request rates
 */
export function updateRequestRates(): void {
  const now = Date.now();
  
  requestCounts.forEach((entry, route) => {
    const elapsedSeconds = (now - entry.lastReset) / 1000;
    const rate = entry.count / elapsedSeconds;
    setGauge('app_requests_per_second', { route }, rate);
  });
}

/**
 * Start request rate tracking
 */
export function startRequestRateTracking(): void {
  setInterval(updateRequestRates, 10000); // Update every 10 seconds
}

// ============================================================================
// EXTERNAL API TRACKING
// ============================================================================

/**
 * Track external API call
 */
export function trackExternalApiCall(
  service: string,
  endpoint: string,
  durationMs: number,
  success: boolean
): void {
  observeHistogram('external_api_latency_ms', { service, endpoint }, durationMs);
  
  storeMetric({
    name: 'external_api_latency',
    value: durationMs,
    timestamp: Date.now(),
    labels: { service, endpoint, success: success.toString() },
    unit: 'ms',
  });
}

/**
 * Wrapper for external API calls
 */
export async function trackExternalRequest<T>(
  service: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    trackExternalApiCall(service, endpoint, performance.now() - start, true);
    return result;
  } catch (e) {
    trackExternalApiCall(service, endpoint, performance.now() - start, false);
    throw e;
  }
}

// ============================================================================
// METRICS RETRIEVAL
// ============================================================================

/**
 * Get all collected metrics
 */
export function getMetrics(): Record<string, PerformanceMetric[]> {
  return Object.fromEntries(metricsStore);
}

/**
 * Get metrics for a specific metric name
 */
export function getMetricsByName(name: string): PerformanceMetric[] {
  return metricsStore.get(name) || [];
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    eventLoopLag: {
      current: eventLoopLagHistogram[eventLoopLagHistogram.length - 1] || 0,
      average: getAverageEventLoopLag(),
    },
    memory: lastMemorySnapshot ? {
      heapUsed: lastMemorySnapshot.heapUsed,
      heapTotal: lastMemorySnapshot.heapTotal,
      rss: lastMemorySnapshot.rss,
    } : null,
    connections: Object.fromEntries(connectionCounts),
    metricsCount: metricsStore.size,
  };
  
  return summary;
}

/**
 * Clear all stored metrics
 */
export function clearMetrics(): void {
  metricsStore.clear();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all performance monitoring
 */
export function initializePerformanceMetrics(): void {
  startMemoryTracking();
  startEventLoopMonitoring();
  startRequestRateTracking();
  
  logger.info('Performance metrics collection initialized');
}

export default {
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
};
