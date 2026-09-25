import { layoutBinaryTree, treeEdges, viewsBinaryTree } from '../layout';
import type { TreePathMode, VizFrame, VizSpec } from '../types';

type BinNode = ReturnType<typeof viewsBinaryTree>;

function parentsMap(root: BinNode): Map<string, string | null> {
  const p = new Map<string, string | null>();
  p.set(root.id, null);
  function walk(n: BinNode) {
    if (n.left) {
      p.set(n.left.id, n.id);
      walk(n.left);
    }
    if (n.right) {
      p.set(n.right.id, n.id);
      walk(n.right);
    }
  }
  walk(root);
  return p;
}

function pathToRoot(id: string, parents: Map<string, string | null>): string[] {
  const path: string[] = [];
  let cur: string | null = id;
  while (cur) {
    path.push(cur);
    cur = parents.get(cur) ?? null;
  }
  return path;
}

export function buildTreePaths(mode: TreePathMode = 'rootToNode'): VizSpec {
  const root = viewsBinaryTree();
  const nodes = layoutBinaryTree(root, 440, 58);
  const edges = treeEdges(root);
  const parents = parentsMap(root);
  const frames: VizFrame[] = [];
  const valOf = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;

  if (mode === 'rootToNode') {
    const target = '8';
    const path = pathToRoot(target, parents).reverse();
    frames.push({
      caption: `Find path root → ${valOf(target)}`,
      nodes,
      edges,
      active: [root.id],
    });
    const built: string[] = [];
    for (const id of path) {
      built.push(id);
      frames.push({
        caption: `Include ${valOf(id)}`,
        nodes,
        edges,
        active: [id],
        visited: [...built],
        output: built.map(valOf),
      });
    }
    return {
      kit: 'treePaths',
      title: 'Root to node path',
      inputSummary: `Tree views-demo, target=${valOf(target)}`,
      expectedOutput: `[${built.map(valOf).join(', ')}]`,
      frames,
    };
  }

  if (mode === 'lca') {
    const a = '4';
    const b = '8';
    const pa = pathToRoot(a, parents).reverse();
    const pb = pathToRoot(b, parents).reverse();
    frames.push({
      caption: `LCA(${valOf(a)}, ${valOf(b)}) — walk both root paths`,
      nodes,
      edges,
      active: [a, b],
    });
    let i = 0;
    while (i < pa.length && i < pb.length && pa[i] === pb[i]) {
      frames.push({
        caption: `Common ancestor so far: ${valOf(pa[i])}`,
        nodes,
        edges,
        active: [pa[i]],
        visited: pa.slice(0, i + 1),
        output: [valOf(pa[i])],
      });
      i++;
    }
    const lca = pa[i - 1];
    frames.push({
      caption: `LCA = ${valOf(lca)}`,
      nodes,
      edges,
      active: [lca],
      visited: [a, b, lca],
      output: [valOf(lca)],
    });
    return {
      kit: 'treePaths',
      title: 'LCA in binary tree',
      inputSummary: `nodes ${valOf(a)} & ${valOf(b)}`,
      expectedOutput: valOf(lca),
      frames,
    };
  }

  if (mode === 'nodesAtK') {
    const target = '5';
    const K = 2;
    // build undirected adj via parents
    const adj = new Map<string, string[]>();
    for (const [id, p] of parents) {
      if (!adj.has(id)) adj.set(id, []);
      if (p) {
        adj.get(id)!.push(p);
        if (!adj.has(p)) adj.set(p, []);
        adj.get(p)!.push(id);
      }
    }
    const q = [target];
    const dist = new Map<string, number>([[target, 0]]);
    frames.push({
      caption: `BFS from ${valOf(target)}, collect dist==${K}`,
      nodes,
      edges,
      active: [target],
      queue: [valOf(target)],
      aux: { K: String(K) },
    });
    const atK: string[] = [];
    while (q.length) {
      const u = q.shift()!;
      const d = dist.get(u)!;
      if (d === K) atK.push(u);
      if (d >= K) continue;
      for (const v of adj.get(u) || []) {
        if (dist.has(v)) continue;
        dist.set(v, d + 1);
        q.push(v);
      }
      frames.push({
        caption: `Visit ${valOf(u)} at dist ${d}`,
        nodes,
        edges,
        active: [u],
        visited: [...dist.keys()],
        queue: q.map(valOf),
        output: atK.map(valOf),
        aux: { K: String(K), dist: String(d) },
      });
    }
    frames.push({
      caption: `Nodes at distance ${K}: [${atK.map(valOf).join(', ')}]`,
      nodes,
      edges,
      visited: atK,
      output: atK.map(valOf),
    });
    return {
      kit: 'treePaths',
      title: 'Nodes at distance K',
      inputSummary: `start=${valOf(target)}, K=${K}`,
      expectedOutput: `[${atK.map(valOf).join(', ')}]`,
      frames,
    };
  }

  // burn tree from a node
  const start = '5';
  const adj = new Map<string, string[]>();
  for (const [id, p] of parents) {
    if (!adj.has(id)) adj.set(id, []);
    if (p) {
      adj.get(id)!.push(p);
      if (!adj.has(p)) adj.set(p, []);
      adj.get(p)!.push(id);
    }
  }
  const q = [start];
  const burned = new Set<string>([start]);
  let minutes = 0;
  frames.push({
    caption: `Ignite ${valOf(start)} at t=0`,
    nodes,
    edges,
    active: [start],
    visited: [start],
    aux: { t: '0' },
  });
  while (q.length) {
    const size = q.length;
    let spread = false;
    for (let i = 0; i < size; i++) {
      const u = q.shift()!;
      for (const v of adj.get(u) || []) {
        if (burned.has(v)) continue;
        burned.add(v);
        q.push(v);
        spread = true;
      }
    }
    if (!spread) break;
    minutes++;
    frames.push({
      caption: `t=${minutes}: fire reaches [${[...burned].map(valOf).join(', ')}]`,
      nodes,
      edges,
      active: q.map(String),
      visited: [...burned],
      aux: { t: String(minutes), burning: String(burned.size) },
    });
  }
  frames.push({
    caption: `Tree burned in ${minutes} minutes`,
    nodes,
    edges,
    visited: [...burned],
    output: [String(minutes)],
    aux: { answer: String(minutes) },
  });

  return {
    kit: 'treePaths',
    title: 'Burn binary tree from a node',
    inputSummary: `start=${valOf(start)} (parent pointers + BFS)`,
    expectedOutput: String(minutes),
    frames,
  };
}
