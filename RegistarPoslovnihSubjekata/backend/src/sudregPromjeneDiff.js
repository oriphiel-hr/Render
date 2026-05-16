/**
 * Usporedba /promjene između dviju snimki pomoću SCN-a.
 *
 * API vraća retke poredane po mbs (rastuće). Usporedba ide merge-joinom po mbs
 * (dva pokazivača kroz stranice), NE istim offsetom — novi MBS u novoj snimci
 * pomaknuo bi redove i offset-pariranje bi bilo krivo.
 *
 * @see Upute za razvojne inženjere v3.0.0 — "Notifikacije o promjenama i detekcija promjena"
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

function assertSortedByMbs(rows, snapshotId, pageIndex) {
  for (let i = 1; i < rows.length; i += 1) {
    const prev = toMbsNum(rows[i - 1]);
    const cur = toMbsNum(rows[i]);
    if (prev != null && cur != null && cur < prev) {
      throw new Error(
        `Sudreg /promjene snapshot_id=${snapshotId} stranica ${pageIndex} nije poredana po mbs — merge usporedba nije moguća.`
      );
    }
  }
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
    assertSortedByMbs(chunk, this.snapshotId, this.pages);
    this.buffer = chunk;
    this.bufferIdx = 0;
    this.rowsRead += chunk.length;

    if (chunk.length === 0) {
      this.done = true;
      return;
    }
    this.offset += this.limit;
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
  return {
    rows,
    pages: reader.pages,
    totalCount: reader.totalCount ?? rows.length,
    complete: true,
    meta: {}
  };
}

/**
 * Usporedba cijelih setova: merge po mbs kroz sve stranice obje snimke.
 */
async function comparePromjeneSnapshots(params) {
  const fromId = String(params.snapshot_id_from);
  const toId = String(params.snapshot_id_to);

  const oldReader = new PromjeneSortedReader(fromId, {
    no_data_error: '0',
    omit_nulls: params.omit_nulls,
    signal: params.signal
  });
  const newReader = new PromjeneSortedReader(toId, {
    no_data_error: '0',
    omit_nulls: params.omit_nulls,
    signal: params.signal
  });

  const diff = [];
  let newCount = 0;
  let updatedCount = 0;
  let oldPos = 0;
  let newPos = 0;
  let oldRow = await oldReader.peek();
  let newRow = await newReader.peek();

  function pushDiff(row, vrsta, meta = {}) {
    const item = { ...row, vrsta };
    if (meta.pozicija_staro != null) item.pozicija_staro = meta.pozicija_staro;
    if (meta.pozicija_novo != null) item.pozicija_novo = meta.pozicija_novo;
    if (meta.pomak != null) item.pomak = meta.pomak;
    if (meta.scn_staro != null) item.scn_staro = meta.scn_staro;
    if (meta.scn_pomak != null) item.scn_pomak = meta.scn_pomak;
    diff.push(item);
    if (vrsta === 'novi') newCount += 1;
    else updatedCount += 1;
  }

  while (oldRow || newRow) {
    if (!oldRow) {
      pushDiff(await newReader.advance(), 'novi', { pozicija_novo: newPos });
      newPos += 1;
      newRow = await newReader.peek();
      continue;
    }
    if (!newRow) {
      await oldReader.advance();
      oldPos += 1;
      oldRow = await oldReader.peek();
      continue;
    }

    const om = toMbsNum(oldRow);
    const nm = toMbsNum(newRow);

    if (om == null) {
      await oldReader.advance();
      oldPos += 1;
      oldRow = await oldReader.peek();
      continue;
    }
    if (nm == null) {
      await newReader.advance();
      newPos += 1;
      newRow = await newReader.peek();
      continue;
    }

    if (om < nm) {
      await oldReader.advance();
      oldPos += 1;
      oldRow = await oldReader.peek();
    } else if (nm < om) {
      pushDiff(await newReader.advance(), 'novi', {
        pozicija_novo: newPos,
        pomak: newPos - oldPos
      });
      newPos += 1;
      newRow = await newReader.peek();
    } else {
      const newScn = toScn(newRow.scn);
      const oldScn = toScn(oldRow.scn);
      if (newScn != null && oldScn != null && newScn > oldScn) {
        pushDiff(newRow, 'promjena', {
          pozicija_staro: oldPos,
          pozicija_novo: newPos,
          pomak: newPos - oldPos,
          scn_staro: oldScn,
          scn_pomak: newScn - oldScn
        });
      }
      await oldReader.advance();
      await newReader.advance();
      oldPos += 1;
      newPos += 1;
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
        'Merge po mbs. vrsta: novi | promjena. pomak = pozicija_novo − pozicija_staro (0-based indeks u sortiranom /promjene). scn_pomak = scn − scn_staro.'
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

module.exports = {
  FULL_FETCH_PAGE_LIMIT,
  PromjeneSortedReader,
  normalizePromjeneArray,
  indexPromjeneByMbs,
  filterPromjeneDiff,
  fetchAllPromjene,
  comparePromjeneSnapshots
};
