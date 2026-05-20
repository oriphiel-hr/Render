/**
 * Priprema primjene SCN diff-a u temp tablice (bez pisanja u staging).
 * Za svaki MBS iz diff-a (novi/promjena) ili neaktivan — svi matični skupovi s MBS.
 */

const fs = require('fs');
const {
  withPrismaRetry,
  getBatchSize,
  isDatabaseConfigured,
  ensureDatabaseReady
} = require('./lib/prisma');
const { forEachJsonlBatch } = require('./jsonlStream');
const { listAllImportJobs } = require('./sudregDatasets');
const { syncSubjektIndeksForMbsSet } = require('./sudregSubjektIndeks');
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
  const next = { ...payload, status: 0, aktiv: 0 };
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

function rowKeyForRow(row, indexInGroup = 0) {
  const parts = [];
  if (row.podruznica_rbr != null) parts.push(`pod${row.podruznica_rbr}`);
  if (row.email_adresa_rbr != null) parts.push(`em${row.email_adresa_rbr}`);
  if (row.nkd_sifra != null) parts.push(`nkd${row.nkd_sifra}`);
  if (row.nacionalna_klasifikacija_djelatnosti_id != null) {
    parts.push(`nkdid${row.nacionalna_klasifikacija_djelatnosti_id}`);
  }
  if (row.jezik_id != null) parts.push(`j${row.jezik_id}`);
  if (row.vrsta_pravnog_oblika_id != null) parts.push(`vpo${row.vrsta_pravnog_oblika_id}`);
  if (row.djelatnost_tekst != null) parts.push(`dt${String(row.djelatnost_tekst).slice(0, 24)}`);
  const base = parts.length > 0 ? parts.join('_') : 'r';
  return `${base}#${indexInGroup}`;
}

/** Jedinstveni ključ prije upsert u temp_maticni (isti MBS+skup može imati više redaka). */
function maticniUniqueKey(item) {
  return `${item.mbs}|${item.datasetKey}|${item.rowKey}`;
}

function dedupeMaticniPending(pending) {
  const byKey = new Map();
  let duplicates = 0;
  for (const item of pending) {
    const k = maticniUniqueKey(item);
    if (byKey.has(k)) duplicates += 1;
    byKey.set(k, item);
  }
  return { rows: [...byKey.values()], duplicates };
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

/** Samo MBS aktivnih subjekata (~1.5 MB za 185k), bez punog JSON-a. */
async function loadSubjektiActiveMbsSet(snapshotId) {
  const set = new Set();
  const disk = datasetFilePath(snapshotId, SUBJEKTI_KEY);
  if (fs.existsSync(disk)) {
    await forEachJsonlBatch(disk, batchSize(), async (rows) => {
      for (const row of rows) {
        const mbs = toMbs(row);
        if (mbs != null && isActiveSubjekt(row)) set.add(mbs);
      }
    });
    if (set.size > 0) return { set, source: 'disk' };
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
        if (mbs != null && isActiveSubjekt(payload)) set.add(mbs);
      }
      lastId = chunk[chunk.length - 1].id;
      if (chunk.length < bs) break;
    }
    if (set.size > 0) return { set, source: 'maticni_redovi' };
  }

  return { set, source: null };
}

/** Map(mbs → row) samo za zadani skup MBS (stream JSONL). */
async function loadSubjektiRowsForMbsSet(snapshotId, mbsSet) {
  const map = new Map();
  if (!mbsSet || mbsSet.size === 0) return map;

  const disk = datasetFilePath(snapshotId, SUBJEKTI_KEY);
  if (fs.existsSync(disk)) {
    await forEachJsonlBatch(disk, batchSize(), async (rows) => {
      for (const row of rows) {
        const mbs = toMbs(row);
        if (mbs != null && mbsSet.has(mbs)) map.set(mbs, row);
      }
    });
    if (map.size > 0) return map;
  }

  if (!isDatabaseConfigured()) return map;

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
      if (mbs != null && mbsSet.has(mbs)) map.set(mbs, payload);
    }
    lastId = chunk[chunk.length - 1].id;
    if (chunk.length < bs) break;
  }
  return map;
}

