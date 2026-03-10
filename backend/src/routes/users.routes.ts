import express, { Request, Response } from 'express';
import { RepositoryFactory } from '../repositories';
import { authMiddleware, asyncHandler } from '../middleware/auth';
import { formatResponse } from '../utils/errors';

const router = express.Router();
const userRepository = RepositoryFactory.getUserRepository();

/**
 * Get all users (admin only)
 * Note: This route uses JWT authMiddleware but customer login has been removed.
 * Admin users should use session-based authentication instead.
 */
router.get('/', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  if ((req.user as any)?.role !== 'admin') {
    return res.status(403).json(formatResponse(false, undefined, { code: 'FORBIDDEN', message: 'Admin only' }));
  }
  
  const users = await userRepository.findAllForAdmin();
  res.json(formatResponse(true, users));
}));

export default router;
