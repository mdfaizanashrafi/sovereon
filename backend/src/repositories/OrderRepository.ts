/**
 * ============================================================================
 * ORDER REPOSITORY
 * ============================================================================
 * Data access layer for Order entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type Order = Prisma.OrderGetPayload<{}>;
export type CreateOrderInput = Prisma.OrderCreateInput;
export type UpdateOrderInput = Prisma.OrderUpdateInput;
export type OrderWhereUnique = Prisma.OrderWhereUniqueInput;

/**
 * Order Repository
 * Handles all database operations for orders
 */
export class OrderRepository extends BaseRepository<
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderWhereUnique
> {
  protected modelName: keyof PrismaClient = 'order';

  /**
   * Find all orders for a specific user with service included
   */
  async findByUserId(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<Order[]> {
    return this.model.findMany({
      where: { userId },
      orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
      skip: this.buildPagination(options?.pagination)?.skip,
      take: this.buildPagination(options?.pagination)?.take,
      include: { service: true },
    });
  }

  /**
   * Find order by ID with details (service and invoice)
   */
  async findByIdWithDetails(id: string): Promise<Order | null> {
    return this.model.findUnique({
      where: { id },
      include: { service: true, invoice: true },
    });
  }

  /**
   * Find paginated orders for a user
   */
  async findByUserIdPaginated(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<PaginatedResult<Order>> {
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

  /**
   * Create order with order number generation
   */
  async createOrder(data: {
    userId: string;
    serviceId: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    status?: string;
  }): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return this.model.create({
      data: {
        ...data,
        orderNumber,
        status: data.status || 'pending',
      },
      include: { service: true },
    });
  }
}

export default OrderRepository;
