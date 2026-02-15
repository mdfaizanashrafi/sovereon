import express, { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, getUserById, updateUser } from '../services/auth.service';
import { asyncHandler, authMiddleware } from '../middleware/auth';
import { formatResponse, AppError, ErrorCodes } from '../utils/errors';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await registerUser(data.email, data.password, data.firstName, data.lastName);
  res.status(201).json(formatResponse(true, result));
}));

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data.email, data.password);
  res.json(formatResponse(true, result));
}));

// Get current user
router.get('/me', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const user = await getUserById(userId);
  res.json(formatResponse(true, user));
}));

// Update profile
router.put('/me', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, companyName, phone } = req.body;
  const userId = (req.user as any)?.userId || (req.user as any)?.id;
  const user = await updateUser(userId, { firstName, lastName, companyName, phone });
  res.json(formatResponse(true, user));
}));

export default router;
