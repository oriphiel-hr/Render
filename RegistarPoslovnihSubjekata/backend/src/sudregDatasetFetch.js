/**
 * Dohvat stranice podataka za skupove iz sudregDatasets (GET /api/javni/...).
 */

const fs = require('fs');
const path = require('path');
const { fetchSudregJavni } = require('./sudregApi');
const { closeWriteStream } = require('./jsonlStream');
const { getDataset, listAllImportJobs, PODRUZNICA_API_PATHS } = require('./sudregDatasets');

const FULL_FETCH_PAGE_LIMIT = 1000;

const DJELATNOST_PATH_BY_VRSTA = {
  pretezita: '/pretezite_djelatnosti',
  predmet: '/predmeti_poslovanja',
  evidencijska: '/evidencijske_djelatnosti'
};

/**
 * @param {string} datasetId
 * @param {{ snapshot_id?: string|number, offset?: number, limit?: number, api_path?: string, vrsta?: string, only_active?: string, expand_relations?: string, no_data_error?: string, omit_nulls?: string, signal?: AbortSignal }} [query]
 */
async function fetchDatasetPage(datasetId, query = {}) {
  const entry = getDataset(datasetId);
  if (!entry) {
    throw new Error(
      `Nepoznat skup: ${datasetId}. Dostupni: subjekti, pravni_oblici, tvrtka, sjedište, email, djelatnost, podružnica.`
    );
  }

  const apiPath = resolveApiPath(entry, query);
  const sudregQuery = buildSudregQuery(entry, apiPath, query);
  const result = await fetchSudregJavni(apiPath, sudregQuery, { signal: query.signal });
  const rows = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];

  return {
    dataset_id: entry.id,
    label: entry.label,
    api_path: apiPath,
    paging: true,
    rowCount: rows.length,
    totalCount: parseHeaderInt(result.meta?.xTotalCount) ?? rows.length,
    ...result,
    data: result.data
  };
}

function resolveApiPath(entry, query) {
  const explicit = String(query.api_path || '').trim();
  if (explicit) {
    const allowed = entry.apiPaths || [];
    if (!allowed.includes(explicit)) {
      throw new Error(`api_path ${explicit} nije u skupu ${entry.id}. Dozvoljeno: ${allowed.join(', ')}`);
    }
    return explicit;
  }

  if (entry.id === 'djelatnost') {
    const vrsta = String(query.vrsta || 'pretezita').trim().toLowerCase();
    const path = DJELATNOST_PATH_BY_VRSTA[vrsta];
    if (!path) {
      throw new Error(`vrsta mora biti: pretezita, predmet ili evidencijska (dobiveno: ${query.vrsta})`);
    }
    return path;
  }

  if (entry.apiPaths.length === 1) {
    return entry.apiPaths[0];
  }

  throw new Error(
    `Skup ${entry.id} ima više metoda — dodaj api_path ili vrsta. Metode: ${entry.apiPaths.join(', ')}`
  );
}

function buildSudregQuery(entry, apiPath, query) {
  const q = {
    snapshot_id: query.snapshot_id,
    offset: query.offset,
    limit: query.limit,
    no_data_error: query.no_data_error ?? '0',
    omit_nulls: query.omit_nulls
  };

  if (entry.id === 'subjekti') {
    const onlyActive = query.only_active;
    if (onlyActive === '0' || onlyActive === 'false') {
      q.only_active = '0';
    } else {
      q.only_active = '1';
    }
  }

  if (entry.id === 'pravni_oblici' || entry.expandRelations) {
    const expand = query.expand_relations;
    if (expand === '0' || expand === 'false') {
      /* samo ID */
    } else {
      q.expand_relations = 'true';
    }
  }

  return q;
}

