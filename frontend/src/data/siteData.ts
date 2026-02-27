/**
 * ============================================================================
 * SOVEREON INC. - SITE DATA & CONTENT
 * ============================================================================
 * 
 * This file contains all the content data for the Sovereon Inc. website.
 * It centralizes text content, service descriptions, team info, and other
 * data that can be easily updated without modifying component files.
 * 
 * PLACEHOLDERS:
 * - [PLACEHOLDER_CLIENT_LOGO_*]: Client company logos
 * - [PLACEHOLDER_PROJECT_IMAGE_*]: Project showcase images
 * - [PLACEHOLDER_TEAM_IMAGE_*]: Team member photos
 * - [PLACEHOLDER_TESTIMONIAL_AVATAR_*]: Client avatar images
 * 
 * @author Sovereon Inc. Development Team
 * @since February 2026
 * @version 1.0.0
 */

// ============================================================================
// COMPANY INFORMATION
// ============================================================================

export const companyInfo = {
  name: 'Sovereon Inc.',
  tagline: 'Built by engineers. Designed for growth.',
  establishmentDate: 'February 2026',
  address: {
    street: '',
    city: 'Bhagalpur',
    state: 'Bihar',
    pincode: '812002',
    country: 'India',
    full: 'Bhagalpur, Bihar - 812002, India',
  },
  contact: {
    phone: '7004095896',
    email: 'sovereon@sovereon.online',
    website: 'www.sovereon.online',
  },
  social: {
    instagram: 'https://instagram.sovereon.online',
    linkedin: 'https://linkedin.sovereon.online',
    facebook: 'https://facebook.sovereon.online',
  },
};

// ============================================================================
// TEAM INFORMATION
// ============================================================================

export const teamMembers = [
  {
    name: 'Md Faizan Ashrafi',
    role: 'Technical Lead',
    department: 'Technicalities',
    description: 'Oversees all technical operations, software development, and AI integration strategies.',
    image: '[PLACEHOLDER_TEAM_IMAGE_1]',
  },
  {
    name: 'Md Altamash Khan',
    role: 'CRM Manager',
    department: 'Customer Relations',
    description: 'Manages client relationships, ensures customer satisfaction, and leads support initiatives.',
    image: '[PLACEHOLDER_TEAM_IMAGE_2]',
  },
  {
    name: 'Jawed Akhtar',
    role: 'Project Manager',
    department: 'Project Management',
    description: 'Leads project planning, execution, and delivery to ensure timely and successful project completion.',
    image: '[PLACEHOLDER_TEAM_IMAGE_3]',
  },
  {
    name: 'Karan Raj',
    role: 'Video Graphic Manager',
    department: 'Creative Services',
    description: 'Manages video production and graphic design to create stunning visual content.',
    image: '[PLACEHOLDER_TEAM_IMAGE_4]',
  },
  {
    name: 'Md Zahid Alam',
    role: 'AI & Graphic Designer',
    department: 'Design & AI',
    description: 'Combines AI expertise with graphic design to deliver innovative visual solutions.',
    image: '[PLACEHOLDER_TEAM_IMAGE_5]',
  },
  {
    name: 'Kaifee',
    role: 'Data Analyst',
    department: 'Data Analytics',
    description: 'Analyzes data insights to drive strategic business decisions and optimization.',
    image: '[PLACEHOLDER_TEAM_IMAGE_6]',
  },
  {
    name: 'Danish Shamim',
    role: 'Full Stack Developer',
    department: 'Development',
    description: 'Develops end-to-end solutions with expertise in both frontend and backend technologies.',
    image: '[PLACEHOLDER_TEAM_IMAGE_7]',
  },
  {
    name: 'Shadan Ahmad',
    role: 'Social Media Manager & Video Editor Expert',
    department: 'Digital Marketing',
    description: 'Manages social media presence and creates expert-level video content for engagement.',
    image: '[PLACEHOLDER_TEAM_IMAGE_8]',
  },
  {
    name: 'Shadan Ghayas',
    role: 'PR Manager',
    department: 'Public Relations',
    description: 'Manages company communications and public relations to build brand reputation.',
    image: '[PLACEHOLDER_TEAM_IMAGE_9]',
  },
  {
    name: 'Mobeen',
    role: 'Sales Executive',
    department: 'Sales',
    description: 'Drives business growth through strategic sales initiatives and client relationship building.',
    image: '[PLACEHOLDER_TEAM_IMAGE_10]',
  },
  {
    name: 'Md Junnaid Ashrafi',
    role: 'Business Analyst',
    department: 'Business Analysis',
    description: 'Analyzes business processes and market trends to drive strategic decision-making and operational improvements.',
    image: '[PLACEHOLDER_TEAM_IMAGE_11]',
  },
  {
    name: 'Ayush Arya',
    role: 'Content Creator',
    department: 'Content Creation',
    description: 'Creates engaging and creative content across various platforms to build brand presence and audience engagement.',
    image: '[PLACEHOLDER_TEAM_IMAGE_12]',
  },
];

// ============================================================================
// SERVICE CATEGORIES & SUBPAGES
// ============================================================================

export interface Service {
  id: string;
  title: string;
  href: string;
  shortDescription: string; // 10 words
  fullDescription: string; // 20 words
  features: string[];
  benefits: string[];
  strategy: {
    step: number;
    title: string;
    description: string;
  }[];
}

