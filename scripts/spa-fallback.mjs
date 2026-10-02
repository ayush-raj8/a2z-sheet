#!/usr/bin/env node
/**
 * GitHub Pages SPA support:
 * 1) Copy index.html → 404.html (soft fallback for deep links)
 * 2) Materialize common route folders with index.html so hard refresh
 *    on /dsa, /lld, etc. returns HTTP 200 instead of looking "broken".
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const index = join(dist, 'index.html');
const notFound = join(dist, '404.html');

if (!existsSync(index)) {
  console.error('dist/index.html missing — run vite build first');
  process.exit(1);
}

copyFileSync(index, notFound);
console.log('Wrote dist/404.html for GitHub Pages SPA fallback');

/** Top-level app shells that users open / bookmark directly */
const routeIndexes = [
  'dsa/index.html',
  'dsa/companies/index.html',
  'lld/index.html',
];

for (const rel of routeIndexes) {
  const target = join(dist, rel);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(index, target);
  console.log(`Wrote dist/${rel}`);
}
