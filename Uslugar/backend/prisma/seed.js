import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Fix LeadPurchaseStatus enum and column (if migration failed)
  console.log('🔧 Fixing LeadPurchaseStatus enum...');
  try {
    // Step 1: Create enum if it doesn't exist
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "LeadPurchaseStatus" AS ENUM ('ACTIVE', 'CONTACTED', 'CONVERTED', 'REFUNDED', 'EXPIRED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;
    console.log('✅ LeadPurchaseStatus enum created or already exists');

    // Step 2: Check if column is already enum type
    const columnInfo = await prisma.$queryRaw`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'LeadPurchase' AND column_name = 'status';
    `;

    if (columnInfo && columnInfo.length > 0) {
      const colType = columnInfo[0];
      
      if (colType.udt_name !== 'LeadPurchaseStatus') {
        console.log('🔄 Converting status column from TEXT to LeadPurchaseStatus enum...');
        
        // Drop default
        await prisma.$executeRaw`ALTER TABLE "LeadPurchase" ALTER COLUMN "status" DROP DEFAULT`;
        
        // Convert type
        await prisma.$executeRaw`
          ALTER TABLE "LeadPurchase" 
            ALTER COLUMN "status" TYPE "LeadPurchaseStatus" 
            USING CASE 
              WHEN "status"::text = 'ACTIVE' THEN 'ACTIVE'::"LeadPurchaseStatus"
              WHEN "status"::text = 'CONTACTED' THEN 'CONTACTED'::"LeadPurchaseStatus"
              WHEN "status"::text = 'CONVERTED' THEN 'CONVERTED'::"LeadPurchaseStatus"
              WHEN "status"::text = 'REFUNDED' THEN 'REFUNDED'::"LeadPurchaseStatus"
              WHEN "status"::text = 'EXPIRED' THEN 'EXPIRED'::"LeadPurchaseStatus"
              WHEN "status"::text = 'CANCELLED' THEN 'CANCELLED'::"LeadPurchaseStatus"
              ELSE 'ACTIVE'::"LeadPurchaseStatus"
            END
        `;
        
        // Restore default
        await prisma.$executeRaw`ALTER TABLE "LeadPurchase" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"LeadPurchaseStatus"`;
        
        console.log('✅ Status column converted to LeadPurchaseStatus enum');
      } else {
        console.log('✅ Status column is already LeadPurchaseStatus enum');
      }
    } else {
      console.log('⚠️  LeadPurchase table or status column not found, skipping conversion');
    }

    // Step 3: Add ADMIN_ADJUST to CreditTransactionType if needed
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditTransactionType') THEN
          BEGIN
            ALTER TYPE "CreditTransactionType" ADD VALUE 'ADMIN_ADJUST';
          EXCEPTION
            WHEN duplicate_object THEN NULL;
            WHEN others THEN NULL;
          END;
        END IF;
      END $$;
    `;
    console.log('✅ CreditTransactionType enum updated (ADMIN_ADJUST added if needed)');

  } catch (error) {
    console.error('❌ Error fixing LeadPurchaseStatus enum:', error.message);
    // Don't fail seed if enum already exists or other minor issues
    if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
      throw error;
    }
  }

  // Seed Subscription Plans
  console.log('📦 Seeding subscription plans...');
  
  const plans = [
    {
      name: 'BASIC',
      displayName: 'Basic',
      price: 39,
      currency: 'EUR',
      credits: 10,
      features: [
        '10 ekskluzivnih leadova mjesečno',
        '1 lead = 1 izvođač (bez konkurencije)',
        'Refund ako klijent ne odgovori',
        'ROI statistika',
        'Email notifikacije',
        'Mini CRM za leadove (bilješke, sljedeći korak, podsjetnik po leadu)'
      ],
      isPopular: false,
      displayOrder: 1,
      isActive: true,
      savings: 'Ušteda 10 EUR u odnosu na plaćanje po leadu'
    },
    {
      name: 'PREMIUM',
      displayName: 'Premium',
      price: 89,
      currency: 'EUR',
      credits: 25,
      features: [
        '25 ekskluzivnih leadova mjesečno',
        '1 lead = 1 izvođač (bez konkurencije)',
        'Refund ako klijent ne odgovori',
        'AI prioritet - viđeni prvi',
        'ROI statistika + analitika',
        'SMS + Email notifikacije',
        'Mini CRM za leadove (bilješke, sljedeći korak, podsjetnik po leadu)',
        'Prioritetna podrška'
      ],
      isPopular: true,
      displayOrder: 2,
      isActive: true,
      savings: 'Ušteda 161 EUR u odnosu na plaćanje po leadu (36% popust)'
    },
    {
      name: 'PRO',
      displayName: 'Pro',
      price: 149,
      currency: 'EUR',
      credits: 50,
      features: [
        '50 ekskluzivnih leadova mjesečno',
        '1 lead = 1 izvođač (bez konkurencije)',
        'Refund ako klijent ne odgovori',
        'AI prioritet - viđeni prvi',
        'Premium kvaliteta leadova (80+ score)',
        'ROI statistika + napredna analitika',
        'SMS + Email + Push notifikacije',
        'CRM + izvještaji',
        'VIP podrška 24/7',
        'Featured profil',
        'White-label opcija'
      ],
      isPopular: false,
      displayOrder: 3,
      isActive: true,
      savings: 'Ušteda 351 EUR u odnosu na plaćanje po leadu (47% popust)'
    }
  ];

  // Seed osnovni planovi (bez segmentacije - categoryId i region su null)
  for (const plan of plans) {
    // Prvo provjeri postoji li plan s istim imenom i null segmentacijom
    const existing = await prisma.subscriptionPlan.findFirst({
      where: {
        name: plan.name,
        categoryId: null,
        region: null
      }
    });

    if (existing) {
      await prisma.subscriptionPlan.update({
        where: { id: existing.id },
        data: plan
      });
    } else {
      await prisma.subscriptionPlan.create({
        data: {
          ...plan,
          categoryId: null,
          region: null
        }
      });
    }
    console.log(`✅ Plan dodan/ažuriran: ${plan.displayName} (osnovni)`);
  }

  // Seed segmentirani paketi - primjeri po regiji i kategoriji
  // Napomena: Ovo zahtijeva da kategorije već postoje u bazi
  console.log('📦 Seeding segmentirani paketi...');
  
  // Dohvati kategorije za segmentaciju
  const gradevinaCategory = await prisma.category.findFirst({
    where: { name: 'Građevina' }
  });
  const itCategory = await prisma.category.findFirst({
    where: { name: 'IT usluge' }
  });
  const arhitektiCategory = await prisma.category.findFirst({
    where: { name: 'Arhitekti' }
  });

  // Segmentirani paketi po regiji - Zagreb
  const segmentedPlans = [];
  
  if (gradevinaCategory) {
    // Građevina Zagreb - Premium paket s popustom
    segmentedPlans.push({
      name: 'PREMIUM',
      displayName: 'Premium',
      price: 79, // Popust za Zagreb
      currency: 'EUR',
      credits: 25,
      features: [
        '25 ekskluzivnih leadova mjesečno',
        'Specifično za Građevinu u Zagrebu',
        '1 lead = 1 izvođač (bez konkurencije)',
        'Refund ako klijent ne odgovori',
        'AI prioritet - viđeni prvi',
        'ROI statistika + analitika',
        'SMS + Email notifikacije',
        'Prioritetna podrška'
      ],
      isPopular: false,
      displayOrder: 2,
      isActive: true,
      savings: 'Ušteda 171 EUR u odnosu na plaćanje po leadu (Zagreb popust)',
      categoryId: gradevinaCategory.id,
      region: 'Zagreb'
    });
  }

  if (itCategory) {
    // IT usluge Dalmacija - PRO paket s popustom
    segmentedPlans.push({
      name: 'PRO',
      displayName: 'Pro',
      price: 129, // Popust za Dalmaciju
      currency: 'EUR',
      credits: 50,
      features: [
        '50 ekskluzivnih leadova mjesečno',
        'Specifično za IT usluge u Dalmaciji',
        '1 lead = 1 izvođač (bez konkurencije)',
        'Refund ako klijent ne odgovori',
        'AI prioritet - viđeni prvi',
        'Premium kvaliteta leadova (80+ score)',
        'ROI statistika + napredna analitika',
        'SMS + Email + Push notifikacije',
        'VIP podrška 24/7',
        'Featured profil'
      ],
      isPopular: false,
      displayOrder: 3,
      isActive: true,
      savings: 'Ušteda 371 EUR u odnosu na plaćanje po leadu (Dalmacija popust)',
      categoryId: itCategory.id,
      region: 'Dalmacija'
    });
  }

  if (arhitektiCategory) {
    // Arhitekti Istra - Basic paket
    segmentedPlans.push({
      name: 'BASIC',
      displayName: 'Basic',
      price: 35, // Popust za Istru
      currency: 'EUR',
      credits: 10,
      features: [
        '10 ekskluzivnih leadova mjesečno',
        'Specifično za Arhitekte u Istri',
        '1 lead = 1 izvođač (bez konkurencije)',
        'Refund ako klijent ne odgovori',
        'ROI statistika',
        'Email notifikacije',
        'Mini CRM za leadove (bilješke, sljedeći korak, podsjetnik po leadu)'
      ],
      isPopular: false,
      displayOrder: 1,
      isActive: true,
      savings: 'Ušteda 15 EUR u odnosu na plaćanje po leadu (Istra popust)',
      categoryId: arhitektiCategory.id,
      region: 'Istra'
    });
  }

  // Seed segmentirani paketi
  for (const plan of segmentedPlans) {
    try {
      // Prvo provjeri postoji li plan s istom kombinacijom
      const existing = await prisma.subscriptionPlan.findFirst({
        where: {
          name: plan.name,
          categoryId: plan.categoryId,
          region: plan.region
        }
      });

      if (existing) {
        await prisma.subscriptionPlan.update({
          where: { id: existing.id },
          data: plan
        });
      } else {
        await prisma.subscriptionPlan.create({
          data: plan
        });
      }
      console.log(`✅ Segmentirani plan dodan/ažuriran: ${plan.displayName}`);
    } catch (error) {
      console.warn(`⚠️ Neuspješno dodavanje segmentiranog plana ${plan.displayName}:`, error.message);
    }
  }

  // Seed Original Categories
  const categories = [
    'Soboslikarstvo', 'Keramičar', 'Električar', 'Vodoinstalater',
    'Građevina', 'Prijevoz', 'Čišćenje', 'IT usluge', 'Pravo'
  ];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('Seeded original categories.');
  
  // Seed NEW Categories - Only HIGH PROFIT categories are ACTIVE
  const newCategories = [
    // ARHITEKTURA I DIZAJN - AKTIVIRANO (visokoprofitabilno)
    { id: 'arch_001', name: 'Arhitekti', description: 'Projektiranje građevina, renovacije, legalizacije', isActive: true, icon: '🏗️', requiresLicense: true, nkdCode: '71.11', licenseType: 'Arhitektonska licenca', licenseAuthority: 'Hrvatska komora arhitekata' },
    { id: 'arch_002', name: 'Dizajneri interijera', description: 'Dizajn interijera, namještaj, dekor', isActive: true, icon: '🎨', requiresLicense: false, nkdCode: '74.10' },
    { id: 'arch_003', name: '3D vizualizacija', description: '3D modeli, renderi, virtualne turneje', isActive: false, icon: '🖼️', requiresLicense: false, nkdCode: '74.20' },
    { id: 'arch_004', name: 'Projektiranje građevina', description: 'Građevinski projekti, statika, instalacije', isActive: false, icon: '🏛️', requiresLicense: true, nkdCode: '71.12', licenseType: 'Građevinska licenca', licenseAuthority: 'Hrvatska komora inženjera' },
    { id: 'arch_005', name: 'Vrtni dizajn', description: 'Dizajn vrtova, krajobrazno uređenje', isActive: false, icon: '🌳', requiresLicense: false, nkdCode: '71.12' },
    
    // IT I WEB USLUGE - AKTIVIRANO (visokoprofitabilno)
    { id: 'it_001', name: 'Web dizajn', description: 'Dizajn web stranica, UI/UX', isActive: true, icon: '💻', requiresLicense: false, nkdCode: '62.01' },
    { id: 'it_002', name: 'Programiranje', description: 'Razvoj aplikacija, software', isActive: true, icon: '🔧', requiresLicense: false, nkdCode: '62.01' },
    { id: 'it_003', name: 'Mobilne aplikacije', description: 'iOS, Android aplikacije', isActive: true, icon: '📱', requiresLicense: false, nkdCode: '62.01' },
    { id: 'it_004', name: 'SEO optimizacija', description: 'Optimizacija za tražilice', isActive: false, icon: '🔍', requiresLicense: false, nkdCode: '62.02' },
    { id: 'it_005', name: 'Cyber sigurnost', description: 'Sigurnost IT sustava', isActive: false, icon: '🛡️', requiresLicense: false, nkdCode: '62.02' },
    { id: 'it_006', name: 'Cloud servisi', description: 'Cloud infrastruktura, migracije', isActive: false, icon: '☁️', requiresLicense: false, nkdCode: '62.02' },
    { id: 'it_007', name: 'IT konzulting', description: 'IT savjetovanje, implementacija', isActive: true, icon: '📊', requiresLicense: false, nkdCode: '62.03' },
    
    // ZDRAVSTVENE USLUGE - AKTIVIRANO (recurring revenue)
    { id: 'health_001', name: 'Fizioterapija', description: 'Fizikalna terapija, rehabilitacija', isActive: true, icon: '🏥', requiresLicense: true, nkdCode: '86.90', licenseType: 'Licenca fizioterapeuta', licenseAuthority: 'Hrvatska komora fizioterapeuta' },
    { id: 'health_002', name: 'Nutricionizam', description: 'Prehrambena savjetovanja', isActive: true, icon: '🥗', requiresLicense: true, nkdCode: '86.90', licenseType: 'Licenca nutricionista', licenseAuthority: 'Hrvatski liječnički zbor' },
    { id: 'health_003', name: 'Mentalno zdravlje', description: 'Psihološke usluge, savjetovanje', isActive: true, icon: '🧘', requiresLicense: true, nkdCode: '86.90', licenseType: 'Licenca psihologa', licenseAuthority: 'Hrvatski psihološki zbor' },
    { id: 'health_004', name: 'Kućni liječnik', description: 'Kućni posjeti, pregledi', isActive: false, icon: '👨‍⚕️', requiresLicense: true, nkdCode: '86.21' },
    { id: 'health_005', name: 'Stomatologija', description: 'Zubarske usluge', isActive: false, icon: '🦷', requiresLicense: true, nkdCode: '86.23' },
    { id: 'health_006', name: 'Optometristi', description: 'Pregled vida, naočale', isActive: false, icon: '👁️', requiresLicense: true, nkdCode: '86.90' },
    
    // EDUKACIJA I TRENING - AKTIVIRANO (growing market)
    { id: 'edu_001', name: 'Jezični tečajevi', description: 'Strani jezici, hrvatski jezik', isActive: true, icon: '🎓', requiresLicense: false, nkdCode: '85.52' },
    { id: 'edu_002', name: 'Poslovni trening', description: 'Soft skills, leadership', isActive: false, icon: '💼', requiresLicense: false, nkdCode: '85.52' },
    { id: 'edu_003', name: 'Glazbena nastava', description: 'Glazbeni instrumenti, pjevanje', isActive: false, icon: '🎵', requiresLicense: false, nkdCode: '85.52' },
    { id: 'edu_004', name: 'Sportska nastava', description: 'Treniranje, fitness instruktori', isActive: false, icon: '🏃', requiresLicense: false, nkdCode: '85.52' },
    { id: 'edu_005', name: 'Umjetnička nastava', description: 'Slikanje, kiparstvo, dizajn', isActive: false, icon: '🎨', requiresLicense: false, nkdCode: '85.52' },
    { id: 'edu_006', name: 'Online edukacija', description: 'E-learning, webinari', isActive: true, icon: '📚', requiresLicense: false, nkdCode: '85.52' },
    
    // TURISTIČKE USLUGE - DEAKTIVIRANO (seasonal, low profit)
    { id: 'tourism_001', name: 'Turistički vodiči', description: 'Vodstvo turista, objašnjavanje', isActive: false, icon: '🗺️', requiresLicense: true, nkdCode: '79.90' },
    { id: 'tourism_002', name: 'Turistički agenti', description: 'Organizacija putovanja', isActive: false, icon: '✈️', requiresLicense: false, nkdCode: '79.11' },
    { id: 'tourism_003', name: 'Hotelijerske usluge', description: 'Smeštaj, konferencije', isActive: false, icon: '🏨', requiresLicense: false, nkdCode: '55.10' },
    { id: 'tourism_004', name: 'Prijevoz turista', description: 'Autobusni prijevoz, transferi', isActive: false, icon: '🚌', requiresLicense: false, nkdCode: '49.39' },
    { id: 'tourism_005', name: 'Event organizacija', description: 'Organizacija događanja, konferencija', isActive: true, icon: '🎯', requiresLicense: false, nkdCode: '82.30' },
    
    // FINANCIJSKE USLUGE - DEAKTIVIRANO (regulated, complex)
    { id: 'finance_001', name: 'Investicijski savjeti', description: 'Savjetovanje o investicijama', isActive: false, icon: '💰', requiresLicense: true, nkdCode: '66.30' },
    { id: 'finance_002', name: 'Bankovne usluge', description: 'Bankovni proizvodi, krediti', isActive: false, icon: '🏦', requiresLicense: true, nkdCode: '64.19' },
    { id: 'finance_003', name: 'Financijsko planiranje', description: 'Osobno financijsko planiranje', isActive: false, icon: '📈', requiresLicense: false, nkdCode: '66.30' },
    { id: 'finance_004', name: 'Hipotekarni savjeti', description: 'Savjetovanje o hipotekama', isActive: false, icon: '🏠', requiresLicense: false, nkdCode: '66.30' },
    { id: 'finance_005', name: 'Osiguranje', description: 'Osiguravajući proizvodi', isActive: false, icon: '💳', requiresLicense: true, nkdCode: '65.20' },
    
    // MARKETING I PR - AKTIVIRANO (high value)
    { id: 'marketing_001', name: 'Marketing agencije', description: 'Kompletni marketing servisi', isActive: true, icon: '📢', requiresLicense: false, nkdCode: '73.11' },
    { id: 'marketing_002', name: 'Reklamne usluge', description: 'Kreiranje reklama, kampanje', isActive: false, icon: '📺', requiresLicense: false, nkdCode: '73.11' },
    { id: 'marketing_003', name: 'Social media marketing', description: 'Upravljanje društvenim mrežama', isActive: true, icon: '📱', requiresLicense: false, nkdCode: '73.11' },
    { id: 'marketing_004', name: 'PR usluge', description: 'Odnosi s javnošću, komunikacija', isActive: false, icon: '📰', requiresLicense: false, nkdCode: '73.12' },
    { id: 'marketing_005', name: 'Branding', description: 'Kreiranje brenda, identiteta', isActive: true, icon: '🎯', requiresLicense: false, nkdCode: '73.11' },
    
    // TRANSPORT I LOGISTIKA - DEAKTIVIRANO (low profit)
    { id: 'transport_001', name: 'Kamionski prijevoz', description: 'Prijevoz tereta kamionima', isActive: false, icon: '🚛', requiresLicense: true, nkdCode: '49.41' },
    { id: 'transport_002', name: 'Kurirske usluge', description: 'Dostava paketa, kuriri', isActive: false, icon: '📦', requiresLicense: false, nkdCode: '53.20' },
    { id: 'transport_003', name: 'Međunarodni transport', description: 'Prijevoz između zemalja', isActive: false, icon: '🚢', requiresLicense: true, nkdCode: '49.41' },
    { id: 'transport_004', name: 'Skladišne usluge', description: 'Skladištenje, logistika', isActive: false, icon: '🏭', requiresLicense: false, nkdCode: '52.10' },
    { id: 'transport_005', name: 'Specijalizirani transport', description: 'Prijevoz opasnih materijala', isActive: false, icon: '🚚', requiresLicense: true, nkdCode: '49.41' },
    
    // OSTALE USLUGE - DEAKTIVIRANO (low profit)
    { id: 'other_001', name: 'Zabavne usluge', description: 'Animatori, DJ, zabavljači', isActive: false, icon: '🎪', requiresLicense: false, nkdCode: '90.03' },
    { id: 'other_002', name: 'Umjetničke usluge', description: 'Kiparstvo, slikanje, umjetnost', isActive: false, icon: '🎭', requiresLicense: false, nkdCode: '90.03' },
    { id: 'other_003', name: 'Trgovinske usluge', description: 'Prodaja, trgovina', isActive: false, icon: '🏪', requiresLicense: false, nkdCode: '47.11' },
    { id: 'other_004', name: 'Poslovne usluge', description: 'Administrativne usluge', isActive: false, icon: '🏢', requiresLicense: false, nkdCode: '82.11' },
    { id: 'other_005', name: 'Popravak opreme', description: 'Popravak različite opreme', isActive: false, icon: '🔧', requiresLicense: false, nkdCode: '95.11' },
    
    // DODATNE GLAVNE KATEGORIJE ZA PODKATEGORIJE - AKTIVIRANO
    { id: 'garden_001', name: 'Vrtni radovi', description: 'Vrtni radovi i baštanska njega', isActive: true, icon: '🌿', requiresLicense: false, nkdCode: '81.30' },
    { id: 'clean_001', name: 'Čistoća i održavanje', description: 'Čišćenje i održavanje prostora', isActive: true, icon: '🧹', requiresLicense: false, nkdCode: '81.21' },
    { id: 'it_support_001', name: 'IT podrška', description: 'IT usluge i tehnička podrška', isActive: true, icon: '🖥️', requiresLicense: false, nkdCode: '62.03' }
  ];

  for (const category of newCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category
    });
  }
  console.log(`✅ Seeded ${newCategories.length} new categories.`);
  console.log(`✅ ACTIVATED high-profit categories only.`);

  // Seed Subcategories
  const subCategories = [
    // VRTNI RADOVI - 4 podkategorije
    { name: 'Uređivanje vrta', description: 'Dizajn i uređivanje vrtnih prostora', parentCategoryName: 'Vrtni radovi', icon: '🌿', isActive: true },
    { name: 'Sadnja biljaka', description: 'Sadnja cvijeća, grmlja i drveća', parentCategoryName: 'Vrtni radovi', icon: '🌱', isActive: true },
    { name: 'Održavanje vrta', description: 'Košenje, obrezivanje, zalijevanje', parentCategoryName: 'Vrtni radovi', icon: '✂️', isActive: true },
    { name: 'Automatsko zalijevanje', description: 'Ugradnja sustava automatskog zalijevanja', parentCategoryName: 'Vrtni radovi', icon: '💧', isActive: true },

    // ČISTOĆA I ODRŽAVANJE - 4 podkategorije
    { name: 'Čišćenje kuće', description: 'Redovno čišćenje stanova i kuća', parentCategoryName: 'Čistoća i održavanje', icon: '🧹', isActive: true },
    { name: 'Čišćenje ureda', description: 'Poslovni prostori i uredi', parentCategoryName: 'Čistoća i održavanje', icon: '🏢', isActive: true },
    { name: 'Čišćenje nakon gradnje', description: 'Čišćenje nakon renovacije i gradnje', parentCategoryName: 'Čistoća i održavanje', icon: '🏗️', isActive: true },
    { name: 'Čišćenje tepiha', description: 'Profesionalno čišćenje tepiha i tapeta', parentCategoryName: 'Čistoća i održavanje', icon: '🪣', isActive: true },

    // IT PODRŠKA - 4 podkategorije
    { name: 'Popravak računala', description: 'Servis desktop i laptop računala', parentCategoryName: 'IT podrška', icon: '💻', isActive: true },
    { name: 'Mrežne instalacije', description: 'Ugradnja WiFi mreža i kabeliranje', parentCategoryName: 'IT podrška', icon: '📶', isActive: true },
    { name: 'Sigurnosni sustavi', description: 'Kamere, alarmi, kontrolni sustavi', parentCategoryName: 'IT podrška', icon: '🔒', isActive: true },
    { name: 'Software podrška', description: 'Instalacija programa i tehnička podrška', parentCategoryName: 'IT podrška', icon: '⚙️', isActive: true },

    // PRIJEVOZ - 4 podkategorije
    { name: 'Selidba', description: 'Selidba stanova i kuća', parentCategoryName: 'Prijevoz', icon: '📦', isActive: true },
    { name: 'Prijevoz namještaja', description: 'Transport namještaja i velikih predmeta', parentCategoryName: 'Prijevoz', icon: '🚚', isActive: true },
    { name: 'Prijevoz građevinskog materijala', description: 'Transport cementa, pijeska, cigle', parentCategoryName: 'Prijevoz', icon: '🧱', isActive: true },
    { name: 'Prijevoz otpada', description: 'Odvoz građevinskog i komunalnog otpada', parentCategoryName: 'Prijevoz', icon: '🗑️', isActive: true }
  ];

  for (const subcategory of subCategories) {
    const parent = await prisma.category.findFirst({
      where: { name: subcategory.parentCategoryName }
    });
    
    if (parent) {
      const { parentCategoryName, ...subcategoryData } = subcategory;
      await prisma.category.upsert({
        where: { 
          name: subcategory.name
        },
        update: {
          ...subcategoryData,
          parentId: parent.id
        },
        create: {
          ...subcategoryData,
          parentId: parent.id
        }
      });
    }
  }
  console.log(`✅ Seeded ${subCategories.length} subcategories.`);
  
  // Seed Legal Statuses (Hrvatski pravni oblici) - IDevi moraju biti isti kao u migraciji!
  const legalStatuses = [
    {
      id: 'cls1_individual',
      code: 'INDIVIDUAL',
      name: 'Fizička osoba',
      description: 'Privatna osoba bez registrirane djelatnosti',
      isActive: true
    },
    {
      id: 'cls2_sole_trader',
      code: 'SOLE_TRADER',
      name: 'Obrtnik',
      description: 'Registrirani obrt - fizička osoba s OIB-om',
      isActive: true
    },
    {
      id: 'cls3_pausal',
      code: 'PAUSAL',
      name: 'Paušalni obrt',
      description: 'Obrt s paušalnim oporezivanjem',
      isActive: true
    },
    {
      id: 'cls4_doo',
      code: 'DOO',
      name: 'd.o.o.',
      description: 'Društvo s ograničenom odgovornošću',
      isActive: true
    },
    {
      id: 'cls5_jdoo',
      code: 'JDOO',
      name: 'j.d.o.o.',
      description: 'Jednostavno društvo s ograničenom odgovornošću',
      isActive: true
    },
    {
      id: 'cls6_freelancer',
      code: 'FREELANCER',
      name: 'Samostalni djelatnik',
      description: 'Freelancer s paušalnim oporezivanjem',
      isActive: true
    }
  ];
  
  for (const status of legalStatuses) {
    await prisma.legalStatus.upsert({
      where: { id: status.id },
      update: status,
      create: status
    });
  }
  console.log('Seeded legal statuses.');

  // Seed Documentation - integrirano u glavni seed workflow
  console.log('📚 Seeding documentation...');
  try {
    const seedDocumentation = await import('./seeds/seed-documentation.js');
    await seedDocumentation.default();
    console.log('✅ Documentation seeded successfully');
  } catch (error) {
    // Ne blokira glavni seed ako dokumentacija ne postoji ili ima grešku
    console.warn('⚠️  Documentation seed skipped or failed:', error.message);
    console.log('💡 Za ručni seed dokumentacije, pokreni: npm run seed:documentation');
  }
}

main().finally(async () => { await prisma.$disconnect(); });