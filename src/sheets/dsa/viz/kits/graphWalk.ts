import { directedEdgeId, layoutGraphCircle, undirectedEdgeId } from '../layout';
import type { GraphMode, VizEdge, VizFrame, VizSpec } from '../types';

/** Default undirected graph matching bfs/dfs blog signatures: bfs(n, edges, src) */
export const DEFAULT_UG = {
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

/** Default directed edges for topo demos */
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

function buildAdj(n: number, edges: Array<[number, number]>, undirected: boolean) {
  const g: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    g[u].push(v);
    if (undirected) g[v].push(u);
  }
  return g;
}

function edgeObjs(edges: Array<[number, number]>, directed: boolean): VizEdge[] {
  return edges.map(([u, v]) => ({
    id: directed ? directedEdgeId(u, v) : undirectedEdgeId(u, v),
    from: String(u),
    to: String(v),
    directed,
  }));
}

export function buildGraphWalk(mode: GraphMode = 'bfs'): VizSpec {
  const { n, edges, src } = DEFAULT_UG;
  const nodes = layoutGraphCircle(n);
  const eObjs = edgeObjs(edges, false);
  const g = buildAdj(n, edges, true);
  const frames: VizFrame[] = [];
  const visited: string[] = [];
  const output: string[] = [];

  if (mode === 'bfs' || mode === 'components') {
    const dist = Array(n).fill(-1);
    const q: number[] = [];
    if (mode === 'bfs') {
      q.push(src);
      dist[src] = 0;
      frames.push({
        caption: `BFS from ${src} — enqueue source`,
        nodes,
        edges: eObjs,
        active: [String(src)],
        visited: [],
        queue: [String(src)],
        aux: { dist: dist.join(',') },
      });
      while (q.length) {
        const u = q.shift()!;
        visited.push(String(u));
        output.push(String(u));
        for (const v of g[u]) {
          if (dist[v] === -1) {
            dist[v] = dist[u] + 1;
            q.push(v);
          }
        }
        frames.push({
          caption: `Pop ${u}, discover unvisited neighbors`,
          nodes,
          edges: eObjs,
          active: [String(u)],
          visited: [...visited],
          queue: q.map(String),
          output: [...output],
          aux: { dist: dist.join(',') },
        });
      }
      frames.push({
        caption: `Done. order=[${output.join(',')}] dist=[${dist.join(',')}]`,
        nodes,
        edges: eObjs,
        visited: [...visited],
        queue: [],
        output: [...output],
        aux: { dist: dist.join(',') },
      });
      return {
        kit: 'graphWalk',
        title: 'BFS on undirected graph',
        inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
        expectedOutput: `order=[${output.join(',')}] dist=[${dist.join(',')}]`,
        frames,
      };
    }

    // components via repeated BFS
    let comps = 0;
    const seen = Array(n).fill(false);
    for (let s = 0; s < n; s++) {
      if (seen[s]) continue;
      comps++;
      const cq = [s];
      seen[s] = true;
      frames.push({
        caption: `Start component #${comps} at ${s}`,
        nodes,
        edges: eObjs,
        active: [String(s)],
        visited: Object.keys(seen)
          .filter((i) => seen[Number(i)])
          .map(String),
        queue: [String(s)],
        aux: { components: String(comps) },
      });
      while (cq.length) {
        const u = cq.shift()!;
        visited.push(String(u));
        for (const v of g[u]) {
          if (!seen[v]) {
            seen[v] = true;
            cq.push(v);
          }
        }
        frames.push({
          caption: `Component #${comps}: visit ${u}`,
          nodes,
          edges: eObjs,
          active: [String(u)],
          visited: Object.keys(seen)
            .filter((i) => seen[Number(i)])
            .map(String),
          queue: cq.map(String),
          aux: { components: String(comps) },
        });
      }
    }
    frames.push({
      caption: `Provinces / components = ${comps}`,
      nodes,
      edges: eObjs,
      visited: Object.keys(seen)
        .filter((i) => seen[Number(i)])
        .map(String),
      aux: { components: String(comps) },
    });
    return {
      kit: 'graphWalk',
      title: 'Connected components (BFS floods)',
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}`,
      expectedOutput: String(comps),
      frames,
    };
  }

  if (mode === 'dfs') {
    const seen = Array(n).fill(false);
    const stack: number[] = [src];
    frames.push({
      caption: `Iterative DFS from ${src}`,
      nodes,
      edges: eObjs,
      active: [String(src)],
      stack: [String(src)],
    });
    while (stack.length) {
      const u = stack.pop()!;
      if (seen[u]) continue;
      seen[u] = true;
      visited.push(String(u));
      output.push(String(u));
      for (let i = g[u].length - 1; i >= 0; i--) {
        const v = g[u][i];
        if (!seen[v]) stack.push(v);
      }
      frames.push({
        caption: `Visit ${u}, push unvisited neighbors`,
        nodes,
        edges: eObjs,
        active: [String(u)],
        visited: [...visited],
        stack: stack.map(String),
        output: [...output],
      });
    }
    frames.push({
      caption: `Done. order=[${output.join(',')}]`,
      nodes,
      edges: eObjs,
      visited: [...visited],
      stack: [],
      output: [...output],
    });
    return {
      kit: 'graphWalk',
      title: 'Iterative DFS',
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
      expectedOutput: `[${output.join(', ')}]`,
      frames,
    };
  }

  // bipartite coloring
  const color = Array(n).fill(-1);
  const q = [src];
  color[src] = 0;
  let ok = true;
  frames.push({
    caption: `Bipartite check — color ${src} = 0`,
    nodes,
    edges: eObjs,
    active: [String(src)],
    queue: [String(src)],
    aux: { color: color.map((c) => (c < 0 ? '_' : String(c))).join(',') },
  });
  while (q.length && ok) {
    const u = q.shift()!;
    visited.push(String(u));
    for (const v of g[u]) {
      if (color[v] === -1) {
        color[v] = color[u] ^ 1;
        q.push(v);
      } else if (color[v] === color[u]) {
        ok = false;
        frames.push({
          caption: `Conflict: edge ${u}-${v} same color → not bipartite`,
          nodes,
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [undirectedEdgeId(u, v)],
          visited: [...visited],
          aux: { color: color.map((c) => (c < 0 ? '_' : String(c))).join(','), ok: 'false' },
        });
        break;
      }
    }
    if (!ok) break;
    frames.push({
      caption: `Colored from ${u}`,
      nodes,
      edges: eObjs,
      active: [String(u)],
      visited: [...visited],
      queue: q.map(String),
      aux: { color: color.map((c) => (c < 0 ? '_' : String(c))).join(','), ok: 'true' },
    });
  }
  if (ok) {
    frames.push({
      caption: 'Graph is bipartite',
      nodes,
      edges: eObjs,
      visited: [...visited],
      aux: { color: color.join(','), ok: 'true' },
    });
  }

  return {
    kit: 'graphWalk',
    title: 'Bipartite coloring (BFS)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}, src=${src}`,
    expectedOutput: ok ? 'true' : 'false',
    frames,
  };
}
