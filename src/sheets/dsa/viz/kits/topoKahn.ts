import { DEFAULT_DG } from './graphWalk';
import { directedEdgeId, layoutGraphCircle } from '../layout';
import type { VizEdge, VizFrame, VizSpec } from '../types';

export function buildTopoKahn(): VizSpec {
  const { n, edges } = DEFAULT_DG;
  const nodes = layoutGraphCircle(n);
  const eObjs: VizEdge[] = edges.map(([u, v]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    directed: true,
  }));
  const g: number[][] = Array.from({ length: n }, () => []);
  const indeg = Array(n).fill(0);
  for (const [u, v] of edges) {
    g[u].push(v);
    indeg[v]++;
  }

  const frames: VizFrame[] = [];
  const q: number[] = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const order: string[] = [];
  const visited: string[] = [];

  frames.push({
    caption: 'Kahn: enqueue all indegree-0 nodes',
    nodes,
    edges: eObjs,
    queue: q.map(String),
    aux: { indeg: indeg.join(',') },
  });

  while (q.length) {
    const u = q.shift()!;
    order.push(String(u));
    visited.push(String(u));
    for (const v of g[u]) {
      indeg[v]--;
      if (indeg[v] === 0) q.push(v);
    }
    frames.push({
      caption: `Take ${u}, decrement neighbors' indegree`,
      nodes,
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: q.map(String),
      output: [...order],
      aux: { indeg: indeg.join(',') },
    });
  }

  const ok = order.length === n;
  frames.push({
    caption: ok ? `Topo order = [${order.join(', ')}]` : 'Cycle detected (order incomplete)',
    nodes,
    edges: eObjs,
    visited: [...visited],
    output: [...order],
    aux: { ok: String(ok) },
  });

  return {
    kit: 'topoKahn',
    title: "Kahn's algorithm (BFS topo)",
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}  // directed`,
    expectedOutput: ok ? `[${order.join(', ')}]` : 'cycle',
    frames,
  };
}
