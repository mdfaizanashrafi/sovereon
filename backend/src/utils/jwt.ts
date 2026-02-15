import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'your-secret-key') as string;
const JWT_EXPIRY: string | number = process.env.JWT_EXPIRY || '15m';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as any);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const refreshExpiry: string | number = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn: refreshExpiry } as any);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}
