/**
 * ============================================================================
 * PUBLIC API ROUTES
 * ============================================================================
 * Provides public access to CMS content for the website
 * Refactored to use CRUD Route Factory
 * 
 * @version 2.0.0 - Using CRUD Factory
 */

import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import * as cmsService from '../services/cms.service';
import { createPublicRoutes } from '../factories/CrudRouteFactory';
import {
  TeamMemberService,
  ServiceCategoryService,
  TestimonialService,
  FAQService,
  ServiceCMSService,
} from '../services/cms-services';

const router = express.Router();

// ============================================================================
// CRUD ROUTES - Using Factory (Read-only)
// ============================================================================

// Team Members
router.use(createPublicRoutes(
  { path: 'team-members' },
  TeamMemberService
));

// Service Categories
router.use(createPublicRoutes(
  { path: 'service-categories' },
  ServiceCategoryService
));

// Services (with slug lookup)
router.use(createPublicRoutes(
  { 
    path: 'services',
    enableSlugLookup: true,
    slugParam: 'slug'
  },
  ServiceCMSService
));

// Testimonials
router.use(createPublicRoutes(
  { path: 'testimonials' },
  TestimonialService
));

// FAQs
router.use(createPublicRoutes(
  { path: 'faqs' },
  FAQService
));

// ============================================================================
// MANUAL ROUTES - Complex operations
// ============================================================================

// Page Content
router.get(
  '/page-content/:page/:section',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, section } = req.params;
    const result = await cmsService.getPageContent(page, section);
    res.json(result);
  })
);

// Global Settings
router.get(
  '/settings',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllGlobalSettings();
    res.json(result);
  })
);

// Current Projects
router.get(
  '/current-projects',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveCurrentProjects();
    res.json(result);
  })
);

// Future Quests
router.get(
  '/future-quests',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveFutureQuests();
    res.json(result);
  })
);

// Case Studies
router.get(
  '/case-studies',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveCaseStudies();
    res.json(result);
  })
);

router.get(
  '/case-studies/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getCaseStudyBySlug(req.params.slug);
    res.json(result);
  })
);

// Blog Posts
router.get(
  '/blog-posts',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getPublishedBlogPosts();
    res.json(result);
  })
);

router.get(
  '/blog-posts/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getBlogPostBySlug(req.params.slug);
    res.json(result);
  })
);

export default router;
