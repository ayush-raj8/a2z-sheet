import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';
import { directedEdgeId, layoutGraphCircle } from '../layout';

/** Same teaching graph as the Bellman-Ford kit (has negatives, no neg-cycle from src). */
export const DEFAULT_BF = {
  n: 5,
  edges: [
    [0, 1, 6],
    [0, 2, 7],
    [1, 2, 8],
    [1, 3, 5],
    [1, 4, -4],
    [2, 3, -3],
    [2, 4, 9],
    [3, 1, -2],
    [4, 3, 7],
    [4, 0, 2],
  ] as Array<[number, number, number]>,
  src: 0,
};

// Line map (1-indexed):
// 1 def …  2 dist=inf  3 dist[src]=0  4 for round  5 updated=False
// 6 for edges  7 if relaxable  8 dist[v]=…  9 updated=True
// 10 if not updated  11 break  12 cycle for  13 if still  14 return None  15 return dist
const CODE = [
  'def bellman_ford(n, edges, src=0):',
  "    dist = [float('inf')] * n",
  '    dist[src] = 0',
  '    for _ in range(n - 1):',
  '        updated = False',
  '        for u, v, w in edges:',
  "            if dist[u] != float('inf') and dist[u] + w < dist[v]:",
  '                dist[v] = dist[u] + w',
  '                updated = True',
  '        if not updated:',
  '            break',
  '    for u, v, w in edges:',
  "        if dist[u] != float('inf') and dist[u] + w < dist[v]:",
  '            return None  # negative cycle',
  '    return dist',
].join('\n');

export function runBellmanFord(
  n = DEFAULT_BF.n,
  edges: Array<[number, number, number]> = DEFAULT_BF.edges,
  src = DEFAULT_BF.src,
): ExecutionTimeline {
  const INF = Number.POSITIVE_INFINITY;
  const base = layoutGraphCircle(n);
  const eObjs = edges.map(([u, v, w]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
    directed: true,
  }));
  const dist = Array(n).fill(INF);
  const b = new TimelineBuilder();

  const fmt = (d: number) => (d === INF ? 'inf' : d);
  const canvas = (active: string[] = [], activeEdges: string[] = []) => ({
    nodes: base.map((node) => ({
      ...node,
      sub: 'd=' + String(fmt(dist[Number(node.id)])),
    })),
    edges: eObjs,
    active,
    activeEdges,
  });

  const structs = (extra: Record<string, string | number | boolean> = {}) =>
    structuresOf(
      { kind: 'array', label: 'dist', values: dist.map(fmt) },
      { kind: 'vars', label: 'vars', entries: { src, n, ...extra } },
    );

  b.at(2, 'dist[] = inf', { event: 'init', structures: structs(), canvas: canvas() });
  dist[src] = 0;
  b.at(3, 'dist[' + src + '] = 0', {
    event: 'init',
    structures: structs(),
    canvas: canvas([String(src)]),
  });

  for (let round = 1; round <= n - 1; round++) {
    b.at(4, 'Relax round ' + round + ' / ' + (n - 1), {
      event: 'round',
      structures: structs({ round }),
      canvas: canvas(),
    });
    let updated = false;
    b.at(5, 'updated = False', {
      event: 'round',
      structures: structs({ round, updated: false }),
      canvas: canvas(),
    });

    for (const [u, v, w] of edges) {
      b.at(6, 'Edge ' + u + '->' + v + ' (w=' + w + ')', {
        event: 'edge',
        structures: structs({ round, u, v, w }),
        canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)]),
      });
      const can = dist[u] !== INF && dist[u] + w < dist[v];
      b.at(
        7,
        'Can relax? dist[' + u + ']+' + w + ' < dist[' + v + '] -> ' + can,
        {
          event: 'cmp',
          structures: structs({
            round,
            cand: dist[u] === INF ? 'inf' : dist[u] + w,
            dist_v: fmt(dist[v]),
          }),
          canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)]),
        },
      );
      if (can) {
        dist[v] = dist[u] + w;
        updated = true;
        b.at(8, 'dist[' + v + '] = ' + dist[v], {
          event: 'relax',
          structures: structs({ round, updated: true }),
          canvas: canvas([String(v)], [directedEdgeId(u, v)]),
        });
        b.at(9, 'updated = True', {
          event: 'relax',
          structures: structs({ round, updated: true }),
          canvas: canvas([String(v)]),
        });
      }
    }

    b.at(10, 'updated == ' + updated + '?', {
      event: 'check',
      structures: structs({ round, updated }),
      canvas: canvas(),
    });
    if (!updated) {
      b.at(11, 'Early stop — no changes this round', {
        event: 'break',
        structures: structs({ round }),
        canvas: canvas(),
      });
      break;
    }
  }

  let neg = false;
  for (const [u, v, w] of edges) {
    b.at(12, 'Cycle-check edge ' + u + '->' + v, {
      event: 'cycle',
      structures: structs({ u, v, w }),
      canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)]),
    });
    if (dist[u] !== INF && dist[u] + w < dist[v]) {
      neg = true;
      b.at(13, 'Still improvable — negative cycle', {
        event: 'cycle',
        structures: structs({ negativeCycle: true }),
        canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)]),
      });
      b.at(14, 'return None', {
        event: 'done',
        structures: structs({ negativeCycle: true }),
        canvas: canvas(),
      });
      break;
    }
  }

  const out = neg ? null : dist.map((d) => (d === INF ? -1 : d));
  if (!neg) {
    b.at(13, 'No further improvement — no neg-cycle from src', {
      event: 'cycle',
      structures: structs({ negativeCycle: false }),
      canvas: canvas(),
    });
    b.at(15, 'return dist = ' + JSON.stringify(out), {
      event: 'done',
      structures: structs({ negativeCycle: false }),
      canvas: canvas(),
    });
  }

  const steps = b.build();
  const last = steps[steps.length - 1];
  if (last.canvas) {
    last.canvas.visited = dist
      .map((d, i) => (d !== INF ? String(i) : ''))
      .filter(Boolean);
  }

  return {
    id: 'bellman-ford',
    title: 'Bellman-Ford',
    inputSummary: 'n=' + n + ', edges=' + JSON.stringify(edges) + ', src=' + src,
    expectedOutput: out == null ? 'null (neg cycle)' : JSON.stringify(out),
    source: { language: 'python', title: 'Optimal', code: CODE },
    meta: {
      visualizationTypes: ['GRAPH', 'ARRAY', 'VARS'],
      importantVariables: ['dist', 'updated', 'round'],
      importantEvents: ['init', 'round', 'relax', 'cycle'],
    },
    steps,
  };
}
