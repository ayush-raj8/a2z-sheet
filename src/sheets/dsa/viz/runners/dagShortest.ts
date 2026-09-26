import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';
import { directedEdgeId, layoutDagLayers } from '../layout';

export const DEFAULT_DAG_SP = {
  n: 6,
  edges: [
    [0, 1, 2],
    [0, 4, 1],
    [1, 2, 3],
    [4, 2, 2],
    [4, 5, 4],
    [2, 3, 6],
    [5, 3, 1],
  ] as Array<[number, number, number]>,
  src: 0,
};

const CODE = `from collections import defaultdict, deque

def shortest_path_dag(n, edges, src=0):
    g = defaultdict(list)
    indeg = [0] * n
    for u, v, w in edges:
        g[u].append((v, w))
        indeg[v] += 1
    q = deque([i for i in range(n) if indeg[i] == 0])
    topo = []
    while q:
        u = q.popleft()
        topo.append(u)
        for v, _ in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    dist = [float('inf')] * n
    dist[src] = 0
    for u in topo:
        if dist[u] == float('inf'):
            continue
        for v, w in g[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return [-1 if d == float('inf') else d for d in dist]`;

/*
 1 from collections import defaultdict, deque
 2
 3 def shortest_path_dag(n, edges, src=0):
 4     g = defaultdict(list)
 5     indeg = [0] * n
 6     for u, v, w in edges:
 7         g[u].append((v, w))
 8         indeg[v] += 1
 9     q = deque([i for i in range(n) if indeg[i] == 0])
10     topo = []
11     while q:
12         u = q.popleft()
13         topo.append(u)
14         for v, _ in g[u]:
15             indeg[v] -= 1
16             if indeg[v] == 0:
17                 q.append(v)
18     dist = [float('inf')] * n
19     dist[src] = 0
20     for u in topo:
21         if dist[u] == float('inf'):
22             continue
23         for v, w in g[u]:
24             if dist[u] + w < dist[v]:
25                 dist[v] = dist[u] + w
26     return [-1 if d == float('inf') else d for d in dist]
*/

