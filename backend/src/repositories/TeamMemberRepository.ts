/**
 * ============================================================================
 * TEAM MEMBER REPOSITORY
 * ============================================================================
 * Data access layer for TeamMember entity
 */

import { BaseRepository, type QueryOptions, type PaginatedResult } from './BaseRepository';
import type { PrismaClient, Prisma } from '@prisma/client';

// Type definitions
export type TeamMember = Prisma.TeamMemberGetPayload<{}>;
export type CreateTeamMemberInput = Prisma.TeamMemberCreateInput;
export type UpdateTeamMemberInput = Prisma.TeamMemberUpdateInput;
export type TeamMemberWhereUnique = Prisma.TeamMemberWhereUniqueInput;

/**
 * TeamMember Repository
 * Handles all database operations for team members
 */
export class TeamMemberRepository extends BaseRepository<
  TeamMember,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  TeamMemberWhereUnique
> {
  protected modelName: keyof PrismaClient = 'teamMember';

  /**
   * Find all active team members ordered by display order
   */
  async findActive(options?: Omit<QueryOptions, 'filters'>): Promise<TeamMember[]> {
    return this.findAll({
      ...options,
      filters: { isActive: true },
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Find paginated active team members
   */
  async findActivePaginated(options?: Omit<QueryOptions, 'filters'>): Promise<PaginatedResult<TeamMember>> {
    return this.findPaginated({
      ...options,
      filters: { isActive: true },
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Find team members by department
   */
  async findByDepartment(department: string, activeOnly = true): Promise<TeamMember[]> {
    const filters: any = { department };
    if (activeOnly) filters.isActive = true;

    return this.findAll({
      filters,
      sort: { field: 'order', direction: 'asc' },
    });
  }

  /**
   * Get the next order number for a new team member
   */
  async getNextOrder(): Promise<number> {
    const result = await this.model.aggregate({
      _max: { order: true },
    });
    return (result._max.order || 0) + 1;
  }

  /**
   * Reorder team members
   */
  async reorder(orderedIds: string[]): Promise<void> {
    await this.transaction(async (prisma) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await prisma.teamMember.update({
          where: { id: orderedIds[i] },
          data: { order: i },
        });
      }
    });
  }
}

export default TeamMemberRepository;
