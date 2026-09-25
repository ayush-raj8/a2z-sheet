import { DEFAULT_DG } from './graphWalk';
import { directedEdgeId, layoutDagLayers, layoutGraphCircle } from '../layout';
import type { VizEdge, VizFrame, VizNode, VizSpec } from '../types';

export type TopoVizMode = 'topo' | 'kahn' | 'cycle' | 'dfs';

/** Directed graph with a reachable cycle — Kahn peels sources then stalls. */
export const DEFAULT_DG_CYCLE = {
  n: 4,
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 1], // cycle 1→2→3→1; 0 is a clean source
  ] as Array<[number, number]>,
};

const COLOR_NAME = ['white', 'gray', 'black'] as const;

function edgeObjs(edges: Array<[number, number]>): VizEdge[] {
  return edges.map(([u, v]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    directed: true,
  }));
}

function withIndeg(base: VizNode[], indeg: number[]): VizNode[] {
  return base.map((node) => ({
    ...node,
    // Remaining incoming edges still waiting to be peeled (Kahn indegree)
    sub: `indeg ${indeg[Number(node.id)]}`,
  }));
}

function withColor(base: VizNode[], state: number[]): VizNode[] {
  return base.map((node) => ({
    ...node,
    sub: COLOR_NAME[state[Number(node.id)]] ?? 'white',
  }));
}

function baseLayout(n: number, edges: Array<[number, number]>): VizNode[] {
  const indegCheck = Array(n).fill(0);
  for (const [, v] of edges) indegCheck[v]++;
  if (indegCheck.every((d) => d > 0)) return layoutGraphCircle(n);
  try {
    return layoutDagLayers(n, edges).nodes;
  } catch {
    return layoutGraphCircle(n);
  }
}

/** 3-color DFS topological sort (finish-time reverse). */
function buildTopoDfs(): VizSpec {
  const { n, edges } = DEFAULT_DG;
  const eObjs = edgeObjs(edges);
  const baseNodes = baseLayout(n, edges);
  const g: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) g[u].push(v);

  const state = Array(n).fill(0); // 0 white, 1 gray (on stack), 2 black (done)
  const frames: VizFrame[] = [];
  const finish: number[] = [];
  let cycle = false;

  const blackIds = () =>
    state.map((s, i) => (s === 2 ? String(i) : null)).filter(Boolean) as string[];
  const grayIds = () =>
    state.map((s, i) => (s === 1 ? String(i) : null)).filter(Boolean) as string[];
  const colorStr = () => state.map((s) => COLOR_NAME[s][0].toUpperCase()).join('');

  frames.push({
    caption: '3-color DFS topo — white=unseen · gray=on stack · black=done. Push node when leaving.',
    nodes: withColor(baseNodes, state),
    edges: eObjs,
    aux: { colors: 'W'.repeat(n), tip: 'edge u→v ⇒ u before v in final order' },
  });

  function dfs(u: number, stack: number[]) {
    state[u] = 1;
    frames.push({
      caption: `Enter ${u} → gray (on stack)`,
      nodes: withColor(baseNodes, state),
      edges: eObjs,
      active: grayIds(),
      visited: blackIds(),
      stack: [...stack, u].map(String),
      output: finish.map(String),
      aux: { colors: colorStr(), color: 'gray = exploring' },
    });

    for (const v of g[u]) {
      if (state[v] === 1) {
        cycle = true;
        frames.push({
          caption: `Back-edge ${u}→${v} to gray node → cycle`,
          nodes: withColor(baseNodes, state),
          edges: eObjs,
          active: grayIds(),
          visited: blackIds(),
          activeEdges: [directedEdgeId(u, v)],
          stack: [...stack, u].map(String),
          output: finish.map(String),
          aux: { colors: colorStr(), cycle: 'true' },
        });
        continue;
      }
      if (state[v] === 0) {
        frames.push({
          caption: `Tree edge ${u}→${v} — recurse into white ${v}`,
          nodes: withColor(baseNodes, state),
          edges: eObjs,
          active: grayIds(),
          visited: blackIds(),
          activeEdges: [directedEdgeId(u, v)],
          stack: [...stack, u].map(String),
          output: finish.map(String),
          aux: { colors: colorStr() },
        });
        dfs(v, [...stack, u]);
      } else {
        frames.push({
          caption: `Forward/cross edge ${u}→${v} — ${v} already black, skip`,
          nodes: withColor(baseNodes, state),
          edges: eObjs,
          active: grayIds(),
          visited: blackIds(),
          activeEdges: [directedEdgeId(u, v)],
          stack: [...stack, u].map(String),
          output: finish.map(String),
          aux: { colors: colorStr() },
        });
      }
    }

    state[u] = 2;
    finish.push(u);
    frames.push({
      caption: `Leave ${u} → black, push onto finish list`,
      nodes: withColor(baseNodes, state),
      edges: eObjs,
      active: [String(u)],
      visited: blackIds(),
      stack: stack.map(String),
      output: finish.map(String),
      aux: { colors: colorStr(), finish: finish.join(',') },
    });
  }

  for (let u = 0; u < n; u++) {
    if (state[u] === 0) dfs(u, []);
  }

  const order = cycle ? [] : [...finish].reverse();
  frames.push({
    caption: cycle
      ? 'Cycle found — no valid topological order'
      : `Reverse finish list → topo = [${order.join(', ')}]`,
    nodes: withColor(baseNodes, state),
    edges: eObjs,
    visited: Array.from({ length: n }, (_, i) => String(i)),
    output: order.map(String),
    aux: {
      finish: finish.join(','),
      topo: order.length ? order.join(',') : '∅',
    },
  });

  return {
    kit: 'topoKahn',
    title: 'Topological sort (3-color DFS)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}  // directed DAG`,
    expectedOutput: `[${order.join(', ')}]`,
    frames,
  };
}

