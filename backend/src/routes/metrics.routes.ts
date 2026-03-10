/**
 * ============================================================================
 * METRICS ROUTES
 * ============================================================================
 * API endpoints for performance metrics and baseline management
 */

import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';
import { logger } from '../utils/logger';
import { getMetricsSnapshot, generateMetrics } from '../middleware/metrics.middleware';
import { 
  getBenchmarkResults, 
  runCriticalEndpointBenchmarks,
  generateBenchmarkReport,
  clearBenchmarkResults,
} from '../performance/benchmarks';
import {
  getMetrics,
  getMetricsSummary,
  getAverageEventLoopLag,
} from '../performance/metrics';
import { getEnhancedCache } from '../config/cache';
import { checkDatabaseHealth, getDatabaseMetrics } from '../config/database';

const router = express.Router();

// File path for storing baseline data
const BASELINE_FILE_PATH = process.env.PERFORMANCE_BASELINE_PATH || './performance-baseline.json';

/**
 * @swagger
 * /api/metrics/performance:
 *   get:
 *     summary: Get current performance metrics
 *     tags: [Metrics, Performance]
 *     responses:
 *       200:
 *         description: Current performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     system:
 *                       type: object
 *                     database:
 *                       type: object
 *                     cache:
 *                       type: object
 *                     http:
 *                       type: object
 */
router.get('/performance', asyncHandler(async (_req: Request, res: Response) => {
  const [dbHealth, dbMetrics] = await Promise.all([
    checkDatabaseHealth(),
    getDatabaseMetrics(),
  ]);

  const cache = getEnhancedCache();
  const cacheStats = cache.getStats();
  const cacheMetrics = cache.getMetrics();

  const metricsSnapshot = getMetricsSnapshot();
  const performanceMetrics = getMetricsSummary();

  res.json(formatResponse(true, {
    timestamp: new Date().toISOString(),
    system: {
      memory: performanceMetrics.memory,
      eventLoopLag: performanceMetrics.eventLoopLag,
      connections: performanceMetrics.connections,
    },
    database: {
      health: dbHealth,
      metrics: dbMetrics,
    },
    cache: {
      statistics: cacheStats,
      metrics: cacheMetrics,
    },
    http: metricsSnapshot,
  }));
}));

/**
 * @swagger
 * /api/metrics/prometheus:
 *   get:
 *     summary: Get metrics in Prometheus format
 *     tags: [Metrics, Monitoring]
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Prometheus-formatted metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/prometheus', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(generateMetrics());
});

/**
 * @swagger
 * /api/metrics/detailed:
 *   get:
 *     summary: Get detailed performance metrics
 *     tags: [Metrics, Performance]
 *     responses:
 *       200:
 *         description: Detailed metrics including histograms and custom metrics
 */
router.get('/detailed', asyncHandler(async (_req: Request, res: Response) => {
  const allMetrics = getMetrics();
  const summary = getMetricsSummary();

  res.json(formatResponse(true, {
    timestamp: new Date().toISOString(),
    summary,
    metrics: allMetrics,
    benchmarkResults: Array.from(getBenchmarkResults().entries()).map(([name, result]) => ({
      name,
      ...result,
    })),
  }));
}));

/**
 * @swagger
 * /api/metrics/baseline:
 *   get:
 *     summary: Get current performance baseline
 *     tags: [Metrics, Baseline]
 *     responses:
 *       200:
 *         description: Current baseline data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Baseline not found
 */
router.get('/baseline', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises');
    const baselineData = await fs.readFile(BASELINE_FILE_PATH, 'utf-8');
    const baseline = JSON.parse(baselineData);
    
    res.json(formatResponse(true, {
      exists: true,
      createdAt: baseline.timestamp,
      data: baseline,
    }));
  } catch (e) {
    res.status(404).json(formatResponse(false, undefined, {
      code: 'BASELINE_NOT_FOUND',
      message: 'No performance baseline has been set. Use POST /api/metrics/baseline to create one.',
    }));
  }
}));

