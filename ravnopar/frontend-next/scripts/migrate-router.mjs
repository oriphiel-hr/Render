import fs from 'fs';
import path from 'path';

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (/\.(jsx?|tsx?)$/.test(e.name)) a.push(p);
  }
  return a;
}

const root = path.resolve('src');
const files = walk(root);
let n = 0;

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  s = s.replace(/import\s*\{([^}]*)\}\s*from\s*['"]react-router-dom['"]\s*;?/g, (m, inner) => {
    const parts = inner.split(',').map((x) => x.trim()).filter(Boolean);
    const hasLink = parts.some((p) => p === 'Link' || p.startsWith('Link as'));
    const rest = parts.filter((p) => p !== 'Link' && !p.startsWith('Link as'));
    const lines = [];
    if (hasLink) {
      const rel = path.relative(path.dirname(f), path.join(root, 'components')).replace(/\\/g, '/');
      lines.push(`import Link from '${rel.startsWith('.') ? rel : `./${rel}`}/Link.jsx';`);
    }
    if (rest.length) {
      const rel = path.relative(path.dirname(f), path.join(root, 'lib')).replace(/\\/g, '/');
      lines.push(
        `import { ${rest.join(', ')} } from '${rel.startsWith('.') ? rel : `./${rel}`}/next-router-compat.js';`
      );
    }
    return lines.join('\n');
  });
  if (s !== orig) {
    fs.writeFileSync(f, s);
    n++;
  }
}
console.log('updated', n, 'files');
