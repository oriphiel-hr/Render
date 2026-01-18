/**
 * Email Helper za Playwright testove
 * Omogućava pristup email inboxu i screenshot email poruka
 */

// Email Helper za Playwright testove
// Ne koristi chromium direktno, već Playwright page objekt

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
  const { from, subject, to, inboxId } = options;
  const apiKey = EMAIL_CONFIG.testService.apiKey;
  
  if (!apiKey) {
    throw new Error('Mailtrap API Key nije postavljen. Postavi ga u Admin Panel → Test Podaci → Email Konfiguracija.');
  }
  
  // Koristi inboxId iz opcija ako je postavljen (za korisnika), inače koristi globalni
  const targetInboxId = inboxId || EMAIL_CONFIG.testService.inboxId || '0';
  
  console.log(`[EMAIL HELPER] Fetching emails from Mailtrap inbox ${targetInboxId}${to ? ` for ${to}` : ''}`);
  
  const url = `https://mailtrap.io/api/v1/inboxes/${targetInboxId}/messages`;
  const response = await fetch(url, {
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[EMAIL HELPER] Mailtrap API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Mailtrap API error: ${response.status} ${response.statusText}. Provjeri API Key i Inbox ID.`);
  }
  
  const data = await response.json();
  let messages = Array.isArray(data) ? data : (data?.messages || []);
  
  console.log(`[EMAIL HELPER] Found ${messages.length} messages in inbox ${targetInboxId}`);
  
  // Filtriraj poruke
  if (from) {
    const originalCount = messages.length;
    messages = messages.filter(msg => 
      msg.from_email?.toLowerCase().includes(from.toLowerCase()) || 
      msg.from_name?.toLowerCase().includes(from.toLowerCase())
    );
    console.log(`[EMAIL HELPER] Filtered by 'from' (${from}): ${originalCount} → ${messages.length}`);
  }
  if (subject) {
    const originalCount = messages.length;
    const subjectPattern = new RegExp(subject, 'i');
    messages = messages.filter(msg => 
      subjectPattern.test(msg.subject || '')
    );
    console.log(`[EMAIL HELPER] Filtered by 'subject' (${subject}): ${originalCount} → ${messages.length}`);
  }
  if (to) {
    const originalCount = messages.length;
    messages = messages.filter(msg => {
      const toEmail = msg.to_email?.toLowerCase() || '';
      const toName = msg.to_name?.toLowerCase() || '';
      const searchTo = to.toLowerCase();
      return toEmail.includes(searchTo) || toName.includes(searchTo);
    });
    console.log(`[EMAIL HELPER] Filtered by 'to' (${to}): ${originalCount} → ${messages.length}`);
  }
  
  // Sortiraj po datumu (najnovije prvo)
  messages.sort((a, b) => {
    const dateA = new Date(a.created_at || a.sent_at || 0);
    const dateB = new Date(b.created_at || b.sent_at || 0);
    return dateB - dateA;
  });
  
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
 * @param {string} emailAddress - Email adresa korisnika iz aplikacije
 * @param {string} subjectPattern - Pattern za subject (npr. "Verifikacija" ili "Verify")
 * @param {Object} userConfig - Konfiguracija korisnika (može sadržavati emailAccess, emailPassword, inboxId, mailtrapEmail, itd.)
 * @returns {Promise<Object|null>} Email poruka s linkom ili null
 */
export async function findVerificationEmail(emailAddress, subjectPattern = 'verifikacija|verify|confirmation', userConfig = null) {
  // Ako korisnik ima svoju email konfiguraciju, koristi je
  let options = {
    to: emailAddress, // Početna vrijednost - email adresa iz aplikacije
    subject: subjectPattern
  };
  
  // Ako korisnik ima Mailtrap email adresu, koristi je umjesto aplikacijske
  // Aplikacija bi trebala slati emailove na Mailtrap adresu
  if (userConfig && userConfig.mailtrapEmail) {
    options.to = userConfig.mailtrapEmail;
    console.log(`[EMAIL HELPER] Using Mailtrap email for ${emailAddress}: ${userConfig.mailtrapEmail}`);
  }
  
  // Ako korisnik ima svoj inboxId (npr. za Mailtrap)
  if (userConfig && userConfig.inboxId) {
    options.inboxId = userConfig.inboxId;
    console.log(`[EMAIL HELPER] Using custom inbox ID: ${userConfig.inboxId}`);
  }
  
  console.log(`[EMAIL HELPER] Searching for verification email to: ${options.to}, subject: ${subjectPattern}`);
  
  const emails = await getEmails(options);
  
  if (emails.length === 0) {
    console.log(`[EMAIL HELPER] No emails found for ${options.to}`);
    return null;
  }
  
  console.log(`[EMAIL HELPER] Found ${emails.length} emails for ${options.to}`);
  
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
    // Pronađi link koji sadrži "verify", "verification", "token", "confirm", "activate", itd.
    const linkPatterns = [
      /href=["']([^"']*(?:verify|verification|token|confirm|activate)[^"']*)["']/i,
      /href=["']([^"']*\/api\/[^"']*(?:verify|verification|token|confirm)[^"']*)["']/i,
      /href=["']([^"']*\/verify[^"']*)["']/i,
      /href=["']([^"']*\/confirm[^"']*)["']/i
    ];
    
    for (const pattern of linkPatterns) {
      const linkMatch = html.match(pattern);
      if (linkMatch && linkMatch[1]) {
        const link = linkMatch[1];
        console.log(`[EMAIL HELPER] Found verification link in HTML: ${link}`);
        return link;
      }
    }
  }
  
  // Ako je text format
  if (email.text_body) {
    const text = email.text_body;
    const linkPatterns = [
      /(https?:\/\/[^\s]*(?:verify|verification|token|confirm|activate)[^\s]*)/i,
      /(https?:\/\/[^\s]*\/api\/[^\s]*(?:verify|verification|token|confirm)[^\s]*)/i,
      /(https?:\/\/[^\s]*\/verify[^\s]*)/i,
      /(https?:\/\/[^\s]*\/confirm[^\s]*)/i
    ];
    
    for (const pattern of linkPatterns) {
      const linkMatch = text.match(pattern);
      if (linkMatch && linkMatch[1]) {
        const link = linkMatch[1];
        console.log(`[EMAIL HELPER] Found verification link in text: ${link}`);
        return link;
      }
    }
  }
  
  console.warn('[EMAIL HELPER] No verification link found in email');
  return null;
}

/**
 * Otvori email u browseru i napravi screenshot
 * @param {Object} page - Playwright page objekt
 * @param {Object} email - Email poruka
 * @param {string} screenshotPath - Putanja za screenshot
 * @param {Object} options - Dodatne opcije (inboxId za Mailtrap)
 * @returns {Promise<string>} Putanja do screenshot-a
 */
export async function screenshotEmail(page, email, screenshotPath = null, options = {}) {
  if (!email) {
    throw new Error('Email objekt je potreban za screenshot');
  }
  
  // Ako je Mailtrap, otvori email preko web interfejsa
  if (EMAIL_CONFIG.testService.apiKey && email.id) {
    const inboxId = options.inboxId || EMAIL_CONFIG.testService.inboxId || '0';
    const emailUrl = `https://mailtrap.io/inboxes/${inboxId}/messages/${email.id}`;
    
    console.log(`[EMAIL HELPER] Opening Mailtrap email in browser: ${emailUrl}`);
    await page.goto(emailUrl);
    await page.waitForLoadState('networkidle');
    
    // Screenshot cijele email poruke
    const path = screenshotPath || `test-results/screenshots/email-${email.id}-${Date.now()}.png`;
    await page.screenshot({ 
      path, 
      fullPage: true 
    });
    
    console.log(`[EMAIL HELPER] Screenshot saved: ${path}`);
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
    
    console.log(`[EMAIL HELPER] Screenshot saved: ${path}`);
    return path;
  }
  
  throw new Error('Email format nije podržan za screenshot');
}

