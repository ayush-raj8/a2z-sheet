import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';
import { directedEdgeId, layoutGraphCircle } from '../layout';

const PQ_CODE = `import heapq
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

const FIFO_CODE = `from collections import deque, defaultdict

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

export const WHY_PQ_GRAPH = {
  n: 3,
  edges: [
    [0, 1, 1],
    [0, 2, 100],
    [1, 2, 1],
  ] as Array<[number, number, number]>,
  src: 0,
};

function edgeObjs(edges: Array<[number, number, number]>) {
  return edges.map(([u, v, w]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
    directed: true,
  }));
}

function withDist(
  base: Array<{ id: string; label: string; x: number; y: number }>,
  dist: number[],
) {
  return base.map((node) => ({
    ...node,
    sub: dist[Number(node.id)] === Infinity ? '∞' : `d=${dist[Number(node.id)]}`,
  }));
}

function heapLabels(pq: Array<[number, number]>) {
  return [...pq]
    .sort((a, b) => a[0] - b[0])
    .map(([d, u]) => `${u}@${d}`);
}

function runDijkstraPq(
  n: number,
  edges: Array<[number, number, number]>,
  src: number,
  title: string,
  id: string,
): ExecutionTimeline {
  const base = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges);
  const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) g[u].push([v, w]);

  const dist = Array(n).fill(Infinity);
  const pq: Array<[number, number]> = [];
  const visited: string[] = [];
  const b = new TimelineBuilder();

  const canvasBase = () => ({
    nodes: withDist(base, dist),
    edges: eObjs,
    visited: [...visited],
    queue: heapLabels(pq),
  });

  const structs = (extra?: Parameters<typeof structuresOf>[0]) =>
    structuresOf(
      {
        kind: 'array',
        label: 'dist',
        values: dist.map((d) => (d === Infinity ? '∞' : d)),
      },
      {
        kind: 'heap',
        label: 'min-heap (d,u)',
        min: true,
        values: heapLabels(pq),
      },
      {
        kind: 'vars',
        label: 'vars',
        entries: { src, settled: visited.join(',') || '—' },
      },
      extra,
    );

  // L8 dist = [inf]*n
  dist.fill(Infinity);
  b.at(8, 'Allocate dist[] = ∞', {
    event: 'init',
    structures: structs(),
    canvas: { ...canvasBase(), active: [] },
  });

  // L9 dist[src]=0
  dist[src] = 0;
  b.at(9, `dist[${src}] = 0`, {
    event: 'init',
    structures: structs(),
    canvas: { ...canvasBase(), active: [String(src)] },
  });

  // L10 push
  pq.push([0, src]);
  b.at(10, `Push (${0}, ${src}) onto min-heap`, {
    event: 'init',
    structures: structs(),
    canvas: { ...canvasBase(), active: [String(src)] },
  });

  while (pq.length) {
    pq.sort((a, b2) => a[0] - b2[0]);
    const [d, u] = pq.shift()!;

    b.at(12, `heappop → (${d}, ${u})`, {
      event: 'pop',
      structures: structs({ kind: 'vars', label: 'vars', entries: { d, u, src } }),
      canvas: { ...canvasBase(), active: [String(u)] },
    });

    if (d !== dist[u]) {
      b.at(13, `Stale? d=${d} != dist[${u}]=${dist[u]}`, {
        event: 'stale',
        structures: structs({ kind: 'vars', label: 'vars', entries: { d, u, 'dist[u]': dist[u] } }),
        canvas: { ...canvasBase(), active: [String(u)] },
      });
      b.at(14, 'continue — skip stale entry', {
        event: 'stale',
        structures: structs(),
        canvas: canvasBase(),
      });
      continue;
    }

    b.at(13, `d == dist[${u}] — accept (final for non-neg weights)`, {
      event: 'settle',
      structures: structs({ kind: 'vars', label: 'vars', entries: { d, u } }),
      canvas: { ...canvasBase(), active: [String(u)] },
    });
    visited.push(String(u));

    for (const [v, w] of g[u]) {
      b.at(15, `Edge ${u}→${v} (w=${w})`, {
        event: 'edge',
        structures: structs({ kind: 'vars', label: 'vars', entries: { u, v, w } }),
        canvas: {
          ...canvasBase(),
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
        },
      });

      const nd = d + w;
      b.at(16, `nd = ${d} + ${w} = ${nd}`, {
        event: 'relax',
        structures: structs({ kind: 'vars', label: 'vars', entries: { nd, 'dist[v]': dist[v] === Infinity ? '∞' : dist[v] } }),
        canvas: {
          ...canvasBase(),
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
        },
      });

      b.at(17, `Improve? ${nd} < dist[${v}] (${dist[v] === Infinity ? '∞' : dist[v]})`, {
        event: 'relax',
        structures: structs(),
        canvas: {
          ...canvasBase(),
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
        },
      });

      if (nd < dist[v]) {
        dist[v] = nd;
        b.at(18, `dist[${v}] = ${nd}`, {
          event: 'relax',
          structures: structs(),
          canvas: {
            ...canvasBase(),
            active: [String(v)],
            activeEdges: [directedEdgeId(u, v)],
          },
        });
        pq.push([nd, v]);
        b.at(19, `heappush (${nd}, ${v})`, {
          event: 'push',
          structures: structs(),
          canvas: {
            ...canvasBase(),
            active: [String(v)],
            activeEdges: [directedEdgeId(u, v)],
          },
        });
      }
    }
  }

  const out = dist.map((d) => (d === Infinity ? -1 : d));
  b.at(20, `return dist = ${JSON.stringify(out)}`, {
    event: 'done',
    structures: structs(),
    canvas: { ...canvasBase(), active: [], visited: Array.from({ length: n }, (_, i) => String(i)) },
  });

  return {
    id,
    title,
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: JSON.stringify(out),
    source: { language: 'python', title: 'Optimal (min-heap)', code: PQ_CODE },
    meta: {
      visualizationTypes: ['GRAPH', 'HEAP', 'ARRAY', 'VARS'],
      importantVariables: ['dist', 'h', 'd', 'u'],
      importantEvents: ['init', 'pop', 'stale', 'relax', 'push'],
    },
    steps: b.build(),
  };
}

