/**
 * ============================================================================
 * SERVICE CMS REPOSITORY
 * ============================================================================
 * Data access layer for ServiceCMS entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type ServiceCMS = Prisma.ServiceCMSGetPayload<{
  include: { category: true };
}>;
export type CreateServiceCMSInput = Prisma.ServiceCMSUncheckedCreateInput;
export type UpdateServiceCMSInput = Prisma.ServiceCMSUncheckedUpdateInput;
export type ServiceCMSWhereUnique = Prisma.ServiceCMSWhereUniqueInput;

/**
 * ServiceCMS Repository
 * Handles all database operations for service content
 */
export class ServiceCMSRepository extends BaseRepository<
  ServiceCMS,
  CreateServiceCMSInput,
  UpdateServiceCMSInput,
  ServiceCMSWhereUnique
> {
  protected modelName: keyof PrismaClient = 'serviceCMS';

  /**
   * Find service by slug with category
   */
  async findBySlug(slug: string): Promise<ServiceCMS | null> {
    return this.model.findUnique({
      where: { slug },
      include: { category: true },
    });
  }

  /**
   * Find all active services with their categories
   */
  async findActiveWithCategory(): Promise<ServiceCMS[]> {
    return this.model.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Find services by category ID
   */
  async findByCategory(categoryId: string, activeOnly = true): Promise<ServiceCMS[]> {
    const filters: any = { categoryId };
    if (activeOnly) filters.isActive = true;

    return this.findAll({
      filters,
      sort: { field: 'order', direction: 'asc' },
      include: { category: true },
    });
  }

  /**
   * Find services by category slug
   */
  async findByCategorySlug(categorySlug: string, activeOnly = true): Promise<ServiceCMS[]> {
    return this.model.findMany({
      where: {
        isActive: activeOnly ? true : undefined,
        category: { slug: categorySlug },
      },
      include: { category: true },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Check if slug is already in use
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Get the next order number for a category
   */
  async getNextOrderForCategory(categoryId: string): Promise<number> {
    const result = await this.model.aggregate({
      where: { categoryId },
      _max: { order: true },
    });
    return (result._max.order || 0) + 1;
  }

  /**
   * Search services by title or description
   */
  async search(query: string, activeOnly = true): Promise<ServiceCMS[]> {
    const filters: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { fullDescription: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (activeOnly) filters.isActive = true;

    return this.findAll({
      filters,
      sort: { field: 'order', direction: 'asc' },
      include: { category: true },
    });
  }
}

export default ServiceCMSRepository;
