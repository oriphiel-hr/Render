/**
 * Staging na disk: snapshots/{id}/, diffs/{from}_to_{to}/
 * @see SUDREG_DATA_DIR u .env
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  streamPromjeneToJsonl,
  compareAndWriteDiffJsonl
} = require('./sudregPromjeneDiff');

const PROMJENE_FILE = 'promjene.jsonl';
const META_FILE = 'meta.json';

function getDataDir() {
  const raw = String(process.env.SUDREG_DATA_DIR || '').trim();
  if (raw) return path.resolve(raw);
  return path.resolve(process.cwd(), 'data');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function snapshotDir(snapshotId) {
  return path.join(getDataDir(), 'snapshots', String(snapshotId));
}

function diffDir(fromId, toId) {
  return path.join(getDataDir(), 'diffs', `${String(fromId)}_to_${String(toId)}`);
}

function promjenePath(snapshotId) {
  return path.join(snapshotDir(snapshotId), PROMJENE_FILE);
}

function metaPath(snapshotId) {
  return path.join(snapshotDir(snapshotId), META_FILE);
}

function diffMetaPath(fromId, toId) {
  return path.join(diffDir(fromId, toId), META_FILE);
}

function diffPromjenePath(fromId, toId) {
  return path.join(diffDir(fromId, toId), PROMJENE_FILE);
}

function datasetsDir(snapshotId) {
  return path.join(snapshotDir(snapshotId), 'datasets');
}

function datasetFilePath(snapshotId, datasetKey) {
  const safe = String(datasetKey).replace(/[^a-zA-Z0-9._-]+/g, '_');
  return path.join(datasetsDir(snapshotId), `${safe}.jsonl`);
}

function saveDatasetJsonl(snapshotId, datasetKey, rows, metaExtra = {}) {
  const filePath = datasetFilePath(snapshotId, datasetKey);
  ensureDir(path.dirname(filePath));
  writeJsonl(filePath, rows);
  return writeDatasetMeta(snapshotId, datasetKey, filePath, {
    rowCount: rows.length,
    ...metaExtra
  });
}

/** Meta nakon streamanog JSONL (rowCount već poznat). */
function datasetMetaPath(snapshotId, datasetKey) {
  return path.join(
    datasetsDir(snapshotId),
    `${String(datasetKey).replace(/[^a-zA-Z0-9._-]+/g, '_')}.meta.json`
  );
}

function readDatasetMeta(snapshotId, datasetKey) {
  const metaFile = datasetMetaPath(snapshotId, datasetKey);
  if (!fs.existsSync(metaFile)) return null;
  try {
    return readJson(metaFile);
  } catch (_) {
    return null;
  }
}

function writeDatasetMeta(snapshotId, datasetKey, filePath, metaExtra = {}) {
  const rowCount = metaExtra.rowCount != null ? metaExtra.rowCount : 0;
  const meta = {
    snapshot_id: String(snapshotId),
    dataset_key: datasetKey,
    saved_at: new Date().toISOString(),
    rowCount,
    file: path.basename(filePath),
    ...metaExtra
  };
  const metaFile = datasetMetaPath(snapshotId, datasetKey);
  writeJson(metaFile, meta);
  return { filePath, meta, metaFile };
}

async function attachMbsOrderToDatasetMeta(snapshotId, datasetKey, filePath, metaExtra = {}) {
  const { validateMbsOrderInJsonl, mbsOrderMetaSlice } = require('./sudregMbsOrderValidate');
  const existing = readDatasetMeta(snapshotId, datasetKey) || {};
  const validation = await validateMbsOrderInJsonl(filePath);
  const mbs_order = {
    checked_at: new Date().toISOString(),
    ...mbsOrderMetaSlice(validation)
  };
  writeDatasetMeta(snapshotId, datasetKey, filePath, {
    ...existing,
    ...metaExtra,
    mbs_order
  });
  return { validation, mbs_order };
}

