/**
 * Demo podaci za screenshot test korisnike:
 * - Subscription s kreditima za pružatelje (Tržnica ne prikazuje "forbidden", ima kredite)
 * - Kategorije na provider profilima (getAvailableLeads vraća leadove)
 * - Poslovi (Jobs) od Ana → dostupni u Tržnici
 * - Kupljeni leadovi za Marko → Moji ekskluzivni leadovi + ROI s brojevima
 * - Chat soba i poruke → Chat nije prazan
 */
import { prisma } from '../lib/prisma.js';
import { purchaseLead, markLeadContacted, markLeadConverted } from './lead-service.js';
import { deductCredits } from './credit-service.js';

const DOMAIN = process.env.SCREENSHOT_TEST_DOMAIN || 'uslugar.hr';

function email(suffix) {
  return `screenshot-${suffix}@${DOMAIN}`;
}

/** Ako purchaseLead ne uspije, kreiraj LeadPurchase ručno da Moji leadovi i ROI imaju podatke. */
async function ensureMarkoHasLeadPurchases(marko, allAvailableJobs) {
  const toUse = allAvailableJobs.slice(0, 2);
  if (toUse.length === 0) return [];
  const purchases = [];
  for (const job of toUse) {
    const existing = await prisma.leadPurchase.findFirst({
      where: { jobId: job.id, providerId: marko.id, status: { not: 'REFUNDED' } },
    });
    if (existing) {
      purchases.push(existing);
      continue;
    }
    try {
      await deductCredits(marko.id, job.leadPrice || 10, `Lead: ${job.title}`, job.id);
    } catch (e) {
      console.warn('[SCREENSHOT-DEMO] deductCredits failed:', e.message);
      continue;
    }
    const purchase = await prisma.leadPurchase.create({
      data: {
        jobId: job.id,
        providerId: marko.id,
        creditsSpent: job.leadPrice || 10,
        leadPrice: job.leadPrice || 10,
        status: 'ACTIVE',
        contactUnlocked: false,
      },
    });
    await prisma.job.update({
      where: { id: job.id },
      data: { assignedProviderId: marko.id, leadStatus: 'ASSIGNED' },
    });
    purchases.push(purchase);
  }
  return purchases;
}

/**
 * Osiguraj demo podatke za screenshot korisnike. Pozovi nakon ensureScreenshotTestUsers().
 */
