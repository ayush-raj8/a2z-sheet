#!/usr/bin/env node
/** Rebuild topicInventory.json from a2z.json (does not overwrite reviewed blog bodies). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roadmap = JSON.parse(fs.readFileSync(path.join(root, 'a2z.json'), 'utf8'));
const progressPath = path.join(root, 'src/sheets/dsa/content/blogProgress.json');
const progress = fs.existsSync(progressPath)
  ? JSON.parse(fs.readFileSync(progressPath, 'utf8'))
  : { byId: {} };

function classify(title, step, sub, difficultyNum) {
  const hay = `${title} ${step} ${sub}`.toLowerCase();
  const hit = (...ks) => ks.some((k) => hay.includes(k));
  let topicType = 'coding-problem';
  if (hit('time complexity', 'data type', 'if else', 'switch', 'for loop', 'while loop', 'functions (pass', 'input / output', 'what are arrays', 'understand recursion', 'print name', 'print 1 to', 'print n to'))
    topicType = 'concept';
  if (hit('patterns') && hit('build-up', 'logical', 'must-do-pattern', 'patterns')) topicType = 'pattern';
  if (hit('c++ stl', 'java collections')) topicType = 'data-structure';
  if (hit('count digits', 'reverse a number', 'check palindrome', 'gcd', 'armstrong', 'print all divisors', 'check for prime'))
    topicType = 'math';
  if (hit('dijkstra', 'bellman', 'floyd', 'kruskal', 'prim', 'kahn', 'euclidean', 'sieve')) topicType = 'algorithm';
  const difficulty = ({ 0: 'easy', 1: 'medium', 2: 'hard' })[difficultyNum ?? 0] || 'easy';
  const patterns = [];
  if (hit('two pointer')) patterns.push('two-pointers');
  if (hit('sliding window')) patterns.push('sliding-window');
  if (hit('binary search')) patterns.push('binary-search');
  if (hit('dp', 'dynamic programming')) patterns.push('dynamic-programming');
  if (hit('bfs')) patterns.push('bfs');
  if (hit('dfs')) patterns.push('dfs');
  if (hit('recursion')) patterns.push('recursion');
  return { topicType, difficulty, patterns };
}

const topics = [];
let n = 0;
for (const step of roadmap) {
  for (const sub of step.sub_steps || []) {
    for (const t of sub.topics || []) {
      n++;
      const c = classify(t.question_title, step.step_title, sub.sub_step_title, t.difficulty);
      const prev = progress.byId?.[t.id];
      topics.push({
        topicNumber: n,
        id: t.id,
        title: t.question_title,
        category: step.step_title.replace(/\s+/g, ' ').trim(),
        subcategory: (sub.sub_step_title || '').replace(/\s+/g, ' ').trim(),
        difficulty: c.difficulty,
        topicType: c.topicType,
        patterns: c.patterns,
        postLink: t.post_link || null,
        status: prev?.status || 'pending',
        batch: prev?.batch ?? null,
      });
    }
  }
}

const out = { generatedAt: new Date().toISOString(), total: topics.length, topics };
fs.writeFileSync(path.join(root, 'src/sheets/dsa/content/topicInventory.json'), JSON.stringify(out, null, 2));
console.log(`Inventory rebuilt: ${topics.length} topics`);