export interface ServiceCategory {
  id: string;
  title: string;
  href: string;
  description: string;
  services: Service[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'ai-services',
    title: 'AI Services',
    href: '/services/ai-services',
    description: 'AI systems that handle real work: automation, analytics, and customer engagement that drives revenue.',
    services: [
      {
        id: 'ai-seo-search',
        title: 'AI SEO for AI Search',
        href: '/services/ai-seo-search',
        shortDescription: 'Optimize your content for AI-powered search engines like ChatGPT, Perplexity, and Google SGE.',
        fullDescription: 'Your customers are asking ChatGPT and Perplexity for recommendations. We make sure your business shows up in those answers. Our AI search optimization puts your brand where people actually look today.',
        features: [
          'AI search engine optimization',
          'Conversational AI visibility',
          'Featured snippet optimization for AI',
          'Entity-based SEO strategy',
          'AI answer engine positioning',
        ],
        benefits: [
          'Appear in ChatGPT/Claude responses',
          'Higher visibility in AI search',
          'Future-proof SEO strategy',
          'Brand authority in AI recommendations',
        ],
        strategy: [
          { step: 1, title: 'AI Search Audit', description: 'Analyze how AI engines currently perceive your brand' },
          { step: 2, title: 'Content Optimization', description: 'Structure content for AI comprehension and citation' },
          { step: 3, title: 'Entity Building', description: 'Establish your brand as a recognized authority entity' },
          { step: 4, title: 'Monitoring & Adaptation', description: 'Track AI search visibility and continuously optimize' },
        ],
      },
      {
        id: 'personalized-ai-agents',
        title: 'Personalized AI Agents',
        href: '/services/personalized-ai-agents',
        shortDescription: 'Custom AI assistants tailored to your business needs for customer service, sales, and operations.',
        fullDescription: 'Custom AI assistants trained on your business. They handle support questions, qualify leads, book appointments, and escalate to your team when needed. Available 24/7 across web, WhatsApp, and voice.',
        features: [
          'Custom-trained AI models',
          'Multi-platform deployment (web, WhatsApp, phone)',
          'CRM & tool integrations',
          'Human handoff capability',
          'Continuous learning & improvement',
        ],
        benefits: [
          '24/7 customer support',
          'Reduced operational costs',
          'Faster response times',
          'Consistent brand voice',
          'Scalable customer interactions',
        ],
        strategy: [
          { step: 1, title: 'Requirements Analysis', description: 'Define use cases, personality, and integration needs' },
          { step: 2, title: 'Training & Setup', description: 'Train AI on your business data and knowledge base' },
          { step: 3, title: 'Integration', description: 'Connect with your existing tools and platforms' },
          { step: 4, title: 'Launch & Optimize', description: 'Deploy and refine based on real interactions' },
        ],
      },
      {
        id: 'ai-content-generation',
        title: 'AI Content Generation & Automation',
        href: '/services/ai-content-generation',
        shortDescription: 'Scale your content production with AI-powered creation, from blogs to videos to social media.',
        fullDescription: 'Publish 10x more content without hiring 10x more writers. Our AI content systems produce blogs, social posts, and marketing copy in your brand voice, with human oversight for quality.',
        features: [
          'AI blog & article writing',
          'Social media content automation',
          'AI video generation & editing',
          'Email sequence creation',
          'Multilingual content production',
        ],
        benefits: [
          '10x content output',
          'Consistent publishing schedule',
          'SEO-optimized content',
          'Reduced content costs',
          'Faster time-to-market',
        ],
        strategy: [
          { step: 1, title: 'Brand Voice Training', description: 'Train AI on your brand guidelines and tone' },
          { step: 2, title: 'Content Strategy', description: 'Plan topics, formats, and publishing calendar' },
          { step: 3, title: 'AI Generation', description: 'Produce content with human oversight and editing' },
          { step: 4, title: 'Distribution', description: 'Automate publishing across all channels' },
        ],
      },
      {
        id: 'ai-data-analytics',
        title: 'AI Data Analytics & Predictive Insights',
        href: '/services/ai-data-analytics',
        shortDescription: 'Unlock hidden patterns and predict trends with advanced AI analytics and machine learning.',
        fullDescription: 'Stop guessing. Our analytics systems analyze your customer data to predict behavior, spot trends, and identify revenue opportunities before your competitors do.',
        features: [
          'Predictive analytics & forecasting',
          'Customer behavior analysis',
          'Anomaly detection',
          'Real-time dashboards',
          'Automated reporting & insights',
        ],
        benefits: [
          'Data-driven decision making',
          'Predict market trends',
          'Identify growth opportunities',
          'Risk mitigation',
          'Competitive intelligence',
        ],
        strategy: [
          { step: 1, title: 'Data Assessment', description: 'Evaluate your data sources and quality' },
          { step: 2, title: 'Model Development', description: 'Build custom AI models for your specific needs' },
          { step: 3, title: 'Integration', description: 'Connect analytics to your business systems' },
          { step: 4, title: 'Insight Delivery', description: 'Deploy dashboards and automated reports' },
        ],
      },
    ],
  },
  {
    id: 'communication-messaging',
    title: 'Communication & Messaging Services',
    href: '/services/communication-messaging',
    description: 'Direct messaging that reaches customers where they are. SMS, voice, and email systems that actually get opened.',
    services: [
      {
        id: 'broadcast-sms',
        title: 'Broadcast SMS',
        href: '/services/broadcast-sms',
        shortDescription: 'Mass messaging for instant customer reach.',
        fullDescription: 'Send targeted SMS campaigns that reach thousands instantly. 98% open rates. Smart delivery timing. Real-time tracking.',
        features: [
          'AI-powered audience segmentation',
          'Real-time delivery tracking',
          'Personalized message templates',
          'Scheduled campaign deployment',
          'Two-way SMS communication',
        ],
        benefits: [
          '98% message open rate',
          'Instant customer engagement',
          'Cost-effective marketing',
          'Higher conversion rates',
        ],
        strategy: [
          { step: 1, title: 'Audience Analysis', description: 'AI analyzes your customer data for optimal targeting' },
          { step: 2, title: 'Message Crafting', description: 'Create personalized messages with AI suggestions' },
          { step: 3, title: 'Campaign Launch', description: 'Deploy at optimal times for maximum engagement' },
          { step: 4, title: 'Performance Tracking', description: 'Monitor results with real-time analytics' },
        ],
      },
      {
        id: 'bulk-sms',
        title: 'Bulk SMS',
        href: '/services/bulk-sms',
        shortDescription: 'High-volume SMS for business communication.',
        fullDescription: 'High-volume SMS infrastructure with API access, delivery confirmation, and compliance management. Built for scale.',
        features: [
          'API integration support',
          'Multi-language messaging',
          'Delivery receipt tracking',
          'Opt-out management',
          'DND filtering',
        ],
        benefits: [
          'Scalable to millions of messages',
          '99.9% uptime guarantee',
          'Regulatory compliance',
          'Detailed analytics dashboard',
        ],
        strategy: [
          { step: 1, title: 'Integration Setup', description: 'Connect our API to your systems seamlessly' },
          { step: 2, title: 'Contact Import', description: 'Upload and organize your contact lists' },
          { step: 3, title: 'Campaign Execution', description: 'Launch high-volume campaigns with confidence' },
          { step: 4, title: 'Analytics Review', description: 'Analyze performance and optimize future campaigns' },
        ],
      },
      {
        id: 'ivr-calling',
        title: 'IVR Calling for Offers',
        href: '/services/ivr-calling',
        shortDescription: 'Automated voice calls for promotions.',
        fullDescription: 'Automated voice campaigns that sound human. Promotional calls, confirmations, and surveys delivered at scale with natural AI voices.',
        features: [
          'AI voice synthesis',
          'Multi-language support',
          'Call scheduling',
          'Real-time analytics',
          'CRM integration',
        ],
        benefits: [
          'Human-like voice quality',
          '24/7 automated calling',
          'Higher response rates',
          'Reduced operational costs',
        ],
        strategy: [
          { step: 1, title: 'Script Design', description: 'Create engaging IVR scripts with AI assistance' },
          { step: 2, title: 'Voice Selection', description: 'Choose from multiple AI voice options' },
          { step: 3, title: 'Campaign Deployment', description: 'Schedule and launch automated calls' },
          { step: 4, title: 'Response Analysis', description: 'Track responses and optimize scripts' },
        ],
      },
      {
        id: 'email-sms-marketing',
        title: 'Email & SMS Marketing',
        href: '/services/email-sms-marketing',
        shortDescription: 'Unified multi-channel marketing campaigns.',
        fullDescription: 'Coordinate email and SMS into unified campaigns. Right message, right channel, right time. Higher engagement, better ROI.',
        features: [
          'Cross-channel automation',
          'AI-powered send-time optimization',
          'A/B testing capabilities',
          'Template library',
          'Advanced segmentation',
        ],
        benefits: [
          '3x higher engagement',
          'Consistent brand messaging',
          'Improved customer journey',
          'Higher ROI on campaigns',
        ],
        strategy: [
          { step: 1, title: 'Channel Strategy', description: 'Determine optimal email-to-SMS ratio' },
          { step: 2, title: 'Content Creation', description: 'Craft cohesive cross-channel messages' },
          { step: 3, title: 'Automation Setup', description: 'Configure triggers and workflows' },
          { step: 4, title: 'Performance Optimization', description: 'Use AI to improve campaign results' },
        ],
      },
    ],
  },
  {
    id: 'software-app-development',
    title: 'Software & App Development',
    href: '/services/software-app-development',
    description: 'Software built for your specific business needs. Web, mobile, and custom applications that solve real problems.',
    services: [
      {
        id: 'website-design-development',
        title: 'Website Design and Development',
        href: '/services/website-design-development',
        shortDescription: 'Stunning websites with AI optimization.',
        fullDescription: 'Fast, responsive websites that rank. Built with modern frameworks, optimized for Core Web Vitals, and designed to convert visitors into customers.',
        features: [
          'AI-driven UX optimization',
          'Responsive design',
          'SEO-friendly architecture',
          'Fast loading speeds',
          'CMS integration',
        ],
        benefits: [
          'Higher search rankings',
          'Better user engagement',
          'Increased conversions',
          'Easy content management',
        ],
        strategy: [
          { step: 1, title: 'Discovery', description: 'Understand your business goals and audience' },
          { step: 2, title: 'Design', description: 'Create stunning mockups with AI assistance' },
          { step: 3, title: 'Development', description: 'Build with clean, optimized code' },
          { step: 4, title: 'Launch & Optimize', description: 'Deploy and continuously improve' },
        ],
      },
      {
        id: 'mobile-app-development',
        title: 'Mobile App Development',
        href: '/services/mobile-app-development',
        shortDescription: 'Native and cross-platform mobile apps.',
        fullDescription: 'Native and cross-platform mobile apps that users actually keep installed. Clean design, fast performance, and features that drive engagement.',
        features: [
          'iOS & Android development',
          'AI integration',
          'Push notifications',
          'Offline functionality',
          'App store optimization',
        ],
        benefits: [
          'Wider audience reach',
          'Enhanced customer loyalty',
          'Direct communication channel',
          'Competitive advantage',
        ],
        strategy: [
          { step: 1, title: 'Requirement Analysis', description: 'Define features and platform strategy' },
          { step: 2, title: 'UI/UX Design', description: 'Create intuitive mobile interfaces' },
          { step: 3, title: 'Development', description: 'Build with native or cross-platform tech' },
          { step: 4, title: 'App Store Launch', description: 'Deploy and optimize for stores' },
        ],
      },
      {
        id: 'custom-software-solutions',
        title: 'Custom Software Solutions',
        href: '/services/custom-software-solutions',
        shortDescription: 'Tailored software for unique business needs.',
        fullDescription: 'Off-the-shelf software never fits perfectly. We build custom applications tailored to your exact workflows, integrations, and reporting needs.',
        features: [
          'Business process automation',
          'AI-powered analytics',
          'Third-party integrations',
          'Scalable architecture',
          'Security-focused design',
        ],
        benefits: [
          'Streamlined operations',
          'Reduced manual work',
          'Data-driven decisions',
          'Competitive differentiation',
        ],
        strategy: [
          { step: 1, title: 'Process Analysis', description: 'Map your current workflows' },
          { step: 2, title: 'Solution Design', description: 'Architect the perfect software' },
          { step: 3, title: 'Development', description: 'Build with agile methodology' },
          { step: 4, title: 'Deployment', description: 'Launch with training and support' },
        ],
      },
      {
        id: 'ui-ux-design',
        title: 'UI/UX Design & Prototyping',
        href: '/services/ui-ux-design',
        shortDescription: 'User-centered design with AI insights.',
        fullDescription: 'Interfaces that feel obvious to users. We research, prototype, and test designs before writing production code. Result: higher satisfaction, fewer support tickets.',
        features: [
          'User research & testing',
          'AI heatmap analysis',
          'Interactive prototypes',
          'Design systems',
          'Accessibility compliance',
        ],
        benefits: [
          'Higher user satisfaction',
          'Reduced bounce rates',
          'Faster development',
          'Consistent branding',
        ],
        strategy: [
          { step: 1, title: 'User Research', description: 'Understand your target audience' },
          { step: 2, title: 'Wireframing', description: 'Create low-fidelity layouts' },
          { step: 3, title: 'Prototyping', description: 'Build interactive mockups' },
          { step: 4, title: 'Testing', description: 'Validate with real users' },
        ],
      },
    ],
  },
  {
    id: 'maintenance-support',
    title: 'Maintenance & Support',
    href: '/services/maintenance-support',
    description: 'Your systems stay online, secure, and fast. We handle the technical maintenance so you focus on business.',
    services: [
      {
        id: 'web-app-maintenance',
        title: 'Web & App Maintenance & Support',
        href: '/services/web-app-maintenance',
        shortDescription: '24/7 monitoring and maintenance.',
        fullDescription: '24/7 monitoring, automated backups, security patches, and performance tuning. When issues arise, we fix them before you even notice.',
        features: [
          '24/7 AI monitoring',
          'Security patches',
          'Performance optimization',
          'Regular backups',
          'Bug fixes & updates',
        ],
        benefits: [
          '99.9% uptime',
          'Enhanced security',
          'Faster performance',
          'Peace of mind',
        ],
        strategy: [
          { step: 1, title: 'Audit', description: 'Assess current system health' },
          { step: 2, title: 'Monitoring Setup', description: 'Deploy AI monitoring tools' },
          { step: 3, title: 'Maintenance Plan', description: 'Create scheduled maintenance routine' },
          { step: 4, title: 'Continuous Support', description: 'Provide ongoing assistance' },
        ],
      },
    ],
  },
  {
    id: 'cloud-it-solutions',
    title: 'Cloud & IT Solutions',
    href: '/services/cloud-it-solutions',
    description: 'Cloud infrastructure that scales with your business. Migration, hosting, and consulting by certified experts.',
    services: [
      {
        id: 'cloud-solutions-hosting',
        title: 'Cloud Solutions & Hosting',
        href: '/services/cloud-solutions-hosting',
        shortDescription: 'Scalable cloud infrastructure.',
        fullDescription: 'Enterprise cloud hosting on AWS, Google Cloud, or Azure. Auto-scaling for traffic spikes, global CDN for speed, and 99.99% uptime SLA.',
        features: [
          'Auto-scaling infrastructure',
          'Global CDN',
          'AI resource optimization',
          'DDoS protection',
          '99.99% uptime SLA',
        ],
        benefits: [
          'Handle traffic spikes',
          'Global fast loading',
          'Cost optimization',
          'Enterprise security',
        ],
        strategy: [
          { step: 1, title: 'Assessment', description: 'Evaluate current infrastructure needs' },
          { step: 2, title: 'Architecture', description: 'Design scalable cloud solution' },
          { step: 3, title: 'Migration', description: 'Seamlessly move to cloud' },
          { step: 4, title: 'Optimization', description: 'Fine-tune for performance and cost' },
        ],
      },
      {
        id: 'it-consulting-transformation',
        title: 'IT Consulting & Digital Transformation',
        href: '/services/it-consulting-transformation',
        shortDescription: 'Strategic IT guidance and transformation.',
        fullDescription: 'Strategic technology consulting to modernize legacy systems, select the right tech stack, and execute digital transformation without disrupting operations.',
        features: [
          'IT strategy development',
          'Digital transformation roadmap',
          'Technology stack recommendations',
          'Process automation',
          'Change management',
        ],
        benefits: [
          'Competitive advantage',
          'Operational efficiency',
          'Cost reduction',
          'Future-proof technology',
        ],
        strategy: [
          { step: 1, title: 'Current State', description: 'Analyze existing IT landscape' },
          { step: 2, title: 'Strategy', description: 'Develop transformation roadmap' },
          { step: 3, title: 'Implementation', description: 'Execute transformation plan' },
          { step: 4, title: 'Evolution', description: 'Continuous improvement and innovation' },
        ],
      },
    ],
  },
  {
    id: 'digital-marketing-seo',
    title: 'Digital Marketing & SEO',
    href: '/services/digital-marketing-seo',
    description: 'Marketing that measures revenue, not vanity metrics. Data-driven campaigns that bring qualified leads.',
    services: [
      {
        id: 'seo',
        title: 'Search Engine Optimization',
        href: '/services/seo',
        shortDescription: 'Rank higher with AI SEO.',
        fullDescription: 'Technical SEO, content optimization, and authority building. We focus on rankings that drive revenue, not just traffic that bounces.',
        features: [
          'AI keyword research',
          'On-page optimization',
          'Technical SEO audit',
          'Content strategy',
          'Link building',
        ],
        benefits: [
          'Higher search rankings',
          'More organic traffic',
          'Better brand visibility',
          'Long-term results',
        ],
        strategy: [
          { step: 1, title: 'SEO Audit', description: 'Analyze current search performance' },
          { step: 2, title: 'Keyword Strategy', description: 'Identify high-value keywords with AI' },
          { step: 3, title: 'Optimization', description: 'Implement on-page and technical SEO' },
          { step: 4, title: 'Monitoring', description: 'Track rankings and adjust strategy' },
        ],
      },
      {
        id: 'social-media-marketing',
        title: 'Social Media Marketing & Management',
        href: '/services/social-media-marketing',
        shortDescription: 'Engage audiences on social platforms.',
        fullDescription: 'Social media management that builds real community. Content creation, posting schedules, and engagement that turns followers into customers.',
        features: [
          'AI content scheduling',
          'Multi-platform management',
          'Audience analytics',
          'Influencer collaboration',
          'Community management',
        ],
        benefits: [
          'Increased brand awareness',
          'Higher engagement rates',
          'More qualified leads',
          'Stronger brand loyalty',
        ],
        strategy: [
          { step: 1, title: 'Platform Analysis', description: 'Identify best platforms for your audience' },
          { step: 2, title: 'Content Strategy', description: 'Plan engaging content calendar' },
          { step: 3, title: 'Execution', description: 'Post and engage consistently' },
          { step: 4, title: 'Analytics', description: 'Measure and optimize performance' },
        ],
      },
      {
        id: 'paid-ads',
        title: 'Paid Ads (Google, Meta, LinkedIn)',
        href: '/services/paid-ads',
        shortDescription: 'Targeted advertising with AI optimization.',
        fullDescription: 'Performance marketing across Google Ads, Meta, and LinkedIn. We optimize for cost per acquisition and return on ad spend, not clicks.',
        features: [
          'AI bid optimization',
          'Audience targeting',
          'A/B testing',
          'Conversion tracking',
          'Retargeting campaigns',
        ],
        benefits: [
          'Lower cost per click',
          'Higher conversion rates',
          'Better ROI',
          'Scalable campaigns',
        ],
        strategy: [
          { step: 1, title: 'Audience Research', description: 'Define target demographics' },
          { step: 2, title: 'Campaign Setup', description: 'Create optimized ad campaigns' },
          { step: 3, title: 'Monitoring', description: 'Track performance metrics' },
          { step: 4, title: 'Optimization', description: 'AI-driven continuous improvement' },
        ],
      },
      {
        id: 'influencer-marketing',
        title: 'Influencer Marketing',
        href: '/services/influencer-marketing',
        shortDescription: 'Partner with relevant influencers.',
        fullDescription: 'Find and partner with influencers who genuinely connect with your audience. Authentic endorsements that drive trust and sales.',
        features: [
          'AI influencer matching',
          'Campaign management',
          'Performance tracking',
          'Contract negotiation',
          'Content approval',
        ],
        benefits: [
          'Authentic brand advocacy',
          'Access to new audiences',
          'Higher trust factor',
          'Improved conversions',
        ],
        strategy: [
          { step: 1, title: 'Influencer Search', description: 'Find perfect brand matches with AI' },
          { step: 2, title: 'Outreach', description: 'Connect and negotiate partnerships' },
          { step: 3, title: 'Campaign', description: 'Execute collaborative content' },
          { step: 4, title: 'Analysis', description: 'Measure campaign impact' },
        ],
      },
      {
        id: 'lead-generation',
        title: 'Lead Generation & Conversion Funnels',
        href: '/services/lead-generation',
        shortDescription: 'AI-powered lead generation systems.',
        fullDescription: 'Complete lead generation systems. Landing pages, lead magnets, nurture sequences, and sales handoff. Predictable pipeline growth.',
        features: [
          'Landing page creation',
          'Email automation',
          'Lead scoring',
          'CRM integration',
          'Funnel analytics',
        ],
        benefits: [
          'More qualified leads',
          'Higher conversion rates',
          'Automated nurturing',
          'Scalable growth',
        ],
        strategy: [
          { step: 1, title: 'Funnel Design', description: 'Map customer journey stages' },
          { step: 2, title: 'Asset Creation', description: 'Build landing pages and content' },
          { step: 3, title: 'Automation', description: 'Set up email sequences' },
          { step: 4, title: 'Optimization', description: 'Test and improve conversions' },
        ],
      },
    ],
  },
  {
    id: 'content-media-production',
    title: 'Content & Media Production',
    href: '/services/content-media-production',
    description: 'Studio-quality content production. Podcasts, photography, and video that elevates your brand.',
    services: [
      {
        id: 'podcast-production-only',
        title: 'Podcast Production Only',
        href: '/services/podcast-production-only',
        shortDescription: 'Professional podcast recording and editing.',
        fullDescription: 'Professional podcast production from recording to final edit. Studio quality sound, show notes, and distribution-ready files.',
        features: [
          'Studio-quality recording',
          'Professional editing',
          'Noise reduction',
          'Intro/outro creation',
          'Show notes writing',
        ],
        benefits: [
          'Professional audio quality',
          'Time-saving production',
          'Consistent publishing',
          'Engaging content',
        ],
        strategy: [
          { step: 1, title: 'Planning', description: 'Define episode structure and content' },
          { step: 2, title: 'Recording', description: 'Capture high-quality audio' },
          { step: 3, title: 'Post-Production', description: 'Edit and enhance audio' },
          { step: 4, title: 'Delivery', description: 'Provide final files and assets' },
        ],
      },
      {
        id: 'podcast-production-promotion',
        title: 'Podcast Production & Promotion',
        href: '/services/podcast-production-promotion',
        shortDescription: 'Full podcast service with marketing.',
        fullDescription: 'Full podcast service: production, distribution to all major platforms, and marketing to grow your listener base.',
        features: [
          'Full production service',
          'Distribution to platforms',
          'Marketing campaigns',
          'Social media promotion',
          'Listener analytics',
        ],
        benefits: [
          'Wider audience reach',
          'Growing subscriber base',
          'Brand authority building',
          'Monetization opportunities',
        ],
        strategy: [
          { step: 1, title: 'Strategy', description: 'Develop podcast marketing plan' },
          { step: 2, title: 'Production', description: 'Create high-quality episodes' },
          { step: 3, title: 'Distribution', description: 'Publish across all platforms' },
          { step: 4, title: 'Promotion', description: 'Execute marketing campaigns' },
        ],
      },
      {
        id: 'online-pr-reputation',
        title: 'Online PR & Reputation Management',
        href: '/services/online-pr-reputation',
        shortDescription: 'Build and protect brand reputation.',
        fullDescription: 'Protect and enhance your brand reputation. Review management, crisis response, and positive content strategies.',
        features: [
          'Brand monitoring',
          'Review management',
          'Crisis response',
          'Positive content creation',
          'Media relations',
        ],
        benefits: [
          'Positive brand image',
          'Crisis prevention',
          'Customer trust',
          'Competitive advantage',
        ],
        strategy: [
          { step: 1, title: 'Audit', description: 'Assess current online reputation' },
          { step: 2, title: 'Strategy', description: 'Develop reputation management plan' },
          { step: 3, title: 'Execution', description: 'Implement positive content strategy' },
          { step: 4, title: 'Monitoring', description: 'Continuous reputation tracking' },
        ],
      },
      {
        id: 'ad-shoot',
        title: 'Ad Shoot',
        href: '/services/ad-shoot',
        shortDescription: 'Professional advertisement video production.',
        fullDescription: 'Professional video production for advertisements. Script to screen, 4K quality, and delivery in all formats you need.',
        features: [
          '4K video production',
          'Scriptwriting',
          'Professional editing',
          'Motion graphics',
          'Multi-format delivery',
        ],
        benefits: [
          'Cinematic quality',
          'Engaging storytelling',
          'Brand elevation',
          'Higher ad performance',
        ],
        strategy: [
          { step: 1, title: 'Concept', description: 'Develop creative ad concept' },
          { step: 2, title: 'Pre-Production', description: 'Plan shoot logistics' },
          { step: 3, title: 'Production', description: 'Execute professional shoot' },
          { step: 4, title: 'Post-Production', description: 'Edit and deliver final ad' },
        ],
      },
      {
        id: 'photo-shoot',
        title: 'Photo Shoot',
        href: '/services/photo-shoot',
        shortDescription: 'Professional photography services.',
        fullDescription: 'Commercial photography that sells. Product shots, corporate portraits, and lifestyle imagery for marketing and advertising.',
        features: [
          'Product photography',
          'Corporate headshots',
          'Lifestyle shoots',
          'Photo editing',
          'Commercial licensing',
        ],
        benefits: [
          'Professional brand imagery',
          'Consistent visual identity',
          'Higher engagement',
          'Versatile content library',
        ],
        strategy: [
          { step: 1, title: 'Briefing', description: 'Understand photography needs' },
          { step: 2, title: 'Planning', description: 'Scout locations and plan shots' },
          { step: 3, title: 'Shoot', description: 'Capture professional photos' },
          { step: 4, title: 'Delivery', description: 'Edit and deliver final images' },
        ],
      },
    ],
  },
];

