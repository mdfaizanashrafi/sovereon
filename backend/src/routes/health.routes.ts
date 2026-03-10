/**
 * ============================================================================
 * HEALTH CHECK ROUTES
 * ============================================================================
 * Comprehensive health monitoring endpoints
 */

import express, { Request, Response } from 'express';
import {
  healthEndpoint,
  livenessEndpoint,
  readinessEndpoint,
  getHealthCheck,
  getRegisteredHealthChecks,
  runHealthChecks,
} from '../utils/health-check';
import { metricsEndpoint } from '../middleware/metrics.middleware';
import { tracesEndpoint, traceDetailsEndpoint } from '../utils/tracing';
import { observabilityConfig } from '../config/observability';
import { getEmailHealth, validateEmailConfig, verifyEmailService } from '../services/email.service';
import { checkRedisHealth } from '../infrastructure/cache/redis';
import { checkDatabaseHealth, getDatabaseMetrics } from '../config/database';
import { getEnhancedCache } from '../config/cache';
import { getCacheWarmer } from '../utils/cache-warmer';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 */
router.get('/health', livenessEndpoint);

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe - basic availability
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/health/live', livenessEndpoint);

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe - checks critical services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/health/ready', readinessEndpoint);

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check with all components
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health status
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health/detailed', healthEndpoint);

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     tags: [Monitoring]
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Prometheus metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/metrics', metricsEndpoint);

/**
 * @swagger
 * /api/traces:
 *   get:
 *     summary: Recent request traces (development only)
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: List of recent traces
 */
router.get('/traces', (req: Request, res: Response) => {
  if (observabilityConfig.environment === 'production') {
    return res.status(403).json({ error: 'Traces endpoint not available in production' });
  }
  tracesEndpoint(req, res);
});

/**
 * @swagger
 * /api/traces/{traceId}:
 *   get:
 *     summary: Get trace details by ID (development only)
 *     tags: [Monitoring]
 *     parameters:
 *       - name: traceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trace details
 *       404:
 *         description: Trace not found
 */
router.get('/traces/:traceId', (req: Request, res: Response) => {
  if (observabilityConfig.environment === 'production') {
    return res.status(403).json({ error: 'Traces endpoint not available in production' });
  }
  traceDetailsEndpoint(req, res);
});

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     summary: Database health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *       503:
 *         description: Database is unhealthy
 */
router.get('/health/db', asyncHandler(async (req: Request, res: Response) => {
  const result = await getHealthCheck('database');
  const migrations = await getHealthCheck('migrations');
  
  const checks = {
    database: result,
    migrations,
  };
  
  const allOk = Object.values(checks).every(c => c?.status === 'healthy');
  
  res.status(allOk ? 200 : 503).json({
    success: allOk,
    timestamp: new Date().toISOString(),
    environment: observabilityConfig.environment,
    checks,
  });
}));

/**
 * @swagger
 * /api/health/cache:
 *   get:
 *     summary: Cache (Redis) health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Cache is healthy
 *       503:
 *         description: Cache is unhealthy
 */
router.get('/health/cache', asyncHandler(async (req: Request, res: Response) => {
  const result = await getHealthCheck('redis');
  const isHealthy = result?.status === 'healthy';
  
  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    timestamp: new Date().toISOString(),
    check: result,
  });
}));

/**
 * @swagger
 * /api/health/email:
 *   get:
 *     summary: Email service health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Email service is healthy
 *       503:
 *         description: Email service is unhealthy
 */
router.get('/health/email', asyncHandler(async (req: Request, res: Response) => {
  const result = await getHealthCheck('email');
  
  res.status(result?.status === 'unhealthy' ? 503 : 200).json({
    success: result?.status !== 'unhealthy',
    timestamp: new Date().toISOString(),
    check: result,
  });
}));

/**
 * @swagger
 * /api/health/memory:
 *   get:
 *     summary: Memory usage health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Memory usage is healthy
 *       503:
 *         description: Memory usage is critical
 */
router.get('/health/memory', asyncHandler(async (req: Request, res: Response) => {
  const result = await getHealthCheck('memory');
  
  res.status(result?.status === 'unhealthy' ? 503 : 200).json({
    success: result?.status !== 'unhealthy',
    timestamp: new Date().toISOString(),
    check: result,
  });
}));

/**
 * @swagger
 * /api/health/system:
 *   get:
 *     summary: System health check (memory, disk, event loop)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *       503:
 *         description: System has issues
 */
router.get('/health/system', asyncHandler(async (req: Request, res: Response) => {
  const report = await runHealthChecks(['memory', 'disk', 'eventLoop']);
  
  res.status(report.status === 'unhealthy' ? 503 : 200).json({
    success: report.status !== 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: report.checks,
    summary: report.summary,
  });
}));

/**
 * @swagger
 * /api/health/components:
 *   get:
 *     summary: List all available health check components
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: List of components
 */
router.get('/health/components', (_req: Request, res: Response) => {
  res.json({
    components: getRegisteredHealthChecks(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/health/cache/metrics:
 *   get:
 *     summary: Cache metrics and statistics
 *     tags: [Health, Monitoring]
 *     responses:
 *       200:
 *         description: Cache metrics
 */
router.get('/health/cache/metrics', asyncHandler(async (req: Request, res: Response) => {
  const cache = getEnhancedCache();
  const metrics = cache.getMetrics();
  const stats = cache.getStats();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics,
    statistics: stats,
    enabled: cache.isEnabled(),
  });
}));

/**
 * @swagger
 * /api/health/db/metrics:
 *   get:
 *     summary: Database connection pool metrics
 *     tags: [Health, Monitoring]
 *     responses:
 *       200:
 *         description: Database metrics
 */
router.get('/health/db/metrics', asyncHandler(async (req: Request, res: Response) => {
  const health = await checkDatabaseHealth();
  const metrics = getDatabaseMetrics();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    health,
    metrics,
  });
}));

/**
 * @swagger
 * /api/health/warmer:
 *   get:
 *     summary: Cache warmer status
 *     tags: [Health, Monitoring]
 *     responses:
 *       200:
 *         description: Cache warmer status
 */
router.get('/health/warmer', asyncHandler(async (req: Request, res: Response) => {
  const warmer = getCacheWarmer();
  const status = warmer.getStatus();
  const results = warmer.getResults();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    status,
    recentResults: results.slice(-10), // Last 10 results
  });
}));

/**
 * @swagger
 * /api/health/performance:
 *   get:
 *     summary: Combined performance metrics (cache + database)
 *     tags: [Health, Monitoring]
 *     responses:
 *       200:
 *         description: Performance metrics
 */
router.get('/health/performance', asyncHandler(async (req: Request, res: Response) => {
  const [dbHealth, cacheStats] = await Promise.all([
    checkDatabaseHealth(),
    Promise.resolve(getEnhancedCache().getStats()),
  ]);
  
  const dbMetrics = getDatabaseMetrics();
  const cacheMetrics = getEnhancedCache().getMetrics();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    database: {
      health: dbHealth,
      metrics: dbMetrics,
    },
    cache: {
      statistics: cacheStats,
      metrics: cacheMetrics,
    },
    summary: {
      cacheHitRate: `${(cacheStats.hitRate * 100).toFixed(2)}%`,
      databaseHealthy: dbHealth.healthy,
      totalCacheRequests: cacheStats.totalRequests,
    },
  });
}));

/**
 * Legacy health check endpoint (backward compatibility)
 * @deprecated Use /api/health instead
 */
router.get('/healthz', (_req: Request, res: Response) => livenessEndpoint(_req, res));

export default router;
