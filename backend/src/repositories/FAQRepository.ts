/**
 * ============================================================================
 * FAQ REPOSITORY
 * ============================================================================
 * Data access layer for FAQ entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type FAQ = Prisma.FAQGetPayload<{}>;
export type CreateFAQInput = Prisma.FAQCreateInput;
export type UpdateFAQInput = Prisma.FAQUpdateInput;
export type FAQWhereUnique = Prisma.FAQWhereUniqueInput;

/**
 * FAQ Repository
 * Handles all database operations for FAQs
 */
export class FAQRepository extends BaseRepository<
  FAQ,
  CreateFAQInput,
  UpdateFAQInput,
  FAQWhereUnique
> {
  protected modelName: keyof PrismaClient = 'fAQ';

  /**
   * Find all active FAQs
   */
  async findActive(options?: Omit<QueryOptions, 'filters'>): Promise<FAQ[]> {
    return this.findAll({
      ...options,
      filters: { isActive: true },
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Find FAQs by category
   */
  async findByCategory(category: string, activeOnly = true): Promise<FAQ[]> {
    const filters: any = { category };
    if (activeOnly) filters.isActive = true;

    return this.findAll({
      filters,
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Get unique categories
   */
  async getCategories(): Promise<string[]> {
    const results = await this.model.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });
    return results.map((r: { category: string }) => r.category);
  }

  /**
   * Search FAQs by question or answer
   */
  async search(query: string, activeOnly = true): Promise<FAQ[]> {
    const filters: any = {
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (activeOnly) filters.isActive = true;

    return this.findAll({
      filters,
      sort: { field: 'order', direction: 'asc' },
    });
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

export default FAQRepository;
