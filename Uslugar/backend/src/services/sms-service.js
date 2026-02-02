// SMS Notification Service - USLUGAR
// Infobip Integration

/**
 * SMS Service - Infobip Integration
 *
 * Setup:
 * 1. Add to .env:
 *    INFOBIP_BASE_URL=https://eejv92.api.infobip.com
 *    INFOBIP_API_KEY=your_api_key
 *    INFOBIP_SENDER=ServiceSMS
 * 2. Trial: verificiraj broj u Infobip portalu, koristi ServiceSMS kao sender
 */

import dotenv from 'dotenv';
import { prisma } from '../lib/prisma.js';

dotenv.config();

/**
 * Logiraj SMS u bazu
 */
async function logSMS(phone, message, type, result, userId = null, metadata = null) {
  try {
    await prisma.smsLog.create({
      data: {
        phone,
        message,
        type,
        status: result.success ? 'SUCCESS' : 'FAILED',
        mode: result.mode || 'unknown',
        twilioSid: result.sid || result.messageId || null,
        error: result.error || null,
        userId: userId || null,
        metadata: metadata || null
      }
    });
  } catch (error) {
    console.error('❌ Failed to log SMS to database:', error);
  }
}

/**
 * Pošalji SMS preko Infobip API-ja
 */
async function sendViaInfobip(phone, message, type, userId, metadata) {
  const baseUrl = (process.env.INFOBIP_BASE_URL || 'https://api.infobip.com').replace(/\/$/, '');
  const apiKey = process.env.INFOBIP_API_KEY;
  const sender = process.env.INFOBIP_SENDER || 'ServiceSMS';

  const url = `${baseUrl}/sms/3/messages`;
  const body = {
    messages: [{
      sender,
      destinations: [{ to: phone }],
      content: { text: message }
    }]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `App ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok && data?.messages?.[0]?.messageId) {
    const msg = data.messages[0];
    const smsResult = {
      success: true,
      sid: msg.messageId,
      messageId: msg.messageId,
      mode: 'infobip',
      status: msg.status?.groupName || 'PENDING'
    };
    await logSMS(phone, message, type, smsResult, userId, metadata);
    return smsResult;
  }

  const errorMsg = data?.requestError?.serviceException?.text || data?.requestError?.message || `HTTP ${res.status}`;
  const smsResult = {
    success: false,
    error: errorMsg,
    sid: 'sm_error_' + Date.now(),
    mode: 'infobip_error'
  };
  await logSMS(phone, message, type, smsResult, userId, metadata);
  return smsResult;
}

/**
 * Pošalji SMS notifikaciju
 * @param {String} phone - Broj telefona (format: +385901234567)
 * @param {String} message - Poruka
 * @param {String} type - Tip poruke (VERIFICATION, LEAD_NOTIFICATION, REFUND, URGENT, OTHER)
 * @param {String} userId - ID korisnika (opcionalno)
 * @param {Object} metadata - Dodatni podaci (opcionalno)
 * @returns {Object} - Rezultat slanja
 */
export async function sendSMS(phone, message, type = 'OTHER', userId = null, metadata = null) {
  try {
    const hasInfobipConfig = process.env.INFOBIP_API_KEY;

    if (hasInfobipConfig) {
      try {
        const result = await sendViaInfobip(phone, message, type, userId, metadata);
        if (result.success) {
          console.log(`✓ [SMS] Poslano na ${phone} (${result.sid})`);
        } else {
          console.error(`❌ [SMS] Infobip error To: ${phone} - ${result.error}`);
        }
        return result;
      } catch (err) {
        console.error('❌ Infobip SMS error:', err);
        const errorResult = {
          success: false,
          error: err.message,
          sid: 'sm_error_' + Date.now(),
          mode: 'infobip_error'
        };
        await logSMS(phone, message, type, errorResult, userId, metadata);
        return errorResult;
      }
    }

    // Simulation mode (kad Infobip nije konfiguriran)
    const simResult = {
      success: true,
      sid: 'sm_simulation_' + Date.now(),
      mode: 'simulation'
    };
    await logSMS(phone, message, type, simResult, userId, metadata);
    return simResult;
  } catch (error) {
    console.error('❌ SMS error:', error);
    throw new Error('Failed to send SMS: ' + error.message);
  }
}

/**
 * Pošalji SMS kod za verifikaciju
 */
export async function sendVerificationCode(phone, code, userId = null) {
  const message = `Vaš Uslugar kod: ${code}\n\nKod važi 10 minuta. Nemojte dijeliti taj kod.`;
  return await sendSMS(phone, message, 'VERIFICATION', userId, { code: code.substring(0, 2) + '****' });
}

/**
 * Obavijest o novom leadu
 */
export async function notifyNewLeadAvailable(phone, leadTitle, leadPrice, userId = null, leadId = null) {
  const message = `🎯 Novi ekskluzivni lead dostupan!\n\n${leadTitle}\nCijena: ${leadPrice} kredita\n\nImate 24h da odgovorite.\n\nUslugar`;
  return await sendSMS(phone, message, 'LEAD_NOTIFICATION', userId, { leadId, leadTitle, leadPrice });
}

/**
 * Obavijest o kupnji leada
 */
export async function notifyLeadPurchased(phone, leadTitle, userId = null, leadId = null) {
  const message = `✅ Lead uspješno kupljen!\n\n${leadTitle}\n\nKontaktirajte klijenta u roku od 24h.\n\nUslugar`;
  return await sendSMS(phone, message, 'LEAD_NOTIFICATION', userId, { leadId, leadTitle });
}

/**
 * Obavijest o refundaciji
 */
export async function notifyRefund(phone, creditsRefunded, userId = null, transactionId = null) {
  const message = `💰 Refund uspješan!\n\n${creditsRefunded} kredita vraćeno na vaš račun.\n\nUslugar`;
  return await sendSMS(phone, message, 'REFUND', userId, { creditsRefunded, transactionId });
}

/**
 * Urgentna obavijest (VIP podrška)
 */
export async function sendUrgentNotification(phone, title, body, userId = null) {
  const message = `🚨 URGENT\n\n${title}\n\n${body}\n\nUslugar VIP Support`;
  return await sendSMS(phone, message, 'URGENT', userId, { title });
}

export default {
  sendSMS,
  sendVerificationCode,
  notifyNewLeadAvailable,
  notifyLeadPurchased,
  notifyRefund,
  sendUrgentNotification
};