/**
 * Neaktivni: aktivni u starijoj snimci, nema ih u aktivnoj listi novije.
 * @param {Map<number, { vrsta: string, promjenaJson: object|null, baselineRow?: object }>} affected
 */
async function appendNeaktivniToAffected(from, to, affected) {
  const targetActive = await loadSubjektiActiveMbsSet(to);
  if (!targetActive.source) {
    return { neaktivniCount: 0, targetSource: null, baselineSource: null };
  }

  let neaktivniCount = 0;
  const fromFile = datasetFilePath(from, SUBJEKTI_KEY);

  const consider = (row) => {
    const mbs = toMbs(row);
    if (mbs == null || !isActiveSubjekt(row)) return;
    if (affected.has(mbs) || targetActive.set.has(mbs)) return;
    affected.set(mbs, { vrsta: 'neaktivan', promjenaJson: null, baselineRow: row });
    neaktivniCount += 1;
  };

  if (fs.existsSync(fromFile)) {
    await forEachJsonlBatch(fromFile, batchSize(), async (rows) => {
      for (const row of rows) consider(row);
    });
    return {
      neaktivniCount,
      targetSource: targetActive.source,
      baselineSource: 'disk'
    };
  }

  if (isDatabaseConfigured()) {
    const snapId = Number(from);
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
        consider(row.payload);
      }
      lastId = chunk[chunk.length - 1].id;
      if (chunk.length < bs) break;
    }
    return {
      neaktivniCount,
      targetSource: targetActive.source,
      baselineSource: 'maticni_redovi'
    };
  }

  return { neaktivniCount: 0, targetSource: targetActive.source, baselineSource: null };
}

const MATICNI_FLUSH_ROWS = 1500;