async function attachMbsOrderToPromjeneMeta(snapshotId, existingMeta = null) {
  const { validateMbsOrderInJsonl, mbsOrderMetaSlice } = require('./sudregMbsOrderValidate');
  const id = String(snapshotId);
  const outFile = promjenePath(id);
  const validation = await validateMbsOrderInJsonl(outFile);
  const mbs_order = {
    checked_at: new Date().toISOString(),
    ...mbsOrderMetaSlice(validation)
  };
  const meta = existingMeta ? { ...existingMeta } : readJson(metaPath(id));
  if (!meta.endpoints) meta.endpoints = {};
  if (!meta.endpoints.promjene) meta.endpoints.promjene = {};
  meta.endpoints.promjene.mbs_order = mbs_order;
  meta.endpoints.promjene.sorted_by_mbs = validation.ok === true;
  writeJson(metaPath(id), meta);
  return { validation, mbs_order, meta };
}

function promjeneExists(snapshotId) {
  return fs.existsSync(promjenePath(snapshotId));
}

function diffPromjeneExists(fromId, toId) {
  const filePath = diffPromjenePath(fromId, toId);
  if (!fs.existsSync(filePath)) return false;
  try {
    return fs.statSync(filePath).size > 0;
  } catch (_) {
    return false;
  }
}

function datasetFileExists(snapshotId, datasetKey) {
  const filePath = datasetFilePath(snapshotId, datasetKey);
  if (!fs.existsSync(filePath)) return false;
  try {
    return fs.statSync(filePath).size > 0;
  } catch (_) {
    return false;
  }
}

function writeJson(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonl(filePath, rows) {
  ensureDir(path.dirname(filePath));
  const body = rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '');
  fs.writeFileSync(filePath, body, 'utf8');
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8').trim();
  if (!text) return [];
  return text.split('\n').map((line) => JSON.parse(line));
}

/** Broj nepraznih JSONL redaka (bez učitavanja cijele datoteke u memoriju). */
function countJsonlLines(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const stat = fs.statSync(filePath);
  if (stat.size === 0) return 0;
  let count = 0;
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });
  return new Promise((resolve, reject) => {
    rl.on('line', (line) => {
      if (line.trim()) count += 1;
    });
    rl.on('close', () => resolve(count));
    rl.on('error', reject);
  });
}

/**
 * Preuzmi cijeli /promjene s API-ja i spremi u snapshots/{id}/promjene.jsonl
 */
async function saveSnapshotPromjene(snapshotId, opts = {}) {
  const id = String(snapshotId);
  const dir = snapshotDir(id);
  const outFile = promjenePath(id);

  if (promjeneExists(id) && !opts.force) {
    let meta = readJson(metaPath(id));
    let mbs_order = meta?.endpoints?.promjene?.mbs_order;
    if (opts.validate_mbs !== false && fs.existsSync(outFile)) {
      const attached = await attachMbsOrderToPromjeneMeta(id, meta);
      meta = attached.meta;
      mbs_order = attached.mbs_order;
    }
    return {
      ok: true,
      skipped: true,
      snapshot_id: id,
      dir,
      promjenePath: outFile,
      meta,
      mbs_order
    };
  }

  const t0 = Date.now();
  ensureDir(dir);
  const fetched = await streamPromjeneToJsonl(id, outFile, {
    no_data_error: '0',
    omit_nulls: opts.omit_nulls,
    signal: opts.signal
  });

  const { validateMbsOrderInJsonl, mbsOrderMetaSlice } = require('./sudregMbsOrderValidate');
  const mbsValidation = await validateMbsOrderInJsonl(outFile);

  const meta = {
    snapshot_id: id,
    saved_at: new Date().toISOString(),
    duration_ms: Date.now() - t0,
    endpoints: {
      promjene: {
        file: PROMJENE_FILE,
        rowCount: fetched.rowCount,
        totalCount: fetched.totalCount,
        pages: fetched.pages,
        complete: fetched.complete,
        sorted_by_mbs: mbsValidation.ok === true,
        note: 'Redoslijed stranica API-ja; za SCN diff koristi comparePromjeneSnapshots (sort u memoriji).',
        mbs_order: {
          checked_at: new Date().toISOString(),
          ...mbsOrderMetaSlice(mbsValidation)
        }
      }
    }
  };
  writeJson(metaPath(id), meta);

  return {
    ok: true,
    skipped: false,
    snapshot_id: id,
    dir,
    promjenePath: outFile,
    meta,
    mbs_order: meta.endpoints.promjene.mbs_order
  };
}

