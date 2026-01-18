/**
 * Email Helper za Playwright testove
 * Omogućava pristup email inboxu i screenshot email poruka
 */

import { chromium } from '@playwright/test';

/**
 * Konfiguracija email pristupa
 */
export const EMAIL_CONFIG = {
  // IMAP pristup (za čitanje emaila)
  imap: {
    host: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
    secure: true,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '', // App password za Gmail
  },
  // SMTP pristup (za slanje emaila - opcionalno)
  smtp: {
    host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
    secure: false,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
  },
  // Test email servis (alternativa - Mailtrap, Mailosaur, itd.)
  testService: {
    apiKey: process.env.MAILTRAP_API_KEY || '',
    inboxId: process.env.MAILTRAP_INBOX_ID || '',
  }
};

/**
 * Dohvati email poruke iz inboxa
 * @param {Object} options - Opcije za pretraživanje
 * @returns {Promise<Array>} Lista email poruka
 */
export async function getEmails(options = {}) {
  const { from, subject, to, since } = options;
  
  // Ako koristimo Mailtrap ili drugi test email servis
  if (EMAIL_CONFIG.testService.apiKey) {
    return await getEmailsFromTestService(options);
  }
  
  // Ako koristimo IMAP direktno
  if (EMAIL_CONFIG.imap.user && EMAIL_CONFIG.imap.password) {
    return await getEmailsFromIMAP(options);
  }
  
  throw new Error('Email konfiguracija nije postavljena. Postavite EMAIL_USER i EMAIL_PASSWORD ili MAILTRAP_API_KEY.');
}

/**
 * Dohvati email poruke iz Mailtrap test servisa
 */
async function getEmailsFromTestService(options = {}) {
  const { from, subject, to } = options;
  const apiKey = EMAIL_CONFIG.testService.apiKey;
  const inboxId = EMAIL_CONFIG.testService.inboxId || '0';
  
  const url = `https://mailtrap.io/api/v1/inboxes/${inboxId}/messages`;
  const response = await fetch(url, {
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Mailtrap API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  let messages = data || [];
  
  // Filtriraj poruke
  if (from) {
    messages = messages.filter(msg => 
      msg.from_email?.includes(from) || msg.from_name?.includes(from)
    );
  }
  if (subject) {
    messages = messages.filter(msg => 
      msg.subject?.includes(subject)
    );
  }
  if (to) {
    messages = messages.filter(msg => 
      msg.to_email?.includes(to)
    );
  }
  
  return messages;
}

/**
 * Dohvati email poruke preko IMAP (zahtijeva imap-simple ili sličnu biblioteku)
 * Napomena: Playwright ne podržava direktno IMAP, treba koristiti Node.js biblioteku
 */
async function getEmailsFromIMAP(options = {}) {
  // Ovo zahtijeva dodatnu Node.js biblioteku (npr. imap-simple)
  // Za sada vraćamo prazan array i koristimo test email servis
  console.warn('IMAP pristup zahtijeva dodatnu biblioteku. Koristite test email servis (Mailtrap) umjesto toga.');
  return [];
}

/**
 * Pronađi email s verifikacijskim linkom
 * @param {string} emailAddress - Email adresa korisnika
 * @param {string} subjectPattern - Pattern za subject (npr. "Verifikacija" ili "Verify")
 * @returns {Promise<Object|null>} Email poruka s linkom ili null
 */
export async function findVerificationEmail(emailAddress, subjectPattern = 'verifikacija|verify|confirmation') {
  const emails = await getEmails({
    to: emailAddress,
    subject: subjectPattern
  });
  
  if (emails.length === 0) {
    return null;
  }
  
  // Vrati najnoviju poruku
  const latestEmail = emails.sort((a, b) => 
    new Date(b.created_at || b.sent_at) - new Date(a.created_at || a.sent_at)
  )[0];
  
  return latestEmail;
}

/**
 * Ekstraktiraj verifikacijski link iz email poruke
 * @param {Object} email - Email poruka objekt
 * @returns {string|null} Verifikacijski link ili null
 */
export function extractVerificationLink(email) {
  if (!email) return null;
  
  // Ako je Mailtrap format
  if (email.html_path || email.html_body) {
    const html = email.html_body || '';
    // Pronađi link koji sadrži "verify", "verification", "token", itd.
    const linkMatch = html.match(/href=["']([^"']*(?:verify|verification|token|confirm)[^"']*)["']/i);
    if (linkMatch) {
      return linkMatch[1];
    }
  }
  
  // Ako je text format
  if (email.text_body) {
    const text = email.text_body;
    const linkMatch = text.match(/(https?:\/\/[^\s]*(?:verify|verification|token|confirm)[^\s]*)/i);
    if (linkMatch) {
      return linkMatch[1];
    }
  }
  
  return null;
}

/**
 * Otvori email u browseru i napravi screenshot
 * @param {Object} page - Playwright page objekt
 * @param {Object} email - Email poruka
 * @param {string} screenshotPath - Putanja za screenshot
 * @returns {Promise<string>} Putanja do screenshot-a
 */
export async function screenshotEmail(page, email, screenshotPath = null) {
  if (!email) {
    throw new Error('Email objekt je potreban za screenshot');
  }
  
  // Ako je Mailtrap, otvori email preko web interfejsa
  if (EMAIL_CONFIG.testService.apiKey && email.id) {
    const inboxId = EMAIL_CONFIG.testService.inboxId || '0';
    const emailUrl = `https://mailtrap.io/inboxes/${inboxId}/messages/${email.id}`;
    
    await page.goto(emailUrl);
    await page.waitForLoadState('networkidle');
    
    // Screenshot cijele email poruke
    const path = screenshotPath || `test-results/screenshots/email-${email.id}-${Date.now()}.png`;
    await page.screenshot({ 
      path, 
      fullPage: true 
    });
    
    return path;
  }
  
  // Ako imamo HTML body, renderiraj ga u page
  if (email.html_body || email.html_path) {
    const html = email.html_body || '';
    
    // Kreiraj data URL za HTML
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    await page.goto(dataUrl);
    await page.waitForLoadState('networkidle');
    
    const path = screenshotPath || `test-results/screenshots/email-${email.id || Date.now()}.png`;
    await page.screenshot({ 
      path, 
      fullPage: true 
    });
    
    return path;
  }
  
  throw new Error('Email format nije podržan za screenshot');
}

/**
 * Pronađi email s reset linkom za lozinku
 * @param {string} emailAddress - Email adresa korisnika
 * @returns {Promise<Object|null>} Email poruka s reset linkom ili null
 */
export async function findPasswordResetEmail(emailAddress) {
  return await findVerificationEmail(emailAddress, 'reset|password|lozinka');
}

/**
 * Ekstraktiraj reset token iz email poruke
 * @param {Object} email - Email poruka objekt
 * @returns {string|null} Reset token ili null
 */
export function extractResetToken(email) {
  if (!email) return null;
  
  const link = extractVerificationLink(email);
  if (!link) return null;
  
  // Ekstraktiraj token iz URL-a
  const tokenMatch = link.match(/[?&]token=([^&]+)/i) || link.match(/\/reset[^\/]*\/([^\/\?]+)/i);
  if (tokenMatch) {
    return tokenMatch[1];
  }
  
  return null;
}

