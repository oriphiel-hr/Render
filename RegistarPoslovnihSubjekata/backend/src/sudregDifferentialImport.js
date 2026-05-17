/**
 * Diferencijalni import: promjene (obje snimke) + SCN diff + aktivni subjekti + temp tablice.
 * Bez punog dohvata svih matičnih skupova.
 */

const {
  saveSnapshotPromjene,
  savePromjeneDiff,
  writeDatasetMeta,
  datasetFilePath
} = require('./sudregStaging');
const { fetchAllDatasetPagesToJsonl } = require('./sudregDatasetFetch');
const { getDataset } = require('./sudregDatasets');
const {
  shouldSyncDb,
  syncSnapshotPromjeneToDb,
  syncDiffPromjeneToDb,
  syncDatasetToDb,
  isDatabaseConfigured
} = require('./sudregDb');
const { applyPromjeneDiffToTemp } = require('./sudregTempApply');

const SUBJEKTI_KEY = 'subjekti';

function emitProgress(onProgress, payload) {
  if (typeof onProgress === 'function') {
    onProgress({ type: 'progress', ...payload });
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

function subjektiJob() {
  const entry = getDataset(SUBJEKTI_KEY);
  return {
    datasetKey: SUBJEKTI_KEY,
    datasetId: SUBJEKTI_KEY,
    apiPath: entry.apiPaths[0],
    label: entry.label,
    query: { only_active: '1' }
  };
}

async function fetchSubjektiActiveToDisk(snapshotId, opts = {}) {
  const job = subjektiJob();
  const outFile = datasetFilePath(snapshotId, job.datasetKey);
  const fetched = await fetchAllDatasetPagesToJsonl(job, snapshotId, outFile, {
    only_active: '1',
    signal: opts.signal
  });
  writeDatasetMeta(snapshotId, job.datasetKey, outFile, {
    api_path: fetched.apiPath,
    label: fetched.label,
    only_active: true,
    pages: fetched.pages,
    totalCount: fetched.totalCount,
    rowCount: fetched.rowCount
  });
  return fetched;
}

/**
 * @param {{ snapshot_id_from: string|number, snapshot_id_to: string|number, sync_db?: string|boolean, apply_temp?: string|boolean, force?: boolean, signal?: AbortSignal, onProgress?: (ev: object) => void }} opts
 */
async function runDifferentialImport(opts = {}) {
  const fromId = String(opts.snapshot_id_from || '').trim();
  const toId = String(opts.snapshot_id_to || '').trim();
  if (!fromId || !toId) {
    throw new Error('Diferencijalni import zahtijeva snapshot_id_from i snapshot_id_to (starija i novija).');
  }
  if (fromId === toId) {
    throw new Error('Starija i novija snimka moraju biti različite.');
  }
  const fromNum = Number(fromId);
  const toNum = Number(toId);
  if (!Number.isFinite(fromNum) || !Number.isFinite(toNum) || fromNum >= toNum) {
    throw new Error(
      `snapshot_id_from (${fromId}) mora biti manji od snapshot_id_to (${toId}).`
    );
  }

  const syncDb = shouldSyncDb({ sync_db: opts.sync_db });
  const applyTemp =
    opts.apply_temp === '0' || opts.apply_temp === false
      ? false
      : syncDb;

  const steps = [];
  const t0 = Date.now();
  const onProgress = opts.onProgress;

  const diskStepNames = [
    'promjene_snapshot_from',
    'promjene_snapshot_to',
    'promjene_diff',
    'subjekti_snapshot_from',
    'subjekti_snapshot_to'
  ];
  const diskStepTotal = diskStepNames.length;
  let diskStepIndex = 0;

  const addStep = (name, detail) => {
    steps.push({ step: name, ok: true, ...detail, elapsed_ms: Date.now() - t0 });
  };

  const emitDisk = (step, message, extra = {}) => {
    emitProgress(onProgress, {
      phase: 'disk',
      step,
      message,
      stepIndex: diskStepIndex,
      stepTotal: diskStepTotal,
      stepPercent: diskStepTotal ? Math.round((diskStepIndex / diskStepTotal) * 100) : 0,
      import_mode: 'diff',
      ...extra
    });
  };

  const diskT0 = Date.now();
  emitProgress(onProgress, {
    phase: 'disk',
    step: 'start',
    message: 'Diferencijalno: disk (promjene, diff, aktivni subjekti)…',
    stepIndex: 0,
    stepTotal: diskStepTotal,
    import_mode: 'diff'
  });

  emitDisk('promjene_snapshot_from', `Promjene starija #${fromId} → disk…`);
  const fromProm = await saveSnapshotPromjene(fromId, { force: opts.force, signal: opts.signal });
  diskStepIndex += 1;
  addStep('promjene_snapshot_from', {
    snapshot_id: fromId,
    skipped: fromProm.skipped,
    rowCount: fromProm.meta?.endpoints?.promjene?.rowCount
  });
  emitDisk('promjene_snapshot_from', `Promjene #${fromId} na disku.`, { done: true });

  emitDisk('promjene_snapshot_to', `Promjene novija #${toId} → disk…`);
  const toProm = await saveSnapshotPromjene(toId, { force: opts.force, signal: opts.signal });
  diskStepIndex += 1;
  addStep('promjene_snapshot_to', {
    snapshot_id: toId,
    skipped: toProm.skipped,
    rowCount: toProm.meta?.endpoints?.promjene?.rowCount
  });
  emitDisk('promjene_snapshot_to', `Promjene #${toId} na disku.`, { done: true });

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

  emitDisk('subjekti_snapshot_from', `Aktivni subjekti #${fromId} → disk…`);
  const subFrom = await fetchSubjektiActiveToDisk(fromId, { signal: opts.signal });
  diskStepIndex += 1;
  addStep('subjekti_snapshot_from', { snapshot_id: fromId, rowCount: subFrom.rowCount });
  emitDisk('subjekti_snapshot_from', `Subjekti #${fromId}: ${subFrom.rowCount} redova.`, { done: true });

  emitDisk('subjekti_snapshot_to', `Aktivni subjekti #${toId} → disk…`);
  const subTo = await fetchSubjektiActiveToDisk(toId, { signal: opts.signal });
  diskStepIndex += 1;
  addStep('subjekti_snapshot_to', { snapshot_id: toId, rowCount: subTo.rowCount });
  emitDisk('subjekti_snapshot_to', `Subjekti #${toId}: ${subTo.rowCount} redova.`, { done: true });

  const diskDurationMs = Date.now() - diskT0;
  emitProgress(onProgress, {
    phase: 'disk',
    step: 'complete',
    message: `Disk: gotovo za ${formatDurationMs(diskDurationMs)}.`,
    stepIndex: diskStepTotal,
    stepTotal: diskStepTotal,
    stepPercent: 100,
    disk_duration_ms: diskDurationMs,
    disk_duration: formatDurationMs(diskDurationMs),
    import_mode: 'diff'
  });

  const database = {
    enabled: syncDb,
    snapshots: [],
    diffs: [],
    datasets: [],
    tempApply: null
  };
  let dbDurationMs = 0;

  if (!syncDb) {
    addStep('database_sync', { skipped: true, reason: 'sync_db=0' });
    emitProgress(onProgress, { phase: 'db', step: 'skipped', message: 'Baza preskočena.', import_mode: 'diff' });
  } else {
    if (!isDatabaseConfigured()) {
      throw new Error('sync_db=1 ali DATABASE_URL nije postavljen.');
    }
    const { refreshPrismaConnection } = require('./lib/prisma');
    await refreshPrismaConnection();
    const dbT0 = Date.now();

    const dbUnits = [
      { label: 'Promjene (starija)', fn: () => syncSnapshotPromjeneToDb(fromId) },
      { label: 'Promjene (novija)', fn: () => syncSnapshotPromjeneToDb(toId) },
      { label: 'SCN diff', fn: () => syncDiffPromjeneToDb(fromId, toId) },
      {
        label: 'Subjekti (starija, aktivni)',
        fn: () => syncDatasetToDb(fromId, SUBJEKTI_KEY)
      },
      {
        label: 'Subjekti (novija, aktivni)',
        fn: () => syncDatasetToDb(toId, SUBJEKTI_KEY)
      }
    ];
    if (applyTemp) {
      dbUnits.push({
        label: 'Temp (primjena diff-a)',
        fn: () => applyPromjeneDiffToTemp({ snapshot_id_from: fromId, snapshot_id_to: toId })
      });
    }

    let unitIndex = 0;
    for (const unit of dbUnits) {
      emitProgress(onProgress, {
        phase: 'db',
        step: 'unit_start',
        message: `Baza: ${unit.label}…`,
        unitIndex,
        unitCount: dbUnits.length,
        import_mode: 'diff'
      });
      const result = await unit.fn();
      if (unit.label.startsWith('Promjene (starija)')) database.snapshots.push(result);
      else if (unit.label.startsWith('Promjene (novija)')) database.snapshots.push(result);
      else if (unit.label === 'SCN diff') database.diffs.push(result);
      else if (unit.label.startsWith('Subjekti')) database.datasets.push(result);
      else if (unit.label.startsWith('Temp')) database.tempApply = result;
      unitIndex += 1;
      emitProgress(onProgress, {
        phase: 'db',
        step: 'unit_done',
        message: `${unit.label}: gotovo.`,
        unitIndex,
        unitCount: dbUnits.length,
        import_mode: 'diff'
      });
    }

    dbDurationMs = Date.now() - dbT0;
    addStep('database_sync', {
      snapshots: database.snapshots.length,
      diffs: database.diffs.length,
      datasets: database.datasets.length,
      temp_apply: Boolean(database.tempApply)
    });
    emitProgress(onProgress, {
      phase: 'db',
      step: 'complete',
      message: `Baza: gotovo za ${formatDurationMs(dbDurationMs)}.`,
      percent: 100,
      db_duration_ms: dbDurationMs,
      db_duration: formatDurationMs(dbDurationMs),
      import_mode: 'diff'
    });
  }

  const totalDurationMs = Date.now() - t0;
  return {
    ok: true,
    import_mode: 'diff',
    duration_ms: totalDurationMs,
    duration: formatDurationMs(totalDurationMs),
    disk_duration_ms: diskDurationMs,
    disk_duration: formatDurationMs(diskDurationMs),
    db_duration_ms: dbDurationMs,
    db_duration: dbDurationMs > 0 ? formatDurationMs(dbDurationMs) : null,
    snapshot_id_from: fromId,
    snapshot_id_to: toId,
    diff_rows: diff.diffRows,
    diff_stats: diff.stats,
    steps,
    database
  };
}

module.exports = { runDifferentialImport };
