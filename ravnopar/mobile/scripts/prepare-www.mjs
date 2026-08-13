import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const www = path.resolve(root, '../www');
await mkdir(www, { recursive: true });
const html = `<!doctype html>
<html lang="hr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Ravnopar</title>
  </head>
  <body>
    <p>Ravnopar native shell — server.url u capacitor.config.ts učitava live app.</p>
  </body>
</html>
`;
await writeFile(path.join(www, 'index.html'), html);
console.log('www ready');
