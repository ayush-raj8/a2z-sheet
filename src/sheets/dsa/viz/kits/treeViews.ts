import { layoutBinaryTree, treeEdges, viewsBinaryTree } from '../layout';
import type { TreeViewMode, VizFrame, VizSpec } from '../types';

type Item = { id: string; val: number; hd: number; depth: number };

function collect(root: ReturnType<typeof viewsBinaryTree>): Item[] {
  const out: Item[] = [];
  function walk(n: typeof root | null | undefined, hd: number, depth: number) {
    if (!n) return;
    out.push({ id: n.id, val: n.val, hd, depth });
    walk(n.left, hd - 1, depth + 1);
    walk(n.right, hd + 1, depth + 1);
  }
  walk(root, 0, 0);
  return out;
}

export function buildTreeViews(mode: TreeViewMode = 'top'): VizSpec {
  const root = viewsBinaryTree();
  const nodes = layoutBinaryTree(root, 440, 58);
  const edges = treeEdges(root);
  const items = collect(root);
  const frames: VizFrame[] = [];

  frames.push({
    caption: 'Assign horizontal distance (hd): left −1, right +1',
    nodes,
    edges,
    aux: { note: 'root hd=0' },
  });

  // show hd labels gradually
  for (const it of items) {
    frames.push({
      caption: `Node ${it.val} → hd=${it.hd}, depth=${it.depth}`,
      nodes,
      edges,
      active: [it.id],
      visited: items.filter((x) => x.depth < it.depth || (x.depth === it.depth && x.hd <= it.hd)).map((x) => x.id),
      aux: { hd: String(it.hd), depth: String(it.depth) },
    });
  }

  const byHd = new Map<number, Item[]>();
  for (const it of items) {
    if (!byHd.has(it.hd)) byHd.set(it.hd, []);
    byHd.get(it.hd)!.push(it);
  }
  const hds = [...byHd.keys()].sort((a, b) => a - b);

  let result: string[] = [];
  let highlight: string[] = [];

  if (mode === 'top') {
    for (const hd of hds) {
      const col = byHd.get(hd)!.slice().sort((a, b) => a.depth - b.depth);
      const pick = col[0];
      highlight.push(pick.id);
      result.push(String(pick.val));
      frames.push({
        caption: `Top view: hd=${hd} keeps shallowest → ${pick.val}`,
        nodes,
        edges,
        active: [pick.id],
        visited: [...highlight],
        output: [...result],
        aux: { hd: String(hd) },
      });
    }
  } else if (mode === 'bottom') {
    for (const hd of hds) {
      const col = byHd.get(hd)!.slice().sort((a, b) => b.depth - a.depth);
      const pick = col[0];
      highlight.push(pick.id);
      result.push(String(pick.val));
      frames.push({
        caption: `Bottom view: hd=${hd} keeps deepest → ${pick.val}`,
        nodes,
        edges,
        active: [pick.id],
        visited: [...highlight],
        output: [...result],
        aux: { hd: String(hd) },
      });
    }
  } else if (mode === 'vertical') {
    for (const hd of hds) {
      const col = byHd.get(hd)!.slice().sort((a, b) => a.depth - b.depth || a.val - b.val);
      for (const pick of col) {
        highlight.push(pick.id);
        result.push(String(pick.val));
      }
      frames.push({
        caption: `Vertical column hd=${hd}: [${col.map((c) => c.val).join(', ')}]`,
        nodes,
        edges,
        active: col.map((c) => c.id),
        visited: [...highlight],
        output: [...result],
        aux: { hd: String(hd) },
      });
    }
  } else {
    // boundary: left boundary + leaves + right boundary (rev)
    const left: Item[] = [];
    const right: Item[] = [];
    const leaves: Item[] = [];

    function leftBound(n: typeof root | null | undefined) {
      if (!n) return;
      if (n.left || n.right) left.push(items.find((x) => x.id === n.id)!);
      if (n.left) leftBound(n.left);
      else if (n.right) leftBound(n.right);
    }
    function rightBound(n: typeof root | null | undefined) {
      if (!n) return;
      if (n.left || n.right) right.push(items.find((x) => x.id === n.id)!);
      if (n.right) rightBound(n.right);
      else if (n.left) rightBound(n.left);
    }
    function leafWalk(n: typeof root | null | undefined) {
      if (!n) return;
      if (!n.left && !n.right) leaves.push(items.find((x) => x.id === n.id)!);
      leafWalk(n.left);
      leafWalk(n.right);
    }
    leftBound(root);
    leafWalk(root);
    rightBound(root);
    right.reverse();
    // drop root from right if duplicated
    const seen = new Set<string>();
    const order = [...left, ...leaves, ...right].filter((x) => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });

    frames.push({
      caption: `Left boundary: [${left.map((x) => x.val).join(', ')}]`,
      nodes,
      edges,
      active: left.map((x) => x.id),
      output: left.map((x) => String(x.val)),
    });
    frames.push({
      caption: `Leaves L→R: [${leaves.map((x) => x.val).join(', ')}]`,
      nodes,
      edges,
      active: leaves.map((x) => x.id),
      visited: left.map((x) => x.id),
      output: [...left, ...leaves].map((x) => String(x.val)),
    });
    frames.push({
      caption: `Right boundary (bottom-up): [${right.map((x) => x.val).join(', ')}]`,
      nodes,
      edges,
      active: right.map((x) => x.id),
      visited: [...left, ...leaves].map((x) => x.id),
    });
    result = order.map((x) => String(x.val));
    highlight = order.map((x) => x.id);
    frames.push({
      caption: `Boundary = [${result.join(', ')}]`,
      nodes,
      edges,
      visited: highlight,
      output: result,
    });
  }

  const titles: Record<TreeViewMode, string> = {
    top: 'Top view (HD map)',
    bottom: 'Bottom view (HD map)',
    vertical: 'Vertical order (HD columns)',
    boundary: 'Boundary traversal',
  };

  return {
    kit: 'treeViews',
    title: titles[mode],
    inputSummary:
      'Tree: 1→(2→(4,5), 3→(6→(·,8), 7))  // hd(root)=0',
    expectedOutput: `[${result.join(', ')}]`,
    frames,
  };
}
