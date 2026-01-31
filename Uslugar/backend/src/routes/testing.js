/**
 * Testing API Routes
 * Omogućuje upravljanje checkpoint-ima i test podacima
 */

import { Router } from 'express';
import { testCheckpointService } from '../services/testCheckpointService.js';
import { testRunnerService } from '../services/testRunnerService.js';
import { mailpitService } from '../services/mailpitService.js';
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
    const { name, tables, description, purpose } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nedostaje "name"' });
    }

    const checkpointId = await testCheckpointService.create(name, tables, description, purpose);
    
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
 * GET /api/testing/mailpit/status
 * Provjeri status Mailpit servisa
 */
r.get('/mailpit/status', async (req, res, next) => {
  try {
    const baseUrl = req.query.baseUrl || process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1';
    
    // Postavi base URL u servis
    mailpitService.setBaseUrl(baseUrl);
    
    // Pokušaj dohvatiti mailove (provjera da li API radi)
    const emails = await mailpitService.getEmails({ limit: 1 });
    
    res.json({
      success: true,
      connected: true,
      baseUrl: baseUrl,
      message: 'Mailpit servis je dostupan',
      emailCount: emails.length
    });
  } catch (error) {
    console.error('[MAILPIT] Status check failed:', error.message);
    res.json({
      success: false,
      connected: false,
      baseUrl: req.query.baseUrl || process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1',
      message: `Mailpit servis nije dostupan: ${error.message}`,
      error: error.message
    });
  }
});

/**
 * GET /api/testing/mailpit/debug
 * Debug endpoint - prikaži sve Mailpit/SMTP environment varijable
 */
