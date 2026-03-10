import express, { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const orderRepository = RepositoryFactory.getOrderRepository();

// Get user's orders
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const orders = await orderRepository.findByUserId(userId);
  res.json(formatResponse(true, orders));
}));

// Create order
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, quantity = 1, totalAmount } = req.body;
  
  // Get service repository to check if service exists
  const serviceRepository = RepositoryFactory.getServiceRepository();
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Service not found' }));
  }

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const order = await orderRepository.createOrder({
    userId,
    serviceId,
    quantity,
    unitPrice: service.basePrice,
    totalAmount: totalAmount || service.basePrice * quantity,
  });

  res.status(201).json(formatResponse(true, order));
}));

// Get order details
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const order = await orderRepository.findByIdWithDetails(req.params.id);

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (!order || order.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Order not found' }));
  }

  res.json(formatResponse(true, order));
}));

export default router;
