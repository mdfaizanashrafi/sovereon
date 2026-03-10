/**
 * ============================================================================
 * BASE REPOSITORY - Generic CRUD Operations
 * ============================================================================
 * Abstract base class for all repositories.
 * Provides standardized CRUD operations and query building.
 */

import type { PrismaClient, Prisma } from '@prisma/client';
import { getPrismaClient } from '../database/client';

/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Sort options for list queries
 */
export interface SortOptions {
  field: string;
  direction?: 'asc' | 'desc';
}

/**
 * Filter options for list queries
 */
export interface FilterOptions {
  [key: string]: any;
}

/**
 * Query options for list operations
 */
export interface QueryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions | SortOptions[];
  filters?: FilterOptions;
  include?: Record<string, any>;
  select?: Record<string, any>;
}

/**
 * Paginated response structure
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Abstract Base Repository Class
 * All entity repositories should extend this class
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput, WhereUniqueInput> {
  protected prisma: PrismaClient;
  protected abstract modelName: keyof PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || getPrismaClient();
  }

  /**
   * Get the Prisma model delegate
   */
  protected get model(): any {
    return this.prisma[this.modelName];
  }

  /**
   * Find a single record by unique identifier
   */
  async findById(id: string, options?: { include?: Record<string, any> }): Promise<T | null> {
    return this.model.findUnique({
      where: { id } as WhereUniqueInput,
      include: options?.include,
    });
  }

  /**
   * Find a single record by any unique field
   */
  async findUnique(where: WhereUniqueInput, options?: { include?: Record<string, any> }): Promise<T | null> {
    return this.model.findUnique({
      where,
      include: options?.include,
    });
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(where: FilterOptions, options?: { include?: Record<string, any> }): Promise<T | null> {
    return this.model.findFirst({
      where,
      include: options?.include,
    });
  }

  /**
   * Find all records with optional filtering, sorting, and pagination
   */
  async findAll(options?: QueryOptions): Promise<T[]> {
    const { pagination, sort, filters, include } = this.buildQueryOptions(options);

    return this.model.findMany({
      where: filters,
      orderBy: sort,
      skip: pagination?.skip,
      take: pagination?.take,
      include,
    });
  }

  /**
   * Find all records with pagination metadata
   */
  async findPaginated(options?: QueryOptions): Promise<PaginatedResult<T>> {
    const { pagination, sort, filters, include } = this.buildQueryOptions(options);
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 20;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: filters,
        orderBy: sort,
        skip: pagination?.skip,
        take: pagination?.take,
        include,
      }),
      this.model.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create a new record
   */
  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * Create multiple records
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    return this.model.createMany({ data });
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { id } as WhereUniqueInput,
      data,
    });
  }

  /**
   * Update a record by unique criteria
   */
  async updateWhere(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.model.update({ where, data });
  }

  /**
   * Update many records matching criteria
   */
  async updateMany(where: FilterOptions, data: UpdateInput): Promise<{ count: number }> {
    return this.model.updateMany({ where, data });
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id } as WhereUniqueInput,
    });
  }

  /**
   * Delete a record by unique criteria
   */
  async deleteWhere(where: WhereUniqueInput): Promise<T> {
    return this.model.delete({ where });
  }

  /**
   * Delete many records matching criteria
   */
  async deleteMany(where: FilterOptions): Promise<{ count: number }> {
    return this.model.deleteMany({ where });
  }

  /**
   * Count records matching criteria
   */
  async count(where?: FilterOptions): Promise<number> {
    return this.model.count({ where });
  }

  /**
   * Check if a record exists
   */
  async exists(where: FilterOptions): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(fn);
  }

  /**
   * Build query options from input
   */
  protected buildQueryOptions(options?: QueryOptions) {
    const pagination = this.buildPagination(options?.pagination);
    const sort = this.buildSort(options?.sort);
    const filters = options?.filters || {};
    const include = options?.include;

    return { pagination, sort, filters, include };
  }

  /**
   * Build pagination parameters
   */
  protected buildPagination(pagination?: PaginationOptions) {
    if (!pagination) return undefined;

    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
  }

  /**
   * Build sort parameters
   */
  protected buildSort(sort?: SortOptions | SortOptions[]): any {
    if (!sort) return undefined;

    if (Array.isArray(sort)) {
      return sort.map(s => ({ [s.field]: s.direction || 'asc' }));
    }

    return { [sort.field]: sort.direction || 'asc' };
  }
}

export default BaseRepository;