function subjektiOnlyJobs() {
  return listAllImportJobs().filter((j) => j.datasetKey === SUBJEKTI_KEY);
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
      for (let i = 0; i < sourceRows.length; i++) {
        const row = sourceRows[i];
        const payload = key === SUBJEKTI_KEY ? markNeaktivan(row) : markRowNeaktivan(row);
        rows.push({
          applyRunId: runId,
          mbs,
          datasetKey: key,
          rowKey: rowKeyForRow(row, i),
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
        rowKey: '_0',
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

    for (let i = 0; i < sourceRows.length; i++) {
      const row = sourceRows[i];
      rows.push({
        applyRunId: runId,
        mbs,
        datasetKey: key,
        rowKey: rowKeyForRow(row, i),
        vrsta,
        snapshotIdFrom: from,
        snapshotIdTo: to,
        payload: row
      });
    }
  }

  return rows;
}

async function indexAllDatasetsForMbs(snapshotId, mbsFilter, jobs, opts = {}) {
  const index = new Map();
  const sources = [];
  const onProgress = opts.onProgress;
  const label = opts.label || String(snapshotId);
  let jobIndex = 0;

  for (const job of jobs) {
    jobIndex += 1;
    if (typeof onProgress === 'function') {
      onProgress({
        type: 'progress',
        phase: 'maticni_diff',
        step: 'index_dataset',
        message: `Indeks #${label}: ${job.datasetKey} (${jobIndex}/${jobs.length})…`,
        snapshot_id: label,
        dataset_key: job.datasetKey,
        job_index: jobIndex,
        job_total: jobs.length
      });
    }
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

function subjektPayloadForMbs(mbs, info, subjektiTo, subjektiFrom) {
  if (info.vrsta === 'neaktivan') {
    return markNeaktivan(
      info.baselineRow ||
        subjektiFrom.get(mbs) ||
        subjektiTo.get(mbs) ||
        { mbs, status: 0 }
    );
  }
  return (
    subjektiTo.get(mbs) ||
    subjektiFrom.get(mbs) ||
    { mbs, status: 1, _temp: { needs_fetch: true, promjena: info.promjenaJson } }
  );
}

async function createManyTempSubjektiRetry(data) {
  return withPrismaRetry((db) => db.tempSubjekt.createMany({ data }));
}

async function createManyTempMaticniRetry(data) {
  return withPrismaRetry((db) =>
    db.tempMaticni.createMany({ data, skipDuplicates: true })
  );
}

/**
 * @param {{ snapshot_id_from: string|number, snapshot_id_to: string|number, onProgress?: (ev: object) => void }} params
 */
async function applyPromjeneDiffToTemp(params) {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen — temp tablice zahtijevaju PostgreSQL.');
  }

  await ensureDatabaseReady({ label: 'temp-apply' });

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
  const onlySubjekti =
    params.only_subjekti === '1' || params.only_subjekti === true;
  const jobs = onlySubjekti ? subjektiOnlyJobs() : listAllImportJobs();

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
          dataset_keys: jobs.map((j) => j.datasetKey),
          only_subjekti: onlySubjekti
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

  const inactive = await appendNeaktivniToAffected(from, to, affected);
  const neaktivniCount = inactive.neaktivniCount;

  const mbsFilter = new Set(affected.keys());
  const changedMbs = new Set();
  for (const [mbs, info] of affected) {
    if (info.vrsta !== 'neaktivan') changedMbs.add(mbs);
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

  const [subjektiTo, subjektiFrom] = await Promise.all([
    loadSubjektiRowsForMbsSet(to, changedMbs),
    loadSubjektiRowsForMbsSet(from, changedMbs)
  ]);

  const bs = batchSize();
  let subjektInserted = 0;
  let maticniInserted = 0;
  let maticniBeforeDedupe = 0;
  let maticniDuplicates = 0;
  let subjektBatch = [];
  const maticniDedupe = new Map();
  let processed = 0;
  const totalAffected = mbsFilter.size;
  /** @type {Array<{ datasetKey: string, rows: number }>} */
  const datasetRowCounts = [];

  const flushSubjekti = async () => {
    if (subjektBatch.length === 0) return;
    const chunk = subjektBatch;
    subjektBatch = [];
    const result = await createManyTempSubjektiRetry(chunk);
    subjektInserted += result.count;
  };

  const flushMaticni = async () => {
    if (maticniDedupe.size === 0) return;
    const rows = [...maticniDedupe.values()];
    maticniDedupe.clear();
    const result = await createManyTempMaticniRetry(rows);
    maticniInserted += result.count;
  };

  const pushMaticniRows = (maticniRows) => {
    maticniBeforeDedupe += maticniRows.length;
    for (const row of maticniRows) {
      const k = maticniUniqueKey(row);
      if (maticniDedupe.has(k)) maticniDuplicates += 1;
      maticniDedupe.set(k, row);
    }
  };

  if (onlySubjekti) {
    for (const [mbs, info] of affected) {
      const subPayload = subjektPayloadForMbs(mbs, info, subjektiTo, subjektiFrom);
      pushMaticniRows([
        {
          applyRunId: run.id,
          mbs,
          datasetKey: SUBJEKTI_KEY,
          rowKey: '_0',
          vrsta: info.vrsta,
          snapshotIdFrom: from,
          snapshotIdTo: to,
          payload: subPayload
        }
      ]);
      subjektBatch.push({
        applyRunId: run.id,
        mbs,
        vrsta: info.vrsta,
        snapshotIdFrom: from,
        snapshotIdTo: to,
        payload: subPayload,
        promjenaJson: info.promjenaJson
      });
      processed += 1;
      if (subjektBatch.length >= bs) await flushSubjekti();
      if (maticniDedupe.size >= MATICNI_FLUSH_ROWS) await flushMaticni();
      if (params.onProgress && processed % 500 === 0) {
        params.onProgress({ done: processed, total: totalAffected });
      }
    }
    datasetRowCounts.push({ datasetKey: SUBJEKTI_KEY, rows: maticniBeforeDedupe });
  } else {
    let jobIndex = 0;
    for (const job of jobs) {
      jobIndex += 1;
      const key = job.datasetKey;
      const toIndexed =
        changedMbs.size > 0
          ? await indexDatasetRowsByMbs(to, key, changedMbs)
          : { byMbs: createMbsBucket(), source: null };
      const fromIndexed = await indexDatasetRowsByMbs(from, key, mbsFilter);
      let fromByMbs = fromIndexed.byMbs;
      if (fromByMbs.size === 0) {
        const db = await indexDatasetRowsByMbsFromDb(from, key, mbsFilter);
        fromByMbs = db.byMbs;
      }
      let toByMbs = toIndexed.byMbs;
      if (toByMbs.size === 0 && changedMbs.size > 0) {
        const db = await indexDatasetRowsByMbsFromDb(to, key, changedMbs);
        toByMbs = db.byMbs;
      }

      const rowsBeforeJob = maticniBeforeDedupe;
      const miniTo = new Map([[key, toByMbs]]);
      const miniFrom = new Map([[key, fromByMbs]]);

      for (const [mbs, info] of affected) {
        pushMaticniRows(
          buildMaticniPendingForMbs(
            mbs,
            info.vrsta,
            info.promjenaJson,
            from,
            to,
            run.id,
            miniFrom,
            miniTo,
            [job]
          )
        );
        if (maticniDedupe.size >= MATICNI_FLUSH_ROWS) await flushMaticni();
      }

      const jobRows = maticniBeforeDedupe - rowsBeforeJob;
      if (jobRows > 0) {
        datasetRowCounts.push({ datasetKey: key, rows: jobRows });
      }

      if (params.onProgress) {
        params.onProgress({
          phase: 'dataset',
          datasetKey: key,
          jobIndex,
          jobTotal: jobs.length,
          done: jobIndex,
          total: jobs.length
        });
      }
      if (typeof global.gc === 'function') global.gc();
    }

    for (const [mbs, info] of affected) {
      const subPayload = subjektPayloadForMbs(mbs, info, subjektiTo, subjektiFrom);
      subjektBatch.push({
        applyRunId: run.id,
        mbs,
        vrsta: info.vrsta,
        snapshotIdFrom: from,
        snapshotIdTo: to,
        payload: subPayload,
        promjenaJson: info.promjenaJson
      });
      processed += 1;
      if (subjektBatch.length >= bs) await flushSubjekti();
    }
  }

  await flushSubjekti();
  await flushMaticni();

  const nonSubjektiDatasets = datasetRowCounts.filter(
    (d) => d.datasetKey !== SUBJEKTI_KEY && d.rows > 0
  );
  const extraWarnings = [];
  if (!onlySubjekti && nonSubjektiDatasets.length === 0) {
    extraWarnings.push(
      'U temp_maticni nema redaka iz ostalih skupova (tvrtke, sjedišta, …). ' +
        'Diferencijalni import ne preuzima te JSONL datoteke — pokreni Puno (disk + baza) za obje snimke ' +
        'ili „Samo baza ← disk” ako su matični već na disku.'
    );
  }

  if (subjektInserted === 0 && maticniInserted === 0) {
    await withPrismaRetry((db) =>
      db.tempApplyRun.update({
        where: { id: run.id },
        data: { status: 'empty', noviCount, promjenaCount, completedAt: new Date() }
      })
    );
    return { ok: true, skipped: true, reason: 'no_rows', applyRunId: run.id };
  }

  let subjektIndeks = null;
  try {
    subjektIndeks = await syncSubjektIndeksForMbsSet(to, mbsFilter);
  } catch (e) {
    subjektIndeks = {
      ok: false,
      error: e instanceof Error ? e.message : String(e)
    };
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
        baselineSource: inactive.baselineSource,
        targetSource: inactive.targetSource,
        completedAt: new Date(),
        metaJson: {
          ...(typeof run.metaJson === 'object' && run.metaJson ? run.metaJson : {}),
          mbs_affected: mbsFilter.size,
          dataset_count: jobs.length,
          only_subjekti: onlySubjekti,
          maticni_pending_before_dedupe: maticniBeforeDedupe,
          maticni_duplicates_collapsed: maticniDuplicates,
          inactive_skipped: !inactive.targetSource,
          dataset_row_counts: datasetRowCounts,
          subjekt_indeks: subjektIndeks
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
    baselineSource: inactive.baselineSource,
    targetSource: inactive.targetSource,
    onlySubjekti,
    datasetRowCounts,
    subjektIndeks,
    warnings: [
      ...(!inactive.targetSource
        ? [
            `Nema aktivnih ${SUBJEKTI_KEY} za snimku #${to} — neaktivni (brisani) subjekti nisu izračunati.`
          ]
        : []),
      ...extraWarnings
    ]
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
  rowKeyForRow,
  dedupeMaticniPending,
  toMbs,
  appendNeaktivniToAffected,
  indexAllDatasetsForMbs,
  SUBJEKTI_KEY
};
