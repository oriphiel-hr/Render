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
  indexAllDatasetsForMbs,
  SUBJEKTI_KEY
} = require('./sudregTempApply');

function batchSize() {
  return getBatchSize();
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
 * JSONL redovi za jedan MBS i jedan matični skup.
 */
function buildDiffRecordsForMbs(mbs, vrsta, info, datasetKey, fromByMbs, toByMbs) {
  const fromRows = fromByMbs.get(datasetKey)?.get(mbs) || [];
  const toRows = toByMbs.get(datasetKey)?.get(mbs) || [];
  const records = [];
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
      records.push({
        ...payload,
        mbs,
        vrsta,
        aktivan: 0,
        row_key: rowKeyForRow(row, i)
      });
    }
    return records;
  }

  const sourceRows = toRows.length > 0 ? toRows : fromRows;
  for (let i = 0; i < sourceRows.length; i++) {
    const row = sourceRows[i];
    const aktiv =
      row.aktivan != null
        ? Number(row.aktivan)
        : row.status != null
          ? Number(row.status) === 1
            ? 1
            : 0
          : 1;
    records.push({
      ...row,
      mbs,
      vrsta,
      aktivan: Number.isFinite(aktivan) ? aktiv : 1,
      row_key: rowKeyForRow(row, i)
    });
  }
  return records;
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

  if (typeof opts.onProgress === 'function') {
    opts.onProgress({
      type: 'progress',
      phase: 'maticni_diff',
      step: 'index',
      message: `Indeks matičnih skupova za ${mbsFilter.size.toLocaleString('hr-HR')} MBS…`
    });
  }

  const [fromIndexed, toIndexed] = await Promise.all([
    indexAllDatasetsForMbs(from, mbsFilter, jobs),
    indexAllDatasetsForMbs(to, mbsFilter, jobs)
  ]);

  fs.mkdirSync(diffDatasetsDir(from, to), { recursive: true });

  const datasetResults = [];
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
        message: `Diff matični: ${key} (${jobIndex}/${jobs.length})…`,
        dataset_key: key,
        job_index: jobIndex,
        job_total: jobs.length
      });
    }

    const stream = fs.createWriteStream(outFile, { flags: 'w', encoding: 'utf8' });
    let rowCount = 0;
    let neaktivniRows = 0;

    for (const [mbs, info] of affected) {
      if (opts.signal?.aborted) {
        stream.destroy();
        throw new Error('Aborted');
      }
      const records = buildDiffRecordsForMbs(
        mbs,
        info.vrsta,
        info,
        key,
        fromIndexed.index,
        toIndexed.index
      );
      for (const rec of records) {
        stream.write(`${JSON.stringify(rec)}\n`);
        rowCount += 1;
        if (info.vrsta === 'neaktivan') neaktivniRows += 1;
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
      file: `${String(key).replace(/[^a-zA-Z0-9._-]+/g, '_')}.jsonl`
    };
    writeJson(diffDatasetMetaPath(from, to, key), dsMeta);

    datasetResults.push({
      dataset_key: key,
      skipped: false,
      rowCount,
      neaktivni_rows: neaktivniRows,
      filePath: outFile
    });
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
      from: fromIndexed.sources,
      to: toIndexed.sources
    },
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
  saveMaticniDiffsToDisk
};
