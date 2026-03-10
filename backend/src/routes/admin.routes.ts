/**
 * ============================================================================
 * ADMIN ROUTES
 * ============================================================================
 * Authentication and CMS management endpoints
 * Refactored to use CRUD Route Factory for reduced boilerplate
 * 
 * @version 2.0.0 - Using CRUD Factory
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { adminAuthMiddleware, adminLogin, checkAdminSession } from '../middleware/adminAuth';
import { asyncHandler } from '../middleware/auth';
import { formatResponse, AppError } from '../utils/errors';
import { createAdminCrudRoutes } from '../factories/CrudRouteFactory';
import * as cmsService from '../services/cms.service';
import {
  TeamMemberService,
  ServiceCategoryService,
  ServiceCMSService,
  TestimonialService,
  FAQService,
} from '../services/cms-services';

const router = express.Router();

// ============================================================================
// RATE LIMITING
// ============================================================================

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ============================================================================
// AUTHENTICATION
// ============================================================================

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Login
router.post(
  '/auth/login',
  adminLoginLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = loginSchema.parse(req.body);
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    const admin = await adminLogin(username, password, clientIp);

    if (!admin) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
    }

    req.session.adminId = admin.id;
    res.json(formatResponse(true, { id: admin.id, username: admin.username }));
  })
);

// Logout
router.post(
  '/auth/logout',
  asyncHandler(async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) console.error('[Session] Logout error:', err);
    });
    res.json(formatResponse(true, { message: 'Logged out successfully' }));
  })
);

// Check session
router.get(
  '/auth/me',
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.session?.adminId;

    if (!adminId) {
      return res.json(formatResponse(true, null));
    }

    const admin = await checkAdminSession(adminId);

    if (!admin) {
      req.session.destroy((err) => {
        if (err) console.error('[Session] Failed to destroy session:', err);
      });
      return res.json(formatResponse(true, null));
    }

    res.json(formatResponse(true, admin));
  })
);

// ============================================================================
// CRUD ROUTES - Using Factory
// ============================================================================

// Team Members
router.use(createAdminCrudRoutes(
  { 
    path: 'team-members', 
    authMiddleware: adminAuthMiddleware,
    enableGetById: true 
  },
  TeamMemberService
));

// Service Categories
router.use(createAdminCrudRoutes(
  { 
    path: 'service-categories', 
    authMiddleware: adminAuthMiddleware,
    enableGetById: true 
  },
  ServiceCategoryService
));

// Services
router.use(createAdminCrudRoutes(
  { 
    path: 'services', 
    authMiddleware: adminAuthMiddleware,
    enableGetById: true 
  },
  ServiceCMSService
));

// Testimonials
router.use(createAdminCrudRoutes(
  { 
    path: 'testimonials', 
    authMiddleware: adminAuthMiddleware,
    enableGetById: true 
  },
  TestimonialService
));

// FAQs
router.use(createAdminCrudRoutes(
  { 
    path: 'faqs', 
    authMiddleware: adminAuthMiddleware,
    enableGetById: true 
  },
  FAQService
));

// ============================================================================
// MANUAL ROUTES - For complex operations not covered by CRUD factory
// ============================================================================

// Page Content
router.get(
  '/page-contents',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllPageContents();
    res.json(result);
  })
);

router.put(
  '/page-contents/:page/:section',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updatePageContent(
      req.params.page,
      req.params.section,
      req.body.content
    );
    res.json(result);
  })
);

// Global Settings
router.get(
  '/settings',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllGlobalSettings();
    res.json(result);
  })
);

router.put(
  '/settings',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateMultipleGlobalSettings(req.body);
    res.json(result);
  })
);

// Current Projects
router.get(
  '/current-projects',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllCurrentProjects();
    res.json(result);
  })
);

router.post(
  '/current-projects',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createCurrentProject(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/current-projects/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateCurrentProject(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/current-projects/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteCurrentProject(req.params.id);
    res.json(result);
  })
);

// Future Quests
router.get(
  '/future-quests',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllFutureQuests();
    res.json(result);
  })
);

router.post(
  '/future-quests',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createFutureQuest(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/future-quests/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateFutureQuest(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/future-quests/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteFutureQuest(req.params.id);
    res.json(result);
  })
);

// Case Studies
router.get(
  '/case-studies',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllCaseStudies();
    res.json(result);
  })
);

router.get(
  '/case-studies/:slug',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getCaseStudyBySlug(req.params.slug);
    res.json(result);
  })
);

router.post(
  '/case-studies',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createCaseStudy(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/case-studies/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateCaseStudy(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/case-studies/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteCaseStudy(req.params.id);
    res.json(result);
  })
);

// Blog Posts
router.get(
  '/blog-posts',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllBlogPosts();
    res.json(result);
  })
);

router.get(
  '/blog-posts/:slug',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getBlogPostBySlug(req.params.slug);
    res.json(result);
  })
);

router.post(
  '/blog-posts',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createBlogPost(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/blog-posts/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateBlogPost(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/blog-posts/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteBlogPost(req.params.id);
    res.json(result);
  })
);

export default router;
