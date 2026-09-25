import { directedEdgeId, layoutGraphCircle } from '../layout';
import type { VizEdge, VizFrame, VizSpec } from '../types';

/** Matches dijkstra(n, edges, src) blog signature — directed weighted. */
export const DEFAULT_DIJKSTRA = {
  n: 5,
  edges: [
    [0, 1, 2],
    [0, 2, 4],
    [1, 2, 1],
    [1, 3, 7],
    [2, 4, 3],
    [3, 4, 1],
  ] as Array<[number, number, number]>,
  src: 0,
};

export function buildDijkstra(): VizSpec {
  const { n, edges, src } = DEFAULT_DIJKSTRA;
  const nodes = layoutGraphCircle(n);
  const eObjs: VizEdge[] = edges.map(([u, v, w]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
    directed: true,
  }));
  const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) g[u].push([v, w]);

  const dist = Array(n).fill(Infinity);
  dist[src] = 0;
  const done = Array(n).fill(false);
  type Item = [number, number];
  const pq: Item[] = [[0, src]];
  const frames: VizFrame[] = [];
  const visited: string[] = [];

  const fmtDist = () => dist.map((d) => (d === Infinity ? '∞' : String(d))).join(',');

  frames.push({
    caption: `Dijkstra from ${src} — dist[${src}]=0`,
    nodes,
    edges: eObjs,
    active: [String(src)],
    queue: pq.map(([d, u]) => `${u}@${d}`),
    aux: { dist: fmtDist() },
  });

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (done[u]) continue;
    if (d !== dist[u]) continue;
    done[u] = true;
    visited.push(String(u));
    frames.push({
      caption: `Settle node ${u} with distance ${d}`,
      nodes,
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: pq.map(([dd, uu]) => `${uu}@${dd}`),
      aux: { dist: fmtDist() },
    });
    for (const [v, w] of g[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
        frames.push({
          caption: `Relax ${u}→${v} (w=${w}) → dist[${v}]=${dist[v]}`,
          nodes,
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
          visited: [...visited],
          queue: pq.map(([dd, uu]) => `${uu}@${dd}`),
          aux: { dist: fmtDist() },
        });
      }
    }
  }

  const out = dist.map((d) => (d === Infinity ? -1 : d));
  frames.push({
    caption: `Done. dist=${JSON.stringify(out)}`,
    nodes,
    edges: eObjs,
    visited: [...visited],
    queue: [],
    aux: { dist: out.join(',') },
  });

  return {
    kit: 'dijkstra',
    title: 'Dijkstra (min-heap relaxations)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: JSON.stringify(out),
    frames,
  };
}
