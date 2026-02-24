/**
 * Email Service
 * Handles admin notifications and intelligent auto-replies via Resend API
 */

import { Resend } from 'resend';

// Resend API Key from environment
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Email addresses
const FROM_EMAIL = process.env.FROM_EMAIL || 'Sovereon <partners@sovereon.online>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'partners@sovereon.online';

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

// Track email health status
let emailHealthStatus: { 
  lastCheck: Date | null; 
  isHealthy: boolean; 
  error?: string;
} = { lastCheck: null, isHealthy: false };

/**
 * Email categories for intelligent auto-reply
 */
type InquiryCategory = 'ai_automation' | 'seo' | 'development' | 'digital_marketing' | 'general';

interface CategoryResponse {
  subject: string;
  body: string;
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY not set - contact forms will fail');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get email service health status
 */
export function getEmailHealth(): typeof emailHealthStatus {
  return emailHealthStatus;
}

/**
 * Categorize the inquiry based on message content
 */
function categorizeInquiry(message: string, service?: string | null): InquiryCategory {
  const lowerMessage = message.toLowerCase();
  const lowerService = service?.toLowerCase() || '';

  // AI/Automation keywords
  const aiKeywords = ['ai', 'automation', 'chatbot', 'artificial intelligence', 'machine learning', 'ml', 'nlp', 'gpt', 'openai', 'automation'];
  if (aiKeywords.some(k => lowerMessage.includes(k) || lowerService.includes(k))) {
    return 'ai_automation';
  }

  // SEO keywords
  const seoKeywords = ['seo', 'ranking', 'search engine', 'google ranking', 'organic traffic', 'keywords', 'backlinks'];
  if (seoKeywords.some(k => lowerMessage.includes(k) || lowerService.includes(k))) {
    return 'seo';
  }

  // Development keywords
  const devKeywords = ['website', 'app', 'application', 'development', 'web app', 'mobile app', 'software', 'platform', 'portal'];
  if (devKeywords.some(k => lowerMessage.includes(k) || lowerService.includes(k))) {
    return 'development';
  }

  // Digital Marketing keywords
  const marketingKeywords = ['marketing', 'ads', 'advertising', 'ppc', 'social media', 'facebook ads', 'google ads', 'campaign', 'leads'];
  if (marketingKeywords.some(k => lowerMessage.includes(k) || lowerService.includes(k))) {
    return 'digital_marketing';
  }

  return 'general';
}

/**
 * Generate intelligent auto-reply based on category
 */
function generateAutoReply(category: InquiryCategory): CategoryResponse {
  const responses: Record<InquiryCategory, CategoryResponse> = {
    ai_automation: {
      subject: 'Thank You for Your Interest in AI Solutions | Sovereon Inc.',
      body: `Thank you for reaching out about AI and automation solutions.

Our AI specialists have received your inquiry and will analyze your requirements to develop a tailored automation strategy that can streamline your operations and drive measurable ROI.

We typically respond with a detailed proposal within 24 hours during business days.

Best regards,
The Sovereon AI Team

---
Sovereon Inc.
AI-Powered Digital Solutions
partners@sovereon.online | +91 9113156083`
    },
    seo: {
      subject: 'Your SEO Inquiry Received | Sovereon Inc.',
      body: `Thank you for contacting us about SEO services.

Our search optimization experts will review your current digital presence and prepare a comprehensive strategy to improve your rankings, increase organic traffic, and boost your online visibility.

Expect a detailed audit and recommendations within 24 hours.

Best regards,
The Sovereon SEO Team

---
Sovereon Inc.
AI-Powered Digital Solutions
partners@sovereon.online | +91 9113156083`
    },
    development: {
      subject: 'Your Development Project Inquiry | Sovereon Inc.',
      body: `Thank you for considering Sovereon for your development project.

Our technical team will review your requirements and prepare a project scope, timeline, and cost estimate tailored to your specific needs. Whether it's a web application, mobile app, or custom software solution, we're excited to bring your vision to life.

We'll be in touch within 24 hours with next steps.

Best regards,
The Sovereon Development Team

---
Sovereon Inc.
AI-Powered Digital Solutions
partners@sovereon.online | +91 9113156083`
    },
    digital_marketing: {
      subject: 'Digital Marketing Inquiry Received | Sovereon Inc.',
      body: `Thank you for your interest in our digital marketing services.

Our marketing strategists will analyze your business goals and prepare a data-driven campaign plan designed to maximize your reach, engagement, and conversions across digital channels.

Look for our detailed proposal within 24 hours.

Best regards,
The Sovereon Marketing Team

---
Sovereon Inc.
AI-Powered Digital Solutions
partners@sovereon.online | +91 9113156083`
    },
    general: {
      subject: 'Thank You for Contacting Sovereon Inc.',
      body: `Thank you for reaching out to Sovereon Inc.

We have received your message and appreciate your interest in our AI-powered digital solutions. Our team will review your inquiry and respond with personalized recommendations within 24 hours.

In the meantime, feel free to explore our services at https://sovereon.online

Best regards,
The Sovereon Team

---
Sovereon Inc.
AI-Powered Digital Solutions
Bhagalpur, Bihar, India
partners@sovereon.online | +91 9113156083`
    }
  };

  return responses[category];
}

/**
 * Send admin notification email with retry logic
 */
export async function sendAdminNotification(
  submission: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    service?: string | null;
    message: string;
    formType: string;
    createdAt: Date;
  }
): Promise<boolean> {
  // Validate config first
  const configCheck = validateEmailConfig();
  if (!configCheck.valid) {
    console.error('[Email] Cannot send notification:', configCheck.errors.join(', '));
    return false;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const subject = `New ${submission.formType === 'consultation' ? 'AI Consultation' : 'Contact Form'} Submission from ${submission.name}`;
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #6B7280; }
    .value { margin-top: 5px; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #8B5CF6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Form Submission</h2>
      <p>${submission.formType === 'consultation' ? 'Free AI Consultation Request' : 'Contact Form Message'}</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">${escapeHtml(submission.name)}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">${escapeHtml(submission.email)}</div>
      </div>
      ${submission.phone ? `
      <div class="field">
        <div class="label">Phone:</div>
        <div class="value">${escapeHtml(submission.phone)}</div>
      </div>
      ` : ''}
      ${submission.company ? `
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">${escapeHtml(submission.company)}</div>
      </div>
      ` : ''}
      ${submission.service ? `
      <div class="field">
        <div class="label">Service Interest:</div>
        <div class="value">${escapeHtml(submission.service)}</div>
      </div>
      ` : ''}
      <div class="field">
        <div class="label">Message:</div>
        <div class="message-box">${escapeHtml(submission.message).replace(/\n/g, '<br>')}</div>
      </div>
      <div class="field">
        <div class="label">Submitted At:</div>
        <div class="value">${submission.createdAt.toISOString()}</div>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      const text = `
New ${submission.formType === 'consultation' ? 'AI Consultation' : 'Contact Form'} Submission

Name: ${submission.name}
Email: ${submission.email}
${submission.phone ? `Phone: ${submission.phone}\n` : ''}${submission.company ? `Company: ${submission.company}\n` : ''}${submission.service ? `Service Interest: ${submission.service}\n` : ''}
Message:
${submission.message}

Submitted At: ${submission.createdAt.toISOString()}
      `.trim();

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject,
        text,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`[Email] Admin notification sent for ${submission.formType} from ${submission.email}`);
      return true;
    } catch (error) {
      lastError = error as Error;
      console.error(`[Email] Admin notification attempt ${attempt}/${maxRetries} failed:`, (error as Error).message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }

  console.error('[Email] All admin notification retries failed:', lastError?.message);
  return false;
}

/**
 * Send intelligent auto-reply to the user with retry logic
 */
export async function sendIntelligentAutoReply(
  userEmail: string,
  userName: string,
  message: string,
  service?: string | null
): Promise<boolean> {
  // Validate config first
  const configCheck = validateEmailConfig();
  if (!configCheck.valid) {
    console.error('[Email] Cannot send auto-reply:', configCheck.errors.join(', '));
    return false;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const category = categorizeInquiry(message, service);
      const reply = generateAutoReply(category);

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: reply.subject,
        text: `Dear ${userName},\n\n${reply.body}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6B7280; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .signature { margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sovereon Inc.</h1>
      <p>AI-Powered Digital Solutions</p>
    </div>
    <div class="content">
      <div class="greeting">Dear ${escapeHtml(userName)},</div>
      <div style="white-space: pre-line;">${escapeHtml(reply.body).replace(/\n/g, '<br>')}</div>
    </div>
  </div>
</body>
</html>
        `,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`[Email] Auto-reply sent to ${userEmail} (category: ${category})`);
      return true;
    } catch (error) {
      lastError = error as Error;
      console.error(`[Email] Auto-reply attempt ${attempt}/${maxRetries} failed:`, (error as Error).message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }

  console.error('[Email] All auto-reply retries failed:', lastError?.message);
  return false;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Verify Resend API connection and update health status
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    // Check if RESEND_API_KEY is set
    if (!process.env.RESEND_API_KEY) {
      emailHealthStatus = {
        lastCheck: new Date(),
        isHealthy: false,
        error: 'RESEND_API_KEY not configured'
      };
      console.error('[Email] RESEND_API_KEY not set - cannot verify connection');
      return false;
    }

    // Perform a lightweight test by sending to admin email
    // We'll use a test that doesn't actually send an email
    // Resend doesn't have a native "verify" method, so we do a dry-run check
    // by validating the API key through a domains list call or similar
    const { data, error } = await resend.apiKeys.list();
    
    if (error) {
      throw new Error(error.message);
    }

    emailHealthStatus = {
      lastCheck: new Date(),
      isHealthy: true
    };
    console.log('[Email] Resend API connection verified');
    return true;
  } catch (error) {
    emailHealthStatus = {
      lastCheck: new Date(),
      isHealthy: false,
      error: (error as Error).message
    };
    console.error('[Email] Resend API verification failed:', (error as Error).message);
    return false;
  }
}

// Initial verification on module load (don't block)
verifyEmailService().catch(() => {});
