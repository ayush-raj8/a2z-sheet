import { directedEdgeId, layoutGraphCircle } from '../layout';
import type { VizEdge, VizFrame, VizNode, VizSource, VizSpec } from '../types';

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

/** Tiny graph where FIFO+early-settle gets dist[2] wrong (100 instead of 2). */
export const WHY_PQ_GRAPH = {
  n: 3,
  edges: [
    [0, 1, 1],
    [0, 2, 100],
    [1, 2, 1],
  ] as Array<[number, number, number]>,
  src: 0,
};

export type DijkstraVizMode = 'standard' | 'fifoWrong' | 'pqCorrect';

/** Canonical optimal — line ranges must match this string exactly. */
const DIJKSTRA_PQ_CODE = `import heapq
from collections import defaultdict

def dijkstra(n, edges, src=0):
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    h = [(0, src)]
    while h:
        d, u = heapq.heappop(h)
        if d != dist[u]:
            continue  # stale
        for v, w in g[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(h, (nd, v))
    return dist`;

const DIJKSTRA_PQ_SOURCE: VizSource = {
  language: 'python',
  title: 'Optimal (min-heap)',
  code: DIJKSTRA_PQ_CODE,
  steps: {
    init: [8, 10],
    pop: [12, 14],
    relax: [15, 19],
    done: 20,
  },
};

const DIJKSTRA_FIFO_CODE = `from collections import deque, defaultdict

def dijkstra_fifo_wrong(n, edges, src=0):
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
    dist = [float('inf')] * n
    dist[src] = 0
    q = deque([(0, src)])
    settled = [False] * n
    while q:
        d, u = q.popleft()  # FIFO — not closest-first
        if settled[u]:
            continue
        dist[u] = d          # freeze FIFO-front label
        settled[u] = True
        for v, w in g[u]:
            if settled[v]:
                continue
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                q.append((nd, v))
    return dist`;

const DIJKSTRA_FIFO_SOURCE: VizSource = {
  language: 'python',
  title: 'FIFO + settle (buggy)',
  code: DIJKSTRA_FIFO_CODE,
  steps: {
    init: [7, 10],
    skip: [13, 14],
    settle: [15, 16],
    relax: [17, 23],
    done: 24,
  },
};

function edgeObjs(edges: Array<[number, number, number]>): VizEdge[] {
  return edges.map(([u, v, w]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
    directed: true,
  }));
}

function withDist(base: VizNode[], dist: number[]): VizNode[] {
  return base.map((node) => ({
    ...node,
    sub: dist[Number(node.id)] === Infinity ? '∞' : `d=${dist[Number(node.id)]}`,
  }));
}

function buildAdj(n: number, edges: Array<[number, number, number]>) {
  const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) g[u].push([v, w]);
  return g;
}

/** FIFO queue + settle on first pop → wrong on WHY_PQ_GRAPH. */
function buildFifoWrong(): VizSpec {
  const { n, edges, src } = WHY_PQ_GRAPH;
  const base = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges);
  const g = buildAdj(n, edges);
  const dist = Array(n).fill(Infinity);
  dist[src] = 0;
  const settled = Array(n).fill(false);
  type Item = [number, number];
  const q: Item[] = [[0, src]];
  const frames: VizFrame[] = [];
  const visited: string[] = [];

  const fmt = () => dist.map((d) => (d === Infinity ? '∞' : String(d))).join(',');

  frames.push({
    step: 'init',
    caption: 'FIFO “Dijkstra”: settle on first pop — will freeze a bad label',
    nodes: withDist(base, dist),
    edges: eObjs,
    active: [String(src)],
    queue: q.map(([d, u]) => `${u}@${d}`),
    aux: { dist: fmt(), structure: 'queue (FIFO)' },
  });

  while (q.length) {
    const [d, u] = q.shift()!;
    if (settled[u]) {
      frames.push({
        step: 'skip',
        caption: `Skip ${u}@${d} — already settled (better label wasted!)`,
        nodes: withDist(base, dist),
        edges: eObjs,
        visited: [...visited],
        queue: q.map(([dd, uu]) => `${uu}@${dd}`),
        aux: { dist: fmt() },
      });
      continue;
    }
    dist[u] = d;
    settled[u] = true;
    visited.push(String(u));
    frames.push({
      step: 'settle',
      caption: `Settle ${u} at ${d} from FIFO front (not closest-first!)`,
      nodes: withDist(base, dist),
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: q.map(([dd, uu]) => `${uu}@${dd}`),
      aux: { dist: fmt(), settled: String(u) },
    });
    for (const [v, w] of g[u]) {
      if (settled[v]) continue;
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        q.push([nd, v]);
        frames.push({
          step: 'relax',
          caption: `Relax ${u}→${v} (w=${w}) → dist[${v}]=${nd}, push back of queue`,
          nodes: withDist(base, dist),
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
          visited: [...visited],
          queue: q.map(([dd, uu]) => `${uu}@${dd}`),
          aux: { dist: fmt() },
        });
      }
    }
  }

  const out = dist.map((d) => (d === Infinity ? -1 : d));
  frames.push({
    step: 'done',
    caption: `WRONG result dist=${JSON.stringify(out)}  (true is [0,1,2]) — FIFO settled 2 too early`,
    nodes: withDist(base, dist),
    edges: eObjs,
    visited: [...visited],
    aux: { dist: out.join(','), expected: '0,1,2', ok: 'false' },
  });

  return {
    kit: 'dijkstra',
    title: 'FIFO queue (wrong)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: '[0, 1, 100]  // buggy — true answer [0,1,2]',
    source: DIJKSTRA_FIFO_SOURCE,
    frames,
  };
}

