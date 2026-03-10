/**
 * ============================================================================
 * CHAOS ENGINEERING FRAMEWORK - System Health Probes
 * ============================================================================
 * Continuous health monitoring probes that detect system state during
 * chaos experiments. Provides real-time feedback for abort conditions.
 */

import { PrismaClient } from '@prisma/client';
import { getRedisClient, checkRedisHealth } from '../infrastructure/cache/redis';
import { checkDatabaseHealth } from '../config/database';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ProbeStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface ProbeResult {
  status: ProbeStatus;
  latency: number;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Probe {
  name: string;
  description: string;
  check(): Promise<ProbeResult>;
}

export interface ProbeRegistry {
  [key: string]: Probe;
}

// ============================================================================
// DATABASE PROBE
// ============================================================================

export const databaseProbe: Probe = {
  name: 'database',
  description: 'Monitors database connectivity, query performance, and connection pool health',
  
  async check(): Promise<ProbeResult> {
    const start = Date.now();
    const prisma = new PrismaClient();
    
    try {
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1 as health_check`;
      
      // Test transaction capability
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1`;
      });
      
      const latency = Date.now() - start;
      
      return {
        status: latency > 1000 ? 'degraded' : 'healthy',
        latency,
        message: `Database connection healthy (${latency}ms)`,
        metadata: {
          connectionPool: process.env.DATABASE_URL ? 'configured' : 'unknown',
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        message: `Database connection failed: ${(error as Error).message}`,
        timestamp: new Date(),
      };
    } finally {
      await prisma.$disconnect();
    }
  },
};

// ============================================================================
// CACHE PROBE
// ============================================================================

export const cacheProbe: Probe = {
  name: 'cache',
  description: 'Monitors Redis connectivity, read/write latency, and memory usage',
  
  async check(): Promise<ProbeResult> {
    const start = Date.now();
    
    try {
      const isHealthy = await checkRedisHealth();
      
      if (!isHealthy) {
        return {
          status: 'unhealthy',
          latency: Date.now() - start,
          message: 'Redis connection failed',
          timestamp: new Date(),
        };
      }
      
      const redis = getRedisClient();
      
      // Test write operation
      const testKey = `health_probe:${Date.now()}`;
      await redis.setex(testKey, 10, 'probe_value');
      
      // Test read operation
      const value = await redis.get(testKey);
      
      // Get Redis info
      const info = await redis.info('memory');
      const usedMemory = info.match(/used_memory:(\d+)/)?.[1];
      
      const latency = Date.now() - start;
      
      return {
        status: latency > 100 ? 'degraded' : 'healthy',
        latency,
        message: `Cache read/write successful (${latency}ms)`,
        metadata: {
          usedMemory: usedMemory ? parseInt(usedMemory, 10) : undefined,
          testValue: value === 'probe_value',
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        message: `Cache probe failed: ${(error as Error).message}`,
        timestamp: new Date(),
      };
    }
  },
};

// ============================================================================
// EXTERNAL SERVICE PROBE
// ============================================================================

export const externalServiceProbe: Probe = {
  name: 'external_service',
  description: 'Monitors connectivity to external services like payment providers',
  
  async check(): Promise<ProbeResult> {
    const start = Date.now();
    const results: Record<string, ProbeStatus> = {};
    
    // Check Stripe (if configured)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const response = await fetch('https://api.stripe.com/v1/charges?limit=1', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          },
        });
        results.stripe = response.ok ? 'healthy' : 'degraded';
      } catch {
        results.stripe = 'unhealthy';
      }
    }
    
    // Check Razorpay (if configured)
    if (process.env.RAZORPAY_KEY_ID) {
      try {
        const response = await fetch('https://api.razorpay.com/v1/orders?count=1', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:`).toString('base64')}`,
          },
        });
        results.razorpay = response.ok ? 'healthy' : 'degraded';
      } catch {
        results.razorpay = 'unhealthy';
      }
    }
    
    // Check email service (Resend)
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/api-keys', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
        });
        results.email = response.ok ? 'healthy' : 'degraded';
      } catch {
        results.email = 'unhealthy';
      }
    }
    
    const latency = Date.now() - start;
    const statuses = Object.values(results);
    
    let overallStatus: ProbeStatus = 'healthy';
    if (statuses.some(s => s === 'unhealthy')) overallStatus = 'unhealthy';
    else if (statuses.some(s => s === 'degraded')) overallStatus = 'degraded';
    
    return {
      status: overallStatus,
      latency,
      message: `External services: ${Object.entries(results).map(([k, v]) => `${k}=${v}`).join(', ')}`,
      metadata: results,
      timestamp: new Date(),
    };
  },
};

// ============================================================================
// DISK SPACE PROBE
// ============================================================================

