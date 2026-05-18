/**
 * Denormalizirani indeks subjekata (pretraga) — stupci iz subjekti, tvrtka, pravni_oblici.
 */

const fs = require('fs');
const { withPrismaRetry, getBatchSize } = require('./lib/prisma');
const { forEachJsonlBatch } = require('./jsonlStream');
const { datasetFilePath } = require('./sudregStaging');

const SUBJEKTI_KEY = 'subjekti';
const TVRTKA_KEY = 'tvrtka';
const PRAVNI_OBLICI_KEY = 'pravni_oblici';

const INDEKS_DATASET_HOOKS = new Set([SUBJEKTI_KEY, TVRTKA_KEY, PRAVNI_OBLICI_KEY]);

function batchSize() {
  return getBatchSize();
}

function toMbs(row) {
  if (row == null || row.mbs == null) return null;
  const n = Number(row.mbs);
  return Number.isFinite(n) ? n : null;
}

function toInt(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseDateOnly(value) {
  if (value == null || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fieldsFromSubjekti(row) {
  return {
    oib: toInt(row.oib),
    status: toInt(row.status),
    datumBrisanja: parseDateOnly(row.datum_brisanja),
    postupak: row.postupak != null ? String(row.postupak) : null,
    glavnaDjelatnost:
      row.glavna_djelatnost != null ? String(row.glavna_djelatnost) : null,
    sudIdNadlezan: toInt(row.sud_id_nadlezan)
  };
}

function fieldsFromTvrtka(row) {
  const naziv = row.tvrtka ?? row.naziv;
  const skracena = row.skracena_tvrtka ?? row.skraceni_naziv;
  return {
    naziv: naziv != null ? String(naziv).trim() || null : null,
    skracenaTvrtka: skracena != null ? String(skracena).trim() || null : null
  };
}

function fieldsFromPravniOblik(row) {
  const vpo = row.vrsta_pravnog_oblika;
  return {
    vrstaPravnogOblikaId: toInt(row.vrsta_pravnog_oblika_id),
    vrstaPravnogOblikaSifra:
      vpo?.sifra != null
        ? String(vpo.sifra)
        : row.sifra != null
          ? String(row.sifra)
          : null,
    vrstaPravnogOblikaNaziv: vpo?.naziv != null ? String(vpo.naziv) : null
  };
}

function normalizeMbsFilter(mbsFilter) {
  if (!mbsFilter) return null;
  if (mbsFilter instanceof Set) return mbsFilter;
  return new Set(mbsFilter);
}

async function loadTvrtkaMap(snapshotId, mbsFilter) {
  const map = new Map();
  const file = datasetFilePath(snapshotId, TVRTKA_KEY);
  if (!fs.existsSync(file)) return map;
  await forEachJsonlBatch(file, batchSize(), async (rows) => {
    for (const row of rows) {
      const mbs = toMbs(row);
      if (mbs == null) continue;
      if (mbsFilter && !mbsFilter.has(mbs)) continue;
      map.set(mbs, fieldsFromTvrtka(row));
    }
  });
  return map;
}

async function loadPravniObliciMap(snapshotId, mbsFilter) {
  const map = new Map();
  const file = datasetFilePath(snapshotId, PRAVNI_OBLICI_KEY);
  if (!fs.existsSync(file)) return map;
  await forEachJsonlBatch(file, batchSize(), async (rows) => {
    for (const row of rows) {
      const mbs = toMbs(row);
      if (mbs == null) continue;
      if (mbsFilter && !mbsFilter.has(mbs)) continue;
      map.set(mbs, fieldsFromPravniOblik(row));
    }
  });
  return map;
}

async function upsertIndeksRows(rows) {
  if (rows.length === 0) return 0;
  const chunkSize = Math.min(50, batchSize());
  let upserted = 0;
  const now = new Date();

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await withPrismaRetry((db) =>
      db.$transaction(
        chunk.map((row) => {
          const { snapshotId, mbs, ...rest } = row;
          return db.subjektIndeks.upsert({
            where: {
              snapshotId_mbs: { snapshotId: Number(snapshotId), mbs: Number(mbs) }
            },
            create: { snapshotId: Number(snapshotId), mbs: Number(mbs), syncedAt: now, ...rest },
            update: { ...rest, syncedAt: now }
          });
        })
      )
    );
    upserted += chunk.length;
  }
  return upserted;
}

/**
 * Pun ili djelomičan rebuild iz subjekti.jsonl (+ tvrtka/pravni_oblici ako postoje na disku).
 * @param {number|string} snapshotId
 * @param {{ mbsFilter?: Set<number>|number[], onProgress?: Function, deleteOthers?: boolean }} [opts]
 */
async function rebuildSubjektIndeksFromSubjekti(snapshotId, opts = {}) {
  const snapId = Number(snapshotId);
  const mbsFilter = normalizeMbsFilter(opts.mbsFilter);
  const subjektiFile = datasetFilePath(snapId, SUBJEKTI_KEY);
  if (!fs.existsSync(subjektiFile)) {
    return { ok: false, skipped: true, reason: 'no_subjekti_file', snapshot_id: snapId };
  }

  if (!mbsFilter && opts.deleteOthers !== false) {
    await withPrismaRetry((db) => db.subjektIndeks.deleteMany({ where: { snapshotId: snapId } }));
  }

  const [tvrtkaMap, pravniMap] = await Promise.all([
    loadTvrtkaMap(snapId, mbsFilter),
    loadPravniObliciMap(snapId, mbsFilter)
  ]);

  let processed = 0;
  let upserted = 0;
  let pending = [];

  await forEachJsonlBatch(subjektiFile, batchSize(), async (rows) => {
    for (const row of rows) {
      const mbs = toMbs(row);
      if (mbs == null) continue;
      if (mbsFilter && !mbsFilter.has(mbs)) continue;

      pending.push({
        snapshotId: snapId,
        mbs,
        ...fieldsFromSubjekti(row),
        ...(tvrtkaMap.get(mbs) || {}),
        ...(pravniMap.get(mbs) || {})
      });
      processed += 1;

      if (pending.length >= batchSize()) {
        upserted += await upsertIndeksRows(pending);
        pending = [];
        if (opts.onProgress) opts.onProgress({ done: processed, phase: 'subjekti' });
      }
    }
  });

  if (pending.length > 0) {
    upserted += await upsertIndeksRows(pending);
  }

  return {
    ok: true,
    snapshot_id: snapId,
    source: 'subjekti',
    rows_processed: processed,
    rows_upserted: upserted,
    tvrtka_joined: tvrtkaMap.size,
    pravni_joined: pravniMap.size
  };
}

async function patchSubjektIndeksFromTvrtka(snapshotId, opts = {}) {
  const snapId = Number(snapshotId);
  const file = datasetFilePath(snapId, TVRTKA_KEY);
  if (!fs.existsSync(file)) {
    return { ok: false, skipped: true, reason: 'no_tvrtka_file', snapshot_id: snapId };
  }

  const mbsFilter = normalizeMbsFilter(opts.mbsFilter);
  let processed = 0;
  let upserted = 0;
  let pending = [];

  await forEachJsonlBatch(file, batchSize(), async (rows) => {
    for (const row of rows) {
      const mbs = toMbs(row);
      if (mbs == null) continue;
      if (mbsFilter && !mbsFilter.has(mbs)) continue;

      pending.push({
        snapshotId: snapId,
        mbs,
        ...fieldsFromTvrtka(row)
      });
      processed += 1;
      if (pending.length >= batchSize()) {
        upserted += await upsertIndeksRows(pending);
        pending = [];
      }
    }
  });
  if (pending.length > 0) upserted += await upsertIndeksRows(pending);

  return {
    ok: true,
    snapshot_id: snapId,
    source: 'tvrtka',
    rows_processed: processed,
    rows_upserted: upserted
  };
}

async function patchSubjektIndeksFromPravniOblici(snapshotId, opts = {}) {
  const snapId = Number(snapshotId);
  const file = datasetFilePath(snapId, PRAVNI_OBLICI_KEY);
  if (!fs.existsSync(file)) {
    return { ok: false, skipped: true, reason: 'no_pravni_oblici_file', snapshot_id: snapId };
  }

  const mbsFilter = normalizeMbsFilter(opts.mbsFilter);
  let processed = 0;
  let upserted = 0;
  let pending = [];

  await forEachJsonlBatch(file, batchSize(), async (rows) => {
    for (const row of rows) {
      const mbs = toMbs(row);
      if (mbs == null) continue;
      if (mbsFilter && !mbsFilter.has(mbs)) continue;

      pending.push({
        snapshotId: snapId,
        mbs,
        ...fieldsFromPravniOblik(row)
      });
      processed += 1;
      if (pending.length >= batchSize()) {
        upserted += await upsertIndeksRows(pending);
        pending = [];
      }
    }
  });
  if (pending.length > 0) upserted += await upsertIndeksRows(pending);

  return {
    ok: true,
    snapshot_id: snapId,
    source: 'pravni_oblici',
    rows_processed: processed,
    rows_upserted: upserted
  };
}

/**
 * Nakon synca jednog dataset-a na disk → baza.
 */
async function syncSubjektIndeksAfterDataset(snapshotId, datasetKey, opts = {}) {
  const key = String(datasetKey);
  if (!INDEKS_DATASET_HOOKS.has(key)) return { skipped: true, reason: 'not_indexed_dataset' };

  if (key === SUBJEKTI_KEY) {
    return rebuildSubjektIndeksFromSubjekti(snapshotId, opts);
  }
  if (key === TVRTKA_KEY) {
    return patchSubjektIndeksFromTvrtka(snapshotId, opts);
  }
  return patchSubjektIndeksFromPravniOblici(snapshotId, opts);
}

/**
 * Inkrement: samo MBS iz diff/temp (novija snimka).
 */
async function syncSubjektIndeksForMbsSet(snapshotId, mbsSet, opts = {}) {
  const filter = normalizeMbsFilter(mbsSet);
  if (!filter || filter.size === 0) {
    return { ok: true, skipped: true, reason: 'empty_mbs_set' };
  }
  return rebuildSubjektIndeksFromSubjekti(snapshotId, {
    ...opts,
    mbsFilter: filter,
    deleteOthers: false
  });
}

async function searchSubjektIndeks(query = {}) {
  const snapId = Number(query.snapshot_id);
  if (!Number.isFinite(snapId)) {
    throw new Error('snapshot_id je obavezan.');
  }

  const take = Math.min(Math.max(Number(query.limit) || 50, 1), 500);
  const skip = Math.max(Number(query.offset) || 0, 0);

  const where = { snapshotId: snapId };
  const status = query.status;
  if (status !== undefined && status !== '') {
    where.status = Number(status);
  }
  const oib = toInt(query.oib);
  if (oib != null) where.oib = oib;
  const mbs = toInt(query.mbs);
  if (mbs != null) where.mbs = mbs;

  const naziv = query.naziv ? String(query.naziv).trim() : '';
  if (naziv.length >= 2) {
    where.naziv = { contains: naziv, mode: 'insensitive' };
  }

  const [total, rows] = await Promise.all([
    withPrismaRetry((db) => db.subjektIndeks.count({ where })),
    withPrismaRetry((db) =>
      db.subjektIndeks.findMany({
        where,
        orderBy: { mbs: 'asc' },
        take,
        skip
      })
    )
  ]);

  return { snapshot_id: snapId, total, offset: skip, limit: take, rows };
}

async function getSubjektIndeksSummary() {
  const [total, bySnapshot] = await Promise.all([
    withPrismaRetry((db) => db.subjektIndeks.count()),
    withPrismaRetry((db) =>
      db.subjektIndeks.groupBy({
        by: ['snapshotId'],
        _count: { _all: true },
        orderBy: { snapshotId: 'desc' },
        take: 20
      })
    )
  ]);
  return {
    total,
    by_snapshot: bySnapshot.map((g) => ({
      snapshot_id: g.snapshotId,
      count: g._count._all
    }))
  };
}

module.exports = {
  INDEKS_DATASET_HOOKS,
  rebuildSubjektIndeksFromSubjekti,
  patchSubjektIndeksFromTvrtka,
  patchSubjektIndeksFromPravniOblici,
  syncSubjektIndeksAfterDataset,
  syncSubjektIndeksForMbsSet,
  searchSubjektIndeks,
  getSubjektIndeksSummary,
  fieldsFromSubjekti,
  fieldsFromTvrtka,
  fieldsFromPravniOblik
};
