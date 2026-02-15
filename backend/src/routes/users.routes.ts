import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    }
  });
  res.json(formatResponse(true, user));
}));

// Get all users (admin only)
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json(formatResponse(false, undefined, { code: 'FORBIDDEN', message: 'Admin only' }));
  }
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      role: true,
      status: true,
      createdAt: true,
    }
  });
  res.json(formatResponse(true, users));
}));

export default router;
