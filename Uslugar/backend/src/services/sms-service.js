// SMS Notification Service - USLUGAR EXCLUSIVE
// Twilio Integration Ready

/**
 * SMS Service - Twilio Integration
 * 
 * Setup:
 * 1. Install Twilio: npm install twilio
 * 2. Add to .env:
 *    TEST_TWILIO_ACCOUNT_SID=your_account_sid
 *    TEST_TWILIO_AUTH_TOKEN=your_auth_token
 *    TEST_TWILIO_PHONE_NUMBER=+1234567890
 * 3. Uncomment Twilio integration code below
 */

import dotenv from 'dotenv';
import { prisma } from '../lib/prisma.js';

dotenv.config();

/**
 * Logiraj SMS u bazu
 * @param {String} phone - Broj telefona
 * @param {String} message - Poruka
 * @param {String} type - Tip poruke (VERIFICATION, LEAD_NOTIFICATION, REFUND, URGENT, OTHER)
 * @param {Object} result - Rezultat slanja SMS-a
 * @param {String} userId - ID korisnika (opcionalno)
 * @param {Object} metadata - Dodatni podaci (opcionalno)
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
        twilioSid: result.sid || null,
        error: result.error || null,
        userId: userId || null,
        metadata: metadata || null
      }
    });
  } catch (error) {
    // Ne bacaj grešku ako logiranje ne uspije - samo logiraj
    console.error('❌ Failed to log SMS to database:', error);
  }
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
    // Provjeri Twilio konfiguraciju
    const hasTwilioConfig = process.env.TEST_TWILIO_ACCOUNT_SID && 
                           process.env.TEST_TWILIO_AUTH_TOKEN && 
                           process.env.TEST_TWILIO_PHONE_NUMBER;
    
    
    // Twilio integration
    if (hasTwilioConfig) {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(
          process.env.TEST_TWILIO_ACCOUNT_SID,
          process.env.TEST_TWILIO_AUTH_TOKEN
        );
        
        
        const result = await client.messages.create({
          body: message,
          from: process.env.TEST_TWILIO_PHONE_NUMBER,
          to: phone
        });
        
        const smsResult = { success: true, sid: result.sid, mode: 'twilio', status: result.status };
        
        // Logiraj u bazu
        await logSMS(phone, message, type, smsResult, userId, metadata);
        
        return smsResult;
      } catch (twilioError) {
        console.error('❌ Twilio SMS error:', twilioError);
        console.error('   Error code:', twilioError.code);
        console.error('   Error message:', twilioError.message);
        console.error('   Full error:', JSON.stringify(twilioError, null, 2));
        
        // Ako je Twilio trial i broj nije verificiran
        if (twilioError.code === 21608 || twilioError.message?.includes('verified')) {
          console.warn('⚠️ Twilio trial: Broj mora biti verificiran u Twilio konzoli');
          console.warn('   Dodajte broj na: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
          // Fallback na simulation mode
          const errorResult = { 
            success: false, 
            error: twilioError.message,
            code: twilioError.code,
            sid: 'sm_error_' + Date.now(),
            mode: 'simulation',
            needsVerification: true
          };
          
          // Logiraj u bazu
          await logSMS(phone, message, type, errorResult, userId, metadata);
          
          return errorResult;
        }
        
        // Za sve ostale Twilio greške, također logiraj detaljno
        console.error(`📱 [SMS FAILED - Twilio error] To: ${phone}`);
        console.error(`   Error: ${twilioError.message} (Code: ${twilioError.code})`);
        
        // Ne baci grešku, nego vrati error response
        const errorResult = {
          success: false,
          error: twilioError.message,
          code: twilioError.code,
          sid: 'sm_error_' + Date.now(),
          mode: 'twilio_error'
        };
        
        // Logiraj u bazu
        await logSMS(phone, message, type, errorResult, userId, metadata);
        
        return errorResult;
      }
    }
    
    // Simulation mode (for development when Twilio not configured)
    const simResult = { 
      success: true, 
      sid: 'sm_simulation_' + Date.now(),
      mode: 'simulation'
    };
    
    // Logiraj u bazu
    await logSMS(phone, message, type, simResult, userId, metadata);
    
    return simResult;
    
  } catch (error) {
    console.error('❌ SMS error:', error);
    throw new Error('Failed to send SMS: ' + error.message);
  }
}

/**
 * Pošalji SMS kod za verifikaciju
 * @param {String} phone - Broj telefona
 * @param {String} code - 6-znamenkasti kod
 * @param {String} userId - ID korisnika (opcionalno)
 */
export async function sendVerificationCode(phone, code, userId = null) {
  const message = `Vaš Uslugar kod: ${code}\n\nKod važi 10 minuta. Nemojte dijeliti taj kod.`;
  return await sendSMS(phone, message, 'VERIFICATION', userId, { code: code.substring(0, 2) + '****' });
}

/**
 * Obavijest o novom leadu
 * @param {String} phone - Broj telefona
 * @param {String} leadTitle - Naziv leada
 * @param {Number} leadPrice - Cijena leada
 * @param {String} userId - ID korisnika (opcionalno)
 * @param {String} leadId - ID leada (opcionalno)
 */
export async function notifyNewLeadAvailable(phone, leadTitle, leadPrice, userId = null, leadId = null) {
  const message = `🎯 Novi ekskluzivni lead dostupan!\n\n${leadTitle}\nCijena: ${leadPrice} kredita\n\nImate 24h da odgovorite.\n\nUslugar`;
  return await sendSMS(phone, message, 'LEAD_NOTIFICATION', userId, { leadId, leadTitle, leadPrice });
}

/**
 * Obavijest o kupnji leada
 * @param {String} phone - Broj telefona
 * @param {String} leadTitle - Naziv leada
 * @param {String} userId - ID korisnika (opcionalno)
 * @param {String} leadId - ID leada (opcionalno)
 */
export async function notifyLeadPurchased(phone, leadTitle, userId = null, leadId = null) {
  const message = `✅ Lead uspješno kupljen!\n\n${leadTitle}\n\nKontaktirajte klijenta u roku od 24h.\n\nUslugar`;
  return await sendSMS(phone, message, 'LEAD_NOTIFICATION', userId, { leadId, leadTitle });
}

/**
 * Obavijest o refundaciji
 * @param {String} phone - Broj telefona
 * @param {Number} creditsRefunded - Broj vraćenih kredita
 * @param {String} userId - ID korisnika (opcionalno)
 * @param {String} transactionId - ID transakcije (opcionalno)
 */
export async function notifyRefund(phone, creditsRefunded, userId = null, transactionId = null) {
  const message = `💰 Refund uspješan!\n\n${creditsRefunded} kredita vraćeno na vaš račun.\n\nUslugar`;
  return await sendSMS(phone, message, 'REFUND', userId, { creditsRefunded, transactionId });
}

/**
 * Urgentna obavijest (VIP podrška)
 * @param {String} phone - Broj telefona
 * @param {String} title - Naslov
 * @param {String} body - Sadržaj
 * @param {String} userId - ID korisnika (opcionalno)
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

