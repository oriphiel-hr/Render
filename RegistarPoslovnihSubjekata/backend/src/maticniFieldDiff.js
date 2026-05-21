/**
 * Usporedba matičnog payload-a — koje poslovne kolone su se promijenile (bez diff meta polja).
 */

const DIFF_ONLY_KEYS = new Set([
  'vrsta',
  'aktivan',
  'row_key',
  'scn',
  'scn_staro',
  '_temp'
]);

function stableValue(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(stableValue);
  const o = {};
  for (const k of Object.keys(v).sort()) {
    o[k] = stableValue(v[k]);
  }
  return o;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * @param {object|null|undefined} before
 * @param {object|null|undefined} after
 * @param {string} [prefix]
 * @returns {{ columns: string[], changes: Record<string, { from: unknown, to: unknown }> }}
 */
function diffPayloadFields(before, after, prefix = '') {
  /** @type {Record<string, { from: unknown, to: unknown }>} */
  const changes = {};
  const b = before && typeof before === 'object' ? before : {};
  const a = after && typeof after === 'object' ? after : {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);

  for (const k of keys) {
    if (DIFF_ONLY_KEYS.has(k)) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    const bv = b[k];
    const av = a[k];

    if (isPlainObject(bv) && isPlainObject(av)) {
      const nested = diffPayloadFields(bv, av, path);
      Object.assign(changes, nested.changes);
      continue;
    }

    const bNorm = JSON.stringify(stableValue(bv));
    const aNorm = JSON.stringify(stableValue(av));
    if (bNorm !== aNorm) {
      changes[path] = { from: bv ?? null, to: av ?? null };
    }
  }

  return {
    columns: Object.keys(changes).sort(),
    changes
  };
}

/** Isti kriterij kao rowsContentEqual u sudregMaticniDiff. */
function payloadContentEqual(a, b) {
  return diffPayloadFields(a, b).columns.length === 0;
}

module.exports = {
  DIFF_ONLY_KEYS,
  diffPayloadFields,
  payloadContentEqual
};
