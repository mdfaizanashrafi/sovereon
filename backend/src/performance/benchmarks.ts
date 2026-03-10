/**
 * ============================================================================
 * PERFORMANCE BENCHMARK SUITE
 * ============================================================================
 * Comprehensive benchmarking for API endpoints and system performance
 */

import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { logger } from '../utils/logger';
import { getEnhancedCache } from '../config/cache';
import { PrismaClient } from '@prisma/client';
import { getMetricsSnapshot, createHistogram, observeHistogram } from '../middleware/metrics.middleware';

const prisma = new PrismaClient();

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  name: string;
  endpoint: string;
  method: string;
  iterations: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50: number;
  p95: number;
  p99: number;
  stdDev: number;
  memoryDelta: MemorySnapshot;
  concurrentSuccess: number;
  concurrentFailed: number;
  timestamp: string;
}

/**
 * Memory snapshot interface
 */
interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
}

/**
 * Benchmark configuration
 */
interface BenchmarkConfig {
  iterations?: number;
  concurrentRequests?: number;
  warmupIterations?: number;
  timeoutMs?: number;
}

// Default configuration
const defaultConfig: Required<BenchmarkConfig> = {
  iterations: 100,
  concurrentRequests: 10,
  warmupIterations: 10,
  timeoutMs: 30000,
};

// Store active benchmarks
const activeBenchmarks = new Map<string, BenchmarkResult>();

// Initialize histograms for benchmark metrics
const benchmarkDurationHistogram = createHistogram(
  'benchmark_request_duration_ms',
  'Benchmark request duration in milliseconds',
  ['endpoint', 'method'],
  [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
);

/**
 * Capture memory snapshot
 */
function captureMemorySnapshot(): MemorySnapshot {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    rss: usage.rss,
    external: usage.external || 0,
  };
}

/**
 * Calculate memory delta between two snapshots
 */
function calculateMemoryDelta(before: MemorySnapshot, after: MemorySnapshot): MemorySnapshot {
  return {
    heapUsed: after.heapUsed - before.heapUsed,
    heapTotal: after.heapTotal - before.heapTotal,
    rss: after.rss - before.rss,
    external: after.external - before.external,
  };
}

/**
 * Calculate percentiles from sorted array
 */
function calculatePercentiles(sortedValues: number[]): { p50: number; p95: number; p99: number } {
  const len = sortedValues.length;
  if (len === 0) return { p50: 0, p95: 0, p99: 0 };
  
  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * len) - 1;
    return sortedValues[Math.max(0, Math.min(index, len - 1))];
  };
  
  return {
    p50: getPercentile(50),
    p95: getPercentile(95),
    p99: getPercentile(99),
  };
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Run benchmark for a single endpoint
 */
export async function runBenchmark(
  name: string,
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, unknown>,
  config: BenchmarkConfig = {}
): Promise<BenchmarkResult> {
  const opts = { ...defaultConfig, ...config };
  const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
  const url = `${baseUrl}${endpoint}`;
  
  logger.info(`Starting benchmark: ${name}`, { endpoint, method, iterations: opts.iterations });
  
  // Warmup phase
  logger.debug(`Running ${opts.warmupIterations} warmup iterations`);
  for (let i = 0; i < opts.warmupIterations; i++) {
    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      // Ignore warmup errors
    }
  }
  
  // Memory snapshot before
  const memBefore = captureMemorySnapshot();
  
  // Sequential benchmark
  const durations: number[] = [];
  const startTime = performance.now();
  
  for (let i = 0; i < opts.iterations; i++) {
    const iterStart = performance.now();
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const iterDuration = performance.now() - iterStart;
      durations.push(iterDuration);
      observeHistogram('benchmark_request_duration_ms', { endpoint, method }, iterDuration);
    } catch (e) {
      logger.warn(`Benchmark iteration ${i} failed`, e);
    }
  }
  
  const totalDuration = performance.now() - startTime;
  
  // Concurrent benchmark
  let concurrentSuccess = 0;
  let concurrentFailed = 0;
  
  const concurrentPromises = Array.from({ length: opts.concurrentRequests }, async () => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.ok) concurrentSuccess++;
      else concurrentFailed++;
    } catch (e) {
      concurrentFailed++;
    }
  });
  
  await Promise.all(concurrentPromises);
  
  // Memory snapshot after
  const memAfter = captureMemorySnapshot();
  const memoryDelta = calculateMemoryDelta(memBefore, memAfter);
  
  // Calculate statistics
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const { p50, p95, p99 } = calculatePercentiles(sortedDurations);
  
  const result: BenchmarkResult = {
    name,
    endpoint,
    method,
    iterations: opts.iterations,
    totalDuration,
    avgDuration,
    minDuration: sortedDurations[0] || 0,
    maxDuration: sortedDurations[sortedDurations.length - 1] || 0,
    p50,
    p95,
    p99,
    stdDev: calculateStdDev(durations, avgDuration),
    memoryDelta,
    concurrentSuccess,
    concurrentFailed,
    timestamp: new Date().toISOString(),
  };
  
  activeBenchmarks.set(name, result);
  
  logger.info(`Benchmark completed: ${name}`, {
    avgDuration: result.avgDuration.toFixed(2) + 'ms',
    p95: result.p95.toFixed(2) + 'ms',
    concurrentSuccess,
  });
  
  return result;
}

/**
 * Benchmark critical API endpoints
 */
