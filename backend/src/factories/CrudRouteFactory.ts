/**
 * ============================================================================
 * CRUD ROUTE FACTORY
 * ============================================================================
 * Generic factory for creating CRUD routes for any entity.
 * Reduces repetitive route definitions in admin and public routes.
 */

import express, { Request, Response, Router } from 'express';
import { z, ZodSchema } from 'zod';
import { asyncHandler } from '../middleware/auth';
import { formatResponse, AppError } from '../utils/errors';

/**
 * CRUD Service Interface
 * Defines the contract for services used by the CRUD factory
 */
export interface CrudService<T = any, CreateDTO = any, UpdateDTO = any> {
  getAll(): Promise<{ success: boolean; data?: any; error?: any }>;
  getById?(id: string): Promise<{ success: boolean; data?: any; error?: any }>;
  create(data: CreateDTO): Promise<{ success: boolean; data?: any; error?: any }>;
  update(id: string, data: UpdateDTO): Promise<{ success: boolean; data?: any; error?: any }>;
  delete(id: string): Promise<{ success: boolean; data?: any; error?: any }>;
}

/**
 * Public Service Interface (read-only operations)
 */
export interface PublicService<T = any> {
  getActive(): Promise<{ success: boolean; data?: any; error?: any }>;
  getBySlug?(slug: string): Promise<{ success: boolean; data?: any; error?: any }>;
}

/**
 * CRUD Route Configuration
 */
export interface CrudRouteConfig {
  /** Base route path (e.g., 'team-members') */
  path: string;
  /** Authentication middleware (optional) */
  authMiddleware?: express.RequestHandler;
  /** Validation schema for create operations */
  createSchema?: ZodSchema;
  /** Validation schema for update operations */
  updateSchema?: ZodSchema;
  /** Custom ID parameter name (default: 'id') */
  idParam?: string;
  /** Enable GET /:id endpoint */
  enableGetById?: boolean;
  /** Enable slug-based lookup */
  enableSlugLookup?: boolean;
  /** Slug parameter name (default: 'slug') */
  slugParam?: string;
}

/**
 * CRUD Route Factory
 * Creates standardized CRUD routes for CMS entities
 */
export class CrudRouteFactory {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  /**
   * Create admin CRUD routes
   */
  createAdminRoutes<T, CreateDTO = any, UpdateDTO = any>(
    config: CrudRouteConfig,
    service: CrudService<T, CreateDTO, UpdateDTO>
  ): Router {
    const { 
      path, 
      authMiddleware, 
      createSchema, 
      updateSchema,
      idParam = 'id',
      enableGetById = true 
    } = config;

    const routePath = `/${path}`;
    const itemPath = `${routePath}/:${idParam}`;

    // GET / - List all
    this.router.get(
      routePath,
      authMiddleware || [],
      asyncHandler(async (_req: Request, res: Response) => {
        const result = await service.getAll();
        res.json(result);
      })
    );

    // GET /:id - Get by ID (optional)
    if (enableGetById) {
      this.router.get(
        itemPath,
        authMiddleware || [],
        asyncHandler(async (req: Request, res: Response) => {
          if (!service.getById) {
            throw new AppError('NOT_IMPLEMENTED', 'Get by ID not supported', 501);
          }
          const result = await service.getById(req.params[idParam]);
          if (!result.success || !result.data) {
            throw new AppError('NOT_FOUND', `${path} not found`, 404);
          }
          res.json(result);
        })
      );
    }

    // POST / - Create
    this.router.post(
      routePath,
      authMiddleware || [],
      asyncHandler(async (req: Request, res: Response) => {
        // Validate request body if schema provided
        if (createSchema) {
          const validation = createSchema.safeParse(req.body);
          if (!validation.success) {
            throw new AppError(
              'VALIDATION_ERROR',
              validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
              400
            );
          }
          req.body = validation.data;
        }

        const result = await service.create(req.body);
        if (!result.success) {
          throw new AppError('CREATE_FAILED', result.error?.message || 'Failed to create', 400);
        }
        res.status(201).json(result);
      })
    );

    // PUT /:id - Update
    this.router.put(
      itemPath,
      authMiddleware || [],
      asyncHandler(async (req: Request, res: Response) => {
        // Validate request body if schema provided
        if (updateSchema) {
          const partialSchema = (updateSchema as any).partial ? (updateSchema as any).partial() : updateSchema;
          const validation = partialSchema.safeParse(req.body);
          if (!validation.success) {
            throw new AppError(
              'VALIDATION_ERROR',
              validation.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
              400
            );
          }
          req.body = validation.data;
        }

        const result = await service.update(req.params[idParam], req.body);
        if (!result.success) {
          throw new AppError('UPDATE_FAILED', result.error?.message || 'Failed to update', 400);
        }
        res.json(result);
      })
    );

    // DELETE /:id - Delete
    this.router.delete(
      itemPath,
      authMiddleware || [],
      asyncHandler(async (req: Request, res: Response) => {
        const result = await service.delete(req.params[idParam]);
        if (!result.success) {
          throw new AppError('DELETE_FAILED', result.error?.message || 'Failed to delete', 400);
        }
        res.json(result);
      })
    );

    return this.router;
  }

  /**
   * Create public read-only routes
   */
  createPublicRoutes<T>(
    config: CrudRouteConfig,
    service: PublicService<T>
  ): Router {
    const { 
      path, 
      enableGetById = false,
      enableSlugLookup = false,
      slugParam = 'slug'
    } = config;

    const routePath = `/${path}`;

    // GET / - List active items
    this.router.get(
      routePath,
      asyncHandler(async (_req: Request, res: Response) => {
        const result = await service.getActive();
        res.json(result);
      })
    );

    // GET /:slug - Get by slug (optional)
    if (enableSlugLookup) {
      this.router.get(
        `${routePath}/:${slugParam}`,
        asyncHandler(async (req: Request, res: Response) => {
          if (!service.getBySlug) {
            throw new AppError('NOT_IMPLEMENTED', 'Get by slug not supported', 501);
          }
          const result = await service.getBySlug(req.params[slugParam]);
          if (!result.success || !result.data) {
            throw new AppError('NOT_FOUND', `${path} not found`, 404);
          }
          res.json(result);
        })
      );
    }

    return this.router;
  }
}

/**
 * Convenience function to create admin CRUD routes
 */
export function createAdminCrudRoutes<T, CreateDTO = any, UpdateDTO = any>(
  config: CrudRouteConfig,
  service: CrudService<T, CreateDTO, UpdateDTO>
): Router {
  const factory = new CrudRouteFactory();
  return factory.createAdminRoutes(config, service);
}

/**
 * Convenience function to create public routes
 */
export function createPublicRoutes<T>(
  config: CrudRouteConfig,
  service: PublicService<T>
): Router {
  const factory = new CrudRouteFactory();
  return factory.createPublicRoutes(config, service);
}

export default CrudRouteFactory;