export function runDagShortest(
  n = DEFAULT_DAG_SP.n,
  edges: Array<[number, number, number]> = DEFAULT_DAG_SP.edges,
  src = DEFAULT_DAG_SP.src,
): ExecutionTimeline {
  const INF = Number.POSITIVE_INFINITY;
  const { nodes: baseNodes } = layoutDagLayers(
    n,
    edges.map(([u, v]) => [u, v] as [number, number]),
  );
  const eObjs = edges.map(([u, v, w]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
    directed: true,
  }));
  const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  const indeg = Array(n).fill(0);
  for (const [u, v, w] of edges) {
    g[u].push([v, w]);
    indeg[v] += 1;
  }

  const dist = Array(n).fill(INF);
  const topo: number[] = [];
  const q: number[] = [];
  const b = new TimelineBuilder();

  const fmt = (d: number) => (d === INF ? '∞' : d);
  const canvas = (active: string[] = [], activeEdges: string[] = [], visited: string[] = []) => ({
    nodes: baseNodes.map((node) => ({
      ...node,
      sub: `d=${fmt(dist[Number(node.id)])}`,
    })),
    edges: eObjs,
    active,
    activeEdges,
    visited,
    queue: q.map(String),
    output: topo.map(String),
  });

  const structs = (extra: Record<string, string | number | boolean> = {}) =>
    structuresOf(
      { kind: 'array', label: 'dist', values: dist.map(fmt) },
      { kind: 'array', label: 'indeg', values: [...indeg] },
      { kind: 'queue', label: 'Kahn q', values: q.map(String) },
      { kind: 'array', label: 'topo', values: topo.map(String) },
      { kind: 'vars', label: 'vars', entries: { src, ...extra } },
    );

  b.at(5, 'indeg[] = 0, build graph', {
    event: 'init',
    structures: structs(),
    canvas: canvas(),
  });
  b.at(8, 'indegrees filled from edges', {
    event: 'init',
    structures: structs(),
    canvas: canvas(),
  });

  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  b.at(9, `queue ← indegree-0 nodes ${JSON.stringify(q)}`, {
    event: 'topo',
    structures: structs(),
    canvas: canvas(q.map(String)),
  });
  b.at(10, 'topo = []', { event: 'topo', structures: structs(), canvas: canvas() });

  while (q.length) {
    b.at(11, 'while queue', { event: 'topo', structures: structs(), canvas: canvas() });
    const u = q.shift()!;
    b.at(12, `popleft → ${u}`, {
      event: 'topo',
      structures: structs({ u }),
      canvas: canvas([String(u)]),
    });
    topo.push(u);
    b.at(13, `topo.append(${u})`, {
      event: 'topo',
      structures: structs({ u }),
      canvas: canvas([String(u)], [], topo.map(String)),
    });
    for (const [v] of g[u]) {
      b.at(14, `outgoing ${u}→${v}`, {
        event: 'topo',
        structures: structs({ u, v }),
        canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)], topo.map(String)),
      });
      indeg[v] -= 1;
      b.at(15, `indeg[${v}] -= 1 → ${indeg[v]}`, {
        event: 'topo',
        structures: structs({ u, v }),
        canvas: canvas([String(v)], [directedEdgeId(u, v)], topo.map(String)),
      });
      if (indeg[v] === 0) {
        b.at(16, `indeg[${v}] == 0`, {
          event: 'topo',
          structures: structs({ v }),
          canvas: canvas([String(v)], [], topo.map(String)),
        });
        q.push(v);
        b.at(17, `queue.append(${v})`, {
          event: 'topo',
          structures: structs({ v }),
          canvas: canvas([String(v)], [], topo.map(String)),
        });
      }
    }
  }

  dist.fill(INF);
  b.at(18, 'dist[] = ∞', {
    event: 'init-dist',
    structures: structs(),
    canvas: canvas([], [], topo.map(String)),
  });
  dist[src] = 0;
  b.at(19, `dist[${src}] = 0`, {
    event: 'init-dist',
    structures: structs(),
    canvas: canvas([String(src)], [], topo.map(String)),
  });

  for (const u of topo) {
    b.at(20, `Process u=${u} in topo order`, {
      event: 'relax',
      structures: structs({ u }),
      canvas: canvas([String(u)], [], topo.filter((x) => topo.indexOf(x) < topo.indexOf(u)).map(String)),
    });
    if (dist[u] === INF) {
      b.at(21, `dist[${u}] == ∞ — skip`, {
        event: 'skip',
        structures: structs({ u }),
        canvas: canvas([String(u)], [], topo.map(String)),
      });
      b.at(22, 'continue', {
        event: 'skip',
        structures: structs({ u }),
        canvas: canvas([], [], topo.map(String)),
      });
      continue;
    }
    for (const [v, w] of g[u]) {
      b.at(23, `Edge ${u}→${v} (w=${w})`, {
        event: 'edge',
        structures: structs({ u, v, w }),
        canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)], topo.map(String)),
      });
      const can = dist[u] + w < dist[v];
      b.at(24, `Improve? ${dist[u]}+${w} < ${fmt(dist[v])} → ${can}`, {
        event: 'cmp',
        structures: structs({ u, v, cand: dist[u] + w }),
        canvas: canvas([String(u), String(v)], [directedEdgeId(u, v)], topo.map(String)),
      });
      if (can) {
        dist[v] = dist[u] + w;
        b.at(25, `dist[${v}] = ${dist[v]}`, {
          event: 'relax',
          structures: structs({ u, v }),
          canvas: canvas([String(v)], [directedEdgeId(u, v)], topo.map(String)),
        });
      }
    }
  }

  const out = dist.map((d) => (d === INF ? -1 : d));
  b.at(26, `return ${JSON.stringify(out)}`, {
    event: 'done',
    structures: structs(),
    canvas: canvas(
      [],
      [],
      out.map((d, i) => (d >= 0 ? String(i) : '')).filter(Boolean),
    ),
  });

  return {
    id: 'dag-shortest',
    title: 'Shortest Path in DAG',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: JSON.stringify(out),
    source: { language: 'python', title: 'Optimal (topo + relax)', code: CODE },
    meta: {
      visualizationTypes: ['GRAPH', 'ARRAY', 'QUEUE', 'VARS'],
      importantVariables: ['topo', 'dist', 'indeg'],
      importantEvents: ['topo', 'relax'],
    },
    steps: b.build(),
  };
}
