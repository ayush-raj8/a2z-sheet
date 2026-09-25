import { layoutGraphCircle, undirectedEdgeId } from '../layout';
import type { MstMode, VizEdge, VizFrame, VizSpec } from '../types';

/** Undirected weighted graph for Prim/Kruskal demos. */
export const DEFAULT_MST = {
  n: 5,
  edges: [
    [0, 1, 2],
    [0, 3, 6],
    [1, 2, 3],
    [1, 3, 8],
    [1, 4, 5],
    [2, 4, 7],
    [3, 4, 9],
  ] as Array<[number, number, number]>,
};

export function buildMst(mode: MstMode = 'kruskal'): VizSpec {
  const { n, edges } = DEFAULT_MST;
  const nodes = layoutGraphCircle(n);
  const allEdges: VizEdge[] = edges.map(([u, v, w]) => ({
    id: undirectedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
  }));
  const frames: VizFrame[] = [];

  if (mode === 'kruskal') {
    const sorted = [...edges].sort((a, b) => a[2] - b[2]);
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const mst: Array<[number, number, number]> = [];
    let cost = 0;

    frames.push({
      caption: 'Kruskal: sort edges by weight',
      nodes,
      edges: allEdges,
      aux: { sorted: sorted.map(([u, v, w]) => `${u}-${v}:${w}`).join('  ') },
    });

    for (const [u, v, w] of sorted) {
      const ru = find(u);
      const rv = find(v);
      frames.push({
        caption: `Consider ${u}-${v} (w=${w})`,
        nodes,
        edges: allEdges,
        active: [String(u), String(v)],
        activeEdges: [undirectedEdgeId(u, v)],
        visited: mst.flatMap(([a, b]) => [String(a), String(b)]),
        aux: { cost: String(cost) },
      });
      if (ru === rv) {
        frames.push({
          caption: `Skip ${u}-${v} — would form a cycle`,
          nodes,
          edges: allEdges,
          active: [String(u), String(v)],
          activeEdges: [undirectedEdgeId(u, v)],
          visited: mst.flatMap(([a, b]) => [String(a), String(b)]),
        });
        continue;
      }
      parent[ru] = rv;
      mst.push([u, v, w]);
      cost += w;
      frames.push({
        caption: `Take ${u}-${v}. MST cost=${cost}`,
        nodes,
        edges: allEdges,
        active: [String(u), String(v)],
        activeEdges: mst.map(([a, b]) => undirectedEdgeId(a, b)),
        visited: mst.flatMap(([a, b]) => [String(a), String(b)]),
        output: mst.map(([a, b, ww]) => `${a}-${b}:${ww}`),
        aux: { cost: String(cost) },
      });
      if (mst.length === n - 1) break;
    }

    frames.push({
      caption: `MST complete — cost ${cost}`,
      nodes,
      edges: allEdges,
      activeEdges: mst.map(([a, b]) => undirectedEdgeId(a, b)),
      visited: Array.from({ length: n }, (_, i) => String(i)),
      output: [String(cost)],
      aux: { cost: String(cost) },
    });

    return {
      kit: 'mst',
      title: "Kruskal's MST",
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}`,
      expectedOutput: `cost=${cost}`,
      frames,
    };
  }

  // Prim
  const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) {
    g[u].push([v, w]);
    g[v].push([u, w]);
  }
  const inMst = Array(n).fill(false);
  type EdgeCand = [number, number, number]; // w,u,v
  const pq: EdgeCand[] = [];
  const mst: Array<[number, number, number]> = [];
  let cost = 0;
  const start = 0;
  inMst[start] = true;
  for (const [v, w] of g[start]) pq.push([w, start, v]);

  frames.push({
    caption: `Prim: start at ${start}, seed frontier edges`,
    nodes,
    edges: allEdges,
    active: [String(start)],
    visited: [String(start)],
    queue: pq.map(([w, u, v]) => `${u}-${v}:${w}`),
  });

  while (pq.length && mst.length < n - 1) {
    pq.sort((a, b) => a[0] - b[0]);
    const [w, u, v] = pq.shift()!;
    frames.push({
      caption: `Pop lightest frontier ${u}-${v} (w=${w})`,
      nodes,
      edges: allEdges,
      active: [String(u), String(v)],
      activeEdges: [undirectedEdgeId(u, v)],
      visited: inMst.map((x, i) => (x ? String(i) : '')).filter(Boolean),
      queue: pq.map(([ww, a, b]) => `${a}-${b}:${ww}`),
    });
    if (inMst[v]) continue;
    inMst[v] = true;
    mst.push([u, v, w]);
    cost += w;
    for (const [to, ww] of g[v]) {
      if (!inMst[to]) pq.push([ww, v, to]);
    }
    frames.push({
      caption: `Add ${u}-${v}. cost=${cost}`,
      nodes,
      edges: allEdges,
      active: [String(v)],
      activeEdges: mst.map(([a, b]) => undirectedEdgeId(a, b)),
      visited: inMst.map((x, i) => (x ? String(i) : '')).filter(Boolean),
      output: mst.map(([a, b, ww]) => `${a}-${b}:${ww}`),
      aux: { cost: String(cost) },
      queue: pq.map(([ww, a, b]) => `${a}-${b}:${ww}`),
    });
  }

  frames.push({
    caption: `Prim MST cost=${cost}`,
    nodes,
    edges: allEdges,
    activeEdges: mst.map(([a, b]) => undirectedEdgeId(a, b)),
    visited: Array.from({ length: n }, (_, i) => String(i)),
    output: [String(cost)],
  });

  return {
    kit: 'mst',
    title: "Prim's MST",
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, start=0`,
    expectedOutput: `cost=${cost}`,
    frames,
  };
}
