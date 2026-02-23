const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
  // Delete existing admin
  await prisma.adminUser.deleteMany();
  console.log('Deleted existing admin users');
  
  // Create new admin with correct password
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.adminUser.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  
  console.log('Created new admin user:');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  console.log('  ID:', admin.id);
  
  // Verify password works
  const verify = await bcrypt.compare('admin123', admin.password);
  console.log('Password verification:', verify ? 'SUCCESS' : 'FAILED');
  
  // Check CMS data
  const teamCount = await prisma.teamMember.count();
  const catCount = await prisma.serviceCategory.count();
  const serviceCount = await prisma.serviceCMS.count();
  const testimonialCount = await prisma.testimonial.count();
  const faqCount = await prisma.fAQ.count();
  
  console.log('\nCMS Data:');
  console.log('  Team members:', teamCount);
  console.log('  Service categories:', catCount);
  console.log('  Services:', serviceCount);
  console.log('  Testimonials:', testimonialCount);
  console.log('  FAQs:', faqCount);
  
  await prisma.$disconnect();
}

reset().catch(e => {
  console.error(e);
  process.exit(1);
});
