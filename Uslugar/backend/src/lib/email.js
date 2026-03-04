import nodemailer from 'nodemailer';

// Osnovni URL za frontend (public site)
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'https://www.uslugar.eu';

// Jedinstveni HTML logo (stil kao na početnoj stranici)
const EMAIL_LOGO_HTML = `
  <div style="text-align:center;margin-bottom:20px;">
    <div style="display:inline-flex;align-items:center;gap:12px;">
      <div style="
        width:40px;
        height:40px;
        border-radius:16px;
        background:linear-gradient(135deg,#10B981,#0EA5E9,#2563EB);
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 4px 10px rgba(16,185,129,0.4);
      ">
        <span style="color:#ffffff;font-weight:800;font-size:20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          U
        </span>
      </div>
      <div style="text-align:left;">
        <div style="
          font-size:20px;
          font-weight:800;
          color:#111827;
          font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        ">
          Uslugar
        </div>
        <div style="
          font-size:10px;
          letter-spacing:0.18em;
          text-transform:uppercase;
          color:#059669;
          font-weight:600;
          font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        ">
          Marketplace usluga
        </div>
      </div>
    </div>
  </div>
`;

// Kreiraj transporter (koristimo produkcijski SMTP, Mailpit samo za lokalne/test instance)
// Za testiranje lokalno koristi Mailpit varijable: MAILPIT_SMTP_HOST, MAILPIT_SMTP_PORT, MAILPIT_SMTP_USER
// U produkciji (NODE_ENV === 'production') uvijek koristi standardne SMTP varijable: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const createTransporter = () => {
  const isProd = process.env.NODE_ENV === 'production';

  // U produkciji ignoriraj Mailpit i koristi pravi SMTP
  const host = isProd
    ? (process.env.SMTP_HOST || 'smtp.gmail.com')
    : (process.env.MAILPIT_SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com');

  const port = parseInt(
    isProd
      ? (process.env.SMTP_PORT || '587')
      : (process.env.MAILPIT_SMTP_PORT || process.env.SMTP_PORT || '587')
  );

  const user = isProd
    ? process.env.SMTP_USER
    : (process.env.MAILPIT_SMTP_USER || process.env.SMTP_USER);

  const pass = isProd
    ? process.env.SMTP_PASS
    : (process.env.MAILPIT_SMTP_PASS || process.env.SMTP_PASS);
  
  if (!user) {
    console.warn('SMTP not configured - email notifications disabled');
    return null;
  }
  
  const isSSL = port === 465;
  
  // Mailpit ne zahtijeva autentifikaciju i koristi port 1025
  const isMailpit = !isProd && (port === 1025 || !!process.env.MAILPIT_SMTP_HOST);
  
  const transporterConfig = {
    host: host,
    port: port,
    secure: isSSL, // true for 465 (SSL), false for 587 (STARTTLS)
    connectionTimeout: 15000, // 15s – da ne visi beskonačno ako provider blokira
    greetingTimeout: 10000,
    ...(port === 587 ? { requireTLS: true } : {}), // eksplicitno STARTTLS za 587
    ...(isMailpit ? {} : {
      auth: {
        user: user,
        pass: pass
      }
    })
  };
  
  if (isProd && user) {
    console.log('[SMTP] Production config:', host, 'port', port, 'secure', isSSL);
  }
  
  if (isMailpit) {
    console.log('[SMTP] Using Mailpit for email testing (no auth required)');
    console.log(`[SMTP] Mailpit host: ${host}, port: ${port}, from: ${user}`);
  }
  
  return nodemailer.createTransport(transporterConfig);
};

const transporter = createTransporter();

// U produkciji uvijek šalji s SMTP_USER (nikad MAILPIT_SMTP_USER), inače Hostinger odbija "Sender address rejected: Domain not found"
const getFromEmail = () =>
  process.env.NODE_ENV === 'production'
    ? (process.env.SMTP_USER || 'uslugar@oriphiel.hr')
    : (process.env.MAILPIT_SMTP_USER || process.env.SMTP_USER);

// Template funkcije za različite tipove emailova
export const sendJobNotification = async (toEmail, jobTitle, jobUrl) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping email:', toEmail, jobTitle);
    return; // Skip if not configured
  }

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Novi posao: ${jobTitle}`,
      html: `
        <h2>Novi posao u vašoj kategoriji!</h2>
        <p><strong>${jobTitle}</strong></p>
        <p>Netko traži uslugu u vašoj kategoriji. Prijavite se i pošaljite ponudu!</p>
        <a href="${jobUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Pogledaj posao</a>
      `
    });
    console.log('Email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendOfferNotification = async (toEmail, jobTitle, providerName, offerAmount) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping email:', toEmail);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Nova ponuda za: ${jobTitle}`,
      html: `
        <h2>Primili ste novu ponudu!</h2>
        <p><strong>${providerName}</strong> je poslao ponudu za vaš posao: <strong>${jobTitle}</strong></p>
        <p>Cijena: <strong>${offerAmount} EUR</strong></p>
        <p>Prijavite se da pregledate ponudu i odaberete izvođača.</p>
      `
    });
    console.log('Offer notification sent to:', toEmail);
  } catch (error) {
    console.error('Error sending offer notification:', error);
  }
};