// ============================================================================
// TESTIMONIALS DATA
// ============================================================================

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  beforeMetric?: string;
  afterMetric?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'Bihar Tech Solutions',
    role: 'CEO',
    content: 'Our organic traffic jumped 150% in three months. The team understood our market and delivered results, not just reports.',
    rating: 5,
    avatar: '[PLACEHOLDER_TESTIMONIAL_AVATAR_1]',
    beforeMetric: '500 monthly visitors',
    afterMetric: '1,250 monthly visitors',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'Wellness Hub',
    role: 'Founder',
    content: 'Online sales up 40%. What impressed me most was their responsiveness. Any issue, any time, they were on it.',
    rating: 5,
    avatar: '[PLACEHOLDER_TESTIMONIAL_AVATAR_2]',
    beforeMetric: '2% conversion rate',
    afterMetric: '5.5% conversion rate',
  },
  {
    id: '3',
    name: 'Amit Patel',
    company: 'Patel Enterprises',
    role: 'Director',
    content: 'Md Faizan and his team built us custom software that cut our manual work by 60%. Real engineers who understand business.',
    rating: 5,
    avatar: '[PLACEHOLDER_TESTIMONIAL_AVATAR_3]',
    beforeMetric: '10 hours/day manual work',
    afterMetric: '4 hours/day automated',
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    company: 'Fashion Forward',
    role: 'Marketing Head',
    content: '50,000 new followers in six months. But more importantly, engagement that actually drives traffic to our store.',
    rating: 5,
    avatar: '[PLACEHOLDER_TESTIMONIAL_AVATAR_4]',
    beforeMetric: '5K followers',
    afterMetric: '55K followers',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    company: 'Singh Constructions',
    role: 'Owner',
    content: 'Customer satisfaction went from 72% to 94%. Altamash and the team rebuilt our entire customer experience.',
    rating: 5,
    avatar: '[PLACEHOLDER_TESTIMONIAL_AVATAR_5]',
    beforeMetric: '72% satisfaction',
    afterMetric: '94% satisfaction',
  },
  {
    id: '6',
    name: 'Neha Verma',
    company: 'EduLearn Platform',
    role: 'Co-founder',
    content: 'User engagement tripled after launch. The app is fast, intuitive, and our users actually love using it.',
    rating: 5,
    avatar: '[PLACEHOLDER_TESTIMONIAL_AVATAR_6]',
    beforeMetric: '1,000 daily active users',
    afterMetric: '3,000 daily active users',
  },
];

