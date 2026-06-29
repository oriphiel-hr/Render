import en from '../frontend/src/lib/i18n/messages/en.js';
import hr from '../frontend/src/lib/i18n/messages/hr.js';

function collectKeys(obj, prefix = '') {
  const keys = [];
  if (obj === null || obj === undefined) return keys;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      keys.push(...collectKeys(item, `${prefix}${prefix ? '.' : ''}${i}`));
    });
    return keys;
  }
  if (typeof obj !== 'object') return [prefix];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.push(...collectKeys(v, path));
  }
  return keys;
}

const hrKeys = new Set(collectKeys(hr));
const enKeys = new Set(collectKeys(en));
const hrOnly = [...hrKeys].filter((k) => !enKeys.has(k));
const enOnly = [...enKeys].filter((k) => !hrKeys.has(k));
console.log('hr only:', hrOnly.length);
console.log(hrOnly.slice(0, 30).join('\n'));
console.log('\nen only:', enOnly.length);
console.log(enOnly.slice(0, 30).join('\n'));
