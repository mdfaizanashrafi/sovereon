/**
 * ============================================================================
 * RESILIENT DATABASE CLIENT
 * ============================================================================
 * Prisma client wrapper with circuit breaker and retry logic
 */

import { PrismaClient } from '@prisma/client';
import { getCircuitBreaker } from '../utils/circuit-breaker';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

const dbCircuitBreaker = getCircuitBreaker('database', {
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenMaxCalls: 3,
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withResilientDb<T>(
  operation: (db: PrismaClient) => Promise<T>
): Promise<T> {
  return dbCircuitBreaker.execute(async () => {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await operation(prisma);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          const nonRetryableErrors = [
            'P2002', // Unique constraint violation
            'P2003', // Foreign key constraint violation
            'P2025', // Record not found
          ];
          
          if (nonRetryableErrors.some(code => error.message.includes(code))) {
            throw error;
          }
        }
        
        if (attempt < MAX_RETRIES) {
          console.log(`[Database] Retry attempt ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY}ms`);
          await delay(RETRY_DELAY * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  });
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get connection pool status
export function getDatabaseMetrics() {
  return {
    circuitBreaker: dbCircuitBreaker.getMetrics(),
  };
}

export { prisma };
