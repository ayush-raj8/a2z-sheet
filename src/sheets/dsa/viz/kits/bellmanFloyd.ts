import { directedEdgeId, layoutDagLayers, layoutGraphCircle } from '../layout';
import type { BellmanFloydMode, VizEdge, VizFrame, VizNode, VizSpec } from '../types';

/** Directed weighted graph — Bellman-Ford / Floyd demos. */
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

export const DEFAULT_FLOYD = {
  n: 4,
  edges: [
    [0, 1, 3],
    [0, 3, 7],
    [1, 0, 8],
    [1, 2, 2],
    [2, 0, 5],
    [2, 3, 1],
    [3, 0, 2],
  ] as Array<[number, number, number]>,
};

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

function edgeObjs(edges: Array<[number, number, number]>): VizEdge[] {
  return edges.map(([u, v, w]) => ({
    id: directedEdgeId(u, v),
    from: String(u),
    to: String(v),
    label: String(w),
    directed: true,
  }));
}

function fmt(dist: number[]) {
  return dist.map((d) => (d >= 1e12 ? '∞' : String(d))).join(',');
}

export function buildBellmanFloyd(mode: BellmanFloydMode = 'bellman'): VizSpec {
  if (mode === 'floyd') {
    const { n, edges } = DEFAULT_FLOYD;
    const nodes = layoutGraphCircle(n);
    const eObjs = edgeObjs(edges);
    const INF = 1e12;
    const dist = Array.from({ length: n }, () => Array(n).fill(INF));
    for (let i = 0; i < n; i++) dist[i][i] = 0;
    for (const [u, v, w] of edges) dist[u][v] = w;

    const frames: VizFrame[] = [
      {
        caption: 'Floyd-Warshall: init dist from direct edges',
        nodes,
        edges: eObjs,
        grid: dist.map((row) => row.map((v) => (v >= INF ? '∞' : String(v)))),
        aux: { k: '—' },
      },
    ];

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            frames.push({
              caption: `Via ${k}: improve dist[${i}][${j}] → ${dist[i][j]}`,
              nodes,
              edges: eObjs,
              active: [String(i), String(k), String(j)],
              grid: dist.map((row) => row.map((v) => (v >= INF ? '∞' : String(v)))),
              gridHighlight: [[i, j]],
              aux: { k: String(k), i: String(i), j: String(j) },
            });
          }
        }
      }
      frames.push({
        caption: `Finished intermediate k=${k}`,
        nodes,
        edges: eObjs,
        active: [String(k)],
        grid: dist.map((row) => row.map((v) => (v >= INF ? '∞' : String(v)))),
        aux: { k: String(k) },
      });
    }

    const out = dist.map((row) => row.map((v) => (v >= INF ? -1 : v)));
    frames.push({
      caption: 'All-pairs distances ready',
      nodes,
      edges: eObjs,
      grid: out.map((row) => row.map(String)),
      output: ['matrix done'],
    });

    return {
      kit: 'bellmanFloyd',
      title: 'Floyd-Warshall',
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}`,
      expectedOutput: JSON.stringify(out),
      frames,
    };
  }

  if (mode === 'dagSp') {
    // Classic teaching DAG (same as TUF G-27 style example)
    const { n, edges, src } = DEFAULT_DAG_SP;
    const { nodes: baseNodes, topo } = layoutDagLayers(
      n,
      edges.map(([u, v]) => [u, v] as [number, number]),
    );
    const eObjs = edgeObjs(edges);
    const g: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
    for (const [u, v, w] of edges) g[u].push([v, w]);

    const INF = 1e12;
    const dist = Array(n).fill(INF);
    dist[src] = 0;

    function withDist(active: string[] = [], visited: string[] = []): VizNode[] {
      return baseNodes.map((node) => {
        const id = Number(node.id);
        const d = dist[id];
        return {
          ...node,
          sub: d >= INF ? '∞' : `d=${d}`,
        };
      });
    }

    const frames: VizFrame[] = [
      {
        caption: `Layered DAG (left→right = topo level). Source=${src}, dist[${src}]=0`,
        nodes: withDist([String(src)]),
        edges: eObjs,
        active: [String(src)],
        output: topo.map(String),
        aux: { topo: topo.join(' → '), dist: fmt(dist) },
      },
      {
        caption: `Topo order (Kahn / DFS finish): ${topo.join(' → ')}. Relax edges in this order.`,
        nodes: withDist(),
        edges: eObjs,
        output: topo.map(String),
        aux: { tip: 'Only need one pass — DAG has no cycles' },
      },
    ];

    for (const u of topo) {
      frames.push({
        caption:
          dist[u] >= INF
            ? `Skip ${u} — unreachable from ${src} (dist=∞)`
            : `Process ${u} (dist=${dist[u]}) — try all outgoing edges`,
        nodes: withDist([String(u)], topo.filter((x) => topo.indexOf(x) < topo.indexOf(u)).map(String)),
        edges: eObjs,
        active: [String(u)],
        visited: topo.filter((x) => topo.indexOf(x) < topo.indexOf(u)).map(String),
        aux: { dist: fmt(dist) },
      });
      if (dist[u] >= INF) continue;
      for (const [v, w] of g[u]) {
        const before = dist[v];
        const cand = dist[u] + w;
        if (cand < dist[v]) {
          dist[v] = cand;
          frames.push({
            caption: `Relax ${u}→${v} (w=${w}): ${before >= INF ? '∞' : before} → ${cand}`,
            nodes: withDist([String(u), String(v)]),
            edges: eObjs,
            active: [String(u), String(v)],
            activeEdges: [directedEdgeId(u, v)],
            visited: topo.filter((x) => topo.indexOf(x) <= topo.indexOf(u)).map(String),
            aux: { dist: fmt(dist), edge: `${u}→${v}` },
          });
        } else {
          frames.push({
            caption: `No improve ${u}→${v}: cand=${cand} ≥ dist[${v}]=${
              before >= INF ? '∞' : before
            }`,
            nodes: withDist([String(u), String(v)]),
            edges: eObjs,
            active: [String(u), String(v)],
            activeEdges: [directedEdgeId(u, v)],
            aux: { dist: fmt(dist) },
          });
        }
      }
    }

    const out = dist.map((d) => (d >= INF ? -1 : d));
    frames.push({
      caption: `Done. shortest paths from ${src}: [${out.join(', ')}] (−1 = unreachable)`,
      nodes: withDist(
        [],
        out.map((d, i) => (d >= 0 ? String(i) : '')).filter(Boolean),
      ),
      edges: eObjs,
      visited: out.map((d, i) => (d >= 0 ? String(i) : '')).filter(Boolean),
      output: out.map(String),
      aux: { dist: out.join(','), answer: JSON.stringify(out) },
    });

    return {
      kit: 'bellmanFloyd',
      title: 'Shortest path in DAG',
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
      expectedOutput: JSON.stringify(out),
      frames,
    };
  }

  // Bellman-Ford
  const { n, edges, src } = DEFAULT_BF;
  const nodes = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges);
  const INF = 1e12;
  const dist = Array(n).fill(INF);
  dist[src] = 0;
  const frames: VizFrame[] = [
    {
      caption: `Bellman-Ford from ${src} — |V|-1 relax rounds`,
      nodes,
      edges: eObjs,
      active: [String(src)],
      aux: { dist: fmt(dist), round: '0' },
    },
  ];

  for (let round = 1; round <= n - 1; round++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] < INF && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
        frames.push({
          caption: `Round ${round}: relax ${u}→${v} (w=${w}) → ${dist[v]}`,
          nodes,
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [directedEdgeId(u, v)],
          aux: { dist: fmt(dist), round: String(round) },
        });
      }
    }
    if (!changed) {
      frames.push({
        caption: `Round ${round}: no updates — early stop`,
        nodes,
        edges: eObjs,
        aux: { dist: fmt(dist), round: String(round) },
      });
      break;
    }
  }

  // negative cycle check
  let neg = false;
  for (const [u, v, w] of edges) {
    if (dist[u] < INF && dist[u] + w < dist[v]) {
      neg = true;
      frames.push({
        caption: `Still relaxable ${u}→${v} — negative cycle reachable`,
        nodes,
        edges: eObjs,
        active: [String(u), String(v)],
        activeEdges: [directedEdgeId(u, v)],
        aux: { negativeCycle: 'true' },
      });
      break;
    }
  }
  if (!neg) {
    frames.push({
      caption: 'No further improvement — no negative cycle from src',
      nodes,
      edges: eObjs,
      aux: { negativeCycle: 'false', dist: fmt(dist) },
    });
  }

  const out = dist.map((d) => (d >= INF ? -1 : d));
  frames.push({
    caption: `dist=${JSON.stringify(out)}`,
    nodes,
    edges: eObjs,
    output: out.map(String),
    aux: { dist: out.join(',') },
  });

  return {
    kit: 'bellmanFloyd',
    title: 'Bellman-Ford',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: JSON.stringify(out),
    frames,
  };
}
