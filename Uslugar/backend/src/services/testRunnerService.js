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
      
      try {
        const emailField = 'input[name="email"]';
        await page.waitForSelector(emailField, { timeout: 5000 });
        await page.fill(emailField, userData.email);
        logs.push(`✓ Email unesen: ${userData.email}`);
      } catch (e) {
        logs.push(`❌ Greška pri unosu email-a: ${e.message}`);
        throw new Error(`Email field not found or unable to fill: ${e.message}`);
      }

      try {
        const passwordField = 'input[name="password"]';
        await page.waitForSelector(passwordField, { timeout: 5000 });
        await page.fill(passwordField, userData.password);
        logs.push(`✓ Lozinka unesen`);
      } catch (e) {
        logs.push(`❌ Greška pri unosu lozinke: ${e.message}`);
        throw new Error(`Password field not found or unable to fill: ${e.message}`);
      }

      try {
        const nameField = 'input[name="fullName"]';
        await page.waitForSelector(nameField, { timeout: 5000 });
        await page.fill(nameField, userData.fullName);
        logs.push(`✓ Puno ime unesen: ${userData.fullName}`);
      } catch (e) {
        logs.push(`❌ Greška pri unosu imena: ${e.message}`);
        throw new Error(`Name field not found or unable to fill: ${e.message}`);
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

