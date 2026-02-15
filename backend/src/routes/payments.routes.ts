import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's payments
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { invoice: true, order: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(formatResponse(true, payments));
}));

// Create payment (simplified for free tier)
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { invoiceId, orderId, amount, paymentMethod = 'credit_card' } = req.body;
  
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.userId !== userId) {
      return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Invoice not found' }));
    }
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      orderId,
      userId,
      amount,
      paymentMethod,
      status: 'succeeded', // Auto-succeed for free tier demo
      currency: 'USD',
    },
  });

  // Update invoice status if payment succeeded
  if (invoiceId && payment.status === 'succeeded') {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'paid', paidDate: new Date() },
    });
  }

  res.status(201).json(formatResponse(true, payment));
}));

// Get payment details
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { invoice: true, order: true },
  });

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (!payment || payment.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Payment not found' }));
  }

  res.json(formatResponse(true, payment));
}));

export default router;
