/**
 * Sync backend API error messages from frontend locale api.* keys.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '../frontend/src/lib/i18n/messages');
const locales = ['hr', 'en', 'de', 'sl', 'bs', 'sr', 'it', 'hu', 'pl', 'cs', 'fr', 'es', 'sk'];

const catalogs = {};
for (const code of locales) {
  catalogs[code] = (await import(pathToFileURL(path.join(messagesDir, `${code}.js`)).href)).default;
}

const errorCodes = Object.keys(catalogs.en.api);
const lines = ['export const ERROR_CATALOG = {'];

for (const code of errorCodes) {
  lines.push(`  ${code}: {`);
  for (const loc of locales) {
    const msg = catalogs[loc].api[code];
    lines.push(`    ${loc}: ${JSON.stringify(msg)},`);
  }
  lines.push('  },');
}
lines.push('};');
lines.push('');
lines.push("import { SUPPORTED_LOCALES } from './locales.js';");
lines.push('');
lines.push('export function parseLocale(acceptLanguage) {');
lines.push("  if (!acceptLanguage || typeof acceptLanguage !== 'string') return 'hr';");
lines.push("  const primary = acceptLanguage.split(',')[0].trim().toLowerCase().split('-')[0];");
lines.push('  if (SUPPORTED_LOCALES.includes(primary)) return primary;');
lines.push("  if (primary.startsWith('en')) return 'en';");
lines.push("  if (primary.startsWith('de')) return 'de';");
lines.push("  return 'hr';");
lines.push('}');
lines.push('');
lines.push("export function tError(code, locale = 'hr') {");
lines.push('  const entry = ERROR_CATALOG[code];');
lines.push('  if (!entry) return ERROR_CATALOG.INVALID_PAYLOAD[locale] || ERROR_CATALOG.INVALID_PAYLOAD.en || ERROR_CATALOG.INVALID_PAYLOAD.hr;');
lines.push('  return entry[locale] || entry.en || entry.hr;');
lines.push('}');
lines.push('');
lines.push('export function sendError(req, res, status, code, extra = {}) {');
lines.push("  const locale = parseLocale(req.headers['accept-language']);");
lines.push('  return res.status(status).json({');
lines.push('    success: false,');
lines.push('    errorCode: code,');
lines.push('    error: tError(code, locale),');
lines.push('    ...extra');
lines.push('  });');
lines.push('}');
lines.push('');

const outPath = path.join(__dirname, '../backend/src/lib/api-errors.js');
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Updated', outPath);
