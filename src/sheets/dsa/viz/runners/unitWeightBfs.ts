import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';
import { layoutGraphCircle, undirectedEdgeId } from '../layout';

/** Undirected unit-weight demo graph. */
export const DEFAULT_UG_SP = {
  n: 5,
  edges: [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
  ] as Array<[number, number]>,
  src: 0,
};

// 1-indexed lines match this snippet exactly
const CODE = [
  'from collections import defaultdict, deque',
  '',
  'def shortest_ug_unit(n, edges, src=0):',
  '    g = defaultdict(list)',
  '    for u, v in edges:',
  '        g[u].append(v)',
  '        g[v].append(u)',
  '    dist = [-1] * n',
  '    dist[src] = 0',
  '    q = deque([src])',
  '    while q:',
  '        u = q.popleft()',
  '        for v in g[u]:',
  '            if dist[v] < 0:',
  '                dist[v] = dist[u] + 1',
  '                q.append(v)',
  '    return dist',
].join('\n');

export function runUnitWeightShortest(
  n = DEFAULT_UG_SP.n,
  edges: Array<[number, number]> = DEFAULT_UG_SP.edges,
  src = DEFAULT_UG_SP.src,
): ExecutionTimeline {
  const base = layoutGraphCircle(n);
  const eObjs = edges.map(([u, v]) => ({
    id: undirectedEdgeId(u, v),
    from: String(u),
    to: String(v),
    directed: false,
  }));
  const g: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    g[u].push(v);
    g[v].push(u);
  }

  const dist = Array(n).fill(-1);
  const q: number[] = [];
  const visited: string[] = [];
  const b = new TimelineBuilder();

  const canvas = (active: string[] = [], activeEdges: string[] = []) => ({
    nodes: base.map((node) => {
      const id = Number(node.id);
      const d = dist[id];
      return {
        ...node,
        sub: d < 0 ? 'd=?' : 'd=' + d,
      };
    }),
    edges: eObjs,
    active,
    visited: [...visited],
    activeEdges,
    queue: q.map(String),
  });

  const structs = (extra: Record<string, string | number | boolean> = {}) =>
    structuresOf(
      {
        kind: 'array',
        label: 'dist',
        values: dist.map((d) => (d < 0 ? '?' : d)),
      },
      { kind: 'queue', label: 'BFS queue', values: q.map(String) },
      { kind: 'vars', label: 'vars', entries: { src, ...extra } },
    );

  b.at(4, 'Build undirected adjacency list', {
    event: 'init',
    structures: structs(),
    canvas: canvas(),
  });
  b.at(8, 'dist[] = -1 (unseen)', {
    event: 'init',
    structures: structs(),
    canvas: canvas(),
  });
  dist[src] = 0;
  b.at(9, 'dist[' + src + '] = 0', {
    event: 'init',
    structures: structs(),
    canvas: canvas([String(src)]),
  });
  q.push(src);
  b.at(10, 'queue <- [' + src + ']', {
    event: 'init',
    structures: structs(),
    canvas: canvas([String(src)]),
  });

  while (q.length) {
    b.at(11, 'while queue non-empty', {
      event: 'loop',
      structures: structs(),
      canvas: canvas(),
    });
    const u = q.shift()!;
    visited.push(String(u));
    b.at(12, 'popleft -> ' + u + ' (dist=' + dist[u] + ')', {
      event: 'pop',
      structures: structs({ u, 'dist[u]': dist[u] }),
      canvas: canvas([String(u)]),
    });

    for (const v of g[u]) {
      const eid = undirectedEdgeId(u, v);
      b.at(13, 'Neighbor v=' + v, {
        event: 'edge',
        structures: structs({ u, v }),
        canvas: canvas([String(u), String(v)], [eid]),
      });
      b.at(14, 'dist[' + v + '] < 0? (' + (dist[v] < 0) + ')', {
        event: 'cmp',
        structures: structs({ u, v, 'dist[v]': dist[v] < 0 ? '?' : dist[v] }),
        canvas: canvas([String(u), String(v)], [eid]),
      });
      if (dist[v] < 0) {
        dist[v] = dist[u] + 1;
        b.at(15, 'dist[' + v + '] = dist[' + u + '] + 1 = ' + dist[v], {
          event: 'relax',
          structures: structs({ u, v }),
          canvas: canvas([String(v)], [eid]),
        });
        q.push(v);
        b.at(16, 'queue.append(' + v + ')', {
          event: 'push',
          structures: structs({ v }),
          canvas: canvas([String(v)], [eid]),
        });
      }
    }
  }

  const out = [...dist];
  b.at(17, 'return dist = ' + JSON.stringify(out), {
    event: 'done',
    structures: structs(),
    canvas: canvas(),
  });

  const steps = b.build();
  const last = steps[steps.length - 1];
  if (last.canvas) {
    last.canvas.visited = out.map((d, i) => (d >= 0 ? String(i) : '')).filter(Boolean);
    last.canvas.queue = [];
  }

  return {
    id: 'ug-unit-shortest',
    title: 'Shortest Path (UG, unit weights)',
    inputSummary: 'n=' + n + ', edges=' + JSON.stringify(edges) + ', src=' + src,
    expectedOutput: JSON.stringify(out),
    source: { language: 'python', title: 'Optimal (BFS)', code: CODE },
    meta: {
      visualizationTypes: ['GRAPH', 'QUEUE', 'ARRAY', 'VARS'],
      importantVariables: ['dist', 'q'],
      importantEvents: ['init', 'pop', 'relax', 'push'],
      explanationSteps: [
        'Unit edge weights => BFS levels = distances',
        'First time you reach a node is the shortest path',
        'Weighted edges need Dijkstra / Bellman-Ford instead',
      ],
    },
    steps,
  };
}
