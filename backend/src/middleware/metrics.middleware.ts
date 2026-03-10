/**
 * ============================================================================
 * METRICS MIDDLEWARE
 * ============================================================================
 * Prometheus-compatible metrics collection for request monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { isMetricsEnabled, observabilityConfig } from '../config/observability';

/**
 * Metric types
 */
type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * Metric label set
 */
interface MetricLabels {
  [key: string]: string | number;
}

/**
 * Base metric interface
 */
interface BaseMetric {
  name: string;
  help: string;
  type: MetricType;
  labels: string[];
}

/**
 * Counter metric
 */
interface Counter extends BaseMetric {
  type: 'counter';
  values: Map<string, number>;
}

/**
 * Gauge metric
 */
interface Gauge extends BaseMetric {
  type: 'gauge';
  values: Map<string, number>;
}

/**
 * Histogram bucket
 */
interface HistogramBucket {
  le: number;
  count: number;
}

/**
 * Histogram metric
 */
interface Histogram extends BaseMetric {
  type: 'histogram';
  buckets: HistogramBucket[];
  values: Map<string, { count: number; sum: number; buckets: number[] }>;
}

// Metrics storage
const counters = new Map<string, Counter>();
const gauges = new Map<string, Gauge>();
const histograms = new Map<string, Histogram>();

/**
 * Create label key from label set
 */
function createLabelKey(labels: MetricLabels): string {
  return Object.entries(labels)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join(',');
}

/**
 * Parse label key back to object (for exposition)
 */
function parseLabelKey(key: string): Record<string, string> {
  const labels: Record<string, string> = {};
  if (!key) return labels;
  
  key.split(',').forEach(part => {
    const [k, v] = part.split('=');
    if (k && v !== undefined) labels[k] = v;
  });
  return labels;
}

/**
 * Register or get a counter metric
 */
export function createCounter(name: string, help: string, labels: string[] = []): Counter {
  if (!counters.has(name)) {
    counters.set(name, {
      name,
      help,
      type: 'counter',
      labels,
      values: new Map(),
    });
  }
  return counters.get(name)!;
}

/**
 * Register or get a gauge metric
 */
export function createGauge(name: string, help: string, labels: string[] = []): Gauge {
  if (!gauges.has(name)) {
    gauges.set(name, {
      name,
      help,
      type: 'gauge',
      labels,
      values: new Map(),
    });
  }
  return gauges.get(name)!;
}

/**
 * Register or get a histogram metric
 */
export function createHistogram(
  name: string,
  help: string,
  labels: string[] = [],
  buckets: number[] = observabilityConfig.metrics.durationBuckets
): Histogram {
  if (!histograms.has(name)) {
    histograms.set(name, {
      name,
      help,
      type: 'histogram',
      labels,
      buckets: buckets.map(b => ({ le: b, count: 0 })),
      values: new Map(),
    });
  }
  return histograms.get(name)!;
}

/**
 * Increment a counter
 */
export function incrementCounter(name: string, labels: MetricLabels = {}, value: number = 1): void {
  if (!isMetricsEnabled()) return;
  
  const counter = counters.get(name);
  if (!counter) {
    logger.warn(`Counter ${name} not found`);
    return;
  }

  const key = createLabelKey(labels);
  const current = counter.values.get(key) || 0;
  counter.values.set(key, current + value);
}

/**
 * Set a gauge value
 */
export function setGauge(name: string, labels: MetricLabels = {}, value: number): void {
  if (!isMetricsEnabled()) return;
  
  const gauge = gauges.get(name);
  if (!gauge) {
    logger.warn(`Gauge ${name} not found`);
    return;
  }

  const key = createLabelKey(labels);
  gauge.values.set(key, value);
}

/**
 * Increment/decrement a gauge
 */
export function incrementGauge(name: string, labels: MetricLabels = {}, value: number = 1): void {
  if (!isMetricsEnabled()) return;
  
  const gauge = gauges.get(name);
  if (!gauge) {
    logger.warn(`Gauge ${name} not found`);
    return;
  }

  const key = createLabelKey(labels);
  const current = gauge.values.get(key) || 0;
  gauge.values.set(key, current + value);
}

/**
 * Observe a value in a histogram
 */
