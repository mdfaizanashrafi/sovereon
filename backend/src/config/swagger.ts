/**
 * ============================================================================
 * SWAGGER / OPENAPI CONFIGURATION
 * ============================================================================
 * API documentation using Swagger/OpenAPI 3.0
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sovereon API',
      version: '1.0.0',
      description: `
## Sovereon Inc. API Documentation

This is the official API documentation for Sovereon Inc.

### Versions
- **Current**: v1 (\`/api/v1/*\`)
- **Legacy**: Deprecated (\`/api/*\`) - Will be removed in v2

### Authentication
Admin endpoints require session-based authentication. Login via \`/api/v1/admin/auth/login\`.

### Pagination
List endpoints support pagination with:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

### Response Format
All responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": {},
  "meta": { // For paginated responses
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`
      `,
      contact: {
        name: 'Sovereon Inc.',
        email: 'partners@sovereon.online',
        url: 'https://sovereon.online',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API Version 1',
      },
      {
        url: '/api',
        description: 'Legacy API (Deprecated)',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'Admin authentication endpoints' },
      { name: 'Team Members', description: 'Team member management' },
      { name: 'Services', description: 'Service catalog and categories' },
      { name: 'Testimonials', description: 'Customer testimonials' },
      { name: 'FAQs', description: 'Frequently asked questions' },
      { name: 'Case Studies', description: 'Portfolio case studies' },
      { name: 'Blog', description: 'Blog posts and articles' },
      { name: 'Content', description: 'Page content and settings' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sovereon.sid',
          description: 'Session cookie for admin authentication',
        },
      },
      schemas: {
        TeamMember: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cl1234567890abcdef' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', example: 'Software Engineer' },
            department: { type: 'string', example: 'Engineering' },
            description: { type: 'string', example: 'Full-stack developer with 5 years experience' },
            image: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
            order: { type: 'integer', example: 1 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ServiceCategory: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string', example: 'ai-services' },
            title: { type: 'string', example: 'AI Services' },
            description: { type: 'string', example: 'AI-powered solutions for your business' },
            order: { type: 'integer', example: 1 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string', example: 'ai-seo-search' },
            title: { type: 'string', example: 'AI SEO Search' },
            categoryId: { type: 'string' },
            shortDescription: { type: 'string' },
            fullDescription: { type: 'string' },
            features: { type: 'string', description: 'JSON array of features' },
            benefits: { type: 'string', description: 'JSON array of benefits' },
            strategy: { type: 'string', description: 'JSON array of strategy steps' },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Testimonial: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Jane Smith' },
            company: { type: 'string', example: 'Acme Corp' },
            role: { type: 'string', example: 'CEO' },
            content: { type: 'string', example: 'Great service!' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            avatar: { type: 'string', nullable: true },
            beforeMetric: { type: 'string', nullable: true },
            afterMetric: { type: 'string', nullable: true },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FAQ: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            question: { type: 'string', example: 'What services do you offer?' },
            answer: { type: 'string', example: 'We offer AI, software development, and marketing services.' },
            category: { type: 'string', example: 'General' },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CaseStudy: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            client: { type: 'string' },
            industry: { type: 'string' },
            description: { type: 'string' },
            challenge: { type: 'string' },
            solution: { type: 'string' },
            results: { type: 'string' },
            image: { type: 'string', nullable: true },
            technologies: { type: 'string', description: 'JSON array' },
            metrics: { type: 'string', description: 'JSON array' },
            testimonial: { type: 'string', nullable: true, description: 'JSON object' },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BlogPost: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            excerpt: { type: 'string' },
            content: { type: 'string' },
            image: { type: 'string', nullable: true },
            category: { type: 'string' },
            tags: { type: 'string', description: 'JSON array' },
            author: { type: 'string', description: 'JSON object' },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            isPublished: { type: 'boolean' },
            order: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Resource not found' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/v1/*.ts',
    './src/routes/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 */
export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Sovereon API Documentation',
  }));

  // Swagger JSON endpoint
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('[Swagger] API documentation available at /api/docs');
}

export default setupSwagger;
