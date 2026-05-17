/**
 * Priprema primjene SCN diff-a u temp tablice (bez pisanja u staging).
 * Za svaki MBS iz diff-a (novi/promjena) ili neaktivan — svi matični skupovi s MBS.
 */

const fs = require('fs');
const { getPrisma, withPrismaRetry, getBatchSize, isDatabaseConfigured } = require('./lib/prisma');
const { forEachJsonlBatch } = require('./jsonlStream');
const { listAllImportJobs } = require('./sudregDatasets');
const {
  diffPromjenePath,
  diffMetaPath,
  datasetFilePath,
  readJson
} = require('./sudregStaging');

const SUBJEKTI_KEY = 'subjekti';

function batchSize() {
  return getBatchSize();
}

function toMbs(row) {
  if (row == null || row.mbs == null) return null;
  const n = Number(row.mbs);
  return Number.isFinite(n) ? n : null;
}

function isActiveSubjekt(row) {
  if (!row || row.status == null) return true;
  return Number(row.status) === 1;
}

function markNeaktivan(payload) {
  const next = { ...payload, status: 0 };
  if (next.datum_brisanja == null && payload.datum_brisanja == null) {
    next.datum_brisanja = new Date().toISOString().slice(0, 10);
  }
  return next;
}

/** Označi neaktivan bilo koji matični red koji ima polje status. */
function markRowNeaktivan(row) {
  if (!row || typeof row !== 'object') return row;
  if (row.status == null) return { ...row, _temp: { neaktivan: true } };
  return { ...row, status: 0 };
}

function rowKeyForRow(row) {
  const parts = [];
  if (row.podruznica_rbr != null) parts.push(`pod${row.podruznica_rbr}`);
  if (row.email_adresa_rbr != null) parts.push(`em${row.email_adresa_rbr}`);
  if (row.nkd_sifra != null) parts.push(`nkd${row.nkd_sifra}`);
  if (row.nacionalna_klasifikacija_djelatnosti_id != null) {
    parts.push(`nkdid${row.nacionalna_klasifikacija_djelatnosti_id}`);
  }
  if (row.jezik_id != null && row.tvrtka != null) parts.push(`j${row.jezik_id}`);
  return parts.length > 0 ? parts.join('_') : '_';
}

function createMbsBucket() {
  return new Map();
}

function addRowToBucket(bucket, mbs, row) {
  if (!bucket.has(mbs)) bucket.set(mbs, []);
  bucket.get(mbs).push(row);
}

/**
 * Indeks datasetKey → Map(mbs → rows[]) za zadani skup MBS (stream JSONL).
 */
async function indexDatasetRowsByMbs(snapshotId, datasetKey, mbsFilter) {
  const byMbs = createMbsBucket();
  const filePath = datasetFilePath(snapshotId, datasetKey);
  if (!fs.existsSync(filePath)) {
    return { byMbs, source: null, filePath };
  }
  await forEachJsonlBatch(filePath, batchSize(), async (rows) => {
    for (const row of rows) {
      const mbs = toMbs(row);
      if (mbs == null || !mbsFilter.has(mbs)) continue;
      addRowToBucket(byMbs, mbs, row);
    }
  });
  return { byMbs, source: 'disk', filePath };
}

async function indexDatasetRowsByMbsFromDb(snapshotId, datasetKey, mbsFilter) {
  if (!isDatabaseConfigured()) {
    return { byMbs: createMbsBucket(), source: null };
  }
  const byMbs = createMbsBucket();
  const snapId = Number(snapshotId);
  const bs = batchSize();
  let lastId = null;

  for (;;) {
    const chunk = await withPrismaRetry((db) =>
      db.maticniRed.findMany({
        where: {
          snapshotId: snapId,
          datasetKey: String(datasetKey),
          ...(lastId ? { id: { gt: lastId } } : {})
        },
        select: { id: true, mbs: true, payload: true },
        take: bs,
        orderBy: { id: 'asc' }
      })
    );
    if (chunk.length === 0) break;
    for (const row of chunk) {
      const mbs = row.mbs != null ? row.mbs : toMbs(row.payload);
      if (mbs == null || !mbsFilter.has(mbs)) continue;
      addRowToBucket(byMbs, mbs, row.payload);
    }
    lastId = chunk[chunk.length - 1].id;
    if (chunk.length < bs) break;
  }

  return { byMbs, source: byMbs.size > 0 ? 'maticni_redovi' : null };
}

