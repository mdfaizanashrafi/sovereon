/**
 * ============================================================================
 * STRUCTURED LOGGER
 * ============================================================================
 * Production-grade logging with JSON format, context injection, and PII redaction
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ObservabilityConfig,
  LogLevel,
  LOG_LEVEL_PRIORITY,
  PII_FIELDS,
  getObservabilityConfig,
  shouldLogLevel,
} from '../config/observability';

/**
 * Log context for request tracing
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  version: string;
  environment: string;
  context?: LogContext;
  error?: {
    message: string;
    name: string;
    stack?: string;
    code?: string;
  };
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Performance log entry
 */
export interface PerformanceLog {
  timestamp: string;
  type: 'performance';
  operation: string;
  duration: number;
  threshold: number;
  isSlow: boolean;
  context?: LogContext;
  metadata?: Record<string, any>;
}

// Global configuration
let config: ObservabilityConfig = getObservabilityConfig();

// In-memory log buffer for batched exports
const logBuffer: LogEntry[] = [];
let flushInterval: NodeJS.Timeout | null = null;

/**
 * Initialize the logger with configuration
 */
export function initializeLogger(userConfig?: Partial<ObservabilityConfig>): void {
  config = { ...config, ...userConfig };
  
  // Setup periodic flush for file/http exports
  if (config.export.target !== 'console' && !flushInterval) {
    flushInterval = setInterval(flushLogs, 5000);
  }
}

/**
 * Redact PII from log data
 */
export function redactPII(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactPII(item));
  }

  const redacted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key matches any PII field
    const isPII = PII_FIELDS.some(field => 
      lowerKey === field.toLowerCase() || 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isPII && value !== undefined && value !== null) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactPII(value);
    } else {
      redacted[key] = value;
    }
  }
  
  return redacted;
}

/**
 * Sanitize error for logging
 */
function sanitizeError(error: Error | unknown): LogEntry['error'] {
  if (!(error instanceof Error)) {
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  return {
    name: error.name,
    message: error.message,
    stack: config.environment !== 'production' ? error.stack : undefined,
    code: (error as any).code,
  };
}

/**
 * Format log entry for output
 */
function formatLog(entry: LogEntry): string {
  if (config.jsonFormat) {
    // Redact PII from context and metadata
    const safeEntry = {
      ...entry,
      context: entry.context ? redactPII(entry.context) : undefined,
      metadata: entry.metadata ? redactPII(entry.metadata) : undefined,
    };
    return JSON.stringify(safeEntry);
  }

  // Development format with colors
  const colors: Record<LogLevel, string> = {
    debug: '\x1b[36m',    // Cyan
    info: '\x1b[32m',     // Green
    warn: '\x1b[33m',     // Yellow
    error: '\x1b[31m',    // Red
    fatal: '\x1b[35m',    // Magenta
  };
  const reset = '\x1b[0m';

  const color = config.enableColors ? colors[entry.level] : '';
  const duration = entry.duration ? ` ${entry.duration}ms` : '';
  const requestId = entry.context?.requestId ? ` [${entry.context.requestId}]` : '';
  const userId = entry.context?.userId ? ` user:${entry.context.userId}` : '';
  
  return `${color}[${entry.timestamp}] ${entry.level.toUpperCase()}${reset}${requestId}${userId} ${entry.message}${duration}`;
}

/**
 * Write log to configured target
 */
function writeLog(entry: LogEntry): void {
  if (!shouldLogLevel(entry.level)) return;

  const formatted = formatLog(entry);

  switch (config.export.target) {
    case 'console':
      switch (entry.level) {
        case 'fatal':
        case 'error':
          console.error(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'debug':
          console.debug(formatted);
          break;
        default:
          console.log(formatted);
      }
      break;
    
    case 'file':
    case 'http':
      logBuffer.push(entry);
      // Flush immediately for fatal/error logs
      if (entry.level === 'fatal' || entry.level === 'error') {
        flushLogs();
      }
      break;
  }
}

/**
 * Flush buffered logs to target
 */
async function flushLogs(): Promise<void> {
  if (logBuffer.length === 0) return;

  const logs = [...logBuffer];
  logBuffer.length = 0;

  if (config.export.target === 'file' && config.export.filePath) {
    try {
      const fs = await import('fs');
      const data = logs.map(l => JSON.stringify(l)).join('\n') + '\n';
      fs.appendFileSync(config.export.filePath, data);
    } catch (err) {
      console.error('[Logger] Failed to write to file:', err);
    }
  }

  if (config.export.target === 'http' && config.export.httpEndpoint) {
    try {
      await fetch(config.export.httpEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.export.httpHeaders,
        },
        body: JSON.stringify({ logs }),
      });
    } catch (err) {
      console.error('[Logger] Failed to export to HTTP:', err);
    }
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error | unknown,
  metadata?: Record<string, any>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: config.appName,
    version: config.appVersion,
    environment: config.environment,
    context,
    error: error ? sanitizeError(error) : undefined,
    metadata: metadata ? redactPII(metadata) : undefined,
  };
}

