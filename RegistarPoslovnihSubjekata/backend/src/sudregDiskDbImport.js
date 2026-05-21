/**
 * Učitavanje staging podataka s diska u PostgreSQL.
 *
 * Prva snimka (#1): puni INSERT (svi matični redovi + promjene).
 * Sljedeće snimke (#1→#2, #2→#3, …): samo UPDATE/DELETE/INSERT promijenjenih redova
 * iz diffs/.../datasets/*.jsonl + log samo UPDATE/DELETE (novi → INSERT u registar, bez loga).
 */

const fs = require('fs');
const path = require('path');
const { listAllImportJobs } = require('./sudregDatasets');
const { forEachJsonlBatch } = require('./jsonlStream');
const { withPrismaRetry, refreshPrismaConnection, getBatchSize } = require('./lib/prisma');
const {
  getDataDir,
  readJson,
  countJsonlLines,
  promjenePath,
  diffPromjenePath,
  diffMetaPath,
  diffDatasetFilePath,
  diffDatasetMetaPath,
  diffDatasetsDir,
  datasetFilePath
} = require('./sudregStaging');
const {
  isDatabaseConfigured,
  syncSnapshotPromjeneToDb,
  syncDiffPromjeneToDb,
  syncDatasetToDb,
  rowKeyFromRow,
  mapMaticniRow
} = require('./sudregDb');
const { syncSubjektIndeksForMbsSet } = require('./sudregSubjektIndeks');
const { diffPayloadFields } = require('./maticniFieldDiff');
const { ensureDatabaseReady } = require('./lib/prisma');

const INDEKS_DATASETS = new Set(['subjekti', 'tvrtka', 'pravni_oblici']);
const LOG_BATCH = 500;

function relDiskPath(absolutePath) {
  const root = getDataDir();
  return path.relative(root, absolutePath).split(path.sep).join('/');
}

function emitProgress(onProgress, payload) {
  if (typeof onProgress === 'function') {
    onProgress({ type: 'progress', phase: 'db', ...payload });
  }
}

function formatDurationMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return '?';
  if (n < 1000) return `${Math.round(n)} ms`;
  const sec = Math.floor(n / 1000);
  if (sec < 60) return `${sec} s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min} min ${rem} s` : `${min} min`;
}

function listDiffDatasetKeysOnDisk(fromId, toId) {
  const mp = diffMetaPath(fromId, toId);
  if (fs.existsSync(mp)) {
    try {
      const meta = readJson(mp);
      const items = meta?.datasets?.items;
      if (Array.isArray(items)) {
        return items
          .filter((i) => i && !i.skipped && i.dataset_key)
          .map((i) => String(i.dataset_key));
      }
    } catch (_) {
      /* meta oštećen */
    }
  }
  const dir = diffDatasetsDir(fromId, toId);
  if (!fs.existsSync(dir)) return [];
  const keys = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.meta.json')) continue;
    try {
      const m = readJson(path.join(dir, name));
      if (m.dataset_key) keys.push(String(m.dataset_key));
    } catch (_) {
      /* preskoči */
    }
  }
  return keys;
}

function hasMaticniDiffOnDisk(fromId, toId) {
  const keys = listDiffDatasetKeysOnDisk(fromId, toId);
  if (keys.length > 0) {
    return keys.some((k) => fs.existsSync(diffDatasetFilePath(fromId, toId, k)));
  }
  const dir = diffDatasetsDir(fromId, toId);
  return fs.existsSync(dir) && fs.readdirSync(dir).some((f) => f.endsWith('.jsonl'));
}

async function getRegistryState() {
  const [count, agg] = await Promise.all([
    withPrismaRetry((db) => db.maticniRed.count()),
    withPrismaRetry((db) => db.maticniRed.aggregate({ _max: { snapshotId: true } }))
  ]);
  return {
    rowCount: count,
    maxSnapshotId: agg._max.snapshotId != null ? Number(agg._max.snapshotId) : null
  };
}

