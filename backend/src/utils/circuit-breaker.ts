/**
 * ============================================================================
 * CIRCUIT BREAKER PATTERN
 * ============================================================================
 * Prevents cascading failures by temporarily blocking requests to failing services
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenMaxCalls?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private halfOpenCalls = 0;
  
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxCalls: number;

  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions = {}
  ) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30000; // 30 seconds
    this.halfOpenMaxCalls = options.halfOpenMaxCalls ?? 3;
  }

  getState(): CircuitState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenCalls = 0;
        this.successCount = 0;
        console.log(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
      }
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      throw new Error(
        `Circuit breaker '${this.name}' is OPEN. Service temporarily unavailable.`
      );
    }

    if (currentState === 'HALF_OPEN') {
      if (this.halfOpenCalls >= this.halfOpenMaxCalls) {
        throw new Error(
          `Circuit breaker '${this.name}' is HALF_OPEN and max calls reached.`
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.halfOpenMaxCalls) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.log(`[CircuitBreaker:${this.name}] Transitioning to CLOSED`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      console.log(`[CircuitBreaker:${this.name}] Transitioning to OPEN (from HALF_OPEN)`);
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`[CircuitBreaker:${this.name}] Transitioning to OPEN (failure threshold reached)`);
    }
  }

  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Circuit breaker registry
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  options?: CircuitBreakerOptions
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, new CircuitBreaker(name, options));
  }
  return circuitBreakers.get(name)!;
}

export function getAllCircuitBreakerMetrics() {
  const metrics: Record<string, ReturnType<CircuitBreaker['getMetrics']>> = {};
  circuitBreakers.forEach((cb, name) => {
    metrics[name] = cb.getMetrics();
  });
  return metrics;
}
