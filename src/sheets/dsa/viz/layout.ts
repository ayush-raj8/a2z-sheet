import type { VizEdge, VizNode } from './types';

export type BinNode = {
  id: string;
  val: number;
  left?: BinNode | null;
  right?: BinNode | null;
};

/** Classic demo tree used across TreeDFS / TreeBFS defaults. */
export function defaultBinaryTree(): BinNode {
  //        1
  //       / \
  //      2   3
  //     / \
  //    4   5
  return {
    id: '1',
    val: 1,
    left: {
      id: '2',
      val: 2,
      left: { id: '4', val: 4 },
      right: { id: '5', val: 5 },
    },
    right: { id: '3', val: 3 },
  };
}

/** Wider tree for views / paths / burn demos. */
export function viewsBinaryTree(): BinNode {
  //            1
  //          /   \
  //         2     3
  //        / \   / \
  //       4   5 6   7
  //              \
  //               8
  return {
    id: '1',
    val: 1,
    left: {
      id: '2',
      val: 2,
      left: { id: '4', val: 4 },
      right: { id: '5', val: 5 },
    },
    right: {
      id: '3',
      val: 3,
      left: {
        id: '6',
        val: 6,
        right: { id: '8', val: 8 },
      },
      right: { id: '7', val: 7 },
    },
  };
}

export function layoutBinaryTree(root: BinNode, width = 420, levelGap = 70): VizNode[] {
  const nodes: VizNode[] = [];
  function walk(n: BinNode | null | undefined, depth: number, left: number, right: number) {
    if (!n) return;
    const x = (left + right) / 2;
    const y = 28 + depth * levelGap;
    nodes.push({ id: n.id, label: String(n.val), x, y });
    walk(n.left, depth + 1, left, x);
    walk(n.right, depth + 1, x, right);
  }
  walk(root, 0, 24, width - 24);
  return nodes;
}

export function treeEdges(root: BinNode): VizEdge[] {
  const edges: VizEdge[] = [];
  function walk(n: BinNode) {
    if (n.left) {
      edges.push({ id: `${n.id}-${n.left.id}`, from: n.id, to: n.left.id });
      walk(n.left);
    }
    if (n.right) {
      edges.push({ id: `${n.id}-${n.right.id}`, from: n.id, to: n.right.id });
      walk(n.right);
    }
  }
  walk(root);
  return edges;
}

export function findNode(root: BinNode, id: string): BinNode | null {
  if (root.id === id) return root;
  return (
    (root.left && findNode(root.left, id)) ||
    (root.right && findNode(root.right, id)) ||
    null
  );
}

/** Circle layout for small graphs. */
export function layoutGraphCircle(n: number, cx = 210, cy = 130, r = 95): VizNode[] {
  const nodes: VizNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    nodes.push({
      id: String(i),
      label: String(i),
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    });
  }
  return nodes;
}

/**
 * Layered DAG layout: x = topological level (longest path from sources),
 * y = slot within the level. Reads left→right like a real DAG.
 */
export function layoutDagLayers(
  n: number,
  edges: Array<[number, number] | [number, number, number]>,
  width = 400,
  height = 220,
): { nodes: VizNode[]; topo: number[]; levels: number[] } {
  const g: number[][] = Array.from({ length: n }, () => []);
  const indeg = Array(n).fill(0);
  for (const e of edges) {
    const u = e[0];
    const v = e[1];
    g[u].push(v);
    indeg[v]++;
  }
  const q: number[] = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const topo: number[] = [];
  const indeg2 = [...indeg];
  while (q.length) {
    const u = q.shift()!;
    topo.push(u);
    for (const v of g[u]) {
      indeg2[v]--;
      if (indeg2[v] === 0) q.push(v);
    }
  }
  // If cycle / incomplete topo, fall back to index order
  if (topo.length !== n) {
    for (let i = 0; i < n; i++) if (!topo.includes(i)) topo.push(i);
  }

  const levels = Array(n).fill(0);
  for (const u of topo) {
    for (const v of g[u]) levels[v] = Math.max(levels[v], levels[u] + 1);
  }
  const byLevel = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const L = levels[i];
    if (!byLevel.has(L)) byLevel.set(L, []);
    byLevel.get(L)!.push(i);
  }
  const maxL = Math.max(0, ...levels);
  const nodes: VizNode[] = [];
  for (let L = 0; L <= maxL; L++) {
    const row = byLevel.get(L) || [];
    row.forEach((id, idx) => {
      const x = maxL === 0 ? width / 2 : 36 + (L * (width - 72)) / maxL;
      const y =
        row.length === 1
          ? height / 2
          : 36 + (idx * (height - 72)) / Math.max(1, row.length - 1);
      nodes.push({ id: String(id), label: String(id), x, y });
    });
  }
  return { nodes, topo, levels };
}

export function undirectedEdgeId(u: number | string, v: number | string) {
  const a = String(u);
  const b = String(v);
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function directedEdgeId(u: number | string, v: number | string) {
  return `${u}->${v}`;
}
