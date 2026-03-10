/**
 * ============================================================================
 * SERVICE CATEGORY REPOSITORY
 * ============================================================================
 * Data access layer for ServiceCategory entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type ServiceCategory = Prisma.ServiceCategoryGetPayload<{
  include: { services: true };
}>;
export type CreateServiceCategoryInput = Prisma.ServiceCategoryCreateInput;
export type UpdateServiceCategoryInput = Prisma.ServiceCategoryUpdateInput;
export type ServiceCategoryWhereUnique = Prisma.ServiceCategoryWhereUniqueInput;

/**
 * ServiceCategory Repository
 * Handles all database operations for service categories
 */
export class ServiceCategoryRepository extends BaseRepository<
  ServiceCategory,
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
  ServiceCategoryWhereUnique
> {
  protected modelName: keyof PrismaClient = 'serviceCategory';

  /**
   * Find category by slug with optional services
   */
  async findBySlug(slug: string, includeServices = false): Promise<ServiceCategory | null> {
    return this.model.findUnique({
      where: { slug },
      include: includeServices ? { services: { orderBy: { order: 'asc' } } } : undefined,
    });
  }

  /**
   * Find all active categories with their active services
   */
  async findActiveWithServices(): Promise<ServiceCategory[]> {
    return this.model.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Find all categories with services (admin view)
   */
  async findAllWithServices(): Promise<ServiceCategory[]> {
    return this.model.findMany({
      include: {
        services: {
          orderBy: { order: 'asc' },
        },
      },
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
   * Get the next order number
   */
  async getNextOrder(): Promise<number> {
    const result = await this.model.aggregate({
      _max: { order: true },
    });
    return (result._max.order || 0) + 1;
  }
}

export default ServiceCategoryRepository;