async function resolveStagedDatasetId(datasetKey, fallbackSnapshotId) {
  const existing = await withPrismaRetry((db) =>
    db.stagedDataset.findFirst({
      where: { datasetKey: String(datasetKey) },
      orderBy: { snapshotId: 'asc' },
      select: { id: true }
    })
  );
  if (existing) return existing.id;

  const snapId = Number(fallbackSnapshotId);
  const stagedSnap = await withPrismaRetry((db) =>
    db.stagedSnapshot.findUnique({ where: { snapshotId: snapId } })
  );
  const created = await withPrismaRetry((db) =>
    db.stagedDataset.create({
      data: {
        snapshotId: snapId,
        datasetKey: String(datasetKey),
        apiPath: datasetKey,
        label: datasetKey,
        metaJson: { source: 'disk_db_apply' },
        diskRelPath: '',
        rowCount: 0,
        savedAt: new Date(),
        stagedSnapshotId: stagedSnap?.id || null
      }
    })
  );
  return created.id;
}

/**
 * Primijeni batch diff redova: UPDATE postojećih, INSERT samo novih, DELETE obrisane.
 * @returns {{ updated: number, inserted: number, deleted: number, logRows: object[] }}
 */
async function applyMaticniDiffBatch(fromId, toId, datasetKey, stagedDatasetId, rows) {
  const from = Number(fromId);
  const to = Number(toId);
  const key = String(datasetKey);
  let updated = 0;
  let inserted = 0;
  let deleted = 0;
  const logRows = [];

  for (const row of rows) {
    const mbs = row.mbs != null ? Number(row.mbs) : null;
    if (!Number.isFinite(mbs)) continue;
    const rowKey = rowKeyFromRow(row);
    const vrsta = row.vrsta ? String(row.vrsta) : '';

    const existing = await withPrismaRetry((client) =>
      client.maticniRed.findUnique({
        where: {
          datasetKey_mbs_rowKey: { datasetKey: key, mbs, rowKey }
        }
      })
    );

    if (vrsta === 'obrisan') {
      if (existing) {
        await withPrismaRetry((client) =>
          client.maticniRed.delete({ where: { id: existing.id } })
        );
        logRows.push({
          snapshotIdFrom: from,
          snapshotIdTo: to,
          datasetKey: key,
          mbs,
          rowKey,
          operation: 'delete',
          vrsta,
          changedColumns: null,
          fieldChanges: null,
          payloadBefore: null,
          payloadAfter: null,
          maticniRedId: existing.id
        });
        deleted += 1;
      }
      continue;
    }

    const payloadAfter = { ...row };

    if (existing) {
      const payloadBefore = existing.payload;
      const { columns, changes } = diffPayloadFields(payloadBefore, payloadAfter);
      if (columns.length === 0) continue;

      const updatedRow = await withPrismaRetry((client) =>
        client.maticniRed.update({
          where: { id: existing.id },
          data: {
            payload: payloadAfter,
            snapshotId: to,
            updatedAt: new Date()
          }
        })
      );
      logRows.push({
        snapshotIdFrom: from,
        snapshotIdTo: to,
        datasetKey: key,
        mbs,
        rowKey,
        operation: 'update',
        vrsta: vrsta || 'promjena',
        changedColumns: columns,
        fieldChanges: changes,
        payloadBefore: null,
        payloadAfter: null,
        maticniRedId: updatedRow.id
      });
      updated += 1;
      continue;
    }

    if (vrsta === 'novi' || vrsta === 'promjena' || vrsta === 'neaktivan') {
      await withPrismaRetry((client) =>
        client.maticniRed.create({
          data: mapMaticniRow(payloadAfter, to, key, stagedDatasetId)
        })
      );
      inserted += 1;
    }
  }

  return { updated, inserted, deleted, logRows };
}

async function flushMaticniChangeLog(entries) {
  if (!entries.length) return;
  for (let i = 0; i < entries.length; i += LOG_BATCH) {
    const chunk = entries.slice(i, i + LOG_BATCH);
    await withPrismaRetry((db) => db.maticniChangeLog.createMany({ data: chunk }));
  }
}

/**
 * Primijeni diffs/.../datasets/{key}.jsonl — UPDATE registra, ne nova kopija snimke.
 */
