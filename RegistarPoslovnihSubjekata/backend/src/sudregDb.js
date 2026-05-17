/**
 * Sinkronizacija staginga s diska u PostgreSQL (nakon JSON/JSONL).
 */

const path = require('path');
const {
  getPrisma,
  isDatabaseConfigured,
  withPrismaRetry,
  refreshPrismaConnection,
  getBatchSize
} = require('./lib/prisma');
const fs = require('fs');
const { forEachJsonlBatch } = require('./jsonlStream');
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

function batchSize() {
  return getBatchSize();
}

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

async function createManyPromjeneRetry(data) {
  return withPrismaRetry((db) =>
    db.promjena.createMany({ data, skipDuplicates: true })
  );
}

async function createManyMaticniRetry(data) {
  return withPrismaRetry((db) => db.maticniRed.createMany({ data }));
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

  const rowsOnDisk = await countJsonlLines(jsonlFile);
  const diskRel = relDiskPath(jsonlFile);
  const savedAt = metaObj.saved_at ? new Date(metaObj.saved_at) : new Date();
  const bs = batchSize();

  const staged = await withPrismaRetry((db) =>
    db.stagedSnapshot.upsert({
    where: { snapshotId: id },
    create: {
      snapshotId: id,
      metaJson: metaObj,
      diskRelPath: diskRel,
      rowCount: rowsOnDisk,
      savedAt
    },
    update: {
      metaJson: metaObj,
      diskRelPath: diskRel,
      rowCount: rowsOnDisk,
      savedAt
    }
    })
  );

  await withPrismaRetry((db) =>
    db.promjena.deleteMany({ where: { stagedSnapshotId: staged.id } })
  );

  let rowsMapped = 0;
  let rowsInserted = 0;
  let processed = 0;

  await forEachJsonlBatch(jsonlFile, bs, async (rows) => {
    const mapped = [];
    for (const row of rows) {
      const m = mapSnapshotPromjenaRow(row, id, staged.id);
      if (m) mapped.push(m);
    }
    if (mapped.length > 0) {
      const result = await createManyPromjeneRetry(mapped);
      rowsInserted += result.count;
    }
    rowsMapped += mapped.length;
    processed += rows.length;
    if (opts.onProgress) {
      opts.onProgress({ done: processed, total: rowsOnDisk, inserted: rowsInserted });
    }
  });

  await withPrismaRetry((db) =>
    db.stagedSnapshot.update({
      where: { id: staged.id },
      data: { dbSyncedAt: new Date(), rowCount: rowsMapped }
    })
  );

  return {
    ok: true,
    snapshot_id: id,
    stagedSnapshotId: staged.id,
    diskRelPath: diskRel,
    rowsOnDisk,
    rowsMapped,
    rowsInserted,
    rowsForProgress: rowsOnDisk
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

  const rowsOnDisk = await countJsonlLines(jsonlFile);
  const diskRel = relDiskPath(jsonlFile);
  const savedAt = metaObj.saved_at ? new Date(metaObj.saved_at) : new Date();
  const bs = batchSize();

  const staged = await withPrismaRetry((db) =>
    db.stagedDiff.upsert({
      where: {
        snapshotIdFrom_snapshotIdTo: { snapshotIdFrom: from, snapshotIdTo: to }
      },
      create: {
        snapshotIdFrom: from,
        snapshotIdTo: to,
        metaJson: metaObj,
        diskRelPath: diskRel,
        diffRowCount: rowsOnDisk,
        savedAt
      },
      update: {
        metaJson: metaObj,
        diskRelPath: diskRel,
        diffRowCount: rowsOnDisk,
        savedAt
      }
    })
  );

  await withPrismaRetry((db) =>
    db.promjena.deleteMany({ where: { stagedDiffId: staged.id } })
  );

  let rowsMapped = 0;
  let rowsInserted = 0;
  let processed = 0;

  await forEachJsonlBatch(jsonlFile, bs, async (rows) => {
    const mapped = [];
    for (const row of rows) {
      const m = mapDiffPromjenaRow(row, from, to, staged.id);
      if (m) mapped.push(m);
    }
    if (mapped.length > 0) {
      const result = await createManyPromjeneRetry(mapped);
      rowsInserted += result.count;
    }
    rowsMapped += mapped.length;
    processed += rows.length;
    if (opts.onProgress) {
      opts.onProgress({ done: processed, total: rowsOnDisk, inserted: rowsInserted });
    }
  });

  await withPrismaRetry((db) =>
    db.stagedDiff.update({
      where: { id: staged.id },
      data: { dbSyncedAt: new Date(), diffRowCount: rowsMapped }
    })
  );

  return {
    ok: true,
    snapshot_id_from: from,
    snapshot_id_to: to,
    stagedDiffId: staged.id,
    diskRelPath: diskRel,
    rowsOnDisk,
    rowsMapped,
    rowsInserted,
    rowsForProgress: rowsOnDisk
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

/**
 * Učitaj datasets/{key}.jsonl u bazu.
 */
async function syncDatasetToDb(snapshotId, datasetKey, opts = {}) {
  const snapId = Number(snapshotId);
  const key = String(datasetKey);
  const jsonlFile = datasetFilePath(snapId, key);
  const metaFile = path.join(datasetsDir(snapId), `${key.replace(/[^a-zA-Z0-9._-]+/g, '_')}.meta.json`);
  const metaObj = fs.existsSync(metaFile) ? readJson(metaFile) : { dataset_key: key };

  const rowsOnDisk = await countJsonlLines(jsonlFile);
  const diskRel = relDiskPath(jsonlFile);
  const savedAt = metaObj.saved_at ? new Date(metaObj.saved_at) : new Date();
  const bs = batchSize();

  const stagedSnap = await withPrismaRetry((db) =>
    db.stagedSnapshot.findUnique({ where: { snapshotId: snapId } })
  );

  const staged = await withPrismaRetry((db) =>
    db.stagedDataset.upsert({
      where: { snapshotId_datasetKey: { snapshotId: snapId, datasetKey: key } },
      create: {
        snapshotId: snapId,
        datasetKey: key,
        apiPath: metaObj.api_path || key,
        label: metaObj.label || key,
        metaJson: metaObj,
        diskRelPath: diskRel,
        rowCount: rowsOnDisk,
        savedAt,
        stagedSnapshotId: stagedSnap?.id || null
      },
      update: {
        apiPath: metaObj.api_path || key,
        label: metaObj.label || key,
        metaJson: metaObj,
        diskRelPath: diskRel,
        rowCount: rowsOnDisk,
        savedAt,
        stagedSnapshotId: stagedSnap?.id || null
      }
    })
  );

  await withPrismaRetry((db) =>
    db.maticniRed.deleteMany({ where: { stagedDatasetId: staged.id } })
  );

  let rowsInserted = 0;
  let processed = 0;

  await forEachJsonlBatch(jsonlFile, bs, async (rows) => {
    const mapped = rows.map((row) => mapMaticniRow(row, snapId, key, staged.id));
    if (mapped.length > 0) {
      const result = await createManyMaticniRetry(mapped);
      rowsInserted += result.count;
    }
    processed += rows.length;
    if (opts.onProgress) {
      opts.onProgress({ done: processed, total: rowsOnDisk, inserted: rowsInserted });
    }
  });

  await withPrismaRetry((db) =>
    db.stagedDataset.update({
      where: { id: staged.id },
      data: { dbSyncedAt: new Date(), rowCount: rowsOnDisk }
    })
  );

  return {
    ok: true,
    snapshot_id: snapId,
    dataset_key: key,
    stagedDatasetId: staged.id,
    rowsOnDisk,
    rowsInserted,
    rowsForProgress: rowsOnDisk
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
  await refreshPrismaConnection();
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

/**
 * Obriši sve staging podatke iz PostgreSQL (tablice ostaju — samo redovi).
 * JSON na disku (/var/data) se ne dira.
 */
async function clearStagingDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen.');
  }

  const before = await getDbStagingSummary();

  await withPrismaRetry(async (db) => {
    await db.$executeRawUnsafe(`
      TRUNCATE TABLE
        maticni_redovi,
        promjene,
        staged_datasets,
        staged_diffs,
        staged_snapshots
      RESTART IDENTITY CASCADE
    `);
  });

  await refreshPrismaConnection();
  const after = await getDbStagingSummary();

  return {
    ok: true,
    message:
      'PostgreSQL staging tablice su ispražnjene. Podaci na disku (JSON/JSONL) nisu obrisani.',
    deleted: before.counts || {},
    remaining: after.counts || {}
  };
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
  clearStagingDatabase,
  isDatabaseConfigured
};
