/**
 * ============================================================================
 * ORDERS ROUTES TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock dependencies
const mockFindByUserId = vi.fn();
const mockFindByIdWithDetails = vi.fn();
const mockCreateOrder = vi.fn();
const mockFindById = vi.fn();

vi.mock('../../repositories', () => ({
  RepositoryFactory: {
    getOrderRepository: vi.fn().mockReturnValue({
      findByUserId: mockFindByUserId,
      findByIdWithDetails: mockFindByIdWithDetails,
      createOrder: mockCreateOrder,
    }),
    getServiceRepository: vi.fn().mockReturnValue({
      findById: mockFindById,
    }),
  },
}));

vi.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-1', role: 'user' };
    next();
  },
  asyncHandler: (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  },
}));

describe('Orders Routes', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    
    // Import the router after mocks are set up
    const ordersRouter = (await import('../orders.routes')).default;
    app.use('/api/orders', ordersRouter);
  });

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const mockOrders = [
        { id: 'order-1', userId: 'user-1', totalAmount: 100 },
        { id: 'order-2', userId: 'user-1', totalAmount: 200 },
      ];
      mockFindByUserId.mockResolvedValue(mockOrders);

      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(mockFindByUserId).toHaveBeenCalledWith('user-1', undefined);
    });

    it('should return empty array when no orders', async () => {
      mockFindByUserId.mockResolvedValue([]);

      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const mockService = { id: 'service-1', basePrice: 100 };
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        serviceId: 'service-1',
        quantity: 2,
        unitPrice: 100,
        totalAmount: 200,
      };
      
      mockFindById.mockResolvedValue(mockService);
      mockCreateOrder.mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/orders')
        .send({ serviceId: 'service-1', quantity: 2, totalAmount: 200 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockOrder);
      expect(mockCreateOrder).toHaveBeenCalledWith({
        userId: 'user-1',
        serviceId: 'service-1',
        quantity: 2,
        unitPrice: 100,
        totalAmount: 200,
      });
    });

    it('should return 404 when service not found', async () => {
      mockFindById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/orders')
        .send({ serviceId: 'nonexistent', quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Service not found');
    });

    it('should calculate total from service price if not provided', async () => {
      const mockService = { id: 'service-1', basePrice: 150 };
      mockFindById.mockResolvedValue(mockService);
      mockCreateOrder.mockResolvedValue({ id: 'order-1' });

      await request(app)
        .post('/api/orders')
        .send({ serviceId: 'service-1', quantity: 3 });

      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 450,
        })
      );
    });

    it('should use default quantity of 1', async () => {
      const mockService = { id: 'service-1', basePrice: 100 };
      mockFindById.mockResolvedValue(mockService);
      mockCreateOrder.mockResolvedValue({ id: 'order-1' });

      await request(app)
        .post('/api/orders')
        .send({ serviceId: 'service-1' });

      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 1,
        })
      );
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        totalAmount: 100,
        service: { id: 'service-1', name: 'Test Service' },
        invoice: { id: 'inv-1', amount: 100 },
      };
      mockFindByIdWithDetails.mockResolvedValue(mockOrder);

      const response = await request(app).get('/api/orders/order-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockOrder);
    });

    it('should return 404 when order not found', async () => {
      mockFindByIdWithDetails.mockResolvedValue(null);

      const response = await request(app).get('/api/orders/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 when order belongs to different user', async () => {
      const mockOrder = {
        id: 'order-1',
        userId: 'different-user',
        totalAmount: 100,
      };
      mockFindByIdWithDetails.mockResolvedValue(mockOrder);

      const response = await request(app).get('/api/orders/order-1');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
