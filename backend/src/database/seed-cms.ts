/**
 * ============================================================================
 * CMS SEED SCRIPT
 * Seeds comprehensive CMS content for the Sovereon website
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CMS content...\n');

  // ========================================================================
  // 1. ADMIN USER (for admin panel login)
  // ========================================================================
  console.log('👤 Creating admin user...');
  const adminPassword = await bcryptjs.hash('admin123', 12);
  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
    },
  });
  console.log('✓ Admin user created:', adminUser.username, '/ password: admin123');

  // ========================================================================
  // 2. GLOBAL SETTINGS
  // ========================================================================
  console.log('\n⚙️  Creating global settings...');
  const settings = [
    { key: 'companyName', value: 'Sovereon Inc.' },
    { key: 'companyTagline', value: 'AI-Powered Digital Solutions' },
    { key: 'contactPhone', value: '9113156083' },
    { key: 'contactEmail', value: 'sovereon@sovereon.online' },
    { key: 'addressStreet', value: '' },
    { key: 'addressCity', value: 'Bhagalpur' },
    { key: 'addressState', value: 'Bihar' },
    { key: 'addressPincode', value: '812002' },
    { key: 'addressCountry', value: 'India' },
    { key: 'socialInstagram', value: 'https://instagram.sovereon.online' },
    { key: 'socialLinkedin', value: 'https://linkedin.sovereon.online' },
    { key: 'socialFacebook', value: 'https://facebook.sovereon.online' },
    { key: 'metaTitle', value: 'Sovereon Inc. - AI-Powered Digital Solutions' },
    { key: 'metaDescription', value: 'Transform your business with AI-powered digital solutions. Web development, mobile apps, digital marketing, and more.' },
  ];

  for (const setting of settings) {
    await prisma.globalSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✓ Created', settings.length, 'global settings');

  // ========================================================================
  // 3. TEAM MEMBERS (Original data from siteData.ts)
  // ========================================================================
  console.log('\n👥 Creating team members...');
  const teamMembers = [
    {
      name: 'Md Faizan Ashrafi',
      role: 'Technical Lead',
      department: 'Technicalities',
      description: 'Oversees all technical operations, software development, and AI integration strategies.',
      order: 1,
    },
    {
      name: 'Md Altamash Khan',
      role: 'CRM Manager',
      department: 'Customer Relations',
      description: 'Manages client relationships, ensures customer satisfaction, and leads support initiatives.',
      order: 2,
    },
    {
      name: 'Jawed Akhtar',
      role: 'Project Manager',
      department: 'Project Management',
      description: 'Leads project planning, execution, and delivery to ensure timely and successful project completion.',
      order: 3,
    },
    {
      name: 'Karan Raj',
      role: 'Video Graphic Manager',
      department: 'Creative Services',
      description: 'Manages video production and graphic design to create stunning visual content.',
      order: 4,
    },
    {
      name: 'Md Zahid Alam',
      role: 'AI & Graphic Designer',
      department: 'Design & AI',
      description: 'Combines AI expertise with graphic design to deliver innovative visual solutions.',
      order: 5,
    },
    {
      name: 'Kaifee',
      role: 'Data Analyst',
      department: 'Data Analytics',
      description: 'Analyzes data insights to drive strategic business decisions and optimization.',
      order: 6,
    },
    {
      name: 'Danish Shamim',
      role: 'Full Stack Developer',
      department: 'Development',
      description: 'Develops end-to-end solutions with expertise in both frontend and backend technologies.',
      order: 7,
    },
    {
      name: 'Shadan Ahmad',
      role: 'Social Media Manager & Video Editor Expert',
      department: 'Digital Marketing',
      description: 'Manages social media presence and creates expert-level video content for engagement.',
      order: 8,
    },
    {
      name: 'Shadan Ghayas',
      role: 'PR Manager',
      department: 'Public Relations',
      description: 'Manages company communications and public relations to build brand reputation.',
      order: 9,
    },
    {
      name: 'Mobeen',
      role: 'Sales Executive',
      department: 'Sales',
      description: 'Drives business growth through strategic sales initiatives and client relationship building.',
      order: 10,
    },
    {
      name: 'Md Junnaid Ashrafi',
      role: 'Business Analyst',
      department: 'Business Analysis',
      description: 'Analyzes business processes and market trends to drive strategic decision-making and operational improvements.',
      order: 11,
    },
    {
      name: 'Ayush Arya',
      role: 'Content Creator',
      department: 'Content Creation',
      description: 'Creates engaging and creative content across various platforms to build brand presence and audience engagement.',
      order: 12,
    },
  ];

  // Clear existing team members first to avoid duplicates
  await prisma.teamMember.deleteMany({});
  
  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: {
        ...member,
        isActive: true,
      },
    });
  }
  console.log('✓ Created', teamMembers.length, 'team members');

  // ========================================================================
  // 4. SERVICE CATEGORIES (Original data from siteData.ts)
  // ========================================================================
  console.log('\n📂 Creating service categories...');
  const serviceCategories = [
    {
      slug: 'ai-services',
      title: 'AI Services',
      description: 'Cutting-edge AI solutions to transform your business with intelligent automation and insights.',
      order: 1,
    },
    {
      slug: 'communication-messaging',
      title: 'Communication & Messaging Services',
      description: 'Reach your audience instantly with AI-powered messaging solutions.',
      order: 2,
    },
    {
      slug: 'software-app-development',
      title: 'Software & App Development',
      description: 'Custom software solutions built with cutting-edge AI technology.',
      order: 3,
    },
    {
      slug: 'maintenance-support',
      title: 'Maintenance & Support',
      description: 'Keep your digital assets running smoothly 24/7.',
      order: 4,
    },
    {
      slug: 'cloud-it-solutions',
      title: 'Cloud & IT Solutions',
      description: 'Scalable cloud infrastructure and digital transformation.',
      order: 5,
    },
    {
      slug: 'digital-marketing-seo',
      title: 'Digital Marketing & SEO',
      description: 'AI-powered marketing strategies for maximum ROI.',
      order: 6,
    },
    {
      slug: 'content-media-production',
      title: 'Content & Media Production',
      description: 'Professional content creation with AI enhancement.',
      order: 7,
    },
  ];

  // Clear existing categories and services
  await prisma.serviceCMS.deleteMany({});
  await prisma.serviceCategory.deleteMany({});

  const createdCategories: Record<string, string> = {};
  for (const category of serviceCategories) {
    const created = await prisma.serviceCategory.create({
      data: {
        ...category,
        isActive: true,
      },
    });
    createdCategories[category.slug] = created.id;
  }
  console.log('✓ Created', serviceCategories.length, 'service categories');

  // ========================================================================
  // 5. SERVICES (Original detailed data from siteData.ts)
  // ========================================================================
  console.log('\n🔧 Creating detailed services...');
  const services = [
    // AI Services
    {
      slug: 'ai-seo-search',
      title: 'AI SEO for AI Search',
      categoryId: createdCategories['ai-services'],
      shortDescription: 'Optimize your content for AI-powered search engines like ChatGPT, Perplexity, and Google SGE.',
      fullDescription: 'Stay ahead of the search evolution with our AI SEO services. We optimize your content to rank in AI-powered search engines, answer engines, and conversational AI platforms.',
      features: ['AI search engine optimization', 'Conversational AI visibility', 'Featured snippet optimization for AI', 'Entity-based SEO strategy', 'AI answer engine positioning'],
      benefits: ['Appear in ChatGPT/Claude responses', 'Higher visibility in AI search', 'Future-proof SEO strategy', 'Brand authority in AI recommendations'],
      strategy: [
        { step: 1, title: 'AI Search Audit', description: 'Analyze how AI engines currently perceive your brand' },
        { step: 2, title: 'Content Optimization', description: 'Structure content for AI comprehension and citation' },
        { step: 3, title: 'Entity Building', description: 'Establish your brand as a recognized authority entity' },
        { step: 4, title: 'Monitoring & Adaptation', description: 'Track AI search visibility and continuously optimize' },
      ],
      order: 1,
    },
    {
      slug: 'personalized-ai-agents',
      title: 'Personalized AI Agents',
      categoryId: createdCategories['ai-services'],
      shortDescription: 'Custom AI assistants tailored to your business needs for customer service, sales, and operations.',
      fullDescription: 'Deploy intelligent AI agents that understand your business, products, and customers. Our custom AI agents handle customer support, qualify leads, schedule appointments, and automate workflows.',
      features: ['Custom-trained AI models', 'Multi-platform deployment (web, WhatsApp, phone)', 'CRM & tool integrations', 'Human handoff capability', 'Continuous learning & improvement'],
      benefits: ['24/7 customer support', 'Reduced operational costs', 'Faster response times', 'Consistent brand voice', 'Scalable customer interactions'],
      strategy: [
        { step: 1, title: 'Requirements Analysis', description: 'Define use cases, personality, and integration needs' },
        { step: 2, title: 'Training & Setup', description: 'Train AI on your business data and knowledge base' },
        { step: 3, title: 'Integration', description: 'Connect with your existing tools and platforms' },
        { step: 4, title: 'Launch & Optimize', description: 'Deploy and refine based on real interactions' },
      ],
      order: 2,
    },
    {
      slug: 'ai-content-generation',
      title: 'AI Content Generation & Automation',
      categoryId: createdCategories['ai-services'],
      shortDescription: 'Scale your content production with AI-powered creation, from blogs to videos to social media.',
      fullDescription: 'Supercharge your content strategy with AI-generated blogs, social posts, videos, and marketing materials. Our AI content solutions maintain your brand voice while producing high-quality content at scale.',
      features: ['AI blog & article writing', 'Social media content automation', 'AI video generation & editing', 'Email sequence creation', 'Multilingual content production'],
      benefits: ['10x content output', 'Consistent publishing schedule', 'SEO-optimized content', 'Reduced content costs', 'Faster time-to-market'],
      strategy: [
        { step: 1, title: 'Brand Voice Training', description: 'Train AI on your brand guidelines and tone' },
        { step: 2, title: 'Content Strategy', description: 'Plan topics, formats, and publishing calendar' },
        { step: 3, title: 'AI Generation', description: 'Produce content with human oversight and editing' },
        { step: 4, title: 'Distribution', description: 'Automate publishing across all channels' },
      ],
      order: 3,
    },
    {
      slug: 'ai-data-analytics',
      title: 'AI Data Analytics & Predictive Insights',
      categoryId: createdCategories['ai-services'],
      shortDescription: 'Unlock hidden patterns and predict trends with advanced AI analytics and machine learning.',
      fullDescription: 'Transform your raw data into actionable intelligence. Our AI analytics services uncover patterns, predict customer behavior, forecast trends, and provide real-time insights that drive smarter business decisions.',
      features: ['Predictive analytics & forecasting', 'Customer behavior analysis', 'Anomaly detection', 'Real-time dashboards', 'Automated reporting & insights'],
      benefits: ['Data-driven decision making', 'Predict market trends', 'Identify growth opportunities', 'Risk mitigation', 'Competitive intelligence'],
      strategy: [
        { step: 1, title: 'Data Assessment', description: 'Evaluate your data sources and quality' },
        { step: 2, title: 'Model Development', description: 'Build custom AI models for your specific needs' },
        { step: 3, title: 'Integration', description: 'Connect analytics to your business systems' },
        { step: 4, title: 'Insight Delivery', description: 'Deploy dashboards and automated reports' },
      ],
      order: 4,
    },
    // Communication & Messaging
    {
      slug: 'broadcast-sms',
      title: 'Broadcast SMS',
      categoryId: createdCategories['communication-messaging'],
      shortDescription: 'Mass messaging for instant customer reach.',
      fullDescription: 'Send personalized bulk messages to thousands instantly with AI-driven targeting and delivery optimization.',
      features: ['AI-powered audience segmentation', 'Real-time delivery tracking', 'Personalized message templates', 'Scheduled campaign deployment', 'Two-way SMS communication'],
      benefits: ['98% message open rate', 'Instant customer engagement', 'Cost-effective marketing', 'Higher conversion rates'],
      strategy: [
        { step: 1, title: 'Audience Analysis', description: 'AI analyzes your customer data for optimal targeting' },
        { step: 2, title: 'Message Crafting', description: 'Create personalized messages with AI suggestions' },
        { step: 3, title: 'Campaign Launch', description: 'Deploy at optimal times for maximum engagement' },
        { step: 4, title: 'Performance Tracking', description: 'Monitor results with real-time analytics' },
      ],
      order: 5,
    },
    {
      slug: 'bulk-sms',
      title: 'Bulk SMS',
      categoryId: createdCategories['communication-messaging'],
      shortDescription: 'High-volume SMS for business communication.',
      fullDescription: 'Enterprise-grade bulk SMS service with API integration, delivery reports, and intelligent routing.',
      features: ['API integration support', 'Multi-language messaging', 'Delivery receipt tracking', 'Opt-out management', 'DND filtering'],
      benefits: ['Scalable to millions of messages', '99.9% uptime guarantee', 'Regulatory compliance', 'Detailed analytics dashboard'],
      strategy: [
        { step: 1, title: 'Integration Setup', description: 'Connect our API to your systems seamlessly' },
        { step: 2, title: 'Contact Import', description: 'Upload and organize your contact lists' },
        { step: 3, title: 'Campaign Execution', description: 'Launch high-volume campaigns with confidence' },
        { step: 4, title: 'Analytics Review', description: 'Analyze performance and optimize future campaigns' },
      ],
      order: 6,
    },
    {
      slug: 'ivr-calling',
      title: 'IVR Calling for Offers',
      categoryId: createdCategories['communication-messaging'],
      shortDescription: 'Automated voice calls for promotions.',
      fullDescription: 'Interactive Voice Response system for automated promotional calls with AI-powered speech recognition.',
      features: ['AI voice synthesis', 'Multi-language support', 'Call scheduling', 'Real-time analytics', 'CRM integration'],
      benefits: ['Human-like voice quality', '24/7 automated calling', 'Higher response rates', 'Reduced operational costs'],
      strategy: [
        { step: 1, title: 'Script Design', description: 'Create engaging IVR scripts with AI assistance' },
        { step: 2, title: 'Voice Selection', description: 'Choose from multiple AI voice options' },
        { step: 3, title: 'Campaign Deployment', description: 'Schedule and launch automated calls' },
        { step: 4, title: 'Response Analysis', description: 'Track responses and optimize scripts' },
      ],
      order: 7,
    },
    {
      slug: 'email-sms-marketing',
      title: 'Email & SMS Marketing',
      categoryId: createdCategories['communication-messaging'],
      shortDescription: 'Unified multi-channel marketing campaigns.',
      fullDescription: 'Combine email and SMS for powerful multi-channel campaigns with AI-optimized timing and content.',
      features: ['Cross-channel automation', 'AI-powered send-time optimization', 'A/B testing capabilities', 'Template library', 'Advanced segmentation'],
      benefits: ['3x higher engagement', 'Consistent brand messaging', 'Improved customer journey', 'Higher ROI on campaigns'],
      strategy: [
        { step: 1, title: 'Channel Strategy', description: 'Determine optimal email-to-SMS ratio' },
        { step: 2, title: 'Content Creation', description: 'Craft cohesive cross-channel messages' },
        { step: 3, title: 'Automation Setup', description: 'Configure triggers and workflows' },
        { step: 4, title: 'Performance Optimization', description: 'Use AI to improve campaign results' },
      ],
      order: 8,
    },
    // Software Development
    {
      slug: 'website-design-development',
      title: 'Website Design and Development',
      categoryId: createdCategories['software-app-development'],
      shortDescription: 'Stunning websites with AI optimization.',
      fullDescription: 'Responsive, SEO-friendly websites built with modern frameworks and AI-powered performance optimization.',
      features: ['AI-driven UX optimization', 'Responsive design', 'SEO-friendly architecture', 'Fast loading speeds', 'CMS integration'],
      benefits: ['Higher search rankings', 'Better user engagement', 'Increased conversions', 'Easy content management'],
      strategy: [
        { step: 1, title: 'Discovery', description: 'Understand your business goals and audience' },
        { step: 2, title: 'Design', description: 'Create stunning mockups with AI assistance' },
        { step: 3, title: 'Development', description: 'Build with clean, optimized code' },
        { step: 4, title: 'Launch & Optimize', description: 'Deploy and continuously improve' },
      ],
      order: 9,
    },
    {
      slug: 'mobile-app-development',
      title: 'Mobile App Development',
      categoryId: createdCategories['software-app-development'],
      shortDescription: 'Native and cross-platform mobile apps.',
      fullDescription: 'iOS and Android apps with AI features, push notifications, and seamless user experiences.',
      features: ['iOS & Android development', 'AI integration', 'Push notifications', 'Offline functionality', 'App store optimization'],
      benefits: ['Wider audience reach', 'Enhanced customer loyalty', 'Direct communication channel', 'Competitive advantage'],
      strategy: [
        { step: 1, title: 'Requirement Analysis', description: 'Define features and platform strategy' },
        { step: 2, title: 'UI/UX Design', description: 'Create intuitive mobile interfaces' },
        { step: 3, title: 'Development', description: 'Build with native or cross-platform tech' },
        { step: 4, title: 'App Store Launch', description: 'Deploy and optimize for stores' },
      ],
      order: 10,
    },
    {
      slug: 'custom-software-solutions',
      title: 'Custom Software Solutions',
      categoryId: createdCategories['software-app-development'],
      shortDescription: 'Tailored software for unique business needs.',
      fullDescription: 'Bespoke software applications designed specifically for your business processes and workflows.',
      features: ['Business process automation', 'AI-powered analytics', 'Third-party integrations', 'Scalable architecture', 'Security-focused design'],
      benefits: ['Streamlined operations', 'Reduced manual work', 'Data-driven decisions', 'Competitive differentiation'],
      strategy: [
        { step: 1, title: 'Process Analysis', description: 'Map your current workflows' },
        { step: 2, title: 'Solution Design', description: 'Architect the perfect software' },
        { step: 3, title: 'Development', description: 'Build with agile methodology' },
        { step: 4, title: 'Deployment', description: 'Launch with training and support' },
      ],
      order: 11,
    },
    {
      slug: 'ui-ux-design',
      title: 'UI/UX Design & Prototyping',
      categoryId: createdCategories['software-app-development'],
      shortDescription: 'User-centered design with AI insights.',
      fullDescription: 'Create intuitive interfaces with AI-powered user behavior analysis and rapid prototyping.',
      features: ['User research & testing', 'AI heatmap analysis', 'Interactive prototypes', 'Design systems', 'Accessibility compliance'],
      benefits: ['Higher user satisfaction', 'Reduced bounce rates', 'Faster development', 'Consistent branding'],
      strategy: [
        { step: 1, title: 'User Research', description: 'Understand your target audience' },
        { step: 2, title: 'Wireframing', description: 'Create low-fidelity layouts' },
        { step: 3, title: 'Prototyping', description: 'Build interactive mockups' },
        { step: 4, title: 'Testing', description: 'Validate with real users' },
      ],
      order: 12,
    },
    // Maintenance & Support
    {
      slug: 'web-app-maintenance',
      title: 'Web & App Maintenance & Support',
      categoryId: createdCategories['maintenance-support'],
      shortDescription: '24/7 monitoring and maintenance.',
      fullDescription: 'Comprehensive maintenance services with AI monitoring, security updates, and performance optimization.',
      features: ['24/7 AI monitoring', 'Security patches', 'Performance optimization', 'Regular backups', 'Bug fixes & updates'],
      benefits: ['99.9% uptime', 'Enhanced security', 'Faster performance', 'Peace of mind'],
      strategy: [
        { step: 1, title: 'Audit', description: 'Assess current system health' },
        { step: 2, title: 'Monitoring Setup', description: 'Deploy AI monitoring tools' },
        { step: 3, title: 'Maintenance Plan', description: 'Create scheduled maintenance routine' },
        { step: 4, title: 'Continuous Support', description: 'Provide ongoing assistance' },
      ],
      order: 13,
    },
    // Cloud & IT
    {
      slug: 'cloud-solutions-hosting',
      title: 'Cloud Solutions & Hosting',
      categoryId: createdCategories['cloud-it-solutions'],
      shortDescription: 'Scalable cloud infrastructure.',
      fullDescription: 'Reliable cloud hosting with auto-scaling, CDN, and AI-powered resource optimization.',
      features: ['Auto-scaling infrastructure', 'Global CDN', 'AI resource optimization', 'DDoS protection', '99.99% uptime SLA'],
      benefits: ['Handle traffic spikes', 'Global fast loading', 'Cost optimization', 'Enterprise security'],
      strategy: [
        { step: 1, title: 'Assessment', description: 'Evaluate current infrastructure needs' },
        { step: 2, title: 'Architecture', description: 'Design scalable cloud solution' },
        { step: 3, title: 'Migration', description: 'Seamlessly move to cloud' },
        { step: 4, title: 'Optimization', description: 'Fine-tune for performance and cost' },
      ],
      order: 14,
    },
    {
      slug: 'it-consulting-transformation',
      title: 'IT Consulting & Digital Transformation',
      categoryId: createdCategories['cloud-it-solutions'],
      shortDescription: 'Strategic IT guidance and transformation.',
      fullDescription: 'Expert consulting to modernize your IT infrastructure and drive digital transformation.',
      features: ['IT strategy development', 'Digital transformation roadmap', 'Technology stack recommendations', 'Process automation', 'Change management'],
      benefits: ['Competitive advantage', 'Operational efficiency', 'Cost reduction', 'Future-proof technology'],
      strategy: [
        { step: 1, title: 'Current State', description: 'Analyze existing IT landscape' },
        { step: 2, title: 'Strategy', description: 'Develop transformation roadmap' },
        { step: 3, title: 'Implementation', description: 'Execute transformation plan' },
        { step: 4, title: 'Evolution', description: 'Continuous improvement and innovation' },
      ],
      order: 15,
    },
    // Digital Marketing
    {
      slug: 'seo',
      title: 'Search Engine Optimization',
      categoryId: createdCategories['digital-marketing-seo'],
      shortDescription: 'Rank higher with AI SEO.',
      fullDescription: 'AI-driven SEO strategies for top search rankings, increased organic traffic, and better visibility.',
      features: ['AI keyword research', 'On-page optimization', 'Technical SEO audit', 'Content strategy', 'Link building'],
      benefits: ['Higher search rankings', 'More organic traffic', 'Better brand visibility', 'Long-term results'],
      strategy: [
        { step: 1, title: 'SEO Audit', description: 'Analyze current search performance' },
        { step: 2, title: 'Keyword Strategy', description: 'Identify high-value keywords with AI' },
        { step: 3, title: 'Optimization', description: 'Implement on-page and technical SEO' },
        { step: 4, title: 'Monitoring', description: 'Track rankings and adjust strategy' },
      ],
      order: 16,
    },
    {
      slug: 'social-media-marketing',
      title: 'Social Media Marketing & Management',
      categoryId: createdCategories['digital-marketing-seo'],
      shortDescription: 'Engage audiences on social platforms.',
      fullDescription: 'AI-powered social media management for increased engagement, followers, and brand awareness.',
      features: ['AI content scheduling', 'Multi-platform management', 'Audience analytics', 'Influencer collaboration', 'Community management'],
      benefits: ['Increased brand awareness', 'Higher engagement rates', 'More qualified leads', 'Stronger brand loyalty'],
      strategy: [
        { step: 1, title: 'Platform Analysis', description: 'Identify best platforms for your audience' },
        { step: 2, title: 'Content Strategy', description: 'Plan engaging content calendar' },
        { step: 3, title: 'Execution', description: 'Post and engage consistently' },
        { step: 4, title: 'Analytics', description: 'Measure and optimize performance' },
      ],
      order: 17,
    },
    {
      slug: 'paid-ads',
      title: 'Paid Ads (Google, Meta, LinkedIn)',
      categoryId: createdCategories['digital-marketing-seo'],
      shortDescription: 'Targeted advertising with AI optimization.',
      fullDescription: 'Data-driven paid advertising campaigns across Google, Facebook, Instagram, and LinkedIn.',
      features: ['AI bid optimization', 'Audience targeting', 'A/B testing', 'Conversion tracking', 'Retargeting campaigns'],
      benefits: ['Lower cost per click', 'Higher conversion rates', 'Better ROI', 'Scalable campaigns'],
      strategy: [
        { step: 1, title: 'Audience Research', description: 'Define target demographics' },
        { step: 2, title: 'Campaign Setup', description: 'Create optimized ad campaigns' },
        { step: 3, title: 'Monitoring', description: 'Track performance metrics' },
        { step: 4, title: 'Optimization', description: 'AI-driven continuous improvement' },
      ],
      order: 18,
    },
    {
      slug: 'influencer-marketing',
      title: 'Influencer Marketing',
      categoryId: createdCategories['digital-marketing-seo'],
      shortDescription: 'Partner with relevant influencers.',
      fullDescription: 'Connect with influencers who align with your brand for authentic marketing campaigns.',
      features: ['AI influencer matching', 'Campaign management', 'Performance tracking', 'Contract negotiation', 'Content approval'],
      benefits: ['Authentic brand advocacy', 'Access to new audiences', 'Higher trust factor', 'Improved conversions'],
      strategy: [
        { step: 1, title: 'Influencer Search', description: 'Find perfect brand matches with AI' },
        { step: 2, title: 'Outreach', description: 'Connect and negotiate partnerships' },
        { step: 3, title: 'Campaign', description: 'Execute collaborative content' },
        { step: 4, title: 'Analysis', description: 'Measure campaign impact' },
      ],
      order: 19,
    },
    {
      slug: 'lead-generation',
      title: 'Lead Generation & Conversion Funnels',
      categoryId: createdCategories['digital-marketing-seo'],
      shortDescription: 'AI-powered lead generation systems.',
      fullDescription: 'Build automated funnels that attract, nurture, and convert leads into customers.',
      features: ['Landing page creation', 'Email automation', 'Lead scoring', 'CRM integration', 'Funnel analytics'],
      benefits: ['More qualified leads', 'Higher conversion rates', 'Automated nurturing', 'Scalable growth'],
      strategy: [
        { step: 1, title: 'Funnel Design', description: 'Map customer journey stages' },
        { step: 2, title: 'Asset Creation', description: 'Build landing pages and content' },
        { step: 3, title: 'Automation', description: 'Set up email sequences' },
        { step: 4, title: 'Optimization', description: 'Test and improve conversions' },
      ],
      order: 20,
    },
    // Content & Media
    {
      slug: 'podcast-production-only',
      title: 'Podcast Production Only',
      categoryId: createdCategories['content-media-production'],
      shortDescription: 'Professional podcast recording and editing.',
      fullDescription: 'End-to-end podcast production including recording, editing, and audio enhancement.',
      features: ['Studio-quality recording', 'Professional editing', 'Noise reduction', 'Intro/outro creation', 'Show notes writing'],
      benefits: ['Professional audio quality', 'Time-saving production', 'Consistent publishing', 'Engaging content'],
      strategy: [
        { step: 1, title: 'Planning', description: 'Define episode structure and content' },
        { step: 2, title: 'Recording', description: 'Capture high-quality audio' },
        { step: 3, title: 'Post-Production', description: 'Edit and enhance audio' },
        { step: 4, title: 'Delivery', description: 'Provide final files and assets' },
      ],
      order: 21,
    },
    {
      slug: 'podcast-production-promotion',
      title: 'Podcast Production & Promotion',
      categoryId: createdCategories['content-media-production'],
      shortDescription: 'Full podcast service with marketing.',
      fullDescription: 'Complete podcast solution including production, distribution, and promotional marketing.',
      features: ['Full production service', 'Distribution to platforms', 'Marketing campaigns', 'Social media promotion', 'Listener analytics'],
      benefits: ['Wider audience reach', 'Growing subscriber base', 'Brand authority building', 'Monetization opportunities'],
      strategy: [
        { step: 1, title: 'Strategy', description: 'Develop podcast marketing plan' },
        { step: 2, title: 'Production', description: 'Create high-quality episodes' },
        { step: 3, title: 'Distribution', description: 'Publish across all platforms' },
        { step: 4, title: 'Promotion', description: 'Execute marketing campaigns' },
      ],
      order: 22,
    },
    {
      slug: 'online-pr-reputation',
      title: 'Online PR & Reputation Management',
      categoryId: createdCategories['content-media-production'],
      shortDescription: 'Build and protect brand reputation.',
      fullDescription: 'Monitor, manage, and improve your online presence and brand reputation.',
      features: ['Brand monitoring', 'Review management', 'Crisis response', 'Positive content creation', 'Media relations'],
      benefits: ['Positive brand image', 'Crisis prevention', 'Customer trust', 'Competitive advantage'],
      strategy: [
        { step: 1, title: 'Audit', description: 'Assess current online reputation' },
        { step: 2, title: 'Strategy', description: 'Develop reputation management plan' },
        { step: 3, title: 'Execution', description: 'Implement positive content strategy' },
        { step: 4, title: 'Monitoring', description: 'Continuous reputation tracking' },
      ],
      order: 23,
    },
    {
      slug: 'ad-shoot',
      title: 'Ad Shoot',
      categoryId: createdCategories['content-media-production'],
      shortDescription: 'Professional advertisement video production.',
      fullDescription: 'High-quality video production for TV commercials, online ads, and promotional content.',
      features: ['4K video production', 'Scriptwriting', 'Professional editing', 'Motion graphics', 'Multi-format delivery'],
      benefits: ['Cinematic quality', 'Engaging storytelling', 'Brand elevation', 'Higher ad performance'],
      strategy: [
        { step: 1, title: 'Concept', description: 'Develop creative ad concept' },
        { step: 2, title: 'Pre-Production', description: 'Plan shoot logistics' },
        { step: 3, title: 'Production', description: 'Execute professional shoot' },
        { step: 4, title: 'Post-Production', description: 'Edit and deliver final ad' },
      ],
      order: 24,
    },
    {
      slug: 'photo-shoot',
      title: 'Photo Shoot',
      categoryId: createdCategories['content-media-production'],
      shortDescription: 'Professional photography services.',
      fullDescription: 'Stunning product, corporate, and lifestyle photography for your brand.',
      features: ['Product photography', 'Corporate headshots', 'Lifestyle shoots', 'Photo editing', 'Commercial licensing'],
      benefits: ['Professional brand imagery', 'Consistent visual identity', 'Higher engagement', 'Versatile content library'],
      strategy: [
        { step: 1, title: 'Briefing', description: 'Understand photography needs' },
        { step: 2, title: 'Planning', description: 'Scout locations and plan shots' },
        { step: 3, title: 'Shoot', description: 'Capture professional photos' },
        { step: 4, title: 'Delivery', description: 'Edit and deliver final images' },
      ],
      order: 25,
    },
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
  console.log('✓ Created', services.length, 'detailed services');

  // ========================================================================
  // 6. TESTIMONIALS (Original data from siteData.ts)
  // ========================================================================
  console.log('\n⭐ Creating testimonials...');
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Bihar Tech Solutions',
      role: 'CEO',
      content: 'Sovereon transformed our digital presence completely. Their AI-powered SEO strategy increased our organic traffic by 150% in just 3 months.',
      rating: 5,
      beforeMetric: '500 monthly visitors',
      afterMetric: '1,250 monthly visitors',
      order: 1,
    },
    {
      name: 'Priya Sharma',
      company: 'Wellness Hub',
      role: 'Founder',
      content: 'The team at Sovereon is exceptional. Their 24/7 support and ROI-focused approach helped us achieve a 40% increase in online sales.',
      rating: 5,
      beforeMetric: '2% conversion rate',
      afterMetric: '5.5% conversion rate',
      order: 2,
    },
    {
      name: 'Amit Patel',
      company: 'Patel Enterprises',
      role: 'Director',
      content: 'Working with Md Faizan and the technical team was a game-changer. Our custom software solution streamlined operations by 60%.',
      rating: 5,
      beforeMetric: '10 hours/day manual work',
      afterMetric: '4 hours/day automated',
      order: 3,
    },
    {
      name: 'Sneha Gupta',
      company: 'Fashion Forward',
      role: 'Marketing Head',
      content: 'Their social media marketing expertise is unmatched. We gained 50K followers in 6 months with their AI-driven content strategy.',
      rating: 5,
      beforeMetric: '5K followers',
      afterMetric: '55K followers',
      order: 4,
    },
    {
      name: 'Vikram Singh',
      company: 'Singh Constructions',
      role: 'Owner',
      content: 'Altamash Khan and the CRM team provided outstanding support. Our customer satisfaction scores improved dramatically.',
      rating: 5,
      beforeMetric: '72% satisfaction',
      afterMetric: '94% satisfaction',
      order: 5,
    },
    {
      name: 'Neha Verma',
      company: 'EduLearn Platform',
      role: 'Co-founder',
      content: 'The mobile app they developed exceeded our expectations. User engagement increased by 200% within the first quarter.',
      rating: 5,
      beforeMetric: '1,000 daily active users',
      afterMetric: '3,000 daily active users',
      order: 6,
    },
  ];

  // Clear existing testimonials
  await prisma.testimonial.deleteMany({});

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: {
        ...testimonial,
        isActive: true,
      },
    });
  }
  console.log('✓ Created', testimonials.length, 'testimonials');

  // ========================================================================
  // 7. CURRENT PROJECTS
  // ========================================================================
  console.log('\n🚀 Creating current projects...');
  const currentProjects = [
    {
      title: 'AI-Powered Customer Support Platform',
      description: 'Building an intelligent support system with NLP capabilities for a major e-commerce client.',
      progress: 75,
      technologies: JSON.stringify(['React', 'Node.js', 'OpenAI', 'PostgreSQL']),
      order: 1,
    },
    {
      title: 'Healthcare Management App',
      description: 'Mobile application for patient management, appointment booking, and telemedicine.',
      progress: 60,
      technologies: JSON.stringify(['React Native', 'Firebase', 'Twilio', 'Stripe']),
      order: 2,
    },
    {
      title: 'Real Estate Listing Platform',
      description: 'Feature-rich property listing website with virtual tours and mortgage calculators.',
      progress: 40,
      technologies: JSON.stringify(['Next.js', 'Prisma', 'AWS', 'Mapbox']),
      order: 3,
    },
    {
      title: 'EdTech Learning Management System',
      description: 'Comprehensive LMS with video streaming, quizzes, and progress tracking.',
      progress: 90,
      technologies: JSON.stringify(['Vue.js', 'Django', 'AWS S3', 'Redis']),
      order: 4,
    },
  ];

  // Clear existing projects
  await prisma.currentProject.deleteMany({});

  for (const project of currentProjects) {
    await prisma.currentProject.create({
      data: {
        ...project,
        isActive: true,
      },
    });
  }
  console.log('✓ Created', currentProjects.length, 'current projects');

  // ========================================================================
  // 8. FUTURE QUESTS
  // ========================================================================
  console.log('\n🔮 Creating future quests...');
  const futureQuests = [
    {
      title: 'Podcast Studio Launch',
      description: 'Setting up a professional podcast production studio with state-of-the-art recording equipment and editing suite.',
      timeline: 'March 2026',
      icon: 'Mic',
      order: 1,
    },
    {
      title: 'AI Content Generation Platform',
      description: 'Launching our proprietary AI platform for automated blog writing, social media content, and ad copy generation.',
      timeline: 'April 2026',
      icon: 'Brain',
      order: 2,
    },
    {
      title: 'Office Expansion',
      description: 'Expanding our Bhagalpur office to accommodate a growing team of 50+ professionals.',
      timeline: 'June 2026',
      icon: 'Building',
      order: 3,
    },
    {
      title: 'Training Academy',
      description: 'Launching Sovereon Academy to train the next generation of digital marketers and developers.',
      timeline: 'August 2026',
      icon: 'GraduationCap',
      order: 4,
    },
    {
      title: 'Pan-India Operations',
      description: 'Opening satellite offices in Delhi, Mumbai, and Bangalore to serve clients nationwide.',
      timeline: 'December 2026',
      icon: 'MapPin',
      order: 5,
    },
  ];

  // Clear existing quests
  await prisma.futureQuest.deleteMany({});

  for (const quest of futureQuests) {
    await prisma.futureQuest.create({
      data: {
        ...quest,
        isActive: true,
      },
    });
  }
  console.log('✓ Created', futureQuests.length, 'future quests');

  // ========================================================================
  // 9. FAQS
  // ========================================================================
  console.log('\n❓ Creating FAQs...');
  const faqs = [
    {
      question: 'What services does Sovereon Inc. offer?',
      answer: 'We offer a comprehensive range of digital services including AI solutions, web and mobile app development, digital marketing, SEO, cloud solutions, bulk SMS/IVR services, and content production. Our services are powered by cutting-edge AI technology to deliver better results faster.',
      category: 'General',
      order: 1,
    },
    {
      question: 'How long does it take to build a website?',
      answer: 'The timeline depends on the complexity of your project. A simple brochure website typically takes 2-3 weeks, while complex e-commerce or custom web applications may take 6-12 weeks. We provide detailed timelines during our initial consultation.',
      category: 'Services',
      order: 2,
    },
    {
      question: 'Do you offer ongoing maintenance and support?',
      answer: 'Yes! We offer various maintenance packages to keep your website or application running smoothly. This includes regular updates, security patches, performance optimization, and technical support. Our team is available 24/7 for critical issues.',
      category: 'Services',
      order: 3,
    },
    {
      question: 'What makes Sovereon different from other agencies?',
      answer: 'We combine traditional digital services with AI-powered solutions to deliver faster, more effective results. Our team brings fresh innovation from February 2026, and we are committed to measurable ROI for every client. Plus, we are based in Bhagalpur, Bihar, bringing world-class solutions to Eastern India.',
      category: 'General',
      order: 4,
    },
    {
      question: 'How much do your services cost?',
      answer: 'Our pricing varies based on project scope and requirements. We offer competitive rates and provide detailed quotes after understanding your needs. Check our pricing page for starting prices, or contact us for a custom quote.',
      category: 'Pricing',
      order: 5,
    },
    {
      question: 'Do you work with clients outside Bhagalpur?',
      answer: 'Absolutely! While we are proud to be based in Bhagalpur, we serve clients across India and internationally. Our digital workflow allows us to collaborate effectively with clients regardless of location.',
      category: 'General',
      order: 6,
    },
    {
      question: 'What is your AI-powered SEO service?',
      answer: 'Our AI-powered SEO uses machine learning algorithms to analyze search patterns, identify high-value keywords, and optimize your content more effectively than traditional methods. Clients typically see 3x faster ranking improvements compared to conventional SEO.',
      category: 'Services',
      order: 7,
    },
    {
      question: 'How do I get started?',
      answer: 'Simply fill out our contact form or give us a call at 9113156083. We will schedule a free consultation to understand your needs and recommend the best solutions for your business.',
      category: 'General',
      order: 8,
    },
  ];

  // Clear existing FAQs
  await prisma.fAQ.deleteMany({});

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        ...faq,
        isActive: true,
      },
    });
  }
  console.log('✓ Created', faqs.length, 'FAQs');

  console.log('\n✅ CMS seeding complete!');
  console.log('\n📊 Summary:');
  console.log('  - Admin user: admin / admin123');
  console.log('  - Global settings:', settings.length);
  console.log('  - Team members:', teamMembers.length);
  console.log('  - Service categories:', serviceCategories.length);
  console.log('  - Detailed services:', services.length);
  console.log('  - Testimonials:', testimonials.length);
  console.log('  - Current projects:', currentProjects.length);
  console.log('  - Future quests:', futureQuests.length);
  console.log('  - FAQs:', faqs.length);
}

main()
  .catch((e) => {
    console.error('❌ CMS seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
