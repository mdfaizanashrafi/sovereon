/**
 * ============================================================================
 * USER REPOSITORY
 * ============================================================================
 * Data access layer for User entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type User = Prisma.UserGetPayload<{}>;
export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;
export type UserWhereUnique = Prisma.UserWhereUniqueInput;

/**
 * User Repository
 * Handles all database operations for users
 */
export class UserRepository extends BaseRepository<
  User,
  CreateUserInput,
  UpdateUserInput,
  UserWhereUnique
> {
  protected modelName: keyof PrismaClient = 'user';

  /**
   * Find all users with admin-safe fields (excludes sensitive data)
   */
  async findAllForAdmin(options?: QueryOptions): Promise<User[]> {
    return this.model.findMany({
      where: options?.filters,
      orderBy: this.buildSort(options?.sort),
      skip: this.buildPagination(options?.pagination)?.skip,
      take: this.buildPagination(options?.pagination)?.take,
      include: options?.include,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        companyName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where: any = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }
}

export default UserRepository;
