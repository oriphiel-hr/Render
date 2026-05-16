/**
 * Staging na disk: snapshots/{id}/, diffs/{from}_to_{to}/
 * @see SUDREG_DATA_DIR u .env
 */

const fs = require('fs');
const path = require('path');
const { fetchAllPromjene, comparePromjeneSnapshots, sortPromjeneByMbs } = require('./sudregPromjeneDiff');

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
  const fetched = await fetchAllPromjene(id, {
    no_data_error: '0',
    omit_nulls: opts.omit_nulls,
    signal: opts.signal
  });

  ensureDir(dir);
  writeJsonl(outFile, fetched.rows);

  const meta = {
    snapshot_id: id,
    saved_at: new Date().toISOString(),
    duration_ms: Date.now() - t0,
    endpoints: {
      promjene: {
        file: PROMJENE_FILE,
        rowCount: fetched.rows.length,
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

  if (canUseDisk) {
    source = 'disk';
    const baselineRows = sortPromjeneByMbs(readJsonl(fromFile));
    const targetRows = sortPromjeneByMbs(readJsonl(toFile));
    result = await comparePromjeneSnapshots({
      snapshot_id_from: from,
      snapshot_id_to: to,
      baseline_rows: baselineRows,
      baseline_totalCount: baselineRows.length,
      target_rows: targetRows,
      target_totalCount: targetRows.length
    });
  } else {
    source = 'api';
    result = await comparePromjeneSnapshots({
      snapshot_id_from: from,
      snapshot_id_to: to,
      omit_nulls: opts.omit_nulls,
      signal: opts.signal
    });
  }

  const dir = diffDir(from, to);
  ensureDir(dir);
  writeJsonl(diffPromjenePath(from, to), result.data);

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
    diffRows: result.data.length
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
      const entry = { snapshot_id: name, dir };
      const mp = path.join(dir, META_FILE);
      if (fs.existsSync(mp)) {
        try {
          entry.meta = readJson(mp);
        } catch (_) {
          entry.metaError = true;
        }
      }
      entry.has_promjene = fs.existsSync(path.join(dir, PROMJENE_FILE));
      snapshots.push(entry);
    }
    snapshots.sort((a, b) => Number(b.snapshot_id) - Number(a.snapshot_id));
  }

  const diffs = [];
  if (fs.existsSync(diffsRoot)) {
    for (const name of fs.readdirSync(diffsRoot)) {
      const dir = path.join(diffsRoot, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const entry = { key: name, dir };
      const mp = path.join(dir, META_FILE);
      if (fs.existsSync(mp)) {
        try {
          entry.meta = readJson(mp);
        } catch (_) {
          entry.metaError = true;
        }
      }
      entry.has_promjene = fs.existsSync(path.join(dir, PROMJENE_FILE));
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
  promjeneExists,
  saveSnapshotPromjene,
  savePromjeneDiff,
  listStaging,
  readJsonl,
  writeJsonl
};
