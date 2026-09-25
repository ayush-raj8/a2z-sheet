import type { VizEdge, VizFrame, VizNode, VizSpec } from '../types';

type BitNode = {
  id: string;
  bit: string; // '' for root, '0'/'1' for edges into this node
  kids: { 0?: BitNode; 1?: BitNode };
};

let _id = 0;
function nid() {
  return `b${_id++}`;
}

function layout(root: BitNode): { nodes: VizNode[]; edges: VizEdge[] } {
  const nodes: VizNode[] = [];
  const edges: VizEdge[] = [];

  function leaves(n: BitNode): number {
    if (!n.kids[0] && !n.kids[1]) return 1;
    return (n.kids[0] ? leaves(n.kids[0]) : 0) + (n.kids[1] ? leaves(n.kids[1]) : 0) || 1;
  }

  function walk(n: BitNode, depth: number, left: number, right: number) {
    const x = (left + right) / 2;
    const y = 24 + depth * 48;
    nodes.push({ id: n.id, label: n.bit === '' ? '·' : n.bit, x, y });
    const total = Math.max(1, leaves(n));
    let cursor = left;
    for (const bit of [0, 1] as const) {
      const child = n.kids[bit];
      if (!child) continue;
      const w = (leaves(child) / total) * (right - left);
      edges.push({ id: `${n.id}-${child.id}`, from: n.id, to: child.id, label: String(bit) });
      walk(child, depth + 1, cursor, cursor + w);
      cursor += w;
    }
  }

  walk(root, 0, 30, 390);
  return { nodes, edges };
}

function bitsOf(x: number, width: number): number[] {
  const out: number[] = [];
  for (let i = width - 1; i >= 0; i--) out.push((x >> i) & 1);
  return out;
}

export function buildTrieBinary(): VizSpec {
  _id = 0;
  // small bit-width for readable viz (4 bits) — same greedy XOR idea as 32-bit
  const WIDTH = 4;
  const nums = [9, 8, 7, 5]; // 1001, 1000, 0111, 0101
  const root: BitNode = { id: nid(), bit: '', kids: {} };
  const frames: VizFrame[] = [];

  function snap(caption: string, active: string[], aux?: Record<string, string>, output?: string[]) {
    const { nodes, edges } = layout(root);
    frames.push({ caption, nodes, edges, active, aux, output });
  }

  snap('Binary trie (4-bit demo for clarity; interview uses 32)', [root.id], {
    nums: nums.map((x) => `${x}=${bitsOf(x, WIDTH).join('')}`).join('  '),
  });

  for (const x of nums) {
    let cur = root;
    const path = [root.id];
    const bits = bitsOf(x, WIDTH);
    snap(`Insert ${x} (${bits.join('')})`, [cur.id], { num: String(x) });
    for (const b of bits) {
      if (!cur.kids[b as 0 | 1]) {
        cur.kids[b as 0 | 1] = { id: nid(), bit: String(b), kids: {} };
        snap(`Create bit ${b}`, [cur.kids[b as 0 | 1]!.id], { num: String(x) });
      }
      cur = cur.kids[b as 0 | 1]!;
      path.push(cur.id);
      snap(`Follow ${b}`, [...path], { num: String(x) });
    }
  }

  // query max XOR for 5 (0101) against trie built from all — classic: for each num query before/after insert
  // Demo: after all inserts, query max XOR of 5 with any number in trie
  const query = 5;
  const qbits = bitsOf(query, WIDTH);
  let cur = root;
  const path = [root.id];
  let xor = 0;
  snap(`Max XOR query for ${query} (${qbits.join('')}) — prefer opposite bits`, [root.id], {
    query: String(query),
  });
  for (let i = 0; i < WIDTH; i++) {
    const b = qbits[i] as 0 | 1;
    const want = (b ^ 1) as 0 | 1;
    const take = cur.kids[want] ? want : b;
    if (!cur.kids[take]) break;
    if (take === want) xor |= 1 << (WIDTH - 1 - i);
    cur = cur.kids[take]!;
    path.push(cur.id);
    snap(`bit${i}: have ${b}, take ${take}${take === want ? ' (opposite ✓)' : ''}`, [...path], {
      xor: String(xor),
      query: String(query),
    });
  }

  // pair XOR: max over all pairs via querying each (simplified show final)
  let best = 0;
  let bestPair: [number, number] = [nums[0], nums[0]];
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const v = nums[i] ^ nums[j];
      if (v > best) {
        best = v;
        bestPair = [nums[i], nums[j]];
      }
    }
  }

  frames.push({
    ...frames[frames.length - 1],
    caption: `Max XOR pair = ${bestPair[0]}⊕${bestPair[1]} = ${best} (query path shows greedy)`,
    output: [String(best)],
    aux: { pair: `${bestPair[0]}⊕${bestPair[1]}`, maxXor: String(best) },
  });

  return {
    kit: 'trieBinary',
    title: 'Binary / XOR trie',
    inputSummary: `nums=${JSON.stringify(nums)} (4-bit paths; production uses 31..0)`,
    expectedOutput: `maxXor=${best} from ${bestPair[0]}⊕${bestPair[1]}`,
    frames,
  };
}
