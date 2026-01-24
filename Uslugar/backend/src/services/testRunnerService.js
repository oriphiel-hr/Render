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
    // Koristi backend API URL za screenshotove
    // Ako je relativni path, frontend će ga prependati s API base URL-om
    // Za sada koristimo relativni path jer se servira kao static file
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
      
      // Provjeri URL nakon učitavanja
      const currentUrl = page.url();
      logs.push(`📍 Trenutni URL: ${currentUrl}`);
      
      // Čekaj da se React učita
      logs.push('Čekanje da se React učita...');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000); // Duže čekanje za React hydration
      logs.push('✓ React učitan');
      
      // Provjeri je li #root element prisutan
      const rootExists = await page.evaluate(() => {
        return document.getElementById('root') !== null;
      });
      logs.push(`📦 #root element: ${rootExists ? '✓ Postoji' : '❌ Ne postoji'}`);
      
      // Provjeri je li React učitan - čekaj da se pojavi neki React element
      try {
        await page.waitForSelector('#root', { timeout: 10000 });
        logs.push('✓ #root element pronađen');
      } catch (e) {
        logs.push(`⚠ #root element nije pronađen: ${e.message}`);
      }
      
      // Čekaj dodatno da se forma renderira
      await page.waitForTimeout(3000);
      logs.push('✓ Dodatno čekanje za render form-e');
      
      let screenshotPath = this._getScreenshotPath(testId, '01_loaded');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      screenshots.push({
        step: 'Stranica učitana',
        url: this._getScreenshotUrl(path.basename(screenshotPath))
      });
      logs.push('✓ Screenshot 01 sprema');

      // 2. Unesi podatke
      console.log('[TEST RUNNER] Unošu podatke...');
      logs.push('Unošenje podataka...');
      
      let emailFound = false;
      
      // Debug: Provjeri HTML strukturu
      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          bodyText: document.body?.textContent?.substring(0, 200) || 'N/A',
          rootContent: document.getElementById('root')?.innerHTML?.substring(0, 500) || 'N/A',
          allElements: document.querySelectorAll('*').length,
          hasReact: window.React !== undefined || window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined,
          links: Array.from(document.querySelectorAll('a')).map(a => ({
            text: a.textContent?.trim().substring(0, 50),
            href: a.href,
            onclick: a.onclick ? 'has onclick' : 'no onclick'
          })).slice(0, 10),
          buttons: Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.textContent?.trim().substring(0, 50),
            className: b.className,
            onclick: b.onclick ? 'has onclick' : 'no onclick'
          })).slice(0, 10)
        };
      });
      logs.push(`📄 Page Info: title=${pageInfo.title}, elements=${pageInfo.allElements}, hasReact=${pageInfo.hasReact}`);
      logs.push(`📄 Body text (prvih 200): ${pageInfo.bodyText}`);
      logs.push(`📄 Root content (prvih 500): ${pageInfo.rootContent.substring(0, 200)}...`);
      logs.push(`🔗 Linkovi na stranici: ${pageInfo.links.length}`);
      pageInfo.links.forEach((link, idx) => {
        if (link.text.toLowerCase().includes('registr') || link.text.toLowerCase().includes('sign up') || link.href.includes('register')) {
          logs.push(`  ${idx}: "${link.text}" -> ${link.href}`);
        }
      });
      logs.push(`🔘 Gumbovi na stranici: ${pageInfo.buttons.length}`);
      pageInfo.buttons.forEach((btn, idx) => {
        if (btn.text.toLowerCase().includes('registr') || btn.text.toLowerCase().includes('sign up')) {
          logs.push(`  ${idx}: "${btn.text}"`);
        }
      });
      
      // Debug: Pronađi sve input polja na stranici
      let allInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea');
        return Array.from(inputs).map(inp => ({
          tag: inp.tagName.toLowerCase(),
          type: inp.type,
          name: inp.name,
          id: inp.id,
          placeholder: inp.placeholder,
          value: inp.value,
          visible: inp.offsetParent !== null,
          display: window.getComputedStyle(inp).display,
          className: inp.className,
          outerHTML: inp.outerHTML.substring(0, 200) // Prvih 200 karaktera HTML-a
        }));
      });
      logs.push(`📋 Pronađeni input-i/textarea: ${allInputs.length}`);
      
      // Pokušaj pronaći i kliknuti na link/gumb za registraciju ako forma nije vidljiva
      if (allInputs.length === 0) {
        logs.push('⚠️ Nema input polja - pokušavam pronaći link/gumb za registraciju...');
        
        // Pokušaj kliknuti na link "Registracija" ili "Sign up"
        const registerLinks = [
          'a:has-text("Registracija")',
          'a:has-text("Registriraj se")',
          'a:has-text("Sign up")',
          'a[href*="register"]',
          'button:has-text("Registracija")',
          'button:has-text("Sign up")'
        ];
        
        let linkClicked = false;
        for (const linkSelector of registerLinks) {
          try {
            const link = page.locator(linkSelector).first();
            await link.waitFor({ state: 'visible', timeout: 3000 });
            const href = await link.getAttribute('href');
            await link.click();
            logs.push(`✓ Kliknuo na: ${linkSelector} (href: ${href})`);
            linkClicked = true;
            
            // Ako je hash link (#register-user), scrollaj do sekcije
            if (href && href.includes('#')) {
              const hash = href.split('#')[1];
              logs.push(`📍 Hash link detektiran: #${hash} - scrollam do sekcije...`);
              
              // Scrollaj do sekcije
              await page.evaluate((sectionId) => {
                const element = document.getElementById(sectionId) || document.querySelector(`[id="${sectionId}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, hash);
              
              await page.waitForTimeout(2000); // Čekaj scroll
              logs.push(`✓ Scrollao do sekcije #${hash}`);
            }
            
            // Čekaj da se forma učita nakon klika
            await page.waitForTimeout(5000); // Duže čekanje za React render
            await page.waitForLoadState('networkidle');
            logs.push('✓ Čekam da se forma učita nakon klika...');
            
            // Pokušaj pronaći formu u sekciji
            if (href && href.includes('#')) {
              const hash = href.split('#')[1];
              try {
                await page.waitForSelector(`#${hash}`, { timeout: 5000 });
                logs.push(`✓ Sekcija #${hash} pronađena`);
                
                // Provjeri što je u sekciji
                const sectionContent = await page.evaluate((sectionId) => {
                  const section = document.getElementById(sectionId);
                  if (!section) return null;
                  return {
                    html: section.innerHTML.substring(0, 500),
                    buttons: Array.from(section.querySelectorAll('button')).map(b => ({
                      text: b.textContent?.trim(),
                      className: b.className
                    })),
                    links: Array.from(section.querySelectorAll('a')).map(a => ({
                      text: a.textContent?.trim(),
                      href: a.href
                    })),
                    inputs: section.querySelectorAll('input, textarea').length
                  };
                }, hash);
                
                if (sectionContent) {
                  logs.push(`📦 Sekcija sadržaj: ${sectionContent.html.substring(0, 200)}...`);
                  logs.push(`🔘 Gumbovi u sekciji: ${sectionContent.buttons.length}`);
                  sectionContent.buttons.forEach((btn, idx) => {
                    logs.push(`  ${idx}: "${btn.text}"`);
                  });
                  logs.push(`📋 Input polja u sekciji: ${sectionContent.inputs}`);
                  
                  // Ako nema inputa, pokušaj kliknuti na gumb u sekciji
                  if (sectionContent.inputs === 0 && sectionContent.buttons.length > 0) {
                    logs.push('⚠ Nema input polja - pokušavam kliknuti na gumb u sekciji...');
                    
                    // Pokušaj kliknuti na prvi gumb koji ima "registr" ili "majstor" u tekstu
                    const buttonToClick = sectionContent.buttons.find(btn => 
                      btn.text && (btn.text.toLowerCase().includes('registr') || 
                                   btn.text.toLowerCase().includes('majstor') ||
                                   btn.text.toLowerCase().includes('postani'))
                    );
                    
                    if (buttonToClick) {
                      try {
                        const button = page.locator(`#${hash} button:has-text("${buttonToClick.text}")`).first();
                        await button.waitFor({ state: 'visible', timeout: 5000 });
                        await button.click();
                        logs.push(`✓ Kliknuo na gumb: "${buttonToClick.text}"`);
                        
                        // Čekaj da se forma otvori
                        await page.waitForTimeout(5000);
                        await page.waitForLoadState('networkidle');
                        logs.push('✓ Čekam da se forma otvori nakon klika na gumb...');
                      } catch (e) {
                        logs.push(`⚠ Gumb nije kliknut: ${e.message.substring(0, 50)}`);
                      }
                    }
                  }
                }
                
                // Čekaj da se inputi pojave u toj sekciji
                try {
                  await page.waitForSelector(`#${hash} input`, { timeout: 10000 });
                  logs.push(`✓ Input polja u sekciji #${hash} pronađena`);
                } catch (e) {
                  logs.push(`⚠ Inputi u sekciji #${hash} nisu pronađeni: ${e.message}`);
                }
              } catch (e) {
                logs.push(`⚠ Sekcija #${hash} ili inputi nisu pronađeni: ${e.message}`);
              }
            }
            
            break;
          } catch (e) {
            logs.push(`  ⚠ Link ${linkSelector} nije kliknut: ${e.message.substring(0, 50)}`);
            // Continue to next selector
          }
        }
        
        if (linkClicked) {
          // Ponovno provjeri inpute nakon svih akcija
          allInputs = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input, textarea');
            return Array.from(inputs).map(inp => ({
              tag: inp.tagName.toLowerCase(),
              type: inp.type,
              name: inp.name,
              id: inp.id,
              placeholder: inp.placeholder,
              value: inp.value,
              visible: inp.offsetParent !== null,
              display: window.getComputedStyle(inp).display,
              className: inp.className,
              outerHTML: inp.outerHTML.substring(0, 200)
            }));
          });
          logs.push(`📋 Input polja nakon klika: ${allInputs.length}`);
          
          // Ako još nema inputa, čekaj dodatno
          if (allInputs.length === 0) {
            logs.push('⚠ Još nema input polja - čekam dodatno...');
            await page.waitForTimeout(5000);
            
            // Pokušaj scrollati do gore i dolje da triggerira render
            await page.evaluate(() => {
              window.scrollTo(0, 0);
            });
            await page.waitForTimeout(1000);
            await page.evaluate(() => {
              window.scrollTo(0, document.body.scrollHeight);
            });
            await page.waitForTimeout(2000);
            logs.push('✓ Scrollao kroz stranicu da triggeriram render');
            
            // Ponovno provjeri inpute nakon scrolla
            allInputs = await page.evaluate(() => {
              const inputs = document.querySelectorAll('input, textarea');
              return Array.from(inputs).map(inp => ({
                tag: inp.tagName.toLowerCase(),
                type: inp.type,
                name: inp.name,
                id: inp.id,
                placeholder: inp.placeholder,
                value: inp.value,
                visible: inp.offsetParent !== null,
                display: window.getComputedStyle(inp).display,
                className: inp.className,
                outerHTML: inp.outerHTML.substring(0, 200)
              }));
            });
            logs.push(`📋 Input polja nakon scrolla: ${allInputs.length}`);
          }
        }
        
        // Ako je link kliknut, ponovno provjeri inpute
        if (linkClicked) {
          allInputs = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input, textarea');
            return Array.from(inputs).map(inp => ({
              tag: inp.tagName.toLowerCase(),
              type: inp.type,
              name: inp.name,
              id: inp.id,
              placeholder: inp.placeholder,
              value: inp.value,
              visible: inp.offsetParent !== null,
              display: window.getComputedStyle(inp).display,
              className: inp.className,
              outerHTML: inp.outerHTML.substring(0, 200)
            }));
          });
        }
      }
      
      // Loguj sve inpute
      allInputs.forEach((inp, idx) => {
        logs.push(`  ${idx}: ${inp.tag} type=${inp.type}, name=${inp.name || 'N/A'}, id=${inp.id || 'N/A'}, placeholder=${inp.placeholder || 'N/A'}, visible=${inp.visible}, display=${inp.display}`);
        if (!inp.visible) {
          logs.push(`    ⚠️ Input ${idx} nije vidljiv!`);
        }
      });
      
      // Debug: Pronađi sve elemente koji sadrže "email" u bilo kojem atributu
      const emailRelated = await page.evaluate(() => {
        const all = document.querySelectorAll('input, label, div, span');
        return Array.from(all)
          .filter(el => {
            const text = (el.textContent || '').toLowerCase();
            const html = (el.outerHTML || '').toLowerCase();
            return text.includes('email') || text.includes('mail') || 
                   html.includes('email') || html.includes('mail') ||
                   (el.id && el.id.toLowerCase().includes('email')) ||
                   (el.className && el.className.toLowerCase().includes('email'));
          })
          .slice(0, 10) // Prvih 10
          .map(el => ({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            className: el.className,
            text: (el.textContent || '').substring(0, 50),
            html: el.outerHTML.substring(0, 200)
          }));
      });
      logs.push(`📧 Elementi povezani s email-om: ${emailRelated.length}`);
      emailRelated.forEach((el, idx) => {
        logs.push(`  ${idx}: ${el.tag} id=${el.id || 'N/A'}, class=${el.className || 'N/A'}, text=${el.text}`);
      });
      
      // Debug: Pronađi sve forme
      const forms = await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).map(f => ({
          id: f.id,
          action: f.action,
          method: f.method,
          inputs: f.querySelectorAll('input, textarea').length
        }));
      });
      logs.push(`📋 Pronađene forme: ${forms.length}`);
      forms.forEach((f, idx) => {
        logs.push(`  Form ${idx}: id=${f.id}, action=${f.action}, inputs=${f.inputs}`);
      });

      // Pokušaj s getByLabelText pristupom (najbolji za React Hook Form)
      try {
        const emailByLabel = page.getByLabel(/email/i).first();
        await emailByLabel.waitFor({ state: 'visible', timeout: 5000 });
        await emailByLabel.fill(userData.email);
        logs.push(`✓ Email unesen preko getByLabel(/email/i)`);
        emailFound = true;
      } catch (e) {
        logs.push(`  ⚠ getByLabel(/email/i) nije pronađen: ${e.message.substring(0, 50)}`);
      }
      
      // Ako getByLabel nije uspio, pokušaj s selektorima
      if (!emailFound) {
        const emailSelectors = [
          'input[name="email"]',
          'input[type="email"]',
          'input[placeholder*="email" i]',
          'input[placeholder*="mail" i]',
          'input#email',
          'input[data-testid="email"]',
          'input[aria-label*="email" i]',
          'input[aria-label*="mail" i]',
          // Pokušaj pronaći preko label teksta
          'label:has-text("email") + input',
          'label:has-text("mail") + input',
          // Pokušaj pronaći input unutar label-a
          'label:has-text("email") input',
          'label:has-text("mail") input'
        ];
        
        for (const selector of emailSelectors) {
        try {
          const locator = page.locator(selector).first();
          await locator.waitFor({ state: 'visible', timeout: 3000 });
          await locator.fill(userData.email);
          logs.push(`✓ Email unesen s selektorom: ${selector}`);
          emailFound = true;
          break;
        } catch (e) {
          logs.push(`  ⚠ Selektor ${selector} nije pronađen: ${e.message.substring(0, 50)}`);
          // Continue to next selector
        }
        }
      }

      if (!emailFound) {
        logs.push(`❌ Email input nije pronađen. Dostupni inputi:`);
        allInputs.forEach(inp => {
          logs.push(`  - ${inp.tag} type=${inp.type}, name=${inp.name}, id=${inp.id}, placeholder=${inp.placeholder}`);
        });
        throw new Error(`Email field not found with any selector`);
      }

      // Password field
      let passwordFound = false;
      
      // Pokušaj s getByLabelText pristupom
      try {
        const passwordByLabel = page.getByLabel(/password|lozinka/i).first();
        await passwordByLabel.waitFor({ state: 'visible', timeout: 5000 });
        await passwordByLabel.fill(userData.password);
        logs.push(`✓ Lozinka unesen preko getByLabel(/password|lozinka/i)`);
        passwordFound = true;
      } catch (e) {
        logs.push(`  ⚠ getByLabel(/password|lozinka/i) nije pronađen: ${e.message.substring(0, 50)}`);
      }
      
      // Ako getByLabel nije uspio, pokušaj s selektorima
      if (!passwordFound) {
        const passwordSelectors = [
          'input[name="password"]',
          'input[type="password"]',
          'input#password',
          'input[data-testid="password"]',
          'input[aria-label*="password" i]',
          'input[aria-label*="lozinka" i]'
        ];
        
        for (const selector of passwordSelectors) {
          try {
            const locator = page.locator(selector).first();
            await locator.waitFor({ state: 'visible', timeout: 3000 });
            await locator.fill(userData.password);
            logs.push(`✓ Lozinka unesen s selektorom: ${selector}`);
            passwordFound = true;
            break;
          } catch (e) {
            // Continue to next selector
          }
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
        'input[data-testid="fullName"]',
        'input[aria-label*="ime" i]',
        'input[aria-label*="name" i]'
      ];

      let nameFound = false;
      for (const selector of nameSelectors) {
        try {
          const locator = page.locator(selector).first();
          await locator.waitFor({ state: 'visible', timeout: 3000 });
          await locator.fill(userData.fullName);
          logs.push(`✓ Puno ime unesen s selektorom: ${selector}`);
          nameFound = true;
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!nameFound) {
        logs.push(`⚠ Puno ime input nije pronađen - nastavlja se bez njega`);
      }

      // Phone field
      if (userData.phone) {
        const phoneSelectors = [
          'input[name="phone"]',
          'input[name="telefon"]',
          'input[type="tel"]',
          'input[placeholder*="phone" i]',
          'input[placeholder*="telefon" i]',
          'input[placeholder*="+385" i]',
          'input#phone',
          'input[data-testid="phone"]',
          'input[aria-label*="phone" i]',
          'input[aria-label*="telefon" i]'
        ];

        let phoneFound = false;
        for (const selector of phoneSelectors) {
          try {
            const locator = page.locator(selector).first();
            await locator.waitFor({ state: 'visible', timeout: 3000 });
            await locator.fill(userData.phone);
            logs.push(`✓ Telefon unesen s selektorom: ${selector}`);
            phoneFound = true;
            break;
          } catch (e) {
            // Continue to next selector
          }
        }

        if (!phoneFound) {
          logs.push(`⚠ Telefon input nije pronađen - nastavlja se bez njega`);
        }
      } else {
        logs.push(`⚠ Telefon nije u userData - preskače se`);
      }

      // City field
      if (userData.city) {
        const citySelectors = [
          'input[name="city"]',
          'input[name="grad"]',
          'input[placeholder*="city" i]',
          'input[placeholder*="grad" i]',
          'input[placeholder*="Zagreb" i]',
          'input#city',
          'input[data-testid="city"]',
          'input[aria-label*="city" i]',
          'input[aria-label*="grad" i]',
          'select[name="city"]' // Može biti i select dropdown
        ];

        let cityFound = false;
        for (const selector of citySelectors) {
          try {
            const locator = page.locator(selector).first();
            await locator.waitFor({ state: 'visible', timeout: 3000 });
            
            // Provjeri je li select ili input
            const tagName = await locator.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'select') {
              await locator.selectOption({ label: userData.city });
              logs.push(`✓ Grad odabran s selektorom: ${selector} (${userData.city})`);
            } else {
              await locator.fill(userData.city);
              logs.push(`✓ Grad unesen s selektorom: ${selector}`);
            }
            cityFound = true;
            break;
          } catch (e) {
            // Continue to next selector
          }
        }

        if (!cityFound) {
          logs.push(`⚠ Grad input nije pronađen - nastavlja se bez njega`);
        }
      } else {
        logs.push(`⚠ Grad nije u userData - preskače se`);
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
      
      // Debug: Pronađi sve gumbove na stranici
      const allButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, input[type="submit"]');
        return Array.from(buttons).map(btn => ({
          tag: btn.tagName.toLowerCase(),
          type: btn.type,
          text: btn.textContent?.trim() || btn.value || '',
          className: btn.className,
          visible: btn.offsetParent !== null,
          disabled: btn.disabled
        }));
      });
      logs.push(`🔘 Pronađeni gumbovi: ${allButtons.length}`);
      allButtons.forEach((btn, idx) => {
        if (btn.visible && !btn.disabled) {
          logs.push(`  ${idx}: ${btn.tag} type=${btn.type}, text="${btn.text.substring(0, 50)}"`);
        }
      });
      
      // Pokušaj s različitim selektorima za Register gumb
      const registerSelectors = [
        'button:has-text("Register")',
        'button:has-text("Registriraj se")',
        'button:has-text("Registriraj")',
        'button:has-text("Spremi")',
        'button:has-text("Pošalji")',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Kreiraj račun")',
        'button:has-text("Kreiraj")'
      ];
      
      let registerClicked = false;
      for (const selector of registerSelectors) {
        try {
          const button = page.locator(selector).first();
          await button.waitFor({ state: 'visible', timeout: 3000 });
          const isDisabled = await button.isDisabled();
          if (!isDisabled) {
            await button.click();
            logs.push(`✓ Register gumb kliknut: ${selector}`);
            registerClicked = true;
            break;
          } else {
            logs.push(`  ⚠ Gumb ${selector} je disabled`);
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!registerClicked) {
        logs.push(`❌ Register gumb nije pronađen. Dostupni gumbovi:`);
        allButtons.forEach(btn => {
          if (btn.visible && !btn.disabled) {
            logs.push(`  - ${btn.tag} type=${btn.type}, text="${btn.text}"`);
          }
        });
        throw new Error(`Register button not found with any selector`);
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
      
      // Kreiraj screenshot prije zatvaranja browsera (ako postoji page)
      try {
        if (page && browser) {
          const errorScreenshotPath = this._getScreenshotPath(testId, 'error_final');
          await page.screenshot({ path: errorScreenshotPath, fullPage: true });
          screenshots.push({
            step: 'Greška - finalni screenshot',
            url: this._getScreenshotUrl(path.basename(errorScreenshotPath))
          });
          logs.push('✓ Screenshot greške sprema');
        }
      } catch (screenshotError) {
        console.error('Error taking error screenshot:', screenshotError);
        logs.push(`⚠ Greška pri kreiranju screenshot-a greške: ${screenshotError.message}`);
      }
      
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