export const sendOfferAcceptedNotification = async (toEmail, jobTitle, customerName) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping email:', toEmail);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Ponuda prihvaćena: ${jobTitle}`,
      html: `
        <h2>Vaša ponuda je prihvaćena!</h2>
        <p><strong>${customerName}</strong> je prihvatio vašu ponudu za posao: <strong>${jobTitle}</strong></p>
        <p>Kontaktirajte korisnika i dogovorite detalje izvršenja posla.</p>
      `
    });
    console.log('Acceptance notification sent to:', toEmail);
  } catch (error) {
    console.error('Error sending acceptance notification:', error);
  }
};

export const sendJobCompletedEmail = async (toEmail, fullName, jobTitle) => {
  if (!transporter) return;
  try {
    const jobsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#my-jobs`;
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Posao završen: ${jobTitle}`,
      html: `
        <h2>Posao završen</h2>
        <p>Poštovani/na <strong>${fullName}</strong>,</p>
        <p>Posao <strong>${jobTitle}</strong> je označen kao završen.</p>
        <p><a href="${jobsUrl}" style="color: #4CAF50;">Pregled mojih poslova</a></p>
      `
    });
    console.log('Job completed email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending job completed email:', error);
  }
};

export const sendJobCancelledEmail = async (toEmail, fullName, jobTitle, reason = null) => {
  if (!transporter) return;
  try {
    const jobsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#my-jobs`;
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Posao otkazan: ${jobTitle}`,
      html: `
        <h2>Posao otkazan</h2>
        <p>Poštovani/na <strong>${fullName}</strong>,</p>
        <p>Posao <strong>${jobTitle}</strong> je otkazan od strane naručitelja.${reason ? ` Razlog: ${reason}` : ''}</p>
        <p><a href="${jobsUrl}" style="color: #4CAF50;">Pregled mojih poslova</a></p>
      `
    });
    console.log('Job cancelled email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending job cancelled email:', error);
  }
};

export const sendJobAlertEmail = async (toEmail, fullName, alertName, jobs) => {
  if (!transporter) return;
  if (!jobs || jobs.length === 0) return;

  try {
    const jobsUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#user`;
    const listItems = jobs
      .slice(0, 10)
      .map(
        j =>
          `<li><strong>${escapeHtml(j.title)}</strong>${j.category?.name ? ` (${escapeHtml(j.category.name)})` : ''}${j.city ? ` – ${escapeHtml(j.city)}` : ''}</li>`
      )
      .join('');
    const more = jobs.length > 10 ? `<p>... i još ${jobs.length - 10} poslova.</p>` : '';

    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Novi poslovi za "${alertName}" – Uslugar`,
      html: `
        <h2>Novi poslovi prema vašoj pretrazi</h2>
        <p>Poštovani/na <strong>${escapeHtml(fullName)}</strong>,</p>
        <p>Pronađeno je <strong>${jobs.length}</strong> novih poslova koji odgovaraju alertu "${escapeHtml(alertName)}":</p>
        <ul>${listItems}</ul>
        ${more}
        <p><a href="${jobsUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Pogledaj poslove</a></p>
      `
    });
    console.log('Job alert email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending job alert email:', error);
    throw error;
  }
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const sendProviderRegistrationStatusEmail = async (toEmail, fullName, approved, reason = null) => {
  if (!transporter) return;
  try {
    const subject = approved ? 'Registracija odobrena - Uslugar' : 'Registracija odbijena - Uslugar';
    const msg = approved
      ? 'Vaša registracija kao pružatelj usluga je odobrena! Sada možete koristiti platformu i prikazivati svoje usluge.'
      : `Vaša registracija je odbijena.${reason ? ` Razlog: ${reason}` : ''}`;
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject,
      html: `
        <h2>${approved ? 'Registracija odobrena!' : 'Registracija odbijena'}</h2>
        <p>Poštovani/na <strong>${fullName}</strong>,</p>
        <p>${msg}</p>
      `
    });
    console.log('Provider registration status email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending provider registration status email:', error);
  }
};

export const sendInvoiceEmail = async (toEmail, fullName, invoice, pdfBuffer) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping invoice email:', toEmail);
    return;
  }

  try {
    const invoiceAmount = (invoice.totalAmount / 100).toFixed(2);
    // Vodi na listu faktura u novom frontendu
    const invoiceUrl = `${FRONTEND_BASE_URL}#invoices`;

    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Faktura ${invoice.invoiceNumber} - Uslugar`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
            ${EMAIL_LOGO_HTML}
            <h2 style="color: #333; margin-top: 0;">Faktura je generirana</h2>
            <p>Poštovani/na <strong>${fullName}</strong>,</p>
            <p>Vaša faktura <strong>${invoice.invoiceNumber}</strong> je generirana i priložena u ovom emailu.</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <p style="margin: 5px 0;"><strong>Broj fakture:</strong> ${invoice.invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Datum izdavanja:</strong> ${new Date(invoice.issueDate).toLocaleDateString('hr-HR')}</p>
              <p style="margin: 5px 0;"><strong>Rok plaćanja:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('hr-HR') : 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Iznos:</strong> ${invoiceAmount} €</p>
            </div>

            <p>Fakturu možete preuzeti u PDF formatu klikom na link ispod ili priloženu datoteku.</p>
            <a href="${invoiceUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Pregledaj fakturu</a>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Hvala vam na povjerenju!<br>
              Uslugar tim
            </p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Faktura-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
    console.log('Invoice email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};

export const sendReviewNotification = async (toEmail, rating, comment, reviewerName) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping email:', toEmail);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Primili ste novu recenziju',
      html: `
        <h2>Nova recenzija!</h2>
        <p><strong>${reviewerName}</strong> vam je ostavio recenziju.</p>
        <p>Ocjena: ${'⭐'.repeat(rating)}</p>
        ${comment ? `<p>Komentar: "${comment}"</p>` : ''}
        <p>Prijavite se da vidite više detalja.</p>
      `
    });
    console.log('Review notification sent to:', toEmail);
  } catch (error) {
    console.error('Error sending review notification:', error);
  }
};

/**
 * NOTE: sendInvoiceEmail is already defined above (line 99)
 * Duplicate function removed to fix SyntaxError: Identifier 'sendInvoiceEmail' has already been declared
 */

export const sendVerificationEmail = async (toEmail, fullName, verificationToken) => {
  if (!transporter) {
    const error = new Error('SMTP nije konfiguriran. Email verifikacija zahtijeva SMTP postavke.');
    console.error('SMTP not configured - cannot send verification email to:', toEmail);
    throw error;
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#verify?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Potvrdite vašu email adresu - Uslugar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Dobrodošli na Uslugar!</h1>
            
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${fullName}</strong>,</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Hvala što ste se registrirali na Uslugar platformu! 
              Da biste aktivirali svoj račun, molimo potvrdite vašu email adresu klikom na button ispod.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;">
                Potvrdi email adresu
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              Ako button ne radi, kopirajte i zalijepite sljedeći link u vaš browser:
            </p>
            <p style="font-size: 12px; color: #0066cc; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              <strong>Link istječe za 24 sata.</strong>
            </p>
            
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              Ako niste zatražili registraciju, ignorirajte ovu poruku.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Uslugar - Platforma za pronalaženje lokalnih pružatelja usluga
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Verification email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error; // Throw da register endpoint zna da je email failed
  }
};

/**
 * Pošalji email potvrdu nakon uspješne verifikacije
 * Korisnik prima poruku da je članstvo aktivirano
 */
export const sendVerificationConfirmationEmail = async (toEmail, fullName) => {
  if (!transporter) {
    console.warn('SMTP not configured - skipping verification confirmation email to:', toEmail);
    return;
  }

  const loginUrl = `${FRONTEND_BASE_URL}#login`;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Članstvo aktivirano - Uslugar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 10px; border-left: 4px solid #22c55e;">
            <h1 style="color: #166534; margin-bottom: 20px;">✅ Članstvo aktivirano!</h1>
            
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${fullName || 'korisniče'}</strong>,</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Vaš email je uspješno verificiran. Vaše članstvo na Uslugar platformi je sada aktivirano!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #22c55e; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;">
                Prijavi se
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              Možete se sada prijaviti s vašom email adresom i lozinkom.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Uslugar - Platforma za pronalaženje lokalnih pružatelja usluga
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Verification confirmation email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending verification confirmation email:', error);
  }
};

