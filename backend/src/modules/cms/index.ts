/**
 * ============================================================================
 * CMS MODULE - BARREL EXPORTS
 * ============================================================================
 * Feature module for content management (team members, etc.)
 */

// ============================================================================
// DOMAIN
// ============================================================================
export { TeamMember } from './domain/entities/TeamMember';

// ============================================================================
// APPLICATION - COMMANDS
// ============================================================================
export { 
  CreateTeamMemberCommand,
  CreateTeamMemberCommandHandler,
  type CreateTeamMemberDTO,
  type CreateTeamMemberResult 
} from './application/commands/CreateTeamMember';

export { 
  UpdateTeamMemberCommand,
  UpdateTeamMemberCommandHandler,
  type UpdateTeamMemberResult 
} from './application/commands/UpdateTeamMember';

export { 
  DeleteTeamMemberCommand,
  DeleteTeamMemberCommandHandler,
  type DeleteTeamMemberResult 
} from './application/commands/DeleteTeamMember';

// ============================================================================
// APPLICATION - QUERIES
// ============================================================================
export { 
  GetTeamMembersQuery,
  GetTeamMembersQueryHandler,
  type GetTeamMembersResult 
} from './application/queries/GetTeamMembers';

export { 
  GetTeamMemberByIdQuery,
  GetTeamMemberByIdQueryHandler,
  type GetTeamMemberByIdResult 
} from './application/queries/GetTeamMemberById';

// ============================================================================
// INFRASTRUCTURE
// ============================================================================
export { TeamMemberRepository } from './infrastructure/repositories/TeamMemberRepository';

// ============================================================================
// INTERFACE (HTTP)
// ============================================================================
export { TeamMemberController } from './interface/http/controllers/TeamMemberController';
export { createTeamMemberRoutes } from './interface/http/routes';
