/**
 * Mailpit Service
 * Dohvaća mailove iz Mailpit API-ja i ekstraktuje informacije
 * Mailpit je lokalni SMTP testing server s REST API-jem
 */

import axios from 'axios';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'test-screenshots');

class MailpitService {
  constructor() {
    // Mailpit default URL - može se override-ati kroz environment varijablu ili setBaseUrl
    this.baseUrl = process.env.MAILPIT_API_URL || 'http://localhost:8025/api/v1';
    this.webUrl = process.env.MAILPIT_WEB_URL || 'http://localhost:8025';
    this._ensureScreenshotsDir();
  }

  setBaseUrl(baseUrl) {
    // Ažuriraj base URL (npr. iz testData)
    if (baseUrl) {
      this.baseUrl = baseUrl;
      // Ako je baseUrl API URL, izvuci web URL
      if (baseUrl.includes('/api/v1')) {
        this.webUrl = baseUrl.replace('/api/v1', '');
      }
      console.log(`[MAILPIT] Base URL postavljen: ${this.baseUrl}`);
    }
  }

  _ensureScreenshotsDir() {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  }

  _getScreenshotUrl(filename) {
    return `/test-screenshots/${filename}`;
  }

  /**
   * Dohvati sve mailove iz Mailpit-a
   * @param {Object} options - Opcije (limit, query, itd.)
   * @returns {Array} Lista mailova
   */
  async getEmails(options = {}) {
    try {
      const params = {};
      if (options.limit) params.limit = options.limit;
      if (options.query) params.query = options.query;

      const response = await axios.get(`${this.baseUrl}/messages`, {
        params,
        timeout: 10000
      });

      // Mailpit vraća { messages: [...], total: N }
      const messages = response.data.messages || response.data || [];
      console.log(`[MAILPIT] Dohvaćeno ${messages.length} mailova`);
      return messages;
    } catch (error) {
      console.error('[MAILPIT] Error fetching emails:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('[MAILPIT] Mailpit nije pokrenut! Pokreni ga s: docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit');
      }
      return [];
    }
  }

  /**
   * Dohvati detalje specifičnog maila
   * @param {string} messageId - ID poruke
   * @returns {Object|null} Detalji poruke
   */
  async getEmailDetails(messageId, options = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/message/${messageId}`, {
        timeout: 10000
      });

      console.log(`[MAILPIT] Dohvaćeni detalji za message ${messageId}`);
      return response.data;
    } catch (error) {
      console.error('[MAILPIT] Error fetching email details:', error.message);
      return null;
    }
  }

  /**
   * Dohvati HTML sadržaj maila
   * @param {string} messageId - ID poruke
   * @returns {string|null} HTML sadržaj
   */
  async getEmailHTML(messageId) {
    try {
      const response = await axios.get(`${this.baseUrl}/message/${messageId}/html`, {
        timeout: 10000,
        responseType: 'text'
      });

      return response.data;
    } catch (error) {
      console.error('[MAILPIT] Error fetching email HTML:', error.message);
      return null;
    }
  }

  /**
   * Dohvati plain text sadržaj maila
   * @param {string} messageId - ID poruke
   * @returns {string|null} Plain text sadržaj
   */
  async getEmailPlain(messageId) {
    try {
      const response = await axios.get(`${this.baseUrl}/message/${messageId}/plain`, {
        timeout: 10000,
        responseType: 'text'
      });

      return response.data;
    } catch (error) {
      console.error('[MAILPIT] Error fetching email plain text:', error.message);
      return null;
    }
  }

  /**
   * Filtriraj mailove po primatelju
   * @param {string} recipient - Email adresa primatelja
   * @returns {Array} Filtrirani mailovi
   */
  async getEmailsByRecipient(recipient) {
    try {
      const emails = await this.getEmails();
      return emails.filter(email => {
        const to = email.To || [];
        const toArray = Array.isArray(to) ? to : [to];
        return toArray.some(t => {
          const emailAddr = typeof t === 'string' ? t : t.Address || t.email || '';
          return emailAddr.toLowerCase().includes(recipient.toLowerCase());
        });
      });
    } catch (error) {
      console.error('[MAILPIT] Error filtering emails:', error.message);
      return [];
    }
  }

  /**
   * Kreiraj screenshot maila iz Mailpit web UI-ja
   * @param {string} messageId - ID poruke
   * @param {string} testId - ID testa
   * @returns {Object} Rezultat screenshot-a
   */
  async captureEmailScreenshot(messageId, testId, options = {}) {
    let browser;
    try {
      console.log(`[MAILPIT] Kreiram screenshot maila: ${messageId}`);

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigiraj na Mailpit web UI
      const mailpitUrl = `${this.webUrl}/message/${messageId}`;
      await page.goto(mailpitUrl, { waitUntil: 'networkidle', timeout: 15000 });

      // Čekaj da se mail učita
      await page.waitForTimeout(2000);

      const timestamp = Date.now();
      const filename = `${testId}_email_${messageId}_${timestamp}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, filename);

      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      console.log(`[MAILPIT] Screenshot sprema na: ${filename}`);