/**
 * Kahn / topo viz with layered DAG layout (left→right).
 * mode=cycle uses a cyclic digraph and shows incomplete order.
 * mode=dfs uses 3-color DFS finish-time reverse.
 */
export function buildTopoKahn(mode: TopoVizMode = 'kahn'): VizSpec {
  if (mode === 'dfs') return buildTopoDfs();

  const cyclic = mode === 'cycle';
  const { n, edges } = cyclic ? DEFAULT_DG_CYCLE : DEFAULT_DG;
  const eObjs = edgeObjs(edges);
  const baseNodes = baseLayout(n, edges);

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
    caption: cyclic
      ? 'Directed graph with a cycle — Kahn should fail to order all nodes'
      : 'Layered DAG (left→right). indeg = #incoming edges still waiting (Kahn starts at indeg 0)',
    nodes: withIndeg(baseNodes, indeg),
    edges: eObjs,
    queue: q.map(String),
    aux: {
      indeg: indeg.join(','),
      tip: 'indeg = remaining prerequisites',
    },
  });

  if (q.length === 0) {
    frames.push({
      caption: 'No indeg 0 node → every node is in a cycle component',
      nodes: withIndeg(baseNodes, indeg),
      edges: eObjs,
      aux: { indeg: indeg.join(','), cycle: 'true' },
    });
  }

  while (q.length) {
    const u = q.shift()!;
    order.push(String(u));
    visited.push(String(u));
    const decreased: string[] = [];
    for (const v of g[u]) {
      indeg[v]--;
      decreased.push(`${v}→${indeg[v]}`);
      if (indeg[v] === 0) q.push(v);
    }
    frames.push({
      caption: `Take ${u} into topo. Decrement outs: [${decreased.join(', ') || '—'}]`,
      nodes: withIndeg(baseNodes, indeg),
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: q.map(String),
      output: [...order],
      aux: { indeg: indeg.join(','), taken: String(u) },
    });
  }

  const ok = order.length === n;
  frames.push({
    caption: ok
      ? `Topo order = [${order.join(', ')}]  (one valid order)`
      : `Cycle detected — only [${order.join(', ') || '—'}] ordered (${order.length}/${n})`,
    nodes: withIndeg(baseNodes, indeg),
    edges: eObjs,
    visited: [...visited],
    output: [...order],
    aux: {
      ok: String(ok),
      leftover: ok
        ? '—'
        : Array.from({ length: n }, (_, i) => i)
            .filter((i) => !visited.includes(String(i)))
            .join(','),
    },
  });

  const titles: Record<Exclude<TopoVizMode, 'dfs'>, string> = {
    topo: 'Topological sort (Kahn)',
    kahn: "Kahn's algorithm",
    cycle: 'Directed cycle via Kahn (BFS)',
  };

  return {
    kit: 'topoKahn',
    title: titles[mode],
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}  // directed${cyclic ? ' (has cycle)' : ''}`,
    expectedOutput: ok ? `[${order.join(', ')}]` : 'cycle',
    frames,
  };
}

/** Both DFS + Kahn demos for the Topo Sort topic. */
export function buildTopoSortTopic(): VizSpec[] {
  return [buildTopoKahn('dfs'), buildTopoKahn('topo')];
}
