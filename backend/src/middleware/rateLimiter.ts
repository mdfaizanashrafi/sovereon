/**
 * Rate Limiting Middleware
 * Protects contact and consultation endpoints from spam/abuse
 */

import rateLimit from 'express-rate-limit';

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
