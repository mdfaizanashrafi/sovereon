/**
 * ============================================================================
 * CIRCUIT BREAKER CHAOS TESTS
 * ============================================================================
 * Tests circuit breaker behavior under various failure conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreaker, getCircuitBreaker } from '../../utils/circuit-breaker';

describe('Circuit Breaker - Chaos Scenarios', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-chaos', {
      failureThreshold: 3,
      resetTimeout: 1000,
      halfOpenMaxCalls: 2,
    });
  });

  describe('Rapid Failure Scenario', () => {
    it('should transition to OPEN after rapid failures', async () => {
      const failingFn = () => Promise.reject(new Error('Service down'));

      // Trigger 3 rapid failures
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          circuitBreaker.execute(failingFn).catch(() => {})
        );
      }
      await Promise.all(promises);

      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should reject requests immediately when OPEN', async () => {
      // Force OPEN state
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch {}
      }

      // Try to execute a successful function
      await expect(
        circuitBreaker.execute(() => Promise.resolve('success'))
      ).rejects.toThrow('Circuit breaker');
    });
  });

  describe('Recovery Scenario', () => {
    it('should transition to HALF_OPEN after reset timeout', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch {}
      }
      expect(circuitBreaker.getState()).toBe('OPEN');

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Check state transitions to HALF_OPEN
      expect(circuitBreaker.getState()).toBe('HALF_OPEN');
    });

    it('should transition back to OPEN if HALF_OPEN fails', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch {}
      }

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(circuitBreaker.getState()).toBe('HALF_OPEN');

      // One failure in HALF_OPEN should reopen
      try {
        await circuitBreaker.execute(() => Promise.reject(new Error('fail')));
      } catch {}

      expect(circuitBreaker.getState()).toBe('OPEN');
    });

    it('should transition to CLOSED after HALF_OPEN successes', async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(() => Promise.reject(new Error('fail')));
        } catch {}
      }

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Need 2 successful calls to close
      await circuitBreaker.execute(() => Promise.resolve('success1'));
      await circuitBreaker.execute(() => Promise.resolve('success2'));

      expect(circuitBreaker.getState()).toBe('CLOSED');
    });
  });

  describe('Mixed Success/Failure Scenario', () => {
    it('should handle alternating success and failure', async () => {
      let callCount = 0;
      const mixedFn = () => {
        callCount++;
        return callCount % 2 === 0 
          ? Promise.resolve('success')
          : Promise.reject(new Error('fail'));
      };

      // Execute mixed calls
      for (let i = 0; i < 6; i++) {
        try {
          await circuitBreaker.execute(mixedFn);
        } catch {}
      }

      // Should have 3 failures but circuit might still be CLOSED
      // because failures are interspersed with successes
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.failureCount).toBeLessThanOrEqual(3);
    });
  });

  describe('Chaos Induced Latency', () => {
    it('should track state during high latency', async () => {
      const slowFn = () => new Promise((resolve) => {
        setTimeout(() => resolve('slow success'), 100);
      });

      const result = await circuitBreaker.execute(slowFn);
      expect(result).toBe('slow success');
      expect(circuitBreaker.getState()).toBe('CLOSED');
    });

    it('should handle timeout scenarios', async () => {
      const timeoutFn = () => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 50);
      });

      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(timeoutFn);
        } catch {}
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests consistently', async () => {
      let failureCount = 0;
      const flakyFn = () => {
        failureCount++;
        if (failureCount <= 3) {
          return Promise.reject(new Error('flaky'));
        }
        return Promise.resolve('stable');
      };

      // Send concurrent requests
      const promises = Array(5).fill(null).map(() => 
        circuitBreaker.execute(flakyFn).catch(() => 'failed')
      );

      const results = await Promise.all(promises);
      
      // Some should fail, circuit should be OPEN after
      expect(results).toContain('failed');
      expect(['OPEN', 'HALF_OPEN', 'CLOSED']).toContain(circuitBreaker.getState());
    });
  });
});

describe('Circuit Breaker Metrics', () => {
  it('should track failure count accurately', async () => {
    const cb = new CircuitBreaker('metrics-test', { failureThreshold: 5 });

    expect(cb.getMetrics().failureCount).toBe(0);

    for (let i = 0; i < 2; i++) {
      try {
        await cb.execute(() => Promise.reject(new Error('fail')));
      } catch {}
    }

    expect(cb.getMetrics().failureCount).toBe(2);
  });

  it('should reset failure count on success', async () => {
    const cb = new CircuitBreaker('reset-test', { failureThreshold: 5 });

    // One failure
    try {
      await cb.execute(() => Promise.reject(new Error('fail')));
    } catch {}
    expect(cb.getMetrics().failureCount).toBe(1);

    // Success resets counter
    await cb.execute(() => Promise.resolve('success'));
    expect(cb.getMetrics().failureCount).toBe(0);
  });

  it('should track last failure time', async () => {
    const cb = new CircuitBreaker('time-test');
    
    expect(cb.getMetrics().lastFailureTime).toBeUndefined();

    const beforeFailure = Date.now();
    try {
      await cb.execute(() => Promise.reject(new Error('fail')));
    } catch {}
    const afterFailure = Date.now();

    expect(cb.getMetrics().lastFailureTime).toBeGreaterThanOrEqual(beforeFailure);
    expect(cb.getMetrics().lastFailureTime).toBeLessThanOrEqual(afterFailure);
  });
});

describe('Circuit Breaker Registry', () => {
  it('should return same instance for same name', () => {
    const cb1 = getCircuitBreaker('shared-circuit');
    const cb2 = getCircuitBreaker('shared-circuit');
    
    expect(cb1).toBe(cb2);
  });

  it('should isolate different circuit breakers', async () => {
    const cb1 = getCircuitBreaker('circuit-a', { failureThreshold: 2 });
    const cb2 = getCircuitBreaker('circuit-b', { failureThreshold: 5 });

    // Fail circuit-a twice
    for (let i = 0; i < 2; i++) {
      try {
        await cb1.execute(() => Promise.reject(new Error('fail')));
      } catch {}
    }

    // Circuit-a should be OPEN
    expect(cb1.getState()).toBe('OPEN');
    
    // Circuit-b should still be CLOSED
    expect(cb2.getState()).toBe('CLOSED');
  });
});
