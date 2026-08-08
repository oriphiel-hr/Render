import { API_BASE_URL } from '../lib/env.js';

async function serverFetch(path, init = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    next: { revalidate: 60 },
    headers: {
      Accept: 'application/json',
      ...(init.headers || {})
    }
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** Server-side: javne statistike za homepage */
export async function fetchPublicStats() {
  const data = await serverFetch('/matchmaking/public-stats');
  return data?.success ? data.stats : null;
}

/** Server-side: fairness report */
export async function fetchFairnessReport() {
  const data = await serverFetch('/matchmaking/fairness-report');
  return data?.success ? data.report : null;
}

/** Server-side: donate impact */
export async function fetchDonateImpact() {
  const data = await serverFetch('/payments/donate/impact');
  return data?.success ? data.stats : null;
}
