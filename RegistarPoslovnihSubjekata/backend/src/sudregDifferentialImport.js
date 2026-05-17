/**
 * Diferencijalni import: promjene (obje snimke) + SCN diff + aktivni subjekti + temp tablice.
 * Bez punog dohvata svih matičnih skupova.
 * Faze: disk | db | all — manji RAM i kraći SSE po koraku.
 */

const fs = require('fs');
const {
  saveSnapshotPromjene,
  savePromjeneDiff,
  writeDatasetMeta,
  datasetFilePath,
  diffPromjenePath,
  diffMetaPath,
  readJson
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
const { ensureDatabaseReady } = require('./lib/prisma');

const SUBJEKTI_KEY = 'subjekti';

function emitProgress(onProgress, payload) {
  if (typeof onProgress === 'function') {
    onProgress({ type: 'progress', ...payload });
  }
}

function maybeGc(onProgress, label) {
  if (typeof global.gc !== 'function') return;
  global.gc();
  emitProgress(onProgress, {
    phase: 'gc',
    step: 'gc',
    message: label || 'Oslobađanje memorije…',
    import_mode: 'diff'
  });
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

function readDiffFromDisk(fromId, toId) {
  const metaPath = diffMetaPath(fromId, toId);
  const meta = fs.existsSync(metaPath) ? readJson(metaPath) : null;
  return {
    diffRows: Number(meta?.stats?.diffRows) || 0,
    stats: meta?.stats || null,
    source: meta?.source || null,
    compare: meta?.compare || null
  };
}

function assertDiskPrerequisites(fromId, toId) {
  const diffFile = diffPromjenePath(fromId, toId);
  if (!fs.existsSync(diffFile)) {
    throw new Error(
      `Diff datoteka ne postoji (${diffFile}). Prvo pokreni fazu disk (phase=disk) ili cijeli import.`
    );
  }
  for (const id of [fromId, toId]) {
    const subFile = datasetFilePath(id, SUBJEKTI_KEY);
    if (!fs.existsSync(subFile)) {
      throw new Error(
        `Aktivni subjekti za snimku #${id} nisu na disku (${subFile}). Prvo pokreni fazu disk.`
      );
    }
  }
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
 * @param {{ snapshot_id_from: string|number, snapshot_id_to: string|number, phase?: 'all'|'disk'|'db', sync_db?: string|boolean, apply_temp?: string|boolean, only_subjekti?: string|boolean, force?: boolean, signal?: AbortSignal, onProgress?: (ev: object) => void }} opts
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

  const phase = String(opts.phase || 'all').toLowerCase();
  if (phase !== 'all' && phase !== 'disk' && phase !== 'db') {
    throw new Error('phase mora biti all, disk ili db.');
  }
  const runDisk = phase === 'all' || phase === 'disk';
  const runDb = phase === 'all' || phase === 'db';

  const syncDb = shouldSyncDb({ sync_db: opts.sync_db });
  const applyTemp =
    opts.apply_temp === '0' || opts.apply_temp === false ? false : syncDb;

  const onlySubjekti =
    opts.only_subjekti === '0' || opts.only_subjekti === false ? false : true;

  const steps = [];
  const t0 = Date.now();
  const onProgress = opts.onProgress;

  const addStep = (name, detail) => {
    steps.push({ step: name, ok: true, ...detail, elapsed_ms: Date.now() - t0 });
  };

  let diff = readDiffFromDisk(fromId, toId);
  let diskDurationMs = 0;

  if (runDisk) {
    const diskStepNames = [
      'promjene_snapshot_from',
      'promjene_snapshot_to',
      'promjene_diff',
      'subjekti_snapshot_from',
      'subjekti_snapshot_to'
    ];
    const diskStepTotal = diskStepNames.length;
    let diskStepIndex = 0;

    const emitDisk = (step, message, extra = {}) => {
      emitProgress(onProgress, {
        phase: 'disk',
        step,
        message,
        stepIndex: diskStepIndex,
        stepTotal: diskStepTotal,
        stepPercent: diskStepTotal ? Math.round((diskStepIndex / diskStepTotal) * 100) : 0,
        import_mode: 'diff',
        import_phase: phase,
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
      import_mode: 'diff',
      import_phase: phase
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

    maybeGc(onProgress, 'Nakon promjena na disku');

    emitDisk('promjene_diff', `SCN diff #${fromId} → #${toId}…`);
    diff = await savePromjeneDiff(fromId, toId, {
      save_snapshots: false,
      prefer_disk: true,
      signal: opts.signal,
      onProgress: (ev) =>
        emitProgress(onProgress, {
          phase: 'disk',
          step: 'promjene_diff',
          message:
            ev.phase === 'diff-index-baseline'
              ? `Diff indeks starija: ${ev.rowsRead != null ? ev.rowsRead.toLocaleString('hr-HR') : '?'} redova…`
              : ev.phase === 'diff-index-target'
                ? `Diff indeks novija: ${ev.rowsRead != null ? ev.rowsRead.toLocaleString('hr-HR') : '?'} redova…`
                : 'SCN diff…',
          import_mode: 'diff',
          import_phase: phase
        })
    });
    diskStepIndex += 1;
    addStep('promjene_diff', {
      snapshot_id_from: fromId,
      snapshot_id_to: toId,
      diffRows: diff.diffRows,
      stats: diff.stats,
      source: diff.source
    });
    emitDisk('promjene_diff', `Diff na disku (${diff.diffRows} redova).`, { done: true });

    maybeGc(onProgress, 'Nakon SCN diff-a');

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

    diskDurationMs = Date.now() - diskT0;
    emitProgress(onProgress, {
      phase: 'disk',
      step: 'complete',
      message: `Disk: gotovo za ${formatDurationMs(diskDurationMs)}.`,
      stepIndex: diskStepTotal,
      stepTotal: diskStepTotal,
      stepPercent: 100,
      disk_duration_ms: diskDurationMs,
      disk_duration: formatDurationMs(diskDurationMs),
      import_mode: 'diff',
      import_phase: phase
    });
    maybeGc(onProgress, 'Prije faze baze');
  } else if (runDb) {
    assertDiskPrerequisites(fromId, toId);
    diff = { ...readDiffFromDisk(fromId, toId), ok: true };
    addStep('disk_prerequisites', { ok: true, diffRows: diff.diffRows });
  }

  const database = {
    enabled: syncDb,
    snapshots: [],
    diffs: [],
    datasets: [],
    tempApply: null
  };
  let dbDurationMs = 0;

  if (!runDb) {
    addStep('database_sync', { skipped: true, reason: 'phase=disk' });
    emitProgress(onProgress, {
      phase: 'db',
      step: 'skipped',
      message: 'Baza preskočena (samo disk). Pokreni fazu 2/2.',
      import_mode: 'diff',
      import_phase: phase
    });
  } else if (!syncDb) {
    addStep('database_sync', { skipped: true, reason: 'sync_db=0' });
    emitProgress(onProgress, {
      phase: 'db',
      step: 'skipped',
      message: 'Baza preskočena.',
      import_mode: 'diff',
      import_phase: phase
    });
  } else {
    if (!isDatabaseConfigured()) {
      throw new Error('sync_db=1 ali DATABASE_URL nije postavljen.');
    }
    if (!runDisk) {
      assertDiskPrerequisites(fromId, toId);
    }
    await ensureDatabaseReady({ label: 'diff-import-db' });
    const dbT0 = Date.now();

    const syncPromjeneDb = opts.sync_promjene_db === '1' || opts.sync_promjene_db === true;
    const dbUnits = [];
    if (syncPromjeneDb) {
      dbUnits.push(
        { label: 'Promjene (starija)', fn: () => syncSnapshotPromjeneToDb(fromId) },
        { label: 'Promjene (novija)', fn: () => syncSnapshotPromjeneToDb(toId) }
      );
    }
    dbUnits.push(
      { label: 'SCN diff', fn: () => syncDiffPromjeneToDb(fromId, toId) },
      {
        label: 'Subjekti (starija, aktivni)',
        fn: () => syncDatasetToDb(fromId, SUBJEKTI_KEY)
      },
      {
        label: 'Subjekti (novija, aktivni)',
        fn: () => syncDatasetToDb(toId, SUBJEKTI_KEY)
      }
    );
    if (applyTemp) {
      dbUnits.push({
        label: 'Temp (primjena diff-a)',
        fn: () =>
          applyPromjeneDiffToTemp({
            snapshot_id_from: fromId,
            snapshot_id_to: toId,
            only_subjekti: onlySubjekti,
            onProgress: (ev) =>
              emitProgress(onProgress, {
                phase: 'db',
                step: 'temp_apply',
                message: `Temp: ${ev.done != null ? ev.done.toLocaleString('hr-HR') : '?'}/${ev.total != null ? ev.total.toLocaleString('hr-HR') : '?'} MBS…`,
                import_mode: 'diff',
                import_phase: phase
              })
          })
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
        import_mode: 'diff',
        import_phase: phase
      });
      const result = await unit.fn();
      if (unit.label.startsWith('Promjene (starija)')) database.snapshots.push(result);
      else if (unit.label.startsWith('Promjene (novija)')) database.snapshots.push(result);
      else if (unit.label === 'SCN diff') database.diffs.push(result);
      else if (unit.label.startsWith('Subjekti')) database.datasets.push(result);
      else if (unit.label.startsWith('Temp')) database.tempApply = result;
      unitIndex += 1;
      maybeGc(onProgress, `Nakon: ${unit.label}`);
      emitProgress(onProgress, {
        phase: 'db',
        step: 'unit_done',
        message: `${unit.label}: gotovo.`,
        unitIndex,
        unitCount: dbUnits.length,
        import_mode: 'diff',
        import_phase: phase
      });
    }

    dbDurationMs = Date.now() - dbT0;
    addStep('database_sync', {
      sync_promjene_db: syncPromjeneDb,
      snapshots: database.snapshots.length,
      diffs: database.diffs.length,
      datasets: database.datasets.length,
      temp_apply: Boolean(database.tempApply),
      only_subjekti: onlySubjekti
    });
    emitProgress(onProgress, {
      phase: 'db',
      step: 'complete',
      message: `Baza: gotovo za ${formatDurationMs(dbDurationMs)}.`,
      percent: 100,
      db_duration_ms: dbDurationMs,
      db_duration: formatDurationMs(dbDurationMs),
      import_mode: 'diff',
      import_phase: phase
    });
  }

  const totalDurationMs = Date.now() - t0;
  return {
    ok: true,
    import_mode: 'diff',
    import_phase: phase,
    duration_ms: totalDurationMs,
    duration: formatDurationMs(totalDurationMs),
    disk_duration_ms: diskDurationMs,
    disk_duration: diskDurationMs > 0 ? formatDurationMs(diskDurationMs) : null,
    db_duration_ms: dbDurationMs,
    db_duration: dbDurationMs > 0 ? formatDurationMs(dbDurationMs) : null,
    snapshot_id_from: fromId,
    snapshot_id_to: toId,
    diff_rows: diff.diffRows,
    diff_stats: diff.stats,
    diff_source: diff.source,
    only_subjekti: onlySubjekti,
    steps,
    database
  };
}

module.exports = { runDifferentialImport };
