import { directedEdgeId, layoutGraphCircle, undirectedEdgeId } from '../layout';
import type { BridgeSccMode, VizEdge, VizFrame, VizSpec } from '../types';

/** Undirected graph with bridges + articulation points. */
export const DEFAULT_BRIDGE = {
  n: 5,
  edges: [
    [0, 1],
    [1, 2],
    [2, 0],
    [1, 3],
    [3, 4],
  ] as Array<[number, number]>,
};

/** Directed graph for Kosaraju SCCs. */
export const DEFAULT_SCC = {
  n: 5,
  edges: [
    [0, 2],
    [2, 1],
    [1, 0],
    [0, 3],
    [3, 4],
  ] as Array<[number, number]>,
};

export function buildBridgeScc(mode: BridgeSccMode = 'bridges'): VizSpec {
  if (mode === 'kosaraju') {
    const { n, edges } = DEFAULT_SCC;
    const nodes = layoutGraphCircle(n);
    const eObjs: VizEdge[] = edges.map(([u, v]) => ({
      id: directedEdgeId(u, v),
      from: String(u),
      to: String(v),
      directed: true,
    }));
    const g: number[][] = Array.from({ length: n }, () => []);
    const gr: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
      g[u].push(v);
      gr[v].push(u);
    }

    const frames: VizFrame[] = [];
    const seen = Array(n).fill(false);
    const order: number[] = [];

    function dfs1(u: number, stack: number[]) {
      seen[u] = true;
      frames.push({
        caption: `Pass 1 DFS enter ${u}`,
        nodes,
        edges: eObjs,
        active: [String(u)],
        visited: seen.map((x, i) => (x ? String(i) : '')).filter(Boolean),
        stack: stack.map(String),
      });
      for (const v of g[u]) {
        if (!seen[v]) dfs1(v, [...stack, u]);
      }
      order.push(u);
      frames.push({
        caption: `Pass 1 finish ${u} — push to order`,
        nodes,
        edges: eObjs,
        active: [String(u)],
        visited: seen.map((x, i) => (x ? String(i) : '')).filter(Boolean),
        output: order.map(String),
      });
    }

    frames.push({
      caption: "Kosaraju pass 1: DFS finish-order on G",
      nodes,
      edges: eObjs,
    });
    for (let i = 0; i < n; i++) if (!seen[i]) dfs1(i, []);

    const seen2 = Array(n).fill(false);
    const comps: number[][] = [];
    const assign = Array(n).fill(-1);

    function dfs2(u: number, comp: number[], cid: number) {
      seen2[u] = true;
      assign[u] = cid;
      comp.push(u);
      frames.push({
        caption: `Pass 2 on Gᵀ: component ${cid} add ${u}`,
        nodes,
        edges: eObjs,
        active: [String(u)],
        visited: assign.map((c, i) => (c === cid ? String(i) : '')).filter(Boolean),
        output: comp.map(String),
        aux: { scc: String(cid) },
      });
      for (const v of gr[u]) {
        if (!seen2[v]) dfs2(v, comp, cid);
      }
    }

    frames.push({
      caption: `Finish order (stack top first): [${[...order].reverse().join(',')}]`,
      nodes,
      edges: eObjs,
      output: [...order].reverse().map(String),
    });

    const rev = [...order].reverse();
    for (const u of rev) {
      if (seen2[u]) continue;
      const comp: number[] = [];
      dfs2(u, comp, comps.length);
      comps.push(comp);
      frames.push({
        caption: `SCC #${comps.length - 1} = {${comp.join(',')}}`,
        nodes,
        edges: eObjs,
        visited: comp.map(String),
        output: comps.map((c) => `{${c.join(',')}}`),
      });
    }

    return {
      kit: 'bridgeScc',
      title: "Kosaraju's SCCs",
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}`,
      expectedOutput: comps.map((c) => `{${c.join(',')}}`).join(' '),
      frames,
    };
  }

  const { n, edges } = DEFAULT_BRIDGE;
  const nodes = layoutGraphCircle(n);
  const eObjs: VizEdge[] = edges.map(([u, v]) => ({
    id: undirectedEdgeId(u, v),
    from: String(u),
    to: String(v),
  }));
  const g: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    g[u].push(v);
    g[v].push(u);
  }

  const tin = Array(n).fill(-1);
  const low = Array(n).fill(-1);
  let timer = 0;
  const bridges: Array<[number, number]> = [];
  const isArt = Array(n).fill(false);
  const frames: VizFrame[] = [];

  function dfs(u: number, p: number) {
    tin[u] = low[u] = timer++;
    frames.push({
      caption: `Enter ${u}: tin=low=${tin[u]}`,
      nodes,
      edges: eObjs,
      active: [String(u)],
      visited: tin.map((t, i) => (t >= 0 ? String(i) : '')).filter(Boolean),
      aux: {
        tin: tin.map((t) => (t < 0 ? '_' : String(t))).join(','),
        low: low.map((t) => (t < 0 ? '_' : String(t))).join(','),
      },
    });
    let children = 0;
    for (const v of g[u]) {
      if (v === p) continue;
      if (tin[v] !== -1) {
        low[u] = Math.min(low[u], tin[v]);
        frames.push({
          caption: `Back-edge ${u}-${v}: low[${u}]=min(., tin[${v}])=${low[u]}`,
          nodes,
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: [undirectedEdgeId(u, v)],
          aux: {
            tin: tin.map((t) => (t < 0 ? '_' : String(t))).join(','),
            low: low.map((t) => (t < 0 ? '_' : String(t))).join(','),
          },
        });
        continue;
      }
      children++;
      dfs(v, u);
      low[u] = Math.min(low[u], low[v]);
      frames.push({
        caption: `Return from ${v}: low[${u}]=${low[u]}`,
        nodes,
        edges: eObjs,
        active: [String(u), String(v)],
        aux: {
          tin: tin.map((t) => (t < 0 ? '_' : String(t))).join(','),
          low: low.map((t) => (t < 0 ? '_' : String(t))).join(','),
        },
      });

      if (mode === 'bridges' && low[v] > tin[u]) {
        bridges.push([u, v]);
        frames.push({
          caption: `Bridge found ${u}-${v} (low[${v}]>${tin[u]})`,
          nodes,
          edges: eObjs,
          active: [String(u), String(v)],
          activeEdges: bridges.map(([a, b]) => undirectedEdgeId(a, b)),
          output: bridges.map(([a, b]) => `${a}-${b}`),
        });
      }

      if (mode === 'articulation') {
        if (p !== -1 && low[v] >= tin[u]) {
          isArt[u] = true;
          frames.push({
            caption: `Articulation: ${u} (low[${v}]≥tin[${u}])`,
            nodes,
            edges: eObjs,
            active: [String(u)],
            visited: isArt.map((x, i) => (x ? String(i) : '')).filter(Boolean),
            output: isArt.map((x, i) => (x ? String(i) : '')).filter(Boolean),
          });
        }
      }
    }
    if (mode === 'articulation' && p === -1 && children > 1) {
      isArt[u] = true;
      frames.push({
        caption: `Root ${u} is articulation (${children} children)`,
        nodes,
        edges: eObjs,
        active: [String(u)],
        visited: isArt.map((x, i) => (x ? String(i) : '')).filter(Boolean),
        output: isArt.map((x, i) => (x ? String(i) : '')).filter(Boolean),
      });
    }
  }

  frames.push({
    caption: mode === 'bridges' ? 'Tarjan bridges: tin / low' : 'Tarjan articulation: tin / low',
    nodes,
    edges: eObjs,
  });
  dfs(0, -1);

  if (mode === 'bridges') {
    frames.push({
      caption: `Bridges = [${bridges.map(([a, b]) => `${a}-${b}`).join(', ')}]`,
      nodes,
      edges: eObjs,
      activeEdges: bridges.map(([a, b]) => undirectedEdgeId(a, b)),
      output: bridges.map(([a, b]) => `${a}-${b}`),
    });
    return {
      kit: 'bridgeScc',
      title: 'Bridges (Tarjan tin/low)',
      inputSummary: `n=${n}, edges=${JSON.stringify(edges)}`,
      expectedOutput: bridges.map(([a, b]) => `${a}-${b}`).join(', '),
      frames,
    };
  }

  const arts = isArt.map((x, i) => (x ? i : -1)).filter((x) => x >= 0);
  frames.push({
    caption: `Articulation points = [${arts.join(', ')}]`,
    nodes,
    edges: eObjs,
    visited: arts.map(String),
    output: arts.map(String),
  });
  return {
    kit: 'bridgeScc',
    title: 'Articulation points (Tarjan)',
    inputSummary: `n=${n}, edges=${JSON.stringify(edges)}`,
    expectedOutput: arts.join(', '),
    frames,
  };
}