export const diskSpaceProbe: Probe = {
  name: 'disk',
  description: 'Monitors available disk space and temp directory writability',
  
  async check(): Promise<ProbeResult> {
    const start = Date.now();
    
    try {
      const os = await import('os');
      const fs = await import('fs');
      const path = await import('path');
      
      // Get disk space info (platform specific)
      let freeSpace = 0;
      let totalSpace = 0;
      
      if (process.platform === 'win32') {
        // Windows - simplified check
        const tmpDir = os.tmpdir();
        const stats = await fs.promises.stat(tmpDir);
        freeSpace = 1024 * 1024 * 1024; // Placeholder: 1GB
        totalSpace = 1024 * 1024 * 1024 * 10; // Placeholder: 10GB
      } else {
        // Unix-like systems
        const { execSync } = await import('child_process');
        try {
          const output = execSync('df -P . | tail -1').toString();
          const parts = output.trim().split(/\s+/);
          totalSpace = parseInt(parts[1], 10) * 1024;
          freeSpace = parseInt(parts[3], 10) * 1024;
        } catch {
          // Fallback
          freeSpace = 1024 * 1024 * 1024;
          totalSpace = 1024 * 1024 * 1024 * 10;
        }
      }
      
      // Test temp directory writability
      const testFile = path.join(os.tmpdir(), `chaos_probe_${Date.now()}.tmp`);
      try {
        await fs.promises.writeFile(testFile, 'test');
        await fs.promises.unlink(testFile);
      } catch (error) {
        return {
          status: 'unhealthy',
          latency: Date.now() - start,
          message: `Disk write test failed: ${(error as Error).message}`,
          timestamp: new Date(),
        };
      }
      
      const freePercent = (freeSpace / totalSpace) * 100;
      const latency = Date.now() - start;
      
      let status: ProbeStatus = 'healthy';
      if (freePercent < 5) status = 'unhealthy';
      else if (freePercent < 15) status = 'degraded';
      
      return {
        status,
        latency,
        message: `Disk space: ${(freeSpace / 1024 / 1024 / 1024).toFixed(2)}GB free (${freePercent.toFixed(1)}%)`,
        metadata: {
          freeSpace,
          totalSpace,
          freePercent,
          writable: true,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unknown',
        latency: Date.now() - start,
        message: `Disk check failed: ${(error as Error).message}`,
        timestamp: new Date(),
      };
    }
  },
};

// ============================================================================
// MEMORY USAGE PROBE
// ============================================================================

export const memoryProbe: Probe = {
  name: 'memory',
  description: 'Monitors heap usage, RSS, and garbage collection pressure',
  
  async check(): Promise<ProbeResult> {
    const start = Date.now();
    
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const rssMB = memUsage.rss / 1024 / 1024;
    const externalMB = memUsage.external / 1024 / 1024;
    
    // Calculate heap usage percentage
    const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    // Determine status
    let status: ProbeStatus = 'healthy';
    if (heapPercent > 90 || heapUsedMB > 1500) {
      status = 'unhealthy';
    } else if (heapPercent > 75 || heapUsedMB > 1000) {
      status = 'degraded';
    }
    
    const latency = Date.now() - start;
    
    return {
      status,
      latency,
      message: `Heap: ${heapUsedMB.toFixed(2)}MB / ${heapTotalMB.toFixed(2)}MB (${heapPercent.toFixed(1)}%)`,
      metadata: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        heapPercent,
        rss: memUsage.rss,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      timestamp: new Date(),
    };
  },
};

// ============================================================================
// EVENT LOOP PROBE
// ============================================================================

export const eventLoopProbe: Probe = {
  name: 'event_loop',
  description: 'Monitors event loop lag and tick frequency',
  
  async check(): Promise<ProbeResult> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
        
        let status: ProbeStatus = 'healthy';
        if (lag > 100) status = 'unhealthy';
        else if (lag > 50) status = 'degraded';
        
        resolve({
          status,
          latency: lag,
          message: `Event loop lag: ${lag.toFixed(2)}ms`,
          metadata: {
            lag,
            threshold: {
              healthy: 10,
              degraded: 50,
              unhealthy: 100,
            },
          },
          timestamp: new Date(),
        });
      });
    });
  },
};

// ============================================================================
// DNS RESOLUTION PROBE
// ============================================================================

export const dnsProbe: Probe = {
  name: 'dns',
  description: 'Monitors DNS resolution latency and success rate',
  
  async check(): Promise<ProbeResult> {
    const start = Date.now();
    const dns = await import('dns');
    const { promisify } = await import('util');
    const lookup = promisify(dns.lookup);
    
    const testHosts = [
      'google.com',
      'cloudflare.com',
      'localhost',
    ];
    
    const results: Record<string, { success: boolean; latency: number }> = {};
    
    for (const host of testHosts) {
      const hostStart = Date.now();
      try {
        await lookup(host);
        results[host] = { success: true, latency: Date.now() - hostStart };
      } catch {
        results[host] = { success: false, latency: Date.now() - hostStart };
      }
    }
    
    const successful = Object.values(results).filter(r => r.success).length;
    const total = testHosts.length;
    const successRate = (successful / total) * 100;
    const avgLatency = Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.latency, 0) / (successful || 1);
    
    let status: ProbeStatus = 'healthy';
    if (successRate < 50) status = 'unhealthy';
    else if (successRate < 100 || avgLatency > 500) status = 'degraded';
    
    const latency = Date.now() - start;
    
    return {
      status,
      latency,
      message: `DNS resolution: ${successful}/${total} successful, avg ${avgLatency.toFixed(0)}ms`,
      metadata: { results, successRate, avgLatency },
      timestamp: new Date(),
    };
  },
};

