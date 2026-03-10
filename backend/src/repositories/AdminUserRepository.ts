/**
 * ============================================================================
 * ADMIN USER REPOSITORY
 * ============================================================================
 * Data access layer for AdminUser entity
 */

import { BaseRepository } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type AdminUser = Prisma.AdminUserGetPayload<{}>;
export type CreateAdminUserInput = Prisma.AdminUserCreateInput;
export type UpdateAdminUserInput = Prisma.AdminUserUpdateInput;
export type AdminUserWhereUnique = Prisma.AdminUserWhereUniqueInput;

/**
 * AdminUser Repository
 * Handles all database operations for admin users
 */
export class AdminUserRepository extends BaseRepository<
  AdminUser,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  AdminUserWhereUnique
> {
  protected modelName: keyof PrismaClient = 'adminUser';

  /**
   * Find admin by username
   */
  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.model.findUnique({
      where: { username },
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<AdminUser> {
    return this.model.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    const where: any = { username };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }
}

export default AdminUserRepository;
