const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const aiServicesData = {
  slug: 'ai-services',
  title: 'AI Services',
  description: 'Cutting-edge AI solutions to transform your business with intelligent automation and insights.',
  order: 0,
  services: [
    {
      slug: 'ai-seo-search',
      title: 'AI SEO for AI Search',
      shortDescription: 'Optimize your content for AI-powered search engines like ChatGPT, Perplexity, and Google SGE.',
      fullDescription: 'Stay ahead of the search evolution with our AI SEO services. We optimize your content to rank in AI-powered search engines, answer engines, and conversational AI platforms. Our strategies ensure your brand appears in AI-generated responses and recommendations.',
      features: JSON.stringify(['AI search engine optimization', 'Conversational AI visibility', 'Featured snippet optimization for AI', 'Entity-based SEO strategy', 'AI answer engine positioning']),
      benefits: JSON.stringify(['Appear in ChatGPT/Claude responses', 'Higher visibility in AI search', 'Future-proof SEO strategy', 'Brand authority in AI recommendations']),
      strategy: JSON.stringify([
        { step: 1, title: 'AI Search Audit', description: 'Analyze how AI engines currently perceive your brand' },
        { step: 2, title: 'Content Optimization', description: 'Structure content for AI comprehension and citation' },
        { step: 3, title: 'Entity Building', description: 'Establish your brand as a recognized authority entity' },
        { step: 4, title: 'Monitoring & Adaptation', description: 'Track AI search visibility and continuously optimize' },
      ]),
      order: 1,
    },
    {
      slug: 'personalized-ai-agents',
      title: 'Personalized AI Agents',
      shortDescription: 'Custom AI assistants tailored to your business needs for customer service, sales, and operations.',
      fullDescription: 'Deploy intelligent AI agents that understand your business, products, and customers. Our custom AI agents handle customer support, qualify leads, schedule appointments, and automate workflows—available 24/7 with human-like interactions.',
      features: JSON.stringify(['Custom-trained AI models', 'Multi-platform deployment (web, WhatsApp, phone)', 'CRM & tool integrations', 'Human handoff capability', 'Continuous learning & improvement']),
      benefits: JSON.stringify(['24/7 customer support', 'Reduced operational costs', 'Faster response times', 'Consistent brand voice', 'Scalable customer interactions']),
      strategy: JSON.stringify([
        { step: 1, title: 'Requirements Analysis', description: 'Define use cases, personality, and integration needs' },
        { step: 2, title: 'Training & Setup', description: 'Train AI on your business data and knowledge base' },
        { step: 3, title: 'Integration', description: 'Connect with your existing tools and platforms' },
        { step: 4, title: 'Launch & Optimize', description: 'Deploy and refine based on real interactions' },
      ]),
      order: 2,
    },
    {
      slug: 'ai-content-generation',
      title: 'AI Content Generation & Automation',
      shortDescription: 'Scale your content production with AI-powered creation, from blogs to videos to social media.',
      fullDescription: 'Supercharge your content strategy with AI-generated blogs, social posts, videos, and marketing materials. Our AI content solutions maintain your brand voice while producing high-quality, SEO-optimized content at scale—saving time and boosting engagement.',
      features: JSON.stringify(['AI blog & article writing', 'Social media content automation', 'AI video generation & editing', 'Email sequence creation', 'Multilingual content production']),
      benefits: JSON.stringify(['10x content output', 'Consistent publishing schedule', 'SEO-optimized content', 'Reduced content costs', 'Faster time-to-market']),
      strategy: JSON.stringify([
        { step: 1, title: 'Brand Voice Training', description: 'Train AI on your brand guidelines and tone' },
        { step: 2, title: 'Content Strategy', description: 'Plan topics, formats, and publishing calendar' },
        { step: 3, title: 'AI Generation', description: 'Produce content with human oversight and editing' },
        { step: 4, title: 'Distribution', description: 'Automate publishing across all channels' },
      ]),
      order: 3,
    },
    {
      slug: 'ai-data-analytics',
      title: 'AI Data Analytics & Predictive Insights',
      shortDescription: 'Unlock hidden patterns and predict trends with advanced AI analytics and machine learning.',
      fullDescription: 'Transform your raw data into actionable intelligence. Our AI analytics services uncover patterns, predict customer behavior, forecast trends, and provide real-time insights that drive smarter business decisions and competitive advantage.',
      features: JSON.stringify(['Predictive analytics & forecasting', 'Customer behavior analysis', 'Anomaly detection', 'Real-time dashboards', 'Automated reporting & insights']),
      benefits: JSON.stringify(['Data-driven decision making', 'Predict market trends', 'Identify growth opportunities', 'Risk mitigation', 'Competitive intelligence']),
      strategy: JSON.stringify([
        { step: 1, title: 'Data Assessment', description: 'Evaluate your data sources and quality' },
        { step: 2, title: 'Model Development', description: 'Build custom AI models for your specific needs' },
        { step: 3, title: 'Integration', description: 'Connect analytics to your business systems' },
        { step: 4, title: 'Insight Delivery', description: 'Deploy dashboards and automated reports' },
      ]),
      order: 4,
    },
  ],
};

async function addAIServices() {
  // Check if AI Services category already exists
  const existing = await prisma.serviceCategory.findUnique({
    where: { slug: 'ai-services' },
  });

  if (existing) {
    console.log('AI Services category already exists');
    await prisma.$disconnect();
    return;
  }

  // Create AI Services category
  const category = await prisma.serviceCategory.create({
    data: {
      slug: aiServicesData.slug,
      title: aiServicesData.title,
      description: aiServicesData.description,
      order: aiServicesData.order,
    },
  });
  console.log(`✅ Created category: ${category.title}`);

  // Create services
  for (const service of aiServicesData.services) {
    const created = await prisma.serviceCMS.create({
      data: {
        ...service,
        categoryId: category.id,
      },
    });
    console.log(`  ✓ Created service: ${created.title}`);
  }

  console.log('\n🎉 AI Services category and 4 services added successfully!');
  await prisma.$disconnect();
}

addAIServices().catch(console.error);
