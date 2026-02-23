/**
 * Admin Authentication Middleware
 * Simple session-based authentication for admin panel
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError, ErrorCodes } from '../utils/errors';

const prisma = new PrismaClient();

// Extend Express Request to include admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        username: string;
      };
    }
  }
}

/**
 * Admin authentication middleware
 * Checks for valid admin session
 */
export async function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.session?.adminId;

    if (!adminId) {
      throw new AppError('UNAUTHORIZED', 'Admin authentication required', 401);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, username: true },
    });

    if (!admin) {
      req.session.destroy(() => {});
      throw new AppError('UNAUTHORIZED', 'Invalid admin session', 401);
    }

    req.adminUser = admin;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Admin login function
 */
export async function adminLogin(
  username: string,
  password: string
): Promise<{ id: string; username: string } | null> {
  const admin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!admin) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);

  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  return { id: admin.id, username: admin.username };
}

/**
 * Check if admin is authenticated (for session check endpoint)
 */
export async function checkAdminSession(
  adminId: string
): Promise<{ id: string; username: string } | null> {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, username: true },
  });

  return admin;
}
