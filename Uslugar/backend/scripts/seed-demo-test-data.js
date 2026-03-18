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
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

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

