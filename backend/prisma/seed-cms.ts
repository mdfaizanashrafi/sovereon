/**
 * CMS Database Seeder
 * Seeds the database with content from siteData.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Team Members Data
const teamMembersData = [
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
    name: 'Jawed Akhter',
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
    name: 'Danish Khan',
    role: 'Full Stack Developer',
    department: 'Development',
    description: 'Develops end-to-end solutions with expertise in both frontend and backend technologies.',
    order: 7,
  },
  {
    name: 'Ashu Khan',
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

// Service Categories with Services
const serviceCategoriesData = [
  {
    slug: 'communication-messaging',
    title: 'Communication & Messaging Services',
    description: 'Reach your audience instantly with AI-powered messaging solutions.',
    order: 1,
    services: [
      {
        slug: 'broadcast-sms',
        title: 'Broadcast SMS',
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
        order: 1,
      },
      {
        slug: 'bulk-sms',
        title: 'Bulk SMS',
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
        order: 2,
      },
      {
        slug: 'ivr-calling',
        title: 'IVR Calling for Offers',
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
        order: 3,
      },
      {
        slug: 'email-sms-marketing',
        title: 'Email & SMS Marketing',
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
        order: 4,
      },
    ],
  },
  {
    slug: 'software-app-development',
    title: 'Software & App Development',
    description: 'Custom software solutions built with cutting-edge AI technology.',
    order: 2,
    services: [
      {
        slug: 'website-design-development',
        title: 'Website Design and Development',
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
        order: 1,
      },
      {
        slug: 'mobile-app-development',
        title: 'Mobile App Development',
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
        order: 2,
      },
      {
        slug: 'custom-software-solutions',
        title: 'Custom Software Solutions',
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
        order: 3,
      },
      {
        slug: 'ui-ux-design',
        title: 'UI/UX Design & Prototyping',
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
        order: 4,
      },
    ],
  },
  {
    slug: 'maintenance-support',
    title: 'Maintenance & Support',
    description: 'Keep your digital assets running smoothly 24/7.',
    order: 3,
    services: [
      {
        slug: 'web-app-maintenance',
        title: 'Web & App Maintenance & Support',
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
        order: 1,
      },
    ],
  },
  {
    slug: 'cloud-it-solutions',
    title: 'Cloud & IT Solutions',
    description: 'Scalable cloud infrastructure and digital transformation.',
    order: 4,
    services: [
      {
        slug: 'cloud-solutions-hosting',
        title: 'Cloud Solutions & Hosting',
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
        order: 1,
      },
      {
        slug: 'it-consulting-transformation',
        title: 'IT Consulting & Digital Transformation',
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
        order: 2,
      },
    ],
  },
  {
    slug: 'digital-marketing-seo',
    title: 'Digital Marketing & SEO',
    description: 'AI-powered marketing strategies for maximum ROI.',
    order: 5,
    services: [
      {
        slug: 'seo',
        title: 'Search Engine Optimization',
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
        order: 1,
      },
      {
        slug: 'social-media-marketing',
        title: 'Social Media Marketing & Management',
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
        order: 2,
      },
      {
        slug: 'paid-ads',
        title: 'Paid Ads (Google, Meta, LinkedIn)',
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
        order: 3,
      },
      {
        slug: 'influencer-marketing',
        title: 'Influencer Marketing',
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
        order: 4,
      },
      {
        slug: 'lead-generation',
        title: 'Lead Generation & Conversion Funnels',
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
        order: 5,
      },
    ],
  },
  {
    slug: 'content-media-production',
    title: 'Content & Media Production',
    description: 'Professional content creation with AI enhancement.',
    order: 6,
    services: [
      {
        slug: 'podcast-production-only',
        title: 'Podcast Production Only',
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
        order: 1,
      },
      {
        slug: 'podcast-production-promotion',
        title: 'Podcast Production & Promotion',
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
        order: 2,
      },
      {
        slug: 'online-pr-reputation',
        title: 'Online PR & Reputation Management',
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
        order: 3,
      },
      {
        slug: 'ad-shoot',
        title: 'Ad Shoot',
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
        order: 4,
      },
      {
        slug: 'photo-shoot',
        title: 'Photo Shoot',
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
        order: 5,
      },
    ],
  },
];

// Testimonials Data
const testimonialsData = [
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

// FAQ Data
const faqData = [
  {
    question: 'What is the typical timeline for a project?',
    answer: 'Project timelines vary based on complexity. A simple website takes 2-4 weeks, while complex software solutions may take 8-12 weeks. We provide detailed timelines during the consultation phase.',
    category: 'Timeline',
    order: 1,
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a full refund if you are unsatisfied with our services within the first 14 days. For ongoing projects, refunds are prorated based on work completed.',
    category: 'Refund Policy',
    order: 2,
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, credit/debit cards, net banking, and bank transfers. For enterprise clients, we also offer monthly billing options.',
    category: 'Payments',
    order: 3,
  },
  {
    question: 'How does AI enhance your services?',
    answer: 'We use AI for data analysis, content optimization, audience targeting, performance prediction, and automation. This results in better outcomes and faster delivery.',
    category: 'AI Technology',
    order: 4,
  },
  {
    question: 'Do you provide 24/7 support?',
    answer: 'Yes, we offer 24/7 support for all our maintenance and support clients. Our AI monitoring system ensures issues are detected and addressed promptly.',
    category: 'Support',
    order: 5,
  },
  {
    question: 'Can you work with businesses outside Bihar?',
    answer: 'Absolutely! While we are based in Bhagalpur, Bihar, we serve clients across India and internationally through our remote collaboration tools.',
    category: 'General',
    order: 6,
  },
  {
    question: 'How do you ensure data security?',
    answer: 'We follow industry best practices including encryption, secure hosting, regular audits, and compliance with data protection regulations. Your data security is our priority.',
    category: 'Security',
    order: 7,
  },
  {
    question: 'What makes Sovereon different from competitors?',
    answer: 'Our AI-first approach, local presence in Bihar, dedicated team led by Md Faizan and Altamash Khan, and our commitment to ROI-focused results set us apart.',
    category: 'General',
    order: 8,
  },
];

// Current Projects Data
const currentProjectsData = [
  {
    title: 'AI-Powered E-commerce Platform',
    description: 'Building a smart shopping platform for Bihar businesses with personalized recommendations.',
    progress: 75,
    technologies: ['React', 'Node.js', 'TensorFlow', 'AWS'],
    order: 1,
  },
  {
    title: 'Healthcare Management System',
    description: 'Developing a comprehensive HMS for local clinics with telemedicine capabilities.',
    progress: 60,
    technologies: ['Flutter', 'Firebase', 'WebRTC', 'AI Diagnostics'],
    order: 2,
  },
  {
    title: 'Smart Agriculture App',
    description: 'Creating an AI-driven app to help farmers optimize crop yields and market access.',
    progress: 40,
    technologies: ['React Native', 'Python', 'IoT Integration', 'ML Models'],
    order: 3,
  },
];

// Future Quests Data
const futureQuestsData = [
  {
    title: 'AI Podcast Studio',
    description: 'Launching an AI-powered podcast production studio with automated editing and distribution.',
    timeline: 'Q2 2026',
    icon: 'Mic',
    order: 1,
  },
  {
    title: 'Bihar Digital Hub',
    description: 'Creating a co-working and training center for digital skills in Bhagalpur.',
    timeline: 'Q3 2026',
    icon: 'Building',
    order: 2,
  },
  {
    title: 'AI Marketing Academy',
    description: 'Launching courses to teach AI-powered marketing techniques to local businesses.',
    timeline: 'Q4 2026',
    icon: 'GraduationCap',
    order: 3,
  },
  {
    title: 'Regional Expansion',
    description: 'Expanding our services to Patna, Ranchi, and other major cities in the region.',
    timeline: '2027',
    icon: 'MapPin',
    order: 4,
  },
];

// Page Content Data
const pageContentData = [
  {
    page: 'home',
    section: 'hero',
    content: JSON.stringify({
      headline: 'Sovereon Inc. AI-Powered Growth in a Competitive Market',
      subheadline: 'Established February 2026 in Bhagalpur, Bihar — Delivering AI-Advanced Services for Unmatched ROI.',
      badge: 'AI-Powered Digital Solutions',
      ctaPrimary: 'Get Started',
      ctaSecondary: 'Learn More',
    }),
  },
  {
    page: 'home',
    section: 'results',
    content: JSON.stringify({
      title: 'Expect 30% Faster Growth',
      subtitle: 'AI Analyzes Data for Personalized Strategies — Outpace 5-Year Market Leaders',
      stats: [
        { label: 'Average Growth', value: '30%', description: 'Faster than traditional methods' },
        { label: 'Client Satisfaction', value: '95%', description: 'Based on post-project surveys' },
        { label: 'Projects Delivered', value: '50+', description: 'Across various industries' },
        { label: 'Support Response', value: '<2hr', description: 'Average response time' },
      ],
    }),
  },
  {
    page: 'home',
    section: 'whyChooseUs',
    content: JSON.stringify({
      reasons: [
        { title: '24/7 Support', description: 'Round-the-clock assistance with AI monitoring to catch and resolve issues before they impact your business.' },
        { title: 'ROI-Focused Approach', description: 'Every strategy is designed with your bottom line in mind. We measure success by your growth, not vanity metrics.' },
        { title: 'Expert Team', description: 'Led by Md Faizan (Technical) and Altamash Khan (CRM), our team brings fresh innovation since February 2026.' },
        { title: 'AI-First Strategy', description: 'We leverage cutting-edge AI to deliver faster, smarter, and more effective solutions than traditional agencies.' },
        { title: 'Proven Results', description: 'Our clients see an average of 30% faster growth compared to traditional digital marketing approaches.' },
        { title: 'Local Expertise', description: 'Based in Bhagalpur, Bihar, we understand the local market while delivering world-class solutions.' },
      ],
    }),
  },
  {
    page: 'footer',
    section: 'links',
    content: JSON.stringify({
      services: [
        { label: 'Communication & Messaging', href: '/services/communication-messaging' },
        { label: 'Software Development', href: '/services/software-app-development' },
        { label: 'Cloud & IT Solutions', href: '/services/cloud-it-solutions' },
        { label: 'Digital Marketing', href: '/services/digital-marketing-seo' },
        { label: 'Content Production', href: '/services/content-media-production' },
      ],
      company: [
        { label: 'Who We Are', href: '/who-we-are' },
        { label: 'Why Choose Us', href: '/why-choose-us' },
        { label: 'Testimonials', href: '/testimonials' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Careers', href: '/careers' },
      ],
      support: [
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Blog', href: '/blog' },
        { label: 'Sitemap', href: '/sitemap' },
      ],
    }),
  },
];

// Global Settings Data
const globalSettingsData = [
  { key: 'companyName', value: 'Sovereon Inc.' },
  { key: 'tagline', value: 'AI-Powered Digital Solutions' },
  { key: 'establishmentDate', value: 'February 2026' },
  { key: 'addressStreet', value: '' },
  { key: 'addressCity', value: 'Bhagalpur' },
  { key: 'addressState', value: 'Bihar' },
  { key: 'addressPincode', value: '812002' },
  { key: 'addressCountry', value: 'India' },
  { key: 'contactPhone', value: '8789109928' },
  { key: 'contactEmail', value: 'sovereon@sovereon.online' },
  { key: 'socialInstagram', value: '@sovereoninc' },
  { key: 'socialLinkedin', value: 'Sovereon Inc.' },
  { key: 'socialFacebook', value: 'Sovereon Inc.' },
];

async function main() {
  console.log('🌱 Starting CMS database seeding...\n');

  // Clear existing data (optional - remove in production)
  console.log('Clearing existing CMS data...');
  await prisma.serviceCMS.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.pageContent.deleteMany();
  await prisma.globalSetting.deleteMany();
  await prisma.currentProject.deleteMany();
  await prisma.futureQuest.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Seed Team Members
  console.log('Seeding team members...');
  for (const member of teamMembersData) {
    await prisma.teamMember.create({ data: member });
  }
  console.log(`✅ Seeded ${teamMembersData.length} team members\n`);

  // Seed Service Categories and Services
  console.log('Seeding service categories and services...');
  for (const category of serviceCategoriesData) {
    const { services, ...categoryData } = category;
    const createdCategory = await prisma.serviceCategory.create({
      data: categoryData,
    });

    for (const service of services) {
      await prisma.serviceCMS.create({
        data: {
          ...service,
          categoryId: createdCategory.id,
          features: JSON.stringify(service.features),
          benefits: JSON.stringify(service.benefits),
          strategy: JSON.stringify(service.strategy),
        },
      });
    }
  }
  console.log(`✅ Seeded ${serviceCategoriesData.length} categories with services\n`);

  // Seed Testimonials
  console.log('Seeding testimonials...');
  for (const testimonial of testimonialsData) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log(`✅ Seeded ${testimonialsData.length} testimonials\n`);

  // Seed FAQs
  console.log('Seeding FAQs...');
  for (const faq of faqData) {
    await prisma.fAQ.create({ data: faq });
  }
  console.log(`✅ Seeded ${faqData.length} FAQs\n`);

  // Seed Page Content
  console.log('Seeding page content...');
  for (const content of pageContentData) {
    await prisma.pageContent.create({ data: content });
  }
  console.log(`✅ Seeded ${pageContentData.length} page content entries\n`);

  // Seed Global Settings
  console.log('Seeding global settings...');
  for (const setting of globalSettingsData) {
    await prisma.globalSetting.create({ data: setting });
  }
  console.log(`✅ Seeded ${globalSettingsData.length} global settings\n`);

  // Seed Current Projects
  console.log('Seeding current projects...');
  for (const project of currentProjectsData) {
    await prisma.currentProject.create({
      data: {
        ...project,
        technologies: JSON.stringify(project.technologies),
      },
    });
  }
  console.log(`✅ Seeded ${currentProjectsData.length} current projects\n`);

  // Seed Future Quests
  console.log('Seeding future quests...');
  for (const quest of futureQuestsData) {
    await prisma.futureQuest.create({ data: quest });
  }
  console.log(`✅ Seeded ${futureQuestsData.length} future quests\n`);

  // Create default admin user if not exists
  console.log('Creating admin user...');
  const adminExists = await prisma.adminUser.findUnique({
    where: { username: 'admin' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    console.log('✅ Created default admin user (username: admin, password: admin123)');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  console.log('\n🎉 CMS database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