export async function ensureScreenshotDemoData() {
  const ana = await prisma.user.findUnique({
    where: { email_role: { email: email('korisnik'), role: 'USER' } },
  });
  const marko = await prisma.user.findUnique({
    where: { email_role: { email: email('pružatelj'), role: 'PROVIDER' } },
    include: { providerProfile: true },
  });
  if (!ana || !marko?.providerProfile) {
    console.warn('[SCREENSHOT-DEMO] Screenshot korisnici ne postoje. Prvo pokreni Generiraj testne korisnike.');
    return { ok: false, reason: 'missing_users' };
  }

  const category = await prisma.category.findFirst({ where: { parentId: null } });
  if (!category) {
    console.warn('[SCREENSHOT-DEMO] Nema kategorija u bazi.');
    return { ok: false, reason: 'missing_category' };
  }

  const profileId = marko.providerProfile.id;

  // 1) Kategorija na provider profilu (da getAvailableLeads ne vrati prazno)
  const hasCategory = await prisma.providerProfile.findFirst({
    where: { id: profileId, categories: { some: { id: category.id } } },
  });
  if (!hasCategory) {
    await prisma.providerProfile.update({
      where: { id: profileId },
      data: { categories: { connect: [{ id: category.id }] } },
    });
  }

  // 2) Odobrenje providera
  await prisma.providerProfile.update({
    where: { id: profileId },
    data: { approvalStatus: 'APPROVED' },
  });

  // 3) Subscription s kreditima za sve pružatelje
  for (const suffix of ['pružatelj', 'direktor', 'tim']) {
    const u = await prisma.user.findUnique({
      where: { email_role: { email: email(suffix), role: 'PROVIDER' } },
    });
    if (!u) continue;
    let sub = await prisma.subscription.findUnique({ where: { userId: u.id } });
    if (!sub) {
      await prisma.subscription.create({
        data: {
          userId: u.id,
          plan: 'BASIC',
          status: 'ACTIVE',
          creditsBalance: 50,
          lifetimeCreditsUsed: 0,
          lifetimeLeadsConverted: 0,
        },
      });
    } else if (sub.creditsBalance < 20) {
      await prisma.subscription.update({
        where: { userId: u.id },
        data: { creditsBalance: 50 },
      });
    }
  }

  // 4) Poslovi od Ana (ekskluzivni, AVAILABLE)
  const existingJobs = await prisma.job.findMany({
    where: { userId: ana.id, isExclusive: true, leadStatus: 'AVAILABLE' },
    take: 5,
  });
  const jobTitles = [
    'Renovacija kupaonice – keramičar',
    'Građevinska nadogradnja – nadzor',
    'Fasada i izolacija kuće',
  ];
  const jobsToCreate = jobTitles.filter(
    (t) => !existingJobs.some((j) => j.title === t)
  );
  const createdJobs = [];
  for (const title of jobsToCreate) {
    const job = await prisma.job.create({
      data: {
        userId: ana.id,
        title,
        description: 'Potreban pouzdan izvođač za navedeni opseg radova. Lokacija Zagreb.',
        city: 'Zagreb',
        budgetMin: 2000,
        budgetMax: 5000,
        status: 'OPEN',
        isExclusive: true,
        leadStatus: 'AVAILABLE',
        leadPrice: 10,
        categoryId: category.id,
        qualityScore: 75,
      },
    });
    createdJobs.push(job);
  }
  const allAvailableJobs = [...existingJobs, ...createdJobs].filter(
    (j) => j.leadStatus === 'AVAILABLE' && !j.assignedProviderId
  );

  // Osiguraj pretplatu za Marka (potrebno za purchaseLead ili fallback deductCredits)
  let markoSub = await prisma.subscription.findUnique({ where: { userId: marko.id } });
  if (!markoSub) {
    await prisma.subscription.create({
      data: {
        userId: marko.id,
        plan: 'BASIC',
        status: 'ACTIVE',
        creditsBalance: 50,
        lifetimeCreditsUsed: 0,
        lifetimeLeadsConverted: 0,
      },
    });
  } else if (markoSub.creditsBalance < 20) {
    await prisma.subscription.update({
      where: { userId: marko.id },
      data: { creditsBalance: 50 },
    });
  }

  // 5) Marko kupuje 2 leada (purchaseLead koristi kredite)
  const toPurchase = allAvailableJobs.slice(0, 2);
  let purchases = [];
  for (const job of toPurchase) {
    try {
      const result = await purchaseLead(job.id, marko.id, {});
      purchases.push(result.purchase);
    } catch (e) {
      console.warn('[SCREENSHOT-DEMO] purchaseLead failed:', job.id, e.message);
    }
  }
  // Fallback: ako nijedna kupnja nije uspjela, kreiraj LeadPurchase ručno (Moji leadovi + ROI)
  if (purchases.length === 0) {
    purchases = await ensureMarkoHasLeadPurchases(marko, allAvailableJobs);
    if (purchases.length > 0) {
      console.log('[SCREENSHOT-DEMO] Kreirani leadovi ručno (fallback):', purchases.length);
    }
  }

  if (purchases.length >= 1) {
    try {
      await markLeadContacted(purchases[0].id, marko.id);
    } catch (_) {}
  }
  if (purchases.length >= 2) {
    try {
      await markLeadConverted(purchases[1].id, marko.id, 3500);
    } catch (_) {}
  }

  const { syncProviderROIFromPurchases } = await import('./roi-sync.js');
  await syncProviderROIFromPurchases(marko.id);

  // 6) Chat soba i poruke
  const jobForChat = await prisma.job.findFirst({
    where: { userId: ana.id },
    orderBy: { createdAt: 'desc' },
  });
  if (jobForChat) {
    let room = await prisma.chatRoom.findFirst({
      where: { jobId: jobForChat.id },
    });
    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          jobId: jobForChat.id,
          participants: { connect: [{ id: ana.id }, { id: marko.id }] },
        },
      });
    }
    const msgCount = await prisma.chatMessage.count({ where: { roomId: room.id } });
    if (msgCount === 0) {
      await prisma.chatMessage.createMany({
        data: [
          { roomId: room.id, senderId: ana.id, content: 'Dobar dan, javljam se povodom vašeg oglasa za renovaciju.' },
          { roomId: room.id, senderId: marko.id, content: 'Dobar dan! Hvala na poruci. Mogu doći na uvidaj ovaj tjedan.' },
          { roomId: room.id, senderId: ana.id, content: 'Odlično, u srijedu u 14 h vama odgovara?' },
        ],
      });
    }
  }

  return {
    ok: true,
    jobsCreated: createdJobs.length,
    leadsPurchased: purchases.length,
    categoryId: category.id,
  };
}
