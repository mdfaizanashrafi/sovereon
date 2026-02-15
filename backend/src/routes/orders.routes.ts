import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's orders
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { service: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(formatResponse(true, orders));
}));

// Create order
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, quantity = 1, totalAmount } = req.body;
  
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Service not found' }));
  }

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user!.userId,
      serviceId,
      quantity,
      unitPrice: service.basePrice,
      totalAmount: totalAmount || service.basePrice * quantity,
      status: 'pending',
    },
    include: { service: true },
  });

  res.status(201).json(formatResponse(true, order));
}));

// Get order details
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { service: true, invoice: true },
  });

  if (!order || order.userId !== req.user!.userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Order not found' }));
  }

  res.json(formatResponse(true, order));
}));

export default router;