/**
 * Logger interface
 */
export interface ILogger {
  child(additionalContext: LogContext): ILogger;
  debug(message: string, metadata?: Record<string, any>): void;
  info(message: string, metadata?: Record<string, any>): void;
  warn(message: string, error?: Error | unknown, metadata?: Record<string, any>): void;
  error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void;
  fatal(message: string, error?: Error | unknown, metadata?: Record<string, any>): void;
  performance(operation: string, duration: number, metadata?: Record<string, any>): void;
}

/**
 * Core logger class
 */
class Logger implements ILogger {
  private context?: LogContext;

  constructor(context?: LogContext) {
    this.context = context;
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: Record<string, any>): void {
    const entry = createLogEntry('debug', message, this.context, undefined, metadata);
    writeLog(entry);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: Record<string, any>): void {
    const entry = createLogEntry('info', message, this.context, undefined, metadata);
    writeLog(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    const entry = createLogEntry('warn', message, this.context, error, metadata);
    writeLog(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    const entry = createLogEntry('error', message, this.context, error, metadata);
    writeLog(entry);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error | unknown, metadata?: Record<string, any>): void {
    const entry = createLogEntry('fatal', message, this.context, error, metadata);
    writeLog(entry);
    // Ensure fatal logs are flushed immediately
    flushLogs();
  }

  /**
   * Log performance metric
   */
  performance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const isSlow = duration > config.thresholds.slowRequestMs;
    
    const perfLog: PerformanceLog = {
      timestamp: new Date().toISOString(),
      type: 'performance',
      operation,
      duration,
      threshold: config.thresholds.slowRequestMs,
      isSlow,
      context: this.context,
      metadata,
    };

    if (config.jsonFormat) {
      console.log(JSON.stringify(perfLog));
    } else {
      const level = isSlow ? 'WARN' : 'INFO';
      console.log(`[${perfLog.timestamp}] ${level} Performance: ${operation} took ${duration}ms${isSlow ? ' (SLOW)' : ''}`);
    }
  }
}

// Default logger instance
export const logger = new Logger();

/**
 * Create logger with request context
 */
export function createRequestLogger(requestId: string, userId?: string): ILogger {
  return new Logger({ requestId, userId });
}

/**
 * Create logger for a specific module/service
 */
export function createModuleLogger(moduleName: string): ILogger {
  return new Logger({ module: moduleName });
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Time an operation and log its performance
 */
export async function timed<T>(
  operation: string,
  fn: () => Promise<T>,
  loggerInstance: Logger = logger,
  metadata?: Record<string, any>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    loggerInstance.performance(operation, Date.now() - start, metadata);
    return result;
  } catch (error) {
    loggerInstance.performance(operation, Date.now() - start, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Time a synchronous operation
 */
export function timedSync<T>(
  operation: string,
  fn: () => T,
  loggerInstance: Logger = logger,
  metadata?: Record<string, any>
): T {
  const start = Date.now();
  try {
    const result = fn();
    loggerInstance.performance(operation, Date.now() - start, metadata);
    return result;
  } catch (error) {
    loggerInstance.performance(operation, Date.now() - start, { ...metadata, error: true });
    throw error;
  }
}

/**
 * Shutdown logger and flush remaining logs
 */
export async function shutdownLogger(): Promise<void> {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
  await flushLogs();
}

export default logger;
