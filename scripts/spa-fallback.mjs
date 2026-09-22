#!/usr/bin/env node
/**
 * Copies dist/index.html to dist/404.html for GitHub Pages SPA fallback.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const index = join(dist, 'index.html');
const notFound = join(dist, '404.html');

if (!existsSync(index)) {
  console.error('dist/index.html missing — run vite build first');
  process.exit(1);
}
copyFileSync(index, notFound);
console.log('Wrote dist/404.html for GitHub Pages SPA fallback');
