/**
 * CMS Service
 * Business logic for content management
 */

import { PrismaClient } from '@prisma/client';
import { formatResponse } from '../utils/errors';

const prisma = new PrismaClient();

// ============================================================================
// TEAM MEMBERS
// ============================================================================

export async function getAllTeamMembers() {
  const members = await prisma.teamMember.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, members);
}

export async function getActiveTeamMembers() {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, members);
}

export async function createTeamMember(data: {
  name: string;
  role: string;
  department: string;
  description: string;
  image?: string;
  order?: number;
}) {
  const member = await prisma.teamMember.create({ data });
  return formatResponse(true, member);
}

export async function updateTeamMember(
  id: string,
  data: Partial<{
    name: string;
    role: string;
    department: string;
    description: string;
    image: string;
    order: number;
    isActive: boolean;
  }>
) {
  const member = await prisma.teamMember.update({
    where: { id },
    data,
  });
  return formatResponse(true, member);
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } });
  return formatResponse(true, { message: 'Team member deleted' });
}

// ============================================================================
// SERVICE CATEGORIES
// ============================================================================

export async function getAllServiceCategories() {
  const categories = await prisma.serviceCategory.findMany({
    include: { services: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, categories);
}

export async function getActiveServiceCategories() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, categories);
}

export async function createServiceCategory(data: {
  slug: string;
  title: string;
  description: string;
  order?: number;
}) {
  const category = await prisma.serviceCategory.create({ data });
  return formatResponse(true, category);
}

export async function updateServiceCategory(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    description: string;
    order: number;
    isActive: boolean;
  }>
) {
  const category = await prisma.serviceCategory.update({
    where: { id },
    data,
  });
  return formatResponse(true, category);
}

export async function deleteServiceCategory(id: string) {
  await prisma.serviceCategory.delete({ where: { id } });
  return formatResponse(true, { message: 'Service category deleted' });
}

// ============================================================================
// SERVICES
// ============================================================================

export async function getAllServices() {
  const services = await prisma.serviceCMS.findMany({
    include: { category: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, services);
}

export async function getServiceBySlug(slug: string) {
  const service = await prisma.serviceCMS.findUnique({
    where: { slug },
    include: { category: true },
  });
  return formatResponse(true, service);
}

export async function createService(data: {
  slug: string;
  title: string;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  benefits: string[];
  strategy: { step: number; title: string; description: string }[];
  order?: number;
}) {
  const service = await prisma.serviceCMS.create({
    data: {
      ...data,
      features: JSON.stringify(data.features),
      benefits: JSON.stringify(data.benefits),
      strategy: JSON.stringify(data.strategy),
    },
  });
  return formatResponse(true, service);
}

export async function updateService(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    categoryId: string;
    shortDescription: string;
    fullDescription: string;
    features: string[];
    benefits: string[];
    strategy: { step: number; title: string; description: string }[];
    order: number;
    isActive: boolean;
  }>
) {
  const updateData: any = { ...data };
  if (data.features) updateData.features = JSON.stringify(data.features);
  if (data.benefits) updateData.benefits = JSON.stringify(data.benefits);
  if (data.strategy) updateData.strategy = JSON.stringify(data.strategy);

  const service = await prisma.serviceCMS.update({
    where: { id },
    data: updateData,
  });
  return formatResponse(true, service);
}

export async function deleteService(id: string) {
  await prisma.serviceCMS.delete({ where: { id } });
  return formatResponse(true, { message: 'Service deleted' });
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

export async function getAllTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, testimonials);
}

export async function getActiveTestimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, testimonials);
}

export async function createTestimonial(data: {
  name: string;
  company: string;
  role: string;
  content: string;
  rating?: number;
  avatar?: string;
  beforeMetric?: string;
  afterMetric?: string;
  order?: number;
}) {
  const testimonial = await prisma.testimonial.create({ data });
  return formatResponse(true, testimonial);
}

export async function updateTestimonial(
  id: string,
  data: Partial<{
    name: string;
    company: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
    beforeMetric: string;
    afterMetric: string;
    order: number;
    isActive: boolean;
  }>
) {
  const testimonial = await prisma.testimonial.update({
    where: { id },
    data,
  });
  return formatResponse(true, testimonial);
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } });
  return formatResponse(true, { message: 'Testimonial deleted' });
}