export function observeHistogram(name: string, labels: MetricLabels = {}, value: number): void {
  if (!isMetricsEnabled()) return;
  
  const histogram = histograms.get(name);
  if (!histogram) {
    logger.warn(`Histogram ${name} not found`);
    return;
  }

  const key = createLabelKey(labels);
  let entry = histogram.values.get(key);
  
  if (!entry) {
    entry = { count: 0, sum: 0, buckets: new Array(histogram.buckets.length).fill(0) };
  }

  entry.count++;
  entry.sum += value;

  // Update bucket counts
  histogram.buckets.forEach((bucket, idx) => {
    if (value <= bucket.le) {
      entry!.buckets[idx]++;
    }
  });

  histogram.values.set(key, entry);
}

// Initialize default metrics
const httpRequestsTotal = createCounter(
  'http_requests_total',
  'Total number of HTTP requests',
  ['method', 'route', 'status_code']
);

const httpRequestDuration = createHistogram(
  'http_request_duration_ms',
  'HTTP request duration in milliseconds',
  ['method', 'route', 'status_code'],
  observabilityConfig.metrics.durationBuckets
);

const httpRequestSize = createHistogram(
  'http_request_size_bytes',
  'HTTP request size in bytes',
  ['method', 'route'],
  [100, 1000, 10000, 100000, 1000000]
);

const httpResponseSize = createHistogram(
  'http_response_size_bytes',
  'HTTP response size in bytes',
  ['method', 'route', 'status_code'],
  [100, 1000, 10000, 100000, 1000000]
);

const httpActiveRequests = createGauge(
  'http_active_requests',
  'Number of active HTTP requests',
  ['method']
);

const httpErrorsTotal = createCounter(
  'http_errors_total',
  'Total number of HTTP errors',
  ['method', 'route', 'status_code', 'error_type']
);

const nodeMemoryUsage = createGauge(
  'node_memory_usage_bytes',
  'Node.js memory usage in bytes',
  ['type']
);

const nodeCpuUsage = createGauge(
  'node_cpu_usage_percent',
  'Node.js CPU usage percentage',
  ['type']
);

/**
 * Normalize route path for metrics
 */
function normalizeRoute(req: Request): string {
  // Use route pattern if available, otherwise use path
  const route = req.route?.path || req.path;
  
  // Replace dynamic segments with placeholders
  return route
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/:uuid')
    .replace(/\/[a-f0-9]{24}/g, '/:objectId');
}

/**
 * Calculate request size
 */
function getRequestSize(req: Request): number {
  const contentLength = req.get('content-length');
  if (contentLength) return parseInt(contentLength, 10);
  
  if (req.body) {
    return Buffer.byteLength(JSON.stringify(req.body));
  }
  return 0;
}

/**
 * Metrics collection middleware
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!isMetricsEnabled()) {
    return next();
  }

  const start = Date.now();
  const method = req.method;
  const route = normalizeRoute(req);
  const requestSize = getRequestSize(req);

  // Track active requests
  incrementGauge('http_active_requests', { method }, 1);

  // Record request size
  observeHistogram('http_request_size_bytes', { method, route }, requestSize);

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode.toString();
    const labels = { method, route, status_code: statusCode };

    // Record metrics
    incrementCounter('http_requests_total', labels);
    observeHistogram('http_request_duration_ms', labels, duration);
    incrementGauge('http_active_requests', { method }, -1);

    // Record response size if available
    const responseSize = parseInt(res.get('content-length') || '0', 10);
    if (responseSize > 0) {
      observeHistogram('http_response_size_bytes', labels, responseSize);
    }

    // Track errors separately
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      incrementCounter('http_errors_total', { ...labels, error_type: errorType });
    }

    // Log slow requests
    if (duration > observabilityConfig.thresholds.slowRequestMs) {
      logger.warn('Slow request detected', undefined, {
        method,
        route: req.path,
        duration,
        threshold: observabilityConfig.thresholds.slowRequestMs,
      });
    }
  });

  next();
}

/**
 * Update system metrics
 */