/**
 * Jedan matični skup → JSONL na disk; preskoči ako datoteka već postoji.
 */
async function saveDatasetToDiskIfMissing(snapshotId, job, opts = {}) {
  const { fetchAllDatasetPagesToJsonl } = require('./sudregDatasetFetch');
  const id = String(snapshotId);
  const outFile = datasetFilePath(id, job.datasetKey);

  if (datasetFileExists(id, job.datasetKey) && !opts.force) {
    let mbs_order;
    if (opts.validate_mbs !== false) {
      const attached = await attachMbsOrderToDatasetMeta(id, job.datasetKey, outFile);
      mbs_order = attached.mbs_order;
    }
    return {
      ok: true,
      skipped: true,
      snapshot_id: id,
      dataset_key: job.datasetKey,
      filePath: outFile,
      mbs_order
    };
  }

  const fetched = await fetchAllDatasetPagesToJsonl(job, id, outFile, {
    signal: opts.signal
  });
  const metaExtra = {
    api_path: fetched.apiPath,
    label: fetched.label,
    pages: fetched.pages,
    totalCount: fetched.totalCount,
    rowCount: fetched.rowCount
  };
  let mbs_order;
  if (opts.validate_mbs !== false) {
    const attached = await attachMbsOrderToDatasetMeta(id, job.datasetKey, outFile, metaExtra);
    mbs_order = attached.mbs_order;
  } else {
    writeDatasetMeta(id, job.datasetKey, outFile, metaExtra);
  }

  return {
    ok: true,
    skipped: false,
    snapshot_id: id,
    dataset_key: job.datasetKey,
    rowCount: fetched.rowCount,
    pages: fetched.pages,
    filePath: outFile,
    mbs_order
  };
}

/**
 * Usporedi i spremi diff. Ako su obje snimke na disku, usporedba bez API-ja.
 */
