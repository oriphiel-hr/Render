import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// Debug middleware - log all requests to testing router
r.use((req, res, next) => {
  console.log(`[TESTING ROUTER] ${req.method} ${req.path}`);
  next();
});

// ===== Test Plans =====
r.get('/plans', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const plans = await prisma.testPlan.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(plans);
  } catch (e) {
    console.error('[TESTING] Error in GET /plans:', e);
    next(e);
  }
});

// POST /api/testing/seed - Seed test plans from markdown files
// Using /seed instead of /plans/seed to avoid route conflict with /plans/:planId
r.post('/seed', auth(true, ['ADMIN']), async (req, res, next) => {
  console.log('[TESTING SEED] Endpoint called');
  try {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Učitaj markdown fajlove - fajlovi su u uslugar/ direktoriju
    const frontendPath = join(__dirname, '../../../TEST-PLAN-FRONTEND.md');
    const adminPath = join(__dirname, '../../../TEST-PLAN-ADMIN.md');
    
    console.log('[TESTING SEED] Reading markdown files...');
    console.log('[TESTING SEED] Frontend path:', frontendPath);
    console.log('[TESTING SEED] Admin path:', adminPath);
    
    let frontendContent, adminContent;
    try {
      frontendContent = readFileSync(frontendPath, 'utf-8');
      adminContent = readFileSync(adminPath, 'utf-8');
    } catch (fileError) {
      console.error('[TESTING SEED] Error reading files:', fileError);
      return res.status(404).json({ 
        error: 'Test plan markdown files not found',
        details: fileError.message,
        frontendPath,
        adminPath
      });
    }
    
    // Parsiraj markdown fajlove
    const parseTestPlanMarkdown = (markdownContent) => {
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
    };
    
    console.log('[TESTING SEED] Parsing markdown files...');
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
    console.log(`[TESTING SEED] Parsed ${allPlans.length} test plans`);
    
    // 1. Obriši postojeće test planove
    console.log('[TESTING SEED] Deleting existing test plans...');
    await prisma.testRunItem.deleteMany({});
    await prisma.testRun.deleteMany({});
    await prisma.testItem.deleteMany({});
    await prisma.testPlan.deleteMany({});
    console.log('[TESTING SEED] Existing plans deleted');
    
    // 2. Kreiraj test planove u bazi
    console.log('[TESTING SEED] Creating test plans in database...');
    let totalPlans = 0;
    let totalItems = 0;
    
    for (const planData of allPlans) {
      if (!planData.items || planData.items.length === 0) {
        console.log(`[TESTING SEED] Skipping plan "${planData.name}" - no items`);
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
      console.log(`[TESTING SEED] Created plan: "${plan.name}" (${plan.items.length} items)`);
    }
    
    console.log(`[TESTING SEED] Seeding complete! ${totalPlans} plans, ${totalItems} items`);
    
    // Dohvati kreirane planove
    const plans = await prisma.testPlan.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      message: 'Test plans seeded successfully',
      plansCount: plans.length,
      totalItems: plans.reduce((sum, p) => sum + (p.items?.length || 0), 0),
      plans: plans.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        itemsCount: p.items?.length || 0
      }))
    });
  } catch (e) {
    console.error('[TESTING SEED] Error:', e);
    next(e);
  }
});

r.post('/plans', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { name, description, category, items = [] } = req.body || {};
    
    // Validacija: name je obavezno polje
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Naziv plana je obavezan' });
    }
    
    // Filtriraj iteme koji imaju title (title je obavezno polje)
    const validItems = items
      .filter(it => it.title && typeof it.title === 'string' && it.title.trim().length > 0)
      .map((it, idx) => ({
        title: it.title.trim(),
        description: it.description || null,
        expectedResult: it.expectedResult || null,
        dataVariations: it.dataVariations ?? null,
        order: it.order ?? idx
      }));
    
    const plan = await prisma.testPlan.create({
      data: {
        name: name.trim(),
        description: description || null,
        category: category || null,
        items: {
          create: validItems
        }
      },
      include: { items: true }
    });
    res.status(201).json(plan);
  } catch (e) {
    console.error('[TESTING] Error in POST /plans:', e);
    console.error('[TESTING] Error details:', {
      message: e.message,
      code: e.code,
      meta: e.meta
    });
    next(e);
  }
});

