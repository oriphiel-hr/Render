/**
 * Diff matičnih skupova po MBS iz promjene.jsonl (novi | promjena | neaktivan).
 * Neaktivan: red iz starije snimke (subjekti samo aktivni u novijoj) → status/aktivan = 0.
 */

const fs = require('fs');
const { listAllImportJobs } = require('./sudregDatasets');
const { forEachJsonlBatch, closeWriteStream } = require('./jsonlStream');
const { getBatchSize } = require('./lib/prisma');
const {
  diffPromjenePath,
  diffMetaPath,
  diffDir,
  diffDatasetsDir,
  diffDatasetFilePath,
  diffDatasetMetaPath,
  diffDatasetFileExists,
  readJson,
  writeJson
} = require('./sudregStaging');
const {
  toMbs,
  markNeaktivan,
  markRowNeaktivan,
  rowKeyForRow,
  appendNeaktivniToAffected,
  indexDatasetRowsByMbs,
  indexDatasetRowsByMbsFromDb,
  SUBJEKTI_KEY
} = require('./sudregTempApply');

function releaseMemory() {
  if (typeof global.gc === 'function') global.gc();
}

/** Jedan matični skup za zadani snapshot — samo MBS iz diff-a (ograničen RAM). */
async function loadDatasetBucketForMbs(snapshotId, datasetKey, mbsFilter) {
  const disk = await indexDatasetRowsByMbs(snapshotId, datasetKey, mbsFilter);
  let byMbs = disk.byMbs;
  let source = disk.source;
  if (byMbs.size === 0) {
    const db = await indexDatasetRowsByMbsFromDb(snapshotId, datasetKey, mbsFilter);
    byMbs = db.byMbs;
    source = db.source;
  }
  return {
    byMbs,
    sourceLabel: source ? `${datasetKey}:${source}` : null
  };
}

function batchSize() {
  return getBatchSize();
}

/** Polja koja ne ulaze u usporedbu sadržaja (meta diff / SCN). */
const DIFF_ONLY_KEYS = new Set([
  'vrsta',
  'aktivan',
  'row_key',
  'scn',
  'scn_staro',
  '_temp'
]);

function stableValue(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(stableValue);
  const o = {};
  for (const k of Object.keys(v).sort()) {
    o[k] = stableValue(v[k]);
  }
  return o;
}

/** Kanonski JSON za usporedbu — samo poslovni sadržaj retka. */
function canonicalRowContent(row) {
  if (!row || typeof row !== 'object') return '';
  const copy = {};
  for (const [k, v] of Object.entries(row)) {
    if (DIFF_ONLY_KEYS.has(k)) continue;
    copy[k] = v;
  }
  return JSON.stringify(stableValue(copy));
}

function rowsContentEqual(a, b) {
  return canonicalRowContent(a) === canonicalRowContent(b);
}

function indexRowsByKey(rows) {
  const map = new Map();
  for (let i = 0; i < rows.length; i++) {
    map.set(rowKeyForRow(rows[i], i), rows[i]);
  }
  return map;
}

function wrapDiffRecord(row, mbs, vrsta, rowKey) {
  const aktivVal =
    row.aktivan != null
      ? Number(row.aktivan)
      : row.status != null
        ? Number(row.status) === 1
          ? 1
          : 0
        : vrsta === 'neaktivan' || vrsta === 'obrisan'
          ? 0
          : 1;
  return {
    ...row,
    mbs,
    vrsta,
    aktiv: Number.isFinite(aktivVal) ? aktivVal : vrsta === 'neaktivan' || vrsta === 'obrisan' ? 0 : 1,
    row_key: rowKey
  };
}

/**
 * @param {string} diffFile
 * @returns {Promise<Map<number, { vrsta: string, promjenaJson: object|null, baselineRow?: object }>>}
 */
async function loadAffectedFromPromjeneDiff(diffFile) {
  const affected = new Map();
  await forEachJsonlBatch(diffFile, batchSize(), async (rows) => {
    for (const row of rows) {
      const vrsta = row.vrsta ? String(row.vrsta) : '';
      if (vrsta !== 'novi' && vrsta !== 'promjena') continue;
      const mbs = toMbs(row);
      if (mbs == null) continue;
      affected.set(mbs, { vrsta, promjenaJson: row });
    }
  });
  return affected;
}

/**
 * JSONL redovi za jedan MBS i jedan matični skup — samo ako se sadržaj stvarno promijenio.
 * @returns {{ records: object[], skippedUnchanged: number }}
 */
