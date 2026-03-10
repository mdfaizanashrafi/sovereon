/**
 * ============================================================================
 * TEAM MEMBER CONTROLLER
 * ============================================================================
 */

import { Request, Response } from 'express';
import { TeamMemberRepository } from '../../../infrastructure/repositories/TeamMemberRepository';
import { GetTeamMembersQueryHandler } from '../../../application/queries/GetTeamMembers';
import { CreateTeamMemberCommandHandler } from '../../../application/commands/CreateTeamMember';
import { UpdateTeamMemberCommandHandler } from '../../../application/commands/UpdateTeamMember';
import { DeleteTeamMemberCommandHandler } from '../../../application/commands/DeleteTeamMember';
import { getCacheService } from '../../../../../infrastructure/cache';
import { formatResponse } from '../../../../../utils/errors';

export class TeamMemberController {
  private repository: TeamMemberRepository;
  private cache: ReturnType<typeof getCacheService>;

  constructor() {
    this.repository = new TeamMemberRepository();
    this.cache = getCacheService();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const handler = new GetTeamMembersQueryHandler(this.repository);
    
    const result = await handler.execute({
      isActive: req.query.isActive === 'true' ? true : 
                req.query.isActive === 'false' ? false : undefined,
      department: req.query.department as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });

    res.json(formatResponse(true, {
      data: result.data.map(d => d.toJSON()),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }
    }));
  }

  async getById(req: Request, res: Response): Promise<void> {
    const member = await this.repository.findById(req.params.id);
    
    if (!member) {
      res.status(404).json(formatResponse(false, null, 'Team member not found'));
      return;
    }

    res.json(formatResponse(true, member));
  }

  async create(req: Request, res: Response): Promise<void> {
    const handler = new CreateTeamMemberCommandHandler(this.repository, this.cache);
    
    const result = await handler.execute({
      name: req.body.name,
      role: req.body.role,
      department: req.body.department,
      description: req.body.description,
      image: req.body.image,
      order: req.body.order,
    });

    if (!result.success) {
      res.status(400).json(formatResponse(false, null, result.error));
      return;
    }

    res.status(201).json(formatResponse(true, result.data?.toJSON()));
  }

  async update(req: Request, res: Response): Promise<void> {
    const handler = new UpdateTeamMemberCommandHandler(this.repository, this.cache);
    
    const result = await handler.execute({
      id: req.params.id,
      name: req.body.name,
      role: req.body.role,
      department: req.body.department,
      description: req.body.description,
      image: req.body.image,
      order: req.body.order,
      isActive: req.body.isActive,
    });

    if (!result.success) {
      res.status(result.error === 'Team member not found' ? 404 : 400)
        .json(formatResponse(false, null, result.error));
      return;
    }

    res.json(formatResponse(true, result.data?.toJSON()));
  }

  async delete(req: Request, res: Response): Promise<void> {
    const handler = new DeleteTeamMemberCommandHandler(this.repository, this.cache);
    
    const result = await handler.execute({ id: req.params.id });

    if (!result.success) {
      res.status(404).json(formatResponse(false, null, result.error));
      return;
    }

    res.json(formatResponse(true, { message: 'Team member deleted' }));
  }
}

export default TeamMemberController;
