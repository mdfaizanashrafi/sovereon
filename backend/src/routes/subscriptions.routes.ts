import express, { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const subscriptionRepository = RepositoryFactory.getSubscriptionRepository();
const serviceRepository = RepositoryFactory.getServiceRepository();

// Get user's subscriptions
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const subscriptions = await subscriptionRepository.findByUserId(userId);
  res.json(formatResponse(true, subscriptions));
}));

// Create subscription
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, planName, price, billingCycle = 'monthly' } = req.body;
  
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Service not found' }));
  }

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const subscription = await subscriptionRepository.createSubscription({
    userId,
    serviceId,
    planName: planName || service.name,
    price: price || service.basePrice,
    billingCycle,
  });

  res.status(201).json(formatResponse(true, subscription));
}));

// Cancel subscription
router.post('/:id/cancel', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const subscription = await subscriptionRepository.findById(req.params.id);
  
  if (!subscription || subscription.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Subscription not found' }));
  }

  const updated = await subscriptionRepository.cancel(req.params.id);

  res.json(formatResponse(true, updated));
}));

export default router;
