/**
 * Admin Authentication Middleware
 * Enhanced session-based authentication with rate limiting and security features
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError, AuthError } from '../utils/errors';

const prisma = new PrismaClient();

// Simple in-memory rate limiter for login attempts
// In production, consider using Redis
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

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
 * Check if IP is rate limited for login
 */
function isRateLimited(ip: string): boolean {
  const attempt = loginAttempts.get(ip);
  if (!attempt) return false;
  
  // Check if in lockout period
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    if (Date.now() < attempt.resetTime + LOCKOUT_DURATION_MS) {
      return true;
    }
    // Reset after lockout period
    loginAttempts.delete(ip);
    return false;
  }
  
  // Reset if window passed
  if (Date.now() > attempt.resetTime) {
    loginAttempts.delete(ip);
    return false;
  }
  
  return false;
}

/**
 * Record failed login attempt
 */
function recordFailedAttempt(ip: string): void {
  const attempt = loginAttempts.get(ip);
  
  if (!attempt || Date.now() > attempt.resetTime) {
    // New attempt or window expired
    loginAttempts.set(ip, {
      count: 1,
      resetTime: Date.now() + LOGIN_WINDOW_MS,
    });
  } else {
    // Increment existing
    attempt.count++;
  }
  
  console.warn(`[Security] Failed login attempt from ${ip}: ${loginAttempts.get(ip)?.count}/${MAX_LOGIN_ATTEMPTS}`);
}

/**
 * Clear login attempts on successful login
 */
function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
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
      throw new AuthError('Admin authentication required');
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, username: true },
    });

    if (!admin) {
      req.session.destroy((err) => {
        if (err) console.error('[Session] Failed to destroy invalid session:', err);
      });
      throw new AuthError('Invalid admin session');
    }

    req.adminUser = admin;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Admin login function with rate limiting
 */
export async function adminLogin(
  username: string,
  password: string,
  ip: string
): Promise<{ id: string; username: string } | null> {
  // Check rate limiting
  if (isRateLimited(ip)) {
    console.error(`[Security] Login blocked for ${ip} - too many attempts`);
    throw new AppError('RATE_LIMITED', 'Too many login attempts. Please try again later.', 429);
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!admin) {
    recordFailedAttempt(ip);
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);

  if (!isValidPassword) {
    recordFailedAttempt(ip);
    return null;
  }

  // Clear attempts on success
  clearAttempts(ip);

  // Update last login
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  console.log(`[Security] Successful admin login: ${username} from ${ip}`);

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

/**
 * Optional auth middleware - doesn't throw if not authenticated
 * Useful for endpoints that work differently for logged-in vs anonymous users
 */
export async function optionalAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.session?.adminId;

    if (adminId) {
      const admin = await prisma.adminUser.findUnique({
        where: { id: adminId },
        select: { id: true, username: true },
      });

      if (admin) {
        req.adminUser = admin;
      }
    }

    next();
  } catch (error) {
    // Don't fail request, just don't set adminUser
    next();
  }
}
