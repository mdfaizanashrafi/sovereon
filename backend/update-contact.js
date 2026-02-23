const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  const updates = [
    { key: 'contactPhone', value: '9113156083' },
    { key: 'socialInstagram', value: 'https://instagram.sovereon.online' },
    { key: 'socialFacebook', value: 'https://facebook.sovereon.online' },
    { key: 'socialLinkedIn', value: 'https://linkedin.sovereon.online' },
  ];

  for (const { key, value } of updates) {
    await prisma.globalSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`✅ Updated: ${key} = ${value}`);
  }

  await prisma.$disconnect();
}

update().catch(console.error);
