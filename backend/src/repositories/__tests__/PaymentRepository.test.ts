/**
 * ============================================================================
 * PAYMENT REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentRepository } from '../PaymentRepository';

const mockPrismaClient = {
  payment: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  invoice: {
    update: vi.fn(),
  },
  $transaction: vi.fn(async (fn) => {
    const txClient = {
      payment: mockPrismaClient.payment,
      invoice: mockPrismaClient.invoice,
    };
    return await fn(txClient);
  }),
};

describe('PaymentRepository', () => {
  let repository: PaymentRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PaymentRepository(mockPrismaClient as any);
  });

  describe('findByUserId', () => {
    it('should find payments by user ID with invoice and order', async () => {
      const mockPayments = [
        {
          id: 'pay-1',
          userId: 'user-1',
          invoice: { id: 'inv-1' },
          order: { id: 'order-1' },
        },
      ];
      mockPrismaClient.payment.findMany.mockResolvedValue(mockPayments);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual(mockPayments);
      expect(mockPrismaClient.payment.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
        include: { invoice: true, order: true },
      });
    });

    it('should apply pagination and sorting', async () => {
      const mockPayments = [{ id: 'pay-1' }];
      mockPrismaClient.payment.findMany.mockResolvedValue(mockPayments);

      await repository.findByUserId('user-1', {
        pagination: { page: 1, limit: 10 },
        sort: { field: 'amount', direction: 'desc' },
      });

      expect(mockPrismaClient.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { amount: 'desc' },
        })
      );
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find payment by ID with invoice and order', async () => {
      const mockPayment = {
        id: 'pay-1',
        invoice: { id: 'inv-1' },
        order: { id: 'order-1' },
      };
      mockPrismaClient.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await repository.findByIdWithDetails('pay-1');

      expect(result).toEqual(mockPayment);
      expect(mockPrismaClient.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'pay-1' },
        include: { invoice: true, order: true },
      });
    });

    it('should return null when payment not found', async () => {
      mockPrismaClient.payment.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithDetails('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createPayment', () => {
    it('should create payment with default values', async () => {
      const mockPayment = {
        id: 'pay-1',
        userId: 'user-1',
        amount: 100,
        paymentMethod: 'credit_card',
        status: 'succeeded',
        currency: 'USD',
      };
      mockPrismaClient.payment.create.mockResolvedValue(mockPayment);

      const result = await repository.createPayment({
        userId: 'user-1',
        amount: 100,
      });

      expect(result).toEqual(mockPayment);
      expect(mockPrismaClient.payment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          amount: 100,
          paymentMethod: 'credit_card',
          status: 'succeeded',
          currency: 'USD',
        },
      });
    });

    it('should allow custom values', async () => {
      mockPrismaClient.payment.create.mockResolvedValue({ id: 'pay-1' });

      await repository.createPayment({
        userId: 'user-1',
        invoiceId: 'inv-1',
        orderId: 'order-1',
        amount: 200,
        paymentMethod: 'paypal',
        status: 'pending',
        currency: 'EUR',
      });

      expect(mockPrismaClient.payment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          invoiceId: 'inv-1',
          orderId: 'order-1',
          amount: 200,
          paymentMethod: 'paypal',
          status: 'pending',
          currency: 'EUR',
        },
      });
    });
  });

  describe('createPaymentAndUpdateInvoice', () => {
    it('should create payment and update invoice status in transaction', async () => {
      const mockPayment = {
        id: 'pay-1',
        userId: 'user-1',
        invoiceId: 'inv-1',
        status: 'succeeded',
      };
      mockPrismaClient.payment.create.mockResolvedValue(mockPayment);
      mockPrismaClient.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'paid' });

      const result = await repository.createPaymentAndUpdateInvoice({
        userId: 'user-1',
        invoiceId: 'inv-1',
        amount: 100,
        status: 'succeeded',
      });

      expect(result).toEqual(mockPayment);
      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
    });

    it('should not update invoice if payment not succeeded', async () => {
      const mockPayment = {
        id: 'pay-1',
        userId: 'user-1',
        invoiceId: 'inv-1',
        status: 'failed',
      };
      mockPrismaClient.payment.create.mockResolvedValue(mockPayment);

      await repository.createPaymentAndUpdateInvoice({
        userId: 'user-1',
        invoiceId: 'inv-1',
        amount: 100,
        status: 'failed',
      });

      expect(mockPrismaClient.invoice.update).not.toHaveBeenCalled();
    });

    it('should not update invoice if no invoiceId provided', async () => {
      const mockPayment = {
        id: 'pay-1',
        userId: 'user-1',
        status: 'succeeded',
      };
      mockPrismaClient.payment.create.mockResolvedValue(mockPayment);

      await repository.createPaymentAndUpdateInvoice({
        userId: 'user-1',
        orderId: 'order-1',
        amount: 100,
        status: 'succeeded',
      });

      expect(mockPrismaClient.invoice.update).not.toHaveBeenCalled();
    });
  });

  describe('findByUserIdPaginated', () => {
    it('should return paginated payments', async () => {
      const mockPayments = [{ id: 'pay-1' }, { id: 'pay-2' }];
      mockPrismaClient.payment.findMany.mockResolvedValue(mockPayments);
      mockPrismaClient.payment.count.mockResolvedValue(20);

      const result = await repository.findByUserIdPaginated('user-1', {
        pagination: { page: 1, limit: 2 },
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(20);
      expect(result.meta.totalPages).toBe(10);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });
  });

  describe('inherited CRUD operations', () => {
    it('should find by ID', async () => {
      const mockPayment = { id: 'pay-1' };
      mockPrismaClient.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await repository.findById('pay-1');

      expect(result).toEqual(mockPayment);
    });

    it('should find all', async () => {
      const mockPayments = [{ id: 'pay-1' }];
      mockPrismaClient.payment.findMany.mockResolvedValue(mockPayments);

      const result = await repository.findAll();

      expect(result).toEqual(mockPayments);
    });

    it('should update payment', async () => {
      const mockPayment = { id: 'pay-1', status: 'refunded' };
      mockPrismaClient.payment.update.mockResolvedValue(mockPayment);

      const result = await repository.update('pay-1', { status: 'refunded' } as any);

      expect(result).toEqual(mockPayment);
    });

    it('should delete payment', async () => {
      const mockPayment = { id: 'pay-1' };
      mockPrismaClient.payment.delete.mockResolvedValue(mockPayment);

      const result = await repository.delete('pay-1');

      expect(result).toEqual(mockPayment);
    });

    it('should count payments', async () => {
      mockPrismaClient.payment.count.mockResolvedValue(5);

      const result = await repository.count({ status: 'succeeded' });

      expect(result).toBe(5);
    });

    it('should check existence', async () => {
      mockPrismaClient.payment.count.mockResolvedValue(1);

      const result = await repository.exists({ userId: 'user-1' });

      expect(result).toBe(true);
    });
  });
});
