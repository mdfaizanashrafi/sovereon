import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's invoices
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    include: { order: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(formatResponse(true, invoices));
}));

// Create invoice
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const { orderId, amount, tax = 0 } = req.body;
  
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Order not found' }));
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      orderId,
      amount,
      tax,
      total: amount + tax,
      status: 'draft',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    include: { order: true },
  });

  res.status(201).json(formatResponse(true, invoice));
}));

// Get invoice details
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { order: true },
  });

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (!invoice || invoice.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Invoice not found' }));
  }

  res.json(formatResponse(true, invoice));
}));

export default router;
