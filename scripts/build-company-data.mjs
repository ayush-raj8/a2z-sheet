#!/usr/bin/env node
/**
 * Build company-wise DSA data from LC_company_wise/*.csv
 * + bridge maps via LeetCode URL slug ↔ a2z.json lc_link.
 *
 * Outputs under src/sheets/dsa/content/companies/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_CSV = path.join(ROOT, 'LC_company_wise');
const OUT_DIR = path.join(ROOT, 'src/sheets/dsa/content/companies');
const OUT_BY = path.join(OUT_DIR, 'by-slug');
const A2Z_PATH = path.join(ROOT, 'a2z.json');

const WINDOWS = [
  { file: '1. Thirty Days.csv', id: '30d', label: '30 days', order: 0 },
  { file: '2. Three Months.csv', id: '3m', label: '3 months', order: 1 },
  { file: '3. Six Months.csv', id: '6m', label: '6 months', order: 2 },
  { file: '4. More Than Six Months.csv', id: '6m+', label: '>6 months', order: 3 },
  { file: '5. All.csv', id: 'all', label: 'All', order: 4 },
];

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Minimal RFC4180 CSV parse */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let i = 0;
  let inQuotes = false;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      i++;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
      i++;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((c) => c.length)) rows.push(row);
  }
  return rows;
}

function lcSlugFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  return m ? m[1].toLowerCase() : null;
}

function readCompanyWindow(companyDir, win) {
  const fp = path.join(companyDir, win.file);
  if (!fs.existsSync(fp)) return new Map();
  const text = fs.readFileSync(fp, 'utf8');
  const rows = parseCsv(text);
  if (!rows.length) return new Map();
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = {
    difficulty: header.indexOf('difficulty'),
    title: header.indexOf('title'),
    frequency: header.indexOf('frequency'),
    acceptance: header.findIndex((h) => h.includes('acceptance')),
    link: header.indexOf('link'),
    topics: header.indexOf('topics'),
  };
  const map = new Map();
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const link = (cols[idx.link] || '').trim();
    const slug = lcSlugFromUrl(link);
    if (!slug) continue;
    const freq = Number.parseFloat(cols[idx.frequency] || '0');
    const acc = Number.parseFloat(cols[idx.acceptance] || '0');
    const topicsRaw = (cols[idx.topics] || '').trim();
    map.set(slug, {
      title: (cols[idx.title] || slug).trim(),
      difficulty: (cols[idx.difficulty] || '').trim().toUpperCase(),
      frequency: Number.isFinite(freq) ? freq : 0,
      acceptance: Number.isFinite(acc) ? acc : 0,
      lcUrl: link.split('?')[0].replace(/\/$/, ''),
      lcSlug: slug,
      topics: topicsRaw
        ? topicsRaw.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    });
  }
  return map;
}

function buildA2zLcIndex(a2z) {
  /** @type {Map<string, string[]>} */
  const byLc = new Map();
  for (const step of a2z) {
    for (const sub of step.sub_steps || []) {
      for (const topic of sub.topics || []) {
        const slug = lcSlugFromUrl(topic.lc_link);
        if (!slug) continue;
        if (!byLc.has(slug)) byLc.set(slug, []);
        byLc.get(slug).push(topic.id);
      }
    }
  }
  return byLc;
}

