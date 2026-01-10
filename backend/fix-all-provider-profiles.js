import { PrismaClient } from '@prisma/client';

// Koristi AWS bazu podataka
const DATABASE_URL = 'postgresql://uslugar_user:uslugar_password@uslugar-db.cmh3zk0u1000kkxgy3jt1wnme.us-east-1.rds.amazonaws.com:5432/uslugar_db';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function fixAllProviderProfiles() {
  try {
    console.log('🔍 Tražim PROVIDER korisnike bez ProviderProfile...');
    
    // Pronađi sve PROVIDER korisnike koji nemaju ProviderProfile
    const providersWithoutProfile = await prisma.user.findMany({
      where: {
        role: 'PROVIDER',
        providerProfile: null
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        city: true,
        legalStatusId: true,
        taxId: true,
        companyName: true
      }
    });

    console.log(`📊 Pronađeno ${providersWithoutProfile.length} PROVIDER korisnika bez profila`);

    if (providersWithoutProfile.length === 0) {
      console.log('✅ Svi PROVIDER korisnici već imaju profile!');
      return;
    }

    // Kreiraj ProviderProfile za svakog korisnika
    for (const user of providersWithoutProfile) {
      try {
        console.log(`🔄 Kreiram ProviderProfile za: ${user.email} (${user.fullName})`);
        
        await prisma.providerProfile.create({
          data: {
            userId: user.id,
            bio: '',
            specialties: [],
            experience: 0,
            website: '',
            serviceArea: user.city || '',
            legalStatusId: user.legalStatusId,
            taxId: user.taxId,
            companyName: user.companyName,
            isAvailable: true,
            portfolio: null
          }
        });

        console.log(`✅ ProviderProfile kreiran za: ${user.email}`);
      } catch (error) {
        console.error(`❌ Greška pri kreiranju profila za ${user.email}:`, error.message);
      }
    }

    console.log('🎉 Završeno kreiranje ProviderProfile-a za postojeće korisnike!');

  } catch (error) {
    console.error('❌ Greška u skripti:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Pokreni skriptu
fixAllProviderProfiles();
