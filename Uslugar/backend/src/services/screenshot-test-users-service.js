/**
 * Servis za kreiranje/održavanje testnih korisnika za snimanje screenshotova vodiča.
 * Korisnici imaju uvjerljiva hrvatska imena i fiksnu lozinku (iz env).
 */

import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/auth.js';

const PASSWORD = process.env.SCREENSHOT_TEST_PASSWORD || 'ScreenshotTest123!';
const DOMAIN = process.env.SCREENSHOT_TEST_DOMAIN || 'uslugar.hr';

/** Definicija 4 testna korisnika: email suffix, fullName, role, za pružatelje: isDirector, companyId */
const DEFINITIONS = [
  { suffix: 'korisnik', fullName: 'Milan Babić', role: 'USER' },
  { suffix: 'pružatelj', fullName: 'Marko Kovač', role: 'PROVIDER' },
  { suffix: 'direktor', fullName: 'Ivan Babić', role: 'PROVIDER', isDirector: true },
  { suffix: 'tim', fullName: 'Petra Novak', role: 'PROVIDER', isTeamMember: true },
];

function email(suffix) {
  const localBySuffix = {
    korisnik: 'milan.babic',
    'pružatelj': 'marko.kovac',
    direktor: 'ivan.babic',
    tim: 'petra.novak',
  };
  const localPart = localBySuffix[suffix] || `screenshot-${suffix}`;
  return `${localPart}@${DOMAIN}`;
}

/**
 * Osiguraj da svi 4 testna korisnika postoje; kreiraj ako nedostaju.
 * Vraća { users: [{ role, email, fullName }], password }.
 */
export async function ensureScreenshotTestUsers() {
  const legalStatus = await prisma.legalStatus.findFirst({
    where: { isActive: true, code: { not: 'INDIVIDUAL' } },
  });
  const legalStatusId = legalStatus?.id ?? null;

  const results = [];
  let directorProfileId = null;

  for (const def of DEFINITIONS) {
    const em = email(def.suffix);
    const existing = await prisma.user.findUnique({
      where: { email_role: { email: em, role: def.role } },
      include: { providerProfile: true },
    });

    if (existing) {
      // Održi konzistentna demo imena kroz sve snimke.
      if (existing.fullName !== def.fullName) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { fullName: def.fullName },
        });
      }
      if (def.isDirector && existing.providerProfile) {
        directorProfileId = existing.providerProfile.id;
      }
      results.push({
        role: def.suffix,
        email: em,
        fullName: def.fullName,
      });
      continue;
    }

    const passwordHash = await hashPassword(PASSWORD);

    if (def.role === 'USER') {
      const user = await prisma.user.create({
        data: {
          email: em,
          passwordHash,
          fullName: def.fullName,
          role: 'USER',
          isVerified: true,
          phone: '+385991234567',
          city: 'Zagreb',
        },
      });
      results.push({ role: def.suffix, email: user.email, fullName: user.fullName });
      continue;
    }

    // PROVIDER
    const user = await prisma.user.create({
      data: {
        email: em,
        passwordHash,
        fullName: def.fullName,
        role: 'PROVIDER',
        isVerified: true,
        phone: '+385992345678',
        city: 'Zagreb',
        legalStatusId,
        taxId: '12345678903',
        companyName: def.isDirector ? 'Građevina Babić d.o.o.' : def.isTeamMember ? null : 'Obrt Kovač',
      },
    });

    const profileData = {
      userId: user.id,
      bio: def.isDirector ? 'Direktor tvrtke za građevinske usluge.' : def.isTeamMember ? 'Član tima.' : 'Samostalni pružatelj usluga.',
      isDirector: def.isDirector || false,
      companyId: def.isTeamMember ? directorProfileId : null,
      legalStatusId,
      companyName: def.isDirector ? 'Građevina Babić d.o.o.' : null,
      taxId: '12345678903',
    };

    const profile = await prisma.providerProfile.create({
      data: profileData,
    });

    if (def.isDirector) {
      directorProfileId = profile.id;
    }

    results.push({ role: def.suffix, email: user.email, fullName: user.fullName });
  }

  // Ako je tim_clan kreiran prije direktora, ažuriraj companyId
  if (directorProfileId) {
    const timEmail = email('tim');
    const timUser = await prisma.user.findUnique({
      where: { email_role: { email: timEmail, role: 'PROVIDER' } },
      include: { providerProfile: true },
    });
    if (timUser?.providerProfile && !timUser.providerProfile.companyId) {
      await prisma.providerProfile.update({
        where: { id: timUser.providerProfile.id },
        data: { companyId: directorProfileId },
      });
    }
  }

  return { users: results, password: PASSWORD };
}