/**
 * @swagger
 * /api/metrics/baseline:
 *   post:
 *     summary: Create or update performance baseline
 *     tags: [Metrics, Baseline]
 *     responses:
 *       201:
 *         description: Baseline created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                     metrics:
 *                       type: object
 */
router.post('/baseline', asyncHandler(async (_req: Request, res: Response) => {
  const fs = await import('fs/promises');
  
  // Run benchmarks to get current baseline
  const benchmarkResults = await runCriticalEndpointBenchmarks();
  const [dbHealth, dbMetrics] = await Promise.all([
    checkDatabaseHealth(),
    getDatabaseMetrics(),
  ]);
  
  const cache = getEnhancedCache();
  const cacheStats = cache.getStats();
  
  const baseline = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    metrics: {
      benchmarks: benchmarkResults,
      database: {
        health: dbHealth,
        metrics: dbMetrics,
      },
      cache: {
        statistics: cacheStats,
      },
    },
  };
  
  // Save baseline to file
  await fs.writeFile(BASELINE_FILE_PATH, JSON.stringify(baseline, null, 2));
  
  logger.info('Performance baseline created', {
    timestamp: baseline.timestamp,
    benchmarkCount: benchmarkResults.length,
  });
  
  res.status(201).json(formatResponse(true, {
    message: 'Performance baseline created successfully',
    baseline,
  }));
}));

/**
 * @swagger
 * /api/metrics/baseline/compare:
 *   get:
 *     summary: Compare current performance with baseline
 *     tags: [Metrics, Baseline]
 *     responses:
 *       200:
 *         description: Comparison results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparison:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *       404:
 *         description: Baseline not found
 */
router.get('/baseline/compare', asyncHandler(async (_req: Request, res: Response) => {
  const fs = await import('fs/promises');
  
  // Load baseline
  let baseline: any;
  try {
    const baselineData = await fs.readFile(BASELINE_FILE_PATH, 'utf-8');
    baseline = JSON.parse(baselineData);
  } catch (e) {
    return res.status(404).json(formatResponse(false, undefined, {
      code: 'BASELINE_NOT_FOUND',
      message: 'No performance baseline has been set.',
    }));
  }
  
  // Run current benchmarks
  const currentBenchmarks = await runCriticalEndpointBenchmarks();
  
  // Compare results
  const comparisons: any[] = [];
  const baselineBenchmarks = new Map(baseline.metrics.benchmarks.map((b: any) => [b.name, b]));
  
  for (const current of currentBenchmarks) {
    const baselineResult = baselineBenchmarks.get(current.name);
    
    if (baselineResult) {
      const avgChange = ((current.avgDuration - baselineResult.avgDuration) / baselineResult.avgDuration) * 100;
      const p95Change = ((current.p95 - baselineResult.p95) / baselineResult.p95) * 100;
      
      comparisons.push({
        name: current.name,
        endpoint: current.endpoint,
        baseline: {
          avg: baselineResult.avgDuration,
          p95: baselineResult.p95,
        },
        current: {
          avg: current.avgDuration,
          p95: current.p95,
        },
        change: {
          avg: avgChange.toFixed(2) + '%',
          p95: p95Change.toFixed(2) + '%',
        },
        status: avgChange > 10 ? 'degraded' : avgChange < -10 ? 'improved' : 'stable',
      });
    } else {
      comparisons.push({
        name: current.name,
        endpoint: current.endpoint,
        current: {
          avg: current.avgDuration,
          p95: current.p95,
        },
        status: 'new',
      });
    }
  }
  
  const degraded = comparisons.filter(c => c.status === 'degraded').length;
  const improved = comparisons.filter(c => c.status === 'improved').length;
  const stable = comparisons.filter(c => c.status === 'stable').length;
  
  res.json(formatResponse(true, {
    baselineTimestamp: baseline.timestamp,
    currentTimestamp: new Date().toISOString(),
    comparisons,
    summary: {
      total: comparisons.length,
      degraded,
      improved,
      stable,
      new: comparisons.filter(c => c.status === 'new').length,
    },
  }));
}));