async function syncDiffMaticniDatasetToDb(fromId, toId, datasetKey, opts = {}) {
  const from = String(fromId);
  const to = String(toId);
  const key = String(datasetKey);
  const jsonlFile = diffDatasetFilePath(from, to, key);

  if (!fs.existsSync(jsonlFile)) {
    return { ok: true, skipped: true, reason: 'file_missing', dataset_key: key };
  }

  const metaFile = diffDatasetMetaPath(from, to, key);
  const metaObj = fs.existsSync(metaFile) ? readJson(metaFile) : { dataset_key: key };
  const rowsOnDisk = await countJsonlLines(jsonlFile);
  const snapTo = Number(to);
  const bs = getBatchSize();
  const stagedDatasetId = await resolveStagedDatasetId(key, from);

  let rowsProcessed = 0;
  let rowsUpdated = 0;
  let rowsInserted = 0;
  let rowsDeleted = 0;
  let logWritten = 0;
  let logBuffer = [];

  await forEachJsonlBatch(jsonlFile, bs, async (rows) => {
    const r = await applyMaticniDiffBatch(from, to, key, stagedDatasetId, rows);
    rowsProcessed += rows.length;
    rowsUpdated += r.updated;
    rowsInserted += r.inserted;
    rowsDeleted += r.deleted;
    logBuffer.push(...r.logRows);
    if (logBuffer.length >= LOG_BATCH) {
      await flushMaticniChangeLog(logBuffer);
      logWritten += logBuffer.length;
      logBuffer = [];
    }
    if (opts.onProgress) {
      opts.onProgress({
        done: rowsProcessed,
        total: rowsOnDisk,
        updated: rowsUpdated,
        inserted: rowsInserted,
        deleted: rowsDeleted
      });
    }
  });

  if (logBuffer.length) {
    await flushMaticniChangeLog(logBuffer);
    logWritten += logBuffer.length;
  }

  await withPrismaRetry((db) =>
    db.stagedDataset.upsert({
      where: { snapshotId_datasetKey: { snapshotId: snapTo, datasetKey: key } },
      create: {
        snapshotId: snapTo,
        datasetKey: key,
        apiPath: metaObj.api_path || key,
        label: metaObj.label || key,
        metaJson: { ...metaObj, source: 'maticni_diff_apply', diff_from: Number(from) },
        diskRelPath: relDiskPath(jsonlFile),
        rowCount: rowsOnDisk,
        savedAt: new Date(),
        dbSyncedAt: new Date()
      },
      update: {
        metaJson: { ...metaObj, source: 'maticni_diff_apply', diff_from: Number(from) },
        diskRelPath: relDiskPath(jsonlFile),
        dbSyncedAt: new Date()
      }
    })
  );

  let subjektIndeks = null;
  if (INDEKS_DATASETS.has(key)) {
    const mbsSet = new Set();
    await forEachJsonlBatch(jsonlFile, bs, async (batch) => {
      for (const row of batch) {
        const m = row.mbs != null ? Number(row.mbs) : null;
        if (Number.isFinite(m)) mbsSet.add(m);
      }
    });
    if (mbsSet.size > 0) {
      try {
        subjektIndeks = await syncSubjektIndeksForMbsSet(snapTo, mbsSet, {
          onProgress: opts.onProgress
        });
      } catch (e) {
        subjektIndeks = {
          ok: false,
          error: e instanceof Error ? e.message : String(e)
        };
      }
    }
  }

  return {
    ok: true,
    skipped: false,
    dataset_key: key,
    snapshot_id_from: Number(from),
    snapshot_id_to: snapTo,
    rowsOnDisk,
    rowsProcessed,
    rowsUpdated,
    rowsInserted,
    rowsDeleted,
    change_log_rows: logWritten,
    subjektIndeks
  };
}

