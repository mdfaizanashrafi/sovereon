import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppError, ErrorCodes } from '../utils/errors';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError('UNAUTHORIZED', ErrorCodes.UNAUTHORIZED.message, 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired token', 401);
  }

  (req as any).user = payload;
  next();
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