// ============================================================================
// FAQS
// ============================================================================

export async function getAllFAQs() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, faqs);
}

export async function getActiveFAQs() {
  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, faqs);
}

export async function createFAQ(data: {
  question: string;
  answer: string;
  category: string;
  order?: number;
}) {
  const faq = await prisma.fAQ.create({ data });
  return formatResponse(true, faq);
}

export async function updateFAQ(
  id: string,
  data: Partial<{
    question: string;
    answer: string;
    category: string;
    order: number;
    isActive: boolean;
  }>
) {
  const faq = await prisma.fAQ.update({
    where: { id },
    data,
  });
  return formatResponse(true, faq);
}

export async function deleteFAQ(id: string) {
  await prisma.fAQ.delete({ where: { id } });
  return formatResponse(true, { message: 'FAQ deleted' });
}

// ============================================================================
// PAGE CONTENT
// ============================================================================

export async function getPageContent(page: string, section: string) {
  const content = await prisma.pageContent.findUnique({
    where: { page_section: { page, section } },
  });
  return formatResponse(true, content);
}

export async function getAllPageContents() {
  const contents = await prisma.pageContent.findMany({
    orderBy: [{ page: 'asc' }, { section: 'asc' }],
  });
  return formatResponse(true, contents);
}

export async function updatePageContent(
  page: string,
  section: string,
  content: string
) {
  const existing = await prisma.pageContent.findUnique({
    where: { page_section: { page, section } },
  });

  if (existing) {
    const updated = await prisma.pageContent.update({
      where: { page_section: { page, section } },
      data: { content },
    });
    return formatResponse(true, updated);
  } else {
    const created = await prisma.pageContent.create({
      data: { page, section, content },
    });
    return formatResponse(true, created);
  }
}

// ============================================================================
// GLOBAL SETTINGS
// ============================================================================

export async function getAllGlobalSettings() {
  const settings = await prisma.globalSetting.findMany({
    orderBy: { key: 'asc' },
  });
  return formatResponse(true, settings);
}

export async function getGlobalSetting(key: string) {
  const setting = await prisma.globalSetting.findUnique({
    where: { key },
  });
  return formatResponse(true, setting);
}

export async function updateGlobalSetting(key: string, value: string) {
  const existing = await prisma.globalSetting.findUnique({
    where: { key },
  });

  if (existing) {
    const updated = await prisma.globalSetting.update({
      where: { key },
      data: { value },
    });
    return formatResponse(true, updated);
  } else {
    const created = await prisma.globalSetting.create({
      data: { key, value },
    });
    return formatResponse(true, created);
  }
}

export async function updateMultipleGlobalSettings(
  settings: { key: string; value: string }[]
) {
  const results = await Promise.all(
    settings.map(async ({ key, value }) => {
      const existing = await prisma.globalSetting.findUnique({
        where: { key },
      });

      if (existing) {
        return prisma.globalSetting.update({
          where: { key },
          data: { value },
        });
      } else {
        return prisma.globalSetting.create({
          data: { key, value },
        });
      }
    })
  );

  return formatResponse(true, results);
}

// ============================================================================
// CURRENT PROJECTS
// ============================================================================

export async function getAllCurrentProjects() {
  const projects = await prisma.currentProject.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, projects);
}

export async function getActiveCurrentProjects() {
  const projects = await prisma.currentProject.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, projects);
}

export async function createCurrentProject(data: {
  title: string;
  description: string;
  progress?: number;
  image?: string;
  technologies: string[];
  order?: number;
}) {
  const project = await prisma.currentProject.create({
    data: {
      ...data,
      technologies: JSON.stringify(data.technologies),
    },
  });
  return formatResponse(true, project);
}

export async function updateCurrentProject(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    progress: number;
    image: string;
    technologies: string[];
    order: number;
    isActive: boolean;
  }>
) {
  const updateData: any = { ...data };
  if (data.technologies)
    updateData.technologies = JSON.stringify(data.technologies);

  const project = await prisma.currentProject.update({
    where: { id },
    data: updateData,
  });
  return formatResponse(true, project);
}

export async function deleteCurrentProject(id: string) {
  await prisma.currentProject.delete({ where: { id } });
  return formatResponse(true, { message: 'Project deleted' });
}

