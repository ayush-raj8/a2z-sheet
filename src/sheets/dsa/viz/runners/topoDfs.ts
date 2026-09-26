import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';
import { directedEdgeId, layoutDagLayers } from '../layout';

/** Same DAG as topo / Kahn demos. */
export const DEFAULT_DG = {
  n: 6,
  edges: [
    [5, 2],
    [5, 0],
    [4, 0],
    [4, 1],
    [2, 3],
    [3, 1],
  ] as Array<[number, number]>,
};

const CODE = `from collections import defaultdict

def topo_dfs(n, edges):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
    state = [0] * n  # 0 white, 1 gray, 2 black
    out = []
    ok = True

    def dfs(u):
        nonlocal ok
        state[u] = 1
        for v in g[u]:
            if state[v] == 1:
                ok = False
            elif state[v] == 0:
                dfs(v)
        state[u] = 2
        out.append(u)

    for u in range(n):
        if state[u] == 0:
            dfs(u)
    return list(reversed(out)) if ok else []`;

/*
 1 from collections import defaultdict
 2
 3 def topo_dfs(n, edges):
 4     g = defaultdict(list)
 5     for u, v in edges:
 6         g[u].append(v)
 7     state = [0] * n  # 0 white, 1 gray, 2 black
 8     out = []
 9     ok = True
10
11     def dfs(u):
12         nonlocal ok
13         state[u] = 1
14         for v in g[u]:
15             if state[v] == 1:
16                 ok = False
17             elif state[v] == 0:
18                 dfs(v)
19         state[u] = 2
20         out.append(u)
21
22     for u in range(n):
23         if state[u] == 0:
24             dfs(u)
25     return list(reversed(out)) if ok else []
*/

const COLOR = ['white', 'gray', 'black'] as const;

export function runTopoDfs(
  n = DEFAULT_DG.n,
  edges: Array<[number, number]> = DEFAULT_DG.edges,
): ExecutionTimeline {
  const { nodes: baseNodes } = layoutDagLayers(n, edges);
  const eObjs = edges.map(([u, v]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    directed: true,
  }));
  const g: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) g[u].push(v);

  const state = Array(n).fill(0);
  const finish: number[] = [];
  const callStack: number[] = [];
  let ok = true;
  const b = new TimelineBuilder();

  const black = () =>
    state.map((s, i) => (s === 2 ? String(i) : null)).filter(Boolean) as string[];
  const gray = () =>
    state.map((s, i) => (s === 1 ? String(i) : null)).filter(Boolean) as string[];

  const canvas = (activeEdges: string[] = []) => ({
    nodes: baseNodes.map((node) => ({
      ...node,
      sub: COLOR[state[Number(node.id)]],
    })),
    edges: eObjs,
    active: gray(),
    visited: black(),
    activeEdges,
    stack: callStack.map(String),
    output: finish.map(String),
  });

  const structs = (extra: Record<string, string | number | boolean> = {}) =>
    structuresOf(
      {
        kind: 'array',
        label: 'state (W/G/B)',
        values: state.map((s) => COLOR[s][0].toUpperCase()),
      },
      { kind: 'callStack', label: 'DFS stack', frames: callStack.map((u) => `dfs(${u})`) },
      { kind: 'stack', label: 'finish', values: finish.map(String) },
      {
        kind: 'vars',
        label: 'vars',
        entries: { ok, ...extra },
      },
    );

  b.at(7, 'state[] = white (0)', {
    event: 'init',
    structures: structs(),
    canvas: canvas(),
  });
  b.at(8, 'finish list = []', { event: 'init', structures: structs(), canvas: canvas() });
  b.at(9, 'ok = True', { event: 'init', structures: structs(), canvas: canvas() });

  function dfs(u: number) {
    callStack.push(u);
    state[u] = 1;
    b.at(13, `Enter ${u} → gray`, {
      event: 'enter',
      structures: structs({ u }),
      canvas: canvas(),
    });

    for (const v of g[u]) {
      b.at(14, `Edge ${u}→${v} (state=${COLOR[state[v]]})`, {
        event: 'edge',
        structures: structs({ u, v }),
        canvas: canvas([directedEdgeId(u, v)]),
      });
      if (state[v] === 1) {
        ok = false;
        b.at(15, `Back-edge to gray ${v} → cycle`, {
          event: 'cycle',
          structures: structs({ u, v, ok: false }),
          canvas: canvas([directedEdgeId(u, v)]),
        });
        b.at(16, 'ok = False', {
          event: 'cycle',
          structures: structs({ ok: false }),
          canvas: canvas([directedEdgeId(u, v)]),
        });
      } else if (state[v] === 0) {
        b.at(17, `${v} is white — recurse`, {
          event: 'recurse',
          structures: structs({ u, v }),
          canvas: canvas([directedEdgeId(u, v)]),
        });
        b.at(18, `dfs(${v})`, {
          event: 'recurse',
          structures: structs({ u, v }),
          canvas: canvas([directedEdgeId(u, v)]),
        });
        dfs(v);
      }
    }

    state[u] = 2;
    b.at(19, `Leave ${u} → black`, {
      event: 'leave',
      structures: structs({ u }),
      canvas: canvas(),
    });
    finish.push(u);
    b.at(20, `finish.append(${u})`, {
      event: 'leave',
      structures: structs({ u }),
      canvas: canvas(),
    });
    callStack.pop();
  }

  for (let u = 0; u < n; u++) {
    b.at(22, `Outer loop u=${u}`, {
      event: 'outer',
      structures: structs({ u }),
      canvas: canvas(),
    });
    if (state[u] === 0) {
      b.at(23, `state[${u}] == white`, {
        event: 'outer',
        structures: structs({ u }),
        canvas: canvas(),
      });
      b.at(24, `dfs(${u})`, {
        event: 'outer',
        structures: structs({ u }),
        canvas: canvas(),
      });
      dfs(u);
    }
  }

  const order = ok ? [...finish].reverse() : [];
  b.at(25, ok ? `Reverse finish → topo = [${order.join(', ')}]` : 'Cycle — return []', {
    event: 'done',
    structures: structuresOf(
      {
        kind: 'array',
        label: 'state (W/G/B)',
        values: state.map((s) => COLOR[s][0].toUpperCase()),
      },
      { kind: 'stack', label: 'finish', values: finish.map(String) },
      { kind: 'array', label: 'topo', values: order.map(String) },
      { kind: 'vars', label: 'vars', entries: { ok } },
    ),
    canvas: {
      ...canvas(),
      visited: Array.from({ length: n }, (_, i) => String(i)),
      active: [],
      output: order.map(String),
    },
  });

  return {
    id: 'topo-dfs',
    title: 'Topological sort (3-color DFS)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}  // directed DAG`,
    expectedOutput: JSON.stringify(order),
    source: { language: 'python', title: '3-color DFS', code: CODE },
    meta: {
      visualizationTypes: ['GRAPH', 'CALL_STACK', 'STACK', 'ARRAY', 'VARS'],
      importantVariables: ['state', 'out', 'ok'],
      importantEvents: ['enter', 'leave', 'recurse', 'cycle'],
    },
    steps: b.build(),
  };
}
