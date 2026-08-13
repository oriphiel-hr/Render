/** Zamijeni API URL ovdje ili preko NEXT_PUBLIC_API_BASE_URL u .env */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:4200/api';

/** Server-side fetch (build/SSR) — lokalni backend na istom VPS-u */
export const SERVER_API_BASE_URL =
  process.env.SERVER_API_BASE_URL?.trim() ||
  process.env.API_BASE_URL?.trim() ||
  'http://127.0.0.1:4200/api';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://ravnopar.com'
).replace(/\/$/, '');

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'ravnopar@oriph.io';

export const PLANS_ENABLED = process.env.NEXT_PUBLIC_PLANS_ENABLED === 'true';

export const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL?.trim() || '';

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';

export const DONATE_IBAN = process.env.NEXT_PUBLIC_DONATE_IBAN?.trim() || '';
export const DONATE_RECIPIENT = process.env.NEXT_PUBLIC_DONATE_RECIPIENT?.trim() || '';
export const DONATE_REFERENCE =
  process.env.NEXT_PUBLIC_DONATE_REFERENCE?.trim() || 'Ravnopar donacija';
export const DONATE_REVOLUT_URL = process.env.NEXT_PUBLIC_DONATE_REVOLUT_URL?.trim() || '';
export const DONATE_STRIPE_URL = process.env.NEXT_PUBLIC_DONATE_STRIPE_URL?.trim() || '';

/** Web Push VAPID public key (pair with backend VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || '';
