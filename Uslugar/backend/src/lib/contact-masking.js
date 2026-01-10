/**
 * USLUGAR EXCLUSIVE - Contact Masking Utility
 * 
 * Maskira kontakt informacije (email, phone) dok ponuda nije prihvaćena
 */

/**
 * Maskira email adresu
 * @param {String} email - Email adresa
 * @returns {String} - Maskirani email (npr. "j***@example.com")
 */
export function maskEmail(email) {
  if (!email) return undefined;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email; // Invalid email format
  
  // Prikaži prvo slovo i zadnje slovo lokalnog dijela, ostalo maskiraj
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  const maskedLocal = `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 1, 3))}${localPart[localPart.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Maskira telefonski broj
 * @param {String} phone - Telefonski broj
 * @returns {String} - Maskirani telefon (npr. "+385 *** *** 123")
 */
export function maskPhone(phone) {
  if (!phone) return undefined;
  
  // Ukloni sve osim brojeva
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 4) {
    return '*** *** ***';
  }
  
  // Prikaži zadnje 3-4 znamenke
  const visibleDigits = Math.min(4, Math.floor(digits.length / 3));
  const lastDigits = digits.slice(-visibleDigits);
  const masked = '*'.repeat(digits.length - visibleDigits);
  
  // Formatiraj s razmacima
  if (phone.includes('+')) {
    return `+${masked} ${lastDigits}`;
  }
  
  return `${masked} ${lastDigits}`;
}

/**
 * Provjeri da li je ponuda prihvaćena za posao
 * @param {Object} job - Job objekt s offers
 * @returns {Boolean} - True ako postoji prihvaćena ponuda
 */
export function hasAcceptedOffer(job) {
  if (!job || !job.offers) return false;
  return job.offers.some(offer => offer.status === 'ACCEPTED');
}

/**
 * Provjeri da li je korisnik vlasnik posla
 * @param {Object} job - Job objekt
 * @param {String} userId - ID korisnika
 * @returns {Boolean} - True ako je korisnik vlasnik posla
 */
export function isJobOwner(job, userId) {
  return job && job.userId === userId;
}

/**
 * Provjeri da li je korisnik provider koji je poslao prihvaćenu ponudu
 * @param {Object} job - Job objekt s offers
 * @param {String} userId - ID korisnika
 * @returns {Boolean} - True ako je korisnik provider s prihvaćenom ponudom
 */
export function isAcceptedProvider(job, userId) {
  if (!job || !job.offers) return false;
  return job.offers.some(offer => offer.status === 'ACCEPTED' && offer.userId === userId);
}

/**
 * Maskira kontakt informacije korisnika ako ponuda nije prihvaćena
 * @param {Object} user - User objekt
 * @param {Object} job - Job objekt s offers
 * @param {String} currentUserId - ID trenutnog korisnika (koji dohvaća podatke)
 * @returns {Object} - User objekt s maskiranim kontaktima (ako je potrebno)
 */
export function maskUserContacts(user, job, currentUserId) {
  if (!user || !job) return user;
  
  // Vlasnik posla uvijek vidi svoje kontakte
  if (isJobOwner(job, currentUserId)) {
    return user;
  }
  
  // Provider s prihvaćenom ponudom vidi kontakte
  if (isAcceptedProvider(job, currentUserId)) {
    return user;
  }
  
  // Ako ponuda nije prihvaćena, maskiraj kontakte
  if (!hasAcceptedOffer(job)) {
    return {
      ...user,
      email: user.email ? maskEmail(user.email) : undefined,
      phone: user.phone ? maskPhone(user.phone) : undefined,
      contactMasked: true
    };
  }
  
  // Ako postoji prihvaćena ponuda, ali trenutni korisnik nije provider koji ju je poslao, maskiraj kontakte
  return {
    ...user,
    email: user.email ? maskEmail(user.email) : undefined,
    phone: user.phone ? maskPhone(user.phone) : undefined,
    contactMasked: true
  };
}