async function syncFullSnapshotFromDisk(toId, opts = {}) {
  const to = String(toId).trim();
  if (!fs.existsSync(promjenePath(to))) {
    throw new Error(
      `Nema promjene.jsonl za snimku #${to} na disku. Prvo „Snimi sve snimke” ili pojedinačno spremanje.`
    );
  }

  const state = await getRegistryState();
  if (state.rowCount > 0) {
    throw new Error(
      `Baza već sadrži ${state.rowCount.toLocaleString('hr-HR')} matičnih redova (zadnja snimka #${state.maxSnapshotId}). ` +
        'Za prvi puni upis koristi praznu bazu („Obriši bazu”) ili nastavak s parom #1→#2.'
    );
  }

  const results = { mode: 'full', snapshot_id: to, promjene: null, datasets: [] };
  const jobs = listAllImportJobs();

  emitProgress(opts.onProgress, {
    step: 'unit_start',
    message: `Puni INSERT: promjene #${to}…`,
    unitIndex: 0,
    unitCount: jobs.length + 1
  });
  results.promjene = await syncSnapshotPromjeneToDb(to, { onProgress: opts.onProgress });

  let unitIndex = 1;
  for (const job of jobs) {
    const key = job.datasetKey;
    const file = datasetFilePath(to, key);
    if (!fs.existsSync(file)) {
      results.datasets.push({ dataset_key: key, skipped: true, reason: 'file_missing' });
      unitIndex += 1;
      continue;
    }
    emitProgress(opts.onProgress, {
      step: 'unit_start',
      message: `Puni INSERT: ${key} (#${to})…`,
      unitIndex,
      unitCount: jobs.length + 1
    });
    const r = await syncDatasetToDb(to, key, { onProgress: opts.onProgress });
    results.datasets.push(r);
    unitIndex += 1;
  }

  return results;
}

async function assertCanApplyIncremental(fromId, toId) {
  const from = Number(fromId);
  const to = Number(toId);
  const state = await getRegistryState();
  if (state.rowCount === 0) {
    throw new Error(
      'Registar u bazi je prazan. Prvo „Ubaci u bazu” samo s prvom snimkom (bez #1 u paru) — puni INSERT.'
    );
  }
  if (state.maxSnapshotId != null && state.maxSnapshotId < from) {
    throw new Error(
      `Stanje u bazi je na snimci #${state.maxSnapshotId}, a diff kreće od #${from}. ` +
        `Prvo primijeni prethodne parove (npr. #${state.maxSnapshotId}→#${from}).`
    );
  }
}

async function syncIncrementalPairFromDisk(fromId, toId, opts = {}) {
  const from = String(fromId).trim();
  const to = String(toId).trim();

  await assertCanApplyIncremental(from, to);

  if (!fs.existsSync(diffPromjenePath(from, to))) {
    throw new Error(
      `Nema promjene diff za #${from}→#${to}. Prvo „Diff susjednih snimki” ili API → diff.`
    );
  }
  if (!hasMaticniDiffOnDisk(from, to)) {
    throw new Error(
      `Nema matičnog diff-a u diffs/${from}_to_${to}/datasets/. Prvo „Diff matičnih entiteta”.`
    );
  }

  const keys = listDiffDatasetKeysOnDisk(from, to);
  const results = {
    mode: 'incremental',
    snapshot_id_from: from,
    snapshot_id_to: to,
    promjene_diff: null,
    datasets: [],
    change_log: { logged: 0, updates: 0, deletes: 0 },
    rows_inserted_unlogged: 0
  };

  emitProgress(opts.onProgress, {
    step: 'unit_start',
    message: `SCN diff #${from}→#${to} (promjene)…`,
    unitIndex: 0,
    unitCount: keys.length + 1
  });
  results.promjene_diff = await syncDiffPromjeneToDb(from, to, { onProgress: opts.onProgress });

  let unitIndex = 1;
  for (const key of keys) {
    emitProgress(opts.onProgress, {
      step: 'unit_start',
      message: `UPDATE matičnih: ${key}…`,
      unitIndex,
      unitCount: keys.length + 1
    });
    const r = await syncDiffMaticniDatasetToDb(from, to, key, { onProgress: opts.onProgress });
    results.datasets.push(r);
    if (!r.skipped) {
      results.change_log.logged += r.change_log_rows || 0;
      results.change_log.updates += r.rowsUpdated || 0;
      results.change_log.deletes += r.rowsDeleted || 0;
      results.rows_inserted_unlogged += r.rowsInserted || 0;
    }
    unitIndex += 1;
  }

  await withPrismaRetry((db) =>
    db.stagedSnapshot.upsert({
      where: { snapshotId: Number(to) },
      create: {
        snapshotId: Number(to),
        metaJson: { source: 'incremental_apply', from: Number(from) },
        diskRelPath: `diffs/${from}_to_${to}`,
        rowCount: 0,
        savedAt: new Date(),
        dbSyncedAt: new Date()
      },
      update: { dbSyncedAt: new Date() }
    })
  );

  return results;
}

/**
 * @param {{ snapshot_id_to: string, snapshot_id_from?: string, mode?: 'auto'|'full'|'incremental', onProgress?: Function }} opts
 */
