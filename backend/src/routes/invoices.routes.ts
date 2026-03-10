import express, { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const invoiceRepository = RepositoryFactory.getInvoiceRepository();
const orderRepository = RepositoryFactory.getOrderRepository();

// Get user's invoices
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const invoices = await invoiceRepository.findByUserId(userId);
  res.json(formatResponse(true, invoices));
}));

// Create invoice
router.post('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const { orderId, amount, tax = 0 } = req.body;
  
  const order = await orderRepository.findById(orderId);
  if (!order || order.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Order not found' }));
  }

  const invoice = await invoiceRepository.createInvoice({
    userId,
    orderId,
    amount,
    tax,
  });

  res.status(201).json(formatResponse(true, invoice));
}));

// Get invoice details
router.get('/:id', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const invoice = await invoiceRepository.findByIdWithDetails(req.params.id);

  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  if (!invoice || invoice.userId !== userId) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Invoice not found' }));
  }

  res.json(formatResponse(true, invoice));
}));

export default router;