function parseHeaderInt(value) {
  if (value == null || value === '') return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Dohvat cijelog strančenog skupa za jedan endpoint.
 */
async function fetchAllDatasetPages(job, snapshotId, opts = {}) {
  const entry = getDataset(job.datasetId);
  if (!entry) {
    throw new Error(`Nepoznat skup: ${job.datasetId}`);
  }

  const queryExtra = { ...job.query, ...opts, snapshot_id: snapshotId };
  const apiPath = resolveApiPath(entry, queryExtra);
  const rows = [];
  let offset = 0;
  let pages = 0;
  let totalCount = null;

  while (true) {
    const sudregQuery = buildSudregQuery(entry, apiPath, {
      ...queryExtra,
      offset,
      limit: FULL_FETCH_PAGE_LIMIT,
      no_data_error: '0'
    });
    const result = await fetchSudregJavni(apiPath, sudregQuery, { signal: opts.signal });
    pages += 1;
    if (totalCount == null) {
      totalCount = parseHeaderInt(result.meta?.xTotalCount);
    }
    const chunk = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
    rows.push(...chunk);
    if (chunk.length === 0) break;
    offset += chunk.length;
    if (totalCount != null && rows.length >= totalCount) break;
    if (chunk.length < FULL_FETCH_PAGE_LIMIT) break;
  }

  if (totalCount != null && rows.length !== totalCount) {
    throw new Error(
      `Sudreg ${apiPath} snapshot_id=${snapshotId}: dohvaćeno ${rows.length}, očekivano ${totalCount}.`
    );
  }

  return {
    datasetKey: job.datasetKey,
    datasetId: job.datasetId,
    apiPath,
    label: job.label,
    rows,
    pages,
    totalCount: totalCount ?? rows.length,
    complete: true
  };
}

/**
 * Stranice → JSONL na disk (bez držanja cijelog skupa u RAM).
 */
async function fetchAllDatasetPagesToJsonl(job, snapshotId, filePath, opts = {}) {
  const entry = getDataset(job.datasetId);
  if (!entry) {
    throw new Error(`Nepoznat skup: ${job.datasetId}`);
  }

  const outDir = path.dirname(filePath);
  if (outDir && outDir !== '.') fs.mkdirSync(outDir, { recursive: true });

  const queryExtra = { ...job.query, ...opts, snapshot_id: snapshotId };
  const apiPath = resolveApiPath(entry, queryExtra);
  const stream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf8' });
  let offset = 0;
  let pages = 0;
  let totalCount = null;
  let rowCount = 0;

  while (true) {
    const sudregQuery = buildSudregQuery(entry, apiPath, {
      ...queryExtra,
      offset,
      limit: FULL_FETCH_PAGE_LIMIT,
      no_data_error: '0'
    });
    const result = await fetchSudregJavni(apiPath, sudregQuery, { signal: opts.signal });
    pages += 1;
    if (totalCount == null) {
      totalCount = parseHeaderInt(result.meta?.xTotalCount);
    }
    const chunk = Array.isArray(result.data) ? result.data : result.data ? [result.data] : [];
    for (const row of chunk) {
      stream.write(`${JSON.stringify(row)}\n`);
      rowCount += 1;
    }
    if (chunk.length === 0) break;
    offset += chunk.length;
    if (totalCount != null && rowCount >= totalCount) break;
    if (chunk.length < FULL_FETCH_PAGE_LIMIT) break;
  }

  await closeWriteStream(stream);

  if (totalCount != null && rowCount !== totalCount) {
    throw new Error(
      `Sudreg ${apiPath} snapshot_id=${snapshotId}: zapisano ${rowCount}, očekivano ${totalCount}.`
    );
  }

  return {
    datasetKey: job.datasetKey,
    datasetId: job.datasetId,
    apiPath,
    label: job.label,
    rowCount,
    pages,
    totalCount: totalCount ?? rowCount,
    complete: true,
    filePath
  };
}

function listDatasetFetchOptions() {
  return {
    subjekti: {
      only_active: {
        default: '1',
        note: 'OpenAPI: zadano samo aktivni. only_active=0 uključuje i neaktivne subjekte (status=0).'
      }
    },
    pravni_oblici: { expand_relations: { default: 'true' } },
    djelatnost: { vrste: Object.keys(DJELATNOST_PATH_BY_VRSTA) },
    podružnica: { api_paths: PODRUZNICA_API_PATHS }
  };
}

module.exports = {
  fetchDatasetPage,
  fetchAllDatasetPages,
  fetchAllDatasetPagesToJsonl,
  resolveApiPath,
  DJELATNOST_PATH_BY_VRSTA,
  listDatasetFetchOptions,
  listAllImportJobs
};
