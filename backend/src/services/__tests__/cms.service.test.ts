/**
 * ============================================================================
 * CMS SERVICE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cmsService from '../cms.service';

// Mock repositories
vi.mock('../repositories', () => ({
  TeamMemberRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getNextOrder: vi.fn().mockResolvedValue(1),
  })),
  ServiceCategoryRepository: vi.fn().mockImplementation(() => ({
    findAllWithServices: vi.fn(),
    findActiveWithServices: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    slugExists: vi.fn().mockResolvedValue(false),
    getNextOrder: vi.fn().mockResolvedValue(1),
  })),
  ServiceCMSRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    slugExists: vi.fn().mockResolvedValue(false),
    getNextOrderForCategory: vi.fn().mockResolvedValue(1),
  })),
  TestimonialRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getNextOrder: vi.fn().mockResolvedValue(1),
  })),
  FAQRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findActive: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getNextOrder: vi.fn().mockResolvedValue(1),
  })),
  AdminUserRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock Prisma client
const mockPrisma = {
  pageContent: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  globalSetting: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
  currentProject: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  futureQuest: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  caseStudy: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  blogPost: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('../database/client', () => ({
  getPrismaClient: vi.fn().mockReturnValue(mockPrisma),
}));

describe('CMS Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Team Members', () => {
    it('should get all team members', async () => {
      const { TeamMemberRepository } = await import('../repositories');
      const mockFindAll = vi.fn().mockResolvedValue([{ id: '1', name: 'John' }]);
      vi.mocked(TeamMemberRepository).mockImplementation(() => ({
        findAll: mockFindAll,
      } as any));

      const result = await cmsService.getAllTeamMembers();

      expect(result.success).toBe(true);
    });

    it('should get active team members', async () => {
      const result = await cmsService.getActiveTeamMembers();

      expect(result.success).toBe(true);
    });

    it('should create team member', async () => {
      const result = await cmsService.createTeamMember({
        name: 'John Doe',
        role: 'Developer',
        department: 'Engineering',
        description: 'Full stack developer',
      });

      expect(result.success).toBe(true);
    });

    it('should update team member', async () => {
      const result = await cmsService.updateTeamMember('1', { name: 'Jane Doe' });

      expect(result.success).toBe(true);
    });

    it('should delete team member', async () => {
      const result = await cmsService.deleteTeamMember('1');

      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Team member deleted');
    });
  });

  describe('Service Categories', () => {
    it('should get all service categories', async () => {
      const result = await cmsService.getAllServiceCategories();

      expect(result.success).toBe(true);
    });

    it('should get active service categories', async () => {
      const result = await cmsService.getActiveServiceCategories();

      expect(result.success).toBe(true);
    });

    it('should create service category', async () => {
      const result = await cmsService.createServiceCategory({
        slug: 'web-development',
        title: 'Web Development',
        description: 'Full stack web development services',
      });

      expect(result.success).toBe(true);
    });

    it('should reject duplicate slug on create', async () => {
      const { ServiceCategoryRepository } = await import('../repositories');
      vi.mocked(ServiceCategoryRepository).mockImplementation(() => ({
        slugExists: vi.fn().mockResolvedValue(true),
      } as any));

      const result = await cmsService.createServiceCategory({
        slug: 'existing-slug',
        title: 'Test',
        description: 'Test description',
      });

      expect(result.success).toBe(false);
    });

    it('should update service category', async () => {
      const result = await cmsService.updateServiceCategory('1', { title: 'Updated Title' });

      expect(result.success).toBe(true);
    });

    it('should delete service category', async () => {
      const result = await cmsService.deleteServiceCategory('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Services', () => {
    it('should get all services', async () => {
      const result = await cmsService.getAllServices();

      expect(result.success).toBe(true);
    });

    it('should get service by slug', async () => {
      const result = await cmsService.getServiceBySlug('web-development');

      expect(result.success).toBe(true);
    });

    it('should create service', async () => {
      const result = await cmsService.createService({
        slug: 'new-service',
        title: 'New Service',
        categoryId: 'cat-1',
        shortDescription: 'Short desc',
        fullDescription: 'Full desc',
        features: ['Feature 1', 'Feature 2'],
        benefits: ['Benefit 1', 'Benefit 2'],
        strategy: [{ step: 1, title: 'Step 1', description: 'Desc' }],
      });

      expect(result.success).toBe(true);
    });

    it('should reject duplicate slug on service create', async () => {
      const { ServiceCMSRepository } = await import('../repositories');
      vi.mocked(ServiceCMSRepository).mockImplementation(() => ({
        slugExists: vi.fn().mockResolvedValue(true),
      } as any));

      const result = await cmsService.createService({
        slug: 'existing',
        title: 'Test',
        categoryId: 'cat-1',
        shortDescription: 'Short',
        fullDescription: 'Full',
        features: [],
        benefits: [],
        strategy: [],
      });

      expect(result.success).toBe(false);
    });

    it('should update service', async () => {
      const result = await cmsService.updateService('1', { title: 'Updated' });

      expect(result.success).toBe(true);
    });

    it('should delete service', async () => {
      const result = await cmsService.deleteService('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Testimonials', () => {
    it('should get all testimonials', async () => {
      const result = await cmsService.getAllTestimonials();

      expect(result.success).toBe(true);
    });

    it('should get active testimonials', async () => {
      const result = await cmsService.getActiveTestimonials();

      expect(result.success).toBe(true);
    });

    it('should create testimonial', async () => {
      const result = await cmsService.createTestimonial({
        name: 'John Doe',
        company: 'Acme Inc',
        role: 'CEO',
        content: 'Great service!',
        rating: 5,
      });

      expect(result.success).toBe(true);
    });

    it('should update testimonial', async () => {
      const result = await cmsService.updateTestimonial('1', { content: 'Updated content' });

      expect(result.success).toBe(true);
    });

    it('should delete testimonial', async () => {
      const result = await cmsService.deleteTestimonial('1');

      expect(result.success).toBe(true);
    });
  });

  describe('FAQs', () => {
    it('should get all FAQs', async () => {
      const result = await cmsService.getAllFAQs();

      expect(result.success).toBe(true);
    });

    it('should get active FAQs', async () => {
      const result = await cmsService.getActiveFAQs();

      expect(result.success).toBe(true);
    });

    it('should create FAQ', async () => {
      const result = await cmsService.createFAQ({
        question: 'What is this?',
        answer: 'This is a test.',
        category: 'General',
      });

      expect(result.success).toBe(true);
    });

    it('should update FAQ', async () => {
      const result = await cmsService.updateFAQ('1', { answer: 'Updated answer' });

      expect(result.success).toBe(true);
    });

    it('should delete FAQ', async () => {
      const result = await cmsService.deleteFAQ('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Page Content', () => {
    it('should get page content', async () => {
      mockPrisma.pageContent.findUnique.mockResolvedValue({
        page: 'home',
        section: 'hero',
        content: 'Welcome!',
      });

      const result = await cmsService.getPageContent('home', 'hero');

      expect(result.success).toBe(true);
    });

    it('should get all page contents', async () => {
      mockPrisma.pageContent.findMany.mockResolvedValue([
        { page: 'home', section: 'hero' },
      ]);

      const result = await cmsService.getAllPageContents();

      expect(result.success).toBe(true);
    });

    it('should update existing page content', async () => {
      mockPrisma.pageContent.findUnique.mockResolvedValue({
        id: '1',
        page: 'home',
        section: 'hero',
      });
      mockPrisma.pageContent.update.mockResolvedValue({
        page: 'home',
        section: 'hero',
        content: 'New content',
      });

      const result = await cmsService.updatePageContent('home', 'hero', 'New content');

      expect(result.success).toBe(true);
      expect(mockPrisma.pageContent.update).toHaveBeenCalled();
    });

    it('should create new page content if not exists', async () => {
      mockPrisma.pageContent.findUnique.mockResolvedValue(null);
      mockPrisma.pageContent.create.mockResolvedValue({
        page: 'home',
        section: 'hero',
        content: 'New content',
      });

      const result = await cmsService.updatePageContent('home', 'hero', 'New content');

      expect(result.success).toBe(true);
      expect(mockPrisma.pageContent.create).toHaveBeenCalled();
    });
  });

  describe('Global Settings', () => {
    it('should get all global settings', async () => {
      mockPrisma.globalSetting.findMany.mockResolvedValue([
        { key: 'site_name', value: 'Sovereon' },
      ]);

      const result = await cmsService.getAllGlobalSettings();

      expect(result.success).toBe(true);
    });

    it('should get global setting by key', async () => {
      mockPrisma.globalSetting.findUnique.mockResolvedValue({
        key: 'site_name',
        value: 'Sovereon',
      });

      const result = await cmsService.getGlobalSetting('site_name');

      expect(result.success).toBe(true);
    });

    it('should update existing global setting', async () => {
      mockPrisma.globalSetting.findUnique.mockResolvedValue({
        key: 'site_name',
        value: 'Old Name',
      });
      mockPrisma.globalSetting.update.mockResolvedValue({
        key: 'site_name',
        value: 'New Name',
      });

      const result = await cmsService.updateGlobalSetting('site_name', 'New Name');

      expect(result.success).toBe(true);
      expect(mockPrisma.globalSetting.update).toHaveBeenCalled();
    });

    it('should create new global setting if not exists', async () => {
      mockPrisma.globalSetting.findUnique.mockResolvedValue(null);
      mockPrisma.globalSetting.create.mockResolvedValue({
        key: 'new_key',
        value: 'New Value',
      });

      const result = await cmsService.updateGlobalSetting('new_key', 'New Value');

      expect(result.success).toBe(true);
      expect(mockPrisma.globalSetting.create).toHaveBeenCalled();
    });

    it('should update multiple global settings', async () => {
      mockPrisma.globalSetting.findUnique.mockResolvedValue(null);
      mockPrisma.globalSetting.create.mockResolvedValue({});

      const result = await cmsService.updateMultipleGlobalSettings([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ]);

      expect(result.success).toBe(true);
    });
  });

  describe('Current Projects', () => {
    it('should get all current projects', async () => {
      mockPrisma.currentProject.findMany.mockResolvedValue([{ id: '1', title: 'Project 1' }]);

      const result = await cmsService.getAllCurrentProjects();

      expect(result.success).toBe(true);
    });

    it('should get active current projects', async () => {
      mockPrisma.currentProject.findMany.mockResolvedValue([{ id: '1', title: 'Project 1' }]);

      const result = await cmsService.getActiveCurrentProjects();

      expect(result.success).toBe(true);
    });

    it('should create current project', async () => {
      mockPrisma.currentProject.create.mockResolvedValue({ id: '1', title: 'New Project' });

      const result = await cmsService.createCurrentProject({
        title: 'New Project',
        description: 'Project description',
        technologies: ['React', 'Node.js'],
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.currentProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Project',
          technologies: JSON.stringify(['React', 'Node.js']),
        }),
      });
    });

    it('should update current project', async () => {
      mockPrisma.currentProject.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await cmsService.updateCurrentProject('1', { title: 'Updated' });

      expect(result.success).toBe(true);
    });

    it('should delete current project', async () => {
      mockPrisma.currentProject.delete.mockResolvedValue({ id: '1' });

      const result = await cmsService.deleteCurrentProject('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Future Quests', () => {
    it('should get all future quests', async () => {
      mockPrisma.futureQuest.findMany.mockResolvedValue([{ id: '1', title: 'Quest 1' }]);

      const result = await cmsService.getAllFutureQuests();

      expect(result.success).toBe(true);
    });

    it('should get active future quests', async () => {
      mockPrisma.futureQuest.findMany.mockResolvedValue([{ id: '1', title: 'Quest 1' }]);

      const result = await cmsService.getActiveFutureQuests();

      expect(result.success).toBe(true);
    });

    it('should create future quest', async () => {
      mockPrisma.futureQuest.create.mockResolvedValue({ id: '1', title: 'New Quest' });

      const result = await cmsService.createFutureQuest({
        title: 'New Quest',
        description: 'Quest description',
        timeline: 'Q1 2025',
        icon: 'rocket',
      });

      expect(result.success).toBe(true);
    });

    it('should update future quest', async () => {
      mockPrisma.futureQuest.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await cmsService.updateFutureQuest('1', { title: 'Updated' });

      expect(result.success).toBe(true);
    });

    it('should delete future quest', async () => {
      mockPrisma.futureQuest.delete.mockResolvedValue({ id: '1' });

      const result = await cmsService.deleteFutureQuest('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Case Studies', () => {
    it('should get all case studies', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([{ id: '1', title: 'Study 1' }]);

      const result = await cmsService.getAllCaseStudies();

      expect(result.success).toBe(true);
    });

    it('should get active case studies', async () => {
      mockPrisma.caseStudy.findMany.mockResolvedValue([{ id: '1', title: 'Study 1' }]);

      const result = await cmsService.getActiveCaseStudies();

      expect(result.success).toBe(true);
    });

    it('should get case study by slug', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue({ id: '1', title: 'Study 1' });

      const result = await cmsService.getCaseStudyBySlug('study-1');

      expect(result.success).toBe(true);
    });

    it('should return error when case study not found', async () => {
      mockPrisma.caseStudy.findUnique.mockResolvedValue(null);

      const result = await cmsService.getCaseStudyBySlug('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Case study not found');
    });

    it('should create case study', async () => {
      mockPrisma.caseStudy.create.mockResolvedValue({ id: '1', title: 'New Study' });

      const result = await cmsService.createCaseStudy({
        title: 'New Study',
        slug: 'new-study',
        client: 'Client Name',
        industry: 'Technology',
        description: 'Description',
        challenge: 'Challenge',
        solution: 'Solution',
        results: 'Results',
        technologies: ['React'],
        metrics: [{ label: 'ROI', value: '200%' }],
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.caseStudy.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          technologies: JSON.stringify(['React']),
          metrics: JSON.stringify([{ label: 'ROI', value: '200%' }]),
        }),
      });
    });

    it('should update case study', async () => {
      mockPrisma.caseStudy.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await cmsService.updateCaseStudy('1', { title: 'Updated' });

      expect(result.success).toBe(true);
    });

    it('should delete case study', async () => {
      mockPrisma.caseStudy.delete.mockResolvedValue({ id: '1' });

      const result = await cmsService.deleteCaseStudy('1');

      expect(result.success).toBe(true);
    });
  });

  describe('Blog Posts', () => {
    it('should get all blog posts', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([{ id: '1', title: 'Post 1' }]);

      const result = await cmsService.getAllBlogPosts();

      expect(result.success).toBe(true);
    });

    it('should get published blog posts', async () => {
      mockPrisma.blogPost.findMany.mockResolvedValue([{ id: '1', title: 'Post 1' }]);

      const result = await cmsService.getPublishedBlogPosts();

      expect(result.success).toBe(true);
      expect(mockPrisma.blogPost.findMany).toHaveBeenCalledWith({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
      });
    });

    it('should get blog post by slug', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue({ id: '1', title: 'Post 1' });

      const result = await cmsService.getBlogPostBySlug('post-1');

      expect(result.success).toBe(true);
    });

    it('should return error when blog post not found', async () => {
      mockPrisma.blogPost.findUnique.mockResolvedValue(null);

      const result = await cmsService.getBlogPostBySlug('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Blog post not found');
    });

    it('should create blog post', async () => {
      mockPrisma.blogPost.create.mockResolvedValue({ id: '1', title: 'New Post' });

      const result = await cmsService.createBlogPost({
        title: 'New Post',
        slug: 'new-post',
        excerpt: 'Excerpt',
        content: 'Content',
        category: 'Tech',
        tags: ['javascript', 'nodejs'],
        author: { name: 'John', role: 'Developer' },
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.blogPost.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tags: JSON.stringify(['javascript', 'nodejs']),
          author: JSON.stringify({ name: 'John', role: 'Developer' }),
        }),
      });
    });

    it('should update blog post', async () => {
      mockPrisma.blogPost.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await cmsService.updateBlogPost('1', { title: 'Updated' });

      expect(result.success).toBe(true);
    });

    it('should delete blog post', async () => {
      mockPrisma.blogPost.delete.mockResolvedValue({ id: '1' });

      const result = await cmsService.deleteBlogPost('1');

      expect(result.success).toBe(true);
    });
  });
});
