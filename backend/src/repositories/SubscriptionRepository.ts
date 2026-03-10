/**
 * ============================================================================
 * SUBSCRIPTION REPOSITORY
 * ============================================================================
 * Data access layer for Subscription entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type Subscription = Prisma.SubscriptionGetPayload<{}>;
export type CreateSubscriptionInput = Prisma.SubscriptionCreateInput;
export type UpdateSubscriptionInput = Prisma.SubscriptionUpdateInput;
export type SubscriptionWhereUnique = Prisma.SubscriptionWhereUniqueInput;

/**
 * Subscription Repository
 * Handles all database operations for subscriptions
 */
export class SubscriptionRepository extends BaseRepository<
  Subscription,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionWhereUnique
> {
  protected modelName: keyof PrismaClient = 'subscription';

  /**
   * Find all subscriptions for a specific user with service included
   */
  async findByUserId(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<Subscription[]> {
    return this.model.findMany({
      where: { userId },
      orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
      skip: this.buildPagination(options?.pagination)?.skip,
      take: this.buildPagination(options?.pagination)?.take,
      include: { service: true },
    });
  }

  /**
   * Find subscription by ID with service details
   */
  async findByIdWithDetails(id: string): Promise<Subscription | null> {
    return this.model.findUnique({
      where: { id },
      include: { service: true },
    });
  }

  /**
   * Create subscription with default period dates
   */
  async createSubscription(data: {
    userId: string;
    serviceId: string;
    planName: string;
    price: number;
    billingCycle?: string;
    status?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }): Promise<Subscription> {
    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.model.create({
      data: {
        ...data,
        billingCycle: data.billingCycle || 'monthly',
        status: data.status || 'active',
        currentPeriodStart: data.currentPeriodStart || now,
        currentPeriodEnd: data.currentPeriodEnd || thirtyDaysLater,
      },
      include: { service: true },
    });
  }

  /**
   * Cancel subscription by setting status and cancelledAt
   */
  async cancel(id: string): Promise<Subscription> {
    return this.model.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
      include: { service: true },
    });
  }

  /**
   * Find active subscriptions for a user
   */
  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    return this.model.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    });
  }

  /**
   * Find paginated subscriptions for a user
   */
  async findByUserIdPaginated(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<PaginatedResult<Subscription>> {
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: { userId },
        orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
        skip,
        take: limit,
        include: { service: true },
      }),
      this.model.count({ where: { userId } }),
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
}

export default SubscriptionRepository;