// ============================================================================
// CASE STUDIES DATA
// ============================================================================

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  image: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'E-commerce Transformation',
    client: 'Bihar Mart',
    industry: 'Retail',
    challenge: 'Online store was invisible in search and visitors were not buying.',
    solution: 'Technical SEO overhaul and conversion-focused redesign of the entire shopping experience.',
    results: [
      '300% increase in organic traffic',
      '150% improvement in conversion rate',
      '50% reduction in cart abandonment',
    ],
    image: '[PLACEHOLDER_CASE_STUDY_IMAGE_1]',
  },
  {
    id: '2',
    title: 'Healthcare App Launch',
    client: 'MediCare Plus',
    industry: 'Healthcare',
    challenge: 'Rural patients needed reliable access to healthcare consultations.',
    solution: 'Developed a custom mobile app with video consultation features.',
    results: [
      '10,000+ app downloads in first month',
      '95% patient satisfaction rate',
      '40% reduction in no-shows',
    ],
    image: '[PLACEHOLDER_CASE_STUDY_IMAGE_2]',
  },
  {
    id: '3',
    title: 'Brand Awareness Campaign',
    client: 'Bihar Tourism',
    industry: 'Government',
    challenge: 'Tourists did not know about Bihar\'s incredible destinations.',
    solution: 'Content strategy and targeted campaigns showcasing Bihar\'s heritage and attractions.',
    results: [
      '5M+ social media impressions',
      '200% increase in website traffic',
      'Featured in national media',
    ],
    image: '[PLACEHOLDER_CASE_STUDY_IMAGE_3]',
  },
];

