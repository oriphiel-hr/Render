/**
 * Sinkronizacija staginga s diska u PostgreSQL (nakon JSON/JSONL).
 */

const path = require('path');
const { getPrisma, isDatabaseConfigured } = require('./lib/prisma');
const {
  getDataDir,
  readJson,
  readJsonl,
  metaPath,
  diffMetaPath,
  promjenePath,
  diffPromjenePath
} = require('./sudregStaging');

const BATCH_SIZE = 500;

function shouldSyncDb(opts = {}) {
  if (!isDatabaseConfigured()) return false;
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

async function insertPromjeneBatched(createRows) {
  const db = getPrisma();
  let inserted = 0;
  for (let i = 0; i < createRows.length; i += BATCH_SIZE) {
    const slice = createRows.slice(i, i + BATCH_SIZE);
    const result = await db.promjena.createMany({ data: slice, skipDuplicates: true });
    inserted += result.count;
  }
  return inserted;
}

/**
 * Učitaj promjene.jsonl s diska u bazu (nakon saveSnapshotPromjene).
 */
async function syncSnapshotPromjeneToDb(snapshotId) {
  const id = Number(snapshotId);
  const jsonlFile = promjenePath(snapshotId);
  const metaObj = require('fs').existsSync(metaPath(snapshotId))
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

  const inserted = await insertPromjeneBatched(mapped);

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
    rowsInserted: inserted
  };
}

/**
 * Učitaj diff promjene.jsonl u bazu (nakon savePromjeneDiff).
 */
async function syncDiffPromjeneToDb(fromId, toId) {
  const from = Number(fromId);
  const to = Number(toId);
  const jsonlFile = diffPromjenePath(fromId, toId);
  const metaObj = require('fs').existsSync(diffMetaPath(fromId, toId))
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

  const inserted = await insertPromjeneBatched(mapped);

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
    rowsInserted: inserted
  };
}

async function getDbStagingSummary() {
  if (!isDatabaseConfigured()) {
    return { configured: false };
  }
  const db = getPrisma();
  const [snapshots, diffs, promjenaCount] = await Promise.all([
    db.stagedSnapshot.count(),
    db.stagedDiff.count(),
    db.promjena.count()
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
    counts: { snapshots, diffs, promjene: promjenaCount },
    latestSnapshots
  };
}

module.exports = {
  shouldSyncDb,
  syncSnapshotPromjeneToDb,
  syncDiffPromjeneToDb,
  getDbStagingSummary,
  isDatabaseConfigured
};
