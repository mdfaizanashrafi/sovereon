/**
 * ============================================================================
 * INVOICE REPOSITORY
 * ============================================================================
 * Data access layer for Invoice entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type Invoice = Prisma.InvoiceGetPayload<{}>;
export type CreateInvoiceInput = Prisma.InvoiceCreateInput;
export type UpdateInvoiceInput = Prisma.InvoiceUpdateInput;
export type InvoiceWhereUnique = Prisma.InvoiceWhereUniqueInput;

/**
 * Invoice Repository
 * Handles all database operations for invoices
 */
export class InvoiceRepository extends BaseRepository<
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceWhereUnique
> {
  protected modelName: keyof PrismaClient = 'invoice';

  /**
   * Find all invoices for a specific user with order included
   */
  async findByUserId(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<Invoice[]> {
    return this.model.findMany({
      where: { userId },
      orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
      skip: this.buildPagination(options?.pagination)?.skip,
      take: this.buildPagination(options?.pagination)?.take,
      include: { order: true },
    });
  }

  /**
   * Find invoice by ID with order details
   */
  async findByIdWithDetails(id: string): Promise<Invoice | null> {
    return this.model.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  /**
   * Create invoice with invoice number generation
   */
  async createInvoice(data: {
    userId: string;
    orderId: string;
    amount: number;
    tax?: number;
    status?: string;
    dueDate?: Date;
  }): Promise<Invoice> {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tax = data.tax || 0;
    
    return this.model.create({
      data: {
        ...data,
        invoiceNumber,
        tax,
        total: data.amount + tax,
        status: data.status || 'draft',
        issuedDate: new Date(),
        dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: { order: true },
    });
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(id: string): Promise<Invoice> {
    return this.model.update({
      where: { id },
      data: { status: 'paid', paidDate: new Date() },
    });
  }

  /**
   * Find paginated invoices for a user
   */
  async findByUserIdPaginated(userId: string, options?: Omit<QueryOptions, 'filters'>): Promise<PaginatedResult<Invoice>> {
    const page = options?.pagination?.page || 1;
    const limit = options?.pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: { userId },
        orderBy: this.buildSort(options?.sort) || { createdAt: 'desc' },
        skip,
        take: limit,
        include: { order: true },
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

export default InvoiceRepository;
