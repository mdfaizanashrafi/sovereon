/**
 * ============================================================================
 * SHARED VALIDATION SCHEMAS
 * ============================================================================
 * Zod schemas shared between frontend and backend
 */

import { z } from 'zod';
import {
  OrderStatus,
  PaymentStatus,
  UserRole,
  UserStatus,
  AuthProvider,
  PricingModel,
  SubscriptionStatus,
  InvoiceStatus,
  PaginationDefaults,
} from './constants';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const IdSchema = z.string().cuid();

export const EmailSchema = z.string().email('Invalid email address');

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]{10,20}$/, 'Invalid phone number');

export const UrlSchema = z.string().url('Invalid URL');

export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PaginationDefaults.PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PaginationDefaults.MAX_LIMIT)
    .default(PaginationDefaults.LIMIT),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  companyName: z.string().max(200).optional(),
  phone: PhoneSchema.optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  companyName: z.string().max(200).optional(),
  phone: PhoneSchema.optional(),
  avatar: UrlSchema.optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ============================================================================
// TEAM MEMBER SCHEMAS
// ============================================================================

export const CreateTeamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  department: z.string().min(1, 'Department is required').max(100),
  description: z.string().max(1000).optional(),
  image: UrlSchema.optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

export type CreateTeamMemberInput = z.infer<typeof CreateTeamMemberSchema>;

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial();

export type UpdateTeamMemberInput = z.infer<typeof UpdateTeamMemberSchema>;

// ============================================================================
// TESTIMONIAL SCHEMAS
// ============================================================================

export const CreateTestimonialSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorTitle: z.string().max(100).optional(),
  authorCompany: z.string().max(100).optional(),
  authorImage: UrlSchema.optional(),
  content: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
});

export type CreateTestimonialInput = z.infer<typeof CreateTestimonialSchema>;

// ============================================================================
// FAQ SCHEMAS
// ============================================================================

export const CreateFAQSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(5).max(5000),
  category: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateFAQInput = z.infer<typeof CreateFAQSchema>;

// ============================================================================
// SERVICE SCHEMAS
// ============================================================================

export const CreateServiceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: SlugSchema,
  description: z.string().max(5000).optional(),
  category: z.string().min(1).max(50),
  pricingModel: z.enum([
    PricingModel.FIXED,
    PricingModel.CUSTOM,
    PricingModel.MONTHLY,
    PricingModel.USAGE_BASED,
  ]),
  basePrice: z.number().min(0).default(0),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;

// ============================================================================
// CONTACT FORM SCHEMA
// ============================================================================

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  company: z.string().max(100).optional(),
  service: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const CreateOrderSchema = z.object({
  serviceId: IdSchema,
  quantity: z.number().int().min(1).default(1),
  notes: z.string().max(1000).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
  timestamp: z.string().datetime(),
});

export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        total: z.number().optional(),
        page: z.number().optional(),
        limit: z.number().optional(),
        totalPages: z.number().optional(),
      })
      .optional(),
    timestamp: z.string().datetime(),
  });
