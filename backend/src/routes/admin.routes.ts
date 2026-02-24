/**
 * Admin Routes
 * Authentication and CMS management endpoints
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { adminAuthMiddleware, adminLogin, checkAdminSession } from '../middleware/adminAuth';
import { asyncHandler } from '../middleware/auth';
import { formatResponse, AppError } from '../utils/errors';
import * as cmsService from '../services/cms.service';

// Rate limiter for admin login - stricter than public endpoints
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
  skipSuccessfulRequests: true, // Don't count successful logins
});

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// ============================================================================
// AUTHENTICATION
// ============================================================================

// Login (with rate limiting)
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

    // Set session
    req.session.adminId = admin.id;

    res.json(formatResponse(true, { id: admin.id, username: admin.username }));
  })
);

// Logout
router.post(
  '/auth/logout',
  asyncHandler(async (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('[Session] Logout error:', err);
      }
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
      // Admin no longer exists, destroy session
      req.session.destroy((err) => {
        if (err) console.error('[Session] Failed to destroy session:', err);
      });
      return res.json(formatResponse(true, null));
    }

    res.json(formatResponse(true, admin));
  })
);

// ============================================================================
// TEAM MEMBERS (Protected)
// ============================================================================

router.get(
  '/team-members',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllTeamMembers();
    res.json(result);
  })
);

router.post(
  '/team-members',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createTeamMember(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/team-members/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateTeamMember(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/team-members/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteTeamMember(req.params.id);
    res.json(result);
  })
);

// ============================================================================
// SERVICE CATEGORIES (Protected)
// ============================================================================

router.get(
  '/service-categories',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllServiceCategories();
    res.json(result);
  })
);

router.post(
  '/service-categories',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createServiceCategory(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/service-categories/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateServiceCategory(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/service-categories/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteServiceCategory(req.params.id);
    res.json(result);
  })
);

// ============================================================================
// SERVICES (Protected)
// ============================================================================

router.get(
  '/services',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllServices();
    res.json(result);
  })
);

router.post(
  '/services',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createService(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/services/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateService(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/services/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteService(req.params.id);
    res.json(result);
  })
);

// ============================================================================
// TESTIMONIALS (Protected)
// ============================================================================

router.get(
  '/testimonials',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllTestimonials();
    res.json(result);
  })
);

router.post(
  '/testimonials',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createTestimonial(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/testimonials/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateTestimonial(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/testimonials/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteTestimonial(req.params.id);
    res.json(result);
  })
);

// ============================================================================
// FAQS (Protected)
// ============================================================================

router.get(
  '/faqs',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllFAQs();
    res.json(result);
  })
);

router.post(
  '/faqs',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.createFAQ(req.body);
    res.status(201).json(result);
  })
);

router.put(
  '/faqs/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.updateFAQ(req.params.id, req.body);
    res.json(result);
  })
);

router.delete(
  '/faqs/:id',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.deleteFAQ(req.params.id);
    res.json(result);
  })
);

// ============================================================================
// PAGE CONTENT (Protected)
// ============================================================================

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
    const { page, section } = req.params;
    const { content } = req.body;
    const result = await cmsService.updatePageContent(page, section, content);
    res.json(result);
  })
);

// ============================================================================
// GLOBAL SETTINGS (Protected)
// ============================================================================

router.get(
  '/settings',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllGlobalSettings();
    res.json(result);
  })
);

router.put(
  '/settings/:key',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value } = req.body;
    const result = await cmsService.updateGlobalSetting(key, value);
    res.json(result);
  })
);

router.put(
  '/settings/batch',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { settings } = req.body;
    const result = await cmsService.updateMultipleGlobalSettings(settings);
    res.json(result);
  })
);

// ============================================================================
// CURRENT PROJECTS (Protected)
// ============================================================================

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

// ============================================================================
// FUTURE QUESTS (Protected)
// ============================================================================

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

// ============================================================================
// CASE STUDIES (Protected)
// ============================================================================

router.get(
  '/case-studies',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllCaseStudies();
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

// ============================================================================
// BLOG POSTS (Protected)
// ============================================================================

router.get(
  '/blog-posts',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllBlogPosts();
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
