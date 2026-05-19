/**
 * Masovno spremanje svih snimki s API-ja na disk (promjene + svi matični skupovi).
 * Postojeće JSONL datoteke se preskaču (osim force=1).
 */

const { getSnapshots } = require('./sudregApi');
const { listAllImportJobs } = require('./sudregDatasets');
const {
  getDataDir,
  saveSnapshotPromjene,
  saveDatasetToDiskIfMissing
} = require('./sudregStaging');

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

function normalizeSnapshotsList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * Jedna snimka: /promjene + svi skupovi iz listAllImportJobs.
 */
async function saveOneSnapshotToDisk(snapshotId, opts = {}) {
  const id = String(snapshotId);
  const jobs = listAllImportJobs();
  const onProgress = opts.onProgress;

  emitProgress(onProgress, {
    phase: 'snapshot',
    step: 'promjene',
    message: `Snimka #${id}: promjene…`,
    snapshot_id: id
  });

  const promjene = await saveSnapshotPromjene(id, {
    force: opts.force,
    signal: opts.signal
  });

  const datasets = [];
  let jobIndex = 0;
  for (const job of jobs) {
    jobIndex += 1;
    emitProgress(onProgress, {
      phase: 'snapshot',
      step: 'dataset',
      message: `Snimka #${id}: ${job.datasetKey}…`,
      snapshot_id: id,
      dataset_key: job.datasetKey,
      job_index: jobIndex,
      job_total: jobs.length
    });

    const result = await saveDatasetToDiskIfMissing(id, job, {
      force: opts.force,
      signal: opts.signal
    });
    datasets.push(result);

    emitProgress(onProgress, {
      phase: 'snapshot',
      step: 'dataset_done',
      message: `Snimka #${id}: ${job.datasetKey} — ${result.skipped ? 'preskočeno' : result.rowCount + ' redova'}`,
      snapshot_id: id,
      dataset_key: job.datasetKey,
      skipped: result.skipped,
      row_count: result.rowCount
    });
  }

  const skippedDatasets = datasets.filter((d) => d.skipped).length;

  emitProgress(onProgress, {
    phase: 'snapshot',
    step: 'mbs_validate',
    message: `Snimka #${id}: provjera MBS redoslijeda…`,
    snapshot_id: id
  });

  const { validateSnapshotMbsOrder } = require('./sudregMbsOrderValidate');
  const mbs_order = await validateSnapshotMbsOrder(id, {
    signal: opts.signal,
    onProgress
  });

  emitProgress(onProgress, {
    phase: 'snapshot',
    step: 'mbs_validate_done',
    message: `Snimka #${id}: MBS redoslijed — ${mbs_order.ok ? 'OK' : mbs_order.failed_count + ' grešaka'}`,
    snapshot_id: id,
    mbs_ok: mbs_order.ok,
    mbs_failed: mbs_order.failed_count
  });

  return {
    snapshot_id: id,
    promjene: {
      skipped: promjene.skipped,
      rowCount: promjene.meta?.endpoints?.promjene?.rowCount,
      mbs_order: promjene.mbs_order
    },
    datasets,
    datasets_saved: datasets.length - skippedDatasets,
    datasets_skipped: skippedDatasets,
    mbs_order
  };
}

/**
 * Popis snimki s API-ja → za svaku puni disk (preskoči postojeće JSONL).
 * @param {{ force?: boolean, signal?: AbortSignal, snapshot_ids?: string[], onProgress?: Function }} opts
 */
async function runBulkSaveAllSnapshotsToDisk(opts = {}) {
  const t0 = Date.now();
  const apiResult = await getSnapshots({ no_data_error: '0', signal: opts.signal });
  let snapshots = normalizeSnapshotsList(apiResult.data);

  const filterIds = opts.snapshot_ids;
  if (Array.isArray(filterIds) && filterIds.length > 0) {
    const set = new Set(filterIds.map((x) => String(x)));
    snapshots = snapshots.filter((s) => set.has(String(s.id)));
  }

  snapshots.sort((a, b) => Number(a.id) - Number(b.id));

  const total = snapshots.length;
  const results = [];
  let promjeneSaved = 0;
  let promjeneSkipped = 0;
  let datasetsSaved = 0;
  let datasetsSkipped = 0;
  const errors = [];

  emitProgress(opts.onProgress, {
    phase: 'bulk',
    step: 'start',
    message: `Masovno spremanje: ${total} snimki × (promjene + ${listAllImportJobs().length} skupova)…`,
    snapshot_total: total
  });

  for (let i = 0; i < snapshots.length; i += 1) {
    const snap = snapshots[i];
    const id = String(snap.id);
    emitProgress(opts.onProgress, {
      phase: 'bulk',
      step: 'snapshot_start',
      message: `Snimka ${i + 1}/${total}: #${id}…`,
      snapshot_index: i + 1,
      snapshot_total: total,
      snapshot_id: id,
      snapshot_percent: total ? Math.round((i / total) * 100) : 0
    });

    try {
      const detail = await saveOneSnapshotToDisk(id, {
        force: opts.force,
        signal: opts.signal,
        onProgress: opts.onProgress
      });
      results.push({ ok: true, ...detail });
      if (detail.promjene.skipped) promjeneSkipped += 1;
      else promjeneSaved += 1;
      datasetsSaved += detail.datasets_saved;
      datasetsSkipped += detail.datasets_skipped;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      errors.push({ snapshot_id: id, error: err });
      results.push({ ok: false, snapshot_id: id, error: err });
      emitProgress(opts.onProgress, {
        phase: 'bulk',
        step: 'snapshot_error',
        message: `Snimka #${id}: greška — ${err}`,
        snapshot_id: id
      });
    }

    emitProgress(opts.onProgress, {
      phase: 'bulk',
      step: 'snapshot_done',
      message: `Snimka #${id}: gotovo (${i + 1}/${total}).`,
      snapshot_index: i + 1,
      snapshot_total: total,
      snapshot_id: id
    });

    if (typeof global.gc === 'function') global.gc();
  }

  const durationMs = Date.now() - t0;
  return {
    ok: errors.length === 0,
    duration_ms: durationMs,
    duration: formatDurationMs(durationMs),
    dataDir: getDataDir(),
    snapshot_count: total,
    dataset_keys: listAllImportJobs().map((j) => j.datasetKey),
    summary: {
      promjene_saved: promjeneSaved,
      promjene_skipped: promjeneSkipped,
      datasets_saved: datasetsSaved,
      datasets_skipped: datasetsSkipped,
      errors: errors.length
    },
    errors,
    snapshots: results
  };
}

module.exports = { runBulkSaveAllSnapshotsToDisk, saveOneSnapshotToDisk };
