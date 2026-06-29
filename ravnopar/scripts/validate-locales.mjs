import en from '../frontend/src/lib/i18n/messages/en.js';
import hr from '../frontend/src/lib/i18n/messages/hr.js';
import de from '../frontend/src/lib/i18n/messages/de.js';
import sl from '../frontend/src/lib/i18n/messages/sl.js';
import bs from '../frontend/src/lib/i18n/messages/bs.js';
import sr from '../frontend/src/lib/i18n/messages/sr.js';
import it from '../frontend/src/lib/i18n/messages/it.js';
import hu from '../frontend/src/lib/i18n/messages/hu.js';
import pl from '../frontend/src/lib/i18n/messages/pl.js';
import cs from '../frontend/src/lib/i18n/messages/cs.js';
import fr from '../frontend/src/lib/i18n/messages/fr.js';
import es from '../frontend/src/lib/i18n/messages/es.js';
import sk from '../frontend/src/lib/i18n/messages/sk.js';

const locales = { en, hr, de, sl, bs, sr, it, hu, pl, cs, fr, es, sk };

function collectKeys(obj, prefix = '') {
  const keys = [];
  if (obj === null || obj === undefined) return keys;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      keys.push(...collectKeys(item, `${prefix}${prefix ? '.' : ''}${i}`));
    });
    return keys;
  }
  if (typeof obj !== 'object') {
    return [prefix];
  }
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.push(...collectKeys(v, path));
  }
  return keys;
}

const baseKeys = new Set(collectKeys(en));
let ok = true;

for (const [code, catalog] of Object.entries(locales)) {
  const keys = new Set(collectKeys(catalog));
  const missing = [...baseKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !baseKeys.has(k));
  if (missing.length || extra.length) {
    ok = false;
    console.log(`\n${code}: missing=${missing.length} extra=${extra.length}`);
    if (missing.length) console.log('  missing:', missing.slice(0, 10).join(', '), missing.length > 10 ? '...' : '');
    if (extra.length) console.log('  extra:', extra.slice(0, 10).join(', '), extra.length > 10 ? '...' : '');
  } else {
    console.log(`${code}: OK (${keys.size} keys)`);
  }
}

process.exit(ok ? 0 : 1);
