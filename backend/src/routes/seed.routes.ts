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

router.post(
  '/seed',
  asyncHandler(async (req: Request, res: Response) => {
    const { secret } = req.body;

    if (secret !== SEED_SECRET) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid seed secret' }
      });
    }

    console.log('🌱 Starting database seeding via API...');
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

      for (const category of categories) {
        await prisma.serviceCategory.create({ data: { ...category, isActive: true } });
      }
      results.push(`✓ ${categories.length} service categories created`);
    } catch (e) {
      results.push('✗ Service categories failed: ' + (e as Error).message);
    }

    // ============================================================================
    // 5. TESTIMONIALS
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
    // 6. FAQS
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

    res.json({
      success: true,
      message: 'Database seeding completed',
      results,
      timestamp: new Date().toISOString()
    });
  })
);

export default router;
