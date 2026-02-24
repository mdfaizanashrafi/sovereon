/**
 * Seed API Route
 * Provides HTTP endpoint to trigger database seeding
 * Safe to call multiple times (idempotent)
 */

import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// Simple secret check (you can change this)
const SEED_SECRET = process.env.SEED_SECRET || 'seed-me-now';

// Main seeding function
async function runSeeding() {
  console.log('🌱 Starting database seeding...');
  const results: string[] = [];

  // ============================================================================
  // 1. ADMIN USER
  // ============================================================================
  try {
    const adminPassword = await bcryptjs.hash('admin123', 12);
    await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {},
      create: { username: 'admin', password: adminPassword },
    });
    results.push('✓ Admin user created');
  } catch (e) {
    results.push('✗ Admin user failed: ' + (e as Error).message);
  }

  // ============================================================================
  // 2. GLOBAL SETTINGS
  // ============================================================================
  try {
    const settings = [
      { key: 'companyName', value: 'Sovereon Inc.' },
      { key: 'companyTagline', value: 'AI-Powered Digital Solutions' },
      { key: 'contactPhone', value: '9113156083' },
      { key: 'contactEmail', value: 'sovereon@sovereon.online' },
      { key: 'addressCity', value: 'Bhagalpur' },
      { key: 'addressState', value: 'Bihar' },
      { key: 'addressPincode', value: '812002' },
      { key: 'addressCountry', value: 'India' },
    ];

    for (const setting of settings) {
      await prisma.globalSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }
    results.push(`✓ ${settings.length} global settings created`);
  } catch (e) {
    results.push('✗ Global settings failed: ' + (e as Error).message);
  }

  // ============================================================================
  // 3. TEAM MEMBERS
  // ============================================================================
  try {
    await prisma.teamMember.deleteMany({});
    const teamMembers = [
      { name: 'Md Faizan Ashrafi', role: 'Technical Lead', department: 'Technicalities', description: 'Oversees all technical operations, software development, and AI integration strategies.', order: 1 },
      { name: 'Md Altamash Khan', role: 'CRM Manager', department: 'Customer Relations', description: 'Manages client relationships, ensures customer satisfaction, and leads support initiatives.', order: 2 },
      { name: 'Jawed Akhtar', role: 'Project Manager', department: 'Project Management', description: 'Leads project planning, execution, and delivery to ensure timely and successful project completion.', order: 3 },
      { name: 'Karan Raj', role: 'Video Graphic Manager', department: 'Creative Services', description: 'Manages video production and graphic design to create stunning visual content.', order: 4 },
      { name: 'Md Zahid Alam', role: 'AI & Graphic Designer', department: 'Design & AI', description: 'Combines AI expertise with graphic design to deliver innovative visual solutions.', order: 5 },
      { name: 'Kaifee', role: 'Data Analyst', department: 'Data Analytics', description: 'Analyzes data insights to drive strategic business decisions and optimization.', order: 6 },
      { name: 'Danish Shamim', role: 'Full Stack Developer', department: 'Development', description: 'Develops end-to-end solutions with expertise in both frontend and backend technologies.', order: 7 },
      { name: 'Shadan Ahmad', role: 'Social Media Manager & Video Editor Expert', department: 'Digital Marketing', description: 'Manages social media presence and creates expert-level video content for engagement.', order: 8 },
      { name: 'Shadan Ghayas', role: 'PR Manager', department: 'Public Relations', description: 'Manages company communications and public relations to build brand reputation.', order: 9 },
      { name: 'Mobeen', role: 'Sales Executive', department: 'Sales', description: 'Drives business growth through strategic sales initiatives and client relationship building.', order: 10 },
      { name: 'Md Junnaid Ashrafi', role: 'Business Analyst', department: 'Business Analysis', description: 'Analyzes business processes and market trends to drive strategic decision-making and operational improvements.', order: 11 },
      { name: 'Ayush Arya', role: 'Content Creator', department: 'Content Creation', description: 'Creates engaging and creative content across various platforms to build brand presence and audience engagement.', order: 12 },
    ];

    for (const member of teamMembers) {
      await prisma.teamMember.create({ data: { ...member, isActive: true } });
    }
    results.push(`✓ ${teamMembers.length} team members created`);
  } catch (e) {
    results.push('✗ Team members failed: ' + (e as Error).message);
  }

  // ============================================================================
  // 4. SERVICE CATEGORIES
  // ============================================================================
  try {
    await prisma.serviceCMS.deleteMany({});
    await prisma.serviceCategory.deleteMany({});
    
    const categories = [
      { slug: 'ai-services', title: 'AI Services', description: 'Cutting-edge AI solutions to transform your business with intelligent automation and insights.', order: 1 },
      { slug: 'communication-messaging', title: 'Communication & Messaging Services', description: 'Reach your audience instantly with AI-powered messaging solutions.', order: 2 },
      { slug: 'software-app-development', title: 'Software & App Development', description: 'Custom software solutions built with cutting-edge AI technology.', order: 3 },
      { slug: 'maintenance-support', title: 'Maintenance & Support', description: 'Keep your digital assets running smoothly 24/7.', order: 4 },
      { slug: 'cloud-it-solutions', title: 'Cloud & IT Solutions', description: 'Scalable cloud infrastructure and digital transformation.', order: 5 },
      { slug: 'digital-marketing-seo', title: 'Digital Marketing & SEO', description: 'AI-powered marketing strategies for maximum ROI.', order: 6 },
      { slug: 'content-media-production', title: 'Content & Media Production', description: 'Professional content creation with AI enhancement.', order: 7 },
    ];

    const createdCategories: Record<string, string> = {};
    for (const category of categories) {
      const created = await prisma.serviceCategory.create({ data: { ...category, isActive: true } });
      createdCategories[category.slug] = created.id;
    }
    results.push(`✓ ${categories.length} service categories created`);

    // ============================================================================
    // 5. SERVICES (Detailed services under categories)
    // ============================================================================
    const services = [
      // AI Services
      { slug: 'ai-seo-search', title: 'AI SEO for AI Search', categoryId: createdCategories['ai-services'], shortDescription: 'Optimize your content for AI-powered search engines like ChatGPT, Perplexity, and Google SGE.', fullDescription: 'Stay ahead of the search evolution with our AI SEO services.', features: ['AI search engine optimization', 'Conversational AI visibility'], benefits: ['Appear in ChatGPT responses', 'Higher visibility'], strategy: [{step: 1, title: 'Audit', description: 'Analyze AI perception'}], order: 1 },
      { slug: 'personalized-ai-agents', title: 'Personalized AI Agents', categoryId: createdCategories['ai-services'], shortDescription: 'Custom AI assistants tailored to your business needs.', fullDescription: 'Deploy intelligent AI agents for customer service and operations.', features: ['Custom-trained models', 'Multi-platform'], benefits: ['24/7 support', 'Reduced costs'], strategy: [{step: 1, title: 'Analysis', description: 'Define use cases'}], order: 2 },
      { slug: 'ai-content-generation', title: 'AI Content Generation', categoryId: createdCategories['ai-services'], shortDescription: 'Scale content production with AI-powered creation.', fullDescription: 'Supercharge your content strategy with AI-generated materials.', features: ['Blog writing', 'Social automation'], benefits: ['10x content output'], strategy: [{step: 1, title: 'Training', description: 'Train AI on brand'}], order: 3 },
      { slug: 'ai-data-analytics', title: 'AI Data Analytics', categoryId: createdCategories['ai-services'], shortDescription: 'Unlock hidden patterns with AI analytics.', fullDescription: 'Transform raw data into actionable intelligence.', features: ['Predictive analytics', 'Behavior analysis'], benefits: ['Data-driven decisions'], strategy: [{step: 1, title: 'Assessment', description: 'Evaluate data'}], order: 4 },
      // Communication
      { slug: 'broadcast-sms', title: 'Broadcast SMS', categoryId: createdCategories['communication-messaging'], shortDescription: 'Mass messaging for instant customer reach.', fullDescription: 'Send personalized bulk messages with AI targeting.', features: ['AI segmentation', 'Real-time tracking'], benefits: ['98% open rate'], strategy: [{step: 1, title: 'Analysis', description: 'AI targeting'}], order: 5 },
      { slug: 'bulk-sms', title: 'Bulk SMS', categoryId: createdCategories['communication-messaging'], shortDescription: 'High-volume SMS for business communication.', fullDescription: 'Enterprise-grade bulk SMS service.', features: ['API integration', 'Multi-language'], benefits: ['99.9% uptime'], strategy: [{step: 1, title: 'Setup', description: 'API integration'}], order: 6 },
      { slug: 'ivr-calling', title: 'IVR Calling', categoryId: createdCategories['communication-messaging'], shortDescription: 'Automated voice calls for promotions.', fullDescription: 'Interactive Voice Response system.', features: ['AI voice synthesis', 'Multi-language'], benefits: ['Human-like quality'], strategy: [{step: 1, title: 'Script', description: 'Design scripts'}], order: 7 },
      { slug: 'email-sms-marketing', title: 'Email & SMS Marketing', categoryId: createdCategories['communication-messaging'], shortDescription: 'Unified multi-channel marketing.', fullDescription: 'Combine email and SMS for powerful campaigns.', features: ['Cross-channel automation', 'A/B testing'], benefits: ['3x higher engagement'], strategy: [{step: 1, title: 'Strategy', description: 'Channel mix'}], order: 8 },
      // Software Development
      { slug: 'website-design-development', title: 'Website Design & Development', categoryId: createdCategories['software-app-development'], shortDescription: 'Stunning websites with AI optimization.', fullDescription: 'Responsive, SEO-friendly websites.', features: ['AI UX optimization', 'Responsive design'], benefits: ['Higher rankings'], strategy: [{step: 1, title: 'Discovery', description: 'Understand goals'}], order: 9 },
      { slug: 'mobile-app-development', title: 'Mobile App Development', categoryId: createdCategories['software-app-development'], shortDescription: 'Native and cross-platform mobile apps.', fullDescription: 'iOS and Android apps with AI features.', features: ['AI integration', 'Push notifications'], benefits: ['Wider reach'], strategy: [{step: 1, title: 'Analysis', description: 'Define features'}], order: 10 },
      { slug: 'custom-software-solutions', title: 'Custom Software Solutions', categoryId: createdCategories['software-app-development'], shortDescription: 'Tailored software for unique needs.', fullDescription: 'Bespoke applications for your workflows.', features: ['Process automation', 'AI analytics'], benefits: ['Streamlined operations'], strategy: [{step: 1, title: 'Process Analysis', description: 'Map workflows'}], order: 11 },
      { slug: 'ui-ux-design', title: 'UI/UX Design', categoryId: createdCategories['software-app-development'], shortDescription: 'User-centered design with AI insights.', fullDescription: 'Intuitive interfaces with AI analysis.', features: ['User research', 'AI heatmaps'], benefits: ['Higher satisfaction'], strategy: [{step: 1, title: 'Research', description: 'Understand users'}], order: 12 },
      // Maintenance
      { slug: 'web-app-maintenance', title: 'Web & App Maintenance', categoryId: createdCategories['maintenance-support'], shortDescription: '24/7 monitoring and maintenance.', fullDescription: 'Comprehensive maintenance with AI monitoring.', features: ['AI monitoring', 'Security patches'], benefits: ['99.9% uptime'], strategy: [{step: 1, title: 'Audit', description: 'System health'}], order: 13 },
      // Cloud & IT
      { slug: 'cloud-solutions-hosting', title: 'Cloud Solutions & Hosting', categoryId: createdCategories['cloud-it-solutions'], shortDescription: 'Scalable cloud infrastructure.', fullDescription: 'Reliable cloud hosting with auto-scaling.', features: ['Auto-scaling', 'Global CDN'], benefits: ['Handle traffic spikes'], strategy: [{step: 1, title: 'Assessment', description: 'Evaluate needs'}], order: 14 },
      { slug: 'it-consulting-transformation', title: 'IT Consulting', categoryId: createdCategories['cloud-it-solutions'], shortDescription: 'Strategic IT guidance.', fullDescription: 'Expert consulting for digital transformation.', features: ['IT strategy', 'Transformation roadmap'], benefits: ['Competitive advantage'], strategy: [{step: 1, title: 'Current State', description: 'Analyze IT'}], order: 15 },
      // Digital Marketing
      { slug: 'seo', title: 'Search Engine Optimization', categoryId: createdCategories['digital-marketing-seo'], shortDescription: 'Rank higher with AI SEO.', fullDescription: 'AI-driven SEO for top rankings.', features: ['AI keyword research', 'Technical SEO'], benefits: ['Higher rankings'], strategy: [{step: 1, title: 'Audit', description: 'Analyze performance'}], order: 16 },
      { slug: 'social-media-marketing', title: 'Social Media Marketing', categoryId: createdCategories['digital-marketing-seo'], shortDescription: 'Engage audiences on social platforms.', fullDescription: 'AI-powered social media management.', features: ['AI scheduling', 'Multi-platform'], benefits: ['Increased awareness'], strategy: [{step: 1, title: 'Platform Analysis', description: 'Identify platforms'}], order: 17 },
      { slug: 'paid-ads', title: 'Paid Ads', categoryId: createdCategories['digital-marketing-seo'], shortDescription: 'Targeted advertising with AI optimization.', fullDescription: 'Data-driven campaigns across platforms.', features: ['AI bid optimization', 'Targeting'], benefits: ['Lower cost per click'], strategy: [{step: 1, title: 'Research', description: 'Define demographics'}], order: 18 },
      { slug: 'influencer-marketing', title: 'Influencer Marketing', categoryId: createdCategories['digital-marketing-seo'], shortDescription: 'Partner with relevant influencers.', fullDescription: 'Connect with aligned influencers.', features: ['AI matching', 'Campaign management'], benefits: ['Authentic advocacy'], strategy: [{step: 1, title: 'Search', description: 'Find matches'}], order: 19 },
      { slug: 'lead-generation', title: 'Lead Generation', categoryId: createdCategories['digital-marketing-seo'], shortDescription: 'AI-powered lead generation.', fullDescription: 'Build automated conversion funnels.', features: ['Landing pages', 'Lead scoring'], benefits: ['More qualified leads'], strategy: [{step: 1, title: 'Design', description: 'Map journey'}], order: 20 },
      // Content & Media
      { slug: 'podcast-production-only', title: 'Podcast Production', categoryId: createdCategories['content-media-production'], shortDescription: 'Professional podcast recording.', fullDescription: 'End-to-end podcast production.', features: ['Studio recording', 'Professional editing'], benefits: ['Professional quality'], strategy: [{step: 1, title: 'Planning', description: 'Define structure'}], order: 21 },
      { slug: 'podcast-production-promotion', title: 'Podcast Production & Promotion', categoryId: createdCategories['content-media-production'], shortDescription: 'Full podcast service with marketing.', fullDescription: 'Complete podcast solution.', features: ['Production', 'Distribution'], benefits: ['Wider reach'], strategy: [{step: 1, title: 'Strategy', description: 'Marketing plan'}], order: 22 },
      { slug: 'online-pr-reputation', title: 'Online PR & Reputation', categoryId: createdCategories['content-media-production'], shortDescription: 'Build and protect brand reputation.', fullDescription: 'Monitor and improve online presence.', features: ['Brand monitoring', 'Review management'], benefits: ['Positive image'], strategy: [{step: 1, title: 'Audit', description: 'Assess reputation'}], order: 23 },
      { slug: 'ad-shoot', title: 'Ad Shoot', categoryId: createdCategories['content-media-production'], shortDescription: 'Professional video production.', fullDescription: 'High-quality video for commercials.', features: ['4K production', 'Scriptwriting'], benefits: ['Cinematic quality'], strategy: [{step: 1, title: 'Concept', description: 'Creative concept'}], order: 24 },
      { slug: 'photo-shoot', title: 'Photo Shoot', categoryId: createdCategories['content-media-production'], shortDescription: 'Professional photography.', fullDescription: 'Product, corporate, lifestyle photography.', features: ['Product photography', 'Headshots'], benefits: ['Professional imagery'], strategy: [{step: 1, title: 'Briefing', description: 'Understand needs'}], order: 25 },
    ];

    for (const service of services) {
      await prisma.serviceCMS.create({
        data: {
          ...service,
          features: JSON.stringify(service.features),
          benefits: JSON.stringify(service.benefits),
          strategy: JSON.stringify(service.strategy),
          isActive: true,
        },
      });
    }
    results.push(`✓ ${services.length} services created`);
  } catch (e) {
    results.push('✗ Service categories/services failed: ' + (e as Error).message);
  }

  // ============================================================================
  // 6. TESTIMONIALS
  // ============================================================================
  try {
    await prisma.testimonial.deleteMany({});
    const testimonials = [
      { name: 'Rajesh Kumar', company: 'Bihar Tech Solutions', role: 'CEO', content: 'Sovereon transformed our digital presence completely. Their AI-powered SEO strategy increased our organic traffic by 150% in just 3 months.', rating: 5, beforeMetric: '500 monthly visitors', afterMetric: '1,250 monthly visitors', order: 1 },
      { name: 'Priya Sharma', company: 'Wellness Hub', role: 'Founder', content: 'The team at Sovereon is exceptional. Their 24/7 support and ROI-focused approach helped us achieve a 40% increase in online sales.', rating: 5, beforeMetric: '2% conversion rate', afterMetric: '5.5% conversion rate', order: 2 },
      { name: 'Amit Patel', company: 'Patel Enterprises', role: 'Director', content: 'Working with Md Faizan and the technical team was a game-changer. Our custom software solution streamlined operations by 60%.', rating: 5, beforeMetric: '10 hours/day manual work', afterMetric: '4 hours/day automated', order: 3 },
      { name: 'Sneha Gupta', company: 'Fashion Forward', role: 'Marketing Head', content: 'Their social media marketing expertise is unmatched. We gained 50K followers in 6 months with their AI-driven content strategy.', rating: 5, beforeMetric: '5K followers', afterMetric: '55K followers', order: 4 },
      { name: 'Vikram Singh', company: 'Singh Constructions', role: 'Owner', content: 'Altamash Khan and the CRM team provided outstanding support. Our customer satisfaction scores improved dramatically.', rating: 5, beforeMetric: '72% satisfaction', afterMetric: '94% satisfaction', order: 5 },
      { name: 'Neha Verma', company: 'EduLearn Platform', role: 'Co-founder', content: 'The mobile app they developed exceeded our expectations. User engagement increased by 200% within the first quarter.', rating: 5, beforeMetric: '1,000 daily active users', afterMetric: '3,000 daily active users', order: 6 },
    ];

    for (const testimonial of testimonials) {
      await prisma.testimonial.create({ data: { ...testimonial, isActive: true } });
    }
    results.push(`✓ ${testimonials.length} testimonials created`);
  } catch (e) {
    results.push('✗ Testimonials failed: ' + (e as Error).message);
  }

  // ============================================================================
  // 7. FAQS
  // ============================================================================
  try {
    await prisma.fAQ.deleteMany({});
    const faqs = [
      { question: 'What services does Sovereon Inc. offer?', answer: 'We offer a comprehensive range of digital services including AI solutions, web and mobile app development, digital marketing, SEO, cloud solutions, bulk SMS/IVR services, and content production. Our services are powered by cutting-edge AI technology to deliver better results faster.', category: 'General', order: 1 },
      { question: 'How long does it take to build a website?', answer: 'The timeline depends on the complexity of your project. A simple brochure website typically takes 2-3 weeks, while complex e-commerce or custom web applications may take 6-12 weeks. We provide detailed timelines during our initial consultation.', category: 'Services', order: 2 },
      { question: 'Do you offer ongoing maintenance and support?', answer: 'Yes! We offer various maintenance packages to keep your website or application running smoothly. This includes regular updates, security patches, performance optimization, and technical support. Our team is available 24/7 for critical issues.', category: 'Services', order: 3 },
      { question: 'What makes Sovereon different from other agencies?', answer: 'We combine traditional digital services with AI-powered solutions to deliver faster, more effective results. Our team brings fresh innovation from February 2026, and we are committed to measurable ROI for every client. Plus, we are based in Bhagalpur, Bihar, bringing world-class solutions to Eastern India.', category: 'General', order: 4 },
      { question: 'How much do your services cost?', answer: 'Our pricing varies based on project scope and requirements. We offer competitive rates and provide detailed quotes after understanding your needs. Check our pricing page for starting prices, or contact us for a custom quote.', category: 'Pricing', order: 5 },
      { question: 'Do you work with clients outside Bhagalpur?', answer: 'Absolutely! While we are proud to be based in Bhagalpur, we serve clients across India and internationally. Our digital workflow allows us to collaborate effectively with clients regardless of location.', category: 'General', order: 6 },
      { question: 'What is your AI-powered SEO service?', answer: 'Our AI-powered SEO uses machine learning algorithms to analyze search patterns, identify high-value keywords, and optimize your content more effectively than traditional methods. Clients typically see 3x faster ranking improvements compared to conventional SEO.', category: 'Services', order: 7 },
      { question: 'How do I get started?', answer: 'Simply fill out our contact form or give us a call at 9113156083. We will schedule a free consultation to understand your needs and recommend the best solutions for your business.', category: 'General', order: 8 },
    ];

    for (const faq of faqs) {
      await prisma.fAQ.create({ data: { ...faq, isActive: true } });
    }
    results.push(`✓ ${faqs.length} FAQs created`);
  } catch (e) {
    results.push('✗ FAQs failed: ' + (e as Error).message);
  }

  console.log('✅ Seeding complete!');
  results.forEach(r => console.log(r));
  
  return results;
}

// Handle both GET and POST
const handleSeedRequest = asyncHandler(async (req: Request, res: Response) => {
  const secret = req.body?.secret || req.query?.secret;

  if (secret !== SEED_SECRET) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid seed secret' }
    });
  }

  const results = await runSeeding();

  res.json({
    success: true,
    message: 'Database seeding completed',
    results,
    timestamp: new Date().toISOString()
  });
});

router.post('/seed', handleSeedRequest);
router.get('/seed', handleSeedRequest);

/**
 * Create new admin user with custom password
 * POST /api/create-admin
 * Body: { secret: string, username: string, password: string }
 */
router.post(
  '/create-admin',
  asyncHandler(async (req: Request, res: Response) => {
    const { secret, username, password } = req.body;

    if (secret !== SEED_SECRET) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid secret' }
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Username and password required' }
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' }
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const admin = await prisma.adminUser.upsert({
      where: { username },
      update: { password: hashedPassword },
      create: { username, password: hashedPassword },
    });

    res.json({
      success: true,
      message: `Admin user '${username}' created/updated successfully`,
      adminId: admin.id,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;
