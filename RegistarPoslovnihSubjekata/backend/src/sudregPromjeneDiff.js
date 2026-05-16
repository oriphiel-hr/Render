/**
 * Usporedba /promjene između dviju snimki pomoću SCN-a.
 * Nakon dohvata cijeli set se sortira po mbs; diff je po SCN-u.
 * @see Upute za razvojne inženjere v3.0.0
 */

const { getPromjene } = require('./sudregApi');

const FULL_FETCH_PAGE_LIMIT = 1000;

function normalizePromjeneArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function parseHeaderInt(value) {
  if (value == null || value === '') return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function toScn(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toMbsNum(row) {
  if (row.mbs == null) return null;
  const n = Number(row.mbs);
  return Number.isFinite(n) ? n : null;
}

/** Numerički sort po mbs prije SCN usporedbe. */
function sortPromjeneByMbs(rows) {
  return rows.slice().sort((a, b) => {
    const ma = toMbsNum(a);
    const mb = toMbsNum(b);
    if (ma == null && mb == null) return 0;
    if (ma == null) return 1;
    if (mb == null) return -1;
    return ma - mb;
  });
}

/**
 * Strujni čitač sortiranog /promjene (stranica po stranica, bez učitavanja cijelog seta u RAM).
 */
class PromjeneSortedReader {
  constructor(snapshotId, opts = {}) {
    this.snapshotId = String(snapshotId);
    this.opts = opts;
    this.limit = FULL_FETCH_PAGE_LIMIT;
    this.offset = 0;
    this.buffer = [];
    this.bufferIdx = 0;
    this.pages = 0;
    this.totalCount = null;
    this.rowsRead = 0;
    this.done = false;
  }

  async loadNextPage() {
    const result = await getPromjene({
      snapshot_id: this.snapshotId,
      offset: this.offset,
      limit: this.limit,
      no_data_error: this.opts.no_data_error ?? '0',
      omit_nulls: this.opts.omit_nulls,
      signal: this.opts.signal
    });
    this.pages += 1;
    if (this.totalCount == null) {
      this.totalCount = parseHeaderInt(result.meta?.xTotalCount);
    }
    const chunk = normalizePromjeneArray(result.data);
    this.buffer = chunk;
    this.bufferIdx = 0;
    this.rowsRead += chunk.length;

    if (chunk.length === 0) {
      this.done = true;
      return;
    }
    // Sudreg: offset = 0-based indeks prvog retka; sljedeći = prethodni + broj primljenih redaka
    this.offset += chunk.length;
    if (this.totalCount != null && this.rowsRead >= this.totalCount) this.done = true;
    if (chunk.length < this.limit) this.done = true;
  }

  async peek() {
    while (this.bufferIdx >= this.buffer.length && !this.done) {
      await this.loadNextPage();
    }
    return this.bufferIdx < this.buffer.length ? this.buffer[this.bufferIdx] : null;
  }

  async advance() {
    const row = await this.peek();
    if (row) this.bufferIdx += 1;
    return row;
  }

  assertComplete() {
    if (this.totalCount != null && this.rowsRead < this.totalCount) {
      throw new Error(
        `Nepotpun set /promjene za snapshot_id=${this.snapshotId}: dohvaćeno ${this.rowsRead}, očekivano ${this.totalCount}.`
      );
    }
  }
}

/** Čitač već učitanog sortiranog niza (npr. s diska). */
class PromjeneArrayReader {
  constructor(rows, snapshotId, totalCount) {
    this.snapshotId = String(snapshotId);
    this.buffer = rows;
    this.bufferIdx = 0;
    this.pages = 1;
    this.rowsRead = rows.length;
    this.totalCount = totalCount != null ? totalCount : rows.length;
    this.done = false;
  }

  async peek() {
    return this.bufferIdx < this.buffer.length ? this.buffer[this.bufferIdx] : null;
  }

  async advance() {
    const row = await this.peek();
    if (row) this.bufferIdx += 1;
    return row;
  }

  assertComplete() {}
}

function indexPromjeneByMbs(rows) {
  const byMbs = new Map();
  for (const row of rows) {
    if (row.mbs == null) continue;
    const mbs = String(row.mbs);
    const scn = toScn(row.scn);
    if (scn == null) continue;
    const prev = byMbs.get(mbs);
    if (!prev || scn > toScn(prev.scn)) byMbs.set(mbs, row);
  }
  return byMbs;
}

function filterPromjeneDiff(baselineByMbs, targetRows) {
  const diff = [];
  for (const row of targetRows) {
    if (row.mbs == null) continue;
    const mbs = String(row.mbs);
    const newScn = toScn(row.scn);
    if (newScn == null) continue;
    const baseline = baselineByMbs.get(mbs);
    if (!baseline) {
      diff.push(row);
      continue;
    }
    const oldScn = toScn(baseline.scn);
    if (oldScn != null && newScn > oldScn) diff.push(row);
  }
  return diff;
}

/** Dohvat cijelog seta (test / rezervni put). */
async function fetchAllPromjene(snapshotId, opts = {}) {
  const reader = new PromjeneSortedReader(snapshotId, opts);
  const rows = [];
  while (true) {
    const row = await reader.advance();
    if (!row) break;
    rows.push(row);
  }
  reader.assertComplete();

  const totalCount = reader.totalCount ?? rows.length;
  if (rows.length !== totalCount) {
    throw new Error(
      `Sudreg /promjene snapshot_id=${snapshotId}: dohvaćeno ${rows.length} redaka, X-Total-Count=${totalCount} — provjeri offset/limit.`
    );
  }

  const sorted = sortPromjeneByMbs(rows);
  return {
    rows: sorted,
    pages: reader.pages,
    totalCount,
    complete: true,
    sortedByMbs: true,
    meta: { lastOffsetUsed: reader.offset }
  };
}

async function comparePromjeneWithReaders(oldReader, newReader, fromId, toId) {
  const diff = [];
  let newCount = 0;
  let updatedCount = 0;
  let oldRow = await oldReader.peek();
  let newRow = await newReader.peek();

  function pushDiff(row, vrsta, scnStaro = null) {
    const item = { ...row, vrsta };
    if (vrsta === 'promjena' && scnStaro != null) item.scn_staro = scnStaro;
    diff.push(item);
    if (vrsta === 'novi') newCount += 1;
    else updatedCount += 1;
  }

  while (oldRow || newRow) {
    if (!oldRow) {
      pushDiff(await newReader.advance(), 'novi');
      newRow = await newReader.peek();
      continue;
    }
    if (!newRow) {
      await oldReader.advance();
      oldRow = await oldReader.peek();
      continue;
    }

    const om = toMbsNum(oldRow);
    const nm = toMbsNum(newRow);

    if (om == null) {
      await oldReader.advance();
      oldRow = await oldReader.peek();
      continue;
    }
    if (nm == null) {
      await newReader.advance();
      newRow = await newReader.peek();
      continue;
    }

    if (om < nm) {
      await oldReader.advance();
      oldRow = await oldReader.peek();
    } else if (nm < om) {
      pushDiff(await newReader.advance(), 'novi');
      newRow = await newReader.peek();
    } else {
      const newScn = toScn(newRow.scn);
      const oldScn = toScn(oldRow.scn);
      if (newScn != null && oldScn != null && newScn > oldScn) {
        pushDiff(newRow, 'promjena', oldScn);
      }
      await oldReader.advance();
      await newReader.advance();
      oldRow = await oldReader.peek();
      newRow = await newReader.peek();
    }
  }

  oldReader.assertComplete();
  newReader.assertComplete();

  return {
    compare: {
      snapshot_id_from: fromId,
      snapshot_id_to: toId,
      algorithm: 'scn_merge_by_mbs',
      fullSets: true,
      description:
        'Usporedba po mbs + SCN: novi (MBS samo u novijoj snimci) | promjena (isti MBS, veći SCN). scn_staro samo kod promjene.'
    },
    stats: {
      baselineRows: oldReader.rowsRead,
      baselineTotalCount: oldReader.totalCount,
      baselinePages: oldReader.pages,
      targetRows: newReader.rowsRead,
      targetTotalCount: newReader.totalCount,
      targetPages: newReader.pages,
      diffRows: diff.length,
      noviZapisi: newCount,
      promjene: updatedCount
    },
    data: diff
  };
}

/**
 * Usporedba cijelih setova: merge po mbs (API ili pred učitani nizovi s diska).
 */
async function comparePromjeneSnapshots(params) {
  const fromId = String(params.snapshot_id_from);
  const toId = String(params.snapshot_id_to);

  let baselineRows;
  let targetRows;
  let baselinePages;
  let targetPages;
  let baselineTotal;
  let targetTotal;

  if (params.baseline_rows && params.target_rows) {
    baselineRows = sortPromjeneByMbs(params.baseline_rows);
    targetRows = sortPromjeneByMbs(params.target_rows);
    baselinePages = 1;
    targetPages = 1;
    baselineTotal = params.baseline_totalCount ?? baselineRows.length;
    targetTotal = params.target_totalCount ?? targetRows.length;
  } else {
    const [baseline, target] = await Promise.all([
      fetchAllPromjene(fromId, {
        no_data_error: '0',
        omit_nulls: params.omit_nulls,
        signal: params.signal
      }),
      fetchAllPromjene(toId, {
        no_data_error: '0',
        omit_nulls: params.omit_nulls,
        signal: params.signal
      })
    ]);
    baselineRows = baseline.rows;
    targetRows = target.rows;
    baselinePages = baseline.pages;
    targetPages = target.pages;
    baselineTotal = baseline.totalCount;
    targetTotal = target.totalCount;
  }

  const oldReader = new PromjeneArrayReader(baselineRows, fromId, baselineTotal);
  const newReader = new PromjeneArrayReader(targetRows, toId, targetTotal);
  oldReader.pages = baselinePages;
  newReader.pages = targetPages;

  return comparePromjeneWithReaders(oldReader, newReader, fromId, toId);
}

module.exports = {
  FULL_FETCH_PAGE_LIMIT,
  PromjeneSortedReader,
  PromjeneArrayReader,
  comparePromjeneWithReaders,
  normalizePromjeneArray,
  sortPromjeneByMbs,
  indexPromjeneByMbs,
  filterPromjeneDiff,
  fetchAllPromjene,
  comparePromjeneSnapshots
};