// ============================================================================
// BLOG POSTS DATA
// ============================================================================

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How AI is Revolutionizing Digital Marketing in 2026',
    excerpt: 'Practical ways businesses are using AI to cut costs and drive revenue right now.',
    content: 'Full article content here...',
    author: 'Md Faizan',
    date: '2026-02-10',
    category: 'AI & Marketing',
    readTime: '5 min read',
    image: '[PLACEHOLDER_BLOG_IMAGE_1]',
  },
  {
    id: '2',
    title: 'SEO Strategies for Competitive Markets',
    excerpt: 'Specific tactics that work in competitive markets where everyone is fighting for the same keywords.',
    content: 'Full article content here...',
    author: 'Altamash Khan',
    date: '2026-02-08',
    category: 'SEO',
    readTime: '7 min read',
    image: '[PLACEHOLDER_BLOG_IMAGE_2]',
  },
  {
    id: '3',
    title: 'The Future of Podcast Marketing',
    excerpt: 'The data behind why podcasts build deeper customer relationships than most other channels.',
    content: 'Full article content here...',
    author: 'Md Faizan',
    date: '2026-02-05',
    category: 'Content Marketing',
    readTime: '6 min read',
    image: '[PLACEHOLDER_BLOG_IMAGE_3]',
  },
  {
    id: '4',
    title: 'Cloud Migration: A Complete Guide for SMEs',
    excerpt: 'A practical roadmap for SMBs considering cloud migration, including costs and timelines.',
    content: 'Full article content here...',
    author: 'Md Faizan',
    date: '2026-02-01',
    category: 'Cloud Computing',
    readTime: '8 min read',
    image: '[PLACEHOLDER_BLOG_IMAGE_4]',
  },
];

