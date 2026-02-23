/**
 * Public API Routes
 * Provides public access to CMS content for the website
 */

import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import * as cmsService from '../services/cms.service';

const router = express.Router();

// ============================================================================
// TEAM MEMBERS
// ============================================================================

router.get(
  '/team-members',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveTeamMembers();
    res.json(result);
  })
);

// ============================================================================
// SERVICE CATEGORIES
// ============================================================================

router.get(
  '/service-categories',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveServiceCategories();
    res.json(result);
  })
);

// ============================================================================
// TESTIMONIALS
// ============================================================================

router.get(
  '/testimonials',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveTestimonials();
    res.json(result);
  })
);

// ============================================================================
// FAQS
// ============================================================================

router.get(
  '/faqs',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveFAQs();
    res.json(result);
  })
);

// ============================================================================
// PAGE CONTENT
// ============================================================================

router.get(
  '/page-content/:page/:section',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, section } = req.params;
    const result = await cmsService.getPageContent(page, section);
    res.json(result);
  })
);

// ============================================================================
// GLOBAL SETTINGS
// ============================================================================

router.get(
  '/settings',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getAllGlobalSettings();
    res.json(result);
  })
);

// ============================================================================
// CURRENT PROJECTS
// ============================================================================

router.get(
  '/current-projects',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveCurrentProjects();
    res.json(result);
  })
);

// ============================================================================
// FUTURE QUESTS
// ============================================================================

router.get(
  '/future-quests',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await cmsService.getActiveFutureQuests();
    res.json(result);
  })
);

export default router;