/**
 * Otvori email link i automatski klikni na verifikacijski/reset link
 * @param {Object} page - Playwright page objekt
 * @param {Object} email - Email poruka
 * @param {string} linkPattern - Pattern za link (npr. 'verify', 'reset', 'confirm')
 * @param {Object} options - Dodatne opcije (inboxId za Mailtrap)
 * @returns {Promise<string|null>} URL na koji je kliknuto ili null
 */
export async function clickEmailLink(page, email, linkPattern = 'verify|verification|token|confirm|reset|activate', options = {}) {
  if (!email) {
    throw new Error('Email objekt je potreban za klik na link');
  }
  
  console.log(`[EMAIL HELPER] Clicking email link with pattern: ${linkPattern}`);
  
  // Prvo ekstraktiraj link
  let link = null;
  
  if (linkPattern.includes('verify') || linkPattern.includes('verification') || linkPattern.includes('confirm') || linkPattern.includes('activate')) {
    link = extractVerificationLink(email);
  } else if (linkPattern.includes('reset')) {
    link = extractResetToken(email);
    // Ako je token, treba kreirati puni URL
    if (link && !link.startsWith('http')) {
      // Pretpostavljamo da je reset endpoint na aplikaciji
      const baseUrl = options.baseUrl || 'https://www.uslugar.eu';
      link = `${baseUrl}/reset-password?token=${link}`;
    }
  }
  
  // Ako nismo pronašli specifičan link, traži bilo koji link koji odgovara patternu
  if (!link) {
    const html = email.html_body || '';
    const text = email.text_body || '';
    const combinedContent = html + ' ' + text;
    
    const linkPatternRegex = new RegExp(`(https?://[^\\s]*${linkPattern}[^\\s]*)`, 'i');
    const linkMatch = combinedContent.match(linkPatternRegex);
    if (linkMatch) {
      link = linkMatch[1];
      console.log(`[EMAIL HELPER] Found link matching pattern: ${link}`);
    }
  }
  
  if (!link) {
    console.error('[EMAIL HELPER] No link found matching pattern:', linkPattern);
    return null;
  }
  
  console.log(`[EMAIL HELPER] Opening link: ${link}`);
  
  // Otvori link u browseru
  await page.goto(link);
  await page.waitForLoadState('networkidle');
  
  // Screenshot nakon klika
  const screenshotPath = `test-results/screenshots/email-link-clicked-${Date.now()}.png`;
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true 
  });
  
  console.log(`[EMAIL HELPER] Link clicked, screenshot saved: ${screenshotPath}`);
  
  return link;
}

/**
 * Pronađi email s reset linkom za lozinku
 * @param {string} emailAddress - Email adresa korisnika
 * @param {Object} userConfig - Konfiguracija korisnika (može sadržavati emailAccess, emailPassword, inboxId, itd.)
 * @returns {Promise<Object|null>} Email poruka s reset linkom ili null
 */
export async function findPasswordResetEmail(emailAddress, userConfig = null) {
  return await findVerificationEmail(emailAddress, 'reset|password|lozinka', userConfig);
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

