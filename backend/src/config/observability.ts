/**
 * ============================================================================
 * OBSERVABILITY CONFIGURATION
 * ============================================================================
 * Centralized configuration for monitoring, logging, metrics, and tracing
 */

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Log level priorities (higher = more severe)
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * Export targets for telemetry data
 */
export type ExportTarget = 'console' | 'file' | 'http' | 'none';

/**
 * Observability configuration interface
 */
export interface ObservabilityConfig {
  /** Application environment */
  environment: string;
  /** Application name */
  appName: string;
  /** Application version */
  appVersion: string;
  /** Current log level */
  logLevel: LogLevel;
  /** Whether to output logs in JSON format */
  jsonFormat: boolean;
  /** Whether to enable colored output (development only) */
  enableColors: boolean;
  /** Whether observability is enabled */
  enabled: boolean;
  /** Metrics configuration */
  metrics: {
    /** Whether metrics collection is enabled */
    enabled: boolean;
    /** Path for Prometheus metrics endpoint */
    endpoint: string;
    /** Request duration buckets in milliseconds */
    durationBuckets: number[];
    /** Whether to include query parameters in metrics */
    includeQueryParams: boolean;
  };
  /** Tracing configuration */
  tracing: {
    /** Whether tracing is enabled */
    enabled: boolean;
    /** Sampling rate (0-1) */
    samplingRate: number;
    /** Maximum number of spans per trace */
    maxSpans: number;
    /** Whether to include request body in traces */
    includeBody: boolean;
  };
  /** Health check configuration */
  health: {
    /** Whether detailed health checks are enabled */
    enabled: boolean;
    /** Timeout for health checks in milliseconds */
    timeout: number;
    /** Whether to check external services */
    checkExternalServices: boolean;
  };
  /** Export configuration */
  export: {
    /** Primary export target */
    target: ExportTarget;
    /** File path (when target is 'file') */
    filePath?: string;
    /** HTTP endpoint (when target is 'http') */
    httpEndpoint?: string;
    /** HTTP headers for export */
    httpHeaders?: Record<string, string>;
  };
  /** Performance thresholds */
  thresholds: {
    /** Slow request threshold in milliseconds */
    slowRequestMs: number;
    /** Memory warning threshold in MB */
    memoryWarningMb: number;
    /** Disk warning threshold in percentage */
    diskWarningPercent: number;
  };
}

/**
 * PII fields to redact from logs
 */
export const PII_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'api-key',
  'creditCard',
  'credit_card',
  'credit-card',
  'ssn',
  'email',
  'phone',
  'phoneNumber',
  'phone_number',
  'phone-number',
  'address',
  'authorization',
  'cookie',
  'session',
  'pin',
  'cvv',
  'passwordHash',
  'password_hash',
  'hashedPassword',
  'refreshToken',
  'refresh_token',
  'accessToken',
  'access_token',
  'privateKey',
  'private_key',
  'cert',
  'certificate',
];

/**
 * Get observability configuration from environment variables
 */
export function getObservabilityConfig(): ObservabilityConfig {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  const isTest = env === 'test';

  return {
    environment: env,
    appName: process.env.APP_NAME || 'sovereon-backend',
    appVersion: process.env.APP_VERSION || '1.0.0',
    logLevel: (process.env.LOG_LEVEL as LogLevel) || (isProduction ? 'info' : 'debug'),
    jsonFormat: isProduction,
    enableColors: !isProduction && !isTest,
    enabled: process.env.OBSERVABILITY_ENABLED !== 'false',
    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics',
      durationBuckets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      includeQueryParams: process.env.METRICS_INCLUDE_QUERY === 'true',
    },
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true',
      samplingRate: parseFloat(process.env.TRACING_SAMPLING_RATE || '0.1'),
      maxSpans: parseInt(process.env.TRACING_MAX_SPANS || '100', 10),
      includeBody: process.env.TRACING_INCLUDE_BODY === 'true',
    },
    health: {
      enabled: process.env.HEALTH_CHECKS_ENABLED !== 'false',
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
      checkExternalServices: process.env.HEALTH_CHECK_EXTERNAL !== 'false',
    },
    export: {
      target: (process.env.LOG_EXPORT_TARGET as ExportTarget) || 'console',
      filePath: process.env.LOG_FILE_PATH,
      httpEndpoint: process.env.LOG_HTTP_ENDPOINT,
      httpHeaders: process.env.LOG_HTTP_HEADERS
        ? JSON.parse(process.env.LOG_HTTP_HEADERS)
        : undefined,
    },
    thresholds: {
      slowRequestMs: parseInt(process.env.SLOW_REQUEST_MS || '1000', 10),
      memoryWarningMb: parseInt(process.env.MEMORY_WARNING_MB || '1024', 10),
      diskWarningPercent: parseInt(process.env.DISK_WARNING_PERCENT || '90', 10),
    },
  };
}

/**
 * Default configuration instance
 */
export const observabilityConfig = getObservabilityConfig();

/**
 * Check if a log level should be logged based on configuration
 */
export function shouldLogLevel(level: LogLevel): boolean {
  if (!observabilityConfig.enabled) return false;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[observabilityConfig.logLevel];
}

/**
 * Check if metrics collection is enabled
 */
export function isMetricsEnabled(): boolean {
  return observabilityConfig.enabled && observabilityConfig.metrics.enabled;
}

/**
 * Check if tracing is enabled
 */
export function isTracingEnabled(): boolean {
  return observabilityConfig.enabled && observabilityConfig.tracing.enabled;
}

export default observabilityConfig;
