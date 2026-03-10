/**
 * ============================================================================
 * TESTIMONIAL REPOSITORY
 * ============================================================================
 * Data access layer for Testimonial entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type Testimonial = Prisma.TestimonialGetPayload<{}>;
export type CreateTestimonialInput = Prisma.TestimonialCreateInput;
export type UpdateTestimonialInput = Prisma.TestimonialUpdateInput;
export type TestimonialWhereUnique = Prisma.TestimonialWhereUniqueInput;

/**
 * Testimonial Repository
 * Handles all database operations for testimonials
 */
export class TestimonialRepository extends BaseRepository<
  Testimonial,
  CreateTestimonialInput,
  UpdateTestimonialInput,
  TestimonialWhereUnique
> {
  protected modelName: keyof PrismaClient = 'testimonial';

  /**
   * Find all active testimonials
   */
  async findActive(options?: Omit<QueryOptions, 'filters'>): Promise<Testimonial[]> {
    return this.findAll({
      ...options,
      filters: { isActive: true },
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Find paginated active testimonials
   */
  async findActivePaginated(options?: Omit<QueryOptions, 'filters'>): Promise<PaginatedResult<Testimonial>> {
    return this.findPaginated({
      ...options,
      filters: { isActive: true },
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Find featured testimonials (highest rated)
   */
  async findFeatured(limit = 3): Promise<Testimonial[]> {
    return this.model.findMany({
      where: { isActive: true },
      orderBy: [{ rating: 'desc' }, { order: 'asc' }],
      take: limit,
    });
  }

  /**
   * Get average rating
   */
  async getAverageRating(): Promise<number> {
    const result = await this.model.aggregate({
      where: { isActive: true },
      _avg: { rating: true },
    });
    return result._avg.rating || 0;
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

export default TestimonialRepository;