/**
 * Send company email verification email
 * @param {string} toEmail - Company email address to verify
 * @param {string} fullName - Full name of the user
 * @param {string} verificationToken - Verification token
 * @param {string} companyName - Company name (optional)
 */
export const sendCompanyEmailVerification = async (toEmail, fullName, verificationToken, companyName = null) => {
  if (!transporter) {
    const error = new Error('SMTP nije konfiguriran. Email verifikacija zahtijeva SMTP postavke.');
    console.error('SMTP not configured - cannot send company email verification to:', toEmail);
    throw error;
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#verify-company-email?token=${verificationToken}`;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Potvrdite email adresu na domeni tvrtke - Uslugar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Verifikacija email adrese na domeni tvrtke</h1>
            
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${fullName}</strong>,</p>
            
            ${companyName ? `<p style="font-size: 16px; color: #555; line-height: 1.6;">
              Primili smo zahtjev za verifikaciju email adrese na domeni vaše tvrtke <strong>${companyName}</strong>.
            </p>` : ''}
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Da biste potvrdili vlasništvo nad email adresom <strong>${toEmail}</strong> i dobili Business Email Badge, 
              molimo kliknite na button ispod.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-size: 16px;
                        font-weight: bold;">
                Potvrdi email adresu
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; line-height: 1.6;">
              Ili kopirajte i zalijepite ovaj link u vaš browser:<br>
              <a href="${verificationUrl}" style="color: #4CAF50; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Važno:</strong> Ovaj link istječe za 24 sata. Ako link istekne, možete zatražiti novi verifikacijski email.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #888; line-height: 1.6; margin-top: 30px;">
              Ako niste zatražili verifikaciju email adrese, možete sigurno ignorirati ovaj email.
            </p>
            
            <p style="font-size: 14px; color: #888; line-height: 1.6; margin-top: 20px;">
              Hvala vam na povjerenju!<br>
              <strong>Uslugar tim</strong>
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Company email verification sent to:', toEmail);
  } catch (error) {
    console.error('Error sending company email verification:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (toEmail, fullName, resetToken) => {
  if (!transporter) {
    const error = new Error('SMTP nije konfiguriran. Password reset zahtijeva SMTP postavke.');
    console.error('SMTP not configured - cannot send password reset email to:', toEmail);
    throw error;
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Resetirajte vašu lozinku - Uslugar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Resetiranje lozinke</h1>
            
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${fullName}</strong>,</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Zaprimili smo zahtjev za resetiranje vaše lozinke. 
              Kliknite na button ispod da postavite novu lozinku.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563EB; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;">
                Resetiraj lozinku
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; margin-top: 30px;">
              Ako button ne radi, kopirajte i zalijepite sljedeći link u vaš browser:
            </p>
            <p style="font-size: 12px; color: #0066cc; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 30px 0; border-radius: 5px;">
              <p style="font-size: 14px; color: #92400E; margin: 0;">
                <strong>Važno:</strong> Link istječe za 1 sat.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              Ako niste zatražili resetiranje lozinke, ignorirajte ovu poruku. 
              Vaša lozinka ostaje nepromijenjena.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Uslugar - Platforma za pronalaženje lokalnih pružatelja usluga
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Password reset email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendLoggedInJobConfirmationEmail = async (toEmail, fullName, jobTitle, jobId) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping job confirmation email:', toEmail);
    return;
  }

  const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#my-jobs`;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Posao kreiran: ${jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Posao kreiran uspješno! ✅</h1>

            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${fullName}</strong>,</p>

            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Vaš upit <strong>${jobTitle}</strong> je objavljen.
            </p>

            <div style="background-color: #E0F2FE; border-left: 4px solid #0EA5E9; padding: 20px; margin: 30px 0; border-radius: 5px;">
              <p style="font-size: 15px; color: #0369A1; margin: 0;">
                Pružatelji usluga će vidjeti vaš upit i moći će vam poslati ponude. Primit ćete obavijest emailom kada netko pošalje ponudu.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${jobUrl}"
                 style="background-color: #4CAF50;
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;">
                Pregled mojih poslova
              </a>
            </div>

            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              Uslugar - Platforma za pronalaženje lokalnih pružatelja usluga
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Job confirmation email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending job confirmation email:', error);
  }
};

export const sendAnonymousJobConfirmationEmail = async (toEmail, contactName, jobTitle, jobId) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping anonymous job confirmation email:', toEmail);
    return;
  }

  // Create a unique token for linking the job to an account after registration
  const crypto = await import('crypto');
  const linkingToken = crypto.randomBytes(32).toString('hex');
  
  // Store the linking token temporarily (in production, use Redis or similar)
  // For now, we'll include it in the email and verify it during registration
  
  const registerUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#register?linkJob=${jobId}&token=${linkingToken}`;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Hvala na upitu - Uslugar',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Hvala na upitu! 👋</h1>
            
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${contactName}</strong>,</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Vaš upit za <strong>${jobTitle}</strong> je uspješno kreiran! 🎉
            </p>
            
            <div style="background-color: #E0F2FE; border-left: 4px solid #0EA5E9; padding: 20px; margin: 30px 0; border-radius: 5px;">
              <p style="font-size: 15px; color: #0369A1; margin: 0;">
                <strong>🗣️ Pružatelji usluga su sada u mogućnosti vidjeti vaš upit i poslati vam ponude!</strong>
              </p>
            </div>
            
            <h2 style="color: #333; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">
              Što dalje?
            </h2>
            
            <ul style="font-size: 16px; color: #555; line-height: 1.8;">
              <li>Pružatelji usluga će vidjeti vaš upit i moći će vam poslati ponude</li>
              <li>Primit ćete notifikacije o novim ponudama na email <strong>${toEmail}</strong></li>
              <li>Možete pregledati i usporediti ponude dok ne odaberete najbolju</li>
            </ul>
            
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 30px 0; border-radius: 5px;">
              <p style="font-size: 15px; color: #92400E; margin: 0;">
                <strong>💡 Prijava na Uslugar:</strong> Prijavite se za lakše upravljanje upitima i pregled ponuda!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registerUrl}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;">
                Registriraj se i poveži upit
              </a>
            </div>
            
            <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
              Prijavom ćete moći upravljati svojim upitima i brže odgovarati na ponude.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              Ako imate pitanja, slobodno nam se obratite.
            </p>
            
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              Uslugar - Platforma za pronalaženje lokalnih pružatelja usluga<br>
              © ${new Date().getFullYear()} Uslugar. Sva prava pridržana.
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Anonymous job confirmation email sent to:', toEmail);
    
    // Return the linking token for storage
    return linkingToken;
  } catch (error) {
    console.error('Error sending anonymous job confirmation email:', error);
    return null;
  }
};

