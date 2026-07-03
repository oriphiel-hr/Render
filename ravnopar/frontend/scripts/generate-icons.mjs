#!/usr/bin/env node
/** Generira PNG favicone iz public/icon.svg (Google traži min. 48×48). */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svg = readFileSync(join(publicDir, 'icon.svg'));

const targets = [
  { file: 'favicon.ico', size: 32 },
  { file: 'icon-48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 }
];

for (const { file, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, file));
  console.log(`→ public/${file} (${size}×${size})`);
}
