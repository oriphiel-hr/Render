/**
 * Demo podaci za screenshot test korisnike:
 * - Subscription s kreditima za pružatelje (Tržnica ne prikazuje "forbidden", ima kredite)
 * - Kategorije na provider profilima (getAvailableLeads vraća leadove)
 * - Poslovi (Jobs) od Ana → dostupni u Tržnici
 * - Kupljeni leadovi za Marko → Moji ekskluzivni leadovi + ROI s brojevima
 * - Chat soba i poruke → Chat nije prazan
 */
import { prisma } from '../lib/prisma.js';
import { getLeadPriceForJob } from '../config/lead-price.js';
import { purchaseLead, markLeadContacted, markLeadConverted } from './lead-service.js';
import { deductCredits } from './credit-service.js';

const DOMAIN = process.env.SCREENSHOT_TEST_DOMAIN || 'uslugar.hr';

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
      const priceInfo = getLeadPriceForJob(job);
      const leadPrice = priceInfo.leadPriceCredits;
      await deductCredits(marko.id, leadPrice, `Lead: ${job.title}`, job.id);
    } catch (e) {
      console.warn('[SCREENSHOT-DEMO] deductCredits failed:', e.message);
      continue;
    }
    const priceInfo = getLeadPriceForJob(job);
    const leadPrice = priceInfo.leadPriceCredits;
    const purchase = await prisma.leadPurchase.create({
      data: {
        jobId: job.id,
        providerId: marko.id,
        creditsSpent: leadPrice,
        leadPrice,
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
  const director = await prisma.user.findUnique({
    where: { email_role: { email: email('direktor'), role: 'PROVIDER' } },
    include: { providerProfile: true },
  });
  const tim = await prisma.user.findUnique({
    where: { email_role: { email: email('tim'), role: 'PROVIDER' } },
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
  /** Budžeti usklađeni s opisom posla (mali / segmentirani zahvati, realna tržišna razina u EUR) */
  const marketplaceDemoJobSpecs = [
    {
      title: 'Mala kupaonica (6 m²) – nova keramika',
      description:
        'Skidanje starih pločica, priprema podloge i lijepljenje nove keramike (keramiku kupuje klijent). Zagreb.',
      city: 'Zagreb',
      budgetMin: 480,
      budgetMax: 820,
      qualityScore: 82,
    },
    {
      title: 'Fasada – lokalni popravak i hidroizolacija spoja (do ~35 m²)',
      description:
        'Nije cijela fasada: otvoren spoj, fugiranje i sanacija curenja na jednom dijelu kuće. Velika Gorica.',
      city: 'Velika Gorica',
      budgetMin: 520,
      budgetMax: 880,
      qualityScore: 76,
    },
    {
      title: 'Električar – razvodnica i LED (dnevni boravak + hodnik)',
      description:
        'Zamjena postojećeg osiguračkog nosača, LED rasvjeta, 3–4 nove grupe. Zagreb.',
      city: 'Zagreb',
      budgetMin: 360,
      budgetMax: 640,
      qualityScore: 68,
    },
  ];
  const jobSpecsToCreate = marketplaceDemoJobSpecs.filter(
    (spec) => !existingJobs.some((j) => j.title === spec.title)
  );
  const createdJobs = [];
  for (const spec of jobSpecsToCreate) {
    const priceInfo = getLeadPriceForJob({
      budgetMin: spec.budgetMin,
      budgetMax: spec.budgetMax,
    });
    const job = await prisma.job.create({
      data: {
        userId: ana.id,
        title: spec.title,
        description: spec.description,
        city: spec.city,
        budgetMin: spec.budgetMin,
        budgetMax: spec.budgetMax,
        status: 'OPEN',
        isExclusive: true,
        leadStatus: 'AVAILABLE',
        leadPrice: priceInfo.leadPriceCredits,
        categoryId: category.id,
        qualityScore: spec.qualityScore,
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
      const convJob = await prisma.job.findUnique({ where: { id: purchases[1].jobId } });
      const realized =
        convJob?.budgetMin != null && convJob?.budgetMax != null
          ? Math.round((Number(convJob.budgetMin) + Number(convJob.budgetMax)) / 2)
          : 780;
      await markLeadConverted(purchases[1].id, marko.id, realized);
    } catch (_) {}
  }

  const { syncProviderROIFromPurchases } = await import('./roi-sync.js');
  await syncProviderROIFromPurchases(marko.id);

  // 5b) Demo lead + chat za tim_clan (da vodič za tim ima stvarne podatke)
  //    - 1 kupljen lead (Moji ekskluzivni leadovi)
  //    - 1 interni CompanyLeadQueue red (Leadovi dodijeljeni meni)
  //    - 1 chat soba s porukom (Tab #chat)
  if (director?.providerProfile && tim?.providerProfile) {
    const directorProfileId = director.providerProfile.id;
    const timProfileId = tim.providerProfile.id;

    const timJobTitle = 'Krov – curenje uz dimnjak, zamjena oluka (jedan segment)';
    const timJobSpec = { budgetMin: 330, budgetMax: 580 };
    const timPrice = getLeadPriceForJob(timJobSpec);

    let timJob = await prisma.job.findFirst({
      where: {
        userId: ana.id,
        isExclusive: true,
        OR: [{ title: timJobTitle }, { title: 'Demo: tim lead queue & chat' }],
      },
    });
    if (timJob) {
      timJob = await prisma.job.update({
        where: { id: timJob.id },
        data: {
          title: timJobTitle,
          description:
            'Manji krovni zahvat: vlažnost uz dimnjak, zamjena ~6 m oluka; nije cijela krovišna površina. Demo za tim + chat.',
          budgetMin: timJobSpec.budgetMin,
          budgetMax: timJobSpec.budgetMax,
          leadPrice: timPrice.leadPriceCredits,
        },
      });
    } else {
      timJob = await prisma.job.create({
        data: {
          userId: ana.id,
          title: timJobTitle,
          description:
            'Manji krovni zahvat: vlažnost uz dimnjak, zamjena ~6 m oluka; nije cijela krovišna površina. Demo za tim + chat.',
          city: 'Zagreb',
          budgetMin: timJobSpec.budgetMin,
          budgetMax: timJobSpec.budgetMax,
          status: 'OPEN',
          isExclusive: true,
          leadStatus: 'AVAILABLE',
          leadPrice: timPrice.leadPriceCredits,
          categoryId: category.id,
          qualityScore: 70,
          moderationStatus: 'APPROVED',
        },
      });
    }

    // Interni queue red (direktor -> tim)
    await prisma.companyLeadQueue.upsert({
      where: { jobId_directorId: { jobId: timJob.id, directorId: directorProfileId } },
      update: {
        assignedToId: timProfileId,
        assignmentType: 'MANUAL',
        status: 'ASSIGNED',
        assignedAt: new Date(Date.now() - 1000 * 60 * 20),
        position: 1,
        notes: 'Demo: dodijeljeno članu tima (screenshot vodič).',
      },
      create: {
        jobId: timJob.id,
        directorId: directorProfileId,
        assignedToId: timProfileId,
        position: 1,
        status: 'ASSIGNED',
        assignmentType: 'MANUAL',
        assignedAt: new Date(Date.now() - 1000 * 60 * 20),
        notes: 'Demo: dodijeljeno članu tima (screenshot vodič).',
      },
    });

    // Kupljen lead za tim (da se "Moji ekskluzivni leadovi" popune + chat se kreira automatski)
    const existingTimPurchase = await prisma.leadPurchase.findFirst({
      where: {
        jobId: timJob.id,
        providerId: tim.id,
        status: { not: 'REFUNDED' },
      },
    });

    if (!existingTimPurchase) {
      // purchaseLead zahtjeva AVAILABLE i da nije već dodijeljeno
      await prisma.job.update({
        where: { id: timJob.id },
        data: { leadStatus: 'AVAILABLE', assignedProviderId: null },
      }).catch(() => {});

      try {
        await purchaseLead(timJob.id, tim.id, {});
      } catch (e) {
        console.warn('[SCREENSHOT-DEMO] Tim purchaseLead failed, fallback creating LeadPurchase:', e.message);
        // Fallback: leadPurchase + chat room (isti princip kao kod Marko fallbacka)
        const priceInfo = getLeadPriceForJob(timJob);
        const leadPrice = priceInfo.leadPriceCredits;
        let canCreateTimPurchase = true;
        try {
          await deductCredits(tim.id, leadPrice, `Lead: ${timJob.title}`, timJob.id);
        } catch (deductErr) {
          console.warn('[SCREENSHOT-DEMO] deductCredits failed for tim:', deductErr.message);
          // Bez creditsa nema purchase; preskoči samo tim purchase (nastavi seed dalje).
          canCreateTimPurchase = false;
        }

        if (canCreateTimPurchase) {
          const purchase = await prisma.leadPurchase.create({
            data: {
              jobId: timJob.id,
              providerId: tim.id,
              creditsSpent: leadPrice,
              leadPrice,
              status: 'ACTIVE',
              contactUnlocked: false,
            },
          });

          await prisma.job.update({
            where: { id: timJob.id },
            data: { assignedProviderId: tim.id, leadStatus: 'ASSIGNED' },
          });

          // Kreiraj PUBLIC chat room (da #chat nije prazan)
          try {
            const { createPublicChatRoom } = await import('./public-chat-service.js');
            await createPublicChatRoom(timJob.id, tim.id);
          } catch (chatErr) {
            console.warn('[SCREENSHOT-DEMO] createPublicChatRoom failed for tim:', chatErr.message);
          }

          // purchase varijabla postoji samo radi debuggiranja, ali ne koristimo je dalje
          void purchase;
        }
      }
    }
  }

  // 6) Chat soba i poruke (fallback za korisnik/pružatelj vodič)
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