r.put('/plans/:planId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { name, description, category, items } = req.body || {};

    const updates = {};
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Naziv plana ne može biti prazan' });
      }
      updates.name = name.trim();
    }
    if (description !== undefined) updates.description = description || null;
    if (category !== undefined) updates.category = category || null;
    
    // Basic update for plan fields
    const updated = await prisma.testPlan.update({
      where: { id: planId },
      data: updates
    });

    // Optional items full replace if provided
    if (Array.isArray(items)) {
      // Filtriraj iteme koji imaju title (title je obavezno polje)
      const validItems = items
        .filter(it => it.title && typeof it.title === 'string' && it.title.trim().length > 0)
        .map((it, idx) => ({
          planId,
          title: it.title.trim(),
          description: it.description || null,
          expectedResult: it.expectedResult || null,
          dataVariations: it.dataVariations ?? null,
          order: it.order ?? idx
        }));
      
      // Delete existing, recreate (simpler sync)
      await prisma.testItem.deleteMany({ where: { planId } });
      if (validItems.length > 0) {
        await prisma.testItem.createMany({
          data: validItems
        });
      }
    }

    const full = await prisma.testPlan.findUnique({
      where: { id: planId },
      include: { items: { orderBy: { order: 'asc' } } }
    });
    res.json(full);
  } catch (e) { next(e); }
});

r.delete('/plans/:planId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { planId } = req.params;
    await prisma.testPlan.delete({ where: { id: planId } });
    res.json({ success: true });
  } catch (e) { next(e); }
});

// ===== Test Runs =====
r.get('/runs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const runs = await prisma.testRun.findMany({
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(runs);
  } catch (e) {
    console.error('[TESTING] Error in GET /runs:', e);
    next(e);
  }
});

r.get('/runs/:runId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { runId } = req.params;
    const run = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        plan: { include: { items: { orderBy: { order: 'asc' } } } },
        items: { include: { item: true } }
      }
    });
    if (!run) return res.status(404).json({ error: 'Not found' });
    res.json(run);
  } catch (e) {
    console.error('[TESTING] Error in GET /runs/:runId:', e);
    next(e);
  }
});

r.post('/runs', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const user = req.user;
    const { planId, name, notes } = req.body || {};
    const plan = await prisma.testPlan.findUnique({ where: { id: planId }, include: { items: true } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const run = await prisma.testRun.create({
      data: {
        planId,
        name: name || `${plan.name} - run` ,
        createdById: user?.id || null,
        status: 'IN_PROGRESS',
        notes: notes ?? null,
        items: {
          create: plan.items
            .sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
            .map(it => ({ itemId: it.id, status: 'PENDING', screenshots: [] }))
        }
      },
      include: {
        plan: { include: { items: { orderBy: { order: 'asc' } } } },
        items: { include: { item: true } }
      }
    });
    res.status(201).json(run);
  } catch (e) { next(e); }
});

r.patch('/runs/:runId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { runId } = req.params;
    const { status, notes, name } = req.body || {};
    const updated = await prisma.testRun.update({
      where: { id: runId },
      data: {
        status: status ?? undefined,
        notes: notes ?? undefined,
        name: name ?? undefined
      }
    });
    res.json(updated);
  } catch (e) { next(e); }
});

r.delete('/runs/:runId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { runId } = req.params;
    await prisma.testRun.delete({ where: { id: runId } });
    res.json({ success: true });
  } catch (e) {
    console.error('[TESTING] Error in DELETE /runs/:runId:', e);
    next(e);
  }
});

// Update a specific run item (status/comment/screenshots)
r.patch('/runs/:runId/items/:itemId', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { runId, itemId } = req.params;
    const { status, comment, addScreenshots = [], removeScreenshots = [] } = req.body || {};

    // Find run item
    const runItem = await prisma.testRunItem.findUnique({
      where: { runId_itemId: { runId, itemId } }
    }).catch(() => null);

    if (!runItem) {
      return res.status(404).json({ error: 'Run item not found' });
    }

    // Prepare screenshots
    let screenshots = runItem.screenshots || [];
    if (Array.isArray(addScreenshots) && addScreenshots.length) {
      screenshots = screenshots.concat(addScreenshots);
    }
    if (Array.isArray(removeScreenshots) && removeScreenshots.length) {
      screenshots = screenshots.filter(u => !removeScreenshots.includes(u));
    }

    const updated = await prisma.testRunItem.update({
      where: { id: runItem.id },
      data: {
        status: status ?? undefined,
        comment: comment ?? undefined,
        screenshots
      }
    });
    res.json(updated);
  } catch (e) { next(e); }
});

export default r;

