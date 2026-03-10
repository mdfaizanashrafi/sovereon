/**
 * ============================================================================
 * HEALTH ROUTES TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock dependencies
vi.mock('../../utils/health-check', () => ({
  healthEndpoint: vi.fn((req, res) => res.json({ status: 'healthy' })),
  livenessEndpoint: vi.fn((req, res) => res.json({ status: 'alive' })),
  readinessEndpoint: vi.fn((req, res) => res.json({ ready: true })),
  getHealthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
  runHealthChecks: vi.fn().mockResolvedValue({
    status: 'healthy',
    checks: { memory: { status: 'healthy' } },
    summary: { total: 1, healthy: 1, degraded: 0, unhealthy: 0 },
  }),
  getRegisteredHealthChecks: vi.fn().mockReturnValue(['database', 'redis', 'memory']),
}));

vi.mock('../../middleware/metrics.middleware', () => ({
  metricsEndpoint: vi.fn((req, res) => res.type('text').send('metrics_data')),
}));

vi.mock('../../utils/tracing', () => ({
  tracesEndpoint: vi.fn((req, res) => res.json([])),
  traceDetailsEndpoint: vi.fn((req, res) => res.json({})),
}));

vi.mock('../../config/observability', () => ({
  observabilityConfig: {
    environment: 'development',
    appVersion: '1.0.0',
  },
}));

vi.mock('../../services/email.service', () => ({
  getEmailHealth: vi.fn().mockReturnValue({ isHealthy: true, lastCheck: new Date() }),
  validateEmailConfig: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  verifyEmailService: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../infrastructure/cache/redis', () => ({
  checkRedisHealth: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../config/database', () => ({
  checkDatabaseHealth: vi.fn().mockResolvedValue({ healthy: true }),
  getDatabaseMetrics: vi.fn().mockReturnValue({ connections: 5 }),
}));

vi.mock('../../config/cache', () => ({
  getEnhancedCache: vi.fn().mockReturnValue({
    getMetrics: vi.fn().mockReturnValue({ hits: 100 }),
    getStats: vi.fn().mockReturnValue({ hitRate: 0.95 }),
    isEnabled: vi.fn().mockReturnValue(true),
  }),
}));

vi.mock('../../utils/cache-warmer', () => ({
  getCacheWarmer: vi.fn().mockReturnValue({
    getStatus: vi.fn().mockReturnValue({ isRunning: false, queryCount: 5 }),
    getResults: vi.fn().mockReturnValue([{ id: '1', success: true }]),
  }),
}));

describe('Health Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    
    // Import the router after mocks are set up
    const healthRouter = (await import('../health.routes')).default;
    app.use('/api', healthRouter);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app).get('/api/health/live');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/api/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.ready).toBe(true);
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health status', async () => {
      const response = await request(app).get('/api/health/detailed');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /api/metrics', () => {
    it('should return prometheus metrics', async () => {
      const response = await request(app).get('/api/metrics');

      expect(response.status).toBe(200);
      expect(response.text).toBe('metrics_data');
    });
  });

  describe('GET /api/traces', () => {
    it('should return traces in development', async () => {
      const response = await request(app).get('/api/traces');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/traces/:traceId', () => {
    it('should return trace details in development', async () => {
      const response = await request(app).get('/api/traces/trace-123');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/health/db', () => {
    it('should return database health', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'healthy' } as any);

      const response = await request(app).get('/api/health/db');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.checks).toHaveProperty('database');
    });

    it('should return 503 when database is unhealthy', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'unhealthy' } as any);

      const response = await request(app).get('/api/health/db');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health/cache', () => {
    it('should return cache health', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'healthy' } as any);

      const response = await request(app).get('/api/health/cache');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 503 when cache is unhealthy', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'unhealthy' } as any);

      const response = await request(app).get('/api/health/cache');

      expect(response.status).toBe(503);
    });
  });

  describe('GET /api/health/email', () => {
    it('should return email service health', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'healthy' } as any);

      const response = await request(app).get('/api/health/email');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 503 when email is unhealthy', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'unhealthy' } as any);

      const response = await request(app).get('/api/health/email');

      expect(response.status).toBe(503);
    });
  });

  describe('GET /api/health/memory', () => {
    it('should return memory health', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'healthy' } as any);

      const response = await request(app).get('/api/health/memory');

      expect(response.status).toBe(200);
    });

    it('should return 503 when memory is critical', async () => {
      const { getHealthCheck } = await import('../../utils/health-check');
      vi.mocked(getHealthCheck).mockResolvedValueOnce({ status: 'unhealthy' } as any);

      const response = await request(app).get('/api/health/memory');

      expect(response.status).toBe(503);
    });
  });

  describe('GET /api/health/system', () => {
    it('should return system health', async () => {
      const response = await request(app).get('/api/health/system');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('summary');
    });

    it('should return 503 when system is unhealthy', async () => {
      const { runHealthChecks } = await import('../../utils/health-check');
      vi.mocked(runHealthChecks).mockResolvedValueOnce({
        status: 'unhealthy',
        checks: {},
        summary: { total: 1, healthy: 0, degraded: 0, unhealthy: 1 },
      } as any);

      const response = await request(app).get('/api/health/system');

      expect(response.status).toBe(503);
    });
  });

  describe('GET /api/health/components', () => {
    it('should return list of health check components', async () => {
      const response = await request(app).get('/api/health/components');

      expect(response.status).toBe(200);
      expect(response.body.components).toContain('database');
      expect(response.body.components).toContain('redis');
      expect(response.body.components).toContain('memory');
    });
  });

  describe('GET /api/health/cache/metrics', () => {
    it('should return cache metrics', async () => {
      const response = await request(app).get('/api/health/cache/metrics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('statistics');
      expect(response.body.enabled).toBe(true);
    });
  });

  describe('GET /api/health/db/metrics', () => {
    it('should return database metrics', async () => {
      const response = await request(app).get('/api/health/db/metrics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('metrics');
    });
  });

  describe('GET /api/health/warmer', () => {
    it('should return cache warmer status', async () => {
      const response = await request(app).get('/api/health/warmer');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('recentResults');
    });
  });

  describe('GET /api/health/performance', () => {
    it('should return combined performance metrics', async () => {
      const response = await request(app).get('/api/health/performance');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('cacheHitRate');
      expect(response.body.summary).toHaveProperty('databaseHealthy');
    });
  });

  describe('GET /api/healthz', () => {
    it('should return health status (legacy endpoint)', async () => {
      const response = await request(app).get('/api/healthz');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });
  });
});
