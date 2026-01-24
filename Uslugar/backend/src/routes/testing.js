/**
 * Testing API Routes
 * Omogućuje upravljanje checkpoint-ima i test podacima
 */

import { Router } from 'express';
import { testCheckpointService } from '../services/testCheckpointService.js';
import { testRunnerService } from '../services/testRunnerService.js';
import { mailtrapService } from '../services/mailtrapService.js';
import { prisma } from '../lib/prisma.js';

const r = Router();

/**
 * POST /api/testing/checkpoint/create
 * Kreiraj novi checkpoint
 * 
 * Body:
 *   {
 *     "name": "before_registration",
 *     "tables": ["User", "ProviderProfile", "Job"] // null = sve tablice
 *   }
 */
r.post('/checkpoint/create', async (req, res, next) => {
  try {
    const { name, tables } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nedostaje "name"' });
    }

    const checkpointId = await testCheckpointService.create(name, tables);
    
    res.json({
      success: true,
      checkpointId,
      message: `Checkpoint '${name}' kreiran`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/checkpoint/rollback
 * Vrati bazu na checkpoint
 * 
 * Body:
 *   {
 *     "checkpointId": "before_registration_1706354399999_abc123"
 *   }
 */
r.post('/checkpoint/rollback', async (req, res, next) => {
  try {
    const { checkpointId } = req.body;
    
    if (!checkpointId) {
      return res.status(400).json({ error: 'Nedostaje "checkpointId"' });
    }

    await testCheckpointService.rollback(checkpointId);
    
    res.json({
      success: true,
      message: `Rollback na checkpoint '${checkpointId}' uspješan`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/testing/checkpoint/:id
 * Obriši checkpoint
 */
r.delete('/checkpoint/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await testCheckpointService.delete(id);
    
    res.json({
      success: true,
      message: `Checkpoint '${id}' obrisan`
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/checkpoints
 * Prikazi sve checkpoint-e
 */
r.get('/checkpoints', async (req, res, next) => {
  try {
    const checkpoints = testCheckpointService.listCheckpoints();
    res.json({ checkpoints });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/test-data
 * Preuzmi test podatke
 */
r.get('/test-data', async (req, res, next) => {
  try {
    // Dohvati test podatke iz baze ili vrati default strukturu
    // Za sada vrati default strukturu
    const testData = {
      email: {
        testService: {
          type: 'mailtrap',
          apiKey: '',
          inboxId: '0',
          baseUrl: 'https://mailtrap.io'
        }
      },
      users: {
        client: {
          email: 'test.client@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Klijent',
          phone: '+385991111111',
          city: 'Zagreb',
          role: 'USER',
          mailtrap: {
            validData: { email: 'test.client@mailtrap.io', inboxId: '1111111' },
            invalidData: { email: 'test.client.invalid@mailtrap.io', inboxId: '1111112' },
            missingData: { email: 'test.client.missing@mailtrap.io', inboxId: '1111113' }
          }
        },
        provider: {
          email: 'test.provider@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Provider Freelancer',
          phone: '+385991111112',
          city: 'Split',
          role: 'PROVIDER',
          legalStatus: 'FREELANCER',
          oib: '12345678901',
          description: 'FREELANCER - OIB je matematički validan ali nije u registru. Za ispravne podatke koristi svoj OIB.',
          mailtrap: {
            validData: { email: 'test.provider@mailtrap.io', inboxId: '2222222' },
            invalidData: { email: 'test.provider.invalid@mailtrap.io', inboxId: '2222223' },
            missingData: { email: 'test.provider.missing@mailtrap.io', inboxId: '2222224' }
          }
        },
        director: {
          email: 'test.director@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Director',
          phone: '+385991111113',
          city: 'Rijeka',
          role: 'PROVIDER',
          legalStatus: 'DOO',
          oib: 'UNESI_PRAVI_OIB_IZ_SUDSKOG_REGISTRA',
          companyName: 'UNESI_NAZIV_IZ_SUDSKOG_REGISTRA',
          mailtrap: {
            validData: { email: 'test.director@mailtrap.io', inboxId: '3333333' },
            invalidData: { email: 'test.director.invalid@mailtrap.io', inboxId: '3333334' },
            missingData: { email: 'test.director.missing@mailtrap.io', inboxId: '3333335' }
          }
        },
        teamMember: {
          email: 'test.team@uslugar.hr',
          password: 'Test123456!',
          fullName: 'Test Team Member',
          phone: '+385991111114',
          city: 'Zadar',
          role: 'PROVIDER',
          legalStatus: 'FREELANCER',
          oib: '12345678903',
          mailtrap: {
            validData: { email: 'test.team@mailtrap.io', inboxId: '4444444' },
            invalidData: { email: 'test.team.invalid@mailtrap.io', inboxId: '4444445' },
            missingData: { email: 'test.team.missing@mailtrap.io', inboxId: '4444446' }
          }
        },
        admin: {
          email: 'admin@uslugar.hr',
          password: 'Admin123456!',
          fullName: 'Test Admin',
          role: 'ADMIN',
          mailtrap: {
            validData: { email: 'test.admin@mailtrap.io', inboxId: '5555555' }
          }
        }
      }
    };
    
    // Vrati direktno strukturu bez zaglavnog "testData" ključa
    res.json(testData);
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/test-data
 * Spremi test podatke (za Mailtrap konfiguraciju i sl.)
 */
r.post('/test-data', async (req, res, next) => {
  try {
    const { email, users } = req.body;
    
    // Spremi u memory ili datoteku
    // (primjer - trebalo bi biti fleksibilnije)
    console.log('📝 Test podaci primljeni:', { email, users });
    
    res.json({
      success: true,
      message: 'Test podaci spremljeni'
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/plans
 * Preuzmi sve test planove
 */
r.get('/plans', async (req, res, next) => {
  try {
    // Za sada vrati praznu listu
    // U budućnosti možeš učitati iz baze ili datoteke
    const plans = [];
    res.json({ plans });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/plans
 * Kreiraj novi test plan
 */
r.post('/plans', async (req, res, next) => {
  try {
    const { name, description, category, items } = req.body;
    
    // Za sada samo spremi u memory
    // U budućnosti spremi u bazu ili datoteku
    console.log('📝 Test plan kreiran:', { name, category });
    
    res.json({
      success: true,
      plan: {
        id: `plan_${Date.now()}`,
        name,
        category,
        description,
        items: items || []
      }
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/testing/runs
 * Preuzmi sve test run-ove
 */
r.get('/runs', async (req, res, next) => {
  try {
    // Za sada vrati praznu listu
    // U budućnosti učitaj iz baze ili datoteke
    const runs = [];
    res.json({ 
      runs,
      count: runs.length,
      activeCount: 0
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/runs
 * Kreiraj novi test run
 */
r.post('/runs', async (req, res, next) => {
  try {
    const { planId, status = 'pending' } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'planId je obavezan' });
    }
    
    // Za sada kreiraj u memory
    // U budućnosti spremi u bazu
    const run = {
      id: `run_${Date.now()}`,
      planId,
      status,
      createdAt: new Date().toISOString(),
      results: []
    };
    
    console.log('🚀 Test run kreiran:', run.id);
    
    res.json({
      success: true,
      run
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/testing/run-single
 * Pokreni jedan test s Playwright-om + Mailtrap integracijom
 */
r.post('/run-single', async (req, res, next) => {
  try {
    const { testId, testName, testType = 'registration', userData, mailtrapInboxId, mailtrapApiKey } = req.body;
    
    if (!testId || !testName) {
      return res.status(400).json({ error: 'testId i testName su obavezni' });
    }
    
    console.log(`[TEST] Pokrenuo test: ${testId} - ${testName}`);
    
    const startTime = Date.now();
    const results = {
      testId,
      testName,
      testType,
      status: 'RUNNING',
      screenshots: [],
      emailScreenshots: [],
      logs: []
    };

    // 1. Pokreni Playwright test
    console.log('[TEST] Korak 1: Pokrenuo Playwright test...');
    let testResult;
    
    try {
      // Ako nema userData, koristi default test podatke
      const testData = userData || {
        email: 'test.registration@uslugar.hr',
        password: 'Test123456!',
        fullName: 'Test User'
      };

      testResult = await testRunnerService.runGenericTest(testType, testData);
      
      results.screenshots = testResult.screenshots || [];
      
      // Dodaj sve logove iz testRunnerService
      if (testResult.logs && testResult.logs.length > 0) {
        results.logs.push(...testResult.logs);
      }
      
      results.logs.push(`✓ Playwright test završen - ${results.screenshots.length} screenshotova`);
      
      if (!testResult.success) {
        results.status = 'FAIL';
        results.logs.push(`✗ Test failed: ${testResult.message}`);
        results.error = testResult.error;
        results.errorStack = testResult.errorStack;
      }
    } catch (error) {
      console.error('[TEST] Playwright error:', error);
      results.status = 'FAIL';
      results.logs.push(`✗ Playwright error: ${error.message}`);
      results.error = error.message;
    }

    // 2. Ako je test prošao i postoji Mailtrap konfiguracija - provjeri mailove
    if (testResult?.success && mailtrapInboxId) {
      console.log('[TEST] Korak 2: Dohvaćam mailove iz Mailtrap-a...');
      results.logs.push('📧 Čekam da mail stigne u Mailtrap...');
      
      // Postavi API key ako je proslijeđen
      const mailtrapOptions = mailtrapApiKey ? { apiToken: mailtrapApiKey } : {};
      if (mailtrapApiKey) {
        mailtrapService.setApiToken(mailtrapApiKey);
        results.logs.push('✓ Mailtrap API key postavljen');
      } else {
        results.logs.push('⚠ Mailtrap API key nije proslijeđen - koristim environment varijablu');
      }
      
      // Čekaj da mail stigne (može trebati nekoliko sekundi)
      let emails = [];
      let attempts = 0;
      const maxAttempts = 10; // 10 pokušaja = ~30 sekundi
      
      while (emails.length === 0 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Čekaj 3 sekunde
        attempts++;
        try {
          emails = await mailtrapService.getEmails(mailtrapInboxId, mailtrapOptions);
          results.logs.push(`  Pokušaj ${attempts}/${maxAttempts}: Pronađeno ${emails.length} mailova`);
        } catch (error) {
          results.logs.push(`  ⚠ Greška pri dohvaćanju mailova: ${error.message}`);
        }
      }
      
      if (emails.length === 0) {
        results.logs.push(`⚠ Nema mailova u inbox-u nakon ${maxAttempts} pokušaja`);
      } else {
        results.logs.push(`✓ Pronađeno ${emails.length} mailova u Mailtrap inbox-u`);
        
        try {
          // Obradi prvi mail (najnoviji)
          const firstEmail = emails[0];
          console.log('[TEST] Obrađujem prvi mail...');
          results.logs.push(`📧 Obrađujem mail: ${firstEmail.subject || firstEmail.id}`);
          
          const emailCapture = await mailtrapService.captureEmailAndClickLink(
            mailtrapInboxId,
            firstEmail.id,
            testId,
            mailtrapOptions
          );

          if (emailCapture.success) {
            results.emailScreenshots.push({
              subject: emailCapture.emailSubject,
              from: emailCapture.emailFrom,
              screenshotUrl: emailCapture.emailScreenshot,
              linkClickScreenshot: emailCapture.linkClickResult?.success ? emailCapture.linkClickResult.url : null,
              clickedLink: emailCapture.linkClickResult?.clickedLink || null
            });
            results.logs.push(`✓ Mail screenshot kreiran: ${emailCapture.emailScreenshot ? 'DA' : 'NE'}`);
            
            if (emailCapture.linkClickResult?.success) {
              results.logs.push(`✓ Link kliknut: ${emailCapture.linkClickResult.clickedLink}`);
              results.logs.push(`✓ Link click screenshot: ${emailCapture.linkClickResult.url ? 'DA' : 'NE'}`);
            } else {
              results.logs.push(`⚠ Link nije kliknut: ${emailCapture.linkClickResult?.error || 'Nepoznata greška'}`);
            }
          } else {
            results.logs.push(`❌ Greška pri obradi maila: ${emailCapture.error || 'Nepoznata greška'}`);
          }
        } catch (error) {
          console.error('[TEST] Mailtrap processing error:', error);
          results.logs.push(`❌ Greška pri obradi maila: ${error.message}`);
        }
      }
    } else if (testResult?.success && !mailtrapInboxId) {
      results.logs.push(`⚠ Test prošao, ali nema Mailtrap inbox ID - preskačem mail screenshotove`);
    }

    const duration = Date.now() - startTime;
    
    const finalResult = {
      success: testResult?.success || false,
      testId,
      testName,
      status: testResult?.success ? 'PASS' : 'FAIL',
      timestamp: new Date().toISOString(),
      duration,
      screenshots: results.screenshots,
      emailScreenshots: results.emailScreenshots,
      logs: results.logs,
      message: testResult?.success 
        ? `✅ Test '${testName}' uspješno prošao (${duration}ms)`
        : `❌ Test '${testName}' nije prošao`
    };
    
    console.log(`[TEST] Rezultat:`, finalResult);
    
    res.json(finalResult);
  } catch (e) {
    next(e);
  }
});

export default r;
