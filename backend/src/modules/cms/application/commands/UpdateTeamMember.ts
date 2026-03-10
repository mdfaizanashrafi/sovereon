/**
 * ============================================================================
 * UPDATE TEAM MEMBER COMMAND
 * ============================================================================
 */

import { TeamMember } from '../../domain/entities/TeamMember';
import type { TeamMemberRepository } from '../../infrastructure/repositories/TeamMemberRepository';
import type { CacheService } from '../../../../infrastructure/cache';

export interface UpdateTeamMemberCommand {
  id: string;
  name?: string;
  role?: string;
  department?: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateTeamMemberResult {
  success: boolean;
  data?: TeamMember;
  error?: string;
}

export class UpdateTeamMemberCommandHandler {
  constructor(
    private repository: TeamMemberRepository,
    private cache?: CacheService
  ) {}

  async execute(command: UpdateTeamMemberCommand): Promise<UpdateTeamMemberResult> {
    try {
      // Check if exists
      const existing = await this.repository.findById(command.id);
      if (!existing) {
        return { success: false, error: 'Team member not found' };
      }

      // Update
      const updated = await this.repository.update(command.id, {
        name: command.name,
        role: command.role,
        department: command.department,
        description: command.description,
        image: command.image,
        order: command.order,
        isActive: command.isActive,
      });

      // Invalidate cache
      if (this.cache) {
        await this.cache.deletePattern('*', 'api:team');
      }

      return { success: true, data: new TeamMember(updated) };
    } catch (error) {
      console.error('[UpdateTeamMemberCommand] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default UpdateTeamMemberCommandHandler;