async function loadSubjektiActiveMbs(snapshotId) {
  const map = new Map();
  const disk = datasetFilePath(snapshotId, SUBJEKTI_KEY);
  if (fs.existsSync(disk)) {
    await forEachJsonlBatch(disk, batchSize(), async (rows) => {
      for (const row of rows) {
        const mbs = toMbs(row);
        if (mbs != null && isActiveSubjekt(row)) map.set(mbs, row);
      }
    });
    if (map.size > 0) return { map, source: 'disk' };
  }

  if (isDatabaseConfigured()) {
    const snapId = Number(snapshotId);
    const bs = batchSize();
    let lastId = null;
    for (;;) {
      const chunk = await withPrismaRetry((db) =>
        db.maticniRed.findMany({
          where: {
            snapshotId: snapId,
            datasetKey: SUBJEKTI_KEY,
            ...(lastId ? { id: { gt: lastId } } : {})
          },
          select: { id: true, mbs: true, payload: true },
          take: bs,
          orderBy: { id: 'asc' }
        })
      );
      if (chunk.length === 0) break;
      for (const row of chunk) {
        const payload = row.payload;
        const mbs = row.mbs != null ? row.mbs : toMbs(payload);
        if (mbs != null && isActiveSubjekt(payload)) map.set(mbs, payload);
      }
      lastId = chunk[chunk.length - 1].id;
      if (chunk.length < bs) break;
    }
    if (map.size > 0) return { map, source: 'maticni_redovi' };
  }

  return { map, source: null };
}

async function resolveBaselineActiveMap(fromId) {
  return loadSubjektiActiveMbs(fromId);
}

/**
 * @param {Map<number, string>} affectedMbs vrsta po MBS
 * @param {Map<number, object>} promjenaByMbs
 */
function buildMaticniPendingForMbs(mbs, vrsta, promjenaJson, from, to, runId, fromIndex, toIndex, jobs) {
  const rows = [];
  const isNeaktivan = vrsta === 'neaktivan';

  for (const job of jobs) {
    const key = job.datasetKey;
    const fromRows = fromIndex.get(key)?.get(mbs) || [];
    const toRows = toIndex.get(key)?.get(mbs) || [];

    if (isNeaktivan) {
      const sourceRows = fromRows.length > 0 ? fromRows : toRows;
      if (sourceRows.length === 0) continue;
      for (const row of sourceRows) {
        const payload = key === SUBJEKTI_KEY ? markNeaktivan(row) : markRowNeaktivan(row);
        rows.push({
          applyRunId: runId,
          mbs,
          datasetKey: key,
          rowKey: rowKeyForRow(row),
          vrsta,
          snapshotIdFrom: from,
          snapshotIdTo: to,
          payload
        });
      }
      continue;
    }

    const sourceRows = toRows.length > 0 ? toRows : fromRows;
    if (sourceRows.length === 0) {
      rows.push({
        applyRunId: runId,
        mbs,
        datasetKey: key,
        rowKey: '_',
        vrsta,
        snapshotIdFrom: from,
        snapshotIdTo: to,
        payload: {
          mbs,
          _temp: { needs_fetch: true, dataset_key: key, promjena: promjenaJson }
        }
      });
      continue;
    }

    for (const row of sourceRows) {
      rows.push({
        applyRunId: runId,
        mbs,
        datasetKey: key,
        rowKey: rowKeyForRow(row),
        vrsta,
        snapshotIdFrom: from,
        snapshotIdTo: to,
        payload: row
      });
    }
  }

  return rows;
}

async function indexAllDatasetsForMbs(snapshotId, mbsFilter, jobs) {
  const index = new Map();
  const sources = [];

  for (const job of jobs) {
    const disk = await indexDatasetRowsByMbs(snapshotId, job.datasetKey, mbsFilter);
    let byMbs = disk.byMbs;
    if (byMbs.size === 0) {
      const db = await indexDatasetRowsByMbsFromDb(snapshotId, job.datasetKey, mbsFilter);
      byMbs = db.byMbs;
      if (db.source) sources.push(`${job.datasetKey}:${db.source}`);
    } else {
      sources.push(`${job.datasetKey}:disk`);
    }
    index.set(job.datasetKey, byMbs);
  }

  return { index, sources };
}

async function createManyTempSubjektiRetry(data) {
  return withPrismaRetry((db) => db.tempSubjekt.createMany({ data }));
}

async function createManyTempMaticniRetry(data) {
  return withPrismaRetry((db) => db.tempMaticni.createMany({ data }));
}

/**
 * @param {{ snapshot_id_from: string|number, snapshot_id_to: string|number, onProgress?: (ev: object) => void }} params
 */