function buildDiffRecordsForMbs(mbs, vrsta, info, datasetKey, fromBucket, toBucket) {
  const fromRows = fromBucket.get(mbs) || [];
  const toRows = toBucket.get(mbs) || [];
  const records = [];
  let skippedUnchanged = 0;
  const isNeaktivan = vrsta === 'neaktivan';

  if (isNeaktivan) {
    let sourceRows;
    if (datasetKey === SUBJEKTI_KEY && info.baselineRow) {
      sourceRows = [info.baselineRow];
    } else {
      sourceRows = fromRows.length > 0 ? fromRows : toRows;
    }
    for (let i = 0; i < sourceRows.length; i++) {
      const row = sourceRows[i];
      const payload =
        datasetKey === SUBJEKTI_KEY ? markNeaktivan(row) : markRowNeaktivan(row);
      const rk = rowKeyForRow(row, i);
      records.push({
        ...payload,
        mbs,
        vrsta: 'neaktivan',
        aktivan: 0,
        row_key: rk
      });
    }
    return { records, skippedUnchanged: 0 };
  }

  const fromMap = indexRowsByKey(fromRows);
  const toMap = indexRowsByKey(toRows);
  const allKeys = new Set([...fromMap.keys(), ...toMap.keys()]);

  for (const rk of allKeys) {
    const fr = fromMap.get(rk);
    const tr = toMap.get(rk);

    if (fr && tr) {
      if (rowsContentEqual(fr, tr)) {
        skippedUnchanged += 1;
        continue;
      }
      records.push(wrapDiffRecord(tr, mbs, 'promjena', rk));
    } else if (tr && !fr) {
      records.push(wrapDiffRecord(tr, mbs, 'novi', rk));
    } else if (fr && !tr) {
      const payload =
        datasetKey === SUBJEKTI_KEY ? markNeaktivan(fr) : markRowNeaktivan(fr);
      records.push({
        ...payload,
        mbs,
        vrsta: 'obrisan',
        aktivan: 0,
        row_key: rk
      });
    }
  }

  return { records, skippedUnchanged };
}

/**
 * Zapis JSONL diff matičnih skupova za par snimki (koristi postojeći promjene diff).
 * @param {string|number} fromId
 * @param {string|number} toId
 * @param {{ force?: boolean, signal?: AbortSignal, onProgress?: Function, jobs?: Array }} [opts]
 */