// ============================================================================
// FAQ DATA
// ============================================================================

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'What is the typical timeline for a project?',
    answer: 'Simple websites: 2-4 weeks. Complex software: 8-12 weeks. We give you a detailed timeline upfront before any work begins.',
    category: 'Timeline',
  },
  {
    id: '2',
    question: 'What is your refund policy?',
    answer: 'Full refund within 14 days if you are not satisfied. For ongoing projects, we prorate based on work completed.',
    category: 'Refund Policy',
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'UPI, cards, net banking, and bank transfers. Enterprise clients can request monthly billing.',
    category: 'Payments',
  },
  {
    id: '4',
    question: 'How does AI enhance your services?',
    answer: 'AI helps us analyze data faster, target audiences more precisely, and deliver better results in less time. We use it as a tool, not a replacement for strategy.',
    category: 'AI Technology',
  },
  {
    id: '5',
    question: 'Do you provide 24/7 support?',
    answer: 'Yes. Our monitoring systems run 24/7 and alert us to issues before they affect your business. Emergency support included for maintenance clients.',
    category: 'Support',
  },
  {
    id: '6',
    question: 'Can you work with businesses outside Bihar?',
    answer: 'Absolutely. We are based in Bhagalpur but work with clients across India and internationally. Our collaboration tools keep everyone connected.',
    category: 'General',
  },
  {
    id: '7',
    question: 'How do you ensure data security?',
    answer: 'Encryption, secure hosting, regular security audits, and full compliance with data protection laws. We take security seriously.',
    category: 'Security',
  },
  {
    id: '8',
    question: 'What makes Sovereon different from competitors?',
    answer: 'Three things: we are technical founders who understand business, we focus on revenue metrics not vanity numbers, and we actually pick up the phone when you call.',
    category: 'General',
  },
];

