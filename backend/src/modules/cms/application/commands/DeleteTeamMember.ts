/**
 * ============================================================================
 * DELETE TEAM MEMBER COMMAND
 * ============================================================================
 */

import type { TeamMemberRepository } from '../../infrastructure/repositories/TeamMemberRepository';
import type { CacheService } from '../../../../infrastructure/cache';

export interface DeleteTeamMemberCommand {
  id: string;
}

export interface DeleteTeamMemberResult {
  success: boolean;
  error?: string;
}

export class DeleteTeamMemberCommandHandler {
  constructor(
    private repository: TeamMemberRepository,
    private cache?: CacheService
  ) {}

  async execute(command: DeleteTeamMemberCommand): Promise<DeleteTeamMemberResult> {
    try {
      // Check if exists
      const existing = await this.repository.findById(command.id);
      if (!existing) {
        return { success: false, error: 'Team member not found' };
      }

      // Delete
      await this.repository.delete(command.id);

      // Invalidate cache
      if (this.cache) {
        await this.cache.deletePattern('*', 'api:team');
      }

      return { success: true };
    } catch (error) {
      console.error('[DeleteTeamMemberCommand] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default DeleteTeamMemberCommandHandler;
