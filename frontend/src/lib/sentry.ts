/**
 * ============================================================================
 * SENTRY CONFIGURATION (Frontend)
 * ============================================================================
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV = import.meta.env.MODE;

export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    
    // Performance monitoring
    tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay (optional, for debugging)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Enable React error boundaries
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Before sending, sanitize sensitive data
    beforeSend(event) {
      // Remove potentially sensitive information
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
  });

  console.log('[Sentry] Initialized');
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

// Simple logger for performance monitoring
export const logger = {
  debug: (message: string, ...args: unknown[]) => console.debug(`[Sentry] ${message}`, ...args),
  info: (message: string, ...args: unknown[]) => console.info(`[Sentry] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[Sentry] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[Sentry] ${message}`, ...args),
};

export { Sentry };
