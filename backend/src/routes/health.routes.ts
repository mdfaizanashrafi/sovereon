/**
 * Health Check Routes
 * Extended health checks for database and system status
 */

import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Deep health check - verifies database connectivity
 */
router.get(
  '/health/db',
  asyncHandler(async (_req: Request, res: Response) => {
    const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};
    
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok', message: 'Connected' };
    } catch (error) {
      checks.database = { 
        status: 'error', 
        message: (error as Error).message 
      };
    }

    // Check migrations status
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        ORDER BY finished_at DESC
        LIMIT 5
      `;
      checks.migrations = { 
        status: 'ok', 
        message: `${(migrations as any[]).length} recent migrations` 
      };
    } catch (error) {
      checks.migrations = { 
        status: 'error', 
        message: 'Migration table not accessible' 
      };
    }

    // Check table counts
    try {
      const tableCounts = await Promise.all([
        prisma.adminUser.count().then(c => ({ name: 'admin_users', count: c })),
        prisma.teamMember.count().then(c => ({ name: 'team_members', count: c })),
        prisma.testimonial.count().then(c => ({ name: 'testimonials', count: c })),
        prisma.fAQ.count().then(c => ({ name: 'faqs', count: c })),
        prisma.serviceCategory.count().then(c => ({ name: 'service_categories', count: c })),
      ]);
      checks.tables = { 
        status: 'ok', 
        message: tableCounts.map(t => `${t.name}: ${t.count}`).join(', ') 
      };
    } catch (error) {
      checks.tables = { 
        status: 'error', 
        message: (error as Error).message 
      };
    }

    const allOk = Object.values(checks).every(c => c.status === 'ok');
    
    res.status(allOk ? 200 : 503).json({
      success: allOk,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks,
    });
  })
);

/**
 * Public health check - basic availability
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

export default router;
