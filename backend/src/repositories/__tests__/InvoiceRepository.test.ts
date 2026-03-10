/**
 * ============================================================================
 * INVOICE REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceRepository } from '../InvoiceRepository';

const mockPrismaClient = {
  invoice: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrismaClient)),
};

describe('InvoiceRepository', () => {
  let repository: InvoiceRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new InvoiceRepository(mockPrismaClient as any);
  });

  describe('findByUserId', () => {
    it('should find invoices by user ID with order included', async () => {
      const mockInvoices = [
        {
          id: 'inv-1',
          userId: 'user-1',
          order: { id: 'order-1', orderNumber: 'ORD-001' },
        },
      ];
      mockPrismaClient.invoice.findMany.mockResolvedValue(mockInvoices);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual(mockInvoices);
      expect(mockPrismaClient.invoice.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
        include: { order: true },
      });
    });

    it('should apply pagination options', async () => {
      const mockInvoices = [{ id: 'inv-1' }];
      mockPrismaClient.invoice.findMany.mockResolvedValue(mockInvoices);

      await repository.findByUserId('user-1', {
        pagination: { page: 1, limit: 10 },
        sort: { field: 'amount', direction: 'desc' },
      });

      expect(mockPrismaClient.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { amount: 'desc' },
        })
      );
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find invoice by ID with order details', async () => {
      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        order: { id: 'order-1', orderNumber: 'ORD-001' },
      };
      mockPrismaClient.invoice.findUnique.mockResolvedValue(mockInvoice);

      const result = await repository.findByIdWithDetails('inv-1');

      expect(result).toEqual(mockInvoice);
      expect(mockPrismaClient.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        include: { order: true },
      });
    });

    it('should return null when invoice not found', async () => {
      mockPrismaClient.invoice.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithDetails('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createInvoice', () => {
    it('should create invoice with generated invoice number', async () => {
      const mockInvoice = {
        id: 'inv-1',
        invoiceNumber: 'INV-1234567890-abc123',
        userId: 'user-1',
        orderId: 'order-1',
        amount: 100,
        tax: 0,
        total: 100,
        status: 'draft',
        issuedDate: new Date(),
        dueDate: expect.any(Date),
        order: { id: 'order-1' },
      };
      mockPrismaClient.invoice.create.mockResolvedValue(mockInvoice);

      const result = await repository.createInvoice({
        userId: 'user-1',
        orderId: 'order-1',
        amount: 100,
      });

      expect(mockPrismaClient.invoice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          orderId: 'order-1',
          amount: 100,
          tax: 0,
          total: 100,
          status: 'draft',
          invoiceNumber: expect.stringMatching(/^INV-\d+-[a-z0-9]+$/),
          issuedDate: expect.any(Date),
          dueDate: expect.any(Date),
        }),
        include: { order: true },
      });
    });

    it('should calculate total with tax', async () => {
      mockPrismaClient.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await repository.createInvoice({
        userId: 'user-1',
        orderId: 'order-1',
        amount: 100,
        tax: 18,
      });

      expect(mockPrismaClient.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 100,
            tax: 18,
            total: 118,
          }),
        })
      );
    });

    it('should use custom due date if provided', async () => {
      const customDueDate = new Date('2025-12-31');
      mockPrismaClient.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await repository.createInvoice({
        userId: 'user-1',
        orderId: 'order-1',
        amount: 100,
        dueDate: customDueDate,
      });

      expect(mockPrismaClient.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dueDate: customDueDate,
          }),
        })
      );
    });

    it('should use custom status if provided', async () => {
      mockPrismaClient.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await repository.createInvoice({
        userId: 'user-1',
        orderId: 'order-1',
        amount: 100,
        status: 'sent',
      });

      expect(mockPrismaClient.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'sent',
          }),
        })
      );
    });
  });

  describe('markAsPaid', () => {
    it('should mark invoice as paid with paid date', async () => {
      const mockInvoice = {
        id: 'inv-1',
        status: 'paid',
        paidDate: new Date(),
      };
      mockPrismaClient.invoice.update.mockResolvedValue(mockInvoice);

      const result = await repository.markAsPaid('inv-1');

      expect(result).toEqual(mockInvoice);
      expect(mockPrismaClient.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: 'paid', paidDate: expect.any(Date) },
      });
    });
  });

  describe('findByUserIdPaginated', () => {
    it('should return paginated invoices', async () => {
      const mockInvoices = [{ id: 'inv-1' }, { id: 'inv-2' }];
      mockPrismaClient.invoice.findMany.mockResolvedValue(mockInvoices);
      mockPrismaClient.invoice.count.mockResolvedValue(15);

      const result = await repository.findByUserIdPaginated('user-1', {
        pagination: { page: 2, limit: 2 },
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(8);
      expect(result.meta.hasPrev).toBe(true);
    });
  });

  describe('inherited CRUD operations', () => {
    it('should find by ID', async () => {
      const mockInvoice = { id: 'inv-1' };
      mockPrismaClient.invoice.findUnique.mockResolvedValue(mockInvoice);

      const result = await repository.findById('inv-1');

      expect(result).toEqual(mockInvoice);
    });

    it('should find all', async () => {
      const mockInvoices = [{ id: 'inv-1' }];
      mockPrismaClient.invoice.findMany.mockResolvedValue(mockInvoices);

      const result = await repository.findAll();

      expect(result).toEqual(mockInvoices);
    });

    it('should update invoice', async () => {
      const mockInvoice = { id: 'inv-1', status: 'sent' };
      mockPrismaClient.invoice.update.mockResolvedValue(mockInvoice);

      const result = await repository.update('inv-1', { status: 'sent' } as any);

      expect(result).toEqual(mockInvoice);
    });

    it('should delete invoice', async () => {
      const mockInvoice = { id: 'inv-1' };
      mockPrismaClient.invoice.delete.mockResolvedValue(mockInvoice);

      const result = await repository.delete('inv-1');

      expect(result).toEqual(mockInvoice);
    });
  });
});
