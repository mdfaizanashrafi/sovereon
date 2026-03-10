/**
 * ============================================================================
 * OBSERVABILITY TESTS
 * ============================================================================
 * Tests for the observability stack
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getObservabilityConfig, 
  shouldLogLevel, 
  isMetricsEnabled, 
  isTracingEnabled,
  LOG_LEVEL_PRIORITY,
  PII_FIELDS 
} from '../../config/observability';
import { 
  redactPII, 
  createRequestLogger, 
  createModuleLogger,
  generateRequestId 
} from '../logger';
import {
  createCounter,
  createGauge,
  createHistogram,
  incrementCounter,
  setGauge,
  incrementGauge,
  observeHistogram,
  resetMetrics,
  generateMetrics,
} from '../../middleware/metrics.middleware';
import {
  getRegisteredHealthChecks,
  registerHealthCheck,
} from '../health-check';
import {
  extractTraceContext,
  buildTraceparent,
} from '../tracing';
import { Request } from 'express';

// ============================================================================
// CONFIGURATION TESTS
// ============================================================================

describe('Observability Configuration', () => {
  it('should load default configuration', () => {
    const config = getObservabilityConfig();
    
    expect(config).toBeDefined();
    expect(config.appName).toBe('sovereon-backend');
    expect(config.enabled).toBe(true);
    expect(config.metrics.enabled).toBe(true);
  });

  it('should check log level priority correctly', () => {
    expect(LOG_LEVEL_PRIORITY.debug).toBe(0);
    expect(LOG_LEVEL_PRIORITY.fatal).toBe(4);
  });

  it('should define PII fields', () => {
    expect(PII_FIELDS).toContain('password');
    expect(PII_FIELDS).toContain('token');
    expect(PII_FIELDS).toContain('email');
  });
});

// ============================================================================
// LOGGER TESTS
// ============================================================================

describe('Logger', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should generate unique request IDs', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should create request logger with context', () => {
    const logger = createRequestLogger('req-123', 'user-456');
    
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should create module logger', () => {
    const logger = createModuleLogger('test-module');
    
    expect(logger).toBeDefined();
    expect(typeof logger.debug).toBe('function');
  });
});

// ============================================================================
// PII REDACTION TESTS
// ============================================================================

describe('PII Redaction', () => {
  it('should redact password fields', () => {
    const data = {
      username: 'john',
      password: 'secret123',
      email: 'john@example.com',
    };

    const redacted = redactPII(data);

    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.username).toBe('john');
  });

  it('should redact nested PII fields', () => {
    const data = {
      user: {
        name: 'John',
        password: 'secret',
        creditCard: '1234-5678-9012-3456',
      },
    };

    const redacted = redactPII(data);

    expect(redacted.user.password).toBe('[REDACTED]');
    expect(redacted.user.creditCard).toBe('[REDACTED]');
    expect(redacted.user.name).toBe('John');
  });

  it('should handle arrays', () => {
    const data = [
      { username: 'john', password: 'secret1' },
      { username: 'jane', password: 'secret2' },
    ];

    const redacted = redactPII(data);

    expect(redacted[0].password).toBe('[REDACTED]');
    expect(redacted[1].password).toBe('[REDACTED]');
  });

  it('should handle null and undefined', () => {
    expect(redactPII(null)).toBe(null);
    expect(redactPII(undefined)).toBe(undefined);
  });
});

// ============================================================================
// METRICS TESTS
// ============================================================================

describe('Metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('should create counter metric', () => {
    const counter = createCounter('test_counter', 'Test counter', ['label1']);
    
    expect(counter).toBeDefined();
    expect(counter.name).toBe('test_counter');
    expect(counter.type).toBe('counter');
  });

  it('should increment counter', () => {
    createCounter('requests_total', 'Total requests', ['method']);
    
    incrementCounter('requests_total', { method: 'GET' });
    incrementCounter('requests_total', { method: 'GET' });
    incrementCounter('requests_total', { method: 'POST' });

    const metrics = generateMetrics();
    
    expect(metrics).toContain('requests_total');
    expect(metrics).toContain('method="GET"');
    expect(metrics).toContain('method="POST"');
  });

  it('should create and update gauge', () => {
    createGauge('active_connections', 'Active connections');
    
    setGauge('active_connections', {}, 10);
    incrementGauge('active_connections', {}, 5);

    const metrics = generateMetrics();
    
    expect(metrics).toContain('active_connections');
  });

  it('should observe histogram values', () => {
    createHistogram('response_time', 'Response time', ['route'], [100, 200, 500]);
    
    observeHistogram('response_time', { route: '/api/test' }, 150);
    observeHistogram('response_time', { route: '/api/test' }, 50);

    const metrics = generateMetrics();
    
    expect(metrics).toContain('response_time');
    expect(metrics).toContain('bucket');
  });
});

// ============================================================================
// HEALTH CHECK TESTS
// ============================================================================

describe('Health Checks', () => {
  it('should register custom health check', () => {
    const customCheck = async () => ({
      status: 'healthy' as const,
      message: 'Custom check passed',
    });

    registerHealthCheck('custom', customCheck);
    const checks = getRegisteredHealthChecks();

    expect(checks).toContain('custom');
  });

  it('should have default health checks registered', () => {
    const checks = getRegisteredHealthChecks();

    expect(checks).toContain('database');
    expect(checks).toContain('redis');
    expect(checks).toContain('memory');
  });
});

// ============================================================================
// TRACING TESTS
// ============================================================================

describe('Tracing', () => {
  it('should extract trace context from W3C traceparent', () => {
    const req = {
      get: (header: string) => {
        if (header === 'traceparent') {
          return '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01';
        }
        return undefined;
      },
    } as unknown as Request;

    const context = extractTraceContext(req);

    expect(context).toBeDefined();
    expect(context?.traceId).toBe('0af7651916cd43dd8448eb211c80319c');
    expect(context?.parentSpanId).toBe('b7ad6b7169203331');
    expect(context?.sampled).toBe(true);
  });

  it('should extract trace context from X-Request-ID', () => {
    const req = {
      get: (header: string) => {
        if (header === 'x-request-id') {
          return 'custom-request-id';
        }
        return undefined;
      },
    } as unknown as Request;

    const context = extractTraceContext(req);

    expect(context).toBeDefined();
    expect(context?.traceId).toBe('custom-request-id');
  });

  it('should build valid traceparent header', () => {
    const context = {
      traceId: 'abc123',
      spanId: 'def456',
      sampled: true,
    };

    const traceparent = buildTraceparent(context as any);

    expect(traceparent).toBe('00-abc123-def456-01');
  });

  it('should return null when no trace context', () => {
    const req = {
      get: () => undefined,
    } as unknown as Request;

    const context = extractTraceContext(req);

    expect(context).toBeNull();
  });
});
