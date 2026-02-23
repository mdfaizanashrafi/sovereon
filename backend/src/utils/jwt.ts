import jwt, { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'your-secret-key') as string;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Verify JWT token
 * Note: Customer login has been removed. This is kept for backwards compatibility
 * with existing routes that use authMiddleware.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