// Get plan-specific features
const getPlanFeatures = (planName) => {
  const features = {
    'BASIC': [
      '10 ekskluzivnih leadova mjesečno',
      'Pregled leadova bez konkurencije',
      'Kontakt direktno klijenta',
      'Email notifikacije za nove leadove'
    ],
    'PREMIUM': [
      '25 ekskluzivnih leadova mjesečno',
      'Pregled leadova bez konkurencije',
      'Kontakt direktno klijenta',
      'AI-kvaliteta leadova',
      'ROI statistika'
    ],
    'PRO': [
      '50 ekskluzivnih leadova mjesečno',
      'Pregled leadova bez konkurencije',
      'Kontakt direktno klijenta',
      'AI-kvaliteta leadova',
      'ROI statistika',
      'Prioritetni support'
    ]
  };
  
  return features[planName] || features['BASIC'];
};

export const sendPaymentConfirmationEmail = async (toEmail, fullName, planName, amount, credits) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping payment confirmation email:', toEmail);
    return;
  }

  const features = getPlanFeatures(planName);

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Potvrda plaćanja - ${planName} pretplata`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            ${EMAIL_LOGO_HTML}
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4CAF50; font-size: 32px; margin: 0;">🎉 Hvala vam!</h1>
            </div>
            
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${fullName}</strong>,</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Vaša pretplata na <strong>${planName}</strong> je uspješno aktivirana! 🎉
            </p>
            
            <div style="background-color: #E8F5E9; border-left: 4px solid #4CAF50; padding: 20px; margin: 30px 0; border-radius: 5px;">
              <h2 style="color: #2E7D32; font-size: 24px; margin: 0 0 15px 0;">Detalji pretplate:</h2>
              <p style="font-size: 16px; color: #555; margin: 10px 0;">
                <strong>Plan:</strong> ${planName}
              </p>
              <p style="font-size: 16px; color: #555; margin: 10px 0;">
                <strong>Cijena:</strong> ${amount}€
              </p>
              <p style="font-size: 16px; color: #555; margin: 10px 0;">
                <strong>Krediti:</strong> ${credits}
              </p>
            </div>
            
            <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 20px; margin: 30px 0; border-radius: 5px;">
              <p style="font-size: 15px; color: #856404; margin: 0;">
                <strong>💡 Sada možete:</strong><br>
                ${features.map(f => `• ${f}`).join('<br>')}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_BASE_URL}#login?redirect=leads" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;">
                Pregledaj leadove →
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              Ako imate pitanja ili trebate pomoć, slobodno nam se obratite.
            </p>
            
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              Uslugar - Ekskluzivni leadovi bez konkurencije<br>
              © ${new Date().getFullYear()} Uslugar. Sva prava pridržana.
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[OK] Payment confirmation email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
};

// Pozivnica članu tima (direktor → potencijalni član)
export const sendTeamInviteEmail = async (toEmail, directorName, companyName = null, inviteToken) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping team invite email:', toEmail);
    return;
  }

  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.uslugar.eu';
    const registerUrl = `${baseUrl}/#register-user?teamInvite=${inviteToken || ''}&email=${encodeURIComponent(toEmail)}`;
    const upgradeUrl = `${baseUrl}/#upgrade-to-provider?teamInvite=${inviteToken || ''}`;

    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Pozivnica u tim na Uslugarru`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin:0 auto; padding:20px; background:#f9fafb;">
          <div style="background:#ffffff; padding:24px; border-radius:8px; box-shadow:0 2px 4px rgba(15,23,42,0.08);">
            ${EMAIL_LOGO_HTML}
            <h1 style="margin:0 0 16px 0; font-size:22px; color:#111827; text-align:center;">Pozivnica u tim</h1>
            <p>Poštovani/a,</p>
            <p>
              ${companyName ? `<strong>${directorName}</strong> iz tvrtke <strong>${companyName}</strong>` : `<strong>${directorName}</strong>`}
              želi vas dodati kao člana tima na platformi <strong>Uslugar</strong>.
            </p>
            <p style="margin-top:16px;">
              Ako već imate račun pružatelja usluga, samo se prijavite na Uslugar i direktor će vas dodati u tim putem vaše email adrese <strong>${toEmail}</strong>.
            </p>
            <p style="margin-top:16px;">
              Ako još nemate račun, možete se registrirati kao korisnik i potom nadograditi na pružatelja usluga:
            </p>
            <ol style="margin:16px 0 24px 20px; padding:0;">
              <li>Registrirajte se na Uslugar koristeći email adresu <strong>${toEmail}</strong>:
                <br/><a href="${registerUrl}" style="color:#4CAF50;">${registerUrl}</a>
              </li>
              <li>Nakon prijave, odaberite opciju <strong>"Postani pružatelj"</strong>:
                <br/><a href="${upgradeUrl}" style="color:#4CAF50;">${upgradeUrl}</a>
              </li>
            </ol>
            <p>Nakon što dovršite registraciju kao pružatelj, direktor će vas moći dodati u tim u nekoliko klikova.</p>
            <p style="margin-top:24px; font-size:12px; color:#6b7280;">
              Ako niste očekivali ovu poruku, možete je slobodno ignorirati.
            </p>
          </div>
        </body>
        </html>
      `
    });

    console.log('Team invite email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending team invite email:', error);
  }
};

