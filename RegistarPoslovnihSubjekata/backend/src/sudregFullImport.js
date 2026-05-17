/**
 * Puni import: 1) disk (JSON/JSONL)  2) PostgreSQL (s progressom po redovima s diska).
 */

const { listAllImportJobs } = require('./sudregDatasets');
const { fetchAllDatasetPages } = require('./sudregDatasetFetch');
const {
  saveSnapshotPromjene,
  savePromjeneDiff,
  saveDatasetJsonl
} = require('./sudregStaging');
const {
  shouldSyncDb,
  buildDbSyncPlan,
  syncDbUnit,
  isDatabaseConfigured
} = require('./sudregDb');

function emitProgress(onProgress, payload) {
  if (typeof onProgress === 'function') {
    onProgress({ type: 'progress', ...payload });
  }
}

/**
 * @param {{ snapshot_id_to: string|number, snapshot_id_from?: string|number, sync_db?: string|boolean, force?: boolean, signal?: AbortSignal, onProgress?: (ev: object) => void }} opts
 */
async function runFullImport(opts = {}) {
  const toId = String(opts.snapshot_id_to || '').trim();
  const fromId = String(opts.snapshot_id_from || '').trim();
  if (!toId) {
    throw new Error('snapshot_id_to (novija snimka) je obavezan.');
  }

  const syncDb = shouldSyncDb({ sync_db: opts.sync_db });
  const steps = [];
  const t0 = Date.now();
  const onProgress = opts.onProgress;

  const addStep = (name, detail) => {
    steps.push({
      step: name,
      ok: true,
      ...detail,
      elapsed_ms: Date.now() - t0
    });
  };

  const jobs = listAllImportJobs();
  const diskStepNames = ['promjene_snapshot_to'];
  if (fromId && fromId !== toId) {
    diskStepNames.push('promjene_snapshot_from', 'promjene_diff');
  }
  for (const job of jobs) {
    diskStepNames.push(`dataset:${job.datasetKey}`);
  }
  const diskStepTotal = diskStepNames.length;
  let diskStepIndex = 0;

  const emitDisk = (step, message, extra = {}) => {
    emitProgress(onProgress, {
      phase: 'disk',
      step,
      message,
      stepIndex: diskStepIndex,
      stepTotal: diskStepTotal,
      stepPercent: diskStepTotal
        ? Math.round((diskStepIndex / diskStepTotal) * 100)
        : 0,
      ...extra
    });
  };

  // —— Faza 1: disk ——
  emitProgress(onProgress, {
    phase: 'disk',
    step: 'start',
    message: 'Faza 1/2: spremanje na disk…',
    stepIndex: 0,
    stepTotal: diskStepTotal,
    stepPercent: 0
  });

  emitDisk('promjene_snapshot_to', `Promjene snimka #${toId} → disk…`);
  const toProm = await saveSnapshotPromjene(toId, { force: opts.force, signal: opts.signal });
  diskStepIndex += 1;
  addStep('promjene_snapshot_to', {
    snapshot_id: toId,
    skipped: toProm.skipped,
    rowCount: toProm.meta?.endpoints?.promjene?.rowCount
  });
  emitDisk('promjene_snapshot_to', `Promjene #${toId} na disku.`, {
    rowCount: toProm.meta?.endpoints?.promjene?.rowCount,
    done: true
  });

  const datasets = [];
  if (fromId && fromId !== toId) {
    emitDisk('promjene_snapshot_from', `Promjene snimka #${fromId} → disk…`);
    const fromProm = await saveSnapshotPromjene(fromId, { force: opts.force, signal: opts.signal });
    diskStepIndex += 1;
    addStep('promjene_snapshot_from', {
      snapshot_id: fromId,
      skipped: fromProm.skipped,
      rowCount: fromProm.meta?.endpoints?.promjene?.rowCount
    });
    emitDisk('promjene_snapshot_from', `Promjene #${fromId} na disku.`, { done: true });

    emitDisk('promjene_diff', `SCN diff #${fromId} → #${toId}…`);
    const diff = await savePromjeneDiff(fromId, toId, {
      save_snapshots: false,
      prefer_disk: true,
      signal: opts.signal
    });
    diskStepIndex += 1;
    addStep('promjene_diff', {
      snapshot_id_from: fromId,
      snapshot_id_to: toId,
      diffRows: diff.diffRows,
      stats: diff.stats
    });
    emitDisk('promjene_diff', `Diff na disku (${diff.diffRows} redova).`, { done: true });
  }

  for (const job of jobs) {
    emitDisk(`dataset:${job.datasetKey}`, `API → disk: ${job.datasetKey}…`, {
      datasetKey: job.datasetKey
    });
    const fetched = await fetchAllDatasetPages(job, toId, { signal: opts.signal });
    const saved = saveDatasetJsonl(toId, job.datasetKey, fetched.rows, {
      api_path: fetched.apiPath,
      label: fetched.label,
      pages: fetched.pages,
      totalCount: fetched.totalCount
    });
    datasets.push({
      datasetKey: job.datasetKey,
      apiPath: fetched.apiPath,
      rowCount: fetched.rows.length,
      disk: saved.filePath
    });
    diskStepIndex += 1;
    addStep(`dataset:${job.datasetKey}`, {
      api_path: fetched.apiPath,
      rowCount: fetched.rows.length,
      pages: fetched.pages
    });
    emitDisk(`dataset:${job.datasetKey}`, `${job.datasetKey}: ${fetched.rows.length} redova na disku.`, {
      datasetKey: job.datasetKey,
      rowCount: fetched.rows.length,
      done: true
    });
  }

  emitProgress(onProgress, {
    phase: 'disk',
    step: 'complete',
    message: 'Disk: sve datoteke spremljene.',
    stepIndex: diskStepTotal,
    stepTotal: diskStepTotal,
    stepPercent: 100
  });

  // —— Faza 2: baza ——
  const database = { enabled: syncDb, snapshots: [], diffs: [], datasets: [] };

  if (!syncDb) {
    addStep('database_sync', { skipped: true, reason: 'sync_db=0 ili nema DATABASE_URL' });
    emitProgress(onProgress, {
      phase: 'db',
      step: 'skipped',
      message: 'Baza preskočena (sync_db=0).'
    });
  } else {
    if (!isDatabaseConfigured()) {
      throw new Error('sync_db=1 ali DATABASE_URL nije postavljen.');
    }

    const plan = await buildDbSyncPlan({
      snapshot_id_to: toId,
      snapshot_id_from: fromId && fromId !== toId ? fromId : undefined,
      datasetKeys: datasets.map((d) => d.datasetKey)
    });

    emitProgress(onProgress, {
      phase: 'db',
      step: 'plan',
      message: `Faza 2/2: upis u bazu (${plan.totalRows.toLocaleString('hr-HR')} redova s diska)…`,
      rowsTotal: plan.totalRows,
      rowsDone: 0,
      unitTotal: plan.units.length,
      unitIndex: 0,
      percent: plan.totalRows ? 0 : 100,
      units: plan.units.map((u) => ({ label: u.label, kind: u.kind, rows: u.rows }))
    });

    let rowsDoneGlobal = 0;
    let unitIndex = 0;

    for (const unit of plan.units) {
      emitProgress(onProgress, {
        phase: 'db',
        step: 'unit_start',
        message: `Baza: ${unit.label} (0 / ${unit.rows.toLocaleString('hr-HR')})…`,
        label: unit.label,
        kind: unit.kind,
        rowsTotal: plan.totalRows,
        rowsDone: rowsDoneGlobal,
        unitRows: unit.rows,
        unitDone: 0,
        unitTotal: unit.rows,
        unitIndex,
        unitCount: plan.units.length,
        percent: plan.totalRows
          ? Math.round((rowsDoneGlobal / plan.totalRows) * 100)
          : 100
      });

      const result = await syncDbUnit(unit, {
        onProgress: ({ done, total }) => {
          const rowsDone = rowsDoneGlobal + done;
          emitProgress(onProgress, {
            phase: 'db',
            step: 'insert',
            message: `Baza: ${unit.label} — ${done.toLocaleString('hr-HR')} / ${total.toLocaleString('hr-HR')} redova`,
            label: unit.label,
            rowsTotal: plan.totalRows,
            rowsDone,
            unitRows: unit.rows,
            unitDone: done,
            unitTotal: total,
            unitIndex,
            unitCount: plan.units.length,
            percent: plan.totalRows
              ? Math.min(100, Math.round((rowsDone / plan.totalRows) * 100))
              : 100
          });
        }
      });

      if (unit.kind === 'promjene_snapshot') {
        database.snapshots.push(result);
      } else if (unit.kind === 'promjene_diff') {
        database.diffs.push(result);
      } else if (unit.kind === 'dataset') {
        database.datasets.push(result);
      }

      rowsDoneGlobal += unit.rows;
      unitIndex += 1;

      emitProgress(onProgress, {
        phase: 'db',
        step: 'unit_done',
        message: `${unit.label}: gotovo.`,
        label: unit.label,
        rowsTotal: plan.totalRows,
        rowsDone: rowsDoneGlobal,
        unitIndex,
        unitCount: plan.units.length,
        percent: plan.totalRows
          ? Math.min(100, Math.round((rowsDoneGlobal / plan.totalRows) * 100))
          : 100
      });
    }

    addStep('database_sync', {
      promjene_snapshots: database.snapshots.length,
      diffs: database.diffs.length,
      datasets: database.datasets.length,
      rowsTotal: plan.totalRows,
      rowsDone: rowsDoneGlobal
    });

    emitProgress(onProgress, {
      phase: 'db',
      step: 'complete',
      message: `Baza: uvezeno ${rowsDoneGlobal.toLocaleString('hr-HR')} redova.`,
      rowsTotal: plan.totalRows,
      rowsDone: rowsDoneGlobal,
      percent: 100
    });
  }

  return {
    ok: true,
    duration_ms: Date.now() - t0,
    snapshot_id_to: toId,
    snapshot_id_from: fromId && fromId !== toId ? fromId : null,
    dataset_jobs: jobs.length,
    steps,
    database
  };
}

module.exports = { runFullImport };
