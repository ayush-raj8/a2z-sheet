import type { VizEdge, VizFrame, VizNode, VizSpec } from '../types';

type TNode = {
  id: string;
  ch: string;
  end: boolean;
  kids: Map<string, TNode>;
};

let _id = 0;
function nid() {
  return `t${_id++}`;
}

function layoutTrie(root: TNode): { nodes: VizNode[]; edges: VizEdge[] } {
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];
  const leafGap = 56;

  function countLeaves(n: TNode): number {
    if (n.kids.size === 0) return 1;
    let s = 0;
    for (const k of n.kids.values()) s += countLeaves(k);
    return Math.max(1, s);
  }

  function walk(n: TNode, depth: number, left: number, right: number) {
    const x = (left + right) / 2;
    const y = 28 + depth * 62;
    nodes.push({
      id: n.id,
      label: n.ch === '' ? '·' : n.ch,
      x,
      y,
    });
    const entries = [...n.kids.entries()];
    let cursor = left;
    const total = Math.max(1, countLeaves(n));
    const span = right - left;
    for (const [, child] of entries) {
      const w = (countLeaves(child) / total) * span;
      edges.push({
        id: `${n.id}-${child.id}`,
        from: n.id,
        to: child.id,
      });
      walk(child, depth + 1, cursor, cursor + w);
      cursor += w;
    }
  }

  walk(root, 0, 20, 400);
  // mark end nodes via label suffix in frames instead
  return { nodes, edges };
}

export function buildTrieString(): VizSpec {
  _id = 0;
  const root: TNode = { id: nid(), ch: '', end: false, kids: new Map() };
  const words = ['app', 'apple', 'ape', 'bat'];
  const frames: VizFrame[] = [];

  function snap(caption: string, active: string[], word?: string) {
    const { nodes, edges } = layoutTrie(root);
    // decorate end nodes
    function mark(n: TNode) {
      if (n.end) {
        const vn = nodes.find((x) => x.id === n.id);
        if (vn && !vn.label.endsWith('*')) vn.label = `${vn.label}*`;
      }
      for (const c of n.kids.values()) mark(c);
    }
    mark(root);
    frames.push({
      caption,
      nodes,
      edges,
      active,
      aux: word ? { word } : undefined,
      output: words.filter((w) => {
        // crude: words fully inserted so far = those we finished
        return frames.some((f) => f.caption.startsWith(`Inserted ${w}`));
      }),
    });
  }

  snap('Empty trie (root ·)', [root.id]);

  const inserted: string[] = [];
  for (const w of words) {
    let cur = root;
    const path = [root.id];
    snap(`Insert "${w}" — start at root`, [cur.id], w);
    for (const ch of w) {
      if (!cur.kids.has(ch)) {
        const child: TNode = { id: nid(), ch, end: false, kids: new Map() };
        cur.kids.set(ch, child);
        snap(`Create edge '${ch}'`, [child.id], w);
      }
      cur = cur.kids.get(ch)!;
      path.push(cur.id);
      snap(`Follow '${ch}'`, [...path], w);
    }
    cur.end = true;
    inserted.push(w);
    frames.push({
      ...frames[frames.length - 1],
      caption: `Inserted ${w} (mark end*)`,
      active: [cur.id],
      output: [...inserted],
      aux: { word: w, ends: 'true' },
    });
  }

  // search demo
  const query = 'ape';
  let cur = root;
  let ok = true;
  const path = [root.id];
  snap(`Search "${query}"`, [root.id], query);
  for (const ch of query) {
    if (!cur.kids.has(ch)) {
      ok = false;
      snap(`Missing '${ch}' → not found`, path, query);
      break;
    }
    cur = cur.kids.get(ch)!;
    path.push(cur.id);
    snap(`Match '${ch}'`, [...path], query);
  }
  if (ok) {
    frames.push({
      ...frames[frames.length - 1],
      caption: cur.end ? `Found "${query}" (end flag)` : `"${query}" is only a prefix`,
      active: [cur.id],
      output: [...inserted],
      aux: { found: String(cur.end) },
    });
  }

  return {
    kit: 'trieString',
    title: 'Trie insert / search',
    inputSummary: `insert ${JSON.stringify(words)}, then search "${query}"`,
    expectedOutput: `trie contains ${inserted.join(', ')}; search(${query})=true`,
    frames,
  };
}