// Dnevni podsjetnik za leadove (Mini CRM - nextStepAt)
export const sendLeadReminderEmail = async (user, leads) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping lead reminder email for:', user.email);
    return;
  }

  if (!leads || leads.length === 0) return;

  const baseUrl = process.env.FRONTEND_URL || 'https://www.uslugar.eu';

  const rowsHtml = leads.map(p => {
    const job = p.job || {};
    const nextStep = p.nextStep || 'Nema definiranog sljedećeg koraka';
    const nextStepAt = p.nextStepAt
      ? new Date(p.nextStepAt).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Bez datuma';
    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${job.title || ''}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${nextStep}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${nextStepAt}</td>
      </tr>
    `;
  }).join('');

  const subject = '📅 Danas nazovi ove leadove (Mini CRM podsjetnik)';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; padding:24px; background:#f9fafb;">
      <div style="background:#ffffff; padding:24px; border-radius:12px; box-shadow:0 2px 4px rgba(15,23,42,0.08);">
        ${EMAIL_LOGO_HTML}
        <h1 style="margin:0 0 16px 0; font-size:22px; color:#111827;">Mini CRM podsjetnik</h1>
        <p style="font-size:15px; color:#111827; margin-top:0;">
          Poštovani/na <strong>${user.fullName || ''}</strong>,
        </p>
        <p style="font-size:14px; color:#4B5563;">
          Na temelju vaših podsjetnika u <strong>Mini CRM-u</strong>, danas imate sljedeće leadove za kontaktiranje ili praćenje:
        </p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <thead>
            <tr>
              <th align="left" style="padding:8px 12px; border-bottom:2px solid #3B82F6; font-size:13px; color:#111827;">Lead</th>
              <th align="left" style="padding:8px 12px; border-bottom:2px solid #3B82F6; font-size:13px; color:#111827;">Sljedeći korak</th>
              <th align="left" style="padding:8px 12px; border-bottom:2px solid #3B82F6; font-size:13px; color:#111827;">Podsjetnik</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <p style="font-size:14px; color:#4B5563; margin-top:20px;">
          Otvorite „Moji ekskluzivni leadovi” kako biste ažurirali status, dodali bilješke ili kontaktirali klijente:
        </p>
        <div style="text-align:center; margin:24px 0;">
          <a href="${baseUrl}/#my-leads"
             style="background:#3B82F6; color:#fff; padding:12px 32px; border-radius:999px; text-decoration:none; font-weight:bold; font-size:15px; display:inline-block;">
            📂 Otvori Moje leadove
          </a>
        </div>
        <p style="font-size:12px; color:#9CA3AF; margin-top:24px; text-align:center;">
          Ako ne želite primati ove podsjetnike, obratite se podršci ili promijenite postavke u svom profilu.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: user.email,
      subject,
      html
    });
    console.log(`📧 Lead reminder email sent to: ${user.email} (${leads.length} leadova)`);
  } catch (error) {
    console.error('Error sending lead reminder email:', error);
  }
};

/**
 * Pošalji email notifikaciju za refund subscription payment-a
 */
export const sendSubscriptionRefundEmail = async (toEmail, fullName, planName, refundAmount, stripeRefundId, reason) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping refund email:', toEmail);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: `Povrat novca za pretplatu ${planName} - Uslugar`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #FF6B6B; margin-top: 0;">Povrat novca za pretplatu</h2>
            <p>Poštovani/na ${fullName},</p>
            <p>Vaš zahtjev za povrat novca za pretplatu <strong>${planName}</strong> je uspješno obrađen.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
              <p style="margin: 5px 0;"><strong>Iznos refunda:</strong> <strong style="color: #4CAF50; font-size: 18px;">${refundAmount.toFixed(2)} €</strong></p>
              ${stripeRefundId ? `<p style="margin: 5px 0;"><strong>Stripe Refund ID:</strong> ${stripeRefundId}</p>` : ''}
              ${reason ? `<p style="margin: 5px 0;"><strong>Razlog:</strong> ${reason}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Datum:</strong> ${new Date().toLocaleDateString('hr-HR')}</p>
            </div>

            <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0; color: #1565C0;">
                <strong>ℹ️ Informacije o povratu:</strong><br>
                Povrat sredstava provodi se putem Stripe Payments Europe Ltd., u skladu s PSD2 pravilima.
                Sredstva će biti vraćena na originalnu karticu u roku od 5-10 radnih dana.
              </p>
            </div>

            <p>Vaša pretplata je otkazana, a svi krediti su oduzeti.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_BASE_URL}#subscription" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 16px;
                        display: inline-block;">
                Pregledaj pretplate
              </a>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Ako imate pitanja o povratu, slobodno nas kontaktirajte.<br>
              Hvala vam na razumijevanju!<br>
              Uslugar tim
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log(`Subscription refund email sent to: ${toEmail}`);
  } catch (error) {
    console.error('Error sending subscription refund email:', error);
    throw error;
  }
};

