/**
 * ============================================================================
 * PUBLIC ROUTES TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock the CRUD Route Factory
vi.mock('../../factories/CrudRouteFactory', () => ({
  createPublicRoutes: vi.fn((config, Service) => {
    const router = express.Router();
    
    // Simulate public routes behavior
    router.get(`/${config.path}`, (req, res) => {
      res.json({ success: true, data: [] });
    });
    
    if (config.enableSlugLookup) {
      router.get(`/${config.path}/:${config.slugParam || 'slug'}`, (req, res) => {
        res.json({ success: true, data: { slug: req.params[config.slugParam || 'slug'] } });
      });
    }
    
    return router;
  }),
}));

// Mock CMS services
vi.mock('../../services/cms.service', () => ({
  getPageContent: vi.fn().mockResolvedValue({ success: true, data: { content: 'Test content' } }),
  getAllGlobalSettings: vi.fn().mockResolvedValue({ success: true, data: [{ key: 'test', value: 'value' }] }),
  getActiveCurrentProjects: vi.fn().mockResolvedValue({ success: true, data: [{ id: '1', title: 'Project 1' }] }),
  getActiveFutureQuests: vi.fn().mockResolvedValue({ success: true, data: [{ id: '1', title: 'Quest 1' }] }),
  getActiveCaseStudies: vi.fn().mockResolvedValue({ success: true, data: [{ id: '1', title: 'Case Study 1' }] }),
  getCaseStudyBySlug: vi.fn().mockImplementation((slug) => 
    Promise.resolve({ success: true, data: { id: '1', slug, title: 'Case Study' } })
  ),
  getPublishedBlogPosts: vi.fn().mockResolvedValue({ success: true, data: [{ id: '1', title: 'Blog Post 1' }] }),
  getBlogPostBySlug: vi.fn().mockImplementation((slug) => 
    Promise.resolve({ success: true, data: { id: '1', slug, title: 'Blog Post' } })
  ),
}));

// Mock CMS services
vi.mock('../../services/cms-services', () => ({
  TeamMemberService: {},
  ServiceCategoryService: {},
  TestimonialService: {},
  FAQService: {},
  ServiceCMSService: {},
}));

// Mock auth middleware
vi.mock('../../middleware/auth', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },
}));

describe('Public Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    
    // Import the router after mocks are set up
    const publicRouter = (await import('../public.routes')).default;
    app.use('/api/public', publicRouter);
  });

  describe('GET /api/public/team-members', () => {
    it('should return team members list', async () => {
      const response = await request(app).get('/api/public/team-members');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/service-categories', () => {
    it('should return service categories list', async () => {
      const response = await request(app).get('/api/public/service-categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/services', () => {
    it('should return services list', async () => {
      const response = await request(app).get('/api/public/services');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return service by slug', async () => {
      const response = await request(app).get('/api/public/services/web-development');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.slug).toBe('web-development');
    });
  });

  describe('GET /api/public/testimonials', () => {
    it('should return testimonials list', async () => {
      const response = await request(app).get('/api/public/testimonials');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/faqs', () => {
    it('should return FAQs list', async () => {
      const response = await request(app).get('/api/public/faqs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/page-content/:page/:section', () => {
    it('should return page content', async () => {
      const response = await request(app).get('/api/public/page-content/home/hero');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/settings', () => {
    it('should return global settings', async () => {
      const response = await request(app).get('/api/public/settings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/public/current-projects', () => {
    it('should return active current projects', async () => {
      const response = await request(app).get('/api/public/current-projects');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/future-quests', () => {
    it('should return active future quests', async () => {
      const response = await request(app).get('/api/public/future-quests');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/case-studies', () => {
    it('should return active case studies', async () => {
      const response = await request(app).get('/api/public/case-studies');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/case-studies/:slug', () => {
    it('should return case study by slug', async () => {
      const { getCaseStudyBySlug } = await import('../../services/cms.service');
      vi.mocked(getCaseStudyBySlug).mockResolvedValue({
        success: true,
        data: { id: '1', slug: 'case-study-1', title: 'Case Study' },
      });

      const response = await request(app).get('/api/public/case-studies/case-study-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/blog-posts', () => {
    it('should return published blog posts', async () => {
      const response = await request(app).get('/api/public/blog-posts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/public/blog-posts/:slug', () => {
    it('should return blog post by slug', async () => {
      const { getBlogPostBySlug } = await import('../../services/cms.service');
      vi.mocked(getBlogPostBySlug).mockResolvedValue({
        success: true,
        data: { id: '1', slug: 'blog-post-1', title: 'Blog Post' },
      });

      const response = await request(app).get('/api/public/blog-posts/blog-post-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
