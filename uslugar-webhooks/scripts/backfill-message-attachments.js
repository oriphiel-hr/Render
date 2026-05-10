#!/usr/bin/env node
const { prisma } = require('../src/lib/prisma');
const { backfillMessageAttachments } = require('../src/services/attachmentBackfill');

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    force: args.has('--force'),
    dryRun: args.has('--dry-run')
  };
}

async function main() {
  const { force, dryRun } = parseArgs(process.argv);
  console.log(`[backfill] start force=${force} dryRun=${dryRun}`);
  const result = await backfillMessageAttachments({
    force,
    dryRun,
    prisma,
    onProgress: ({ scanned, updated, inserted }) => {
      console.log(`[backfill] scanned=${scanned} updated=${updated} inserted=${inserted}`);
    }
  });
  console.log(`[backfill] done scanned=${result.scanned} updated=${result.updated} inserted=${result.inserted}`);
}

main()
  .catch((e) => {
    console.error('[backfill] failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
