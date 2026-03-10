/**
 * ============================================================================
 * TEAM MEMBER SERVICE - CRUD Interface
 * ============================================================================
 * Wraps repository calls to conform to CrudService interface
 */

import { TeamMemberRepository } from '../../repositories/TeamMemberRepository';
import * as cmsService from '../cms.service';

const repo = new TeamMemberRepository();

export const TeamMemberService = {
  getAll: cmsService.getAllTeamMembers,
  getActive: cmsService.getActiveTeamMembers,
  getById: async (id: string) => {
    const member = await repo.findById(id);
    return { success: true, data: member };
  },
  create: cmsService.createTeamMember,
  update: cmsService.updateTeamMember,
  delete: cmsService.deleteTeamMember,
};

export default TeamMemberService;
