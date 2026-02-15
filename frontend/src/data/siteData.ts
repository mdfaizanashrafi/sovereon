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
  tagline: 'AI-Powered Digital Solutions',
  establishmentDate: 'February 2026',
  address: {
    street: 'Habibpur',
    city: 'Bhagalpur',
    state: 'Bihar',
    pincode: '812002',
    country: 'India',
    full: 'Habibpur, Bhagalpur, Bihar - 812002, India',
  },
  contact: {
    phone: '8789109928',
    email: 'contact@sovereoninc.com',
    website: '[PLACEHOLDER_WEBSITE_URL]',
  },
  social: {
    instagram: '[PLACEHOLDER_SOCIAL_INSTAGRAM]',
    linkedin: '[PLACEHOLDER_SOCIAL_LINKEDIN]',
    facebook: '[PLACEHOLDER_SOCIAL_FACEBOOK]',
  },
};

// ============================================================================
// TEAM INFORMATION
// ============================================================================

export const teamMembers = [
  {
    name: 'Md Faizan',
    role: 'Technical Lead',
    department: 'Technicalities',
    description: 'Oversees all technical operations, software development, and AI integration strategies.',
    image: '[PLACEHOLDER_TEAM_IMAGE_1]',
  },
  {
    name: 'Altamash Khan',
    role: 'CRM Manager',
    department: 'Customer Relations',
    description: 'Manages client relationships, ensures customer satisfaction, and leads support initiatives.',
    image: '[PLACEHOLDER_TEAM_IMAGE_2]',
  },
  {
    name: 'Jawed Khan',
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
    name: 'Zahid Sheikh',
    role: 'AI & Graphic Designer',
    department: 'Design & AI',
    description: 'Combines AI expertise with graphic design to deliver innovative visual solutions.',
    image: '[PLACEHOLDER_TEAM_IMAGE_5]',
  },
  {
    name: 'Kaify',
    role: 'Data Analyst',
    department: 'Data Analytics',
    description: 'Analyzes data insights to drive strategic business decisions and optimization.',
    image: '[PLACEHOLDER_TEAM_IMAGE_6]',
  },
  {
    name: 'Danish Khan',
    role: 'Full Stack Developer',
    department: 'Development',
    description: 'Develops end-to-end solutions with expertise in both frontend and backend technologies.',
    image: '[PLACEHOLDER_TEAM_IMAGE_7]',
  },
  {
    name: 'Ashu Khan',
    role: 'Social Media Manager & Video Editor Expert',
    department: 'Digital Marketing',
    description: 'Manages social media presence and creates expert-level video content for engagement.',
    image: '[PLACEHOLDER_TEAM_IMAGE_8]',
  },
  {
    name: 'Shadan Ghyas',
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
    id: 'communication-messaging',
    title: 'Communication & Messaging Services',
    href: '/services/communication-messaging',
    description: 'Reach your audience instantly with AI-powered messaging solutions.',
    services: [
      {
        id: 'broadcast-sms',
        title: 'Broadcast SMS',
        href: '/services/broadcast-sms',
        shortDescription: 'Mass messaging for instant customer reach.',
        fullDescription: 'Send personalized bulk messages to thousands instantly with AI-driven targeting and delivery optimization.',
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
        fullDescription: 'Enterprise-grade bulk SMS service with API integration, delivery reports, and intelligent routing.',
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
        fullDescription: 'Interactive Voice Response system for automated promotional calls with AI-powered speech recognition.',
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
        fullDescription: 'Combine email and SMS for powerful multi-channel campaigns with AI-optimized timing and content.',
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
    description: 'Custom software solutions built with cutting-edge AI technology.',
    services: [
      {
        id: 'website-design-development',
        title: 'Website Design and Development',
        href: '/services/website-design-development',
        shortDescription: 'Stunning websites with AI optimization.',
        fullDescription: 'Responsive, SEO-friendly websites built with modern frameworks and AI-powered performance optimization.',
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
        fullDescription: 'iOS and Android apps with AI features, push notifications, and seamless user experiences.',
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
        fullDescription: 'Bespoke software applications designed specifically for your business processes and workflows.',
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
        fullDescription: 'Create intuitive interfaces with AI-powered user behavior analysis and rapid prototyping.',
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
    description: 'Keep your digital assets running smoothly 24/7.',
    services: [
      {
        id: 'web-app-maintenance',
        title: 'Web & App Maintenance & Support',
        href: '/services/web-app-maintenance',
        shortDescription: '24/7 monitoring and maintenance.',
        fullDescription: 'Comprehensive maintenance services with AI monitoring, security updates, and performance optimization.',
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
    description: 'Scalable cloud infrastructure and digital transformation.',
    services: [
      {
        id: 'cloud-solutions-hosting',
        title: 'Cloud Solutions & Hosting',
        href: '/services/cloud-solutions-hosting',
        shortDescription: 'Scalable cloud infrastructure.',
        fullDescription: 'Reliable cloud hosting with auto-scaling, CDN, and AI-powered resource optimization.',
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
        fullDescription: 'Expert consulting to modernize your IT infrastructure and drive digital transformation.',
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
    description: 'AI-powered marketing strategies for maximum ROI.',
    services: [
      {
        id: 'seo',
        title: 'Search Engine Optimization',
        href: '/services/seo',
        shortDescription: 'Rank higher with AI SEO.',
        fullDescription: 'AI-driven SEO strategies for top search rankings, increased organic traffic, and better visibility.',
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
        fullDescription: 'AI-powered social media management for increased engagement, followers, and brand awareness.',
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
        fullDescription: 'Data-driven paid advertising campaigns across Google, Facebook, Instagram, and LinkedIn.',
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
        fullDescription: 'Connect with influencers who align with your brand for authentic marketing campaigns.',
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
        fullDescription: 'Build automated funnels that attract, nurture, and convert leads into customers.',
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
    description: 'Professional content creation with AI enhancement.',
    services: [
      {
        id: 'podcast-production-only',
        title: 'Podcast Production Only',
        href: '/services/podcast-production-only',
        shortDescription: 'Professional podcast recording and editing.',
        fullDescription: 'End-to-end podcast production including recording, editing, and audio enhancement.',
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
        fullDescription: 'Complete podcast solution including production, distribution, and promotional marketing.',
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
        fullDescription: 'Monitor, manage, and improve your online presence and brand reputation.',
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
        fullDescription: 'High-quality video production for TV commercials, online ads, and promotional content.',
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
        fullDescription: 'Stunning product, corporate, and lifestyle photography for your brand.',
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
    content: 'Sovereon transformed our digital presence completely. Their AI-powered SEO strategy increased our organic traffic by 150% in just 3 months.',
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
    content: 'The team at Sovereon is exceptional. Their 24/7 support and ROI-focused approach helped us achieve a 40% increase in online sales.',
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
    content: 'Working with Md Faizan and the technical team was a game-changer. Our custom software solution streamlined operations by 60%.',
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
    content: 'Their social media marketing expertise is unmatched. We gained 50K followers in 6 months with their AI-driven content strategy.',
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
    content: 'Altamash Khan and the CRM team provided outstanding support. Our customer satisfaction scores improved dramatically.',
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
    content: 'The mobile app they developed exceeded our expectations. User engagement increased by 200% within the first quarter.',
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
    challenge: 'Struggling with low online visibility and poor conversion rates.',
    solution: 'Implemented AI-powered SEO and redesigned the e-commerce platform.',
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
    challenge: 'Needed a reliable telemedicine platform for rural patients.',
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
    challenge: 'Low awareness of tourist destinations in Bihar.',
    solution: 'Created comprehensive digital marketing and content strategy.',
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
    excerpt: 'Discover how artificial intelligence is transforming the way businesses connect with their audiences.',
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
    excerpt: 'Learn proven SEO techniques to outrank established competitors in mature markets.',
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
    excerpt: 'Why podcasts are becoming the most effective medium for brand storytelling.',
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
    excerpt: 'Everything small and medium businesses need to know about moving to the cloud.',
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
    answer: 'Project timelines vary based on complexity. A simple website takes 2-4 weeks, while complex software solutions may take 8-12 weeks. We provide detailed timelines during the consultation phase.',
    category: 'Timeline',
  },
  {
    id: '2',
    question: 'What is your refund policy?',
    answer: 'We offer a full refund if you are unsatisfied with our services within the first 14 days. For ongoing projects, refunds are prorated based on work completed.',
    category: 'Refund Policy',
  },
  {
    id: '3',
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, credit/debit cards, net banking, and bank transfers. For enterprise clients, we also offer monthly billing options.',
    category: 'Payments',
  },
  {
    id: '4',
    question: 'How does AI enhance your services?',
    answer: 'We use AI for data analysis, content optimization, audience targeting, performance prediction, and automation. This results in better outcomes and faster delivery.',
    category: 'AI Technology',
  },
  {
    id: '5',
    question: 'Do you provide 24/7 support?',
    answer: 'Yes, we offer 24/7 support for all our maintenance and support clients. Our AI monitoring system ensures issues are detected and addressed promptly.',
    category: 'Support',
  },
  {
    id: '6',
    question: 'Can you work with businesses outside Bihar?',
    answer: 'Absolutely! While we are based in Bhagalpur, Bihar, we serve clients across India and internationally through our remote collaboration tools.',
    category: 'General',
  },
  {
    id: '7',
    question: 'How do you ensure data security?',
    answer: 'We follow industry best practices including encryption, secure hosting, regular audits, and compliance with data protection regulations. Your data security is our priority.',
    category: 'Security',
  },
  {
    id: '8',
    question: 'What makes Sovereon different from competitors?',
    answer: 'Our AI-first approach, local presence in Bihar, dedicated team led by Md Faizan and Altamash Khan, and our commitment to ROI-focused results set us apart.',
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
    description: 'Perfect for small businesses getting started',
    price: '₹9,999',
    period: 'per month',
    features: [
      'Basic SEO optimization',
      'Social media management (2 platforms)',
      'Monthly performance report',
      'Email support',
      '5 hours of maintenance',
    ],
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing businesses',
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
    cta: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For businesses needing full-service solutions',
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
    cta: 'Contact Us',
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
