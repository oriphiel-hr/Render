// Script za kreiranje admin korisnika
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@uslugar.hr';
    const password = 'Admin123!'; // PROMIJENI OVO!
    
    // Provjeri da li admin već postoji
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('❌ Admin korisnik već postoji!');
      console.log(`   Email: ${email}`);
      return;
    }

    // Hash lozinke
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Kreiraj admin korisnika
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: 'Administrator',
        role: 'ADMIN',
        isVerified: true,
      }
    });

    console.log('✅ Admin korisnik kreiran uspješno!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID: ${admin.id}`);
    console.log('\n⚠️  VAŽNO: Promijeni lozinku nakon prvog logina!');
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

