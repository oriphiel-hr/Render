import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedLegalStatuses() {
  console.log('🌱 Starting seed: Legal Statuses...');
  console.log('');
  
  const legalStatuses = [
    {
      id: 'cls1_individual',
      code: 'INDIVIDUAL',
      name: 'Fizička osoba',
      description: 'Privatna osoba bez registrirane djelatnosti',
      isActive: true
    },
    {
      id: 'cls2_sole_trader',
      code: 'SOLE_TRADER',
      name: 'Obrtnik',
      description: 'Registrirani obrt - fizička osoba s OIB-om',
      isActive: true
    },
    {
      id: 'cls3_pausal',
      code: 'PAUSAL',
      name: 'Paušalni obrt',
      description: 'Obrt s paušalnim oporezivanjem',
      isActive: true
    },
    {
      id: 'cls4_doo',
      code: 'DOO',
      name: 'd.o.o.',
      description: 'Društvo s ograničenom odgovornošću',
      isActive: true
    },
    {
      id: 'cls5_jdoo',
      code: 'JDOO',
      name: 'j.d.o.o.',
      description: 'Jednostavno društvo s ograničenom odgovornošću',
      isActive: true
    },
    {
      id: 'cls6_freelancer',
      code: 'FREELANCER',
      name: 'Samostalni djelatnik',
      description: 'Freelancer s paušalnim oporezivanjem',
      isActive: true
    }
  ];
  
  console.log(`📝 Inserting ${legalStatuses.length} legal statuses...`);
  console.log('');
  
  for (const status of legalStatuses) {
    try {
      const result = await prisma.legalStatus.upsert({
        where: { id: status.id },
        update: status,
        create: status
      });
      console.log(`✅ ${result.code.padEnd(15)} - ${result.name}`);
    } catch (error) {
      console.error(`❌ Failed to insert ${status.code}:`, error.message);
    }
  }
  
  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  
  // Prikaži sve pravne statuse
  const allStatuses = await prisma.legalStatus.findMany({
    orderBy: { id: 'asc' }
  });
  
  console.log('📊 Current Legal Statuses in database:');
  console.log('========================================');
  allStatuses.forEach(status => {
    console.log(`${status.id.padEnd(20)} | ${status.code.padEnd(15)} | ${status.name}`);
  });
  console.log('========================================');
}

seedLegalStatuses()
  .catch((e) => {
    console.error('');
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

