import { defaultBinaryTree, layoutBinaryTree, treeEdges } from '../layout';
import type { VizFrame, VizSpec } from '../types';

export function buildTreeBfs(): VizSpec {
  const root = defaultBinaryTree();
  const nodes = layoutBinaryTree(root);
  const edges = treeEdges(root);
  const frames: VizFrame[] = [];
  const output: string[] = [];
  const visited: string[] = [];

  type Q = { id: string; val: number };
  const q: Q[] = [{ id: root.id, val: root.val }];

  function nodeById(id: string) {
    const map = new Map(nodes.map((n) => [n.id, n]));
    return map.get(id);
  }

  function children(id: string): Q[] {
    // walk tree
    function find(n: typeof root | null | undefined): typeof root | null {
      if (!n) return null;
      if (n.id === id) return n;
      return find(n.left) || find(n.right);
    }
    const n = find(root);
    const out: Q[] = [];
    if (n?.left) out.push({ id: n.left.id, val: n.left.val });
    if (n?.right) out.push({ id: n.right.id, val: n.right.val });
    return out;
  }

  frames.push({
    caption: 'Start BFS — enqueue root',
    nodes,
    edges,
    active: [root.id],
    visited: [],
    queue: q.map((x) => String(x.val)),
    output: [],
    aux: { level: '0' },
  });

  let level = 0;
  while (q.length) {
    const size = q.length;
    const levelVals: string[] = [];
    for (let i = 0; i < size; i++) {
      const cur = q.shift()!;
      visited.push(cur.id);
      output.push(String(cur.val));
      levelVals.push(String(cur.val));
      const kids = children(cur.id);
      for (const k of kids) q.push(k);
      frames.push({
        caption: `Dequeue ${cur.val}, enqueue children [${kids.map((k) => k.val).join(', ') || '—'}]`,
        nodes,
        edges,
        active: [cur.id],
        visited: [...visited],
        queue: q.map((x) => String(x.val)),
        output: [...output],
        aux: { level: String(level), levelNodes: levelVals.join(',') },
      });
      void nodeById;
    }
    level++;
  }

  frames.push({
    caption: `Done. Level-order = [${output.join(', ')}]`,
    nodes,
    edges,
    visited: [...visited],
    queue: [],
    output: [...output],
  });

  return {
    kit: 'treeBfs',
    title: 'Level-order BFS',
    inputSummary: 'Tree: 1 → (2 → (4,5), 3)',
    expectedOutput: `[${output.join(', ')}]`,
    frames,
  };
}
