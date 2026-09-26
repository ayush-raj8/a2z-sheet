#!/usr/bin/env node
/**
 * Classify all A2Z topics into viz coverage entries.
 * Writes src/sheets/dsa/viz/coverage/registry.json
 *
 * Run: node scripts/generate-viz-coverage.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const inv = JSON.parse(
  fs.readFileSync(path.join(root, 'src/sheets/dsa/content/topicInventory.json'), 'utf8'),
);

/** Topic ids with first-class runners (keep in sync with runners/index.ts). */
const FIRST_CLASS = new Set([
  'cntdigits',
  'djisktrslgrithm',
  'whyprirityqissdindjisktrslgrithm',
  'ntwrkdlytim',
  'pthwithminimmffrt',
  'bllmnfrdlgrithm',
  'shrtstpthindg',
  'tpsrt',
  'binrysrchtfindxinsrtdrry',
  'implmntlwrbnd',
  'implmntpprbnd',
  'srchinrttdsrtdrryi',
  'srchinrttdsrtdrryii',
  'findminimminrttdsrtdrry',
  'findpklmnt',
  '2smprblm',
  'vlidprnthsischckr',
  'nxtgrtrlmnt',
  'nxtgrtrlmnt2',
  'slidingwindwmximm',
  'lngstcmmnsbsqncdp25',
  'printlngstcmmnsbsqncdp26',
]);

/** Legacy kit topic ids from viz/registry.ts — approximate via reading file. */
const registrySrc = fs.readFileSync(path.join(root, 'src/sheets/dsa/viz/registry.ts'), 'utf8');
const LEGACY = new Set(
  [...registrySrc.matchAll(/^\s{2}(?:'([^']+)'|([a-z0-9]+))\s*:/gm)].map((m) => m[1] || m[2]),
);

function classify(topic) {
  const { id, title, category, subcategory, topicType } = topic;
  const hay = `${title} ${category} ${subcategory} ${topicType || ''}`.toLowerCase();

  if (
    topicType === 'concept' ||
    /theory|introduction to|things to know|time complexity|stl|collections|patterns$|user input|data types|if else|switch|for loops|while loops|functions \(/i.test(
      title,
    )
  ) {
    return {
      status: 'skip',
      visualizationTypes: [],
      reason: 'concept / theory — variable panel optional later',
    };
  }

  const types = [];
  const add = (t) => {
    if (!types.includes(t)) types.push(t);
  };

  if (/array|subarray|two sum|3-sum|4-sum|kadane|majority|next permutation|stock|rearrange|rotate.*array|merge.*array/i.test(hay))
    add('ARRAY');
  if (/string|anagram|palindrome.*string|substring|atoi|roman/i.test(hay)) add('STRING');
  if (/two pointer|left.*right|pair with/i.test(hay)) add('POINTER');
  if (/sliding window|window/i.test(hay)) add('WINDOW');
  if (/stack|parenthes|next greater|next smaller|histogram|asteroid|celebrity/i.test(hay))
    add('STACK');
  if (/queue|deque|bfs/i.test(hay) && !/priority queue|heap/i.test(hay)) add('QUEUE');
  if (/heap|priority queue|kth |median.*stream|top k/i.test(hay)) add('HEAP');
  if (/linked.?list|ll |dll|lru/i.test(hay)) add('LINKED_LIST');
  if (/binary tree|bst|morris|serialize.*tree|flatten binary/i.test(hay)) add('TREE');
  if (/graph|dijkstra|bellman|floyd|topo|mst|disjoint|bridge|articulation|kosaraju|bipartite|shortest path|flood|rotten|grid.*bfs|0\/1 matrix/i.test(hay))
    add('GRAPH');
  if (/recursion|backtrack|combination sum|subset|n-queen|sudoku|word search|palindrome partition/i.test(hay)) {
    add('RECURSION');
    add('CALL_STACK');
  }
  if (/dp |dynamic|knapsack|lis|lcs|mcm|stock.*dp|falling path|partition.*sum \(dp/i.test(hay) || /DP[-\s]?\d/i.test(title))
    add('DP_TABLE');
  if (/matrix|2d |grid dp|set matrix|rotate image|spiral/i.test(hay)) add('MATRIX');
  if (/hash|map|frequency|two sum/i.test(hay)) add('HASH_MAP');
  if (/union|disjoint|dsu/i.test(hay)) add('UNION_FIND');
  if (/bit |xor|binary |power set.*bit/i.test(hay)) add('BITSET');
  if (/binary search|lower bound|upper bound|peak|nth root|koko|aggressive cows|book allocation|split array/i.test(hay)) {
    add('ARRAY');
    add('POINTER');
    add('WINDOW');
  }
  if (/trie|prefix/i.test(hay) && /trie|string/i.test(hay)) add('TREE');
  if (/sort|merge sort|quick sort|insertion|bubble|selection|recursive bubble|recursive insertion/i.test(hay)) {
    add('ARRAY');
  }
  if (!types.length) add('VARS');

  if (FIRST_CLASS.has(id)) {
    return { status: 'implemented', visualizationTypes: types, runner: 'first-class' };
  }
  if (LEGACY.has(id)) {
    return {
      status: 'implemented',
      visualizationTypes: types,
      runner: 'legacy-kit',
      reason: 'adapted via legacyAdapter — migrate to first-class for line-by-line + structures',
    };
  }

  return {
    status: 'planned',
    visualizationTypes: types,
    reason: 'classified; runner not yet authored',
  };
}

const entries = inv.topics.map((t) => {
  const c = classify(t);
  return {
    problemId: t.id,
    topicNumber: t.topicNumber,
    title: t.title,
    category: t.category,
    subcategory: t.subcategory,
    status: c.status,
    visualizationTypes: c.visualizationTypes,
    runner: c.runner || undefined,
    reason: c.reason || undefined,
  };
});

const summary = {
  total: entries.length,
  implemented: entries.filter((e) => e.status === 'implemented').length,
  planned: entries.filter((e) => e.status === 'planned').length,
  skip: entries.filter((e) => e.status === 'skip').length,
  firstClass: entries.filter((e) => e.runner === 'first-class').length,
  legacyKit: entries.filter((e) => e.runner === 'legacy-kit').length,
};

const outDir = path.join(root, 'src/sheets/dsa/viz/coverage');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'registry.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), summary, entries }, null, 2),
);

console.log(JSON.stringify(summary, null, 2));
console.log('Wrote', path.join(outDir, 'registry.json'));
