/**
 * ============================================================================
 * VALIDATION UTILITIES TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

// Validation utility functions
const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

const isMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

const isNumber = (value: unknown): boolean => {
  return typeof value === 'number' && !isNaN(value);
};

const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

const isPositive = (value: number): boolean => {
  return value > 0;
};

const isNonNegative = (value: number): boolean => {
  return value >= 0;
};

const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return pattern.test(value);
};

const isURL = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isPhoneNumber = (value: string): boolean => {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(value);
};

const isStrongPassword = (value: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value);
};

const isDate = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const isDateInPast = (value: string): boolean => {
  const date = new Date(value);
  const now = new Date();
  return date < now;
};

const isDateInFuture = (value: string): boolean => {
  const date = new Date(value);
  const now = new Date();
  return date > now;
};

const isEqual = (value1: unknown, value2: unknown): boolean => {
  return value1 === value2;
};

const contains = (value: string, substring: string): boolean => {
  return value.includes(substring);
};

const startsWith = (value: string, prefix: string): boolean => {
  return value.startsWith(prefix);
};

const endsWith = (value: string, suffix: string): boolean => {
  return value.endsWith(suffix);
};

const isAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

const isAlpha = (value: string): boolean => {
  return /^[a-zA-Z]+$/.test(value);
};

const isNumeric = (value: string): boolean => {
  return /^[0-9]+$/.test(value);
};

const isJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

describe('Validation Utilities', () => {
  describe('isRequired', () => {
    it('returns false for empty string', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });

    it('returns true for non-empty string', () => {
      expect(isRequired('hello')).toBe(true);
      expect(isRequired('  hello  ')).toBe(true);
    });

    it('returns false for empty array', () => {
      expect(isRequired([])).toBe(false);
    });

    it('returns true for non-empty array', () => {
      expect(isRequired([1, 2, 3])).toBe(true);
    });

    it('returns true for numbers', () => {
      expect(isRequired(0)).toBe(true);
      expect(isRequired(42)).toBe(true);
    });
  });

  describe('isEmail', () => {
    it('returns true for valid emails', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user.name@domain.co.in')).toBe(true);
      expect(isEmail('user+tag@example.com')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isEmail('')).toBe(false);
      expect(isEmail('invalid')).toBe(false);
      expect(isEmail('@example.com')).toBe(false);
      expect(isEmail('test@')).toBe(false);
      expect(isEmail('test@domain')).toBe(false);
    });
  });

  describe('isMinLength', () => {
    it('returns true when string meets minimum length', () => {
      expect(isMinLength('hello', 3)).toBe(true);
      expect(isMinLength('hello', 5)).toBe(true);
    });

    it('returns false when string is too short', () => {
      expect(isMinLength('hi', 3)).toBe(false);
    });

    it('handles empty string', () => {
      expect(isMinLength('', 1)).toBe(false);
    });
  });

  describe('isMaxLength', () => {
    it('returns true when string is within maximum length', () => {
      expect(isMaxLength('hi', 10)).toBe(true);
      expect(isMaxLength('hello', 5)).toBe(true);
    });

    it('returns false when string is too long', () => {
      expect(isMaxLength('hello world', 5)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('returns true for valid numbers', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-5)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it('returns false for NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isNumber('42')).toBe(false);
      expect(isNumber(null)).toBe(false);
    });
  });

  describe('isInteger', () => {
    it('returns true for integers', () => {
      expect(isInteger(42)).toBe(true);
      expect(isInteger(0)).toBe(true);
      expect(isInteger(-5)).toBe(true);
    });

    it('returns false for floats', () => {
      expect(isInteger(3.14)).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('returns true for positive numbers', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(0.1)).toBe(true);
    });

    it('returns false for zero and negative', () => {
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
    });
  });

  describe('isNonNegative', () => {
    it('returns true for non-negative numbers', () => {
      expect(isNonNegative(0)).toBe(true);
      expect(isNonNegative(5)).toBe(true);
    });

    it('returns false for negative numbers', () => {
      expect(isNonNegative(-1)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('returns true when value is in range', () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true);
      expect(isInRange(10, 0, 10)).toBe(true);
    });

    it('returns false when value is out of range', () => {
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(11, 0, 10)).toBe(false);
    });
  });

  describe('matchesPattern', () => {
    it('returns true when pattern matches', () => {
      expect(matchesPattern('abc123', /^[a-z0-9]+$/)).toBe(true);
      expect(matchesPattern('ABC', /^[A-Z]+$/)).toBe(true);
    });

    it('returns false when pattern does not match', () => {
      expect(matchesPattern('ABC', /^[a-z]+$/)).toBe(false);
    });
  });

  describe('isURL', () => {
    it('returns true for valid URLs', () => {
      expect(isURL('https://example.com')).toBe(true);
      expect(isURL('http://localhost:3000')).toBe(true);
      expect(isURL('ftp://files.example.com')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isURL('')).toBe(false);
      expect(isURL('not-a-url')).toBe(false);
      expect(isURL('example.com')).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('returns true for valid phone numbers', () => {
      expect(isPhoneNumber('1234567890')).toBe(true);
      expect(isPhoneNumber('+1 234-567-8900')).toBe(true);
      expect(isPhoneNumber('(123) 456-7890')).toBe(true);
    });

    it('returns false for invalid phone numbers', () => {
      expect(isPhoneNumber('123')).toBe(false);
      expect(isPhoneNumber('abc')).toBe(false);
      expect(isPhoneNumber('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('returns true for strong passwords', () => {
      expect(isStrongPassword('Strong1!')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
    });

    it('returns false for weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('Password1')).toBe(false); // No special char
    });
  });

  describe('isDate', () => {
    it('returns true for valid dates', () => {
      expect(isDate('2026-03-10')).toBe(true);
      expect(isDate('2026-03-10T12:00:00')).toBe(true);
      expect(isDate('March 10, 2026')).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isDate('')).toBe(false);
      expect(isDate('invalid')).toBe(false);
      expect(isDate('2026-13-45')).toBe(false);
    });
  });

  describe('isDateInPast', () => {
    it('returns true for past dates', () => {
      expect(isDateInPast('2020-01-01')).toBe(true);
    });

    it('returns false for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(isDateInPast(future.toISOString())).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('returns true for future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      expect(isDateInFuture(future.toISOString())).toBe(true);
    });

    it('returns false for past dates', () => {
      expect(isDateInFuture('2020-01-01')).toBe(false);
    });
  });

  describe('isEqual', () => {
    it('returns true for equal values', () => {
      expect(isEqual('test', 'test')).toBe(true);
      expect(isEqual(42, 42)).toBe(true);
    });

    it('returns false for different values', () => {
      expect(isEqual('a', 'b')).toBe(false);
      expect(isEqual(1, 2)).toBe(false);
    });
  });

  describe('contains', () => {
    it('returns true when substring is found', () => {
      expect(contains('hello world', 'world')).toBe(true);
    });

    it('returns false when substring is not found', () => {
      expect(contains('hello world', 'foo')).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('returns true when string starts with prefix', () => {
      expect(startsWith('hello world', 'hello')).toBe(true);
    });

    it('returns false when string does not start with prefix', () => {
      expect(startsWith('hello world', 'world')).toBe(false);
    });
  });

  describe('endsWith', () => {
    it('returns true when string ends with suffix', () => {
      expect(endsWith('hello world', 'world')).toBe(true);
    });

    it('returns false when string does not end with suffix', () => {
      expect(endsWith('hello world', 'hello')).toBe(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('returns true for alphanumeric strings', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
      expect(isAlphanumeric('ABC')).toBe(true);
    });

    it('returns false for non-alphanumeric strings', () => {
      expect(isAlphanumeric('abc-123')).toBe(false);
      expect(isAlphanumeric('abc 123')).toBe(false);
    });
  });

  describe('isAlpha', () => {
    it('returns true for alphabetic strings', () => {
      expect(isAlpha('abc')).toBe(true);
      expect(isAlpha('ABC')).toBe(true);
    });

    it('returns false for non-alphabetic strings', () => {
      expect(isAlpha('abc123')).toBe(false);
      expect(isAlpha('abc ')).toBe(false);
    });
  });

  describe('isNumeric', () => {
    it('returns true for numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
    });

    it('returns false for non-numeric strings', () => {
      expect(isNumeric('123a')).toBe(false);
      expect(isNumeric('12.3')).toBe(false);
    });
  });

  describe('isJSON', () => {
    it('returns true for valid JSON', () => {
      expect(isJSON('{"key": "value"}')).toBe(true);
      expect(isJSON('[1, 2, 3]')).toBe(true);
      expect(isJSON('"string"')).toBe(true);
      expect(isJSON('123')).toBe(true);
      expect(isJSON('true')).toBe(true);
      expect(isJSON('null')).toBe(true);
    });

    it('returns false for invalid JSON', () => {
      expect(isJSON('')).toBe(false);
      expect(isJSON('{invalid}')).toBe(false);
      expect(isJSON('undefined')).toBe(false);
    });
  });
});
