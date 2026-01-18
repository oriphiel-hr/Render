import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// Debug middleware - log all requests to testing router
r.use((req, res, next) => {
  console.log(`[TESTING ROUTER] ${req.method} ${req.path}`);
  next();
});

// Debug endpoint - test if router is working
r.get('/test', (req, res) => {
  res.json({ 
    message: 'Testing router is working!', 
    path: req.path, 
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// List all routes for debugging
r.get('/routes', (req, res) => {
  const routes = r.stack
    .map(layer => layer.route)
    .filter(Boolean)
    .map(route => ({
      path: route.path,
      methods: Object.keys(route.methods)
    }));
  res.json({ routes, total: routes.length });
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
    const { readFileSync, existsSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join, resolve } = await import('path');
    
    // Koristi __dirname za lokaciju trenutnog fajla (backend/src/routes ili /app/src/routes na Render)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Pronađi root projekta - idemo gore od backend/src/routes do root
    // backend/src/routes -> backend/src -> backend -> root
    const routesDir = __dirname; // backend/src/routes ili /app/src/routes
    const srcDir = dirname(routesDir); // backend/src ili /app/src
    const backendDir = dirname(srcDir); // backend ili /app (na Render)
    
    // Na Render serveru, process.cwd() je /app, ne root projekta
    // Koristi process.cwd() kao fallback za working directory
    const workingDir = process.cwd(); // /app na Render, ili backend/ lokalno
    
    // Provjeri više mogućih lokacija (prioritetni redoslijed)
    // Prvo provjeri u working directory (/app na Render), zatim backend dir, zatim root
    const possibleFrontendPaths = [
      join(workingDir, 'TEST-PLAN-FRONTEND.md'),            // /app/TEST-PLAN-FRONTEND.md (Render) ili backend/TEST-PLAN-FRONTEND.md (lokalno)
      join(backendDir, 'TEST-PLAN-FRONTEND.md'),            // /app/TEST-PLAN-FRONTEND.md ili backend/TEST-PLAN-FRONTEND.md
      join(workingDir, '..', 'TEST-PLAN-FRONTEND.md'),      // ../TEST-PLAN-FRONTEND.md (root projekta)
      join(backendDir, '..', 'TEST-PLAN-FRONTEND.md'),       // /TEST-PLAN-FRONTEND.md (ako backendDir je /app, ovo će biti /)
      resolve(__dirname, '..', '..', '..', 'TEST-PLAN-FRONTEND.md'), // 3 nivoa gore od routes
      resolve(__dirname, '..', '..', 'TEST-PLAN-FRONTEND.md'),       // 2 nivoa gore od routes (backend dir)
    ];
    
    const possibleAdminPaths = [
      join(workingDir, 'TEST-PLAN-ADMIN.md'),               // /app/TEST-PLAN-ADMIN.md (Render) ili backend/TEST-PLAN-ADMIN.md (lokalno)
      join(backendDir, 'TEST-PLAN-ADMIN.md'),              // /app/TEST-PLAN-ADMIN.md ili backend/TEST-PLAN-ADMIN.md
      join(workingDir, '..', 'TEST-PLAN-ADMIN.md'),         // ../TEST-PLAN-ADMIN.md (root projekta)
      join(backendDir, '..', 'TEST-PLAN-ADMIN.md'),        // /TEST-PLAN-ADMIN.md (ako backendDir je /app)
      resolve(__dirname, '..', '..', '..', 'TEST-PLAN-ADMIN.md'),   // 3 nivoa gore od routes
      resolve(__dirname, '..', '..', 'TEST-PLAN-ADMIN.md'),         // 2 nivoa gore od routes (backend dir)
    ];
    
    // Pronađi frontend datoteku
    let frontendPath = null;
    for (const path of possibleFrontendPaths) {
      if (existsSync(path)) {
        frontendPath = path;
        break;
      }
    }
    
    // Pronađi admin datoteku
    let adminPath = null;
    for (const path of possibleAdminPaths) {
      if (existsSync(path)) {
        adminPath = path;
        break;
      }
    }
    
    console.log('[TESTING SEED] Reading markdown files...');
    console.log('[TESTING SEED] __dirname:', __dirname);
    console.log('[TESTING SEED] backendDir:', backendDir);
    console.log('[TESTING SEED] workingDir (process.cwd()):', workingDir);
    console.log('[TESTING SEED] Frontend path:', frontendPath);
    console.log('[TESTING SEED] Admin path:', adminPath);
    console.log('[TESTING SEED] Frontend exists:', frontendPath ? existsSync(frontendPath) : false);
    console.log('[TESTING SEED] Admin exists:', adminPath ? existsSync(adminPath) : false);
    
    // Debug: ispiši sve provjerene putanje
    console.log('[TESTING SEED] Checked frontend paths:');
    possibleFrontendPaths.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p} - ${existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`);
    });
    console.log('[TESTING SEED] Checked admin paths:');
    possibleAdminPaths.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p} - ${existsSync(p) ? 'EXISTS' : 'NOT FOUND'}`);
    });
    
    let frontendContent, adminContent;
    try {
      if (!frontendPath || !existsSync(frontendPath)) {
        throw new Error(`Frontend test plan file not found. Checked paths: ${possibleFrontendPaths.join(', ')}`);
      }
      if (!adminPath || !existsSync(adminPath)) {
        throw new Error(`Admin test plan file not found. Checked paths: ${possibleAdminPaths.join(', ')}`);
      }
      
      frontendContent = readFileSync(frontendPath, 'utf-8');
      adminContent = readFileSync(adminPath, 'utf-8');
      
      console.log('[TESTING SEED] Files read successfully');
      console.log('[TESTING SEED] Frontend content length:', frontendContent.length);
      console.log('[TESTING SEED] Admin content length:', adminContent.length);
    } catch (fileError) {
      console.error('[TESTING SEED] Error reading files:', fileError);
      return res.status(404).json({ 
        error: 'Test plan markdown files not found',
        details: fileError.message,
        debug: {
          __dirname,
          backendDir,
          projectRoot,
          processCwd: process.cwd(),
          frontendPath,
          adminPath,
          frontendExists: frontendPath ? existsSync(frontendPath) : false,
          adminExists: adminPath ? existsSync(adminPath) : false,
          checkedPaths: {
            frontend: possibleFrontendPaths,
            admin: possibleAdminPaths
          }
        }
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
        
        // Detektiraj kategoriju (## 1️⃣, ## 2️⃣, itd. ili ## 🔟) ili (## Kategorija X: ili ## Kategorija:)
        if (line.match(/^## \d+[️⃣🔟]/) || line.match(/^## [1-9]0?[️⃣🔟]/) || 
            line.match(/^## Kategorija\s+\d+:/) || line.match(/^## Kategorija:/)) {
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
          
          // Nova kategorija - ukloni emoji, brojeve i "Kategorija X:" ili "Kategorija:"
          currentCategory = line
            .replace(/^## \d+[️⃣🔟]\s*/, '')
            .replace(/^## [1-9]0?[️⃣🔟]\s*/, '')
            .replace(/^## Kategorija\s+\d+:\s*/, '')
            .replace(/^## Kategorija:\s*/, '')
            .trim();
          currentTest = null;
          currentSteps = [];
          currentExpectedResult = [];
          inSteps = false;
          inExpectedResult = false;
        }
        // Detektiraj test slučaj (### Test X.Y: ili #### Test X: ili #### Test:)
        else if (line.match(/^### Test \d+\.\d+:/) || line.match(/^#### Test\s+\d+:/) || line.match(/^#### Test:/)) {
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
          
          // Novi test - ukloni "Test X.Y:" ili "Test X:" ili "Test:"
          currentTest = line
            .replace(/^### Test \d+\.\d+:\s*/, '')
            .replace(/^#### Test\s+\d+:\s*/, '')
            .replace(/^#### Test:\s*/, '')
            .trim();
          currentSteps = [];
          currentExpectedResult = [];
          inSteps = false;
          inExpectedResult = false;
        }
        // Detektiraj "Opis:" sekciju (ignoriraj, ali resetiraj korake i rezultate)
        else if (line.startsWith('**Opis:**') || line.startsWith('**Opis**')) {
          // Opis se ne koristi u test planu, ali resetiraj stanje
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
    console.log('[TESTING SEED] Frontend content length:', frontendContent.length, 'chars');
    console.log('[TESTING SEED] Admin content length:', adminContent.length, 'chars');
    
    const frontendPlans = parseTestPlanMarkdown(frontendContent);
    const adminPlans = parseTestPlanMarkdown(adminContent);
    
    console.log('[TESTING SEED] Frontend plans found:', frontendPlans.length);
    frontendPlans.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.category} - ${p.items?.length || 0} items`);
    });
    console.log('[TESTING SEED] Admin plans found:', adminPlans.length);
    adminPlans.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.category} - ${p.items?.length || 0} items`);
    });
    
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
    
    // Generiraj plan "Sve domene - E2E" kombiniranjem SVIH test itema iz svih planova
    // Umjesto hardcodiranog preset-a, koristimo stvarne test iteme iz dokumentacije
    const allTestItems = [];
    allPlans.forEach(plan => {
      if (plan.items && plan.items.length > 0) {
        // Dodaj prefix kategorije svakom itemu da se zna iz koje domene dolazi
        plan.items.forEach(item => {
          allTestItems.push({
            ...item,
            title: item.title, // Title već sadrži dovoljno informacija
            // Opcionalno: dodaj prefix kategorije ako želiš
            // title: `[${plan.category}] ${item.title}`
          });
        });
      }
    });
    
    console.log(`[TESTING SEED] Combined ${allTestItems.length} test items from all plans for "Sve domene - E2E"`);
    
    // Također dodaj hardcodiran preset plan za brzi E2E test (48 sažetih itema)
    const presetTestItems = [
      // AUTH
      { title: 'Registracija korisnika usluge (osoba)', description: 'Registracija bez pravnog statusa', expectedResult: 'Uspješna registracija bez polja za tvrtku', dataVariations: { examples: ['ispravan email', 'neispravan email', 'slaba lozinka', 'duplikat email'] } },
      { title: 'Registracija korisnika usluge (tvrtka/obrt)', description: 'Registracija s pravnim statusom', expectedResult: 'Obavezni: pravni status ≠ INDIVIDUAL, OIB, (osim FREELANCER) naziv tvrtke', dataVariations: { examples: ['FREELANCER bez naziva tvrtke (dozvoljeno)', 'DOO bez naziva (greška)', 'neispravan OIB (greška)', 'ispravan OIB (prolazi)'] } },
      { title: 'Verifikacija emaila', description: 'Otvaranje linka za verifikaciju', expectedResult: 'Korisnik označen kao verified', dataVariations: { examples: ['link vrijedi', 'istekao link'] } },
      { title: 'Prijava i odjava', description: 'Login s ispravnim/neispr. podacima', expectedResult: 'Ispravno: prijava, Neispravno: greška', dataVariations: { examples: ['kriva lozinka', 'nepostojeći email'] } },
      { title: 'Zaboravljena lozinka i reset', description: 'Slanje emaila i promjena lozinke', expectedResult: 'Reset token radi, lozinka promijenjena', dataVariations: { examples: ['token nevažeći', 'token istekao'] } },
      // ONBOARDING
      { title: 'Nadogradnja na providera', description: 'Odabir pravnog statusa i OIB', expectedResult: 'INDIVIDUAL nije dopušten; OIB obavezan; validacija', dataVariations: { examples: ['FREELANCER bez naziva (prolazi)', 'DOO bez naziva (greška)', 'neispravan OIB', 'ispravan OIB'] } },
      { title: 'Profil providera', description: 'Popunjavanje i kategorije', expectedResult: 'Maks 5 kategorija', dataVariations: { examples: ['0 kategorija', '5 kategorija', '6 kategorija (blok)'] } },
      { title: 'Portfolio slike', description: 'Upload više slika', expectedResult: 'Slike vidljive i spremljene', dataVariations: { examples: ['bez slika', 'više slika'] } },
      // KYC
      { title: 'KYC: Upload dokumenta', description: 'PDF/JPG/PNG + consent', expectedResult: 'Status pending/verified', dataVariations: { examples: ['bez consent (greška)', 'nepodržan format', 'validan PDF'] } },
      { title: 'KYC: Ekstrakcija OIB-a', description: 'Uparen s profilom', expectedResult: 'OIB match => verified', dataVariations: { examples: ['mismatch (review)', 'match (verified)'] } },
      // JOBS
      { title: 'Objava posla', description: 'Kreiranje sa/bez slika', expectedResult: 'Posao vidljiv na listi', dataVariations: { examples: ['bez slika', 'više slika', 's budžetom', 'bez budžeta'] } },
      { title: 'Filtri i pretraga posla', description: 'Kategorija/grad/budžet', expectedResult: 'Lista filtrirana', dataVariations: { examples: ['bez rezultata', 'više rezultata'] } },
      { title: 'Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)', description: 'Ažuriranje statusa posla', expectedResult: 'Status ažuriran, notifikacija poslana', dataVariations: { examples: ['OTVOREN', 'U TIJEKU', 'ZAVRŠEN', 'OTKAZAN'] } },
      { title: 'Pregled detalja posla', description: 'Svi podaci o poslu vidljivi', expectedResult: 'Detalji prikazani (opis, slike, budžet, status)', dataVariations: { examples: ['kompletan posao', 'posao bez slika', 'posao u statusu ZAVRŠEN'] } },
      { title: 'Uređivanje posla', description: 'Promjena podataka o poslu', expectedResult: 'Posao ažuriran, promjene vidljive', dataVariations: { examples: ['promjena budžeta', 'promjena opisa', 'dodavanje slika'] } },
      // LEADS
      { title: 'Dostupni leadovi', description: 'Provider pregleda leadove', expectedResult: 'Lista s filterima', dataVariations: { examples: ['grad', 'kategorija', 'min/max budžet'] } },
      { title: 'Kupnja ekskluzivnog leada', description: 'Dedukcija kredita', expectedResult: 'Lead u Mojim leadovima', dataVariations: { examples: ['dovoljno kredita', 'nedovoljno (greška)'] } },
      { title: 'Ponuda na posao', description: 'Slanje ponude', expectedResult: 'Ponuda spremljena, notifikacija klijentu', dataVariations: { examples: ['cijena + pregovaranje', 'procijenjeni dani', 'insufficient credits'] } },
      { title: 'ROI statusi', description: 'Kontaktiran/konvertiran/refund', expectedResult: 'Statusevi i ROI se ažuriraju', dataVariations: { examples: ['kontaktiran', 'konvertiran', 'refund'] } },
      // CHAT
      { title: 'Chat: slanje poruke', description: 'Korisnik ↔ Provider', expectedResult: 'Poruka vidljiva', dataVariations: { examples: ['više poruka', 'prazna poruka (blok)'] } },
      { title: 'Notifikacije', description: 'Prikaz i označavanje pročitanim', expectedResult: 'Nove notifikacije vidljive', dataVariations: { examples: ['ponuda primljena', 'ponuda prihvaćena'] } },
      // SUBS
      { title: 'Pretplata: odabir plana', description: 'BASIC/PREMIUM/PRO', expectedResult: 'Plan odabran, krediti dodijeljeni', dataVariations: { examples: ['najpopularniji plan', 'skriven plan'] } },
      { title: 'Plaćanje', description: 'Simulacija uspjeh/neuspjeh', expectedResult: 'Uspjeh: aktivna, neuspjeh: bez promjene', dataVariations: { examples: ['success', 'fail', 'retry'] } },
      // REVIEWS
      { title: 'Ocjenjivanje providera (1-5 zvjezdica)', description: 'Ocjena nakon završenog posla', expectedResult: 'Ocjena prikazana na profilu, prosjek ažuriran', dataVariations: { examples: ['1 zvjezdica', '5 zvjezdica', 'duplikat ocjene (blok)'] } },
      { title: 'Komentiranje iskustva', description: 'Pisanje recenzije uz ocjenu', expectedResult: 'Recenzija vidljiva na profilu', dataVariations: { examples: ['pozitivna recenzija', 'negativna recenzija', 'recenzija s editovanjem'] } },
      { title: 'Bilateralno ocjenjivanje', description: 'Korisnik ↔ Provider', expectedResult: 'Obe strane mogu ocijeniti jedna drugu', dataVariations: { examples: ['obje strane ocijenile', 'jedna strana nije ocijenila'] } },
      { title: 'Uređivanje recenzija', description: 'Promjena ocjene ili komentara', expectedResult: 'Recenzija ažurirana, oznaka "uređeno"', dataVariations: { examples: ['promjena ocjene', 'promjena komentara', 'brisanje recenzije'] } },
      // PROFILES
      { title: 'Detaljni profil providera', description: 'Prikaz svih informacija o provideru', expectedResult: 'Sve sekcije vidljive (biografija, portfolio, recenzije)', dataVariations: { examples: ['kompletan profil', 'nepotpun profil', 'verificiran profil'] } },
      { title: 'Portfolio upload', description: 'Upload slika radova', expectedResult: 'Slike vidljive u portfoliju', dataVariations: { examples: ['više slika', 'jedna slika', 'nema slika'] } },
      { title: 'Specijalizacije', description: 'Odabir područja rada', expectedResult: 'Specijalizacije prikazane na profilu', dataVariations: { examples: ['jedna specijalizacija', 'više specijalizacija'] } },
      { title: 'Godine iskustva', description: 'Unos godina rada', expectedResult: 'Iskustvo prikazano na profilu', dataVariations: { examples: ['0-2 godine', '5+ godina'] } },
      // QUEUE
      { title: 'Red čekanja za leadove', description: 'Pozicija u redu za kategoriju', expectedResult: 'Pozicija prikazana u dashboardu', dataVariations: { examples: ['pozicija #1', 'pozicija #10', 'nema pozicije'] } },
      { title: 'Automatska distribucija leadova', description: 'Lead dodijeljen provideru', expectedResult: 'Lead u Mojim leadovima', dataVariations: { examples: ['lead prihvaćen', 'lead odbijen', 'lead istekao'] } },
      { title: 'Rok za odgovor (24h)', description: 'Vrijeme za reagiranje na lead', expectedResult: 'Lead vraćen ako nema odgovora', dataVariations: { examples: ['odgovor u roku', 'odgovor nakon roka', 'nema odgovora'] } },
      { title: 'Statusi u redu', description: 'WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED', expectedResult: 'Status ažuriran kroz proces', dataVariations: { examples: ['WAITING', 'ACCEPTED', 'EXPIRED'] } },
      // REFUND
      { title: 'Refund kredita', description: 'Vraćanje internih kredita', expectedResult: 'Krediti vraćeni na račun', dataVariations: { examples: ['automatski refund', 'ručni refund'] } },
      { title: 'Stripe refund', description: 'Vraćanje na karticu', expectedResult: 'Novac vraćen na karticu', dataVariations: { examples: ['uspješan refund', 'neuspješan refund (fallback)'] } },
      { title: 'Refund ako klijent ne odgovori', description: 'Automatski refund nakon 48h', expectedResult: 'Lead refundiran, vraćen na tržište', dataVariations: { examples: ['refund zbog NO_RESPONSE', 'refund zbog EXPIRED'] } },
      { title: 'Povijest refund transakcija', description: 'Prikaz svih refundova', expectedResult: 'Lista refundova s detaljima', dataVariations: { examples: ['refund kredita', 'refund kartice'] } },
      // LICENSES
      { title: 'Upload licence', description: 'PDF/JPG/PNG dokument', expectedResult: 'Dokument uploadan, status pending', dataVariations: { examples: ['validan PDF', 'nepodržan format', 'prevelika datoteka'] } },
      { title: 'Verifikacija licence', description: 'Admin odobrenje', expectedResult: 'Licenca verified, badge prikazan', dataVariations: { examples: ['verified', 'rejected', 'pending'] } },
      { title: 'Praćenje isteka licenci', description: 'Notifikacije prije isteka', expectedResult: 'Upozorenje 30/14/7/1 dan prije', dataVariations: { examples: ['licenca istekla', 'licenca važeća', 'licenca uskoro ističe'] } },
      { title: 'Tipovi licenci po kategorijama', description: 'Elektrotehnička, Građevinska, itd.', expectedResult: 'Licenca vezana za kategoriju', dataVariations: { examples: ['elektrotehnička', 'građevinska', 'nije potrebna'] } },
      // REPUTATION
      { title: 'Reputacijski bodovi', description: 'Izračun bodova na osnovu aktivnosti', expectedResult: 'Bodovi prikazani na profilu', dataVariations: { examples: ['visoki bodovi', 'niski bodovi', 'novi korisnik'] } },
      { title: 'Identity badges', description: 'Verifikacijski badgevi', expectedResult: 'Badgeovi prikazani na profilu', dataVariations: { examples: ['email verified', 'phone verified', 'license verified', 'KYC verified'] } },
      { title: 'Trust score', description: 'Ocjena povjerenja', expectedResult: 'Trust score izračunat i prikazan', dataVariations: { examples: ['visok trust score', 'nizak trust score'] } },
      // ADMIN
      { title: 'Admin: odobrenja providera', description: 'Approve/Reject/Inactive', expectedResult: 'Status ažuriran + notifikacija', dataVariations: { examples: ['APPROVED', 'REJECTED', 'INACTIVE'] } },
      { title: 'Admin: KYC metrike', description: 'Provjera brojeva/vremena', expectedResult: 'Metrike vraćaju vrijednosti', dataVariations: { examples: ['bez verifikacija', 'više verificiranih'] } },
    ];
    
    // Dodaj DVA plana:
    // 1. "Sve domene - E2E (Detaljno)" - svi test itemi iz dokumentacije
    allPlans.push({
      category: 'ALL',
      name: 'Sve domene - E2E (Detaljno)',
      description: 'Svi testovi iz dokumentacije - kompletno pokrivanje svih funkcionalnosti',
      items: allTestItems
    });
    
    // 2. "Sve domene - E2E (Sažetak)" - sažeti preset plan (48 itema)
    allPlans.push({
      category: 'ALL',
      name: 'Sve domene - E2E (Sažetak)',
      description: 'Sažeti E2E test plan - najvažniji testovi svake domene',
      items: presetTestItems
    });
    
    console.log(`[TESTING SEED] Added "Sve domene - E2E (Detaljno)" plan with ${allTestItems.length} items`);
    console.log(`[TESTING SEED] Added "Sve domene - E2E (Sažetak)" plan with ${presetTestItems.length} items`);
    console.log(`[TESTING SEED] Total plans: ${allPlans.length} (${allPlans.length - 2} from markdown + 2 E2E plans)`);
    
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
    
    const totalItemsCount = plans.reduce((sum, p) => sum + (p.items?.length || 0), 0);
    
    console.log(`[TESTING SEED] ✅ Seeding complete! ${plans.length} plans, ${totalItemsCount} items`);
    console.log(`[TESTING SEED] Plans created:`);
    plans.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.name} (${p.items?.length || 0} items)`);
    });
    
    res.json({ 
      success: true, 
      message: `Test plans seeded successfully! Kreirano ${plans.length} planova, ${totalItemsCount} test itema`,
      plansCount: plans.length,
      totalItems: totalItemsCount,
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

// GET /api/testing/test-data - Dohvati test podatke
r.get('/test-data', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    console.log('[TEST DATA] GET /test-data endpoint called');
    const { readFileSync, existsSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Pronađi putanju do test-data.json - provjeri više mogućih lokacija
    const routesDir = __dirname; // backend/src/routes
    const srcDir = dirname(routesDir); // backend/src
    const backendDir = dirname(srcDir); // backend
    const projectRoot = dirname(backendDir); // root projekta
    
    const possiblePaths = [
      join(projectRoot, 'tests', 'test-data.json'),
      join(backendDir, '..', 'tests', 'test-data.json'),
      join(projectRoot, 'test-data.json')
    ];
    
    console.log('[TEST DATA] Searching for test-data.json in:', possiblePaths);
    
    let testDataPath = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        testDataPath = path;
        console.log('[TEST DATA] Found test-data.json at:', path);
        break;
      }
    }
    
    if (testDataPath) {
      try {
        const data = readFileSync(testDataPath, 'utf-8');
        const testData = JSON.parse(data);
        console.log('[TEST DATA] Successfully loaded test data');
        return res.json(testData);
      } catch (fileError) {
        console.error('[TEST DATA] Error reading file:', fileError);
        // Nastavi s default strukturom
      }
    } else {
      console.warn('[TEST DATA] test-data.json not found, using default structure');
    }
    
    // Ako fajl ne postoji ili ima grešku, vrati default strukturu
    const defaultData = {
      users: {},
      documents: {},
      email: {
        imap: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true,
          user: '',
          password: ''
        },
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: '',
          password: ''
        },
        testService: {
          type: 'mailtrap',
          apiKey: '',
          inboxId: '0',
          baseUrl: 'https://mailtrap.io'
        }
      },
      api: {
        baseUrl: process.env.API_URL || 'https://api.uslugar.eu',
        frontendUrl: process.env.FRONTEND_URL || 'https://www.uslugar.eu',
        timeout: 30000,
        waitForNavigation: 3000
      },
      assertions: {}
    };
    
    console.log('[TEST DATA] Returning default structure');
    return res.json(defaultData);
  } catch (e) {
    console.error('[TEST DATA] Error in GET /test-data:', e);
    next(e);
  }
});

// POST /api/testing/test-data - Spremi test podatke
r.post('/test-data', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { writeFileSync, mkdirSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const routesDir = __dirname;
    const srcDir = dirname(routesDir);
    const backendDir = dirname(srcDir);
    const projectRoot = dirname(backendDir);
    
    const testsDir = join(projectRoot, 'tests');
    const testDataPath = join(testsDir, 'test-data.json');
    
    // Kreiraj tests direktorij ako ne postoji
    try {
      mkdirSync(testsDir, { recursive: true });
    } catch (e) {
      // Direktorij već postoji ili nema prava
    }
    
    // Spremi test podatke
    writeFileSync(testDataPath, JSON.stringify(req.body, null, 2), 'utf-8');
    
    res.json({ success: true, message: 'Test podaci spremljeni' });
  } catch (e) {
    next(e);
  }
});

// POST /api/testing/test-data/upload-document - Upload test dokumenta
r.post('/test-data/upload-document', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { uploadDocument, getImageUrl } = await import('../lib/upload.js');
    
    // Middleware za upload
    uploadDocument.single('document')(req, res, async (err) => {
      if (err) {
        return next(err);
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No document uploaded' });
      }
      
      const documentUrl = getImageUrl(req, req.file.filename);
      
      // Spremi informacije o dokumentu u test-data.json
      try {
        const { readFileSync, writeFileSync, mkdirSync } = await import('fs');
        const { fileURLToPath } = await import('url');
        const { dirname, join } = await import('path');
        
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const routesDir = __dirname;
        const srcDir = dirname(routesDir);
        const backendDir = dirname(srcDir);
        const projectRoot = dirname(backendDir);
        const testsDir = join(projectRoot, 'tests');
        const testDataPath = join(testsDir, 'test-data.json');
        
        let testData = {};
        try {
          const data = readFileSync(testDataPath, 'utf-8');
          testData = JSON.parse(data);
        } catch (e) {
          // Fajl ne postoji, kreiraj default strukturu
        }
        
        if (!testData.documents) {
          testData.documents = {};
        }
        
        const documentKey = req.body.key || req.file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
        
        testData.documents[documentKey] = {
          path: documentUrl,
          url: documentUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
          description: req.body.description || `Uploaded test document: ${req.file.originalname}`,
          uploadedAt: new Date().toISOString()
        };
        
        try {
          mkdirSync(testsDir, { recursive: true });
        } catch (e) {
          // Direktorij već postoji
        }
        
        writeFileSync(testDataPath, JSON.stringify(testData, null, 2), 'utf-8');
        
        res.json({
          success: true,
          document: testData.documents[documentKey],
          message: 'Dokument uploadan i spremljen u test podatke'
        });
      } catch (fileError) {
        // Dokument je uploadan ali nije spremljen u test-data.json
        res.json({
          success: true,
          document: {
            url: documentUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size
          },
          warning: 'Dokument uploadan ali nije spremljen u test-data.json',
          error: fileError.message
        });
      }
    });
  } catch (e) {
    next(e);
  }
});

// Validacija test podataka
async function validateTestData() {
  const { readFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const routesDir = __dirname;
  const srcDir = dirname(routesDir);
  const backendDir = dirname(srcDir);
  const projectRoot = dirname(backendDir);
  const testDataPath = join(projectRoot, 'tests', 'test-data.json');
  
  let testData;
  try {
    const data = readFileSync(testDataPath, 'utf-8');
    testData = JSON.parse(data);
  } catch (e) {
    return { valid: false, error: 'Test podaci nisu pronađeni. Molimo konfigurirajte test podatke u admin panelu.' };
  }
  
  const errors = [];
  
  console.log('[VALIDATE TEST DATA] Validating users:', testData.users ? Object.keys(testData.users) : 'none');
  
  // Provjeri korisnike
  if (!testData.users || Object.keys(testData.users).length === 0) {
    errors.push('Nema konfiguriranih test korisnika');
  } else {
    const requiredUsers = ['client', 'provider'];
    for (const userKey of requiredUsers) {
      const user = testData.users[userKey];
      if (!user) {
        errors.push(`Nedostaje korisnik: ${userKey}`);
      } else {
        if (!user.email || !user.email.includes('@')) {
          errors.push(`${userKey}: Email nije ispravan`);
        }
        if (!user.password || user.password.length < 6) {
          errors.push(`${userKey}: Lozinka mora imati najmanje 6 znakova`);
        }
        if (userKey !== 'admin' && !user.fullName) {
          errors.push(`${userKey}: Ime je obavezno`);
        }
        if (userKey !== 'admin' && !user.phone) {
          errors.push(`${userKey}: Telefon je obavezan`);
        }
        if ((userKey === 'provider' || userKey === 'providerCompany') && !user.legalStatus) {
          errors.push(`${userKey}: Pravni status je obavezan`);
        }
        if ((userKey === 'provider' || userKey === 'providerCompany') && !user.oib) {
          errors.push(`${userKey}: OIB je obavezan`);
        }
      }
    }
  }
  
  // Provjeri email konfiguraciju (opcionalno - samo warning, ne blokira testove)
  // Email konfiguracija je potrebna samo za testove koji zahtijevaju email pristup (verifikacija, reset lozinke)
  // Ako nije postavljena, ti testovi će koristiti fallback (mock token)
  // Stoga ne dodajemo grešku, već samo upozorenje u logovima
  if (testData.email) {
    const hasTestService = testData.email.testService && testData.email.testService.apiKey;
    const hasIMAP = testData.email.imap && testData.email.imap.user && testData.email.imap.password;
    
    if (!hasTestService && !hasIMAP) {
      console.warn('[TEST DATA VALIDATION] Email konfiguracija postavljena ali nije potpuna - testovi koji zahtijevaju email koristit će fallback');
    }
  } else {
    console.warn('[TEST DATA VALIDATION] Email konfiguracija nije postavljena - testovi koji zahtijevaju email koristit će fallback');
  }
  
  // Provjeri API konfiguraciju
  if (!testData.api || !testData.api.baseUrl || !testData.api.frontendUrl) {
    errors.push('API konfiguracija nije potpuna (baseUrl i frontendUrl su obavezni)');
  } else {
    try {
      const baseUrl = new URL(testData.api.baseUrl);
      const frontendUrl = new URL(testData.api.frontendUrl);
    } catch (e) {
      errors.push('API URL-ovi nisu ispravni');
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, testData };
}

// POST /api/testing/run-automated - Pokreni automatske E2E testove
r.post('/run-automated', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { planId, testType = 'all', testName = null } = req.body;
    
    // Validiraj test podatke
    console.log('[AUTOMATED TESTS] Starting validation...');
    const validation = await validateTestData();
    console.log('[AUTOMATED TESTS] Validation result:', { valid: validation.valid, errors: validation.errors, error: validation.error });
    
    if (!validation.valid) {
      console.error('[AUTOMATED TESTS] Validation failed:', validation.errors || validation.error);
      const errorResponse = {
        error: 'Test podaci nisu ispravni',
        errors: Array.isArray(validation.errors) ? validation.errors : (validation.error ? [validation.error] : ['Nepoznata greška u validaciji']),
        message: 'Molimo konfigurirajte test podatke u admin panelu (tab "Test Podaci")',
        details: 'Provjerite da su svi korisnici (client, provider) konfigurirani s email-om, lozinkom, imenom i telefonom. Provider mora imati i OIB i pravni status.'
      };
      console.error('[AUTOMATED TESTS] Sending error response:', errorResponse);
      return res.status(400).json(errorResponse);
    }
    
    console.log('[AUTOMATED TESTS] Test data validation passed');
    
    // Provjeri da li postoji Playwright
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      // Provjeri da li je Playwright instaliran
      await execAsync('npx playwright --version');
    } catch (error) {
      return res.status(400).json({ 
        error: 'Playwright nije instaliran',
        message: 'Instaliraj Playwright: cd tests && npm install && npx playwright install'
      });
    }
    
    // Pokreni testove
    let command = 'cd tests && npx playwright test';
    
    if (testName) {
      // Pokreni specifičan test po imenu
      // Format: "test-name" ili "file.spec.js:test-name"
      if (testName.includes(':')) {
        command = `cd tests && npx playwright test ${testName}`;
      } else {
        // Pronađi test u svim spec fajlovima
        command = `cd tests && npx playwright test --grep "${testName}"`;
      }
    } else if (planId) {
      // Pokreni testove za specifičan plan
      const plan = await prisma.testPlan.findUnique({
        where: { id: planId },
        include: { items: true }
      });
      
      if (!plan) {
        return res.status(404).json({ error: 'Plan nije pronađen' });
      }
      
      // Mapiraj plan na test spec file
      if (plan.category === 'ALL' || plan.name.includes('E2E')) {
        command = 'cd tests && npx playwright test e2e/all-domains.spec.js';
      } else if (plan.category?.includes('Auth') || plan.category?.includes('AUTH')) {
        command = 'cd tests && npx playwright test e2e/auth.spec.js';
      } else if (plan.category?.includes('KYC')) {
        command = 'cd tests && npx playwright test e2e/kyc.spec.js';
      } else if (plan.category?.includes('Jobs') || plan.category?.includes('JOBS')) {
        command = 'cd tests && npx playwright test e2e/jobs.spec.js';
      }
    } else if (testType === 'all') {
      command = 'cd tests && npx playwright test';
    }
    
    // Dodaj opcije za screenshotove
    command += ' --reporter=html,json --output=test-results';
    
    // Pokreni testove asinkrono (da ne blokira request)
    execAsync(command)
      .then(({ stdout, stderr }) => {
        console.log('[AUTOMATED TESTS] Test execution completed');
        console.log('[AUTOMATED TESTS] stdout:', stdout);
        if (stderr) console.error('[AUTOMATED TESTS] stderr:', stderr);
      })
      .catch((error) => {
        console.error('[AUTOMATED TESTS] Error:', error);
      });
    
    // Vrati odgovor odmah (testovi se izvršavaju u pozadini)
    res.json({ 
      success: true, 
      message: 'Automatski testovi pokrenuti u pozadini',
      command: command,
      note: 'Provjeri server logs za rezultate testova. Screenshotovi će biti automatski snimljeni.'
    });
  } catch (e) {
    console.error('[AUTOMATED TESTS] Error:', e);
    next(e);
  }
});

export default r;

