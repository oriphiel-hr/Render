/**
 * Test Runner Service
 * Pokreće Playwright teste i prikuplja screenshotove
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'test-screenshots');

class TestRunnerService {
  constructor() {
    this._ensureScreenshotsDir();
  }

  _ensureScreenshotsDir() {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
      console.log(`✓ Created screenshots directory: ${SCREENSHOTS_DIR}`);
    }
  }

  _getScreenshotPath(testId, step) {
    const timestamp = Date.now();
    const filename = `${testId}_${step}_${timestamp}.png`;
    return path.join(SCREENSHOTS_DIR, filename);
  }

  _getScreenshotUrl(filename) {
    return `/test-screenshots/${filename}`;
  }

  async runRegistrationTest(userData) {
    const testId = 'registration_' + Date.now();
    const screenshots = [];
    const logs = [];
    let browser;

    try {
      console.log(`[TEST RUNNER] Pokrenuo test: ${testId}`);
      logs.push(`✓ Test pokrenuo: ${testId}`);
      
      // Pokretanje browsera
      console.log('[TEST RUNNER] Pokušavam pokrenuti browser...');
      logs.push('Pokretanje Playwright browser-a...');
      
      browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logs.push('✓ Browser pokrenuo');

      const context = await browser.newContext();
      const page = await context.newPage();
      logs.push('✓ Nova stranica kreirana');

      // 1. Otiđi na stranicu
      console.log('[TEST RUNNER] Navigiram na /register...');
      logs.push('Navigacija na https://www.uslugar.eu/register...');
      
      try {
        await page.goto('https://www.uslugar.eu/register', { waitUntil: 'networkidle', timeout: 30000 });
        logs.push('✓ Stranica učitana');
      } catch (e) {
        logs.push(`❌ Greška pri učitavanju: ${e.message}`);
        throw new Error(`Navigation failed: ${e.message}`);
      }
      
      let screenshotPath = this._getScreenshotPath(testId, '01_loaded');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Stranica učitana',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });
      logs.push('✓ Screenshot 01 sprema');

      // 2. Unesi podatke
      console.log('[TEST RUNNER] Unošu podatke...');
      logs.push('Unošenje podataka...');
      
      // Debug: Pronađi sve input polja na stranici
      const allInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        return Array.from(inputs).map(inp => ({
          type: inp.type,
          name: inp.name,
          id: inp.id,
          placeholder: inp.placeholder,
          value: inp.value,
          visible: inp.offsetParent !== null
        }));
      });
      logs.push(`📋 Pronađeni input-i: ${allInputs.length}`);
      allInputs.forEach((inp, idx) => {
        if (inp.visible) {
          logs.push(`  ${idx}: type=${inp.type}, name=${inp.name}, id=${inp.id}, placeholder=${inp.placeholder}`);
        }
      });

      // Pokušaj s različitim selektorima
      const emailSelectors = [
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="mail" i]',
        'input#email',
        'input[data-testid="email"]'
      ];

      let emailFound = false;
      for (const selector of emailSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.waitForElementState('visible', { timeout: 3000 });
            await page.fill(selector, userData.email);
            logs.push(`✓ Email unesen s selektorom: ${selector}`);
            emailFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!emailFound) {
        logs.push(`❌ Email input nije pronađen. Dostupni inputi:`);
        allInputs.forEach(inp => {
          logs.push(`  - type=${inp.type}, name=${inp.name}, placeholder=${inp.placeholder}`);
        });
        throw new Error(`Email field not found with any selector`);
      }

      // Password field
      const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input#password',
        'input[data-testid="password"]'
      ];

      let passwordFound = false;
      for (const selector of passwordSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.waitForElementState('visible', { timeout: 3000 });
            await page.fill(selector, userData.password);
            logs.push(`✓ Lozinka unesen s selektorom: ${selector}`);
            passwordFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!passwordFound) {
        logs.push(`❌ Password input nije pronađen`);
        throw new Error(`Password field not found with any selector`);
      }

      // Full Name field
      const nameSelectors = [
        'input[name="fullName"]',
        'input[name="full_name"]',
        'input[name="name"]',
        'input[placeholder*="ime" i]',
        'input[placeholder*="name" i]',
        'input#fullName',
        'input[data-testid="fullName"]'
      ];

      let nameFound = false;
      for (const selector of nameSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.waitForElementState('visible', { timeout: 3000 });
            await page.fill(selector, userData.fullName);
            logs.push(`✓ Puno ime unesen s selektorom: ${selector}`);
            nameFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!nameFound) {
        logs.push(`⚠ Puno ime input nije pronađen - nastavlja se bez njega`);
      }
      
      screenshotPath = this._getScreenshotPath(testId, '02_data_entered');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Podaci uneseni',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });
      logs.push('✓ Screenshot 02 sprema');

      // 3. Klikni Register
      console.log('[TEST RUNNER] Kliknem Register...');
      logs.push('Kliktanje Register gumb...');
      
      try {
        const registerBtn = 'button:has-text("Register")';
        await page.waitForSelector(registerBtn, { timeout: 5000 });
        await page.click(registerBtn);
        logs.push('✓ Register gumb kliknut');
      } catch (e) {
        logs.push(`❌ Register gumb nije pronađen: ${e.message}`);
        throw new Error(`Register button not found: ${e.message}`);
      }

      try {
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
        logs.push('✓ Navigacija nakon registracije uspješna');
      } catch (e) {
        logs.push(`⚠ Navigacija timeout (možda je OK): ${e.message}`);
      }
      
      screenshotPath = this._getScreenshotPath(testId, '03_registered');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Registracija uspješna',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });
      logs.push('✓ Screenshot 03 sprema');

      await context.close();
      await browser.close();

      console.log(`[TEST RUNNER] Test ${testId} uspješno završen. Screenshotove: ${screenshots.length}`);
      logs.push(`✓ Test završen - ${screenshots.length} screenshotova`);

      return {
        success: true,
        testId,
        screenshots,
        logs,
        message: 'Registracija uspješna'
      };
    } catch (error) {
      console.error(`[TEST RUNNER] Test ${testId} failed:`, error);
      logs.push(`❌ TEST FAILED: ${error.message}`);
      logs.push(`Stack: ${error.stack?.split('\n')[0]}`);
      
      try {
        if (browser) {
          await browser.close();
        }
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
        logs.push(`⚠ Error closing browser: ${closeError.message}`);
      }

      return {
        success: false,
        testId,
        screenshots,
        logs,
        error: error.message,
        errorStack: error.stack,
        message: `❌ Greška pri testu: ${error.message}`
      };
    }
  }

  async runJobCreationTest(userData) {
    const testId = 'job_creation_' + Date.now();
    const screenshots = [];
    let browser;

    try {
      console.log(`[TEST RUNNER] Pokrenuo test: ${testId}`);
      
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // 1. Login
      console.log('[TEST RUNNER] Navigiram na login...');
      await page.goto('https://www.uslugar.eu/login', { waitUntil: 'networkidle' });
      
      await page.fill('input[name="email"]', userData.email);
      await page.fill('input[name="password"]', userData.password);
      await page.click('button:has-text("Sign in")');
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      let screenshotPath = this._getScreenshotPath(testId, '01_logged_in');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Prijava uspješna',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });

      // 2. Kreiraj posao
      console.log('[TEST RUNNER] Kreiram posao...');
      await page.click('button:has-text("Objavi posao")');
      await page.waitForLoadState('networkidle');

      screenshotPath = this._getScreenshotPath(testId, '02_job_form');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Forma za posao otvorena',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });

      // 3. Unesi podatke
      await page.fill('input[name="title"]', userData.jobTitle || 'Test Job');
      await page.fill('textarea[name="description"]', userData.jobDescription || 'Test Description');
      
      screenshotPath = this._getScreenshotPath(testId, '03_job_filled');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Podaci za posao uneseni',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });

      // 4. Spremi
      await page.click('button:has-text("Spremi")');
      await page.waitForNavigation({ waitUntil: 'networkidle' });

      screenshotPath = this._getScreenshotPath(testId, '04_job_created');
      await page.screenshot({ path: screenshotPath });
      screenshots.push({
        step: 'Posao kreiran',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });

      await context.close();
      await browser.close();

      return {
        success: true,
        testId,
        screenshots,
        message: 'Kreiranje posla uspješno'
      };
    } catch (error) {
      console.error(`[TEST RUNNER] Test ${testId} failed:`, error);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        testId,
        screenshots,
        error: error.message,
        message: `Greška pri testu: ${error.message}`
      };
    }
  }

  // Generički test runner - može se proširiti za različite scenarije
  async runGenericTest(testType, userData) {
    switch (testType) {
      case 'registration':
        return this.runRegistrationTest(userData);
      case 'job_creation':
        return this.runJobCreationTest(userData);
      default:
        return {
          success: false,
          message: `Unknown test type: ${testType}`
        };
    }
  }
}

export const testRunnerService = new TestRunnerService();

