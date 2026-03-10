import express, { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const paymentRepository = RepositoryFactory.getPaymentRepository();
const invoiceRepository = RepositoryFactory.getInvoiceRepository();

// Get user's payments
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const payments = await paymentRepository.findByUserId(userId);
  res.json(formatResponse(true, payments));
}));

// Create payment (simplified for free tier)
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { invoiceId, orderId, amount, paymentMethod = 'credit_card' } = req.body;
  
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (invoiceId) {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice || invoice.userId !== userId) {
      return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Invoice not found' }));
    }
  }

  const payment = await paymentRepository.createPaymentAndUpdateInvoice({
    invoiceId,
    orderId,
    userId,
    amount,
    paymentMethod,
    status: 'succeeded', // Auto-succeed for free tier demo
    currency: 'USD',
  });

  res.status(201).json(formatResponse(true, payment));
}));

// Get payment details
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentRepository.findByIdWithDetails(req.params.id);

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (!payment || payment.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Payment not found' }));
  }

  res.json(formatResponse(true, payment));
}));

export default router;
