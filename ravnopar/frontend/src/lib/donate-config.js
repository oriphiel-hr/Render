const IBAN = import.meta.env.VITE_DONATE_IBAN?.trim() || '';
const REVOLUT_URL = import.meta.env.VITE_DONATE_REVOLUT_URL?.trim() || '';
const STRIPE_URL = import.meta.env.VITE_DONATE_STRIPE_URL?.trim() || '';
const RECIPIENT = import.meta.env.VITE_DONATE_RECIPIENT?.trim() || '';

export function hasIban() {
  return Boolean(IBAN);
}

export function hasRevolut() {
  return Boolean(REVOLUT_URL);
}

export function getDonateIban() {
  return IBAN;
}

export function getDonateRevolutUrl() {
  return REVOLUT_URL;
}

export function getDonateRecipient() {
  return RECIPIENT;
}

export function getDonateStripeUrl() {
  return STRIPE_URL;
}

export function isDonateConfigured() {
  return hasIban() || hasRevolut() || Boolean(STRIPE_URL);
}
