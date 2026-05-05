const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_SYSTEM = `Ti si asistent povezan s platformom Uslugar i s katalogom alata partnera.
Teme: (1) Uslugar — leadovi, poslovi, računi, korisnički račun; (2) Alati / katalog — informacije o alatima partnera.
Ako pitanje izlazi iz domene, budi kratak, ne izmišljaj činjenice, ponudi kontakt s čovjekom ili poveznicu na službenu dokumentaciju.
Odgovaraj hrvatski, jasno i stručno.`;

async function main() {
  await prisma.promptTemplate.deleteMany({ where: { slug: 'system.default' } });

  await prisma.promptTemplate.create({
    data: {
      slug: 'system.default',
      name: 'Zadani sistemski prompt',
      body: DEFAULT_SYSTEM,
      version: 1,
      isActive: true,
      channel: null,
      description: 'Globalni prompt za sve kanale; uredi u bazi ili seedu.'
    }
  });

  await prisma.promptTemplate.create({
    data: {
      slug: 'system.default',
      name: 'Messenger — naglasak na chat',
      body: `${DEFAULT_SYSTEM}\n\nKontekst: korisnik piše putem Messengera. Budi koncizan; ako treba identitet ili plaćanje, usmjeri na siguran kanal unutar Uslugar aplikacije.`,
      version: 2,
      isActive: true,
      channel: 'MESSENGER',
      description: 'Varijanta za Messenger; viša verzija za isti slug + kanal u logici odabira.'
    }
  });

  console.log('Seed: promptovi umetnuti.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