/**
 * Pošalji upsell email za add-on koji ističe
 * @param {String} toEmail - Email adresa korisnika
 * @param {String} fullName - Ime korisnika
 * @param {Object} addon - Add-on objekt
 * @param {Number} daysLeft - Broj dana do isteka
 * @param {Boolean} isExpired - Da li je već istekao
 * @param {Boolean} isGracePeriod - Da li je u grace periodu
 * @param {String} renewalUrl - URL za obnovu add-ona
 * @param {String} upgradeUrl - URL za upgrade pretplate
 */
export const sendAddonUpsellEmail = async (
  toEmail,
  fullName,
  addon,
  daysLeft,
  isExpired = false,
  isGracePeriod = false,
  renewalUrl,
  upgradeUrl
) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping upsell email:', toEmail);
    return;
  }

  try {
    const addonType = addon.type === 'REGION' ? 'Regija' : addon.type === 'CATEGORY' ? 'Kategorija' : 'Krediti';
    const discountPercent = isGracePeriod ? 10 : daysLeft === 3 ? 5 : 0;
    
    let subject, heading, bodyText, ctaText;
    
    if (isGracePeriod) {
      subject = `🚨 ${addon.displayName} - Posljednja prilika za obnovu!`;
      heading = 'Posljednja prilika!';
      bodyText = `Vaš add-on "${addon.displayName}" ističe uskoro. Obnovite sada i dobijte <strong>10% popusta</strong>!`;
      ctaText = 'Obnovi sada - 10% popust';
    } else if (isExpired) {
      subject = `⏰ ${addon.displayName} je istekao - Obnovite sada!`;
      heading = 'Vaš add-on je istekao';
      bodyText = `Vaš add-on "${addon.displayName}" je istekao. Obnovite sada i nastavite koristiti sve funkcionalnosti!`;
      ctaText = 'Obnovi add-on';
    } else if (daysLeft === 7) {
      subject = `📅 ${addon.displayName} ističe za ${daysLeft} dana`;
      heading = `Vaš add-on ističe za ${daysLeft} dana`;
      bodyText = `Vaš add-on "${addon.displayName}" ističe za ${daysLeft} dana. Obnovite sada i osigurajte kontinuitet!`;
      ctaText = 'Obnovi add-on';
    } else if (daysLeft === 3) {
      subject = `⏳ ${addon.displayName} ističe za ${daysLeft} dana - Specijalna ponuda!`;
      heading = `Vaš add-on ističe za ${daysLeft} dana`;
      bodyText = `Vaš add-on "${addon.displayName}" ističe za ${daysLeft} dana. Obnovite sada i dobijte <strong>5% popusta</strong>!`;
      ctaText = 'Obnovi sada - 5% popust';
    } else {
      subject = `📢 ${addon.displayName} ističe uskoro`;
      heading = 'Vaš add-on ističe uskoro';
      bodyText = `Vaš add-on "${addon.displayName}" ističe uskoro. Obnovite sada!`;
      ctaText = 'Obnovi add-on';
    }

    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">USLUGAR</h1>
          </div>
          <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">${heading}</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">Poštovani/na <strong>${fullName}</strong>,</p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">${bodyText}</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4CAF50;">
              <p style="margin: 0; color: #333; font-size: 14px;"><strong>Tip add-ona:</strong> ${addonType}</p>
              <p style="margin: 5px 0 0 0; color: #333; font-size: 14px;"><strong>Naziv:</strong> ${addon.displayName}</p>
              ${addon.validUntil ? `<p style="margin: 5px 0 0 0; color: #333; font-size: 14px;"><strong>Ističe:</strong> ${new Date(addon.validUntil).toLocaleDateString('hr-HR')}</p>` : ''}
              ${discountPercent > 0 ? `<p style="margin: 10px 0 0 0; color: #4CAF50; font-size: 16px; font-weight: bold;">🎉 Specijalna ponuda: ${discountPercent}% popusta!</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${renewalUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin: 10px;">${ctaText}</a>
            </div>

            <p style="color: #999; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Ili razmislite o <a href="${upgradeUrl}" style="color: #4CAF50; text-decoration: none;">nadogradnji pretplate</a> za još više funkcionalnosti!
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
              Ako imate pitanja, kontaktirajte nas na <a href="mailto:support@uslugar.hr" style="color: #4CAF50;">support@uslugar.hr</a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Uslugar. Sva prava pridržana.</p>
          </div>
        </body>
        </html>
      `
    });
    console.log('Add-on upsell email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending add-on upsell email:', error);
    throw error;
  }
};

