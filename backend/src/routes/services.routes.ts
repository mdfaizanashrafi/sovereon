import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const prisma = new PrismaClient();

// Get all services
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      basePrice: true,
      features: true,
      createdAt: true,
    }
  });
  res.json(formatResponse(true, services));
}));

// Get service by slug
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
  const service = await prisma.service.findUnique({
    where: { slug: req.params.slug },
  });
  
  if (!service) {
    return res.status(404).json(formatResponse(false, undefined, { code: 'NOT_FOUND', message: 'Service not found' }));
  }
  
  res.json(formatResponse(true, service));
}));

export default router;