/** Same graph with min-heap → correct. */
function buildPqCorrect(): VizSpec {
  const { n, edges, src } = WHY_PQ_GRAPH;
  const base = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges);
  const g = buildAdj(n, edges);
  const dist = Array(n).fill(Infinity);
  dist[src] = 0;
  type Item = [number, number];
  const pq: Item[] = [[0, src]];
  const frames: VizFrame[] = [];
  const visited: string[] = [];

  const fmt = () => dist.map((d) => (d === Infinity ? '∞' : String(d))).join(',');

  frames.push({
    step: 'init',
    caption: 'Min-heap Dijkstra — always pop the smallest tentative distance',
    nodes: withDist(base, dist),
    edges: eObjs,
    active: [String(src)],
    queue: pq.map(([d, u]) => `${u}@${d}`),
    aux: { dist: fmt(), structure: 'min-heap PQ' },
  });

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (d !== dist[u]) {
      frames.push({
        step: 'pop',
        caption: `Stale ${u}@${d} (dist[${u}]=${dist[u]}) — skip`,
        nodes: withDist(base, dist),
        edges: eObjs,
        visited: [...visited],
        queue: [...pq].sort((a, b) => a[0] - b[0]).map(([dd, uu]) => `${uu}@${dd}`),
        aux: { dist: fmt(), stale: `${u}@${d}` },
      });
      continue;
    }
    visited.push(String(u));
    frames.push({
      step: 'pop',
      caption: `Pop closest ${u}@${d} — final (weights ≥ 0)`,
      nodes: withDist(base, dist),
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: [...pq].sort((a, b) => a[0] - b[0]).map(([dd, uu]) => `${uu}@${dd}`),
      aux: { dist: fmt() },
    });
    for (const [v, w] of g[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        pq.push([nd, v]);
        frames.push({
          step: 'relax',
          caption: `Relax ${u}→${v} (w=${w}) → dist[${v}]=${nd}, push heap`,
          nodes: withDist(base, dist),
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
          visited: [...visited],
          queue: [...pq].sort((a, b) => a[0] - b[0]).map(([dd, uu]) => `${uu}@${dd}`),
          aux: { dist: fmt() },
        });
      }
    }
  }

  const out = dist.map((d) => (d === Infinity ? -1 : d));
  frames.push({
    step: 'done',
    caption: `Correct dist=${JSON.stringify(out)} — PQ popped 2@2 before stale 2@100`,
    nodes: withDist(base, dist),
    edges: eObjs,
    visited: [...visited],
    aux: { dist: out.join(','), ok: 'true' },
  });

  return {
    kit: 'dijkstra',
    title: 'Priority queue (correct)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: JSON.stringify(out),
    source: DIJKSTRA_PQ_SOURCE,
    frames,
  };
}

export function buildDijkstra(mode: DijkstraVizMode = 'standard'): VizSpec {
  if (mode === 'fifoWrong') return buildFifoWrong();
  if (mode === 'pqCorrect') return buildPqCorrect();

  const { n, edges, src } = DEFAULT_DIJKSTRA;
  const base = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges);
  const g = buildAdj(n, edges);

  const dist = Array(n).fill(Infinity);
  dist[src] = 0;
  type Item = [number, number];
  const pq: Item[] = [[0, src]];
  const frames: VizFrame[] = [];
  const visited: string[] = [];

  const fmtDist = () => dist.map((d) => (d === Infinity ? '∞' : String(d))).join(',');

  frames.push({
    step: 'init',
    caption: `Dijkstra from ${src} — dist[${src}]=0`,
    nodes: withDist(base, dist),
    edges: eObjs,
    active: [String(src)],
    queue: pq.map(([d, u]) => `${u}@${d}`),
    aux: { dist: fmtDist() },
  });

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (d !== dist[u]) continue;
    visited.push(String(u));
    frames.push({
      step: 'pop',
      caption: `Settle node ${u} with distance ${d}`,
      nodes: withDist(base, dist),
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: [...pq].sort((a, b) => a[0] - b[0]).map(([dd, uu]) => `${uu}@${dd}`),
      aux: { dist: fmtDist() },
    });
    for (const [v, w] of g[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
        frames.push({
          step: 'relax',
          caption: `Relax ${u}→${v} (w=${w}) → dist[${v}]=${dist[v]}`,
          nodes: withDist(base, dist),
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
          visited: [...visited],
          queue: [...pq].sort((a, b) => a[0] - b[0]).map(([dd, uu]) => `${uu}@${dd}`),
          aux: { dist: fmtDist() },
        });
      }
    }
  }

  const out = dist.map((d) => (d === Infinity ? -1 : d));
  frames.push({
    step: 'done',
    caption: `Done. dist=${JSON.stringify(out)}`,
    nodes: withDist(base, dist),
    edges: eObjs,
    visited: [...visited],
    queue: [],
    aux: { dist: out.join(',') },
  });

  return {
    kit: 'dijkstra',
    title: 'Dijkstra (min-heap)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: JSON.stringify(out),
    source: DIJKSTRA_PQ_SOURCE,
    frames,
  };
}

/** Topic #360 — contrast FIFO bug vs PQ. */
export function buildWhyPriorityQueue(): VizSpec[] {
  return [buildFifoWrong(), buildPqCorrect()];
}
