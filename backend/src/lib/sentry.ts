/**
 * ============================================================================
 * SENTRY CONFIGURATION (Backend)
 * ============================================================================
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express, Request, Response, NextFunction } from 'express';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENV = process.env.NODE_ENV || 'development';

export function initSentry(): typeof Sentry {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN provided, skipping initialization');
    return Sentry;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    
    // Performance monitoring
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration(),
      // Enable Express.js middleware tracing
      Sentry.expressIntegration(),
      // Enable profiling
      nodeProfilingIntegration(),
    ],
  });

  console.log('[Sentry] Initialized');
  return Sentry;
}

export function setupSentryMiddleware(app: Express): void {
  if (!SENTRY_DSN) return;
  
  // The Sentry request handler must be the first middleware
  app.use(Sentry.expressErrorHandler() as any);
}

export function createSentryRequestHandler() {
  // In Sentry v10+, request handling is done through expressIntegration
  // This is a placeholder for any custom request handling needed
  return (req: Request, res: Response, next: NextFunction) => next();
}

export function createSentryTracingHandler() {
  // In Sentry v10+, tracing is handled automatically by expressIntegration
  return (req: Request, res: Response, next: NextFunction) => next();
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id: string; email?: string } | null): void {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}

export { Sentry };
