/**
 * Security Utilities
 * Helper functions for security-related operations
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Constant time comparison to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Sanitize HTML to prevent XSS
 * Basic implementation - consider using a library like DOMPurify for production
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 8 characters, at least one letter and one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Check if string contains SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION\s+SELECT/i,
    /INSERT\s+INTO/i,
    /DELETE\s+FROM/i,
    /DROP\s+TABLE/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Security audit result interface
 */
export interface SecurityAuditResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

/**
 * Run security audit on environment and configuration
 */
export function runSecurityAudit(): SecurityAuditResult {
  const checks: SecurityAuditResult['checks'] = [];
  
  // Check SESSION_SECRET
  const sessionSecret = process.env.SESSION_SECRET;
  checks.push({
    name: 'Session Secret',
    passed: !!sessionSecret && sessionSecret.length >= 32 && !sessionSecret.includes('default'),
    message: sessionSecret 
      ? (sessionSecret.length < 32 ? 'SESSION_SECRET should be at least 32 characters' : 'OK')
      : 'SESSION_SECRET is not set',
  });
  
  // Check NODE_ENV
  checks.push({
    name: 'Node Environment',
    passed: process.env.NODE_ENV === 'production',
    message: `NODE_ENV is ${process.env.NODE_ENV || 'not set'}`,
  });
  
  // Check HTTPS in production (indirect check via secure cookie)
  checks.push({
    name: 'HTTPS Enforcement',
    passed: process.env.NODE_ENV !== 'production' || !!process.env.FRONTEND_URL?.startsWith('https'),
    message: 'Ensure HTTPS is used in production',
  });
  
  // Check CORS origin
  checks.push({
    name: 'CORS Configuration',
    passed: !!process.env.FRONTEND_URL,
    message: process.env.FRONTEND_URL ? `CORS origin: ${process.env.FRONTEND_URL}` : 'FRONTEND_URL not set (using default)',
  });
  
  // Check database URL uses SSL in production
  const dbUrl = process.env.DATABASE_URL || '';
  checks.push({
    name: 'Database SSL',
    passed: process.env.NODE_ENV !== 'production' || dbUrl.includes('sslmode') || dbUrl.includes('ssl'),
    message: 'Ensure database connection uses SSL in production',
  });
  
  return {
    passed: checks.every(c => c.passed),
    checks,
  };
}

/**
 * Log security audit results
 */
export function logSecurityAudit(): void {
  const result = runSecurityAudit();
  
  console.log('\n🔒 Security Audit:');
  console.log('==================');
  
  result.checks.forEach(check => {
    const status = check.passed ? '✅' : '⚠️';
    console.log(`${status} ${check.name}: ${check.message}`);
  });
  
  console.log('==================');
  console.log(result.passed ? '✅ All security checks passed' : '⚠️ Some security checks failed');
  console.log('');
}