function runFifoWrong(): ExecutionTimeline {
  const { n, edges, src } = WHY_PQ_GRAPH;
  const base = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges);
  const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) g[u].push([v, w]);

  const dist = Array(n).fill(Infinity);
  const settled = Array(n).fill(false);
  const q: Array<[number, number]> = [];
  const visited: string[] = [];
  const b = new TimelineBuilder();

  const canvasBase = () => ({
    nodes: withDist(base, dist),
    edges: eObjs,
    visited: [...visited],
    queue: q.map(([d, u]) => `${u}@${d}`),
  });

  const structs = () =>
    structuresOf(
      {
        kind: 'array',
        label: 'dist',
        values: dist.map((d) => (d === Infinity ? '∞' : d)),
      },
      { kind: 'queue', label: 'FIFO queue', values: q.map(([d, u]) => `${u}@${d}`) },
      {
        kind: 'vars',
        label: 'vars',
        entries: {
          settled: settled.map((s, i) => (s ? i : null)).filter((x) => x != null).join(',') || '—',
        },
      },
    );

  dist.fill(Infinity);
  b.at(7, 'dist[] = ∞', { event: 'init', structures: structs(), canvas: canvasBase() });
  dist[src] = 0;
  b.at(8, `dist[${src}] = 0`, {
    event: 'init',
    structures: structs(),
    canvas: { ...canvasBase(), active: [String(src)] },
  });
  q.push([0, src]);
  b.at(9, `enqueue (${0}, ${src})`, {
    event: 'init',
    structures: structs(),
    canvas: { ...canvasBase(), active: [String(src)] },
  });
  b.at(10, 'settled[] = false', { event: 'init', structures: structs(), canvas: canvasBase() });

  while (q.length) {
    const [d, u] = q.shift()!;
    b.at(12, `popleft → (${d}, ${u})`, {
      event: 'pop',
      structures: structs(),
      canvas: { ...canvasBase(), active: [String(u)] },
    });

    if (settled[u]) {
      b.at(13, `settled[${u}] already true`, {
        event: 'skip',
        structures: structs(),
        canvas: canvasBase(),
      });
      b.at(14, 'continue', { event: 'skip', structures: structs(), canvas: canvasBase() });
      continue;
    }

    dist[u] = d;
    b.at(15, `Freeze dist[${u}] = ${d} (FIFO front — may be wrong!)`, {
      event: 'settle',
      structures: structs(),
      canvas: { ...canvasBase(), active: [String(u)] },
    });
    settled[u] = true;
    visited.push(String(u));
    b.at(16, `settled[${u}] = True`, {
      event: 'settle',
      structures: structs(),
      canvas: { ...canvasBase(), active: [String(u)] },
    });

    for (const [v, w] of g[u]) {
      if (settled[v]) continue;
      const nd = d + w;
      b.at(20, `nd = ${d}+${w}=${nd}`, {
        event: 'relax',
        structures: structs(),
        canvas: {
          ...canvasBase(),
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
        },
      });
      if (nd < dist[v]) {
        dist[v] = nd;
        b.at(22, `dist[${v}] = ${nd}`, {
          event: 'relax',
          structures: structs(),
          canvas: {
            ...canvasBase(),
            active: [String(v)],
            activeEdges: [directedEdgeId(u, v)],
          },
        });
        q.push([nd, v]);
        b.at(23, `append (${nd}, ${v}) to back of queue`, {
          event: 'push',
          structures: structs(),
          canvas: {
            ...canvasBase(),
            active: [String(v)],
            activeEdges: [directedEdgeId(u, v)],
          },
        });
      }
    }
  }

  const out = dist.map((d) => (d === Infinity ? -1 : d));
  b.at(24, `return ${JSON.stringify(out)} — WRONG (true [0,1,2])`, {
    event: 'done',
    structures: structs(),
    canvas: canvasBase(),
  });

  return {
    id: 'dijkstra-fifo-wrong',
    title: 'FIFO queue (wrong)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: '[0, 1, 100]  // buggy — true answer [0,1,2]',
    source: { language: 'python', title: 'FIFO + settle (buggy)', code: FIFO_CODE },
    meta: {
      visualizationTypes: ['GRAPH', 'QUEUE', 'ARRAY', 'VARS'],
      importantEvents: ['init', 'pop', 'settle', 'relax'],
    },
    steps: b.build(),
  };
}

export function runDijkstra(): ExecutionTimeline {
  const { n, edges, src } = DEFAULT_DIJKSTRA;
  return runDijkstraPq(n, edges, src, 'Dijkstra (min-heap)', 'dijkstra');
}

export function runWhyPriorityQueue(): ExecutionTimeline[] {
  const { n, edges, src } = WHY_PQ_GRAPH;
  return [
    runFifoWrong(),
    runDijkstraPq(n, edges, src, 'Priority queue (correct)', 'dijkstra-pq-correct'),
  ];
}