      await context.close();
      await browser.close();

      return {
        success: true,
        url: this._getScreenshotUrl(filename),
        filename
      };
    } catch (error) {
      console.error('[MAILPIT] Error capturing screenshot:', error.message);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Klikni link u mailu i kreiraj screenshot
   * @param {string} messageId - ID poruke
   * @param {string} testId - ID testa
   * @returns {Object} Rezultat klika
   */
  async clickEmailLinkAndCapture(messageId, testId, options = {}) {
    let browser;
    try {
      console.log(`[MAILPIT] Kliknem link u mailu: ${messageId}`);

      const emailDetails = await this.getEmailDetails(messageId);
      
      if (!emailDetails) {
        return {
          success: false,
          error: 'Email nije pronađen'
        };
      }

      // Dohvati HTML sadržaj
      const htmlContent = await this.getEmailHTML(messageId);
      
      if (!htmlContent) {
        return {
          success: false,
          error: 'Email nema HTML sadržaja'
        };
      }

      // Ekstrakuj sve linkove iz HTML-a
      const linkRegex = /href=["']([^"']+)["']/g;
      const links = [];
      let match;

      while ((match = linkRegex.exec(htmlContent)) !== null) {
        const link = match[1];
        // Preskoči mailto: i javascript: linkove
        if (!link.startsWith('mailto:') && !link.startsWith('javascript:')) {
          links.push(link);
        }
      }

      if (links.length === 0) {
        return {
          success: false,
          error: 'Nema linkova u mailu',
          emailSubject: emailDetails.Subject || emailDetails.subject
        };
      }

      console.log(`[MAILPIT] Pronađeno ${links.length} linkova`);

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Klikni prvi link
      const linkToClick = links[0];
      console.log(`[MAILPIT] Kliknem link: ${linkToClick}`);

      try {
        await page.goto(linkToClick, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e) {
        // Ako link ne radi, nastavi
        console.warn(`[MAILPIT] Link nije dostupan: ${linkToClick}`);
      }

      const timestamp = Date.now();
      const filename = `${testId}_link_click_${timestamp}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, filename);

      await page.screenshot({ path: screenshotPath, fullPage: true });

      console.log(`[MAILPIT] Screenshot nakon klika sprema na: ${filename}`);

      await context.close();
      await browser.close();

      return {
        success: true,
        clickedLink: linkToClick,
        url: this._getScreenshotUrl(filename),
        filename
      };
    } catch (error) {
      console.error('[MAILPIT] Error clicking link:', error.message);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Kombinirana funkcija: screenshot maila + klik linka
   * @param {string} messageId - ID poruke
   * @param {string} testId - ID testa
   * @returns {Object} Rezultat obrade
   */
  async captureEmailAndClickLink(messageId, testId, options = {}) {
    try {
      // 1. Dohvati email detalje
      const emailDetails = await this.getEmailDetails(messageId);
      
      if (!emailDetails) {
        return {
          success: false,
          error: 'Email nije pronađen'
        };
      }

      // 2. Kreiraj screenshot maila
      const emailScreenshot = await this.captureEmailScreenshot(messageId, testId, options);

      // 3. Klikni link i kreiraj screenshot
      const linkResult = await this.clickEmailLinkAndCapture(messageId, testId, options);

      // Ekstraktuj subject i from
      const subject = emailDetails.Subject || emailDetails.subject || 'N/A';
      const from = emailDetails.From?.Address || emailDetails.From?.email || emailDetails.from_email || 'N/A';

      return {
        success: true,
        emailSubject: subject,
        emailFrom: from,
        emailScreenshot: emailScreenshot.success ? emailScreenshot.url : null,
        linkClickResult: linkResult,
        message: 'Email obrađen'
      };
    } catch (error) {
      console.error('[MAILPIT] Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const mailpitService = new MailpitService();

