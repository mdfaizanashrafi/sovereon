/**
 * ============================================================================
 * ORDER REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderRepository } from '../OrderRepository';

const mockPrismaClient = {
  order: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrismaClient)),
};

describe('OrderRepository', () => {
  let repository: OrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new OrderRepository(mockPrismaClient as any);
  });

  describe('findByUserId', () => {
    it('should find orders by user ID with service included', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          serviceId: 'service-1',
          service: { id: 'service-1', name: 'Test Service' },
        },
      ];
      mockPrismaClient.order.findMany.mockResolvedValue(mockOrders);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual(mockOrders);
      expect(mockPrismaClient.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
        include: { service: true },
      });
    });

    it('should apply pagination and sorting options', async () => {
      const mockOrders = [{ id: 'order-1' }];
      mockPrismaClient.order.findMany.mockResolvedValue(mockOrders);

      await repository.findByUserId('user-1', {
        sort: { field: 'totalAmount', direction: 'asc' },
        pagination: { page: 2, limit: 5 },
      });

      expect(mockPrismaClient.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { totalAmount: 'asc' },
        skip: 5,
        take: 5,
        include: { service: true },
      });
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find order by ID with service and invoice', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        service: { id: 'service-1', name: 'Test Service' },
        invoice: { id: 'inv-1', amount: 100 },
      };
      mockPrismaClient.order.findUnique.mockResolvedValue(mockOrder);

      const result = await repository.findByIdWithDetails('order-1');

      expect(result).toEqual(mockOrder);
      expect(mockPrismaClient.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: { service: true, invoice: true },
      });
    });

    it('should return null when order not found', async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithDetails('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdPaginated', () => {
    it('should return paginated orders for user', async () => {
      const mockOrders = [
        { id: 'order-1', userId: 'user-1' },
        { id: 'order-2', userId: 'user-1' },
      ];
      mockPrismaClient.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaClient.order.count.mockResolvedValue(10);

      const result = await repository.findByUserIdPaginated('user-1', {
        pagination: { page: 1, limit: 2 },
      });

      expect(result.data).toEqual(mockOrders);
      expect(result.meta).toEqual({
        total: 10,
        page: 1,
        limit: 2,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should handle empty results', async () => {
      mockPrismaClient.order.findMany.mockResolvedValue([]);
      mockPrismaClient.order.count.mockResolvedValue(0);

      const result = await repository.findByUserIdPaginated('user-1');

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe('createOrder', () => {
    it('should create order with generated order number', async () => {
      const mockOrder = {
        id: 'order-1',
        orderNumber: 'ORD-1234567890-abc123',
        userId: 'user-1',
        serviceId: 'service-1',
        quantity: 2,
        unitPrice: 50,
        totalAmount: 100,
        status: 'pending',
        service: { id: 'service-1', name: 'Test Service' },
      };
      mockPrismaClient.order.create.mockResolvedValue(mockOrder);

      const result = await repository.createOrder({
        userId: 'user-1',
        serviceId: 'service-1',
        quantity: 2,
        unitPrice: 50,
        totalAmount: 100,
      });

      expect(result).toEqual(mockOrder);
      expect(mockPrismaClient.order.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          serviceId: 'service-1',
          quantity: 2,
          unitPrice: 50,
          totalAmount: 100,
          status: 'pending',
          orderNumber: expect.stringMatching(/^ORD-\d+-[a-z0-9]+$/),
        }),
        include: { service: true },
      });
    });

    it('should allow custom status', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'confirmed',
      };
      mockPrismaClient.order.create.mockResolvedValue(mockOrder);

      await repository.createOrder({
        userId: 'user-1',
        serviceId: 'service-1',
        quantity: 1,
        unitPrice: 100,
        totalAmount: 100,
        status: 'confirmed',
      });

      expect(mockPrismaClient.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'confirmed',
          }),
        })
      );
    });
  });

  describe('inherited CRUD operations', () => {
    it('should find by ID', async () => {
      const mockOrder = { id: 'order-1' };
      mockPrismaClient.order.findUnique.mockResolvedValue(mockOrder);

      const result = await repository.findById('order-1');

      expect(result).toEqual(mockOrder);
    });

    it('should update order', async () => {
      const mockOrder = { id: 'order-1', status: 'completed' };
      mockPrismaClient.order.update.mockResolvedValue(mockOrder);

      const result = await repository.update('order-1', { status: 'completed' } as any);

      expect(result).toEqual(mockOrder);
    });

    it('should delete order', async () => {
      const mockOrder = { id: 'order-1' };
      mockPrismaClient.order.delete.mockResolvedValue(mockOrder);

      const result = await repository.delete('order-1');

      expect(result).toEqual(mockOrder);
    });
  });
});
