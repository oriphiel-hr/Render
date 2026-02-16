#!/usr/bin/env node
/**
 * Cron script: šalje POST na /api/sudreg_sync_run_job.
 * Za Render Cron Job: Language = Node, Command = node cron-sync.js
 * Env: SUDREG_APP_URL (default https://registar-poslovnih-subjekata.onrender.com), SUDREG_SNAPSHOT_ID (default 1090)
 */
const https = require('https');

const base = process.env.SUDREG_APP_URL || 'https://registar-poslovnih-subjekata.onrender.com';
const snapshotId = process.env.SUDREG_SNAPSHOT_ID || '1090';
const url = `${base.replace(/\/$/, '')}/api/sudreg_sync_run_job?snapshot_id=${encodeURIComponent(snapshotId)}`;

const u = new URL(url);
const opts = {
  hostname: u.hostname,
  port: u.port || 443,
  path: u.pathname + u.search,
  method: 'POST',
};

const req = https.request(opts, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log(res.statusCode, body.slice(0, 500));
    process.exit(res.statusCode >= 400 ? 1 : 0);
  });
});
req.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
req.end();