r.get('/mailpit/debug', async (req, res, next) => {
  try {
    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        // Mailpit varijable
        MAILPIT_SMTP_HOST: process.env.MAILPIT_SMTP_HOST || 'NOT SET',
        MAILPIT_SMTP_PORT: process.env.MAILPIT_SMTP_PORT || 'NOT SET',
        MAILPIT_SMTP_USER: process.env.MAILPIT_SMTP_USER || 'NOT SET',
        MAILPIT_SMTP_PASS: process.env.MAILPIT_SMTP_PASS ? 'SET (hidden)' : 'NOT SET',
        MAILPIT_API_URL: process.env.MAILPIT_API_URL || 'NOT SET',
        MAILPIT_WEB_URL: process.env.MAILPIT_WEB_URL || 'NOT SET',
        // Standardne SMTP varijable (fallback)
        SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
        SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
        SMTP_USER: process.env.SMTP_USER || 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET',
      },
      detected: {
        usingMailpit: !!process.env.MAILPIT_SMTP_HOST,
        smtpHost: process.env.MAILPIT_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.MAILPIT_SMTP_PORT || process.env.SMTP_PORT || '587'),
        smtpUser: process.env.MAILPIT_SMTP_USER || process.env.SMTP_USER,
        hasUser: !!(process.env.MAILPIT_SMTP_USER || process.env.SMTP_USER),
        isMailpitPort: parseInt(process.env.MAILPIT_SMTP_PORT || process.env.SMTP_PORT || '587') === 1025,
      },
      transporter: {
        configured: false,
        reason: 'unknown'
      }
    };

    // Provjeri transporter status - pokušaj kreirati transporter
    try {
      const host = process.env.MAILPIT_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.MAILPIT_SMTP_PORT || process.env.SMTP_PORT || '587');
      const user = process.env.MAILPIT_SMTP_USER || process.env.SMTP_USER;
      
      if (!user) {
        debugInfo.transporter.configured = false;
        debugInfo.transporter.reason = 'SMTP_USER not set (MAILPIT_SMTP_USER or SMTP_USER required)';
      } else {
        debugInfo.transporter.configured = true;
        debugInfo.transporter.reason = 'OK - transporter should be configured';
        debugInfo.transporter.details = {
          host: host,
          port: port,
          user: user,
          isMailpit: port === 1025 || !!process.env.MAILPIT_SMTP_HOST
        };
      }
    } catch (err) {
      debugInfo.transporter.configured = false;
      debugInfo.transporter.reason = `Error checking transporter: ${err.message}`;
    }

    res.json({
      success: true,
      debug: debugInfo,
      message: 'Debug info retrieved'
    });
  } catch (error) {
    console.error('[MAILPIT] Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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
          type: 'mailpit',
          baseUrl: process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1'
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
            validData: { email: 'test.client@uslugar.hr' },
            invalidData: { email: 'test.client.invalid@uslugar.hr' },
            missingData: { email: 'test.client.missing@uslugar.hr' }
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
            validData: { email: 'test.provider@uslugar.hr' },
            invalidData: { email: 'test.provider.invalid@uslugar.hr' },
            missingData: { email: 'test.provider.missing@uslugar.hr' }
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
            validData: { email: 'test.director@uslugar.hr' },
            invalidData: { email: 'test.director.invalid@uslugar.hr' },
            missingData: { email: 'test.director.missing@uslugar.hr' }
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
            validData: { email: 'test.team@uslugar.hr' },
            invalidData: { email: 'test.team.invalid@uslugar.hr' },
            missingData: { email: 'test.team.missing@uslugar.hr' }
          }
        },
        admin: {
          email: 'admin@uslugar.hr',
          password: 'Admin123456!',
          fullName: 'Test Admin',
          role: 'ADMIN',
          mailtrap: {
            validData: { email: 'test.admin@uslugar.hr' }
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
    const { testId, testName, testType = 'registration', userData } = req.body;
    
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
      logs: [],
      checkpointId: null,
      checkpointCreated: false
    };

    // 0. Kreiraj checkpoint prije testa
    let checkpointId = null;
    try {
      const checkpointName = `before_${testId}_${testType}`;
      const checkpointDescription = `Checkpoint prije testa: ${testName}`;
      const checkpointPurpose = `Izolacija testa ${testId} - vraćanje baze na početno stanje nakon testa`;
      
      checkpointId = await testCheckpointService.create(
        checkpointName,
        null, // sve tablice
        checkpointDescription,
        checkpointPurpose
      );
      
      results.checkpointId = checkpointId;
      results.checkpointCreated = true;
      results.logs.push(`📸 Checkpoint kreiran: ${checkpointName} (ID: ${checkpointId})`);
      results.logs.push(`   Opis: ${checkpointDescription}`);
      results.logs.push(`   Svrha: ${checkpointPurpose}`);
    } catch (error) {
      console.error('[TEST] Greška pri kreiranju checkpointa:', error);
      results.logs.push(`⚠ Greška pri kreiranju checkpointa: ${error.message}`);
      // Nastavi s testom iako checkpoint nije kreiran
    }

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

    // 2. Ako je test prošao - provjeri mailove u Mailpit-u
    if (testResult?.success) {
      console.log('[TEST] Korak 2: Dohvaćam mailove iz Mailpit-a...');
      results.logs.push('📧 Čekam da mail stigne u Mailpit...');
      
      // Postavi Mailpit base URL ako je proslijeđen u testData
      const mailpitBaseUrl = req.body.mailpitBaseUrl || process.env.MAILPIT_API_URL;
      if (mailpitBaseUrl) {
        mailpitService.setBaseUrl(mailpitBaseUrl);
        results.logs.push(`✓ Mailpit base URL postavljen: ${mailpitBaseUrl}`);
      }
      
      // Mailpit ne treba API key ili inbox ID - svi mailovi su u jednom inboxu
      // Možemo filtrirati po recipient email adresi ako je potrebno
      const recipientEmail = userData?.email;
      
      // Čekaj da mail stigne (može trebati nekoliko sekundi)
      let emails = [];
      let attempts = 0;
      const maxAttempts = 10; // 10 pokušaja = ~30 sekundi
      
      while (emails.length === 0 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Čekaj 3 sekunde
        attempts++;
        try {
          if (recipientEmail) {
            // Filtriraj po recipient email adresi
            emails = await mailpitService.getEmailsByRecipient(recipientEmail);
          } else {
            // Dohvati sve mailove
            emails = await mailpitService.getEmails({ limit: 10 });
          }
          results.logs.push(`  Pokušaj ${attempts}/${maxAttempts}: Pronađeno ${emails.length} mailova`);
        } catch (error) {
          results.logs.push(`  ⚠ Greška pri dohvaćanju mailova: ${error.message}`);
        }
      }
      
      if (emails.length === 0) {
        results.logs.push(`⚠ Nema mailova u Mailpit-u nakon ${maxAttempts} pokušaja${recipientEmail ? ` za ${recipientEmail}` : ''}`);
        // Test ne uspije ako nema mailova
        testResult.success = false;
        results.status = 'FAIL';
        results.logs.push(`❌ Test neuspješan: Nema mailova u Mailpit-u`);
      } else {
        results.logs.push(`✓ Pronađeno ${emails.length} mailova u Mailpit-u`);
        
        let emailSuccess = false;
        let linkClickSuccess = false;
        
        try {
          // Obradi prvi mail (najnoviji)
          const firstEmail = emails[0];
          const messageId = firstEmail.ID || firstEmail.id || firstEmail.messageId;
          console.log('[TEST] Obrađujem prvi mail...');
          const emailSubject = firstEmail.Subject || firstEmail.subject || 'N/A';
          results.logs.push(`📧 Obrađujem mail: ${emailSubject} (ID: ${messageId})`);
          
          const emailCapture = await mailpitService.captureEmailAndClickLink(
            messageId,
            testId
          );

          if (emailCapture.success) {
            emailSuccess = true;
            results.emailScreenshots.push({
              subject: emailCapture.emailSubject,
              from: emailCapture.emailFrom,
              screenshotUrl: emailCapture.emailScreenshot,
              linkClickScreenshot: emailCapture.linkClickResult?.success ? emailCapture.linkClickResult.url : null,
              clickedLink: emailCapture.linkClickResult?.clickedLink || null
            });
            results.logs.push(`✓ Mail screenshot kreiran: ${emailCapture.emailScreenshot ? 'DA' : 'NE'}`);
            
            if (emailCapture.linkClickResult?.success) {
              linkClickSuccess = true;
              results.logs.push(`✓ Link kliknut: ${emailCapture.linkClickResult.clickedLink}`);
              results.logs.push(`✓ Link click screenshot: ${emailCapture.linkClickResult.url ? 'DA' : 'NE'}`);
            } else {
              results.logs.push(`⚠ Link nije kliknut: ${emailCapture.linkClickResult?.error || 'Nepoznata greška'}`);
            }
          } else {
            results.logs.push(`❌ Greška pri obradi maila: ${emailCapture.error || 'Nepoznata greška'}`);
          }
          
          // Test uspije samo ako su i email screenshot i link click uspješni
          if (!emailSuccess || !linkClickSuccess) {
            testResult.success = false;
            results.status = 'FAIL';
            if (!emailSuccess) {
              results.logs.push(`❌ Test neuspješan: Email screenshot nije kreiran`);
            }
            if (!linkClickSuccess) {
              results.logs.push(`❌ Test neuspješan: Link click nije uspješan`);
            }
          }
        } catch (error) {
          console.error('[TEST] Mailpit processing error:', error);
          results.logs.push(`❌ Greška pri obradi maila: ${error.message}`);
          testResult.success = false;
          results.status = 'FAIL';
        }
      }
    }

    // 3. Rollback na checkpoint nakon testa (bez obzira na uspjeh)
    // VAŽNO: Rollback se izvršava NAKON što se email obradi i link klikne
    // jer verifikacija zahtijeva da user i token postoje u bazi
    // Dodatno čekanje da se verifikacija završi prije rollbacka
    if (checkpointId) {
      try {
        // Ako je test uključivao verifikacijski link, čekaj malo da se verifikacija završi
        if (testResult?.success && results.emailScreenshots?.length > 0) {
          const hasVerifyLink = results.emailScreenshots.some(e => 
            e.clickedLink && (e.clickedLink.includes('verify') || e.clickedLink.includes('token'))
          );
          if (hasVerifyLink) {
            console.log('[TEST] Čekam da se verifikacija završi prije rollbacka...');
            results.logs.push('⏳ Čekam da se verifikacija završi prije rollbacka...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Čekaj 2 sekunde
          }
        }
        
        results.logs.push(`⏪ Vraćam bazu na checkpoint: ${checkpointId}`);
        await testCheckpointService.rollback(checkpointId);
        results.logs.push(`✓ Rollback uspješan - baza vraćena na početno stanje`);
      } catch (error) {
        console.error('[TEST] Greška pri rollbacku:', error);
        results.logs.push(`❌ Greška pri rollbacku: ${error.message}`);
      }
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
      checkpointId: results.checkpointId,
      checkpointCreated: results.checkpointCreated,
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
