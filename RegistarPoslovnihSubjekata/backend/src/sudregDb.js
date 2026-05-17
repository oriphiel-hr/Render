/**
 * Sinkronizacija staginga s diska u PostgreSQL (nakon JSON/JSONL).
 */

const path = require('path');
const { getPrisma, isDatabaseConfigured } = require('./lib/prisma');
const fs = require('fs');
const {
  getDataDir,
  readJson,
  readJsonl,
  countJsonlLines,
  metaPath,
  diffMetaPath,
  promjenePath,
  diffPromjenePath,
  datasetFilePath,
  datasetsDir
} = require('./sudregStaging');

const BATCH_SIZE = 500;

function shouldSyncDb(opts = {}) {
  if (!isDatabaseConfigured()) return false;
  if (opts.sync_db === '1' || opts.sync_db === true) return true;
  if (opts.sync_db === '0' || opts.sync_db === false) return false;
  return true;
}

function relDiskPath(absolutePath) {
  const root = getDataDir();
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

function parseVrijeme(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Neispravan datum vrijeme: ${value}`);
  }
  return d;
}

function mapSnapshotPromjenaRow(row, snapshotId, stagedSnapshotId) {
  if (row.mbs == null || row.id == null || row.vrijeme == null || row.scn == null) {
    return null;
  }
  return {
    mbs: Number(row.mbs),
    promjenaId: BigInt(row.id),
    vrijeme: parseVrijeme(row.vrijeme),
    scn: BigInt(row.scn),
    snapshotId: Number(snapshotId),
    snapshotIdFrom: null,
    snapshotIdTo: null,
    vrsta: null,
    scnStaro: null,
    stagedSnapshotId,
    stagedDiffId: null
  };
}

function mapDiffPromjenaRow(row, fromId, toId, stagedDiffId) {
  if (row.mbs == null || row.scn == null || row.id == null || !row.vrijeme) {
    return null;
  }
  const base = {
    mbs: Number(row.mbs),
    promjenaId: BigInt(row.id),
    vrijeme: row.vrijeme ? parseVrijeme(row.vrijeme) : new Date(0),
    scn: BigInt(row.scn),
    snapshotId: null,
    snapshotIdFrom: Number(fromId),
    snapshotIdTo: Number(toId),
    vrsta: row.vrsta ? String(row.vrsta) : null,
    scnStaro: row.scn_staro != null ? BigInt(row.scn_staro) : null,
    stagedSnapshotId: null,
    stagedDiffId
  };
  return base;
}

async function insertPromjeneBatched(createRows, onProgress) {
  const db = getPrisma();
  const total = createRows.length;
  let inserted = 0;
  for (let i = 0; i < createRows.length; i += BATCH_SIZE) {
    const slice = createRows.slice(i, i + BATCH_SIZE);
    const result = await db.promjena.createMany({ data: slice, skipDuplicates: true });
    inserted += result.count;
    const done = Math.min(i + slice.length, total);
    if (onProgress) onProgress({ done, total, inserted });
  }
  return inserted;
}

/**
 * Učitaj promjene.jsonl s diska u bazu (nakon saveSnapshotPromjene).
 */
async function syncSnapshotPromjeneToDb(snapshotId, opts = {}) {
  const id = Number(snapshotId);
  const jsonlFile = promjenePath(snapshotId);
  const metaObj = fs.existsSync(metaPath(snapshotId))
    ? readJson(metaPath(snapshotId))
    : { snapshot_id: id };

  const rows = readJsonl(jsonlFile);
  const db = getPrisma();
  const diskRel = relDiskPath(jsonlFile);
  const savedAt = metaObj.saved_at ? new Date(metaObj.saved_at) : new Date();

  const staged = await db.stagedSnapshot.upsert({
    where: { snapshotId: id },
    create: {
      snapshotId: id,
      metaJson: metaObj,
      diskRelPath: diskRel,
      rowCount: rows.length,
      savedAt
    },
    update: {
      metaJson: metaObj,
      diskRelPath: diskRel,
      rowCount: rows.length,
      savedAt
    }
  });

  await db.promjena.deleteMany({ where: { stagedSnapshotId: staged.id } });

  const mapped = [];
  for (const row of rows) {
    const m = mapSnapshotPromjenaRow(row, id, staged.id);
    if (m) mapped.push(m);
  }

  const inserted = await insertPromjeneBatched(mapped, opts.onProgress);

  await db.stagedSnapshot.update({
    where: { id: staged.id },
    data: { dbSyncedAt: new Date(), rowCount: mapped.length }
  });

  return {
    ok: true,
    snapshot_id: id,
    stagedSnapshotId: staged.id,
    diskRelPath: diskRel,
    rowsOnDisk: rows.length,
    rowsMapped: mapped.length,
    rowsInserted: inserted,
    rowsForProgress: mapped.length
  };
}

/**
 * Učitaj diff promjene.jsonl u bazu (nakon savePromjeneDiff).
 */
async function syncDiffPromjeneToDb(fromId, toId, opts = {}) {
  const from = Number(fromId);
  const to = Number(toId);
  const jsonlFile = diffPromjenePath(fromId, toId);
  const metaObj = fs.existsSync(diffMetaPath(fromId, toId))
    ? readJson(diffMetaPath(fromId, toId))
    : { snapshot_id_from: from, snapshot_id_to: to };

  const rows = readJsonl(jsonlFile);
  const db = getPrisma();
  const diskRel = relDiskPath(jsonlFile);
  const savedAt = metaObj.saved_at ? new Date(metaObj.saved_at) : new Date();

  const staged = await db.stagedDiff.upsert({
    where: {
      snapshotIdFrom_snapshotIdTo: { snapshotIdFrom: from, snapshotIdTo: to }
    },
    create: {
      snapshotIdFrom: from,
      snapshotIdTo: to,
      metaJson: metaObj,
      diskRelPath: diskRel,
      diffRowCount: rows.length,
      savedAt
    },
    update: {
      metaJson: metaObj,
      diskRelPath: diskRel,
      diffRowCount: rows.length,
      savedAt
    }
  });

  await db.promjena.deleteMany({ where: { stagedDiffId: staged.id } });

  const mapped = [];
  for (const row of rows) {
    const m = mapDiffPromjenaRow(row, from, to, staged.id);
    if (m) mapped.push(m);
  }

  const inserted = await insertPromjeneBatched(mapped, opts.onProgress);

  await db.stagedDiff.update({
    where: { id: staged.id },
    data: { dbSyncedAt: new Date(), diffRowCount: mapped.length }
  });

  return {
    ok: true,
    snapshot_id_from: from,
    snapshot_id_to: to,
    stagedDiffId: staged.id,
    diskRelPath: diskRel,
    rowsOnDisk: rows.length,
    rowsMapped: mapped.length,
    rowsInserted: inserted,
    rowsForProgress: mapped.length
  };
}

function mapMaticniRow(row, snapshotId, datasetKey, stagedDatasetId) {
  const mbs = row.mbs != null ? Number(row.mbs) : null;
  return {
    snapshotId: Number(snapshotId),
    datasetKey: String(datasetKey),
    mbs: Number.isFinite(mbs) ? mbs : null,
    payload: row,
    stagedDatasetId
  };
}

async function insertMaticniBatched(createRows, onProgress) {
  const db = getPrisma();
  const total = createRows.length;
  let inserted = 0;
  for (let i = 0; i < createRows.length; i += BATCH_SIZE) {
    const slice = createRows.slice(i, i + BATCH_SIZE);
    const result = await db.maticniRed.createMany({ data: slice });
    inserted += result.count;
    const done = Math.min(i + slice.length, total);
    if (onProgress) onProgress({ done, total, inserted });
  }
  return inserted;
}

/**
 * Učitaj datasets/{key}.jsonl u bazu.
 */
async function syncDatasetToDb(snapshotId, datasetKey, opts = {}) {
  const snapId = Number(snapshotId);
  const key = String(datasetKey);
  const jsonlFile = datasetFilePath(snapId, key);
  const metaFile = path.join(datasetsDir(snapId), `${key.replace(/[^a-zA-Z0-9._-]+/g, '_')}.meta.json`);
  const metaObj = fs.existsSync(metaFile) ? readJson(metaFile) : { dataset_key: key };

  const rows = readJsonl(jsonlFile);
  const db = getPrisma();
  const diskRel = relDiskPath(jsonlFile);
  const savedAt = metaObj.saved_at ? new Date(metaObj.saved_at) : new Date();

  const stagedSnap = await db.stagedSnapshot.findUnique({ where: { snapshotId: snapId } });

  const staged = await db.stagedDataset.upsert({
    where: { snapshotId_datasetKey: { snapshotId: snapId, datasetKey: key } },
    create: {
      snapshotId: snapId,
      datasetKey: key,
      apiPath: metaObj.api_path || key,
      label: metaObj.label || key,
      metaJson: metaObj,
      diskRelPath: diskRel,
      rowCount: rows.length,
      savedAt,
      stagedSnapshotId: stagedSnap?.id || null
    },
    update: {
      apiPath: metaObj.api_path || key,
      label: metaObj.label || key,
      metaJson: metaObj,
      diskRelPath: diskRel,
      rowCount: rows.length,
      savedAt,
      stagedSnapshotId: stagedSnap?.id || null
    }
  });

  await db.maticniRed.deleteMany({ where: { stagedDatasetId: staged.id } });

  const mapped = rows.map((row) => mapMaticniRow(row, snapId, key, staged.id));
  const inserted = await insertMaticniBatched(mapped, opts.onProgress);

  await db.stagedDataset.update({
    where: { id: staged.id },
    data: { dbSyncedAt: new Date(), rowCount: mapped.length }
  });

  return {
    ok: true,
    snapshot_id: snapId,
    dataset_key: key,
    stagedDatasetId: staged.id,
    rowsOnDisk: rows.length,
    rowsInserted: inserted,
    rowsForProgress: mapped.length
  };
}

/**
 * Plan učitavanja u bazu — brojevi redaka s diska (JSONL), prije INSERT-a.
 */
async function buildDbSyncPlan({ snapshot_id_to, snapshot_id_from, datasetKeys = [] }) {
  const toId = String(snapshot_id_to);
  const fromId = String(snapshot_id_from || '').trim();
  const units = [];

  async function addUnit(label, kind, filePath, meta) {
    if (!fs.existsSync(filePath)) return;
    const rows = await countJsonlLines(filePath);
    units.push({
      kind,
      label,
      filePath,
      rows,
      ...meta
    });
  }

  await addUnit('Promjene (novija snimka)', 'promjene_snapshot', promjenePath(toId), {
    snapshot_id: Number(toId)
  });

  if (fromId && fromId !== toId) {
    await addUnit('Promjene (starija snimka)', 'promjene_snapshot', promjenePath(fromId), {
      snapshot_id: Number(fromId)
    });
    await addUnit('SCN diff', 'promjene_diff', diffPromjenePath(fromId, toId), {
      snapshot_id_from: Number(fromId),
      snapshot_id_to: Number(toId)
    });
  }

  for (const key of datasetKeys) {
    await addUnit(`Matični: ${key}`, 'dataset', datasetFilePath(toId, key), {
      snapshot_id: Number(toId),
      dataset_key: String(key)
    });
  }

  const totalRows = units.reduce((s, u) => s + u.rows, 0);
  return { units, totalRows };
}

async function syncDbUnit(unit, opts = {}) {
  const { onProgress } = opts;
  if (unit.kind === 'promjene_snapshot') {
    return syncSnapshotPromjeneToDb(unit.snapshot_id, { onProgress });
  }
  if (unit.kind === 'promjene_diff') {
    return syncDiffPromjeneToDb(unit.snapshot_id_from, unit.snapshot_id_to, { onProgress });
  }
  if (unit.kind === 'dataset') {
    return syncDatasetToDb(unit.snapshot_id, unit.dataset_key, { onProgress });
  }
  throw new Error(`Nepoznat tip jedinice: ${unit.kind}`);
}

async function getDbStagingSummary() {
  if (!isDatabaseConfigured()) {
    return { configured: false };
  }
  const db = getPrisma();
  const [snapshots, diffs, promjenaCount, datasetCount, maticniCount] = await Promise.all([
    db.stagedSnapshot.count(),
    db.stagedDiff.count(),
    db.promjena.count(),
    db.stagedDataset.count(),
    db.maticniRed.count()
  ]);
  const latestSnapshots = await db.stagedSnapshot.findMany({
    orderBy: { snapshotId: 'desc' },
    take: 10,
    select: {
      snapshotId: true,
      rowCount: true,
      dbSyncedAt: true,
      savedAt: true,
      diskRelPath: true
    }
  });
  return {
    configured: true,
    counts: { snapshots, diffs, promjene: promjenaCount, datasets: datasetCount, maticni_redovi: maticniCount },
    latestSnapshots
  };
}

module.exports = {
  shouldSyncDb,
  syncSnapshotPromjeneToDb,
  syncDiffPromjeneToDb,
  syncDatasetToDb,
  buildDbSyncPlan,
  syncDbUnit,
  getDbStagingSummary,
  isDatabaseConfigured
};
