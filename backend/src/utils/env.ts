/**
 * Environment Variable Validation
 * Validates required and optional environment variables
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_VARS = [
  'DATABASE_URL',
  'SESSION_SECRET',
];

const RECOMMENDED_VARS = [
  { key: 'SMTP_PASSWORD', purpose: 'Contact form email notifications' },
  { key: 'FRONTEND_URL', purpose: 'CORS configuration' },
  { key: 'SMTP_HOST', purpose: 'Email service (defaults to smtp.zoho.in)' },
  { key: 'SMTP_PORT', purpose: 'Email service (defaults to 587)' },
  { key: 'SMTP_USER', purpose: 'Email service (defaults to partners@sovereon.online)' },
];

/**
 * Validate all environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Check recommended variables
  for (const { key, purpose } of RECOMMENDED_VARS) {
    if (!process.env[key]) {
      warnings.push(`Missing optional ${key}: ${purpose}`);
    }
  }

  // Validate SESSION_SECRET in production
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.SESSION_SECRET;
    if (secret && secret.length < 32) {
      warnings.push('SESSION_SECRET should be at least 32 characters in production');
    }
    if (secret && (secret.includes('default') || secret.includes('secret'))) {
      warnings.push('SESSION_SECRET appears to be using default value in production');
    }
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must start with postgresql://');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log environment status
 */
export function logEnvironmentStatus(): boolean {
  const result = validateEnvironment();
  
  console.log('\n📋 Environment Validation:');
  console.log('==========================');
  
  if (result.errors.length > 0) {
    console.error('❌ Errors:');
    result.errors.forEach(e => console.error(`   ${e}`));
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    result.warnings.forEach(w => console.warn(`   ${w}`));
  }
  
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ All environment variables configured correctly');
  }
  
  console.log('==========================\n');
  
  return result.valid;
}
