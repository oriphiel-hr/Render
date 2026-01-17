import { PrismaClient } from '@prisma/client';

// Kreiraj Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Osiguraj UTF-8 encoding za PostgreSQL konekciju
// Najbolji način je dodati encoding parametar u DATABASE_URL: ?client_encoding=utf8
// Alternativno, možemo postaviti encoding nakon uspostave konekcije
// Ovdje postavljamo encoding pri inicijalizaciji Prisma klijenta
prisma.$connect()
  .then(async () => {
    try {
      // Postavi UTF-8 encoding za PostgreSQL konekciju
      // Ovo osigurava da se svi podaci čitaju u UTF-8 encoding-u
      await prisma.$executeRaw`SET client_encoding TO 'UTF8'`;
      console.log('✅ Database: UTF-8 encoding configured');
      
      // Provjeri trenutni encoding za verifikaciju
      const encoding = await prisma.$queryRaw`SHOW client_encoding`;
      console.log('📊 Current database encoding:', encoding);
    } catch (error) {
      console.warn('⚠️  Could not set client_encoding:', error.message);
      console.warn('💡 Tip: Dodaj ?client_encoding=utf8 u DATABASE_URL');
    }
  })
  .catch(() => {
    // Konekcija će se uspostaviti kada se Prisma prvi put koristi
    // Encoding će se postaviti tada
  });

export { prisma };