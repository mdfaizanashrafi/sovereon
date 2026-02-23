/**
 * Contact Routes
 * Handles contact form and AI consultation submissions
 * Includes anti-spam measures: rate limiting, honeypot
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/auth';
import { contactFormLimiter, consultationFormLimiter } from '../middleware/rateLimiter';
import { sendAdminNotification, sendIntelligentAutoReply } from '../services/email.service';
import { formatResponse, AppError } from '../utils/errors';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Base schema with honeypot field
 * company_website is the honeypot - should be empty
 */
const baseContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(100),
  phone: z.string().max(20).optional().nullable(),
  service: z.string().max(100).optional().nullable(),
  message: z.string().min(1, 'Message is required').max(5000),
  // Honeypot field - bots will fill this, humans won't
  company_website: z.string().max(100).optional().nullable(),
});

const contactFormSchema = baseContactSchema.extend({
  company: z.string().max(100).optional().nullable(),
});

const consultationFormSchema = baseContactSchema;

// ============================================================================
// HONEYPOT CHECK
// ============================================================================

/**
 * Check if request is from a bot using honeypot
 * Returns true if honeypot is filled (bot detected)
 */
function isBotRequest(companyWebsite?: string | null): boolean {
  // If honeypot field has any value, it's likely a bot
  return !!companyWebsite && companyWebsite.trim().length > 0;
}

// ============================================================================
// CONTACT FORM SUBMISSION
// ============================================================================

router.post(
  '/contact',
  contactFormLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validatedData = contactFormSchema.parse(req.body);

    // Honeypot check - silently reject bots with fake success
    if (isBotRequest(validatedData.company_website)) {
      console.log('[Contact] Bot detected via honeypot, silently rejecting');
      // Return fake success to confuse bots
      return res.json(formatResponse(true, { 
        message: 'Thank you for your message. We will get back to you soon.' 
      }));
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: sanitizeInput(validatedData.email),
      phone: validatedData.phone ? sanitizeInput(validatedData.phone) : null,
      company: validatedData.company ? sanitizeInput(validatedData.company) : null,
      service: validatedData.service ? sanitizeInput(validatedData.service) : null,
      message: sanitizeInput(validatedData.message),
    };

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        ...sanitizedData,
        formType: 'contact',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        isSpam: false,
      },
    });

    // Send admin notification (don't await - fail silently)
    const adminNotified = await sendAdminNotification({
      ...sanitizedData,
      formType: 'contact',
      createdAt: submission.createdAt,
    });

    // Send intelligent auto-reply (don't await - fail silently)
    const autoReplied = await sendIntelligentAutoReply(
      sanitizedData.email,
      sanitizedData.name,
      sanitizedData.message,
      sanitizedData.service
    );

    // Update submission with email status
    await prisma.contactSubmission.update({
      where: { id: submission.id },
      data: {
        adminNotified,
        autoReplied,
      },
    });

    res.json(formatResponse(true, {
      message: 'Thank you for your message. We will get back to you within 24 hours.',
      submissionId: submission.id,
    }));
  })
);

// ============================================================================
// AI CONSULTATION FORM SUBMISSION
// ============================================================================

router.post(
  '/consultation',
  consultationFormLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const validatedData = consultationFormSchema.parse(req.body);

    // Honeypot check - silently reject bots with fake success
    if (isBotRequest(validatedData.company_website)) {
      console.log('[Consultation] Bot detected via honeypot, silently rejecting');
      return res.json(formatResponse(true, { 
        message: 'Thank you for your consultation request. We will contact you soon.' 
      }));
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: sanitizeInput(validatedData.email),
      phone: validatedData.phone ? sanitizeInput(validatedData.phone) : null,
      service: validatedData.service ? sanitizeInput(validatedData.service) : null,
      message: sanitizeInput(validatedData.message),
    };

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        ...sanitizedData,
        company: null, // Consultation form doesn't have company field
        formType: 'consultation',
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'] || null,
        isSpam: false,
      },
    });

    // Send admin notification
    const adminNotified = await sendAdminNotification({
      ...sanitizedData,
      company: null,
      formType: 'consultation',
      createdAt: submission.createdAt,
    });

    // Send intelligent auto-reply
    const autoReplied = await sendIntelligentAutoReply(
      sanitizedData.email,
      sanitizedData.name,
      sanitizedData.message,
      sanitizedData.service
    );

    // Update submission with email status
    await prisma.contactSubmission.update({
      where: { id: submission.id },
      data: {
        adminNotified,
        autoReplied,
      },
    });

    res.json(formatResponse(true, {
      message: 'Thank you for your consultation request. Our AI specialists will contact you within 24 hours.',
      submissionId: submission.id,
    }));
  })
);

// ============================================================================
// ADMIN ENDPOINTS (Protected)
// ============================================================================

import { adminAuthMiddleware } from '../middleware/adminAuth';

/**
 * Get all contact submissions (admin only)
 */
router.get(
  '/submissions',
  adminAuthMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(formatResponse(true, submissions));
  })
);

/**
 * Mark submission as spam (admin only)
 */
router.patch(
  '/submissions/:id/spam',
  adminAuthMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isSpam } = req.body;

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { isSpam: !!isSpam },
    });

    res.json(formatResponse(true, submission));
  })
);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Get client IP address
 */
function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || null;
}

export default router;
