/**
 * ============================================================================
 * CIRCUIT BREAKER TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, getCircuitBreaker } from '../circuit-breaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test', {
      failureThreshold: 3,
      resetTimeout: 1000,
      halfOpenMaxCalls: 2,
    });
  });

  it('starts in CLOSED state', () => {
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('transitions to OPEN after failure threshold', async () => {
    const failingFn = () => Promise.reject(new Error('Test error'));

    // 3 failures to trigger OPEN
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    expect(circuitBreaker.getState()).toBe('OPEN');
  });

  it('throws error when OPEN', async () => {
    const failingFn = () => Promise.reject(new Error('Test error'));

    // Trigger OPEN state
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failingFn);
      } catch {
        // Expected
      }
    }

    await expect(circuitBreaker.execute(() => Promise.resolve('success'))).rejects.toThrow(
      "Circuit breaker 'test' is OPEN"
    );
  });

  it('returns success in CLOSED state', async () => {
    const successFn = () => Promise.resolve('success');
    
    const result = await circuitBreaker.execute(successFn);
    
    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('provides metrics', () => {
    const metrics = circuitBreaker.getMetrics();
    
    expect(metrics).toHaveProperty('state');
    expect(metrics).toHaveProperty('failureCount');
    expect(metrics).toHaveProperty('successCount');
  });
});

describe('getCircuitBreaker', () => {
  it('returns same instance for same name', () => {
    const cb1 = getCircuitBreaker('shared');
    const cb2 = getCircuitBreaker('shared');
    
    expect(cb1).toBe(cb2);
  });

  it('returns different instances for different names', () => {
    const cb1 = getCircuitBreaker('cb1');
    const cb2 = getCircuitBreaker('cb2');
    
    expect(cb1).not.toBe(cb2);
  });
});