async function savePromjeneDiff(fromId, toId, opts = {}) {
  const from = String(fromId);
  const to = String(toId);
  const preferDisk = opts.prefer_disk !== '0' && opts.prefer_disk !== false;
  const saveMissing = opts.save_snapshots === '1' || opts.save_snapshots === true;

  if (from === to) {
    throw new Error('snapshot_id_from i snapshot_id_to moraju biti različiti.');
  }

  if (!opts.force && diffPromjeneExists(from, to)) {
    let meta = null;
    const mp = diffMetaPath(from, to);
    if (fs.existsSync(mp)) {
      try {
        meta = readJson(mp);
      } catch (_) {
        meta = null;
      }
    }
    return {
      ok: true,
      skipped: true,
      snapshot_id_from: from,
      snapshot_id_to: to,
      dir: diffDir(from, to),
      promjenePath: diffPromjenePath(from, to),
      metaPath: mp,
      source: meta?.source || 'disk',
      compare: meta?.compare,
      stats: meta?.stats,
      diffRows: meta?.stats?.diffRows ?? null
    };
  }

  if (saveMissing) {
    if (!promjeneExists(from)) await saveSnapshotPromjene(from, opts);
    if (!promjeneExists(to)) await saveSnapshotPromjene(to, opts);
  }

  const fromFile = promjenePath(from);
  const toFile = promjenePath(to);
  const snapshotsOnDisk =
    preferDisk && fs.existsSync(fromFile) && fs.existsSync(toFile);

  const t0 = Date.now();
  const diffOut = diffPromjenePath(from, to);
  const dir = diffDir(from, to);
  ensureDir(dir);

  if (!snapshotsOnDisk) {
    if (!promjeneExists(from)) await saveSnapshotPromjene(from, opts);
    if (!promjeneExists(to)) await saveSnapshotPromjene(to, opts);
  }

  // Stream indeks po MBS — ne učitava cijele snimke u RAM (izbjegava OOM na Renderu).
  const source = 'disk-index';
  const result = await compareAndWriteDiffJsonl(from, to, diffOut, {
    baseline_file: promjenePath(from),
    target_file: promjenePath(to),
    omit_nulls: opts.omit_nulls,
    signal: opts.signal,
    onProgress: opts.onProgress
  });

  const diffMeta = {
    snapshot_id_from: from,
    snapshot_id_to: to,
    saved_at: new Date().toISOString(),
    duration_ms: Date.now() - t0,
    source,
    compare: result.compare,
    stats: result.stats,
    files: {
      promjene: PROMJENE_FILE,
      meta: META_FILE
    }
  };
  writeJson(diffMetaPath(from, to), diffMeta);

  return {
    ok: true,
    dir,
    promjenePath: diffPromjenePath(from, to),
    metaPath: diffMetaPath(from, to),
    source,
    compare: result.compare,
    stats: result.stats,
    diffRows: result.diffRows ?? result.stats?.diffRows ?? 0
  };
}

const ALLOWED_DOWNLOAD_FILES = {
  promjene: PROMJENE_FILE,
  meta: META_FILE
};

/**
 * Sigurna putanja za preuzimanje (samo meta.json / promjene.jsonl u snapshots/ ili diffs/).
 * @param {URLSearchParams} q
 */
function resolveStagingDownload(q) {
  const fileKey = (q.get('file') || 'promjene').toLowerCase();
  const fileName = ALLOWED_DOWNLOAD_FILES[fileKey];
  if (!fileName) {
    return { error: 'file mora biti promjene ili meta.' };
  }

  const from = q.get('snapshot_id_from') || q.get('from');
  const to = q.get('snapshot_id_to') || q.get('to');
  const kind = (q.get('kind') || '').toLowerCase();

  if (kind === 'diff' || (from && to)) {
    if (!from || !to) {
      return { error: 'Za diff: snapshot_id_from i snapshot_id_to (ili from i to).' };
    }
    const filePath = path.join(diffDir(from, to), fileName);
    const downloadName =
      fileKey === 'meta'
        ? `meta_${from}_to_${to}.json`
        : `promjene_${from}_to_${to}.jsonl`;
    return {
      filePath,
      downloadName,
      contentType: fileKey === 'meta' ? 'application/json; charset=utf-8' : 'application/x-ndjson'
    };
  }

  const snapshotId = q.get('snapshot_id');
  if (!snapshotId) {
    return { error: 'snapshot_id je obavezan (ili kind=diff s from/to).' };
  }
  const filePath = path.join(snapshotDir(snapshotId), fileName);
  const downloadName =
    fileKey === 'meta' ? `meta_${snapshotId}.json` : `promjene_${snapshotId}.jsonl`;
  return {
    filePath,
    downloadName,
    contentType: fileKey === 'meta' ? 'application/json; charset=utf-8' : 'application/x-ndjson'
  };
}