async function applyPromjeneDiffToTemp(params) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen — temp tablice zahtijevaju PostgreSQL.');
  }

  const from = Number(params.snapshot_id_from);
  const to = Number(params.snapshot_id_to);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    throw new Error('snapshot_id_from i snapshot_id_to moraju biti brojevi.');
  }
  if (from >= to) {
    throw new Error(
      `snapshot_id_from (${from}) mora biti manji od snapshot_id_to (${to}) — prvo starija, zatim novija snimka.`
    );
  }

  const diffFile = diffPromjenePath(from, to);
  if (!fs.existsSync(diffFile)) {
    throw new Error(
      `Diff datoteka ne postoji (${diffFile}). Prvo spremi diff (save-diff ili puni import).`
    );
  }

  const diffMeta = fs.existsSync(diffMetaPath(from, to)) ? readJson(diffMetaPath(from, to)) : null;
  const diffStats = diffMeta?.stats || {};
  const jobs = listAllImportJobs();

  await withPrismaRetry((db) =>
    db.tempApplyRun.deleteMany({
      where: { snapshotIdFrom: from, snapshotIdTo: to }
    })
  );

  const run = await withPrismaRetry((db) =>
    db.tempApplyRun.create({
      data: {
        snapshotIdFrom: from,
        snapshotIdTo: to,
        status: 'running',
        diffRows: Number(diffStats.diffRows) || 0,
        metaJson: {
          diff_meta: diffMeta?.compare || null,
          diff_stats: diffStats,
          dataset_keys: jobs.map((j) => j.datasetKey)
        }
      }
    })
  );

  /** @type {Map<number, { vrsta: string, promjenaJson: object|null }>} */
  const affected = new Map();
  let noviCount = 0;
  let promjenaCount = 0;

  await forEachJsonlBatch(diffFile, batchSize(), async (rows) => {
    for (const row of rows) {
      const vrsta = row.vrsta ? String(row.vrsta) : '';
      if (vrsta !== 'novi' && vrsta !== 'promjena') continue;
      const mbs = toMbs(row);
      if (mbs == null) continue;
      affected.set(mbs, { vrsta, promjenaJson: row });
      if (vrsta === 'novi') noviCount += 1;
      else promjenaCount += 1;
    }
  });

  const baseline = await resolveBaselineActiveMap(from);
  const targetActive = await loadSubjektiActiveMbs(to);

  let neaktivniCount = 0;
  if (targetActive.source) {
    for (const [mbs] of baseline.map) {
      if (affected.has(mbs)) continue;
      if (targetActive.map.has(mbs)) continue;
      affected.set(mbs, { vrsta: 'neaktivan', promjenaJson: null });
      neaktivniCount += 1;
    }
  }

  const mbsFilter = new Set(affected.keys());
  const changedMbs = new Set();
  const neaktivniMbs = new Set();
  for (const [mbs, info] of affected) {
    if (info.vrsta === 'neaktivan') neaktivniMbs.add(mbs);
    else changedMbs.add(mbs);
  }

  if (mbsFilter.size === 0) {
    await withPrismaRetry((db) =>
      db.tempApplyRun.update({
        where: { id: run.id },
        data: {
          status: 'empty',
          noviCount,
          promjenaCount,
          completedAt: new Date()
        }
      })
    );
    return {
      ok: true,
      skipped: true,
      reason: 'no_mbs',
      snapshot_id_from: from,
      snapshot_id_to: to,
      applyRunId: run.id
    };
  }

  const [toIndexed, fromIndexed] = await Promise.all([
    changedMbs.size > 0
      ? indexAllDatasetsForMbs(to, changedMbs, jobs)
      : Promise.resolve({ index: new Map() }),
    indexAllDatasetsForMbs(from, mbsFilter, jobs)
  ]);
  const toIndex = toIndexed.index;
  const fromIndex = fromIndexed.index;

  const subjektPending = [];
  const maticniPending = [];

  for (const [mbs, info] of affected) {
    const subjektRows = buildMaticniPendingForMbs(
      mbs,
      info.vrsta,
      info.promjenaJson,
      from,
      to,
      run.id,
      fromIndex,
      toIndex,
      jobs
    );
    maticniPending.push(...subjektRows);

    const subPayload =
      toIndex.get(SUBJEKTI_KEY)?.get(mbs)?.[0] ||
      fromIndex.get(SUBJEKTI_KEY)?.get(mbs)?.[0] ||
      baseline.map.get(mbs) ||
      { mbs, status: info.vrsta === 'neaktivan' ? 0 : 1 };

    subjektPending.push({
      applyRunId: run.id,
      mbs,
      vrsta: info.vrsta,
      snapshotIdFrom: from,
      snapshotIdTo: to,
      payload: info.vrsta === 'neaktivan' ? markNeaktivan(subPayload) : subPayload,
      promjenaJson: info.promjenaJson
    });
  }

  if (maticniPending.length === 0 && subjektPending.length === 0) {
    await withPrismaRetry((db) =>
      db.tempApplyRun.update({
        where: { id: run.id },
        data: { status: 'empty', noviCount, promjenaCount, completedAt: new Date() }
      })
    );
    return { ok: true, skipped: true, reason: 'no_rows', applyRunId: run.id };
  }

  const bs = batchSize();
  let subjektInserted = 0;
  let maticniInserted = 0;

  for (let i = 0; i < subjektPending.length; i += bs) {
    const chunk = subjektPending.slice(i, i + bs);
    const result = await createManyTempSubjektiRetry(chunk);
    subjektInserted += result.count;
  }

  for (let i = 0; i < maticniPending.length; i += bs) {
    const chunk = maticniPending.slice(i, i + bs);
    const result = await createManyTempMaticniRetry(chunk);
    maticniInserted += result.count;
    if (params.onProgress) {
      params.onProgress({
        done: Math.min(i + chunk.length, maticniPending.length),
        total: maticniPending.length
      });
    }
  }

  await withPrismaRetry((db) =>
    db.tempApplyRun.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        noviCount,
        promjenaCount,
        neaktivniCount,
        subjektRowCount: subjektInserted,
        maticniRowCount: maticniInserted,
        baselineSource: baseline.source,
        targetSource: targetActive.source,
        completedAt: new Date(),
        metaJson: {
          ...(typeof run.metaJson === 'object' && run.metaJson ? run.metaJson : {}),
          mbs_affected: mbsFilter.size,
          dataset_count: jobs.length,
          inactive_skipped: !targetActive.source
        }
      }
    })
  );

  return {
    ok: true,
    skipped: false,
    snapshot_id_from: from,
    snapshot_id_to: to,
    applyRunId: run.id,
    status: 'completed',
    counts: {
      mbsAffected: mbsFilter.size,
      noviFromDiff: noviCount,
      promjenaFromDiff: promjenaCount,
      neaktivni: neaktivniCount,
      tempSubjekti: subjektInserted,
      tempMaticni: maticniInserted,
      datasetKeys: jobs.length
    },
    baselineSource: baseline.source,
    targetSource: targetActive.source,
    warnings: !targetActive.source
      ? [
          `Nema aktivnih ${SUBJEKTI_KEY} za snimku #${to} — neaktivni (brisani) subjekti nisu izračunati.`
        ]
      : []
  };
}