// ============================================================================
// FUTURE QUESTS
// ============================================================================

export async function getAllFutureQuests() {
  const quests = await prisma.futureQuest.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, quests);
}

export async function getActiveFutureQuests() {
  const quests = await prisma.futureQuest.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, quests);
}

export async function createFutureQuest(data: {
  title: string;
  description: string;
  timeline: string;
  icon: string;
  order?: number;
}) {
  const quest = await prisma.futureQuest.create({ data });
  return formatResponse(true, quest);
}

export async function updateFutureQuest(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    timeline: string;
    icon: string;
    order: number;
    isActive: boolean;
  }>
) {
  const quest = await prisma.futureQuest.update({
    where: { id },
    data,
  });
  return formatResponse(true, quest);
}

export async function deleteFutureQuest(id: string) {
  await prisma.futureQuest.delete({ where: { id } });
  return formatResponse(true, { message: 'Future quest deleted' });
}
// ============================================================================
// CASE STUDIES
// ============================================================================

export async function getAllCaseStudies() {
  const caseStudies = await prisma.caseStudy.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, caseStudies);
}

export async function getActiveCaseStudies() {
  const caseStudies = await prisma.caseStudy.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, caseStudies);
}

export async function getCaseStudyBySlug(slug: string) {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { slug },
  });
  if (!caseStudy) {
    return formatResponse(false, null, 'Case study not found');
  }
  return formatResponse(true, caseStudy);
}

export async function createCaseStudy(data: {
  title: string;
  slug: string;
  client: string;
  industry: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  image?: string;
  technologies: string[];
  metrics: Array<{ label: string; value: string }>;
  testimonial?: { quote: string; author: string; role: string };
  order?: number;
}) {
  const caseStudy = await prisma.caseStudy.create({
    data: {
      ...data,
      technologies: JSON.stringify(data.technologies),
      metrics: JSON.stringify(data.metrics),
      testimonial: data.testimonial ? JSON.stringify(data.testimonial) : null,
    },
  });
  return formatResponse(true, caseStudy);
}

export async function updateCaseStudy(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    client: string;
    industry: string;
    description: string;
    challenge: string;
    solution: string;
    results: string;
    image: string;
    technologies: string[];
    metrics: Array<{ label: string; value: string }>;
    testimonial: { quote: string; author: string; role: string } | null;
    order: number;
    isActive: boolean;
  }>
) {
  const updateData: any = { ...data };
  if (data.technologies) updateData.technologies = JSON.stringify(data.technologies);
  if (data.metrics) updateData.metrics = JSON.stringify(data.metrics);
  if (data.testimonial !== undefined) updateData.testimonial = data.testimonial ? JSON.stringify(data.testimonial) : null;

  const caseStudy = await prisma.caseStudy.update({
    where: { id },
    data: updateData,
  });
  return formatResponse(true, caseStudy);
}

export async function deleteCaseStudy(id: string) {
  await prisma.caseStudy.delete({ where: { id } });
  return formatResponse(true, { message: 'Case study deleted' });
}

// ============================================================================
// BLOG POSTS
// ============================================================================

export async function getAllBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { order: 'asc' },
  });
  return formatResponse(true, posts);
}

export async function getPublishedBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  });
  return formatResponse(true, posts);
}

export async function getBlogPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });
  if (!post) {
    return formatResponse(false, null, 'Blog post not found');
  }
  return formatResponse(true, post);
}

export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  category: string;
  tags: string[];
  author: { name: string; role: string };
  publishedAt?: Date;
  order?: number;
}) {
  const post = await prisma.blogPost.create({
    data: {
      ...data,
      tags: JSON.stringify(data.tags),
      author: JSON.stringify(data.author),
    },
  });
  return formatResponse(true, post);
}

export async function updateBlogPost(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    tags: string[];
    author: { name: string; role: string };
    publishedAt: Date | null;
    isPublished: boolean;
    order: number;
  }>
) {
  const updateData: any = { ...data };
  if (data.tags) updateData.tags = JSON.stringify(data.tags);
  if (data.author) updateData.author = JSON.stringify(data.author);

  const post = await prisma.blogPost.update({
    where: { id },
    data: updateData,
  });
  return formatResponse(true, post);
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.delete({ where: { id } });
  return formatResponse(true, { message: 'Blog post deleted' });
}
