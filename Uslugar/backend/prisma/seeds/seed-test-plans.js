// Seed skripta za test planove iz TEST-PLAN-FRONTEND.md i TEST-PLAN-ADMIN.md
// Pokreni: node prisma/seeds/seed-test-plans.js

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Koristi istu Prisma instancu kao backend
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Parsiraj markdown fajl i izvuci test slučajeve
function parseTestPlanMarkdown(markdownContent) {
  const plans = [];
  const lines = markdownContent.split('\n');
  
  let currentCategory = null;
  let currentTest = null;
  let currentSteps = [];
  let currentExpectedResult = [];
  let inSteps = false;
  let inExpectedResult = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Preskoči prazne linije i separator
    if (!line || line === '---' || line.startsWith('## 📋') || line.startsWith('## ✅') || line.startsWith('## 🎯') || line.startsWith('## ⚠️')) {
      continue;
    }
    
    // Detektiraj kategoriju (## 1️⃣, ## 2️⃣, itd. ili ## 🔟)
    if (line.match(/^## \d+[️⃣🔟]/) || line.match(/^## [1-9]0?[️⃣🔟]/)) {
      // Spremi prethodni test ako postoji
      if (currentTest && currentCategory) {
        if (!plans.find(p => p.category === currentCategory)) {
          plans.push({
            category: currentCategory,
            name: currentCategory,
            description: `Test plan za ${currentCategory}`,
            items: []
          });
        }
        const plan = plans.find(p => p.category === currentCategory);
        plan.items.push({
          title: currentTest,
          description: currentSteps.join('\n').trim() || null,
          expectedResult: currentExpectedResult.join('\n').trim() || null,
          dataVariations: { examples: [] }
        });
      }
      
      // Nova kategorija - ukloni emoji i brojeve
      currentCategory = line.replace(/^## \d+[️⃣🔟]\s*/, '').replace(/^## [1-9]0?[️⃣🔟]\s*/, '').trim();
      currentTest = null;
      currentSteps = [];
      currentExpectedResult = [];
      inSteps = false;
      inExpectedResult = false;
    }
    // Detektiraj test slučaj (### Test X.Y:)
    else if (line.match(/^### Test \d+\.\d+:/)) {
      // Spremi prethodni test ako postoji
      if (currentTest && currentCategory) {
        if (!plans.find(p => p.category === currentCategory)) {
          plans.push({
            category: currentCategory,
            name: currentCategory,
            description: `Test plan za ${currentCategory}`,
            items: []
          });
        }
        const plan = plans.find(p => p.category === currentCategory);
        plan.items.push({
          title: currentTest,
          description: currentSteps.join('\n').trim() || null,
          expectedResult: currentExpectedResult.join('\n').trim() || null,
          dataVariations: { examples: [] }
        });
      }
      
      // Novi test - ukloni "Test X.Y:"
      currentTest = line.replace(/^### Test \d+\.\d+:\s*/, '').trim();
      currentSteps = [];
      currentExpectedResult = [];
      inSteps = false;
      inExpectedResult = false;
    }
    // Detektiraj "Koraci:" sekciju
    else if (line.startsWith('**Koraci:**') || line.startsWith('**Koraci**')) {
      inSteps = true;
      inExpectedResult = false;
    }
    // Detektiraj "Očekivani rezultat:" sekciju
    else if (line.startsWith('**Očekivani rezultat:**') || line.startsWith('**Očekivani rezultat**')) {
      inSteps = false;
      inExpectedResult = true;
    }
    // Dodaj u korake
    else if (inSteps && line && !line.startsWith('**') && !line.startsWith('---')) {
      // Ukloni markdown formatting i numeraciju
      let cleanLine = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      // Ukloni backticks
      cleanLine = cleanLine.replace(/`/g, '');
      if (cleanLine) {
        currentSteps.push(cleanLine);
      }
    }
    // Dodaj u očekivane rezultate
    else if (inExpectedResult && line && !line.startsWith('**') && !line.startsWith('---')) {
      // Ukloni markdown formatting
      let cleanLine = line.replace(/^-\s*✅\s*/, '').replace(/^-\s*/, '').replace(/\*\*/g, '').trim();
      // Ukloni backticks
      cleanLine = cleanLine.replace(/`/g, '');
      if (cleanLine) {
        currentExpectedResult.push(cleanLine);
      }
    }
  }
  
  // Spremi zadnji test
  if (currentTest && currentCategory) {
    if (!plans.find(p => p.category === currentCategory)) {
      plans.push({
        category: currentCategory,
        name: currentCategory,
        description: `Test plan za ${currentCategory}`,
        items: []
      });
    }
    const plan = plans.find(p => p.category === currentCategory);
    plan.items.push({
      title: currentTest,
      description: currentSteps.join('\n').trim() || null,
      expectedResult: currentExpectedResult.join('\n').trim() || null,
      dataVariations: { examples: [] }
    });
  }
  
  // Filtriraj planove koji imaju iteme
  return plans.filter(p => p.items && p.items.length > 0);
}

async function seedTestPlans() {
  console.log('🌱 Seeding test plans...\n');
  
  try {
    // 1. Obriši postojeće test planove
    console.log('🧹 Deleting existing test plans...');
    const deletedRunItems = await prisma.testRunItem.deleteMany({});
    const deletedRuns = await prisma.testRun.deleteMany({});
    const deletedItems = await prisma.testItem.deleteMany({});
    const deletedPlans = await prisma.testPlan.deleteMany({});
    console.log(`✅ Deleted: ${deletedPlans.count} plans, ${deletedItems.count} items, ${deletedRuns.count} runs, ${deletedRunItems.count} run items\n`);
    
    // 2. Učitaj markdown fajlove
    const frontendPath = join(__dirname, '../../TEST-PLAN-FRONTEND.md');
    const adminPath = join(__dirname, '../../TEST-PLAN-ADMIN.md');
    
    console.log('📖 Reading test plan files...');
    const frontendContent = readFileSync(frontendPath, 'utf-8');
    const adminContent = readFileSync(adminPath, 'utf-8');
    console.log('✅ Files read\n');
    
    // 3. Parsiraj markdown fajlove
    console.log('📝 Parsing test plans...');
    const frontendPlans = parseTestPlanMarkdown(frontendContent);
    const adminPlans = parseTestPlanMarkdown(adminContent);
    
    // Dodaj prefix za kategorije
    frontendPlans.forEach(plan => {
      plan.category = `Frontend - ${plan.category}`;
      plan.name = plan.category;
      plan.description = `Frontend test plan: ${plan.description}`;
    });
    
    adminPlans.forEach(plan => {
      plan.category = `Admin - ${plan.category}`;
      plan.name = plan.category;
      plan.description = `Admin test plan: ${plan.description}`;
    });
    
    const allPlans = [...frontendPlans, ...adminPlans];
    console.log(`✅ Parsed ${allPlans.length} test plans\n`);
    
    // 4. Kreiraj test planove u bazi
    console.log('💾 Creating test plans in database...');
    let totalPlans = 0;
    let totalItems = 0;
    
    for (const planData of allPlans) {
      if (!planData.items || planData.items.length === 0) {
        console.log(`⚠️  Skipping plan "${planData.name}" - no items`);
        continue;
      }
      
      const plan = await prisma.testPlan.create({
        data: {
          name: planData.name,
          description: planData.description || `Test plan za ${planData.category}`,
          category: planData.category,
          items: {
            create: planData.items.map((item, idx) => ({
              title: item.title,
              description: item.description || null,
              expectedResult: item.expectedResult || null,
              dataVariations: item.dataVariations || null,
              order: idx
            }))
          }
        },
        include: { items: true }
      });
      
      totalPlans++;
      totalItems += plan.items.length;
      console.log(`  ✅ Created plan: "${plan.name}" (${plan.items.length} items)`);
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`   - Created ${totalPlans} test plans`);
    console.log(`   - Created ${totalItems} test items`);
    
  } catch (error) {
    console.error('❌ Error seeding test plans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Pokreni seed
seedTestPlans()
  .then(() => {
    console.log('\n🎉 Test plans seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to seed test plans:', error);
    process.exit(1);
  });

