/**
 * Masovno generiranje diff mapa za susjedne snapshot_id (n → n+1).
 * Isti SCN diff kao /promjene/diff → diffs/{from}_to_{to}/promjene.jsonl + meta.json.
 */

const fs = require('fs');
const { getSnapshots } = require('./sudregApi');
const { listStaging, savePromjeneDiff, getDataDir } = require('./sudregStaging');

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

function snapshotIdsFromDisk() {
  const { snapshots } = listStaging();
  return snapshots
    .map((s) => Number(s.snapshot_id))
    .filter((n) => Number.isFinite(n));
}

async function snapshotIdsFromApi(opts = {}) {
  const apiResult = await getSnapshots({ no_data_error: '0', signal: opts.signal });
  const list = normalizeSnapshotsList(apiResult.data);
  return list.map((s) => Number(s.id)).filter((n) => Number.isFinite(n));
}

/**
 * Uzastopni parovi (sortirano po ID).
 * @param {number[]} ids
 */
function buildAdjacentPairs(ids) {
  const sorted = [...new Set(ids)].filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  const pairs = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    pairs.push({ snapshot_id_from: String(sorted[i]), snapshot_id_to: String(sorted[i + 1]) });
  }
  return pairs;
}

/**
 * @param {{ source?: 'disk'|'api', force?: boolean, save_snapshots?: boolean, signal?: AbortSignal, snapshot_ids?: string[], onProgress?: Function }} opts
 */
async function runSaveAdjacentPromjeneDiffs(opts = {}) {
  const t0 = Date.now();
  const source = opts.source === 'disk' ? 'disk' : 'api';

  let ids =
    source === 'disk' ? snapshotIdsFromDisk() : await snapshotIdsFromApi(opts);

  const filterIds = opts.snapshot_ids;
  if (Array.isArray(filterIds) && filterIds.length > 0) {
    const set = new Set(filterIds.map((x) => Number(x)).filter((n) => Number.isFinite(n)));
    ids = ids.filter((n) => set.has(n));
  }

  const pairs = buildAdjacentPairs(ids);
  const results = [];
  let saved = 0;
  let skipped = 0;
  const errors = [];

  emitProgress(opts.onProgress, {
    phase: 'adjacent_diff',
    step: 'start',
    message: `Susjedni diff: ${pairs.length} parova (iz ${ids.length} snimki, izvor ${source})…`,
    pair_total: pairs.length,
    snapshot_count: ids.length,
    source
  });

  for (let i = 0; i < pairs.length; i += 1) {
    const { snapshot_id_from: fromId, snapshot_id_to: toId } = pairs[i];
    emitProgress(opts.onProgress, {
      phase: 'adjacent_diff',
      step: 'pair_start',
      message: `Diff ${i + 1}/${pairs.length}: #${fromId} → #${toId}…`,
      pair_index: i + 1,
      pair_total: pairs.length,
      snapshot_id_from: fromId,
      snapshot_id_to: toId
    });

    try {
      const detail = await savePromjeneDiff(fromId, toId, {
        force: opts.force,
        save_snapshots: opts.save_snapshots !== false,
        prefer_disk: true,
        signal: opts.signal,
        onProgress: opts.onProgress
      });
      results.push({ ok: true, ...detail });
      if (detail.skipped) skipped += 1;
      else saved += 1;

      emitProgress(opts.onProgress, {
        phase: 'adjacent_diff',
        step: 'pair_done',
        message: `#${fromId} → #${toId}: ${detail.skipped ? 'preskočeno' : (detail.diffRows ?? '?') + ' diff redova'}`,
        pair_index: i + 1,
        pair_total: pairs.length,
        snapshot_id_from: fromId,
        snapshot_id_to: toId,
        skipped: Boolean(detail.skipped),
        diff_rows: detail.diffRows
      });
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      errors.push({ snapshot_id_from: fromId, snapshot_id_to: toId, error: err });
      results.push({
        ok: false,
        snapshot_id_from: fromId,
        snapshot_id_to: toId,
        error: err
      });
      emitProgress(opts.onProgress, {
        phase: 'adjacent_diff',
        step: 'pair_error',
        message: `#${fromId} → #${toId}: greška — ${err}`,
        snapshot_id_from: fromId,
        snapshot_id_to: toId
      });
    }

    if (typeof global.gc === 'function') global.gc();
  }

  const durationMs = Date.now() - t0;
  return {
    ok: errors.length === 0,
    duration_ms: durationMs,
    duration: formatDurationMs(durationMs),
    dataDir: getDataDir(),
    source,
    snapshot_count: ids.length,
    pair_count: pairs.length,
    summary: {
      saved,
      skipped,
      errors: errors.length
    },
    errors,
    pairs: results
  };
}

module.exports = {
  buildAdjacentPairs,
  runSaveAdjacentPromjeneDiffs
};
