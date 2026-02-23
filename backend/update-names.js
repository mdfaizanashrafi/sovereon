const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  // Update Ashu Khan to Shadan Ahmad
  await prisma.teamMember.updateMany({
    where: { name: 'Ashu Khan' },
    data: { name: 'Shadan Ahmad' }
  });
  console.log('Updated: Ashu Khan → Shadan Ahmad');

  // Update Danish Khan to Danish Shamim
  await prisma.teamMember.updateMany({
    where: { name: 'Danish Khan' },
    data: { name: 'Danish Shamim' }
  });
  console.log('Updated: Danish Khan → Danish Shamim');

  // Update Jawed Akhter to Jawed Akhtar
  await prisma.teamMember.updateMany({
    where: { name: 'Jawed Akhter' },
    data: { name: 'Jawed Akhtar' }
  });
  console.log('Updated: Jawed Akhter → Jawed Akhtar');

  await prisma.$disconnect();
}

update().catch(console.error);
