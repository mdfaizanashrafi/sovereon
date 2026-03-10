/**
 * ============================================================================
 * SUBSCRIPTION REPOSITORY TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionRepository } from '../SubscriptionRepository';

const mockPrismaClient = {
  subscription: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrismaClient)),
};

describe('SubscriptionRepository', () => {
  let repository: SubscriptionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SubscriptionRepository(mockPrismaClient as any);
  });

  describe('findByUserId', () => {
    it('should find subscriptions by user ID with service included', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-1',
          service: { id: 'service-1', name: 'Test Service' },
        },
      ];
      mockPrismaClient.subscription.findMany.mockResolvedValue(mockSubscriptions);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual(mockSubscriptions);
      expect(mockPrismaClient.subscription.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
        include: { service: true },
      });
    });

    it('should apply pagination options', async () => {
      const mockSubscriptions = [{ id: 'sub-1' }];
      mockPrismaClient.subscription.findMany.mockResolvedValue(mockSubscriptions);

      await repository.findByUserId('user-1', {
        pagination: { page: 1, limit: 5 },
      });

      expect(mockPrismaClient.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 5,
        })
      );
    });
  });

  describe('findByIdWithDetails', () => {
    it('should find subscription by ID with service', async () => {
      const mockSubscription = {
        id: 'sub-1',
        service: { id: 'service-1', name: 'Test Service' },
      };
      mockPrismaClient.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await repository.findByIdWithDetails('sub-1');

      expect(result).toEqual(mockSubscription);
      expect(mockPrismaClient.subscription.findUnique).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        include: { service: true },
      });
    });

    it('should return null when subscription not found', async () => {
      mockPrismaClient.subscription.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithDetails('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createSubscription', () => {
    it('should create subscription with default dates', async () => {
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        serviceId: 'service-1',
        planName: 'Basic Plan',
        price: 29.99,
        billingCycle: 'monthly',
        status: 'active',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        service: { id: 'service-1' },
      };
      mockPrismaClient.subscription.create.mockResolvedValue(mockSubscription);

      const result = await repository.createSubscription({
        userId: 'user-1',
        serviceId: 'service-1',
        planName: 'Basic Plan',
        price: 29.99,
      });

      expect(result).toEqual(mockSubscription);
      expect(mockPrismaClient.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          serviceId: 'service-1',
          planName: 'Basic Plan',
          price: 29.99,
          billingCycle: 'monthly',
          status: 'active',
          currentPeriodStart: expect.any(Date),
          currentPeriodEnd: expect.any(Date),
        }),
        include: { service: true },
      });
    });

    it('should use custom values when provided', async () => {
      const customStart = new Date('2025-01-01');
      const customEnd = new Date('2025-12-31');
      mockPrismaClient.subscription.create.mockResolvedValue({ id: 'sub-1' });

      await repository.createSubscription({
        userId: 'user-1',
        serviceId: 'service-1',
        planName: 'Annual Plan',
        price: 299.99,
        billingCycle: 'yearly',
        status: 'trialing',
        currentPeriodStart: customStart,
        currentPeriodEnd: customEnd,
      });

      expect(mockPrismaClient.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            billingCycle: 'yearly',
            status: 'trialing',
            currentPeriodStart: customStart,
            currentPeriodEnd: customEnd,
          }),
        })
      );
    });
  });

  describe('cancel', () => {
    it('should cancel subscription by setting status and cancelledAt', async () => {
      const mockSubscription = {
        id: 'sub-1',
        status: 'cancelled',
        cancelledAt: new Date(),
        service: { id: 'service-1' },
      };
      mockPrismaClient.subscription.update.mockResolvedValue(mockSubscription);

      const result = await repository.cancel('sub-1');

      expect(result).toEqual(mockSubscription);
      expect(mockPrismaClient.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: 'cancelled', cancelledAt: expect.any(Date) },
        include: { service: true },
      });
    });
  });

  describe('findActiveByUserId', () => {
    it('should find active subscriptions for user', async () => {
      const mockSubscriptions = [
        { id: 'sub-1', status: 'active' },
        { id: 'sub-2', status: 'active' },
      ];
      mockPrismaClient.subscription.findMany.mockResolvedValue(mockSubscriptions);

      const result = await repository.findActiveByUserId('user-1');

      expect(result).toEqual(mockSubscriptions);
      expect(mockPrismaClient.subscription.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: 'active' },
        orderBy: { createdAt: 'desc' },
        include: { service: true },
      });
    });

    it('should return empty array when no active subscriptions', async () => {
      mockPrismaClient.subscription.findMany.mockResolvedValue([]);

      const result = await repository.findActiveByUserId('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('findByUserIdPaginated', () => {
    it('should return paginated subscriptions', async () => {
      const mockSubscriptions = [{ id: 'sub-1' }, { id: 'sub-2' }];
      mockPrismaClient.subscription.findMany.mockResolvedValue(mockSubscriptions);
      mockPrismaClient.subscription.count.mockResolvedValue(10);

      const result = await repository.findByUserIdPaginated('user-1', {
        pagination: { page: 1, limit: 2 },
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.totalPages).toBe(5);
    });
  });

  describe('inherited CRUD operations', () => {
    it('should find by ID', async () => {
      const mockSubscription = { id: 'sub-1' };
      mockPrismaClient.subscription.findUnique.mockResolvedValue(mockSubscription);

      const result = await repository.findById('sub-1');

      expect(result).toEqual(mockSubscription);
    });

    it('should update subscription', async () => {
      const mockSubscription = { id: 'sub-1', status: 'past_due' };
      mockPrismaClient.subscription.update.mockResolvedValue(mockSubscription);

      const result = await repository.update('sub-1', { status: 'past_due' } as any);

      expect(result).toEqual(mockSubscription);
    });

    it('should delete subscription', async () => {
      const mockSubscription = { id: 'sub-1' };
      mockPrismaClient.subscription.delete.mockResolvedValue(mockSubscription);

      const result = await repository.delete('sub-1');

      expect(result).toEqual(mockSubscription);
    });
  });
});
