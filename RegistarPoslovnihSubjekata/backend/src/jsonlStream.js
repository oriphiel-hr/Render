/**
 * JSONL stream — bez učitavanja cijele datoteke u RAM.
 */

const fs = require('fs');
const readline = require('readline');

function closeWriteStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.end(() => resolve());
  });
}

/**
 * @param {string} filePath
 * @param {number} batchSize
 * @param {(rows: object[], linesSoFar: number) => Promise<void>} onBatch
 */
async function forEachJsonlBatch(filePath, batchSize, onBatch) {
  if (!fs.existsSync(filePath)) {
    return { lineCount: 0 };
  }
  let lineCount = 0;
  let batch = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    batch.push(JSON.parse(line));
    lineCount += 1;
    if (batch.length >= batchSize) {
      await onBatch(batch, lineCount);
      batch = [];
    }
  }
  if (batch.length > 0) {
    await onBatch(batch, lineCount);
  }
  return { lineCount };
}

module.exports = {
  closeWriteStream,
  forEachJsonlBatch
};
