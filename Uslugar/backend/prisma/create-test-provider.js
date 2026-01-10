// Script za kreiranje test PROVIDER korisnika za testiranje S3 faktura
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Učitaj .env ako postoji
dotenv.config();

const prisma = new PrismaClient();

async function createTestProvider() {
  try {
    const email = 'test.provider@uslugar.hr';
    const password = 'Test123!';
    
    // Provjeri da li test provider već postoji
    const existing = await prisma.user.findFirst({ 
      where: { 
        email,
        role: 'PROVIDER'
      } 
    });
    
    if (existing) {
      console.log('⚠️  Test PROVIDER korisnik već postoji!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   ID: ${existing.id}`);
      console.log('\n💡 Možeš koristiti ovog korisnika za testiranje!');
      return existing;
    }

    // Hash lozinke
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Pronađi legal status (SOLE_TRADER ili prvi dostupan)
    const legalStatus = await prisma.legalStatus.findFirst({ 
      where: { 
        code: { in: ['SOLE_TRADER', 'FREELANCER', 'PAUSAL'] },
        isActive: true
      } 
    });

    if (!legalStatus) {
      console.error('❌ Nema dostupnih legal statusa! Pokreni seed za legal statuses prvo.');
      return;
    }

    // Kreiraj test PROVIDER korisnika
    const provider = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: 'Test Provider',
        role: 'PROVIDER',
        phone: '+385991234567',
        city: 'Zagreb',
        isVerified: true,
        legalStatusId: legalStatus.id,
        taxId: '12345678901',
        companyName: 'Test Obrt'
      }
    });

    // Kreiraj ProviderProfile
    const category = await prisma.category.findFirst();
    await prisma.providerProfile.create({
      data: {
        userId: provider.id,
        bio: 'Test provider za S3 fakture',
        serviceArea: 'Zagreb',
        ...(category && {
          categories: {
            connect: [{ id: category.id }]
          }
        })
      }
    });

    // Kreiraj TRIAL subscription (14 dana, 8 kredita)
    const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await prisma.subscription.create({
      data: {
        userId: provider.id,
        plan: 'TRIAL',
        status: 'ACTIVE',
        creditsBalance: 8,
        expiresAt: trialExpiresAt
      }
    });

    console.log('✅ Test PROVIDER korisnik kreiran uspješno!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID: ${provider.id}`);
    console.log(`   Plan: TRIAL (8 kredita, 14 dana)`);
    console.log('\n💡 Možeš koristiti ovog korisnika za testiranje S3 faktura!');
    
    return provider;
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
    if (error.code === 'P2002') {
      console.error('   Email već postoji s drugom rolom. Pokušaj drugi email.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestProvider();

