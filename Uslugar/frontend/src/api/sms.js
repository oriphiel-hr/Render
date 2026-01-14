import api from '../api';

/**
 * SMS Verification API Client
 */

/**
 * Pošalji SMS verifikacijski kod
 * @param {string} phone - Broj telefona (+385XXXXXXXXX)
 */
export const sendVerificationCode = (phone) => {
  return api.post('/sms-verification/send', { phone });
};

/**
 * Verificiraj SMS kod
 * @param {string} code - 6-znamenkasti kod
 */
export const verifyCode = (code) => {
  return api.post('/sms-verification/verify', { code });
};

/**
 * Provjeri status verifikacije telefona
 */
export const getVerificationStatus = () => {
  return api.get('/sms-verification/status');
};

