/**
 * ============================================================================
 * REQUEST LOGGER MIDDLEWARE
 * ============================================================================
 * Comprehensive request/response logging with correlation IDs
 * Integrated with structured logging and observability stack
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, createRequestLogger, generateRequestId, type ILogger } from '../utils/logger';
import { redactPII } from '../utils/logger';
import { observabilityConfig, shouldLogLevel } from '../config/observability';

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Request log data structure
 */
export interface RequestLog {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  method: string;
  path: string;
  query?: Record<string, any>;
  ip: string;
  userAgent?: string;
  userId?: string;
  duration?: number;
  statusCode?: number;
  error?: string;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  logLevel: LogLevel;
  excludePaths: string[];
  maxBodyLength: number;
  enableBodyLogging: boolean;
}

// Default configuration
const config: LoggerConfig = {
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  excludePaths: ['/api/health', '/health', '/api/metrics'],
  maxBodyLength: 1000,
  enableBodyLogging: process.env.LOG_REQUEST_BODY === 'true',
};

/**
 * Log level priority
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Check if should log at given level
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.logLevel];
}

/**
 * Format log entry as JSON or string
 */
function formatLog(log: RequestLog): string {
  if (observabilityConfig.jsonFormat) {
    return JSON.stringify(log);
  }
  
  // Development format
  const duration = log.duration ? `${log.duration}ms` : '-';
  const status = log.statusCode || '-';
  const user = log.userId || 'anonymous';
  
  return `[${log.timestamp}] ${log.level.toUpperCase()} | ${log.requestId} | ${user} | ${log.method} ${log.path} | ${status} | ${duration}`;
}

/**
 * Write log to output (legacy, now delegates to structured logger)
 */
function writeLog(log: RequestLog): void {
  if (!shouldLog(log.level)) return;
  
  // Use structured logger when available
  const requestLogger = createRequestLogger(log.requestId, log.userId);
  
  const meta = {
    method: log.method,
    path: log.path,
    ip: log.ip,
    userAgent: log.userAgent,
    duration: log.duration,
    statusCode: log.statusCode,
    query: log.query,
  };
  
  switch (log.level) {
    case 'error':
      requestLogger.error(log.error || log.path, undefined, meta);
      break;
    case 'warn':
      requestLogger.warn(log.path, undefined, meta);
      break;
    case 'debug':
      requestLogger.debug(log.path, meta);
      break;
    default:
      requestLogger.info(log.path, meta);
  }
}

/**
 * Generate correlation/request ID
 */
function generateLegacyRequestId(): string {
  return uuidv4().split('-')[0]; // Short ID (first segment)
}

/**
 * Sanitize sensitive data from body
 */
function sanitizeBody(body: any): any {
  return redactPII(body);
}

/**
 * Request logger middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Record start time
  const startTime = Date.now();
  (req as any)._startTime = startTime;
  
  // Skip excluded paths
  if (config.excludePaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Generate or extract request ID
  const requestId = req.get('x-request-id') || generateRequestId();
  req.requestId = requestId;
  
  // Set request ID header on response
  res.setHeader('X-Request-ID', requestId);
  
  // Create request logger for this request
  const requestLogger = createRequestLogger(requestId);
  (req as any).requestLogger = requestLogger;
  
  // Log request start
  const requestLog: RequestLog = {
    timestamp: new Date().toISOString(),
    level: 'info',
    requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent'),
  };
  
  requestLogger.info('Request started', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Add body for non-GET requests (sanitized) if enabled
  if (config.enableBodyLogging && req.method !== 'GET' && req.body) {
    const sanitizedBody = sanitizeBody(req.body);
    const bodyStr = JSON.stringify(sanitizedBody);
    if (bodyStr.length <= config.maxBodyLength) {
      requestLogger.debug('Request body', { body: sanitizedBody });
    }
  }
  
  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level: LogLevel = res.statusCode >= 400 ? (res.statusCode >= 500 ? 'error' : 'warn') : 'info';
    
    const userId = (req as any).adminUser?.id || (req as any).user?.id;
    
    const responseLog: RequestLog = {
      timestamp: new Date().toISOString(),
      level,
      requestId,
      method: req.method,
      path: req.path,
      ip: requestLog.ip,
      userId,
      duration,
      statusCode: res.statusCode,
    };
    
    // Log to structured logger
    const meta = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId,
      contentLength: res.get('content-length'),
      contentType: res.get('content-type'),
    };
    
    if (level === 'error') {
      requestLogger.error('Request completed with server error', undefined, meta);
    } else if (level === 'warn') {
      requestLogger.warn('Request completed with client error', undefined, meta);
    } else {
      requestLogger.info('Request completed', meta);
    }
    
    // Also write to legacy format for backward compatibility
    writeLog(responseLog);
    
    // Log slow requests
    if (duration > observabilityConfig.thresholds.slowRequestMs) {
      requestLogger.warn('Slow request detected', undefined, {
        ...meta,
        threshold: observabilityConfig.thresholds.slowRequestMs,
      });
    }
  });
  
  // Capture errors
  res.on('error', (error: Error) => {
    const duration = Date.now() - startTime;
    
    requestLogger.error('Request error', error, {
      method: req.method,
      path: req.path,
      duration,
      statusCode: res.statusCode,
    });
    
    writeLog({
      timestamp: new Date().toISOString(),
      level: 'error',
      requestId,
      method: req.method,
      path: req.path,
      ip: requestLog.ip,
      duration,
      statusCode: res.statusCode,
      error: error.message,
    });
  });
  
  next();
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      requestLogger?: ILogger;
    }
  }
}

/**
 * Get logger instance for manual logging (backward compatible)
 * @deprecated Use createRequestLogger from utils/logger instead
 */
export function getLogger(requestId: string) {
  return createRequestLogger(requestId);
}

export default requestLogger;