// ============================================================================
// HTTP ENDPOINT PROBE
// ============================================================================

export interface HttpEndpointProbeOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  expectedStatus?: number;
}

export function createHttpEndpointProbe(options: HttpEndpointProbeOptions): Probe {
  return {
    name: `http_${options.url.replace(/[^a-zA-Z0-9]/g, '_')}`,
    description: `Monitors HTTP endpoint: ${options.url}`,
    
    async check(): Promise<ProbeResult> {
      const start = Date.now();
      const timeout = options.timeout || 5000;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(options.url, {
          method: options.method || 'GET',
          headers: options.headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const latency = Date.now() - start;
        const expectedStatus = options.expectedStatus || 200;
        
        let status: ProbeStatus = 'healthy';
        if (response.status !== expectedStatus) {
          status = 'unhealthy';
        } else if (latency > 1000) {
          status = 'degraded';
        }
        
        return {
          status,
          latency,
          message: `HTTP ${response.status} in ${latency}ms`,
          metadata: {
            statusCode: response.status,
            expectedStatus,
          },
          timestamp: new Date(),
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          latency: Date.now() - start,
          message: `HTTP request failed: ${(error as Error).message}`,
          timestamp: new Date(),
        };
      }
    },
  };
}

// ============================================================================
// PROBE REGISTRY & RUNNER
// ============================================================================

const probeRegistry: ProbeRegistry = {
  database: databaseProbe,
  cache: cacheProbe,
  externalService: externalServiceProbe,
  disk: diskSpaceProbe,
  memory: memoryProbe,
  eventLoop: eventLoopProbe,
  dns: dnsProbe,
};

export function registerProbe(probe: Probe): void {
  probeRegistry[probe.name] = probe;
  logger.debug(`[ChaosProbe] Registered probe: ${probe.name}`);
}

export function getProbe(name: string): Probe | undefined {
  return probeRegistry[name];
}

export function getAllProbes(): Probe[] {
  return Object.values(probeRegistry);
}

export function getProbeNames(): string[] {
  return Object.keys(probeRegistry);
}

export async function runProbe(name: string): Promise<ProbeResult | null> {
  const probe = probeRegistry[name];
  if (!probe) return null;
  
  try {
    return await probe.check();
  } catch (error) {
    logger.error(`[ChaosProbe] Probe ${name} failed`, error);
    return {
      status: 'unhealthy',
      latency: 0,
      message: `Probe execution failed: ${(error as Error).message}`,
      timestamp: new Date(),
    };
  }
}

export async function runAllProbes(): Promise<Record<string, ProbeResult>> {
  const results: Record<string, ProbeResult> = {};
  
  await Promise.all(
    Object.entries(probeRegistry).map(async ([name, probe]) => {
      try {
        results[name] = await probe.check();
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          latency: 0,
          message: `Probe execution failed: ${(error as Error).message}`,
          timestamp: new Date(),
        };
      }
    })
  );
  
  return results;
}

export function clearProbes(): void {
  Object.keys(probeRegistry).forEach(key => {
    delete probeRegistry[key];
  });
}

// ============================================================================
// PROBE-BASED ABORT CONDITIONS
// ============================================================================

export interface ProbeAbortCondition {
  probe: string;
  metric: 'status' | 'latency';
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number;
}

export function checkProbeAbortCondition(
  result: ProbeResult & { probe?: string },
  condition: ProbeAbortCondition
): boolean {
  if (result.probe !== condition.probe) return false;
  
  let actualValue: string | number;
  
  if (condition.metric === 'status') {
    actualValue = result.status;
  } else {
    actualValue = result.latency;
  }
  
  switch (condition.operator) {
    case 'eq': return actualValue === condition.value;
    case 'ne': return actualValue !== condition.value;
    case 'gt': return actualValue > condition.value;
    case 'lt': return actualValue < condition.value;
    case 'gte': return actualValue >= condition.value;
    case 'lte': return actualValue <= condition.value;
    default: return false;
  }
}

// ============================================================================
// CONTINUOUS MONITORING
// ============================================================================

export class ProbeMonitor {
  private interval?: NodeJS.Timeout;
  private results: Map<string, ProbeResult> = new Map();
  private listeners: ((name: string, result: ProbeResult) => void)[] = [];
  
  start(intervalMs: number = 5000): void {
    this.interval = setInterval(async () => {
      const results = await runAllProbes();
      
      Object.entries(results).forEach(([name, result]) => {
        this.results.set(name, result);
        this.listeners.forEach(listener => listener(name, result));
      });
    }, intervalMs);
  }
  
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
  
  onUpdate(callback: (name: string, result: ProbeResult) => void): void {
    this.listeners.push(callback);
  }
  
  getResult(name: string): ProbeResult | undefined {
    return this.results.get(name);
  }
  
  getAllResults(): Record<string, ProbeResult> {
    return Object.fromEntries(this.results);
  }
  
  isRunning(): boolean {
    return !!this.interval;
  }
}

export default {
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
};
