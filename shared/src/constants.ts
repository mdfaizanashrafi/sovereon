/**
 * ============================================================================
 * SHARED CONSTANTS
 * ============================================================================
 * Replace magic strings throughout the application
 */

// ============================================================================
// ORDER STATUS
// ============================================================================
export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// ============================================================================
// PAYMENT STATUS
// ============================================================================
export const PaymentStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

// ============================================================================
// USER ROLES
// ============================================================================
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// ============================================================================
// USER STATUS
// ============================================================================
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// ============================================================================
// AUTH PROVIDERS
// ============================================================================
export const AuthProvider = {
  EMAIL: 'email',
  GOOGLE: 'google',
  GITHUB: 'github',
} as const;

export type AuthProvider = typeof AuthProvider[keyof typeof AuthProvider];

// ============================================================================
// PRICING MODELS
// ============================================================================
export const PricingModel = {
  FIXED: 'fixed',
  CUSTOM: 'custom',
  MONTHLY: 'monthly',
  USAGE_BASED: 'usage-based',
} as const;

export type PricingModel = typeof PricingModel[keyof typeof PricingModel];

// ============================================================================
// SUBSCRIPTION STATUS
// ============================================================================
export const SubscriptionStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PAST_DUE: 'past_due',
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

// ============================================================================
// INVOICE STATUS
// ============================================================================
export const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================
export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// ============================================================================
// API ERROR CODES
// ============================================================================
export const ApiErrorCode = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type ApiErrorCode = typeof ApiErrorCode[keyof typeof ApiErrorCode];

// ============================================================================
// HTTP STATUS MESSAGES
// ============================================================================
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================
export const PaginationDefaults = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================================================
// CACHE TTL (seconds)
// ============================================================================
export const CacheTTL = {
  PUBLIC: 300,      // 5 minutes
  ADMIN: 60,        // 1 minute
  STATIC: 86400,    // 24 hours
} as const;
