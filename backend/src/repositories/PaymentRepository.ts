/**
 * ============================================================================
 * PAYMENT REPOSITORY
 * ============================================================================
 * Data access layer for Payment entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type Payment = Prisma.PaymentGetPayload<{}>;
export type CreatePaymentInput = Prisma.PaymentCreateInput;
export type UpdatePaymentInput = Prisma.PaymentUpdateInput;
export type PaymentWhereUnique = Prisma.PaymentWhereUniqueInput;

/**
 * Payment Repository
 * Handles all database operations for payments
 */
export class PaymentRepository extends BaseRepository<
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentWhereUnique
> {
  protected modelName: keyof PrismaClient = 'payment';

  /**
   * Find all payments for a specific user with invoice and order included
   */
  async findByUserId(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<Payment[]> {
    return this.model.findMany({
      where: { userId },
      orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
      skip: this.buildPagination(options?.pagination)?.skip,
      take: this.buildPagination(options?.pagination)?.take,
      include: { invoice: true, order: true },
    });
  }

  /**
   * Find payment by ID with details (invoice and order)
   */
  async findByIdWithDetails(id: string): Promise<Payment | null> {
    return this.model.findUnique({
      where: { id },
      include: { invoice: true, order: true },
    });
  }

  /**
   * Create payment and optionally update invoice status
   */
  async createPayment(data: {
    userId: string;
    invoiceId?: string;
    orderId?: string;
    amount: number;
    paymentMethod?: string;
    status?: string;
    currency?: string;
  }): Promise<Payment> {
    return this.model.create({
      data: {
        ...data,
        paymentMethod: data.paymentMethod || 'credit_card',
        status: data.status || 'succeeded',
        currency: data.currency || 'USD',
      },
    });
  }

  /**
   * Create payment and update invoice status in a transaction
   */
  async createPaymentAndUpdateInvoice(data: {
    userId: string;
    invoiceId?: string;
    orderId?: string;
    amount: number;
    paymentMethod?: string;
    status?: string;
    currency?: string;
  }): Promise<Payment> {
    return this.transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          userId: data.userId,
          invoiceId: data.invoiceId,
          orderId: data.orderId,
          amount: data.amount,
          paymentMethod: data.paymentMethod || 'credit_card',
          status: data.status || 'succeeded',
          currency: data.currency || 'USD',
        },
      });

      // Update invoice status if payment succeeded and invoiceId is provided
      if (data.invoiceId && payment.status === 'succeeded') {
        await prisma.invoice.update({
          where: { id: data.invoiceId },
          data: { status: 'paid', paidDate: new Date() },
        });
      }

      return payment;
    });
  }

  /**
   * Find paginated payments for a user
   */
  async findByUserIdPaginated(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<PaginatedResult<Payment>> {
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: { userId },
        orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
        skip,
        take: limit,
        include: { invoice: true, order: true },
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

export default PaymentRepository;
