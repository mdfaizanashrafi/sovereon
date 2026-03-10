/**
 * ============================================================================
 * PUBLIC API ROUTES - V1
 * ============================================================================
 * Version 1 public routes with caching and pagination
 */

import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/auth';
import { paginationMiddleware, parsePagination, buildPaginationMeta } from '../../middleware/pagination';
import { cacheMiddleware, cacheConfig } from '../../gateway/middleware/cache';
import * as cmsService from '../../services/cms.service';
import {
  ServiceCategoryService,
  ServiceCMSService,
} from '../../services/cms-services';
import { RepositoryFactory } from '../../repositories';

const router = express.Router();

// Apply pagination middleware to all routes
router.use(paginationMiddleware);

// ============================================================================
// TEAM MEMBERS - Cached & Paginated
// ============================================================================

router.get('/team-members',
  cacheMiddleware(cacheConfig.teamMembers.ttl, cacheConfig.teamMembers.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req);
    const repo = RepositoryFactory.getTeamMemberRepository();
    
    const [data, total] = await Promise.all([
      repo.findActive({ pagination: { page, limit } }),
      repo.count({ isActive: true }),
    ]);

    res.json({
      success: true,
      data,
      meta: buildPaginationMeta(total, page, limit),
    });
  })
);

// ============================================================================
// SERVICE CATEGORIES - Cached
// ============================================================================

router.get('/service-categories',
  cacheMiddleware(cacheConfig.services.ttl, cacheConfig.services.prefix),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await ServiceCategoryService.getActive();
    res.json(result);
  })
);

// ============================================================================
// SERVICES - Cached & Paginated
// ============================================================================

router.get('/services',
  cacheMiddleware(cacheConfig.services.ttl, cacheConfig.services.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req);
    const repo = RepositoryFactory.getServiceCMSRepository();
    
    const [data, total] = await Promise.all([
      repo.findActiveWithCategory(),
      repo.count({ isActive: true }),
    ]);

    // Manual pagination
    const paginatedData = data.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedData,
      meta: buildPaginationMeta(total, page, limit),
    });
  })
);

// Get service by slug (cached individually)
router.get('/services/:slug',
  cacheMiddleware(cacheConfig.services.ttl, cacheConfig.services.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceCMSService.getBySlug(req.params.slug);
    res.json(result);
  })
);

// ============================================================================
// TESTIMONIALS - Cached & Paginated
// ============================================================================

router.get('/testimonials',
  cacheMiddleware(cacheConfig.testimonials.ttl, cacheConfig.testimonials.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req);
    const repo = RepositoryFactory.getTestimonialRepository();
    
    const [data, total] = await Promise.all([
      repo.findActive({ pagination: { page, limit } }),
      repo.count({ isActive: true }),
    ]);

    res.json({
      success: true,
      data,
      meta: buildPaginationMeta(total, page, limit),
    });
  })
);

// ============================================================================
// FAQS - Cached & Paginated with category filter
// ============================================================================

router.get('/faqs',
  cacheMiddleware(cacheConfig.faqs.ttl, cacheConfig.faqs.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req);
    const category = req.query.category as string | undefined;
    const repo = RepositoryFactory.getFAQRepository();
    
    const filters: any = { isActive: true };
    if (category) filters.category = category;
    
    const [data, total] = await Promise.all([
      repo.findAll({ filters, sort: { field: 'order', direction: 'asc' }, pagination: { page, limit } }),
      repo.count(filters),
    ]);

    res.json({
      success: true,
      data,
      meta: buildPaginationMeta(total, page, limit),
    });
  })
);

// ============================================================================
// PAGE CONTENT - Cached
// ============================================================================

router.get('/page-content/:page/:section',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getPageContent(req.params.page, req.params.section);
    res.json(result);
  })
);

// ============================================================================
// GLOBAL SETTINGS - Cached (long TTL)
// ============================================================================

router.get('/settings',
  cacheMiddleware(cacheConfig.settings.ttl, cacheConfig.settings.prefix),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllGlobalSettings();
    res.json(result);
  })
);

// ============================================================================
// CURRENT PROJECTS - Cached
// ============================================================================

router.get('/current-projects',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveCurrentProjects();
    res.json(result);
  })
);

// ============================================================================
// FUTURE QUESTS - Cached
// ============================================================================

router.get('/future-quests',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveFutureQuests();
    res.json(result);
  })
);

// ============================================================================
// CASE STUDIES - Cached & Paginated
// ============================================================================

router.get('/case-studies',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req);
    const result = await cmsService.getActiveCaseStudies();
    const data = result.data || [];
    const total = data.length;
    
    // Manual pagination
    const paginatedData = data.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedData,
      meta: buildPaginationMeta(total, page, limit),
    });
  })
);

router.get('/case-studies/:slug',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getCaseStudyBySlug(req.params.slug);
    res.json(result);
  })
);

// ============================================================================
// BLOG POSTS - Cached & Paginated
// ============================================================================

router.get('/blog-posts',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req);
    const result = await cmsService.getPublishedBlogPosts();
    const data = result.data || [];
    const total = data.length;
    
    // Manual pagination
    const paginatedData = data.slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedData,
      meta: buildPaginationMeta(total, page, limit),
    });
  })
);

router.get('/blog-posts/:slug',
  cacheMiddleware(cacheConfig.cms.ttl, cacheConfig.cms.prefix),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await cmsService.getBlogPostBySlug(req.params.slug);
    res.json(result);
  })
);

export default router;
