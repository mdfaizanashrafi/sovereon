import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcryptjs.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sovereon.com' },
    update: {},
    create: {
      email: 'admin@sovereon.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('✓ Created admin user:', admin.email);

  // Create demo user
  const demoPassword = await bcryptjs.hash('demo123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@sovereon.com' },
    update: {},
    create: {
      email: 'demo@sovereon.com',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'User',
      companyName: 'Demo Company',
      emailVerified: true,
    },
  });

  console.log('✓ Created demo user:', demoUser.email);

  // Create services
  const services = [
    {
      name: 'Website Design & Development',
      slug: 'website-design-development',
      description: 'Professional website design and development services',
      category: 'Software & App Development',
      basePrice: 2999,
      features: JSON.stringify(['Responsive Design', 'SEO Optimized', 'Fast Loading']),
    },
    {
      name: 'Mobile App Development',
      slug: 'mobile-app-development',
      description: 'Native and cross-platform mobile app development',
      category: 'Software & App Development',
      basePrice: 5999,
      features: JSON.stringify(['iOS & Android', 'Cloud Integration', '24/7 Support']),
    },
    {
      name: 'Digital Marketing & SEO',
      slug: 'digital-marketing-seo',
      description: 'Complete digital marketing and SEO solutions',
      category: 'Digital Marketing & SEO',
      basePrice: 1999,
      features: JSON.stringify(['Keyword Research', 'Content Creation', 'Analytics']),
    },
    {
      name: 'Cloud Solutions & Hosting',
      slug: 'cloud-solutions-hosting',
      description: 'Scalable cloud hosting and infrastructure',
      category: 'Cloud & IT Solutions',
      basePrice: 499,
      features: JSON.stringify(['99.9% Uptime', 'Auto Scaling', 'Security']),
    },
    {
      name: 'Email & SMS Marketing',
      slug: 'email-sms-marketing',
      description: 'Bulk email and SMS marketing campaigns',
      category: 'Communication & Messaging',
      basePrice: 299,
      features: JSON.stringify(['Template Builder', 'Analytics', 'Automation']),
    },
  ];

  for (const service of services) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: { ...service, isActive: true } as any,
    });
    console.log('✓ Created service:', created.name);
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