async function runDiskToDbImport(opts = {}) {
  const toId = String(opts.snapshot_id_to || '').trim();
  const fromId = String(opts.snapshot_id_from || '').trim();
  let mode = String(opts.mode || 'auto').toLowerCase();

  if (!toId) {
    throw new Error('snapshot_id_to (novija snimka) je obavezan.');
  }
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL nije postavljen.');
  }

  await ensureDatabaseReady({ label: 'disk-db-import' });
  await refreshPrismaConnection();

  const state = await getRegistryState();

  if (mode === 'auto') {
    const pairIncremental =
      fromId &&
      fromId !== toId &&
      Number(fromId) < Number(toId) &&
      hasMaticniDiffOnDisk(fromId, toId);
    if (state.rowCount === 0) {
      mode = 'full';
    } else if (pairIncremental) {
      mode = 'incremental';
    } else {
      throw new Error(
        'Baza već ima podatke. Za sljedeću snimku odaberi par #1→#2 (mora postojati matični diff na disku).'
      );
    }
  }

  if (mode === 'full' && state.rowCount > 0) {
    throw new Error(
      'Puni INSERT samo u praznu bazu. Za sljedeće snimke koristi par #1→#2 (UPDATE + log).'
    );
  }

  if (mode === 'incremental') {
    if (!fromId || fromId === toId) {
      throw new Error('Za UPDATE odaberi stariju (1) i noviju (2) snimku.');
    }
    if (Number(fromId) >= Number(toId)) {
      throw new Error(`snapshot_id_from (${fromId}) mora biti manji od snapshot_id_to (${toId}).`);
    }
  }

  const t0 = Date.now();
  emitProgress(opts.onProgress, {
    step: 'start',
    message:
      mode === 'full'
        ? `Puni INSERT u bazu (#${toId})…`
        : `UPDATE registra (#${fromId}→#${toId}, samo promijenjeni redovi)…`,
    import_mode: 'disk_db',
    db_mode: mode
  });

  let detail;
  if (mode === 'full') {
    detail = await syncFullSnapshotFromDisk(toId, opts);
  } else {
    detail = await syncIncrementalPairFromDisk(fromId, toId, opts);
  }

  const durationMs = Date.now() - t0;
  emitProgress(opts.onProgress, {
    step: 'complete',
    message: `Baza: gotovo za ${formatDurationMs(durationMs)}.`,
    percent: 100,
    db_duration_ms: durationMs,
    db_duration: formatDurationMs(durationMs),
    import_mode: 'disk_db',
    db_mode: mode
  });

  return {
    ok: true,
    import_mode: 'disk_db',
    db_mode: mode,
    snapshot_id_to: toId,
    snapshot_id_from: mode === 'incremental' ? fromId : null,
    duration_ms: durationMs,
    duration: formatDurationMs(durationMs),
    ...detail
  };
}

/**
 * Pregled loga (operation=update | delete; novi zapisi nisu u logu).
 */
async function listMaticniChangeLog(opts = {}) {
  const where = {};
  if (opts.snapshot_id_from != null) {
    where.snapshotIdFrom = Number(opts.snapshot_id_from);
  }
  if (opts.snapshot_id_to != null) {
    where.snapshotIdTo = Number(opts.snapshot_id_to);
  }
  if (opts.operation) {
    where.operation = String(opts.operation);
  }
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 5000);
  const [total, rows] = await Promise.all([
    withPrismaRetry((db) => db.maticniChangeLog.count({ where })),
    withPrismaRetry((db) =>
      db.maticniChangeLog.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          snapshotIdFrom: true,
          snapshotIdTo: true,
          datasetKey: true,
          mbs: true,
          rowKey: true,
          operation: true,
          vrsta: true,
          changedColumns: true,
          fieldChanges: true,
          appliedAt: true,
          maticniRedId: true
        }
      })
    )
  ]);
  return { total, limit, rows };
}

module.exports = {
  runDiskToDbImport,
  syncFullSnapshotFromDisk,
  syncIncrementalPairFromDisk,
  syncDiffMaticniDatasetToDb,
  listDiffDatasetKeysOnDisk,
  hasMaticniDiffOnDisk,
  listMaticniChangeLog
};
