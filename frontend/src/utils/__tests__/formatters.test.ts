/**
 * ============================================================================
 * FORMATTER UTILITIES TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  truncateText,
  slugify,
} from '../formatters';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(99.99)).toBe('$99.99');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative amounts', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
  });

  it('formats with INR locale', () => {
    const result = formatCurrency(1000, 'en-IN', 'INR');
    expect(result).toContain('₹');
  });
});

describe('formatDate', () => {
  it('formats date string', () => {
    const date = '2026-03-10';
    expect(formatDate(date)).toBe('Mar 10, 2026');
  });

  it('formats Date object', () => {
    const date = new Date('2026-03-10');
    expect(formatDate(date)).toBe('Mar 10, 2026');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate('invalid')).toBe('');
  });
});

describe('formatPhoneNumber', () => {
  it('formats US phone numbers', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    expect(formatPhoneNumber('+11234567890')).toBe('+1 (123) 456-7890');
  });

  it('returns input for invalid/short input', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber('abc')).toBe('abc');
  });
});

describe('truncateText', () => {
  it('truncates long text', () => {
    const text = 'This is a very long text that needs truncation';
    expect(truncateText(text, 20)).toBe('This is a very lo...');
  });

  it('does not truncate short text', () => {
    const text = 'Short text';
    expect(truncateText(text, 20)).toBe('Short text');
  });

  it('uses custom suffix', () => {
    expect(truncateText('Hello world', 8, '...')).toBe('Hello...');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test 123')).toBe('test-123');
  });

  it('removes special characters', () => {
    expect(slugify('Hello @#$ World!')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello    World')).toBe('hello-world');
  });
});