function listStaging() {
  const root = getDataDir();
  const snapshotsRoot = path.join(root, 'snapshots');
  const diffsRoot = path.join(root, 'diffs');

  const snapshots = [];
  if (fs.existsSync(snapshotsRoot)) {
    for (const name of fs.readdirSync(snapshotsRoot)) {
      const dir = path.join(snapshotsRoot, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const promjeneFile = path.join(dir, PROMJENE_FILE);
      const entry = {
        snapshot_id: name,
        label: `Snimka #${name}`,
        dir,
        disk_rel_path: path.relative(root, dir).split(path.sep).join('/'),
        files: {
          meta: path.join(dir, META_FILE),
          promjene: fs.existsSync(promjeneFile) ? promjeneFile : null
        }
      };
      const mp = entry.files.meta;
      if (fs.existsSync(mp)) {
        try {
          entry.meta = readJson(mp);
        } catch (_) {
          entry.metaError = true;
        }
      }
      entry.has_promjene = fs.existsSync(promjeneFile);
      if (entry.has_promjene) {
        try {
          entry.promjene_size_bytes = fs.statSync(promjeneFile).size;
        } catch (_) {
          entry.promjene_size_bytes = null;
        }
      }
      const dsDir = path.join(dir, 'datasets');
      const datasets = [];
      if (fs.existsSync(dsDir)) {
        for (const df of fs.readdirSync(dsDir)) {
          if (!df.endsWith('.meta.json')) continue;
          const metaFile = path.join(dsDir, df);
          try {
            const dm = readJson(metaFile);
            const jsonlName = df.replace(/\.meta\.json$/, '.jsonl');
            const jsonlPath = path.join(dsDir, jsonlName);
            const hasFile = fs.existsSync(jsonlPath);
            datasets.push({
              dataset_key: dm.dataset_key || jsonlName.replace(/\.jsonl$/, ''),
              row_count: dm.rowCount != null ? Number(dm.rowCount) : null,
              saved_at: dm.saved_at || null,
              has_file: hasFile,
              size_bytes: hasFile ? fs.statSync(jsonlPath).size : 0,
              mbs_order: dm.mbs_order || null
            });
          } catch (_) {
            datasets.push({ dataset_key: df, parse_error: true });
          }
        }
        datasets.sort((a, b) =>
          String(a.dataset_key || '').localeCompare(String(b.dataset_key || ''))
        );
      }
      entry.datasets = datasets;
      entry.saved_at =
        entry.meta?.saved_at ||
        entry.meta?.endpoints?.promjene?.saved_at ||
        datasets[0]?.saved_at ||
        null;
      entry.promjene_row_count =
        entry.meta?.endpoints?.promjene?.rowCount != null
          ? Number(entry.meta.endpoints.promjene.rowCount)
          : null;
      snapshots.push(entry);
    }
    snapshots.sort((a, b) => Number(b.snapshot_id) - Number(a.snapshot_id));
  }

  const diffs = [];
  if (fs.existsSync(diffsRoot)) {
    for (const name of fs.readdirSync(diffsRoot)) {
      const dir = path.join(diffsRoot, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const m = /^(\d+)_to_(\d+)$/.exec(name);
      const promjeneFile = path.join(dir, PROMJENE_FILE);
      const entry = {
        key: name,
        label: m ? `Diff #${m[1]} → #${m[2]}` : `Diff ${name}`,
        snapshot_id_from: m ? m[1] : null,
        snapshot_id_to: m ? m[2] : null,
        dir,
        files: {
          meta: path.join(dir, META_FILE),
          promjene: fs.existsSync(promjeneFile) ? promjeneFile : null
        }
      };
      const mp = entry.files.meta;
      if (fs.existsSync(mp)) {
        try {
          entry.meta = readJson(mp);
        } catch (_) {
          entry.metaError = true;
        }
      }
      entry.has_promjene = fs.existsSync(promjeneFile);
      diffs.push(entry);
    }
  }

  return { dataDir: root, snapshots, diffs };
}

function isSafeSnapshotId(snapshotId) {
  return /^\d+$/.test(String(snapshotId || '').trim());
}

function rmDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return false;
  fs.rmSync(dirPath, { recursive: true, force: true });
  return true;
}

/**
 * Obriši snimku s diska (snapshots/{id}) i sve diff mape koje je referenciraju.
 * Ne dira PostgreSQL.
 */
function deleteSnapshotFromDisk(snapshotId) {
  const id = String(snapshotId).trim();
  if (!isSafeSnapshotId(id)) {
    throw new Error('snapshot_id mora biti numerički ID (npr. 1165).');
  }

  const root = getDataDir();
  const snapDir = snapshotDir(id);
  const snapRel = path.relative(root, snapDir).split(path.sep).join('/');
  const snapExisted = fs.existsSync(snapDir);

  const deletedDiffs = [];
  const diffsRoot = path.join(root, 'diffs');
  if (fs.existsSync(diffsRoot)) {
    for (const name of fs.readdirSync(diffsRoot)) {
      const m = /^(\d+)_to_(\d+)$/.exec(name);
      if (!m) continue;
      if (m[1] !== id && m[2] !== id) continue;
      const diffPath = path.join(diffsRoot, name);
      if (fs.statSync(diffPath).isDirectory()) {
        rmDirRecursive(diffPath);
        deletedDiffs.push({
          key: name,
          snapshot_id_from: m[1],
          snapshot_id_to: m[2]
        });
      }
    }
  }

  let snapshotRemoved = false;
  if (snapExisted) {
    rmDirRecursive(snapDir);
    snapshotRemoved = !fs.existsSync(snapDir);
  }

  if (!snapExisted && deletedDiffs.length === 0) {
    return {
      ok: true,
      skipped: true,
      reason: 'not_found',
      snapshot_id: id,
      message: `Snimka #${id} nije na disku.`
    };
  }

  return {
    ok: true,
    skipped: false,
    snapshot_id: id,
    snapshot_removed: snapshotRemoved,
    snapshot_existed: snapExisted,
    disk_rel_path: snapRel,
    deleted_diffs: deletedDiffs,
    message:
      snapshotRemoved
        ? `Snimka #${id} obrisana s diska` +
          (deletedDiffs.length ? ` (+ ${deletedDiffs.length} diff mapa).` : '.')
        : `Snimka #${id} nije pronađena; obrisano ${deletedDiffs.length} diff mapa.`
  };
}

/**
 * Normalizirani popis snimki na disku za UI (padajući izbornik kao API).
 */
function listDiskSnapshotsForUi() {
  const { snapshots, dataDir } = listStaging();
  return snapshots.map((entry) => {
    const id = entry.snapshot_id;
    const promRows = entry.promjene_row_count;
    const dsCount = Array.isArray(entry.datasets) ? entry.datasets.length : 0;
    const parts = [];
    if (entry.has_promjene) {
      parts.push(
        promRows != null
          ? `promjene ${promRows.toLocaleString('hr-HR')}`
          : 'promjene ✓'
      );
    }
    if (dsCount > 0) parts.push(`${dsCount} skupova`);
    return {
      id,
      snapshot_id: id,
      source: 'disk',
      label: entry.label,
      description: parts.length ? parts.join(' · ') : 'prazno / samo meta',
      timestamp: entry.saved_at || null,
      staleness: null,
      has_promjene: Boolean(entry.has_promjene),
      promjene_row_count: promRows,
      promjene_size_bytes: entry.promjene_size_bytes ?? null,
      datasets: entry.datasets || [],
      disk_rel_path: entry.disk_rel_path,
      meta: entry.meta || null
    };
  });
}

module.exports = {
  getDataDir,
  snapshotDir,
  diffDir,
  promjenePath,
  metaPath,
  diffPromjenePath,
  diffMetaPath,
  promjeneExists,
  diffPromjeneExists,
  datasetFileExists,
  saveSnapshotPromjene,
  saveDatasetToDiskIfMissing,
  savePromjeneDiff,
  listStaging,
  listDiskSnapshotsForUi,
  deleteSnapshotFromDisk,
  isSafeSnapshotId,
  resolveStagingDownload,
  readJsonl,
  countJsonlLines,
  writeJsonl,
  readJson,
  datasetsDir,
  datasetFilePath,
  saveDatasetJsonl,
  writeDatasetMeta
};
