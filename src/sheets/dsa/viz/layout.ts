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

export function undirectedEdgeId(u: number | string, v: number | string) {
  const a = String(u);
  const b = String(v);
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function directedEdgeId(u: number | string, v: number | string) {
  return `${u}->${v}`;
}
