/**
 * ============================================================================
 * API V1 ROUTES
 * ============================================================================
 * Version 1 of the API - All routes under /api/v1/
 */

import { Router } from 'express';
import adminRoutes from './admin.routes';
import publicRoutes from './public.routes';

const router = Router();

// Public routes - no authentication required
router.use('/', publicRoutes);

// Admin routes - authentication required
router.use('/admin', adminRoutes);

export default router;