// ============================================================================
// PRICING DATA
// ============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small businesses ready to establish their digital presence',
    price: '₹9,999',
    period: 'per month',
    features: [
      'Basic SEO optimization',
      'Social media management (2 platforms)',
      'Monthly performance report',
      'Email support',
      '5 hours of maintenance',
    ],
    cta: 'Start Growing'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For businesses ready to scale their marketing efforts',
    price: '₹24,999',
    period: 'per month',
    features: [
      'Advanced SEO with AI',
      'Social media management (4 platforms)',
      'PPC campaign management',
      'Weekly performance reports',
      'Priority support',
      '15 hours of maintenance',
      'Content creation (4 pieces/month)',
    ],
    highlighted: true,
    cta: 'Scale Your Business'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For organizations that need comprehensive digital transformation',
    price: '₹49,999',
    period: 'per month',
    features: [
      'Complete digital marketing suite',
      'Unlimited social platforms',
      'Custom software solutions',
      'Dedicated account manager',
      '24/7 phone support',
      'Unlimited maintenance',
      'Unlimited content creation',
      'Monthly strategy sessions',
    ],
    cta: 'Book a Strategy Call'
  },
];

// ============================================================================
// CURRENT PROJECTS DATA
// ============================================================================

export interface CurrentProject {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  technologies: string[];
}

