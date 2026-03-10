/**
 * ============================================================================
 * SOVEREON BACKEND API
 * ============================================================================
 * Production-grade Express application with comprehensive observability
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// Observability imports
import { 
  initializeLogger, 
  logger, 
  shutdownLogger,
  createRequestLogger 
} from './utils/logger';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { initializePerformanceMetrics } from './performance/metrics';
import { tracingMiddleware } from './utils/tracing';
import { observabilityConfig } from './config/observability';

// Security imports
import { 
  securityHeaders, 
  additionalSecurityHeaders, 
  sanitizeInput, 
  apiRateLimiter 
} from './middleware/security';
import { requestLogger } from './middleware/requestLogger';
import { logSecurityAudit } from './utils/security';
import { setupSwagger } from './config/swagger';

// Route imports
import userRoutes from './routes/users.routes';
import serviceRoutes from './routes/services.routes';
import orderRoutes from './routes/orders.routes';
import invoiceRoutes from './routes/invoices.routes';
import subscriptionRoutes from './routes/subscriptions.routes';
import paymentRoutes from './routes/payments.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import contactRoutes from './routes/contact.routes';
import seedRoutes from './routes/seed.routes';
import healthRoutes from './routes/health.routes';
import v1Routes from './routes/v1';
import metricsRoutes from './routes/metrics.routes';
import chaosRoutes from './routes/chaos.routes';

// Extend Express session
declare module 'express-session' {
  interface SessionData {
    adminId?: string;
  }
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

function validateEnv(): string[] {
  const errors: string[] = [];
  const required = ['DATABASE_URL', 'SESSION_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
  }
  
  // Warn about optional but recommended vars
  const recommended = ['RESEND_API_KEY', 'FRONTEND_URL'];
  for (const key of recommended) {
    if (!process.env[key]) {
      console.warn(`[Warning] Optional env var not set: ${key}`);
    }
  }
  
  return errors;
}

// ============================================================================
// APPLICATION SETUP
// ============================================================================

// Initialize observability first
initializeLogger();
logger.info('Starting Sovereon Backend API', {
  version: observabilityConfig.appVersion,
  environment: observabilityConfig.environment,
  observabilityEnabled: observabilityConfig.enabled,
  metricsEnabled: observabilityConfig.metrics.enabled,
  tracingEnabled: observabilityConfig.tracing.enabled,
});

// Create Express app
const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Trust proxy (required for rate limiting behind reverse proxy)
if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

app.use(securityHeaders);
app.use(additionalSecurityHeaders);

// ============================================================================
// OBSERVABILITY MIDDLEWARE (Order matters!)
// ============================================================================

// 1. Tracing middleware (first to capture full request lifecycle)
if (observabilityConfig.tracing.enabled) {
  app.use(tracingMiddleware);
  logger.debug('Tracing middleware enabled');
}

// 2. Metrics middleware (captures request/response metrics)
if (observabilityConfig.metrics.enabled) {
  app.use(metricsMiddleware);
  logger.debug('Metrics middleware enabled');
}

// 3. Request logging (structured logging with context)
app.use(requestLogger);

// ============================================================================
// API DOCUMENTATION
// ============================================================================

setupSwagger(app);

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const envErrors = validateEnv();
if (envErrors.length > 0) {
  logger.fatal('Environment validation failed', undefined, { errors: envErrors });
  if (IS_PRODUCTION) {
    process.exit(1);
  }
}

// Run security audit
logSecurityAudit();

// ============================================================================
// SESSION STORE SETUP
// ============================================================================

let PgSession: any;
if (IS_PRODUCTION) {
  try {
    const connectPgSimple = require('connect-pg-simple');
    PgSession = connectPgSimple(session);
    logger.info('PostgreSQL session store configured');
  } catch (e) {
    logger.warn('connect-pg-simple not available, using MemoryStore');
  }
}

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_URL,
  'https://sovereon.vercel.app',
  'https://www.sovereon.online',
  'https://sovereon.online',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn('CORS blocked request', undefined, { origin });
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================================
// BODY PARSING & COOKIES
// ============================================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// ============================================================================
// RATE LIMITING
// ============================================================================

app.use('/api/', apiRateLimiter);

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'development-secret-not-for-production',
  resave: false,
  saveUninitialized: false,
  name: 'sovereon.sid',
  cookie: {
    secure: IS_PRODUCTION,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
  },
};

if (IS_PRODUCTION && PgSession && process.env.DATABASE_URL) {
  sessionConfig.store = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15,
  });
  logger.info('Using PostgreSQL session store');
} else {
  logger.info('Using MemoryStore for sessions');
}

app.use(session(sessionConfig));

// ============================================================================
// REQUEST CONTEXT ENHANCEMENT
// ============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  // Create request-specific logger
  const requestLogger = createRequestLogger(
    req.requestId || 'unknown',
    (req as any).user?.id || (req as any).adminUser?.id
  );
  
  // Attach to request for use in routes
  (req as any).logger = requestLogger;
  
  // Log request completion with context
  res.on('finish', () => {
    const duration = Date.now() - (req as any)._startTime || 0;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestId: req.requestId,
    };
    
    if (level === 'error') {
      requestLogger.error('Request completed with error', undefined, logData);
    } else if (level === 'warn') {
      requestLogger.warn('Request completed with warning', undefined, logData);
    } else {
      requestLogger.info('Request completed', logData);
    }
  });
  
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Root API endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sovereon API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    observability: {
      enabled: observabilityConfig.enabled,
      metrics: observabilityConfig.metrics.enabled,
      tracing: observabilityConfig.tracing.enabled,
    },
    documentation: '/api/docs',
    versions: {
      v1: {
        url: '/api/v1',
        status: 'current',
        endpoints: {
          public: '/api/v1/team-members, /api/v1/services, etc.',
          admin: '/api/v1/admin/*',
        },
      },
    },
    legacy: {
      status: 'deprecated',
      note: 'Legacy routes will be removed in v2. Please migrate to /api/v1/*',
    },
  });
});

// Health check routes (must be before other routes for quick responses)
app.use('/api', healthRoutes);

// Performance metrics routes
app.use('/api/metrics', metricsRoutes);

// Chaos engineering routes (development only, protected by environment check)
app.use('/api/chaos', chaosRoutes);

// Initialize performance metrics collection
initializePerformanceMetrics();

// API V1 Routes (Recommended)
app.use('/api/v1', v1Routes);

// Legacy Routes (Deprecated - will be removed in v2)
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', contactRoutes);
app.use('/api', seedRoutes);

// Example usage of benchmark middleware
// app.get('/api/services', benchmark('get_services'), asyncHandler(async (req, res) => {
//   // handler
// }));

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', undefined, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const requestLogger = (req as any).logger || logger;
  
  requestLogger.error('Unhandled error', err, {
    method: req.method,
    path: req.path,
    requestId: req.requestId,
  });
  
  // Don't leak stack traces in production
  const message = IS_PRODUCTION && err.status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      requestId: req.requestId,
    },
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: NODE_ENV,
    healthCheck: `http://localhost:${PORT}/api/health`,
    metrics: `http://localhost:${PORT}/api/metrics`,
  });
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/api/metrics`);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Flush logs and cleanup
    await shutdownLogger();
    
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.fatal('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
  logger.fatal('Uncaught exception', err);
  await shutdownLogger();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.fatal('Unhandled rejection', undefined, { reason, promise });
  await shutdownLogger();
  process.exit(1);
});

export default app;
