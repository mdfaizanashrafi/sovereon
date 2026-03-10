/**
 * ============================================================================
 * CREATE TEAM MEMBER COMMAND
 * ============================================================================
 */

import { TeamMember } from '../../domain/entities/TeamMember';
import type { TeamMemberRepository } from '../../infrastructure/repositories/TeamMemberRepository';
import type { CacheService } from '../../../../infrastructure/cache';

export interface CreateTeamMemberDTO {
  name: string;
  role: string;
  department: string;
  description: string;
  image?: string;
  order?: number;
}

export interface CreateTeamMemberCommand extends CreateTeamMemberDTO {}

export interface CreateTeamMemberResult {
  success: boolean;
  data?: TeamMember;
  error?: string;
}

export class CreateTeamMemberCommandHandler {
  constructor(
    private repository: TeamMemberRepository,
    private cache?: CacheService
  ) {}

  async execute(command: CreateTeamMemberCommand): Promise<CreateTeamMemberResult> {
    try {
      // Validation
      if (!command.name?.trim()) {
        return { success: false, error: 'Name is required' };
      }
      if (!command.role?.trim()) {
        return { success: false, error: 'Role is required' };
      }
      if (!command.department?.trim()) {
        return { success: false, error: 'Department is required' };
      }

      // Get next order if not provided
      const order = command.order ?? await this.repository.getNextOrder();

      // Create
      const created = await this.repository.create({
        name: command.name.trim(),
        role: command.role.trim(),
        department: command.department.trim(),
        description: command.description?.trim() || '',
        image: command.image?.trim(),
        order,
        isActive: true,
      });

      // Invalidate cache
      if (this.cache) {
        await this.cache.deletePattern('*', 'api:team');
      }

      return { success: true, data: new TeamMember(created) };
    } catch (error) {
      console.error('[CreateTeamMemberCommand] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default CreateTeamMemberCommandHandler;
