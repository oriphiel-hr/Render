/**
 * Monthly Report Service - Automatsko slanje mjesečnih izvještaja o isporučenim leadovima
 * 
 * Generira i šalje klijentima detaljne izvještaje o isporučenim leadovima u obračunskom periodu,
 * uključujući statistike, trendove i billing informacije.
 */

import { prisma } from '../lib/prisma.js';
import { generateMonthlyReport } from './report-generator.js';
import nodemailer from 'nodemailer';

// Kreiraj email transporter
const createTransporter = () => {
  if (!process.env.SMTP_USER) {
    console.warn('SMTP not configured - monthly reports disabled');
    return null;
  }
  
  const port = parseInt(process.env.SMTP_PORT || '587');
  const isSSL = port === 465;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSSL,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Generiraj HTML email template za mjesečni izvještaj
 */
function generateEmailTemplate(reportData) {
  const { period, user, stats, categoryStats, trends, billing } = reportData;
  
  const monthName = period.monthName.charAt(0).toUpperCase() + period.monthName.slice(1);
  const year = period.year;
  
  // Formatiraj trendove
  const trendIcon = (value) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➡️';
  };
  
  const trendText = (value, label) => {
    if (value > 0) return `+${value}% ${label}`;
    if (value < 0) return `${value}% ${label}`;
    return `0% ${label}`;
  };
  
  // Billing informacije
  const billingSection = billing && billing.totals ? `
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin-top: 0;">💰 Billing Informacije</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Očekivani leadovi:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${billing.totals.expectedLeads}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Isporučeni leadovi:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${billing.totals.deliveredLeads}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Razlika:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: ${billing.totals.diff >= 0 ? '#16a34a' : '#dc2626'};">
            ${billing.totals.diff >= 0 ? '+' : ''}${billing.totals.diff}
          </td>
        </tr>
        ${billing.totals.creditsFromAdjustments > 0 ? `
        <tr>
          <td style="padding: 8px;"><strong>Krediti iz korekcija:</strong></td>
          <td style="padding: 8px; text-align: right; color: #16a34a;">+${billing.totals.creditsFromAdjustments}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #4CAF50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">USLUGAR</h1>
      </div>
      <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; font-size: 24px;">📊 Mjesečni izvještaj - ${monthName} ${year}</h2>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Poštovani/na <strong>${user.name}</strong>,</p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">Evo vašeg mjesečnog izvještaja o isporučenim leadovima za ${monthName} ${year}.</p>
        
        <!-- Statistike -->
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4CAF50;">
          <h3 style="color: #333; margin-top: 0;">📈 Statistike</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Ukupno kupljenih leadova:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${stats.totalPurchased}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Konvertirani leadovi:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${stats.totalConverted}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Stopa konverzije:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${stats.conversionRate.toFixed(1)}%</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Procijenjeni prihod:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${stats.estimatedRevenue.toFixed(2)} EUR</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Prosječna kvaliteta leadova:</strong></td>
              <td style="padding: 8px; text-align: right;">${stats.avgQualityScore.toFixed(1)}/100</td>
            </tr>
          </table>
        </div>
        
        ${billingSection}
        
        <!-- Trendovi -->
        ${trends && Object.keys(trends).length > 0 ? `
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #d97706; margin-top: 0;">📊 Trendovi (vs prošli mjesec)</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8;">
            ${trends.purchasedChange !== undefined ? `<li>${trendIcon(trends.purchasedChange)} ${trendText(trends.purchasedChange, 'kupljenih leadova')}</li>` : ''}
            ${trends.convertedChange !== undefined ? `<li>${trendIcon(trends.convertedChange)} ${trendText(trends.convertedChange, 'konvertiranih leadova')}</li>` : ''}
            ${trends.revenueChange !== undefined ? `<li>${trendIcon(trends.revenueChange)} ${trendText(trends.revenueChange, 'prihoda')}</li>` : ''}
          </ul>
        </div>
        ` : ''}
        
        <!-- Top kategorije -->
        ${categoryStats && categoryStats.length > 0 ? `
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">🏆 Top kategorije</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8;">
            ${categoryStats.slice(0, 5).map(cat => `
              <li><strong>${cat.category}</strong>: ${cat.count} leadova, ${cat.converted} konvertirano</li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://uslugar.oriph.io'}/#roi" 
             style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
            Pogledaj detaljnu analitiku →
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Hvala vam što koristite Uslugar EXCLUSIVE!<br>
          Vaš tim Uslugara
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Pošalji mjesečni izvještaj emailom
 * @param {string} providerId - ID providera
 * @param {number} year - Godina
 * @param {number} month - Mjesec (1-12)
 * @returns {Promise<object>} Rezultat slanja
 */
export async function sendMonthlyReport(providerId, year, month) {
  if (!transporter) {
    console.log('[Monthly Report] SMTP not configured, skipping email');
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    // Generiraj izvještaj
    const reportData = await generateMonthlyReport(providerId, year, month);
    
    if (!reportData.user.email) {
      console.warn(`[Monthly Report] User ${providerId} has no email address`);
      return { success: false, error: 'User has no email address' };
    }
    
    // Generiraj email template
    const htmlContent = generateEmailTemplate(reportData);
    
    const monthName = reportData.period.monthName.charAt(0).toUpperCase() + reportData.period.monthName.slice(1);
    const subject = `📊 Mjesečni izvještaj - ${monthName} ${year}`;
    
    // Pošalji email
    await transporter.sendMail({
      from: `"Uslugar" <${process.env.SMTP_USER}>`,
      to: reportData.user.email,
      subject: subject,
      html: htmlContent
    });
    
    console.log(`[Monthly Report] Report sent to ${reportData.user.email} for ${monthName} ${year}`);
    
    return {
      success: true,
      email: reportData.user.email,
      period: { year, month, monthName }
    };
  } catch (error) {
    console.error('[Monthly Report] Error sending report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pošalji mjesečne izvještaje svim aktivnim korisnicima za prošli mjesec
 * @returns {Promise<object>} Rezultat slanja
 */
export async function sendMonthlyReportsToAllUsers() {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const month = lastMonth.getMonth() + 1;
    
    console.log(`[Monthly Report] Sending reports for ${year}-${month} to all active users...`);
    
    // Dohvati sve aktivne korisnike s pretplatom (PROVIDER role)
    const activeUsers = await prisma.user.findMany({
      where: {
        role: 'PROVIDER',
        subscriptions: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        email: true,
        fullName: true
      }
    });
    
    console.log(`[Monthly Report] Found ${activeUsers.length} active users`);
    
    let sent = 0;
    let failed = 0;
    const errors = [];
    
    // Pošalji izvještaj svakom korisniku
    for (const user of activeUsers) {
      try {
        const result = await sendMonthlyReport(user.id, year, month);
        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push({ userId: user.id, email: user.email, error: result.error });
        }
      } catch (error) {
        failed++;
        errors.push({ userId: user.id, email: user.email, error: error.message });
      }
    }
    
    console.log(`[Monthly Report] Completed: ${sent} sent, ${failed} failed`);
    
    return {
      success: true,
      period: { year, month },
      sent,
      failed,
      total: activeUsers.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('[Monthly Report] Error sending reports to all users:', error);
    return { success: false, error: error.message };
  }
}

