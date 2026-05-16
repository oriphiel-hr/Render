/**
 * Šifrarnici Sudreg javnog API-ja — cijeli set u jednom odgovoru (bez offset/limit).
 * @see https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 */

const { fetchSudregJavni } = require('./sudregApi');

/** @type {{ id: string, label: string, path: string }[]} */
const SIFRARNICI_CATALOG = [
  { id: 'sudovi', label: 'Sudovi', path: '/sudovi' },
  { id: 'drzave', label: 'Države', path: '/drzave' },
  { id: 'jezici', label: 'Jezici', path: '/jezici' },
  { id: 'valute', label: 'Valute', path: '/valute' },
  { id: 'statusi', label: 'Statusi retka', path: '/statusi' },
  {
    id: 'nacionalna_klasifikacija_djelatnosti',
    label: 'NKD (djelatnosti)',
    path: '/nacionalna_klasifikacija_djelatnosti'
  },
  { id: 'vrste_pravnih_oblika', label: 'Vrste pravnih oblika', path: '/vrste_pravnih_oblika' },
  { id: 'vrste_postupaka', label: 'Vrste postupaka', path: '/vrste_postupaka' },
  {
    id: 'vrste_statusnih_postupaka',
    label: 'Vrste statusnih postupaka',
    path: '/vrste_statusnih_postupaka'
  },
  { id: 'vrste_gfi_dokumenata', label: 'Vrste GFI dokumenata', path: '/vrste_gfi_dokumenata' },
  { id: 'bris_pravni_oblici', label: 'BRIS pravni oblici', path: '/bris_pravni_oblici' },
  { id: 'bris_registri', label: 'BRIS registri', path: '/bris_registri' }
];

const SIFRARNIK_BY_ID = new Map(SIFRARNICI_CATALOG.map((s) => [s.id, s]));

function listSifrarniciCatalog() {
  return SIFRARNICI_CATALOG.map((s) => ({
    id: s.id,
    label: s.label,
    path: s.path,
    paging: false,
    note: 'Cijeli šifrarnik u jednom odgovoru (nema offset/limit).'
  }));
}

function resolveSifrarnikId(id) {
  const key = String(id || '').trim().toLowerCase();
  if (!key) return null;
  return SIFRARNIK_BY_ID.get(key) || null;
}

/**
 * @param {string} sifrarnikId
 * @param {{ snapshot_id?: string|number, expand_relations?: string, history_columns?: string, no_data_error?: string, omit_nulls?: string, signal?: AbortSignal }} [query]
 */
async function getSifrarnik(sifrarnikId, query = {}) {
  const entry = resolveSifrarnikId(sifrarnikId);
  if (!entry) {
    throw new Error(
      `Nepoznat šifrarnik: ${sifrarnikId}. Dostupni: ${SIFRARNICI_CATALOG.map((s) => s.id).join(', ')}`
    );
  }

  const result = await fetchSudregJavni(
    entry.path,
    {
      snapshot_id: query.snapshot_id,
      expand_relations: query.expand_relations,
      history_columns: query.history_columns,
      no_data_error: query.no_data_error ?? '0',
      omit_nulls: query.omit_nulls
    },
    { signal: query.signal }
  );

  const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];

  return {
    sifrarnik_id: entry.id,
    label: entry.label,
    path: entry.path,
    paging: false,
    rowCount: rows.length,
    totalCount: parseHeaderInt(result.meta?.xTotalCount) ?? rows.length,
    ...result
  };
}

function parseHeaderInt(value) {
  if (value == null || value === '') return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

module.exports = {
  SIFRARNICI_CATALOG,
  listSifrarniciCatalog,
  resolveSifrarnikId,
  getSifrarnik
};
