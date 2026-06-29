const IBAN = import.meta.env.VITE_DONATE_IBAN?.trim() || '';
const REVOLUT_URL = import.meta.env.VITE_DONATE_REVOLUT_URL?.trim() || '';
const STRIPE_URL = import.meta.env.VITE_DONATE_STRIPE_URL?.trim() || '';
const RECIPIENT = import.meta.env.VITE_DONATE_RECIPIENT?.trim() || '';

function normalizeIban(raw) {
  return String(raw || '').replace(/\s+/g, '').toUpperCase();
}

/** True only for a complete IBAN — placeholders like HR__ ___ are rejected. */
export function isValidDonateIban(raw) {
  const compact = normalizeIban(raw);
  if (!compact) return false;
  if (compact.includes('_')) return false;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(compact)) return false;
  if (compact.length < 15 || compact.length > 34) return false;
  if (compact.startsWith('HR') && compact.length !== 21) return false;
  return true;
}

export function hasIban() {
  return isValidDonateIban(IBAN);
}

export function hasRevolut() {
  return Boolean(REVOLUT_URL);
}

export function getDonateIban() {
  return hasIban() ? IBAN : '';
}

export function getDonateIbanCompact() {
  return hasIban() ? normalizeIban(IBAN) : '';
}

export function getDonateRevolutUrl() {
  return REVOLUT_URL;
}

export function getDonateRecipient() {
  return hasIban() ? RECIPIENT : '';
}

export function getDonateStripeUrl() {
  return STRIPE_URL;
}

export function isDonateConfigured() {
  return hasIban() || hasRevolut() || Boolean(STRIPE_URL);
}
