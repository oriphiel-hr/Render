/**
 * Seed uvjerljivih demo/test podataka direktno u bazu.
 *
 * Pokretanje (iz backend):
 *   node scripts/seed-demo-test-data.js
 *
 * Ova skripta:
 * - osigura screenshot test korisnike + demo podatke (Tržnica/ROI/Chat)
 * - po potrebi seeda test planove iz markdowna
 * - kreira jedan TestRun i za svaki TestItem dodaje TestRunItem + screenshot URL (ako postoji)
 * - dodaje nekoliko uvjerljivih logova i kontakt upita
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ensureScreenshotTestUsers } from '../src/services/screenshot-test-users-service.js';
import { ensureScreenshotDemoData } from '../src/services/screenshot-demo-data-service.js';
import { hashPassword } from '../src/lib/auth.js';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

const DOMAIN = process.env.SCREENSHOT_TEST_DOMAIN || 'uslugar.hr';
const PASSWORD = process.env.SCREENSHOT_TEST_PASSWORD || 'ScreenshotTest123!';

function demoEmail(localPart) {
  return `${localPart}@${DOMAIN}`;
}

async function upsertUser({ email, role, fullName, city = 'Zagreb', phone, legalStatusId, taxId, companyName }) {
  const passwordHash = await hashPassword(PASSWORD);
  return prisma.user.upsert({
    where: { email_role: { email, role } },
    update: {
      fullName,
      city,
      phone: phone ?? null,
      legalStatusId: legalStatusId ?? null,
      taxId: taxId ?? null,
      companyName: companyName ?? null,
      isVerified: true,
    },
    create: {
      email,
      role,
      passwordHash,
      fullName,
      city,
      phone: phone ?? null,
      legalStatusId: legalStatusId ?? null,
      taxId: taxId ?? null,
      companyName: companyName ?? null,
      isVerified: true,
    },
  });
}

async function ensureProviderProfile({ userId, bio, approvalStatus, isDirector, companyId, kyc, badge, insuranceUrl, categories }) {
  const existing = await prisma.providerProfile.findUnique({ where: { userId } });
  if (existing) {
    return prisma.providerProfile.update({
      where: { userId },
      data: {
        bio: bio ?? existing.bio,
        approvalStatus: approvalStatus ?? existing.approvalStatus,
        isDirector: isDirector ?? existing.isDirector,
        companyId: companyId ?? existing.companyId,
        kycVerified: kyc?.kycVerified ?? existing.kycVerified,
        kycDocumentUrl: kyc?.kycDocumentUrl ?? existing.kycDocumentUrl,
        kycDocumentType: kyc?.kycDocumentType ?? existing.kycDocumentType,
        identityEmailVerified: kyc?.identityEmailVerified ?? existing.identityEmailVerified,
        identityEmailAddress: kyc?.identityEmailAddress ?? existing.identityEmailAddress,
        identityPhoneVerified: kyc?.identityPhoneVerified ?? existing.identityPhoneVerified,
        identityDnsVerified: kyc?.identityDnsVerified ?? existing.identityDnsVerified,
        safetyInsuranceUrl: insuranceUrl ?? existing.safetyInsuranceUrl,
        badgeData: badge ?? existing.badgeData,
        categories: categories ? { set: categories.map((c) => ({ id: c.id })) } : undefined,
      },
    });
  }
  return prisma.providerProfile.create({
    data: {
      userId,
      bio: bio ?? null,
      approvalStatus: approvalStatus ?? 'WAITING_FOR_APPROVAL',
      isDirector: !!isDirector,
      companyId: companyId ?? null,
      kycVerified: !!kyc?.kycVerified,
      kycDocumentUrl: kyc?.kycDocumentUrl ?? null,
      kycDocumentType: kyc?.kycDocumentType ?? null,
      identityEmailVerified: !!kyc?.identityEmailVerified,
      identityEmailAddress: kyc?.identityEmailAddress ?? null,
      identityPhoneVerified: !!kyc?.identityPhoneVerified,
      identityDnsVerified: !!kyc?.identityDnsVerified,
      safetyInsuranceUrl: insuranceUrl ?? null,
      badgeData: badge ?? null,
      categories: categories ? { connect: categories.map((c) => ({ id: c.id })) } : undefined,
    },
  });
}

async function ensureSubscription({ userId, plan = 'BASIC', status = 'ACTIVE', creditsBalance = 50, isLaunchTrial = false }) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) {
    return prisma.subscription.update({
      where: { userId },
      data: { plan, status, creditsBalance, isLaunchTrial },
    });
  }
  return prisma.subscription.create({
    data: { userId, plan, status, creditsBalance, isLaunchTrial, lifetimeCreditsUsed: 0, lifetimeLeadsConverted: 0 },
  });
}

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: `${year}-` }, amount: { gte: 0 } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  });
  let seq = 1;
  if (last?.invoiceNumber) {
    const parts = last.invoiceNumber.split('-');
    const n = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }
  return `${year}-${String(seq).padStart(4, '0')}`;
}

function pickScreenshotUrlsFromDocsDir() {
  const docsDir = path.join(process.cwd(), 'public', 'docs');
  if (!fs.existsSync(docsDir)) return [];
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => /\.(png|jpg|jpeg|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, 'hr', { numeric: true, sensitivity: 'base' }))
    .map((fileName) => `/docs/${fileName}`);
}

async function seedTestPlansIfMissing() {
  const count = await prisma.testPlan.count();
  if (count > 0) return { ok: true, seeded: false, count };

  // Seed test planove iz postojeće skripte (dinamički import radi u ESM-u)
  const scriptPath = path.join(process.cwd(), 'prisma', 'seeds', 'seed-test-plans.js');
  if (!fs.existsSync(scriptPath)) return { ok: false, reason: 'missing_seed_test_plans_script', scriptPath };

  // Import će izvršiti skriptu (ona radi process.exit) – zato ovdje ne importamo direktno.
  // Umjesto toga: kreiraj minimalni set planova ako nema skripte.
  // Pošto skripta postoji u repou, očekujemo da se koristi ručno ako treba.
  return { ok: true, seeded: false, count };
}

async function ensureMinimalTestPlans() {
  const existing = await prisma.testPlan.count();
  if (existing > 0) return { ok: true, created: 0 };

  const plan = await prisma.testPlan.create({
    data: {
      name: 'Demo - Osnovni tok',
      description: 'Minimalni demo test plan (kreiran seed skriptom).',
      category: 'Demo',
      items: {
        create: [
          {
            title: 'Registracija korisnika + objava posla',
            description: 'Registrirati se kao korisnik i objaviti novi posao.',
            expectedResult: 'Posao je kreiran i vidljiv u Mojim poslovima.',
            order: 0,
            dataVariations: { examples: ['Zagreb, budžet 2000-5000, hitnost NORMAL'] },
          },
          {
            title: 'Provider kupuje lead + ROI',
            description: 'Prijaviti se kao provider, kupiti lead i provjeriti ROI statistiku.',
            expectedResult: 'Lead se pojavi u Mojim leadovima i ROI se ažurira.',
            order: 1,
            dataVariations: { examples: ['BASIC plan, 50 kredita, 2 kupljena leada'] },
          },
          {
            title: 'Chat između korisnika i providera',
            description: 'Otvoriti chat sobu na job-u i razmijeniti poruke.',
            expectedResult: 'Poruke su vidljive i audit log se zapisuje.',
            order: 2,
          },
        ],
      },
    },
    include: { items: true },
  });

  return { ok: true, created: plan.items.length };
}

async function seedContactAndLogs() {
  // Kontakt upiti
  await prisma.contactInquiry.createMany({
    data: [
      {
        name: 'Marina Jurić',
        email: 'marina.juric@example.com',
        phone: '+385981112223',
        subject: 'business',
        message: 'Pozdrav, zanima me oglašavanje za IT usluge na vašoj platformi. Možemo li dogovoriti poziv?',
      },
      {
        name: 'Tomislav Barišić',
        email: 'tomislav.barisic@example.com',
        phone: '+385991234001',
        subject: 'technical',
        message: 'Ne mogu dovršiti upload dokumenata za verifikaciju (PDF). Dobivam grešku nakon spremanja.',
      },
    ],
    skipDuplicates: true,
  });

  // Minimalni error + api log (poveži na nekog user-a ako postoji)
  const anyUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
  await prisma.apiRequestLog.create({
    data: {
      method: 'GET',
      path: '/api/jobs?city=Zagreb',
      statusCode: 200,
      userId: anyUser?.id ?? null,
      ipAddress: '93.136.12.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      requestBody: null,
      responseBody: { ok: true, count: 12 },
      responseTime: 184,
      errorMessage: null,
    },
  });
  await prisma.errorLog.create({
    data: {
      level: 'WARN',
      message: 'Simulirana greška: fallback na demo leadove (screenshotMode=docs).',
      stack: null,
      endpoint: '/api/leads/available',
      method: 'GET',
      userId: anyUser?.id ?? null,
      ipAddress: '93.136.12.44',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      context: { note: 'seed-demo-test-data' },
      status: 'NEW',
      notes: 'Ovo je seediran zapis za demo prikaz u Adminu.',
    },
  });
}

async function seedScenarioMatrix() {
  const category = await prisma.category.findFirst({ where: { isActive: true } });
  if (!category) throw new Error('Nema kategorija u bazi. Pokreni seed kategorija prije demo scenarija.');

  const legalStatus = await prisma.legalStatus.findFirst({ where: { isActive: true, code: { not: 'INDIVIDUAL' } } });
  const legalStatusId = legalStatus?.id ?? null;

  // 1) PROVIDER approval statusi + edge cases
  const pWaiting = await upsertUser({
    email: demoEmail('demo-provider-waiting'),
    role: 'PROVIDER',
    fullName: 'Luka Matić',
    phone: '+385991110001',
    legalStatusId,
    taxId: '12345678903',
    companyName: 'Obrt Matić',
  });
  const pRejected = await upsertUser({
    email: demoEmail('demo-provider-rejected'),
    role: 'PROVIDER',
    fullName: 'Karlo Radić',
    phone: '+385991110002',
    legalStatusId,
    taxId: '12345678903',
    companyName: 'Obrt Radić',
  });
  const pInactive = await upsertUser({
    email: demoEmail('demo-provider-inactive'),
    role: 'PROVIDER',
    fullName: 'Dino Kralj',
    phone: '+385991110003',
    legalStatusId,
    taxId: '12345678903',
    companyName: 'Kralj d.o.o.',
  });
  const pNoCredits = await upsertUser({
    email: demoEmail('demo-provider-nocredits'),
    role: 'PROVIDER',
    fullName: 'Filip Vuković',
    phone: '+385991110004',
    legalStatusId,
    taxId: '12345678903',
    companyName: 'Obrt Vuković',
  });
  const pNoCategories = await upsertUser({
    email: demoEmail('demo-provider-nocategories'),
    role: 'PROVIDER',
    fullName: 'Nina Marić',
    phone: '+385991110005',
    legalStatusId,
    taxId: '12345678903',
    companyName: 'Marić d.o.o.',
  });

  await ensureProviderProfile({
    userId: pWaiting.id,
    bio: 'Čeka odobrenje – koristi se za prikaz WAITING_FOR_APPROVAL.',
    approvalStatus: 'WAITING_FOR_APPROVAL',
    categories: [category],
  });
  await ensureProviderProfile({
    userId: pRejected.id,
    bio: 'Odbijen – primjer REJECTED s razlogom.',
    approvalStatus: 'REJECTED',
    categories: [category],
  });
  await ensureProviderProfile({
    userId: pInactive.id,
    bio: 'Neaktivan – primjer INACTIVE.',
    approvalStatus: 'INACTIVE',
    categories: [category],
  });
  await ensureProviderProfile({
    userId: pNoCredits.id,
    bio: 'Odobren ali bez kredita – edge case za marketplace.',
    approvalStatus: 'APPROVED',
    categories: [category],
  });
  await ensureProviderProfile({
    userId: pNoCategories.id,
    bio: 'Odobren ali bez kategorija – edge case za prazne leadove.',
    approvalStatus: 'APPROVED',
    categories: [],
  });

  // Subscriptions (namjerno različite)
  await ensureSubscription({ userId: pWaiting.id, creditsBalance: 0, status: 'ACTIVE' });
  await ensureSubscription({ userId: pRejected.id, creditsBalance: 10, status: 'ACTIVE' });
  await ensureSubscription({ userId: pInactive.id, creditsBalance: 10, status: 'EXPIRED' });
  await ensureSubscription({ userId: pNoCredits.id, creditsBalance: 0, status: 'ACTIVE' });
  // pNoCategories dobije kredite, ali nema kategorija
  await ensureSubscription({ userId: pNoCategories.id, creditsBalance: 25, status: 'ACTIVE' });

  // 2) KYC + badge kombinacije (na ova 3 providera)
  await prisma.providerProfile.update({
    where: { userId: pWaiting.id },
    data: {
      kycVerified: false,
      identityEmailVerified: true,
      identityEmailAddress: 'info@obrt-matic.hr',
      badgeData: { IDENTITY: { verified: true, source: 'EMAIL', date: new Date().toISOString() } },
    },
  });
  await prisma.providerProfile.update({
    where: { userId: pRejected.id },
    data: {
      kycVerified: true,
      kycDocumentUrl: '/uploads/demo/kyc-rjesenje.pdf',
      kycDocumentType: 'RPO_SOLUTION',
      badgeData: { BUSINESS: { verified: true, source: 'MANUAL', date: new Date().toISOString() } },
    },
  });
  await prisma.providerProfile.update({
    where: { userId: pInactive.id },
    data: {
      safetyInsuranceUrl: '/uploads/demo/polica-osiguranja.png',
      badgeData: { SAFETY: { verified: true, source: 'UPLOAD', date: new Date().toISOString() } },
    },
  });

  // 3) Moderation statusi (Job/Offer/Review)
  const demoClient = await upsertUser({
    email: demoEmail('demo-client-moderation'),
    role: 'USER',
    fullName: 'Iva Šarić',
    phone: '+385981230001',
    city: 'Split',
  });

  const jobPending = await prisma.job.create({
    data: {
      userId: demoClient.id,
      title: 'Hitno: sanacija vlage u stanu',
      description: 'Potrebna ponuda za sanaciju vlage i bojanje. Lokacija Split.',
      city: 'Split',
      budgetMin: 800,
      budgetMax: 1800,
      status: 'OPEN',
      isExclusive: true,
      leadStatus: 'AVAILABLE',
      leadPrice: 12,
      categoryId: category.id,
      qualityScore: 68,
      moderationStatus: 'PENDING',
    },
  });
  const jobApproved = await prisma.job.create({
    data: {
      userId: demoClient.id,
      title: 'Postavljanje laminata (45 m2)',
      description: 'Demontaža starog poda i postavljanje laminata. Zagreb.',
      city: 'Zagreb',
      budgetMin: 600,
      budgetMax: 1200,
      status: 'OPEN',
      isExclusive: true,
      leadStatus: 'AVAILABLE',
      leadPrice: 10,
      categoryId: category.id,
      qualityScore: 82,
      moderationStatus: 'APPROVED',
      moderationReviewedAt: new Date(),
      moderationNotes: 'Sadržaj uredan.',
    },
  });
  const jobRejected = await prisma.job.create({
    data: {
      userId: demoClient.id,
      title: '“Najjeftinije odmah” – sumnjiv oglas',
      description: 'Kontaktirajte me na WhatsApp… (demo za REJECTED).',
      city: 'Zagreb',
      budgetMin: 1,
      budgetMax: 2,
      status: 'OPEN',
      isExclusive: true,
      leadStatus: 'AVAILABLE',
      leadPrice: 10,
      categoryId: category.id,
      qualityScore: 10,
      moderationStatus: 'REJECTED',
      moderationReviewedAt: new Date(),
      moderationRejectionReason: 'Neprihvatljiv sadržaj / pokušaj izvan platforme.',
    },
  });

  const offerPending = await prisma.offer.create({
    data: {
      jobId: jobApproved.id,
      userId: pNoCategories.id,
      amount: 950,
      message: 'Mogu doći na uvid i napraviti ponudu u roku 24h.',
      status: 'PENDING',
      moderationStatus: 'PENDING',
    },
  });
  await prisma.offer.create({
    data: {
      jobId: jobApproved.id,
      userId: pWaiting.id,
      amount: 1100,
      message: 'Ponuda uključuje materijal i rad.',
      status: 'PENDING',
      moderationStatus: 'APPROVED',
      moderationReviewedAt: new Date(),
    },
  });
  await prisma.offer.create({
    data: {
      jobId: jobApproved.id,
      userId: pRejected.id,
      amount: 300,
      message: 'Javi se na broj… (demo za REJECTED)',
      status: 'PENDING',
      moderationStatus: 'REJECTED',
      moderationReviewedAt: new Date(),
      moderationRejectionReason: 'Kontakt informacije u poruci ponude.',
    },
  });

  // Review moderation: kreiraj završeni job + review zapise
  const completedJob = await prisma.job.create({
    data: {
      userId: demoClient.id,
      title: 'Čišćenje nakon renovacije',
      description: 'Potrebno generalno čišćenje 60 m2. Zagreb.',
      city: 'Zagreb',
      budgetMin: 150,
      budgetMax: 350,
      status: 'COMPLETED',
      isExclusive: true,
      leadStatus: 'CONVERTED',
      leadPrice: 10,
      categoryId: category.id,
      qualityScore: 77,
      moderationStatus: 'APPROVED',
    },
  });
  await prisma.review.create({
    data: {
      jobId: completedJob.id,
      fromUserId: demoClient.id,
      toUserId: pWaiting.id,
      rating: 5,
      comment: 'Sve dogovoreno i odrađeno u roku. Preporuka.',
      moderationStatus: 'APPROVED',
      moderationReviewedAt: new Date(),
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  await prisma.review.create({
    data: {
      jobId: completedJob.id,
      fromUserId: pRejected.id,
      toUserId: demoClient.id,
      rating: 1,
      comment: 'Loše iskustvo (demo PENDING).',
      moderationStatus: 'PENDING',
      isPublished: false,
    },
  });

  // 4) Refund flow (LeadPurchase refundRequestStatus: PENDING/APPROVED/REJECTED)
  const refundBaseJob = jobApproved;
  const lpPending = await prisma.leadPurchase.create({
    data: {
      jobId: refundBaseJob.id,
      providerId: pNoCredits.id,
      creditsSpent: 10,
      leadPrice: 10,
      status: 'ACTIVE',
      refundRequestStatus: 'PENDING',
      refundRequestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      refundReason: 'Klijent se nije javio 48h (demo).',
    },
  });
  const lpApproved = await prisma.leadPurchase.create({
    data: {
      jobId: jobPending.id,
      providerId: pNoCategories.id,
      creditsSpent: 12,
      leadPrice: 12,
      status: 'REFUNDED',
      refundRequestStatus: 'APPROVED',
      refundRequestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      refundApprovedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      refundApprovedBy: null,
      refundReason: 'Nevažeći kontakt (demo).',
    },
  });
  const lpRejected = await prisma.leadPurchase.create({
    data: {
      jobId: jobRejected.id,
      providerId: pWaiting.id,
      creditsSpent: 10,
      leadPrice: 10,
      status: 'ACTIVE',
      refundRequestStatus: 'REJECTED',
      refundRequestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      refundApprovedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      refundApprovedBy: null,
      refundRejectedReason: 'Klijent je odgovorio unutar roka (demo).',
    },
  });

  // 5) Invoice/payment scenariji (lead purchase + addon + storno)
  const inv1 = await prisma.invoice.create({
    data: {
      userId: pNoCredits.id,
      invoiceNumber: await nextInvoiceNumber(),
      type: 'LEAD_PURCHASE',
      status: 'DRAFT',
      amount: 1000,
      taxAmount: 250,
      totalAmount: 1250,
      currency: 'EUR',
      leadPurchaseId: lpPending.id,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      notes: 'Demo DRAFT faktura za lead kupovinu.',
    },
  });
  const inv2 = await prisma.invoice.create({
    data: {
      userId: pNoCategories.id,
      invoiceNumber: await nextInvoiceNumber(),
      type: 'LEAD_PURCHASE',
      status: 'SENT',
      amount: 1200,
      taxAmount: 300,
      totalAmount: 1500,
      currency: 'EUR',
      leadPurchaseId: lpApproved.id,
      issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 11),
      emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      emailSentTo: pNoCategories.email,
      notes: 'Demo SENT faktura.',
    },
  });
  const inv3 = await prisma.invoice.create({
    data: {
      userId: pWaiting.id,
      invoiceNumber: await nextInvoiceNumber(),
      type: 'LEAD_PURCHASE',
      status: 'PAID',
      amount: 1000,
      taxAmount: 250,
      totalAmount: 1250,
      currency: 'EUR',
      leadPurchaseId: lpRejected.id,
      issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      notes: 'Demo PAID faktura.',
    },
  });
  await prisma.invoice.update({
    where: { id: inv2.id },
    data: { status: 'STORNED', notes: `${inv2.notes || ''}\nStornirano: demo razlog.`.trim() },
  });

  // Add-on primjer (ACTIVE + invoice)
  const addon = await prisma.addonSubscription.upsert({
    where: { userId_type_scope: { userId: pNoCategories.id, type: 'CREDITS', scope: '50' } },
    update: {
      status: 'ACTIVE',
      creditsAmount: 50,
      price: 19.0,
      currency: 'EUR',
      displayName: '50 Extra Credits (Demo)',
      validFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29),
      notes: 'Demo add-on za kredite.',
    },
    create: {
      userId: pNoCategories.id,
      type: 'CREDITS',
      scope: '50',
      displayName: '50 Extra Credits (Demo)',
      creditsAmount: 50,
      status: 'ACTIVE',
      autoRenew: false,
      validFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 29),
      price: 19.0,
      currency: 'EUR',
      notes: 'Demo add-on za kredite.',
    },
  });
  await prisma.addonUsage.upsert({
    where: { addonId: addon.id },
    update: { remaining: 38, consumed: 12, percentageUsed: 24.0, lastUpdated: new Date() },
    create: { addonId: addon.id, remaining: 38, consumed: 12, percentageUsed: 24.0 },
  });
  await prisma.invoice.create({
    data: {
      userId: pNoCategories.id,
      invoiceNumber: await nextInvoiceNumber(),
      type: 'ADDON',
      status: 'PAID',
      amount: 1900,
      taxAmount: 475,
      totalAmount: 2375,
      currency: 'EUR',
      addonId: addon.id,
      issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      notes: 'Demo PAID addon faktura.',
    },
  });

  // 6) LeadQueue + CompanyLeadQueue
  // Uzmi postojeće director/tim profile iz screenshot korisnika ako postoje
  const directorUser = await prisma.user.findUnique({
    where: { email_role: { email: `screenshot-direktor@${DOMAIN}`, role: 'PROVIDER' } },
    include: { providerProfile: true },
  });
  const teamUser = await prisma.user.findUnique({
    where: { email_role: { email: `screenshot-tim@${DOMAIN}`, role: 'PROVIDER' } },
    include: { providerProfile: true },
  });
  const directorProfileId = directorUser?.providerProfile?.id ?? null;
  const teamProfileId = teamUser?.providerProfile?.id ?? null;

  if (directorProfileId) {
    const queueJob = await prisma.job.create({
      data: {
        userId: demoClient.id,
        title: 'Demo: lead queue – ponuda u redu čekanja',
        description: 'Job za prikaz LeadQueue statusa (OFFERED/EXPIRED).',
        city: 'Zagreb',
        budgetMin: 500,
        budgetMax: 1500,
        status: 'OPEN',
        isExclusive: true,
        leadStatus: 'AVAILABLE',
        leadPrice: 10,
        categoryId: category.id,
        qualityScore: 72,
        moderationStatus: 'APPROVED',
      },
    });

    // LeadQueue (vanjska) – 3 providera
    await prisma.leadQueue.createMany({
      data: [
        { jobId: queueJob.id, providerId: pWaiting.id, position: 1, status: 'OFFERED', offeredAt: new Date(Date.now() - 1000 * 60 * 60 * 2), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22) },
        { jobId: queueJob.id, providerId: pRejected.id, position: 2, status: 'WAITING' },
        { jobId: queueJob.id, providerId: pInactive.id, position: 3, status: 'EXPIRED', offeredAt: new Date(Date.now() - 1000 * 60 * 60 * 30), expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 6), respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), response: 'NO_RESPONSE' },
      ],
      skipDuplicates: true,
    });

    // CompanyLeadQueue (interni) – direktor → tim član
    const directorProfile = await prisma.providerProfile.findUnique({ where: { id: directorProfileId } });
    if (directorProfile) {
      await prisma.companyLeadQueue.upsert({
        where: { jobId_directorId: { jobId: queueJob.id, directorId: directorProfileId } },
        update: {
          status: teamProfileId ? 'ASSIGNED' : 'PENDING',
          assignedToId: teamProfileId,
          assignmentType: teamProfileId ? 'MANUAL' : null,
          assignedAt: teamProfileId ? new Date(Date.now() - 1000 * 60 * 30) : null,
          notes: 'Demo: dodijeljeno članu tima.',
          position: 1,
        },
        create: {
          jobId: queueJob.id,
          directorId: directorProfileId,
          assignedToId: teamProfileId,
          position: 1,
          status: teamProfileId ? 'ASSIGNED' : 'PENDING',
          assignmentType: teamProfileId ? 'MANUAL' : null,
          assignedAt: teamProfileId ? new Date(Date.now() - 1000 * 60 * 30) : null,
          notes: 'Demo: dodijeljeno članu tima.',
        },
      });
    }
  }

  // 7) Thread locking (ChatRoom)
  const room = await prisma.chatRoom.create({
    data: {
      jobId: jobApproved.id,
      participants: { connect: [{ id: demoClient.id }, { id: pNoCategories.id }] },
      isLocked: true,
      lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      lockedReason: 'JOB_COMPLETED',
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  });
  await prisma.chatMessage.createMany({
    data: [
      { roomId: room.id, senderId: demoClient.id, content: 'Hvala na ponudi, javim se uskoro.' },
      { roomId: room.id, senderId: pNoCategories.id, content: 'Naravno, stojim na raspolaganju.' },
    ],
  });

  // Privremeno otključan thread primjer
  const roomTmp = await prisma.chatRoom.create({
    data: {
      jobId: jobPending.id,
      participants: { connect: [{ id: demoClient.id }, { id: pWaiting.id }] },
      isLocked: true,
      lockedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      lockedReason: 'INACTIVITY',
      unlockedUntil: new Date(Date.now() + 1000 * 60 * 60 * 2),
      lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  });
  await prisma.chatMessage.create({
    data: { roomId: roomTmp.id, senderId: demoClient.id, content: 'Možemo li ipak dogovoriti termin?' },
  });

  // 8) Notifications varijante (read/unread, više tipova)
  await prisma.notification.createMany({
    data: [
      { userId: demoClient.id, title: 'Nova ponuda', message: 'Primili ste novu ponudu za posao.', type: 'NEW_OFFER', isRead: false, jobId: jobApproved.id, offerId: offerPending.id },
      { userId: demoClient.id, title: 'Ponuda prihvaćena', message: 'Prihvatili ste ponudu – možete započeti chat.', type: 'OFFER_ACCEPTED', isRead: true, jobId: completedJob.id },
      { userId: pNoCategories.id, title: 'Novi lead', message: 'Dodan vam je novi lead u Tržnicu.', type: 'NEW_JOB', isRead: false, jobId: jobPending.id },
      { userId: pNoCategories.id, title: 'Refund status', message: 'Vaš refund zahtjev je obrađen.', type: 'SYSTEM', isRead: true },
    ],
    skipDuplicates: true,
  });

  return {
    ok: true,
    created: {
      providers: 5,
      jobs: 5,
      offers: 3,
      leadPurchases: 3,
      invoices: 4,
      chatRooms: 2,
      notifications: 4,
    },
    credentials: { password: PASSWORD },
    findByEmailPrefixes: ['demo-provider-', 'demo-client-'],
  };
}

async function createDemoRunWithScreenshots() {
  const screenshots = pickScreenshotUrlsFromDocsDir();

  const plan = await prisma.testPlan.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { items: { orderBy: { order: 'asc' } } },
  });
  if (!plan || plan.items.length === 0) return { ok: false, reason: 'missing_test_plan_items' };

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });

  const run = await prisma.testRun.create({
    data: {
      planId: plan.id,
      name: `Demo run – ${new Date().toISOString().slice(0, 10)}`,
      status: 'IN_PROGRESS',
      createdById: admin?.id ?? null,
      notes: 'Seediran demo run s pripadajućim screenshotovima.',
      items: {
        create: plan.items.map((it, idx) => ({
          itemId: it.id,
          status: 'PENDING',
          comment: idx === 0 ? 'Krenuti s osnovnim flow-om.' : null,
          screenshots: screenshots.length > 0 ? [screenshots[idx % screenshots.length]] : [],
        })),
      },
    },
    include: { items: true },
  });

  return { ok: true, runId: run.id, runItems: run.items.length, screenshotsAttached: screenshots.length > 0 };
}

async function main() {
  console.log('🌱 Seeding demo/test data...\n');

  const { users, password } = await ensureScreenshotTestUsers();
  console.log('✅ Screenshot test users:', users.map((u) => `${u.role}=${u.email}`).join(', '));
  console.log('   Password:', password);

  const demo = await ensureScreenshotDemoData();
  console.log('✅ Screenshot demo data:', demo.ok ? `jobsCreated=${demo.jobsCreated}, leadsPurchased=${demo.leadsPurchased}` : `skipped (${demo.reason})`);

  await ensureMinimalTestPlans();
  await seedContactAndLogs();
  const matrix = await seedScenarioMatrix();
  console.log('✅ Scenario matrix:', matrix);

  const run = await createDemoRunWithScreenshots();
  console.log('✅ Demo run:', run);

  console.log('\nGotovo.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

