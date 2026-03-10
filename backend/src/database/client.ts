/**
 * ============================================================================
 * DATABASE CLIENT - Singleton Pattern
 * ============================================================================
 * Ensures only one PrismaClient instance exists across the application
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient singleton instance
let prismaInstance: PrismaClient | null = null;

/**
 * Get or create the PrismaClient singleton instance
 * This prevents multiple instances in development (hot reload)
 * and ensures connection pooling works correctly in production
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }
  return prismaInstance;
}

/**
 * Disconnect from database
 * Used during graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

/**
 * Connect to database
 * Explicitly connect (optional, Prisma connects lazily)
 */
export async function connectDatabase(): Promise<void> {
  const prisma = getPrismaClient();
  await prisma.$connect();
}

// Export the singleton instance for backward compatibility
export const prisma = getPrismaClient();

// Default export for convenience
export default getPrismaClient;
