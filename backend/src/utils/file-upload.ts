/**
 * ============================================================================
 * FILE UPLOAD VALIDATION
 * ============================================================================
 * Secure file upload handling with validation
 */

import path from 'path';

export interface FileValidationOptions {
  maxSize?: number;           // bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const DEFAULT_OPTIONS: FileValidationOptions = {
  maxSize: 5 * 1024 * 1024,  // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

export function validateFile(
  file: { originalname: string; mimetype: string; size: number },
  options: FileValidationOptions = {}
): FileValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file size
  if (opts.maxSize && file.size > opts.maxSize) {
    const maxSizeMB = opts.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }
  
  // Check MIME type
  if (opts.allowedMimeTypes && !opts.allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type "${file.mimetype}" is not allowed. Allowed types: ${opts.allowedMimeTypes.join(', ')}`,
    };
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (opts.allowedExtensions && !opts.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed. Allowed extensions: ${opts.allowedExtensions.join(', ')}`,
    };
  }
  
  // Check for null bytes (path traversal attempt)
  if (file.originalname.includes('\0')) {
    return {
      valid: false,
      error: 'Invalid filename',
    };
  }
  
  return { valid: true };
}

// Sanitize filename for safe storage
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const basename = path.basename(filename);
  
  // Remove control characters
  const clean = basename.replace(/[^\x20-\x7E]/g, '');
  
  // Replace dangerous characters
  const safe = clean.replace(/[<>:"/\\|?*]/g, '_');
  
  // Ensure not empty and add timestamp to prevent collisions
  const timestamp = Date.now();
  const ext = path.extname(safe);
  const name = path.basename(safe, ext) || 'file';
  
  return `${name}_${timestamp}${ext}`;
}

// Generate secure upload path
export function generateUploadPath(
  filename: string,
  baseDir: string = 'uploads'
): string {
  const sanitized = sanitizeFilename(filename);
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return path.join(baseDir, String(year), month, sanitized);
}

// Validate image dimensions (async)
export async function validateImageDimensions(
  buffer: Buffer,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): Promise<FileValidationResult> {
  // This would require sharp or similar library
  // For now, just a placeholder
  return { valid: true };
}