export const currentProjects: CurrentProject[] = [
  {
    id: '1',
    title: 'AI-Powered E-commerce Platform',
    description: 'Building a smart shopping platform for Bihar businesses with personalized recommendations.',
    progress: 75,
    image: '[PLACEHOLDER_PROJECT_IMAGE_1]',
    technologies: ['React', 'Node.js', 'TensorFlow', 'AWS'],
  },
  {
    id: '2',
    title: 'Healthcare Management System',
    description: 'Developing a comprehensive HMS for local clinics with telemedicine capabilities.',
    progress: 60,
    image: '[PLACEHOLDER_PROJECT_IMAGE_2]',
    technologies: ['Flutter', 'Firebase', 'WebRTC', 'AI Diagnostics'],
  },
  {
    id: '3',
    title: 'Smart Agriculture App',
    description: 'Creating an AI-driven app to help farmers optimize crop yields and market access.',
    progress: 40,
    image: '[PLACEHOLDER_PROJECT_IMAGE_3]',
    technologies: ['React Native', 'Python', 'IoT Integration', 'ML Models'],
  },
];

// ============================================================================
// FUTURE QUESTS DATA
// ============================================================================

export interface FutureQuest {
  id: string;
  title: string;
  description: string;
  timeline: string;
  icon: string;
}

export const futureQuests: FutureQuest[] = [
  {
    id: '1',
    title: 'AI Podcast Studio',
    description: 'Launching an AI-powered podcast production studio with automated editing and distribution.',
    timeline: 'Q2 2026',
    icon: 'Mic',
  },
  {
    id: '2',
    title: 'Bihar Digital Hub',
    description: 'Creating a co-working and training center for digital skills in Bhagalpur.',
    timeline: 'Q3 2026',
    icon: 'Building',
  },
  {
    id: '3',
    title: 'AI Marketing Academy',
    description: 'Launching courses to teach AI-powered marketing techniques to local businesses.',
    timeline: 'Q4 2026',
    icon: 'GraduationCap',
  },
  {
    id: '4',
    title: 'Regional Expansion',
    description: 'Expanding our services to Patna, Ranchi, and other major cities in the region.',
    timeline: '2027',
    icon: 'MapPin',
  },
];
