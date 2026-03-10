/**
 * ============================================================================
 * GET TEAM MEMBERS QUERY
 * ============================================================================
 */

import { TeamMember } from '../../domain/entities/TeamMember';
import type { TeamMemberRepository } from '../../infrastructure/repositories/TeamMemberRepository';
import type { QueryOptions } from '../../../../repositories/BaseRepository';

export interface GetTeamMembersQuery {
  isActive?: boolean;
  department?: string;
  page?: number;
  limit?: number;
}

export interface GetTeamMembersResult {
  data: TeamMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetTeamMembersQueryHandler {
  constructor(private repository: TeamMemberRepository) {}

  async execute(query: GetTeamMembersQuery = {}): Promise<GetTeamMembersResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    // Build filters
    const filters: any = {};
    if (query.isActive !== undefined) filters.isActive = query.isActive;
    if (query.department) filters.department = query.department;

    const options: QueryOptions = {
      filters,
      sort: { field: 'order', direction: 'asc' },
      pagination: { page, limit },
    };

    // Fetch data
    const result = await this.repository.findPaginated(options);

    return {
      data: result.data.map((m: any) => new TeamMember(m)),
      total: result.meta.total,
      page: result.meta.page,
      limit: result.meta.limit,
      totalPages: result.meta.totalPages,
    };
  }
}

export default GetTeamMembersQueryHandler;
