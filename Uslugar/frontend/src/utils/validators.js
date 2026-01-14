/**
 * USLUGAR - Validation Utilities
 * 
 * Validatori za hrvatski OIB i druge podatke
 */

/**
 * Validira hrvatski OIB (Osobni identifikacijski broj)
 * Koristi ISO 7064, MOD 11-10 algoritam za provjeru kontrolne znamenke
 * 
 * @param {string} oib - OIB za validaciju (11 znamenki)
 * @returns {boolean} - true ako je OIB validan, false ako nije
 */
export function validateOIB(oib) {
  // Provjeri da li je string
  if (typeof oib !== 'string') {
    return false;
  }

  // Ukloni razmake i crtice
  oib = oib.replace(/[\s-]/g, '');

  // Provjeri da li ima točno 11 znamenki
  if (!/^\d{11}$/.test(oib)) {
    return false;
  }

  // ISO 7064, MOD 11-10 algoritam
  let kontrola = 10;

  for (let i = 0; i < 10; i++) {
    kontrola = kontrola + parseInt(oib[i], 10);
    kontrola = kontrola % 10;
    
    if (kontrola === 0) {
      kontrola = 10;
    }
    
    kontrola *= 2;
    kontrola = kontrola % 11;
  }

  // Provjeri kontrolnu znamenku
  let kontrolnaZnamenka = 11 - kontrola;
  if (kontrolnaZnamenka === 10) {
    kontrolnaZnamenka = 0;
  }

  return kontrolnaZnamenka === parseInt(oib[10], 10);
}

/**
 * Formatira OIB za prikaz (dodaje crtice)
 * Primjer: 12345678901 -> 12345678-901
 * 
 * @param {string} oib - OIB za formatiranje
 * @returns {string} - Formatirani OIB
 */
export function formatOIB(oib) {
  if (!oib) return '';
  
  // Ukloni sve osim brojeva
  const cleaned = oib.replace(/\D/g, '');
  
  // Formatiraj kao 8-3
  if (cleaned.length <= 8) {
    return cleaned;
  }
  
  return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 11)}`;
}

/**
 * Validira email adresu
 * 
 * @param {string} email - Email za validaciju
 * @returns {boolean} - true ako je email validan
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validira hrvatski broj mobitela
 * Prihvaća formate: 091234567, 091-234-567, 091/234-567, +385912345678
 * 
 * @param {string} phone - Broj telefona za validaciju
 * @returns {boolean} - true ako je broj validan
 */
export function validatePhone(phone) {
  if (!phone) return false;
  
  // Ukloni razmake, crtice, zagrade, kose crte
  const cleaned = phone.replace(/[\s\-\(\)\/]/g, '');
  
  // Provjeri hrvatske formate
  // 09X (mobitel) ili 0X (fiksni) + 6-8 znamenki
  // Ili +385 + 9X (mobitel bez prve 0)
  const patterns = [
    /^0[1-9]\d{6,8}$/,        // 091234567 (mobitel) ili 0X (fiksni)
    /^\+3859[1-9]\d{6,7}$/,   // +385912345678
    /^3859[1-9]\d{6,7}$/      // 385912345678 (bez +)
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Validira lozinku
 * Minimalno 8 znakova, barem jedno veliko slovo, jedno malo slovo i jedan broj
 * 
 * @param {string} password - Lozinka za validaciju
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Lozinka mora imati minimalno 8 znakova');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno malo slovo');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno veliko slovo');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedan broj');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validira IBAN
 * 
 * @param {string} iban - IBAN za validaciju
 * @returns {boolean} - true ako je IBAN validan
 */
export function validateIBAN(iban) {
  if (!iban) return false;
  
  // Ukloni razmake
  iban = iban.replace(/\s/g, '').toUpperCase();
  
  // Hrvatski IBAN format: HR + 19 znamenki (21 ukupno)
  if (!/^HR\d{19}$/.test(iban)) {
    return false;
  }
  
  // MOD 97 provjera (pojednostavljena verzija)
  // Za potpunu validaciju potreban je složeniji algoritam
  // Ovo je osnovna provjera formata
  return true;
}

/**
 * Provjeri da li je string prazan (null, undefined, '')
 * 
 * @param {string} value - Vrijednost za provjeru
 * @returns {boolean} - true ako je prazan
 */
export function isEmpty(value) {
  return value === null || value === undefined || value.trim() === '';
}