export async function runCriticalEndpointBenchmarks(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];
  
  // Define critical endpoints
  const endpoints = [
    { name: 'get_services', endpoint: '/api/services', method: 'GET' },
    { name: 'get_service_by_slug', endpoint: '/api/services/consulting', method: 'GET' },
    { name: 'health_check', endpoint: '/api/health', method: 'GET' },
    { name: 'get_team_members', endpoint: '/api/v1/team-members', method: 'GET' },
    { name: 'get_faqs', endpoint: '/api/v1/faqs', method: 'GET' },
    { name: 'contact_form', endpoint: '/api/contact', method: 'POST', body: { name: 'Test', email: 'test@test.com', message: 'Test message' } },
  ];
  
  for (const ep of endpoints) {
    try {
      const result = await runBenchmark(
        ep.name,
        ep.endpoint,
        ep.method,
        ep.body,
        { iterations: 50, concurrentRequests: 5 }
      );
      results.push(result);
    } catch (e) {
      logger.error(`Failed to benchmark ${ep.name}`, e);
    }
  }
  
  return results;
}

/**
 * Benchmark database queries
 */
export async function benchmarkDatabaseQueries(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  
  // Simple select
  const start1 = performance.now();
  await prisma.service.findMany({ take: 10 });
  results['service_findMany_10'] = performance.now() - start1;
  
  // Select with relations
  const start2 = performance.now();
  await prisma.service.findMany({ 
    take: 10,
    include: { category: true }
  });
  results['service_findMany_with_category'] = performance.now() - start2;
  
  // Count query
  const start3 = performance.now();
  await prisma.service.count();
  results['service_count'] = performance.now() - start3;
  
  // Find unique
  const start4 = performance.now();
  await prisma.service.findFirst();
  results['service_findFirst'] = performance.now() - start4;
  
  logger.info('Database query benchmarks completed', results);
  return results;
}

/**
 * Benchmark cache operations
 */
export async function benchmarkCacheOperations(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  const cache = getEnhancedCache();
  const testKey = 'benchmark:test';
  const testValue = { data: 'test', timestamp: Date.now() };
  
  // Cache set
  const start1 = performance.now();
  await cache.set(testKey, testValue, 60);
  results['cache_set'] = performance.now() - start1;
  
  // Cache get (hit)
  const start2 = performance.now();
  await cache.get(testKey);
  results['cache_get_hit'] = performance.now() - start2;
  
  // Cache get (miss)
  const start3 = performance.now();
  await cache.get('benchmark:nonexistent');
  results['cache_get_miss'] = performance.now() - start3;
  
  // Cache delete
  const start4 = performance.now();
  await cache.delete(testKey);
  results['cache_delete'] = performance.now() - start4;
  
  // Batch operations
  const batchData = Array.from({ length: 100 }, (_, i) => ({
    key: `benchmark:batch:${i}`,
    value: { id: i, data: `test-${i}` },
  }));
  
  const start5 = performance.now();
  await Promise.all(batchData.map(item => cache.set(item.key, item.value, 60)));
  results['cache_batch_set_100'] = performance.now() - start5;
  
  const start6 = performance.now();
  await Promise.all(batchData.map(item => cache.get(item.key)));
  results['cache_batch_get_100'] = performance.now() - start6;
  
  // Cleanup
  await Promise.all(batchData.map(item => cache.delete(item.key)));
  
  logger.info('Cache operation benchmarks completed', results);
  return results;
}

/**
 * Middleware factory for endpoint benchmarking
 */
export function benchmark(name: string, config?: BenchmarkConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    const memBefore = captureMemorySnapshot();
    
    res.on('finish', () => {
      const duration = performance.now() - start;
      const memAfter = captureMemorySnapshot();
      
      observeHistogram('benchmark_request_duration_ms', 
        { endpoint: req.route?.path || req.path, method: req.method }, 
        duration
      );
      
      // Log slow requests
      if (duration > 1000) {
        logger.warn(`Slow request detected in ${name}`, {
          duration: duration.toFixed(2) + 'ms',
          path: req.path,
          method: req.method,
          memoryDelta: calculateMemoryDelta(memBefore, memAfter),
        });
      }
    });
    
    next();
  };
}

/**
 * Get all benchmark results
 */
export function getBenchmarkResults(): Map<string, BenchmarkResult> {
  return new Map(activeBenchmarks);
}

/**
 * Get specific benchmark result
 */
export function getBenchmarkResult(name: string): BenchmarkResult | undefined {
  return activeBenchmarks.get(name);
}

/**
 * Clear all benchmark results
 */
export function clearBenchmarkResults(): void {
  activeBenchmarks.clear();
}

/**
 * Generate benchmark report
 */
export function generateBenchmarkReport(): Record<string, unknown> {
  const results = Array.from(activeBenchmarks.values());
  
  if (results.length === 0) {
    return { message: 'No benchmarks have been run' };
  }
  
  const totalAvg = results.reduce((sum, r) => sum + r.avgDuration, 0) / results.length;
  const totalP95 = results.reduce((sum, r) => sum + r.p95, 0) / results.length;
  
  return {
    summary: {
      totalBenchmarks: results.length,
      totalAvgDuration: totalAvg.toFixed(2) + 'ms',
      totalP95Duration: totalP95.toFixed(2) + 'ms',
      generatedAt: new Date().toISOString(),
    },
    benchmarks: results.map(r => ({
      name: r.name,
      endpoint: r.endpoint,
      method: r.method,
      avgDuration: r.avgDuration.toFixed(2) + 'ms',
      p95: r.p95.toFixed(2) + 'ms',
      p99: r.p99.toFixed(2) + 'ms',
      memoryDelta: {
        heapUsed: (r.memoryDelta.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
      },
      concurrentSuccess: r.concurrentSuccess,
    })),
  };
}

export default {
  runBenchmark,
  runCriticalEndpointBenchmarks,
  benchmarkDatabaseQueries,
  benchmarkCacheOperations,
  benchmark,
  getBenchmarkResults,
  getBenchmarkResult,
  clearBenchmarkResults,
  generateBenchmarkReport,
};
