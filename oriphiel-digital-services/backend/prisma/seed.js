import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function buildStrategySnapshot(track, industry) {
  return {
    offerSnapshot: {
      demoVersion: 'v1',
      industry,
      goalFocus: track === 'PREMIUM' ? 'Online prodaja' : 'Leads',
      clientProfile: track === 'PREMIUM' ? 'DEMANDING' : 'UNSURE',
      riskTolerance: track === 'STARTER' ? 'LOW' : 'MEDIUM',
      selectedScenarioId: industry.toLowerCase().includes('commerce') ? 'ecommerce' : null,
      needs: track === 'PREMIUM' ? ['Leads', 'Online prodaja', 'Katalog/letak'] : ['Leads', 'Pozivi'],
      recommendedTrack: track,
      phases: [
        { id: 'P0_DEMO', title: 'Faza 0 - Demo' },
        { id: 'P1_DISCOVERY', title: 'Faza 1 - Discovery i strategija' },
        { id: 'P2_TRACKING', title: 'Faza 2 - Tracking i struktura' },
        { id: 'P3_LAUNCH', title: 'Faza 3 - Inicijalne kampanje' }
      ],
      predictedQA: [
        {
          q: 'Zasto je predlozen ovaj track?',
          a: 'Zato sto odgovara ciljevima, djelatnosti i razini rizika klijenta.'
        },
        {
          q: 'Kada su prvi rezultati?',
          a: 'Prve signale o kvaliteti prometa ocekujemo kroz 2-4 tjedna.'
        }
      ],
      technologySnapshot: {
        selectedTechnologies: [
          {
            id: 'react',
            name: 'React',
            category: 'Frontend',
            sourceUrl: 'https://react.dev/',
            pricingModel: 'Open source'
          },
          {
            id: 'nodejs',
            name: 'Node.js',
            category: 'Backend runtime',
            sourceUrl: 'https://nodejs.org/',
            pricingModel: 'Open source'
          }
        ],
        assumptions: [
          'Ad spend nije ukljucen.',
          'Procjena se potvrduje nakon discovery faze.'
        ],
        costEstimate: {
          setupEur: track === 'PREMIUM' ? 3800 : 1200,
          monthlyOpsEur: track === 'PREMIUM' ? 1300 : 350,
          toolingEur: 0,
          totalMonthlyEur: track === 'PREMIUM' ? 1300 : 350
        }
      }
    }
  };
}

async function ensureClientWithConfigurations({ name, email, companyName, phone, track, industry }) {
  let client = await prisma.client.findFirst({ where: { email } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name,
        email,
        companyName,
        phone,
        notes: 'Seed demo client'
      }
    });
  }

  const existingConfigs = await prisma.clientConfiguration.count({
    where: { clientId: client.id }
  });

  if (existingConfigs === 0) {
    const strategySnapshot = buildStrategySnapshot(track, industry);
    await prisma.clientConfiguration.createMany({
      data: [
        {
          clientId: client.id,
          version: 1,
          title: 'Inicijalna konfiguracija',
          status: 'DRAFT',
          strategySnapshot,
          pricingSnapshot: null,
          createdBy: 'seed'
        },
        {
          clientId: client.id,
          version: 2,
          title: 'Optimizirana konfiguracija',
          status: 'OFFERED',
          strategySnapshot,
          pricingSnapshot: {
            options: [
              { label: 'Starter', setupEur: 1200, monthlyOpsEur: 350 },
              { label: 'Premium', setupEur: 3800, monthlyOpsEur: 1300 }
            ]
          },
          createdBy: 'seed'
        }
      ]
    });
  }

  const existingInquiry = await prisma.partnerInquiry.findFirst({
    where: { email, leadType: 'DEMO_CONFIG' }
  });

  if (!existingInquiry) {
    await prisma.partnerInquiry.create({
      data: {
        fullName: name,
        email,
        companyName,
        phone,
        serviceType: 'MARKETING',
        leadType: 'DEMO_CONFIG',
        source: 'ORIPHIEL_DIRECT',
        status: 'NEW',
        message: 'Seed demo inquiry for testing convert flow.',
        strategySnapshot: buildStrategySnapshot(track, industry),
        clientId: client.id
      }
    });
  }
}

async function main() {
  await ensureClientWithConfigurations({
    name: 'Marko Horvat',
    email: 'marko.gradnja@example.com',
    companyName: 'Gradnja Plus d.o.o.',
    phone: '+38591111222',
    track: 'GROWTH',
    industry: 'Građevina i adaptacije'
  });

  await ensureClientWithConfigurations({
    name: 'Petra Ilic',
    email: 'petra.beauty@example.com',
    companyName: 'Beauty Studio Petra',
    phone: '+38595555666',
    track: 'STARTER',
    industry: 'Ljepota i wellness'
  });

  await ensureClientWithConfigurations({
    name: 'Ivan Kovac',
    email: 'ivan.shop@example.com',
    companyName: 'ShopMaster j.d.o.o.',
    phone: '+38598888777',
    track: 'PREMIUM',
    industry: 'E-commerce'
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Seed completed successfully.');
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