async function getTempApplySummary() {
  if (!isDatabaseConfigured()) {
    return { configured: false };
  }

  const [runCount, subjektCount, maticniCount, latestRuns] = await Promise.all([
    withPrismaRetry((db) => db.tempApplyRun.count()),
    withPrismaRetry((db) => db.tempSubjekt.count()),
    withPrismaRetry((db) => db.tempMaticni.count()),
    withPrismaRetry((db) =>
      db.tempApplyRun.findMany({
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: {
          _count: { select: { subjekti: true, maticni: true } }
        }
      })
    )
  ]);

  return {
    configured: true,
    counts: { runs: runCount, subjekti: subjektCount, maticni: maticniCount },
    latestRuns: latestRuns.map((r) => ({
      id: r.id,
      snapshot_id_from: r.snapshotIdFrom,
      snapshot_id_to: r.snapshotIdTo,
      status: r.status,
      novi: r.noviCount,
      promjene: r.promjenaCount,
      neaktivni: r.neaktivniCount,
      subjekt_rows: r.subjektRowCount,
      maticni_rows: r.maticniRowCount,
      completed_at: r.completedAt
    }))
  };
}

async function clearTempTables() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen.');
  }
  await withPrismaRetry((db) =>
    db.$executeRawUnsafe(`
      TRUNCATE TABLE temp_maticni, temp_subjekti, temp_apply_runs RESTART IDENTITY CASCADE
    `)
  );
  return {
    ok: true,
    message: 'Temp tablice (temp_apply_runs, temp_subjekti, temp_maticni) su ispražnjene.'
  };
}

module.exports = {
  applyPromjeneDiffToTemp,
  getTempApplySummary,
  clearTempTables,
  isActiveSubjekt,
  markNeaktivan,
  markRowNeaktivan,
  rowKeyForRow
};
