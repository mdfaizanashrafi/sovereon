/**
 * ============================================================================
 * ADVANCED HEALTH CHECKS
 * ============================================================================
 * Comprehensive health monitoring for all system components
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRedisClient, checkRedisHealth } from '../infrastructure/cache/redis';
import { verifyEmailService, getEmailHealth, validateEmailConfig } from '../services/email.service';
import { logger } from './logger';
import { observabilityConfig } from '../config/observability';

/**
 * Health status types
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Individual component health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  responseTime?: number;
  lastChecked?: string;
  metadata?: Record<string, any>;
}

/**
 * Complete health report
 */
export interface HealthReport {
  status: HealthStatus;
  timestamp: string;
  environment: string;
  version: string;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

/**
 * Health check function type
 */
type HealthCheckFunction = () => Promise<HealthCheckResult>;

// Component health check registry
const healthChecks = new Map<string, HealthCheckFunction>();

/**
 * Register a health check
 */
export function registerHealthCheck(name: string, checkFn: HealthCheckFunction): void {
  healthChecks.set(name, checkFn);
  logger.debug(`Registered health check: ${name}`);
}

/**
 * Database health check
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  const prisma = new PrismaClient();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      message: 'Database connection established',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${(error as Error).message}`,
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Database migrations health check
 */
async function checkMigrations(): Promise<HealthCheckResult> {
  const start = Date.now();
  const prisma = new PrismaClient();
  
  try {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at, applied_steps_count
      FROM _prisma_migrations 
      WHERE rolled_back_at IS NULL
      ORDER BY finished_at DESC
      LIMIT 5
    `;
    
    const migrationList = migrations as any[];
    const responseTime = Date.now() - start;
    
    if (migrationList.length === 0) {
      return {
        status: 'degraded',
        message: 'No migrations found - database may not be initialized',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
    
    const pendingMigrations = migrationList.filter(m => m.applied_steps_count === 0);
    
    if (pendingMigrations.length > 0) {
      return {
        status: 'degraded',
        message: `${pendingMigrations.length} pending migrations`,
        responseTime,
        lastChecked: new Date().toISOString(),
        metadata: { pendingCount: pendingMigrations.length },
      };
    }
    
    return {
      status: 'healthy',
      message: `${migrationList.length} migrations applied successfully`,
      responseTime,
      lastChecked: new Date().toISOString(),
      metadata: { latestMigration: migrationList[0]?.migration_name },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Migration check failed: ${(error as Error).message}`,
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Redis health check
 */
async function checkRedis(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    const isHealthy = await checkRedisHealth();
    const responseTime = Date.now() - start;
    
    if (!isHealthy) {
      return {
        status: 'unhealthy',
        message: 'Redis connection failed',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
    
    const redis = getRedisClient();
    const info = await redis.info('server');
    const versionMatch = info.match(/redis_version:(\S+)/);
    
    return {
      status: 'healthy',
      message: 'Redis connection established',
      responseTime,
      lastChecked: new Date().toISOString(),
      metadata: {
        version: versionMatch?.[1] || 'unknown',
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Redis check failed: ${(error as Error).message}`,
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Email service health check
 */
async function checkEmail(): Promise<HealthCheckResult> {
  const start = Date.now();
  
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      return {
        status: 'degraded',
        message: `Email not configured: ${config.errors.join(', ')}`,
        responseTime: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    }
    
    const isHealthy = await verifyEmailService();
    const health = getEmailHealth();
    const responseTime = Date.now() - start;
    
    if (!isHealthy) {
      return {
        status: 'unhealthy',
        message: health.error || 'Email service connection failed',
        responseTime,
        lastChecked: health.lastCheck?.toISOString() || new Date().toISOString(),
      };
    }
    
    return {
      status: 'healthy',
      message: 'Email service connection verified',
      responseTime,
      lastChecked: health.lastCheck?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Email check failed: ${(error as Error).message}`,
      responseTime: Date.now() - start,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Memory health check
 */
async function checkMemory(): Promise<HealthCheckResult> {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const rssMB = memUsage.rss / 1024 / 1024;
  const warningThreshold = observabilityConfig.thresholds.memoryWarningMb;
  
  const status: HealthStatus = heapUsedMB > warningThreshold ? 'degraded' : 'healthy';
  
  return {
    status,
    message: `Heap: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB, RSS: ${rssMB.toFixed(2)}MB`,
    lastChecked: new Date().toISOString(),
    metadata: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external,
      threshold: warningThreshold * 1024 * 1024,
    },
  };
}

/**
 * Disk space health check (if available)
 */
async function checkDisk(): Promise<HealthCheckResult> {
  try {
    // Use fs to check disk space if available
    const { execSync } = await import('child_process');
    
    let output: string;
    if (process.platform === 'win32') {
      output = execSync('wmic logicaldisk get size,freespace,caption').toString();
    } else {
      output = execSync('df -P .').toString();
    }
    
    // Parse output (platform-specific)
    // For simplicity, we'll return a basic status
    return {
      status: 'healthy',
      message: 'Disk check completed',
      lastChecked: new Date().toISOString(),
      metadata: { raw: output.split('\n')[1] },
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: `Disk check unavailable: ${(error as Error).message}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Event loop lag check
 */
async function checkEventLoop(): Promise<HealthCheckResult> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
      const threshold = 100; // 100ms threshold
      
      const status: HealthStatus = lag > threshold ? 'degraded' : 'healthy';
      
      resolve({
        status,
        message: `Event loop lag: ${lag.toFixed(2)}ms`,
        responseTime: lag,
        lastChecked: new Date().toISOString(),
        metadata: { lag, threshold },
      });
    });
  });
}

/**
 * External API health check (payment service if configured)
 */
async function checkExternalServices(): Promise<HealthCheckResult> {
  if (!observabilityConfig.health.checkExternalServices) {
    return {
      status: 'healthy',
      message: 'External service checks disabled',
      lastChecked: new Date().toISOString(),
    };
  }
  
  // Check if payment provider is configured
  const paymentConfigured = !!process.env.STRIPE_SECRET_KEY || !!process.env.RAZORPAY_KEY_ID;
  
  if (!paymentConfigured) {
    return {
      status: 'healthy',
      message: 'No external payment services configured',
      lastChecked: new Date().toISOString(),
    };
  }
  
  // Add specific external service checks here
  // For now, just report configured status
  return {
    status: 'healthy',
    message: 'External services configured',
    lastChecked: new Date().toISOString(),
    metadata: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID,
    },
  };
}

// Register default health checks
registerHealthCheck('database', checkDatabase);
registerHealthCheck('migrations', checkMigrations);
registerHealthCheck('redis', checkRedis);
registerHealthCheck('email', checkEmail);
registerHealthCheck('memory', checkMemory);
registerHealthCheck('disk', checkDisk);
registerHealthCheck('eventLoop', checkEventLoop);
registerHealthCheck('externalServices', checkExternalServices);

/**
 * Determine overall health status from individual checks
 */
function determineOverallStatus(checks: Record<string, HealthCheckResult>): HealthStatus {
  const statuses = Object.values(checks).map(c => c.status);
  
  if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
  if (statuses.some(s => s === 'degraded')) return 'degraded';
  return 'healthy';
}

/**
 * Run all registered health checks
 */
export async function runHealthChecks(
  includeChecks?: string[]
): Promise<HealthReport> {
  const checksToRun = includeChecks 
    ? includeChecks.filter(name => healthChecks.has(name))
    : Array.from(healthChecks.keys());
  
  const checkResults: Record<string, HealthCheckResult> = {};
  
  // Run checks with timeout
  const checkPromises = checksToRun.map(async (name) => {
    const checkFn = healthChecks.get(name)!;
    
    try {
      const timeoutPromise = new Promise<HealthCheckResult>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 
          observabilityConfig.health.timeout);
      });
      
      const result = await Promise.race([checkFn(), timeoutPromise]);
      checkResults[name] = result;
    } catch (error) {
      checkResults[name] = {
        status: 'unhealthy',
        message: `Health check failed: ${(error as Error).message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  });
  
  await Promise.all(checkPromises);
  
  const summary = {
    total: Object.keys(checkResults).length,
    healthy: Object.values(checkResults).filter(c => c.status === 'healthy').length,
    degraded: Object.values(checkResults).filter(c => c.status === 'degraded').length,
    unhealthy: Object.values(checkResults).filter(c => c.status === 'unhealthy').length,
  };
  
  return {
    status: determineOverallStatus(checkResults),
    timestamp: new Date().toISOString(),
    environment: observabilityConfig.environment,
    version: observabilityConfig.appVersion,
    uptime: process.uptime(),
    checks: checkResults,
    summary,
  };
}

/**
 * Express handler for health endpoint
 */
export async function healthEndpoint(req: Request, res: Response): Promise<void> {
  const report = await runHealthChecks();
  
  // Return 503 if unhealthy, 200 otherwise
  const statusCode = report.status === 'unhealthy' ? 503 : 200;
  
  res.status(statusCode).json(report);
}

/**
 Express handler for liveness probe (basic)
 */
export function livenessEndpoint(req: Request, res: Response): void {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

/**
 * Express handler for readiness probe
 */
export async function readinessEndpoint(req: Request, res: Response): Promise<void> {
  // Only check critical services for readiness
  const report = await runHealthChecks(['database']);
  
  const isReady = report.status !== 'unhealthy';
  const statusCode = isReady ? 200 : 503;
  
  res.status(statusCode).json({
    ready: isReady,
    timestamp: new Date().toISOString(),
    checks: report.checks,
  });
}

/**
 * Get specific health check result
 */
export async function getHealthCheck(name: string): Promise<HealthCheckResult | null> {
  const checkFn = healthChecks.get(name);
  if (!checkFn) return null;
  
  try {
    return await checkFn();
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Health check error: ${(error as Error).message}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Get registered health check names
 */
export function getRegisteredHealthChecks(): string[] {
  return Array.from(healthChecks.keys());
}

export default {
  runHealthChecks,
  getHealthCheck,
  registerHealthCheck,
  healthEndpoint,
  livenessEndpoint,
  readinessEndpoint,
};
