import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { securityHeaders, additionalSecurityHeaders, sanitizeInput, apiRateLimiter } from './middleware/security';
import { logSecurityAudit } from './utils/security';

// Extend session to include adminId
declare module 'express-session' {
  interface SessionData {
    adminId?: string;
  }
}

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

// Environment variable validation
function validateEnv(): string[] {
  const errors: string[] = [];
  const required = ['DATABASE_URL', 'SESSION_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
  }
  
  // Warn about optional but recommended vars
  const recommended = ['SMTP_PASSWORD', 'FRONTEND_URL'];
  for (const key of recommended) {
    if (!process.env[key]) {
      console.warn(`[Warning] Optional env var not set: ${key}`);
    }
  }
  
  return errors;
}

// Create Express app
const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Trust proxy (required for rate limiting behind reverse proxy)
if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// Apply security headers
app.use(securityHeaders);
app.use(additionalSecurityHeaders);

// Validate environment before starting
const envErrors = validateEnv();
if (envErrors.length > 0) {
  console.error('[Fatal] Environment validation failed:');
  envErrors.forEach(e => console.error(`  - ${e}`));
  if (IS_PRODUCTION) {
    process.exit(1);
  }
}

// Run security audit
logSecurityAudit();

// Import connect-pg-simple for production session store
let PgSession: any;
if (IS_PRODUCTION) {
  try {
    const connectPgSimple = require('connect-pg-simple');
    PgSession = connectPgSimple(session);
  } catch (e) {
    console.warn('[Warning] connect-pg-simple not available, using MemoryStore');
  }
}

// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://sovereon.vercel.app',
  'https://www.sovereon.online',
  'https://sovereon.online',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// Apply general API rate limiting
app.use('/api/', apiRateLimiter);

// Session configuration
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

// Use PostgreSQL session store in production
if (IS_PRODUCTION && PgSession && process.env.DATABASE_URL) {
  sessionConfig.store = new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15, // Prune expired sessions every 15 minutes
  });
  console.log('[Session] Using PostgreSQL session store');
} else {
  console.log('[Session] Using MemoryStore (not recommended for production)');
}

app.use(session(sessionConfig));

// Request logging middleware with response time
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    const message = `[${requestId}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
    
    if (logLevel === 'error') {
      console.error(message);
    } else {
      console.log(message);
    }
  });
  
  next();
});

// Root API endpoint - API info
app.get('/api', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sovereon API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      healthDb: '/api/health/db',
      healthEmail: '/api/health/email',
      public: '/api/public/*',
      admin: '/api/admin/*',
      contact: '/api/contact',
      users: '/api/users',
      services: '/api/services',
      orders: '/api/orders',
      invoices: '/api/invoices',
      subscriptions: '/api/subscriptions',
      payments: '/api/payments'
    }
  });
});

// Health check routes (must be before other routes)
app.use('/api', healthRoutes);

// Routes
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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    error: { 
      code: 'NOT_FOUND', 
      message: 'Endpoint not found' 
    } 
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  
  // Don't leak stack traces in production
  const message = IS_PRODUCTION && err.status === 500 
    ? 'Internal server error' 
    : err.message || 'Internal server error';
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message
    }
  });
});

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