/**
 * @swagger
 * /api/metrics/benchmarks:
 *   get:
 *     summary: Get all benchmark results
 *     tags: [Metrics, Benchmarks]
 *     responses:
 *       200:
 *         description: List of benchmark results
 */
router.get('/benchmarks', asyncHandler(async (_req: Request, res: Response) => {
  const results = getBenchmarkResults();
  const report = generateBenchmarkReport();
  
  res.json(formatResponse(true, {
    benchmarks: Array.from(results.entries()).map(([name, result]) => ({
      name,
      ...result,
    })),
    report,
  }));
}));

/**
 * @swagger
 * /api/metrics/benchmarks:
 *   post:
 *     summary: Run performance benchmarks
 *     tags: [Metrics, Benchmarks]
 *     responses:
 *       200:
 *         description: Benchmark results
 *       202:
 *         description: Benchmarks started asynchronously
 */
router.post('/benchmarks', asyncHandler(async (req: Request, res: Response) => {
  const { async = false } = req.body || {};
  
  if (async) {
    // Start benchmarks asynchronously
    runCriticalEndpointBenchmarks().then(results => {
      logger.info('Async benchmarks completed', { count: results.length });
    }).catch(err => {
      logger.error('Async benchmarks failed', err);
    });
    
    res.status(202).json(formatResponse(true, {
      message: 'Benchmarks started asynchronously',
    }));
  } else {
    // Run synchronously
    const results = await runCriticalEndpointBenchmarks();
    res.json(formatResponse(true, {
      count: results.length,
      results,
    }));
  }
}));

/**
 * @swagger
 * /api/metrics/benchmarks:
 *   delete:
 *     summary: Clear all benchmark results
 *     tags: [Metrics, Benchmarks]
 *     responses:
 *       200:
 *         description: Benchmarks cleared
 */
router.delete('/benchmarks', asyncHandler(async (_req: Request, res: Response) => {
  clearBenchmarkResults();
  logger.info('Benchmark results cleared');
  res.json(formatResponse(true, { message: 'Benchmark results cleared' }));
}));

/**
 * @swagger
 * /api/metrics/health:
 *   get:
 *     summary: Get metrics system health
 *     tags: [Metrics, Health]
 *     responses:
 *       200:
 *         description: Metrics system health status
 */
router.get('/health', asyncHandler(async (_req: Request, res: Response) => {
  const eventLoopLag = getAverageEventLoopLag();
  const memoryUsage = process.memoryUsage();
  
  const healthy = eventLoopLag < 100 && memoryUsage.heapUsed < 500 * 1024 * 1024;
  
  res.status(healthy ? 200 : 503).json(formatResponse(healthy, {
    status: healthy ? 'healthy' : 'degraded',
    eventLoopLag: eventLoopLag.toFixed(2) + 'ms',
    memory: {
      heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
      heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + 'MB',
    },
    uptime: process.uptime(),
  }));
}));

/**
 * @swagger
 * /api/metrics/cache:
 *   get:
 *     summary: Get cache metrics
 *     tags: [Metrics, Cache]
 *     responses:
 *       200:
 *         description: Cache metrics and statistics
 */
router.get('/cache', asyncHandler(async (_req: Request, res: Response) => {
  const cache = getEnhancedCache();
  const stats = cache.getStats();
  const metrics = cache.getMetrics();
  
  res.json(formatResponse(true, {
    enabled: cache.isEnabled(),
    statistics: stats,
    metrics,
    hitRate: (stats.hitRate * 100).toFixed(2) + '%',
  }));
}));

/**
 * @swagger
 * /api/metrics/database:
 *   get:
 *     summary: Get database metrics
 *     tags: [Metrics, Database]
 *     responses:
 *       200:
 *         description: Database metrics
 */
router.get('/database', asyncHandler(async (_req: Request, res: Response) => {
  const [health, metrics] = await Promise.all([
    checkDatabaseHealth(),
    getDatabaseMetrics(),
  ]);
  
  res.json(formatResponse(true, {
    health,
    metrics,
  }));
}));

export default router;
