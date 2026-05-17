/**
 * Staging na disk: snapshots/{id}/, diffs/{from}_to_{to}/
 * @see SUDREG_DATA_DIR u .env
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  streamPromjeneToJsonl,
  comparePromjeneSnapshotsToJsonl
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
  const metaFile = path.join(
    datasetsDir(snapshotId),
    `${String(datasetKey).replace(/[^a-zA-Z0-9._-]+/g, '_')}.meta.json`
  );
  writeJson(metaFile, meta);
  return { filePath, meta, metaFile };
}

function promjeneExists(snapshotId) {
  return fs.existsSync(promjenePath(snapshotId));
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
    const meta = readJson(metaPath(id));
    return {
      ok: true,
      skipped: true,
      snapshot_id: id,
      dir,
      promjenePath: outFile,
      meta
    };
  }

  const t0 = Date.now();
  ensureDir(dir);
  const fetched = await streamPromjeneToJsonl(id, outFile, {
    no_data_error: '0',
    omit_nulls: opts.omit_nulls,
    signal: opts.signal
  });

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
        complete: fetched.complete
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
    meta
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

  if (saveMissing) {
    if (!promjeneExists(from)) await saveSnapshotPromjene(from, opts);
    if (!promjeneExists(to)) await saveSnapshotPromjene(to, opts);
  }

  const fromFile = promjenePath(from);
  const toFile = promjenePath(to);
  const canUseDisk = preferDisk && fs.existsSync(fromFile) && fs.existsSync(toFile);

  const t0 = Date.now();
  let result;
  let source;

  const diffOut = diffPromjenePath(from, to);
  const dir = diffDir(from, to);
  ensureDir(dir);

  if (canUseDisk) {
    source = 'disk';
    const [baselineTotal, targetTotal] = await Promise.all([
      countJsonlLines(fromFile),
      countJsonlLines(toFile)
    ]);
    result = await comparePromjeneSnapshotsToJsonl({
      snapshot_id_from: from,
      snapshot_id_to: to,
      outputPath: diffOut,
      baseline_file: fromFile,
      target_file: toFile,
      baseline_totalCount: baselineTotal,
      target_totalCount: targetTotal
    });
  } else {
    source = 'api';
    result = await comparePromjeneSnapshotsToJsonl({
      snapshot_id_from: from,
      snapshot_id_to: to,
      outputPath: diffOut,
      omit_nulls: opts.omit_nulls,
      signal: opts.signal
    });
  }

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

module.exports = {
  getDataDir,
  snapshotDir,
  diffDir,
  promjenePath,
  metaPath,
  diffPromjenePath,
  diffMetaPath,
  promjeneExists,
  saveSnapshotPromjene,
  savePromjeneDiff,
  listStaging,
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
