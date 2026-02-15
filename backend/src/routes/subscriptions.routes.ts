import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's subscriptions
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.user!.userId },
    include: { service: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(formatResponse(true, subscriptions));
}));

// Create subscription
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, planName, price, billingCycle = 'monthly' } = req.body;
  
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Service not found' }));
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: req.user!.userId,
      serviceId,
      planName: planName || service.name,
      price: price || service.basePrice,
      billingCycle,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    include: { service: true },
  });

  res.status(201).json(formatResponse(true, subscription));
}));

// Cancel subscription
router.post('/:id/cancel', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const subscription = await prisma.subscription.findUnique({ where: { id: req.params.id } });
  
  if (!subscription || subscription.userId !== req.user!.userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Subscription not found' }));
  }

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: 'cancelled', cancelledAt: new Date() },
    include: { service: true },
  });

  res.json(formatResponse(true, updated));
}));

export default router;
