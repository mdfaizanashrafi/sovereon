const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
  const admin = await prisma.adminUser.findFirst();
  console.log('Admin user:', admin ? { id: admin.id, username: admin.username, lastLogin: admin.lastLogin } : 'NOT FOUND');
  
  if (admin) {
    const testPass = 'admin123';
    const isValid = await bcrypt.compare(testPass, admin.password);
    console.log('Password admin123 is valid:', isValid);
  }
  
  // Check counts
  const teamCount = await prisma.teamMember.count();
  const catCount = await prisma.serviceCategory.count();
  const testimonialCount = await prisma.testimonial.count();
  console.log('Team members:', teamCount);
  console.log('Service categories:', catCount);
  console.log('Testimonials:', testimonialCount);
  
  await prisma.$disconnect();
}

check().catch(console.error);
