// Fix missing ProviderProfile for existing PROVIDER users
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/uslugar_db?schema=public'
    }
  }
});

async function fixMissingProviderProfiles() {
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
        await prisma.providerProfile.create({
          data: {
            userId: user.id,
            bio: '',
            serviceArea: user.city || '',
            legalStatusId: user.legalStatusId,
            taxId: user.taxId,
            companyName: user.companyName,
            specialties: [],
            experience: 0,
            website: '',
            isAvailable: true,
            portfolio: null
          }
        });
        console.log(`✅ Kreiran profil za: ${user.email}`);
      } catch (error) {
        console.error(`❌ Greška pri kreiranju profila za ${user.email}:`, error.message);
      }
    }

    console.log('🎉 Završeno kreiranje ProviderProfile-a!');
  } catch (error) {
    console.error('❌ Greška u fixMissingProviderProfiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Pokreni skriptu
fixMissingProviderProfiles();