export function updateSystemMetrics(): void {
  if (!isMetricsEnabled()) return;

  const memUsage = process.memoryUsage();
  setGauge('node_memory_usage_bytes', { type: 'rss' }, memUsage.rss);
  setGauge('node_memory_usage_bytes', { type: 'heap_total' }, memUsage.heapTotal);
  setGauge('node_memory_usage_bytes', { type: 'heap_used' }, memUsage.heapUsed);
  setGauge('node_memory_usage_bytes', { type: 'external' }, memUsage.external || 0);

  // CPU usage (approximate)
  const cpuUsage = process.cpuUsage();
  const totalCpu = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
  setGauge('node_cpu_usage_percent', { type: 'user' }, cpuUsage.user / 1000000);
  setGauge('node_cpu_usage_percent', { type: 'system' }, cpuUsage.system / 1000000);
}

/**
 * Format metric labels for Prometheus exposition
 */
function formatLabels(labels: Record<string, string>): string {
  const entries = Object.entries(labels);
  if (entries.length === 0) return '';
  
  const formatted = entries
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  return `{${formatted}}`;
}

/**
 * Generate Prometheus exposition format
 */
export function generateMetrics(): string {
  const lines: string[] = [];

  // Counters
  counters.forEach(counter => {
    lines.push(`# HELP ${counter.name} ${counter.help}`);
    lines.push(`# TYPE ${counter.name} counter`);
    
    if (counter.values.size === 0) {
      lines.push(`${counter.name} 0`);
    } else {
      counter.values.forEach((value, key) => {
        const labels = parseLabelKey(key);
        lines.push(`${counter.name}${formatLabels(labels)} ${value}`);
      });
    }
    lines.push('');
  });

  // Gauges
  gauges.forEach(gauge => {
    lines.push(`# HELP ${gauge.name} ${gauge.help}`);
    lines.push(`# TYPE ${gauge.name} gauge`);
    
    if (gauge.values.size === 0) {
      lines.push(`${gauge.name} 0`);
    } else {
      gauge.values.forEach((value, key) => {
        const labels = parseLabelKey(key);
        lines.push(`${gauge.name}${formatLabels(labels)} ${value}`);
      });
    }
    lines.push('');
  });

  // Histograms
  histograms.forEach(histogram => {
    lines.push(`# HELP ${histogram.name} ${histogram.help}`);
    lines.push(`# TYPE ${histogram.name} histogram`);
    
    if (histogram.values.size === 0) {
      lines.push(`${histogram.name}_bucket{le="+Inf"} 0`);
      lines.push(`${histogram.name}_count 0`);
      lines.push(`${histogram.name}_sum 0`);
    } else {
      histogram.values.forEach((value, key) => {
        const labels = parseLabelKey(key);
        
        // Bucket counts
        histogram.buckets.forEach((bucket, idx) => {
          const bucketLabels = { ...labels, le: bucket.le.toString() };
          lines.push(`${histogram.name}_bucket${formatLabels(bucketLabels)} ${value.buckets[idx]}`);
        });
        
        // +Inf bucket
        const infLabels = { ...labels, le: '+Inf' };
        lines.push(`${histogram.name}_bucket${formatLabels(infLabels)} ${value.count}`);
        
        // Count and sum
        lines.push(`${histogram.name}_count${formatLabels(labels)} ${value.count}`);
        lines.push(`${histogram.name}_sum${formatLabels(labels)} ${value.sum}`);
      });
    }
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Metrics endpoint handler
 */
export function metricsEndpoint(req: Request, res: Response): void {
  updateSystemMetrics();
  
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(generateMetrics());
}

/**
 * Get current metrics snapshot (for programmatic use)
 */
export function getMetricsSnapshot(): Record<string, any> {
  return {
    counters: Object.fromEntries(
      Array.from(counters.entries()).map(([name, c]) => [
        name,
        Object.fromEntries(c.values),
      ])
    ),
    gauges: Object.fromEntries(
      Array.from(gauges.entries()).map(([name, g]) => [
        name,
        Object.fromEntries(g.values),
      ])
    ),
    histograms: Object.fromEntries(
      Array.from(histograms.entries()).map(([name, h]) => [
        name,
        Object.fromEntries(h.values),
      ])
    ),
  };
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  counters.forEach(c => c.values.clear());
  gauges.forEach(g => g.values.clear());
  histograms.forEach(h => h.values.clear());
}

export default metricsMiddleware;
