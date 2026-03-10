/**
 * ============================================================================
 * FILE UPLOAD TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { validateFile, sanitizeFilename, generateUploadPath } from '../file-upload';

describe('validateFile', () => {
  it('accepts valid image file', () => {
    const file = {
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
    };
    
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects file exceeding size limit', () => {
    const file = {
      originalname: 'large.jpg',
      mimetype: 'image/jpeg',
      size: 10 * 1024 * 1024, // 10MB
    };
    
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds');
  });

  it('rejects invalid MIME type', () => {
    const file = {
      originalname: 'script.exe',
      mimetype: 'application/x-msdownload',
      size: 1024,
    };
    
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File type');
  });

  it('rejects invalid extension', () => {
    const file = {
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    };
    
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File type');
  });

  it('rejects filenames with null bytes', () => {
    const file = {
      originalname: 'file\0.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    };
    
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid');
  });
});

describe('sanitizeFilename', () => {
  it('removes path traversal attempts', () => {
    const result = sanitizeFilename('../../../etc/passwd.jpg');
    expect(result).not.toContain('../');
    expect(result.endsWith('.jpg')).toBe(true);
  });

  it('replaces dangerous characters', () => {
    const result = sanitizeFilename('file<>:"/\\|?*.jpg');
    expect(result).not.toMatch(/[<>:"/\\|?*]/);
  });

  it('adds timestamp to prevent collisions', () => {
    const result = sanitizeFilename('photo.jpg');
    expect(result).toMatch(/photo_\d+\.jpg/);
  });

  it('handles empty filename', () => {
    const result = sanitizeFilename('');
    expect(result).toContain('file_');
  });
});

describe('generateUploadPath', () => {
  it('generates path with year and month', () => {
    const result = generateUploadPath('photo.jpg', 'uploads');
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    expect(result).toContain('uploads');
    expect(result).toContain(String(year));
    expect(result).toContain(month);
  });

  it('includes sanitized filename', () => {
    const result = generateUploadPath('my photo.jpg', 'uploads');
    expect(result).toContain('my photo_');
    expect(result.endsWith('.jpg')).toBe(true);
  });
});
