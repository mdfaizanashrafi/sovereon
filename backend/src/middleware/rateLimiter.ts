/**
 * Rate Limiting Middleware
 * Protects contact and consultation endpoints from spam/abuse
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

type RateLimitPreset = 'public' | 'admin' | 'contact' | 'consultation';

const presets: Record<RateLimitPreset, { windowMs: number; max: number; skip?: boolean }> = {
  public: { windowMs: 60 * 1000, max: 30 }, // 30 req/min
  admin: { windowMs: 60 * 1000, max: 100 }, // 100 req/min (higher for admin)
  contact: { windowMs: 10 * 60 * 1000, max: 5 }, // 5 per 10 min
  consultation: { windowMs: 10 * 60 * 1000, max: 5 }, // 5 per 10 min
};

export function createRateLimiter(preset: RateLimitPreset) {
  const config = presets[preset];
  
  if (config.skip) {
    return (req: Request, res: Response, next: Function) => next();
  }

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
      timestamp: new Date().toISOString(),
    },
  });
}

// Trust proxy configuration for accurate IP detection
// This should be set in the main app, but we document it here:
// app.set('trust proxy', 1); // trust first proxy

/**
 * Rate limiter for contact form submissions
 * Limit: 5 submissions per IP per 10 minutes
 */
export const contactFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again after 10 minutes.'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default IP-based key generator (handles IPv4/IPv6 correctly)
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for consultation form submissions
 * Limit: 5 submissions per IP per 10 minutes
 */
export const consultationFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again after 10 minutes.'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default IP-based key generator (handles IPv4/IPv6 correctly)
});