/**
 * Potvrda korisniku nakon slanja kontakt forme
 */
export const sendContactConfirmationToUser = async (toEmail, name) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping contact confirmation email:', toEmail);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      subject: 'Hvala na upitu - Uslugar',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Hvala na poruci! 👋</h1>
            <p style="font-size: 16px; color: #555;">Poštovani/a <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Primili smo vaš upit i javit ćemo vam se u roku od 24 sata.
            </p>
            <p style="font-size: 14px; color: #888; margin-top: 20px;">
              Ako imate hitan upit, slobodno nas nazovite na 091 561 8258.
            </p>
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
              Uslugar - Platforma za pronalaženje lokalnih pružatelja usluga<br>
              © ${new Date().getFullYear()} Uslugar.
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[CONTACT] Confirmation email sent to:', toEmail);
  } catch (error) {
    console.error('[CONTACT] Error sending confirmation:', error);
    throw error;
  }
};

/**
 * Obavijest adminu o novom kontakt upitu
 */
export const sendContactNotificationToAdmin = async ({ name, email, phone, subject, subjectLabel, message }) => {
  if (!transporter) {
    console.log('SMTP not configured, skipping contact admin notification');
    return;
  }
  const toEmail = process.env.CONTACT_ADMIN_EMAIL || 'support@uslugar.hr';
  try {
    await transporter.sendMail({
      from: `"Uslugar" <${getFromEmail()}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Uslugar Kontakt] ${subjectLabel} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">Novi kontakt upit</h1>
            <p><strong>Ime:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Telefon:</strong> ${phone || '—'}</p>
            <p><strong>Predmet:</strong> ${subjectLabel}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Odgovorite direktno na ${email} (Reply-To je postavljen).
            </p>
          </div>
        </body>
        </html>
      `
    });
    console.log('[CONTACT] Admin notification sent to:', toEmail);
  } catch (error) {
    console.error('[CONTACT] Error sending admin notification:', error);
    throw error;
  }
};

export { transporter, createTransporter };
export default { transporter, createTransporter };

