import fs from 'fs';
import path from 'path';

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (/\.(jsx?|tsx?|mjs)$/.test(e.name)) a.push(p);
  }
  return a;
}

for (const f of walk('src/app')) {
  let s = fs.readFileSync(f, 'utf8');
  const next = s.replace(/from '([^']*)\/pages\//g, "from '$1/views/").replace(/from "([^"]*)\/pages\//g, 'from "$1/views/');
  if (next !== s) {
    fs.writeFileSync(f, next);
    console.log('fixed', f);
  }
}