function main() {
  if (!fs.existsSync(SRC_CSV)) {
    console.error('Missing LC_company_wise/ — abort');
    process.exit(1);
  }

  fs.mkdirSync(OUT_BY, { recursive: true });
  // clear old by-slug
  for (const f of fs.readdirSync(OUT_BY)) {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(OUT_BY, f));
  }

  const a2z = JSON.parse(fs.readFileSync(A2Z_PATH, 'utf8'));
  const a2zByLc = buildA2zLcIndex(a2z);

  const companyDirs = fs
    .readdirSync(SRC_CSV, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  const usedSlugs = new Set();
  const indexCompanies = [];
  /** lcSlug → { a2zIds, companies: [{ slug, name, frequency, windows }] } */
  const bridgeByLc = new Map();
  /** a2zId → [{ slug, name, frequency }] */
  const bridgeByA2z = new Map();

  let problemRows = 0;

  for (const name of companyDirs) {
    const dir = path.join(SRC_CSV, name);
    let slug = slugify(name) || 'company';
    if (usedSlugs.has(slug)) {
      let n = 2;
      while (usedSlugs.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    usedSlugs.add(slug);

    /** @type {Map<string, Map<string, any>>} windowId → slug → row */
    const byWindow = new Map();
    for (const win of WINDOWS) {
      byWindow.set(win.id, readCompanyWindow(dir, win));
    }

    const allMap = byWindow.get('all');
    // Prefer All.csv; if missing, union all windows
    const masterSlugs = new Set(allMap.keys());
    if (!masterSlugs.size) {
      for (const m of byWindow.values()) for (const s of m.keys()) masterSlugs.add(s);
    }

    const counts = Object.fromEntries(WINDOWS.map((w) => [w.id, byWindow.get(w.id).size]));
    const problems = [];

    for (const lcSlug of masterSlugs) {
      // pick richest row (prefer All, else highest frequency across windows)
      let best = allMap.get(lcSlug) || null;
      const windows = [];
      for (const win of WINDOWS) {
        const row = byWindow.get(win.id).get(lcSlug);
        if (!row) continue;
        windows.push(win.id);
        if (!best || row.frequency > best.frequency) best = row;
      }
      if (!best) continue;

      const a2zIds = a2zByLc.get(lcSlug) || [];
      problems.push({
        title: best.title,
        difficulty: best.difficulty,
        frequency: best.frequency,
        acceptance: best.acceptance,
        lcSlug,
        lcUrl: best.lcUrl || `https://leetcode.com/problems/${lcSlug}`,
        topics: best.topics,
        windows,
        a2zIds,
      });
      problemRows++;

      if (!bridgeByLc.has(lcSlug)) {
        bridgeByLc.set(lcSlug, { a2zIds, companies: [] });
      }
      const entry = bridgeByLc.get(lcSlug);
      entry.companies.push({
        slug,
        name,
        frequency: best.frequency,
        windows,
      });
      for (const aid of a2zIds) {
        if (!bridgeByA2z.has(aid)) bridgeByA2z.set(aid, []);
        bridgeByA2z.get(aid).push({
          slug,
          name,
          frequency: best.frequency,
        });
      }
    }

    problems.sort((a, b) => b.frequency - a.frequency || a.title.localeCompare(b.title));

    const companyPayload = {
      slug,
      name,
      counts,
      problems,
    };
    fs.writeFileSync(path.join(OUT_BY, `${slug}.json`), JSON.stringify(companyPayload));

    indexCompanies.push({
      slug,
      name,
      problemCount: problems.length,
      counts,
      a2zOverlap: problems.filter((p) => p.a2zIds.length).length,
    });
  }

  indexCompanies.sort((a, b) => b.problemCount - a.problemCount || a.name.localeCompare(b.name));

  // compact a2z bridge: top companies by frequency per topic
  const byA2zId = {};
  /** companySlug → a2z topic ids (full reverse index for sheet filter) */
  const byCompanySlug = {};
  for (const [aid, list] of bridgeByA2z) {
    const dedup = new Map();
    for (const c of list) {
      const prev = dedup.get(c.slug);
      if (!prev || c.frequency > prev.frequency) dedup.set(c.slug, c);
      if (!byCompanySlug[c.slug]) byCompanySlug[c.slug] = new Set();
      byCompanySlug[c.slug].add(aid);
    }
    byA2zId[aid] = [...dedup.values()]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 12)
      .map(({ slug, name, frequency }) => ({ slug, name, frequency }));
  }

  const byCompanySlugOut = {};
  for (const [slug, set] of Object.entries(byCompanySlug)) {
    byCompanySlugOut[slug] = [...set];
  }

  const byLcSlug = {};
  for (const [slug, v] of bridgeByLc) {
    byLcSlug[slug] = {
      a2zIds: v.a2zIds,
      companies: v.companies
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20)
        .map(({ slug: s, name, frequency }) => ({ slug: s, name, frequency })),
    };
  }

  const index = {
    generatedAt: new Date().toISOString(),
    companyCount: indexCompanies.length,
    problemRows,
    windows: WINDOWS.map(({ id, label, order }) => ({ id, label, order })),
    companies: indexCompanies,
  };

  const bridge = {
    generatedAt: index.generatedAt,
    a2zWithCompanies: Object.keys(byA2zId).length,
    lcSlugsMappedToA2z: [...bridgeByLc.values()].filter((v) => v.a2zIds.length).length,
    byA2zId,
    byCompanySlug: byCompanySlugOut,
    byLcSlug,
  };

  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'bridge.json'), JSON.stringify(bridge));

  console.log(
    JSON.stringify(
      {
        companies: index.companyCount,
        problemRows,
        a2zWithCompanies: bridge.a2zWithCompanies,
        lcSlugsMappedToA2z: bridge.lcSlugsMappedToA2z,
        out: path.relative(ROOT, OUT_DIR),
      },
      null,
      2,
    ),
  );
}

main();
