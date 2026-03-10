/**
 * ============================================================================
 * SERVICE REPOSITORY
 * ============================================================================
 * Data access layer for Service entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type Service = Prisma.ServiceGetPayload<{}>;
export type CreateServiceInput = Prisma.ServiceCreateInput;
export type UpdateServiceInput = Prisma.ServiceUpdateInput;
export type ServiceWhereUnique = Prisma.ServiceWhereUniqueInput;

/**
 * Service Repository
 * Handles all database operations for services
 */
export class ServiceRepository extends BaseRepository<
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceWhereUnique
> {
  protected modelName: keyof PrismaClient = 'service';

  /**
   * Find service by slug
   */
  async findBySlug(slug: string): Promise<Service | null> {
    return this.model.findUnique({
      where: { slug },
    });
  }

  /**
   * Find all active services
   */
  async findActive(options?: Omit<QueryOptions, 'filters'>): Promise<Service[]> {
    return this.findAll({
      ...options,
      filters: { isActive: true },
    });
  }

  /**
   * Find services by category
   */
  async findByCategory(category: string, activeOnly = true): Promise<Service[]> {
    const filters: any = { category };
    if (activeOnly) filters.isActive = true;

    return this.findAll({
      filters,
    });
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }
}

export default ServiceRepository;