async function saveMaticniDiffsToDisk(fromId, toId, opts = {}) {
  const from = String(fromId);
  const to = String(toId);
  const diffFile = diffPromjenePath(from, to);

  if (!fs.existsSync(diffFile)) {
    throw new Error(
      `promjene diff ne postoji (${diffFile}). Prvo generiraj SCN diff (save-diff ili Diff susjednih snimki).`
    );
  }

  const jobs = opts.jobs || listAllImportJobs();
  const force = opts.force === true || opts.force === '1';
  const allExist =
    !force && jobs.length > 0 && jobs.every((j) => diffDatasetFileExists(from, to, j.datasetKey));

  if (allExist) {
    const meta = fs.existsSync(diffMetaPath(from, to)) ? readJson(diffMetaPath(from, to)) : {};
    return {
      ok: true,
      skipped: true,
      snapshot_id_from: from,
      snapshot_id_to: to,
      dir: diffDir(from, to),
      datasets: meta.datasets || null
    };
  }

  const t0 = Date.now();
  let affected = await loadAffectedFromPromjeneDiff(diffFile);
  const inactive = await appendNeaktivniToAffected(from, to, affected);

  const mbsFilter = new Set(affected.keys());
  if (mbsFilter.size === 0) {
    return {
      ok: true,
      skipped: true,
      reason: 'no_mbs',
      snapshot_id_from: from,
      snapshot_id_to: to,
      neaktivniCount: 0
    };
  }

  fs.mkdirSync(diffDatasetsDir(from, to), { recursive: true });

  const datasetResults = [];
  const sourcesFrom = [];
  const sourcesTo = [];
  let jobIndex = 0;

  for (const job of jobs) {
    jobIndex += 1;
    const key = job.datasetKey;
    const outFile = diffDatasetFilePath(from, to, key);

    if (!force && diffDatasetFileExists(from, to, key)) {
      const existingMeta = fs.existsSync(diffDatasetMetaPath(from, to, key))
        ? readJson(diffDatasetMetaPath(from, to, key))
        : null;
      datasetResults.push({
        dataset_key: key,
        skipped: true,
        rowCount: existingMeta?.rowCount ?? null,
        filePath: outFile
      });
      continue;
    }

    if (typeof opts.onProgress === 'function') {
      opts.onProgress({
        type: 'progress',
        phase: 'maticni_diff',
        step: 'dataset',
        message: `Diff matični: ${key} (${jobIndex}/${jobs.length}) — indeks…`,
        dataset_key: key,
        job_index: jobIndex,
        job_total: jobs.length
      });
    }

    const fromBucket = await loadDatasetBucketForMbs(from, key, mbsFilter);
    if (fromBucket.sourceLabel) sourcesFrom.push(fromBucket.sourceLabel);
    const toBucket = await loadDatasetBucketForMbs(to, key, mbsFilter);
    if (toBucket.sourceLabel) sourcesTo.push(toBucket.sourceLabel);

    const stream = fs.createWriteStream(outFile, { flags: 'w', encoding: 'utf8' });
    let rowCount = 0;
    let neaktivniRows = 0;
    let skippedUnchanged = 0;
    let mbsWithChanges = 0;
    const mbsTotal = affected.size;
    let mbsProcessed = 0;
    const mbsProgressEvery = 1500;

    for (const [mbs, info] of affected) {
      mbsProcessed += 1;
      if (
        typeof opts.onProgress === 'function' &&
        (mbsProcessed === 1 || mbsProcessed % mbsProgressEvery === 0 || mbsProcessed === mbsTotal)
      ) {
        opts.onProgress({
          type: 'progress',
          phase: 'maticni_diff',
          step: 'mbs',
          message: `Diff matični ${key}: MBS ${mbsProcessed.toLocaleString('hr-HR')}/${mbsTotal.toLocaleString('hr-HR')}…`,
          dataset_key: key,
          mbs_processed: mbsProcessed,
          mbs_total: mbsTotal
        });
      }
      if (opts.signal?.aborted) {
        stream.destroy();
        throw new Error('Aborted');
      }
      const { records, skippedUnchanged: skipped } = buildDiffRecordsForMbs(
        mbs,
        info.vrsta,
        info,
        key,
        fromBucket.byMbs,
        toBucket.byMbs
      );
      skippedUnchanged += skipped;
      if (records.length === 0) continue;
      mbsWithChanges += 1;
      for (const rec of records) {
        stream.write(`${JSON.stringify(rec)}\n`);
        rowCount += 1;
        if (rec.vrsta === 'neaktivan' || rec.vrsta === 'obrisan') neaktivniRows += 1;
      }
    }

    await closeWriteStream(stream);

    const dsMeta = {
      snapshot_id_from: from,
      snapshot_id_to: to,
      dataset_key: key,
      label: job.label,
      saved_at: new Date().toISOString(),
      rowCount,
      neaktivni_rows: neaktivniRows,
      mbs_count: mbsFilter.size,
      mbs_with_changes: mbsWithChanges,
      rows_skipped_unchanged: skippedUnchanged,
      only_content_changes: true,
      file: `${String(key).replace(/[^a-zA-Z0-9._-]+/g, '_')}.jsonl`
    };
    writeJson(diffDatasetMetaPath(from, to, key), dsMeta);

    datasetResults.push({
      dataset_key: key,
      skipped: false,
      rowCount,
      neaktivni_rows: neaktivniRows,
      mbs_with_changes: mbsWithChanges,
      rows_skipped_unchanged: skippedUnchanged,
      filePath: outFile
    });

    releaseMemory();
  }

  let diffMeta = {};
  const mp = diffMetaPath(from, to);
  if (fs.existsSync(mp)) {
    try {
      diffMeta = readJson(mp);
    } catch (_) {
      diffMeta = {};
    }
  }
  diffMeta.datasets = {
    saved_at: new Date().toISOString(),
    duration_ms: Date.now() - t0,
    mbs_count: mbsFilter.size,
    promjene_diff_rows: affected.size,
    neaktivni_mbs: inactive.neaktivniCount,
    sources: {
      from: sourcesFrom,
      to: sourcesTo
    },
    memory_mode: 'per_dataset_sequential',
    items: datasetResults
  };
  if (!diffMeta.files) diffMeta.files = { promjene: 'promjene.jsonl', meta: 'meta.json' };
  diffMeta.files.datasets = 'datasets/';
  writeJson(mp, diffMeta);

  return {
    ok: true,
    skipped: false,
    snapshot_id_from: from,
    snapshot_id_to: to,
    dir: diffDir(from, to),
    duration_ms: Date.now() - t0,
    mbs_count: mbsFilter.size,
    neaktivni_mbs: inactive.neaktivniCount,
    datasets: datasetResults
  };
}

module.exports = {
  loadAffectedFromPromjeneDiff,
  buildDiffRecordsForMbs,
  canonicalRowContent,
  rowsContentEqual,
  saveMaticniDiffsToDisk
};
