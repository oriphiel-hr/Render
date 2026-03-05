/**
 * Test SMS slanja - Uslugar
 * 
 * Korištenje:
 *   node scripts/test-sms.js +385912345678
 *   node scripts/test-sms.js +385912345678 "Poruka"
 * 
 * Zahtijeva: INFOBIP_API_KEY, INFOBIP_BASE_URL, INFOBIP_SENDER u .env
 * Broj mora biti verificiran u Infobip portalu (trial).
 */

import 'dotenv/config';
import { sendSMS } from '../src/services/sms-service.js';

const phone = process.argv[2] || process.env.TEST_SMS_PHONE;
const message = process.argv[3] || 'Uslugar test SMS - ' + new Date().toISOString();

if (!phone) {
  console.error('Korištenje: node scripts/test-sms.js +385912345678 [poruka]');
  console.error('Ili postavi TEST_SMS_PHONE u .env');
  process.exit(1);
}

if (!/^\+385[0-9]{8,9}$/.test(phone)) {
  console.error('Broj mora biti u formatu +385XXXXXXXXX (npr. +385912345678)');
  process.exit(1);
}

console.log('📱 Šaljem SMS...');
console.log('  Na:', phone);
console.log('  Poruka:', message);
console.log('  Infobip API Key:', process.env.INFOBIP_API_KEY ? '✅ postavljen' : '❌ nije postavljen');
console.log('');

try {
  const result = await sendSMS(phone, message, 'OTHER', null, { test: true });
  if (result.success) {
    console.log('✅ SMS uspješno poslan!');
    console.log('  Mode:', result.mode);
    console.log('  Message ID:', result.sid || result.messageId);
  } else {
    console.error('❌ SMS nije poslan');
    console.error('  Greška:', result.error);
    console.error('  Mode:', result.mode);
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Greška:', err.message);
  process.exit(1);
}
