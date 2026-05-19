/**
 * Provjera redoslijeda MBS u JSONL: numerički neopadajući + isti MBS u zarednim redovima.
 */

const fs = require('fs');
const readline = require('readline');
const { listAllImportJobs } = require('./sudregDatasets');
const { promjenePath, datasetFilePath } = require('./sudregStaging');

function toMbsInt(row) {
  if (row == null || row.mbs == null) return null;
  const n = Number(row.mbs);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function createMbsOrderValidator() {
  return {
    lineCount: 0,
    rowsWithMbs: 0,
    rowsWithoutMbs: 0,
    lastMbs: null,
    sawNonMbsSinceLastMbsRow: false,
    finishedMbs: new Set(),
    mbsCounts: new Map(),
    sortOk: true,
    groupOk: true,
    firstSortViolation: null,
    firstGroupViolation: null
  };
}

/**
 * Jedan red JSONL (samo redovi koji imaju MBS ulaze u sort/grupu provjeru).
 * @param {ReturnType<typeof createMbsOrderValidator>} state
 * @param {object} row
 * @param {number} lineNumber 1-based broj retka u datoteci
 */
function processMbsOrderRow(state, row, lineNumber) {
  state.lineCount += 1;
  const mbs = toMbsInt(row);

  if (mbs == null) {
    state.rowsWithoutMbs += 1;
    if (state.lastMbs != null) state.sawNonMbsSinceLastMbsRow = true;
    return;
  }

  state.rowsWithMbs += 1;
  state.mbsCounts.set(mbs, (state.mbsCounts.get(mbs) || 0) + 1);

  if (state.finishedMbs.has(mbs) && state.groupOk) {
    state.groupOk = false;
    state.firstGroupViolation = {
      line: lineNumber,
      mbs,
      reason: 'mbs_reappeared_after_higher_values'
    };
  }

  if (state.lastMbs != null) {
    if (mbs < state.lastMbs) {
      if (state.sortOk) {
        state.sortOk = false;
        state.firstSortViolation = {
          line: lineNumber,
          mbs,
          previous_mbs: state.lastMbs,
          reason: 'mbs_less_than_previous_integer'
        };
      }
    } else if (mbs === state.lastMbs) {
      if (state.sawNonMbsSinceLastMbsRow && state.groupOk) {
        state.groupOk = false;
        state.firstGroupViolation = {
          line: lineNumber,
          mbs,
          previous_mbs: state.lastMbs,
          reason: 'same_mbs_split_by_rows_without_mbs'
        };
      }
      state.sawNonMbsSinceLastMbsRow = false;
    } else {
      state.finishedMbs.add(state.lastMbs);
      state.lastMbs = mbs;
      state.sawNonMbsSinceLastMbsRow = false;
    }
  } else {
    state.lastMbs = mbs;
    state.sawNonMbsSinceLastMbsRow = false;
  }
}

function finalizeMbsOrderValidator(state) {
  let duplicateMbsValues = 0;
  let maxRowsPerMbs = 0;
  for (const count of state.mbsCounts.values()) {
    if (count > 1) duplicateMbsValues += 1;
    if (count > maxRowsPerMbs) maxRowsPerMbs = count;
  }
  return {
    ok: state.sortOk && state.groupOk,
    sort_ok: state.sortOk,
    group_ok: state.groupOk,
    line_count: state.lineCount,
    rows_with_mbs: state.rowsWithMbs,
    rows_without_mbs: state.rowsWithoutMbs,
    unique_mbs: state.mbsCounts.size,
    duplicate_mbs_values: duplicateMbsValues,
    max_rows_per_mbs: maxRowsPerMbs,
    first_sort_violation: state.firstSortViolation,
    first_group_violation: state.firstGroupViolation
  };
}

function mbsOrderMetaSlice(result) {
  return {
    ok: result.ok,
    sort_ok: result.sort_ok,
    group_ok: result.group_ok,
    rows_with_mbs: result.rows_with_mbs,
    unique_mbs: result.unique_mbs,
    duplicate_mbs_values: result.duplicate_mbs_values,
    first_sort_violation: result.first_sort_violation,
    first_group_violation: result.first_group_violation
  };
}

/**
 * @param {string} filePath
 * @param {{ stopOnFirstError?: boolean, signal?: AbortSignal }} [opts]
 */
async function validateMbsOrderInJsonl(filePath, opts = {}) {
  if (!filePath || !fs.existsSync(filePath)) {
    return {
      ok: false,
      skipped: true,
      reason: 'file_missing',
      filePath: filePath || null
    };
  }

  const state = createMbsOrderValidator();
  let lineNumber = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  try {
    for await (const line of rl) {
      if (opts.signal?.aborted) {
        throw new Error('Aborted');
      }
      if (!line.trim()) continue;
      lineNumber += 1;
      let row;
      try {
        row = JSON.parse(line);
      } catch (e) {
        return {
          ok: false,
          sort_ok: false,
          group_ok: false,
          filePath,
          parse_error: true,
          line: lineNumber,
          error: e instanceof Error ? e.message : String(e)
        };
      }
      processMbsOrderRow(state, row, lineNumber);
      if (opts.stopOnFirstError && !state.sortOk && !state.groupOk) break;
    }
  } finally {
    rl.close();
  }

  return { filePath, ...finalizeMbsOrderValidator(state) };
}

/**
 * promjene.jsonl + svi matični skupovi za snimku.
 * @param {string|number} snapshotId
 * @param {{ signal?: AbortSignal, onProgress?: Function }} [opts]
 */
async function validateSnapshotMbsOrder(snapshotId, opts = {}) {
  const id = String(snapshotId);
  const targets = [
    { kind: 'promjene', dataset_key: null, label: 'promjene', filePath: promjenePath(id) }
  ];
  for (const job of listAllImportJobs()) {
    targets.push({
      kind: 'dataset',
      dataset_key: job.datasetKey,
      label: job.label || job.datasetKey,
      filePath: datasetFilePath(id, job.datasetKey)
    });
  }

  const results = [];
  let allOk = true;

  for (let i = 0; i < targets.length; i += 1) {
    const t = targets[i];
    if (typeof opts.onProgress === 'function') {
      opts.onProgress({
        type: 'progress',
        phase: 'mbs_validate',
        index: i + 1,
        total: targets.length,
        dataset_key: t.dataset_key,
        message: `MBS redoslijed: ${t.label}…`
      });
    }

    const result = await validateMbsOrderInJsonl(t.filePath, { signal: opts.signal });
    const entry = {
      kind: t.kind,
      dataset_key: t.dataset_key,
      label: t.label,
      filePath: t.filePath,
      ...result
    };
    if (!result.skipped && !result.ok) allOk = false;
    results.push(entry);
  }

  const checked = results.filter((r) => !r.skipped);
  const failed = checked.filter((r) => !r.ok);

  return {
    ok: allOk,
    snapshot_id: id,
    checked_count: checked.length,
    failed_count: failed.length,
    results
  };
}

module.exports = {
  toMbsInt,
  createMbsOrderValidator,
  processMbsOrderRow,
  finalizeMbsOrderValidator,
  mbsOrderMetaSlice,
  validateMbsOrderInJsonl,
  validateSnapshotMbsOrder
};
