const BIO_TRUNC_LEN = 160;

/**
 * Normalizira unos uslužnih linija za spremanje (do 6 stavki).
 * @param {unknown} raw
 * @returns {object[]|null}
 */
export function normalizePublicServiceLinesInput(raw) {
  if (raw == null) return null;
  const arr = Array.isArray(raw) ? raw : [];
  const out = arr
    .slice(0, 6)
    .map((item) => ({
      title: String(item?.title ?? '')
        .trim()
        .slice(0, 80),
      detail: String(item?.detail ?? '')
        .trim()
        .slice(0, 240)
    }))
    .filter((x) => x.title.length > 0);
  return out.length ? out : null;
}

/**
 * Kopija profila za javne endpoint-e: bez kontakata; u MINIMAL_DISCOVERY bez portfelja/web i skraćen bio.
 * @param {object} provider
 * @returns {object}
 */
export function sanitizeProviderForPublic(provider) {
  if (!provider || typeof provider !== 'object') return provider;
  const out =
    typeof structuredClone === 'function'
      ? structuredClone(provider)
      : JSON.parse(JSON.stringify(provider));
  const mode = out.publicListingMode || 'STANDARD';

  if (out.user && typeof out.user === 'object') {
    const u = { ...out.user };
    delete u.email;
    delete u.phone;
    out.user = u;
  }

  if (mode === 'MINIMAL_DISCOVERY') {
    out.portfolio = null;
    out.website = null;
    const bio = typeof out.bio === 'string' ? out.bio : '';
    if (bio.length > BIO_TRUNC_LEN) {
      out.bio = `${bio.slice(0, BIO_TRUNC_LEN - 1)}…`;
    }
    out.publicBioTruncated = true;
    if (Array.isArray(out.specialties) && out.specialties.length > 4) {
      out.specialties = out.specialties.slice(0, 4);
    }
  }

  return out;
}

/**
 * Uklanja email/telefon s korisničkog objekta u javnom odgovoru.
 * @param {object} user
 * @returns {object}
 */
export function sanitizePublicUser(user) {
  if (!user || typeof user !== 'object') return user;
  const u = typeof structuredClone === 'function' ? structuredClone(user) : { ...user };
  delete u.email;
  delete u.password;
  delete u.phone;
  return u;
}
