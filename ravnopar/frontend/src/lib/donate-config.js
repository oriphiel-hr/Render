const IBAN = import.meta.env.VITE_DONATE_IBAN?.trim() || '';
const REVOLUT_URL = import.meta.env.VITE_DONATE_REVOLUT_URL?.trim() || '';
const STRIPE_URL = import.meta.env.VITE_DONATE_STRIPE_URL?.trim() || '';

export function isDonateConfigured() {
  return Boolean(IBAN || REVOLUT_URL || STRIPE_URL);
}
