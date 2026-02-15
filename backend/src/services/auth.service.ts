import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { AppError, ErrorCodes } from '../utils/errors';

const prisma = new PrismaClient();

export async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('EMAIL_EXISTS', ErrorCodes.EMAIL_EXISTS.message, 409);
  }

  const hashedPassword = await bcryptjs.hash(password, 12);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      emailVerified: true, // Auto-verify for free tier demo
    },
  });

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

  return { user: { id: user.id, email: user.email, role: user.role }, token, refreshToken };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', ErrorCodes.INVALID_CREDENTIALS.message, 401);
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('INVALID_CREDENTIALS', ErrorCodes.INVALID_CREDENTIALS.message, 401);
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

  return { user: { id: user.id, email: user.email, role: user.role }, token, refreshToken };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ 
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    }
  });
  
  if (!user) {
    throw new AppError('USER_NOT_FOUND', ErrorCodes.USER_NOT_FOUND.message, 404);
  }

  return user;
}

export async function updateUser(id: string, data: any) {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      companyName: true,
      phone: true,
      role: true,
      createdAt: true,
    }
  });

  return user;
}
