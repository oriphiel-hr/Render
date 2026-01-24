/**
 * Mailtrap Service
 * Dohvaća mailove iz Mailtrap API-ja i ekstraktuje informacije
 */

import axios from 'axios';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'test-screenshots');

class MailtrapService {
  constructor() {
    this.baseUrl = 'https://mailtrap.io/api/accounts';
    this.accountId = process.env.MAILTRAP_ACCOUNT_ID || '1';
    this.apiToken = process.env.MAILTRAP_API_TOKEN || '';
    this._ensureScreenshotsDir();
  }

  _ensureScreenshotsDir() {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  }

  _getScreenshotUrl(filename) {
    return `/test-screenshots/${filename}`;
  }

  async getEmails(inboxId, options = {}) {
    try {
      if (!this.apiToken) {
        console.warn('[MAILTRAP] API token nije postavljen');
        return [];
      }

      const response = await axios.get(
        `${this.baseUrl}/${this.accountId}/inboxes/${inboxId}/messages`,
        {
          headers: {
            'Api-Token': this.apiToken,
            'Content-Type': 'application/json'
          },
          params: {
            search: options.search || '',
            ...options
          }
        }
      );

      console.log(`[MAILTRAP] Dohvaćeno ${response.data.length} mailova iz inbox-a ${inboxId}`);
      return response.data;
    } catch (error) {
      console.error('[MAILTRAP] Error fetching emails:', error.message);
      return [];
    }
  }

  async getEmailDetails(inboxId, messageId) {
    try {
      if (!this.apiToken) {
        console.warn('[MAILTRAP] API token nije postavljen');
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/${this.accountId}/inboxes/${inboxId}/messages/${messageId}`,
        {
          headers: {
            'Api-Token': this.apiToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[MAILTRAP] Dohvaćeni detalji za message ${messageId}`);
      return response.data;
    } catch (error) {
      console.error('[MAILTRAP] Error fetching email details:', error.message);
      return null;
    }
  }

  async getEmailsByRecipient(inboxId, recipient) {
    try {
      const emails = await this.getEmails(inboxId);
      return emails.filter(email => 
        email.to_email === recipient || email.to.some(t => t.email === recipient)
      );
    } catch (error) {
      console.error('[MAILTRAP] Error filtering emails:', error.message);
      return [];
    }
  }

  async captureEmailScreenshot(inboxId, messageId, testId) {
    let browser;
    try {
      console.log(`[MAILTRAP] Kreiram screenshot maila: ${messageId}`);

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigiraj na Mailtrap inbox
      const mailtrapUrl = `https://mailtrap.io/inboxes/${inboxId}/messages/${messageId}`;
      await page.goto(mailtrapUrl, { waitUntil: 'networkidle' });

      // Čekaj da se mail učita
      await page.waitForTimeout(1000);

      const timestamp = Date.now();
      const filename = `${testId}_email_${messageId}_${timestamp}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, filename);

      await page.screenshot({ path: screenshotPath });
      
      console.log(`[MAILTRAP] Screenshot sprema na: ${filename}`);

      await context.close();
      await browser.close();

      return {
        success: true,
        url: this._getScreenshotUrl(filename),
        filename
      };
    } catch (error) {
      console.error('[MAILTRAP] Error capturing screenshot:', error.message);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async clickEmailLinkAndCapture(inboxId, messageId, testId) {
    let browser;
    try {
      console.log(`[MAILTRAP] Kliknem link u mailu: ${messageId}`);

      const emailDetails = await this.getEmailDetails(inboxId, messageId);
      
      if (!emailDetails || !emailDetails.html_body) {
        return {
          success: false,
          error: 'Email nema HTML sadržaja'
        };
      }

      // Ekstrakuj sve linkove iz HTML-a
      const linkRegex = /href=["']([^"']+)["']/g;
      const links = [];
      let match;

      while ((match = linkRegex.exec(emailDetails.html_body)) !== null) {
        links.push(match[1]);
      }

      if (links.length === 0) {
        return {
          success: false,
          error: 'Nema linkova u mailu',
          emailSubject: emailDetails.subject
        };
      }

      console.log(`[MAILTRAP] Pronađeno ${links.length} linkova`);

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Klikni prvi link
      const linkToClick = links[0];
      console.log(`[MAILTRAP] Kliknem link: ${linkToClick}`);

      try {
        await page.goto(linkToClick, { waitUntil: 'networkidle', timeout: 10000 });
      } catch (e) {
        // Ako link ne radi, nastavi
        console.warn(`[MAILTRAP] Link nije dostupan: ${linkToClick}`);
      }

      const timestamp = Date.now();
      const filename = `${testId}_link_click_${timestamp}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, filename);

      await page.screenshot({ path: screenshotPath });

      console.log(`[MAILTRAP] Screenshot nakon klika sprema na: ${filename}`);

      await context.close();
      await browser.close();

      return {
        success: true,
        clickedLink: linkToClick,
        url: this._getScreenshotUrl(filename),
        filename
      };
    } catch (error) {
      console.error('[MAILTRAP] Error clicking link:', error.message);
      
      if (browser) {
        await browser.close();
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async captureEmailAndClickLink(inboxId, messageId, testId) {
    try {
      // 1. Dohvati email detalje
      const emailDetails = await this.getEmailDetails(inboxId, messageId);
      
      if (!emailDetails) {
        return {
          success: false,
          error: 'Email nije pronađen'
        };
      }

      // 2. Kreiraj screenshot maila
      const emailScreenshot = await this.captureEmailScreenshot(inboxId, messageId, testId);

      // 3. Klikni link i kreiraj screenshot
      const linkResult = await this.clickEmailLinkAndCapture(inboxId, messageId, testId);

      return {
        success: true,
        emailSubject: emailDetails.subject,
        emailFrom: emailDetails.from_email,
        emailScreenshot: emailScreenshot.success ? emailScreenshot.url : null,
        linkClickResult: linkResult,
        message: 'Email obrađen'
      };
    } catch (error) {
      console.error('[MAILTRAP] Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const mailtrapService = new MailtrapService();

