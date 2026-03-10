/**
 * ============================================================================
 * CHAOS TEST SUITE INDEX
 * ============================================================================
 * Centralized exports for all chaos engineering tests
 */

// Import all chaos test files to ensure they are registered
import './engine.test';
import './circuit-breaker.test';
import './cache-fallback.test';
import './database-retry.test';
import './graceful-degradation.test';
import './recovery-time.test';

// Export test utilities for reuse
export const chaosTestUtils = {
  /**
   * Wait for specified duration
   */
  wait: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Retry an operation with exponential backoff
   */
  retry: async function retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 100
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError!;
  },

  /**
   * Measure execution time of an operation
   */
  measureTime: async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  },

  /**
   * Simulate network latency
   */
  simulateLatency: (latencyMs: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, latencyMs)),

  /**
   * Create a flaky function that fails randomly
   */
  createFlakyFunction: function createFlakyFunction<T>(successRate: number, returnValue: T): 
    () => Promise<T> {
    return (): Promise<T> => {
      if (Math.random() < successRate) {
        return Promise.resolve(returnValue);
      }
      return Promise.reject(new Error('Simulated failure'));
    };
  },
};

export default chaosTestUtils;
