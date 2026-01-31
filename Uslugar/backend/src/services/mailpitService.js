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
      if (options.start) params.start = options.start;
      if (options.query) params.query = options.query;

      const response = await axios.get(`${this.baseUrl}/messages`, {
        params,
        timeout: 10000
      });

      // Mailpit vraća { messages: [...], total: N } ili direktno array
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

      const html = response.data;
      console.log(`[MAILPIT] HTML dohvaćen (${html ? html.length : 0} karaktera)`);
      if (html && html.length > 0) {
        console.log(`[MAILPIT] HTML preview (prvih 500): ${html.substring(0, 500)}`);
      }
      return html;
    } catch (error) {
      console.error('[MAILPIT] Error fetching email HTML:', error.message);
      console.error('[MAILPIT] Error details:', error.response?.status, error.response?.data);
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

      const plain = response.data;
      console.log(`[MAILPIT] Plain text dohvaćen (${plain ? plain.length : 0} karaktera)`);
      if (plain && plain.length > 0) {
        console.log(`[MAILPIT] Plain text preview (prvih 500): ${plain.substring(0, 500)}`);
      }
      return plain;
    } catch (error) {
      console.error('[MAILPIT] Error fetching email plain text:', error.message);
      console.error('[MAILPIT] Error details:', error.response?.status, error.response?.data);
      return null;
    }
  }

  /**
   * Filtriraj mailove po primatelju
   * @param {string} recipient - Email adresa primatelja (može biti s ili bez timestamp-a)
   * @returns {Array} Filtrirani mailovi
   */
  async getEmailsByRecipient(recipient) {
    try {
      const emails = await this.getEmails();
      const recipientLower = recipient.toLowerCase();
      
      // Ekstraktuj prefix i domenu iz recipient emaila
      // Npr. "test.client+123@uslugar.hr" -> prefix: "test.client", domain: "uslugar.hr"
      // Ili "test.client@uslugar.hr" -> prefix: "test.client", domain: "uslugar.hr"
      const [localPart, domainPart] = recipientLower.split('@');
      const basePrefix = localPart.split('+')[0]; // Uzmi dio prije "+" ako postoji
      
      console.log(`[MAILPIT] Filtriranje mailova: recipient=${recipientLower}, basePrefix=${basePrefix}, domain=${domainPart}`);
      
      return emails.filter(email => {
        const to = email.To || [];
        const toArray = Array.isArray(to) ? to : [to];
        return toArray.some(t => {
          const emailAddr = typeof t === 'string' ? t : t.Address || t.email || '';
          const emailLower = emailAddr.toLowerCase();
          
          // Provjeri točno podudaranje
          if (emailLower === recipientLower) {
            return true;
          }
          
          // Provjeri da li email sadrži recipient kao substring (za slučajeve gdje recipient nema timestamp)
          if (emailLower.includes(recipientLower)) {
            return true;
          }
          
          // Provjeri da li email ima isti prefix i domenu (za slučajeve gdje recipient ima timestamp)
          if (domainPart) {
            const [emailLocal, emailDomain] = emailLower.split('@');
            if (emailDomain === domainPart) {
              const emailPrefix = emailLocal.split('+')[0];
              if (emailPrefix === basePrefix) {
                return true;
              }
            }
          }
          
          return false;
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

      // Dohvati email detalje i HTML preko API-ja (pouzdanije od web UI-ja)
      const emailDetails = await this.getEmailDetails(messageId);
      if (!emailDetails) {
        throw new Error(`Email ${messageId} nije pronađen`);
      }

      const htmlContent = await this.getEmailHTML(messageId);
      let plainContent = null;
      if (!htmlContent) {
        // Ako nema HTML, pokušaj plain text
        plainContent = await this.getEmailPlain(messageId);
        if (!plainContent) {
          throw new Error(`Email ${messageId} nema HTML ni plain text sadržaj`);
        }
      }

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Kreiraj HTML stranicu s email sadržajem
      const emailSubject = emailDetails.Subject || emailDetails.subject || 'N/A';
      const emailFrom = emailDetails.From?.Address || emailDetails.From?.email || emailDetails.from_email || 'N/A';
      const emailTo = emailDetails.To?.[0]?.Address || emailDetails.To?.[0]?.email || emailDetails.to_email || 'N/A';
      const emailDate = emailDetails.Date || emailDetails.date || new Date().toISOString();

      // Odredi body sadržaj
      let emailBodyContent = '';
      if (htmlContent) {
        emailBodyContent = htmlContent;
      } else if (plainContent) {
        emailBodyContent = `<pre style="white-space: pre-wrap; font-family: monospace;">${plainContent}</pre>`;
      } else {
        emailBodyContent = '<p>No content available</p>';
      }

      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${emailSubject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .email-container {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              padding: 20px;
            }
            .email-header {
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .email-header h2 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .email-meta {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
            .email-meta strong {
              color: #333;
            }
            .email-body {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>${emailSubject}</h2>
              <div class="email-meta">
                <div><strong>From:</strong> ${emailFrom}</div>
                <div><strong>To:</strong> ${emailTo}</div>
                <div><strong>Date:</strong> ${emailDate}</div>
              </div>
            </div>
            <div class="email-body">
              ${emailBodyContent}
            </div>
          </div>
        </body>
        </html>
      `;

      // Učitaj HTML direktno u Playwright (bez navigacije na web UI)
      await page.setContent(emailHTML, { waitUntil: 'networkidle' });
      console.log(`[MAILPIT] Email HTML učitano u Playwright`);

      // Čekaj da se renderira
      await page.waitForTimeout(500);

      const timestamp = Date.now();
      const filename = `${testId}_email_${messageId}_${timestamp}.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, filename);

      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Provjeri da li je screenshot stvarno kreiran
      const fileExists = fs.existsSync(screenshotPath);
      if (!fileExists) {
        console.error(`[MAILPIT] Screenshot NIJE kreiran na: ${screenshotPath}`);
        throw new Error(`Screenshot file not created: ${screenshotPath}`);
      }
      
      const fileStats = fs.statSync(screenshotPath);
      console.log(`[MAILPIT] Screenshot kreiran: ${filename} (${fileStats.size} bytes)`);

      await context.close();
      await browser.close();

      const screenshotUrl = this._getScreenshotUrl(filename);
      console.log(`[MAILPIT] Screenshot URL: ${screenshotUrl}`);

      return {
        success: true,
        url: screenshotUrl,
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
   * Ekstraktuj linkove iz emaila koristeći konfiguraciju strategija
   * @param {string} htmlContent - HTML sadržaj emaila
   * @param {string} plainContent - Plain text sadržaj emaila
   * @param {Object} emailDetails - Email detalji
   * @param {Object} linkExtractionConfig - Konfiguracija za link extraction
   * @returns {Array} Pronađeni linkovi
   */
  _extractLinksWithStrategies(htmlContent, plainContent, emailDetails, linkExtractionConfig) {
    const links = [];
    let source = 'unknown';
    
    // Ako nema konfiguracije, koristi fallback na scraping
    if (!linkExtractionConfig || !linkExtractionConfig.strategies || linkExtractionConfig.strategies.length === 0) {
      console.log('[MAILPIT] Nema konfiguracije - koristim fallback scraping');
      return this._extractLinksFallback(htmlContent, plainContent, emailDetails);
    }
    
    const strategies = linkExtractionConfig.strategies.filter(s => s.enabled !== false);
    const frontendUrl = linkExtractionConfig.frontendUrl || process.env.FRONTEND_URL || 'https://www.uslugar.eu';
    
    console.log(`[MAILPIT] Pokušavam ekstraktovati linkove koristeći ${strategies.length} strategija...`);
    
    // Pokušaj svaku strategiju redom dok ne pronađeš linkove
    for (const strategy of strategies) {
      try {
        let foundLinks = [];
        
        switch (strategy.type) {
          case 'selector':
            // CSS selector strategija (za HTML)
            if (htmlContent && strategy.selector && strategy.attribute) {
              // Koristi regex da ekstraktujemo href iz <a> tagova koji odgovaraju selectoru
              // Primjer: a[href*="verify"] -> href koji sadrži "verify"
              const selectorPattern = strategy.selector.replace(/\[href\*="([^"]+)"\]/, '');
              const hrefPattern = strategy.selector.match(/\[href\*="([^"]+)"\]/);
              
              if (hrefPattern) {
                const hrefValue = hrefPattern[1];
                const regex = new RegExp(`<a[^>]+href=["']([^"']*${hrefValue}[^"']*)["']`, 'gi');
                let match;
                while ((match = regex.exec(htmlContent)) !== null) {
                  foundLinks.push(match[1]);
                }
              } else {
                // Općenitiji pristup - ekstraktuj sve href-ove iz <a> tagova
                const regex = /<a[^>]+href=["']([^"']+)["']/gi;
                let match;
                while ((match = regex.exec(htmlContent)) !== null) {
                  if (strategy.selector.includes('verify') && match[1].includes('verify')) {
                    foundLinks.push(match[1]);
                  } else if (!strategy.selector.includes('verify')) {
                    foundLinks.push(match[1]);
                  }
                }
              }
              
              if (foundLinks.length > 0) {
                source = `selector:${strategy.name}`;
                links.push(...foundLinks);
                console.log(`[MAILPIT] Strategija "${strategy.name}": Pronađeno ${foundLinks.length} linkova`);
                break;
              }
            }
            break;
            
          case 'regex':
            // Regex strategija
            if (strategy.pattern) {
              const regex = new RegExp(strategy.pattern, strategy.flags || 'gi');
              const content = htmlContent || plainContent || '';
              let match;
              
              while ((match = regex.exec(content)) !== null) {
                const link = match[strategy.group || 1] || match[0];
                if (link && !link.startsWith('mailto:') && !link.startsWith('javascript:') && !link.startsWith('#')) {
                  foundLinks.push(link);
                }
              }
              
              if (foundLinks.length > 0) {
                source = `regex:${strategy.name}`;
                links.push(...foundLinks);
                console.log(`[MAILPIT] Strategija "${strategy.name}": Pronađeno ${foundLinks.length} linkova`);
                break;
              }
            }
            break;
            
          case 'template':
            // Template strategija - konstruiraj URL iz tokena
            if (strategy.pattern && strategy.tokenPattern) {
              const content = htmlContent || plainContent || '';
              const tokenRegex = new RegExp(strategy.tokenPattern, 'i');
              const tokenMatch = content.match(tokenRegex);
              
              if (tokenMatch) {
                const token = tokenMatch[1] || tokenMatch[0];
                const url = strategy.pattern
                  .replace('{FRONTEND_URL}', frontendUrl)
                  .replace('{TOKEN}', token);
                foundLinks.push(url);
                source = `template:${strategy.name}`;
                links.push(...foundLinks);
                console.log(`[MAILPIT] Strategija "${strategy.name}": Konstruiran URL iz tokena`);
                break;
              }
            }
            break;
        }
        
        // Ako je pronađen barem jedan link, prekini petlju
        if (links.length > 0) {
          break;
        }
      } catch (error) {
        console.warn(`[MAILPIT] Greška u strategiji "${strategy.name}": ${error.message}`);
        continue;
      }
    }
    
    // Ako nema linkova i fallback je omogućen, koristi scraping
    if (links.length === 0 && linkExtractionConfig.fallback === 'scrape') {
      console.log('[MAILPIT] Nema linkova iz strategija - koristim fallback scraping');
      return this._extractLinksFallback(htmlContent, plainContent, emailDetails);
    }
    
    return { links, source };
  }
  
  /**
   * Fallback metoda za ekstrakciju linkova (originalna hardkodirana logika)
   */
  _extractLinksFallback(htmlContent, plainContent, emailDetails) {
    let links = [];
    let source = 'fallback';
    
    if (htmlContent && htmlContent.length > 0) {
      const linkPatterns = [
        /href=["']([^"']+)["']/g,
        /href=([^\s>]+)/g,
        /<a[^>]+href=["']?([^"'\s>]+)["']?/gi
      ];
      
      for (const pattern of linkPatterns) {
        let match;
        while ((match = pattern.exec(htmlContent)) !== null) {
          const link = match[1];
          if (link && !link.startsWith('mailto:') && !link.startsWith('javascript:') && !link.startsWith('#')) {
            links.push(link);
          }
        }
      }
    }
    
    if (links.length === 0 && plainContent) {
      const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
      let match;
      while ((match = urlRegex.exec(plainContent)) !== null) {
        const link = match[1];
        if (!link.startsWith('mailto:') && !link.startsWith('javascript:')) {
          links.push(link);
        }
      }
    }
    
    if (links.length === 0) {
      const combined = `${htmlContent || ''}\n${plainContent || ''}`;
      const tokenPatterns = [
        /[#/]*verify[^\s"'?]*\?token=([A-Za-z0-9_-]+)/,
        /token=([A-Za-z0-9_-]{32,})/,
        /verify[^?]*\?[^=]*=([A-Za-z0-9_-]{32,})/
      ];
      
      for (const pattern of tokenPatterns) {
        const tokenMatch = combined.match(pattern);
        if (tokenMatch) {
          const token = tokenMatch[1] || tokenMatch[0];
          const frontendBase = process.env.FRONTEND_URL || 'https://www.uslugar.eu';
          const verifyUrl = `${frontendBase}/#verify?token=${token}`;
          links.push(verifyUrl);
          source = 'fallback-token';
          break;
        }
      }
    }
    
    return { links, source };
  }

  /**
   * Klikni link u mailu i kreiraj screenshot
   * @param {string} messageId - ID poruke
   * @param {string} testId - ID testa
   * @param {Object} options - Opcije (linkExtraction konfiguracija)
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

      // 1. Dohvati HTML i plain text sadržaj
      const htmlContent = await this.getEmailHTML(messageId);
      const plainContent = await this.getEmailPlain(messageId);
      
      console.log(`[MAILPIT] Pokušavam ekstraktovati linkove iz emaila ${messageId}...`);
      console.log(`[MAILPIT] HTML content: ${htmlContent ? `DA (${htmlContent.length} chars)` : 'NE'}`);
      console.log(`[MAILPIT] Plain content: ${plainContent ? `DA (${plainContent.length} chars)` : 'NE'}`);
      
      // 2. Ekstraktuj linkove koristeći konfiguraciju
      const linkExtractionConfig = options.linkExtraction || null;
      const { links, source } = this._extractLinksWithStrategies(
        htmlContent,
        plainContent,
        emailDetails,
        linkExtractionConfig
      );
      
      if (links.length === 0) {
        return {
          success: false,
          error: 'Nema linkova u mailu (ni u HTML ni u plain text sadržaju)',
          emailSubject: emailDetails.Subject || emailDetails.subject
        };
      }
      
      console.log(`[MAILPIT] Pronađeno ${links.length} linkova (iz ${source} sadržaja)`);

      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();

      // Klikni prvi link
      const linkToClick = links[0];
      console.log(`[MAILPIT] Kliknem link: ${linkToClick}`);

      try {
        await page.goto(linkToClick, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Čekaj da se stranica učita i verifikacija završi (ako je verify link)
        if (linkToClick.includes('verify') || linkToClick.includes('token')) {
          console.log('[MAILPIT] Čekam da se verifikacija završi...');
          await page.waitForTimeout(3000); // Čekaj 3 sekunde da se API poziv završi
          
          // Provjeri da li je verifikacija uspješna (traži success poruku ili redirect)
          try {
            await page.waitForSelector('text=/verifikacij|uspješn|success|verified/i', { timeout: 5000 });
            console.log('[MAILPIT] Verifikacija uspješna - pronađena success poruka');
          } catch (e) {
            console.log('[MAILPIT] Nema success poruke (možda je redirect ili drugačiji format)');
          }
        }
      } catch (e) {
        // Ako link ne radi, nastavi
        console.warn(`[MAILPIT] Link nije dostupan: ${linkToClick}`, e.message);
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
   * @param {Object} options - Opcije (linkExtraction konfiguracija)
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

      // 3. Klikni link i kreiraj screenshot (proslijedi linkExtraction opcije)
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

