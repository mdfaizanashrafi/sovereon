/**
 * ============================================================================
 * TEAM MEMBER ROUTES
 * ============================================================================
 * Feature module routes with caching and validation
 */

import { Router } from 'express';
import { TeamMemberController } from './controllers/TeamMemberController';
import { adminAuthMiddleware } from '../../../../middleware/adminAuth';
import { createRateLimiter } from '../../../../middleware/rateLimiter';
import { cacheMiddleware } from '../../../../gateway/middleware/cache';

const PUBLIC_CACHE_TTL = 300; // 5 minutes

export function createTeamMemberRoutes(): Router {
  const router = Router();
  const controller = new TeamMemberController();

  // Public routes with caching
  router.get(
    '/',
    createRateLimiter('public'),
    cacheMiddleware(PUBLIC_CACHE_TTL),
    (req, res) => controller.getAll(req, res)
  );

  router.get(
    '/:id',
    createRateLimiter('public'),
    cacheMiddleware(PUBLIC_CACHE_TTL),
    (req, res) => controller.getById(req, res)
  );

  // Admin routes (no caching)
  router.post(
    '/',
    adminAuthMiddleware,
    createRateLimiter('admin'),
    (req, res) => controller.create(req, res)
  );

  router.put(
    '/:id',
    adminAuthMiddleware,
    createRateLimiter('admin'),
    (req, res) => controller.update(req, res)
  );

  router.delete(
    '/:id',
    adminAuthMiddleware,
    createRateLimiter('admin'),
    (req, res) => controller.delete(req, res)
  );

  return router;
}

export default createTeamMemberRoutes;
