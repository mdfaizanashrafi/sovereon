/**
 * ============================================================================
 * GET TEAM MEMBER BY ID QUERY
 * ============================================================================
 */

import { TeamMember } from '../../domain/entities/TeamMember';
import type { TeamMemberRepository } from '../../infrastructure/repositories/TeamMemberRepository';

export interface GetTeamMemberByIdQuery {
  id: string;
}

export interface GetTeamMemberByIdResult {
  data?: TeamMember;
  found: boolean;
}

export class GetTeamMemberByIdQueryHandler {
  constructor(private repository: TeamMemberRepository) {}

  async execute(query: GetTeamMemberByIdQuery): Promise<GetTeamMemberByIdResult> {
    const member = await this.repository.findById(query.id);
    
    if (!member) {
      return { found: false };
    }

    return { 
      found: true, 
      data: new TeamMember(member) 
    };
  }
}

export default GetTeamMemberByIdQueryHandler;
