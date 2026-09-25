import { layoutGraphCircle, undirectedEdgeId } from '../layout';
import type { VizEdge, VizFrame, VizNode, VizSpec } from '../types';

/** Default DSU ops matching union-by-rank teaching demos. */
export const DEFAULT_DSU = {
  n: 7,
  unions: [
    [0, 1],
    [1, 2],
    [3, 4],
    [5, 6],
    [2, 4],
  ] as Array<[number, number]>,
};

export function buildDsu(): VizSpec {
  const { n, unions } = DEFAULT_DSU;
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = Array(n).fill(0);

  function find(x: number, path: number[] = []): number {
    path.push(x);
    if (parent[x] !== x) return find(parent[x], path);
    return x;
  }

  function nodesFor(): { nodes: VizNode[]; edges: VizEdge[] } {
    const roots = new Map<number, number[]>();
    for (let i = 0; i < n; i++) {
      let x = i;
      while (parent[x] !== x) x = parent[x];
      if (!roots.has(x)) roots.set(x, []);
      roots.get(x)!.push(i);
    }
    const comps = [...roots.entries()];
    const nodes: VizNode[] = [];
    const edges: VizEdge[] = [];
    const width = 420;
    const gap = width / (comps.length + 1);
    comps.forEach(([, members], ci) => {
      const cx = gap * (ci + 1);
      const rootId = (() => {
        let x = members[0];
        while (parent[x] !== x) x = parent[x];
        return x;
      })();
      members.forEach((m, mi) => {
        const y = m === rootId ? 50 : 120 + (mi % 3) * 40;
        const x = m === rootId ? cx : cx - 30 + (mi % 3) * 30;
        nodes.push({ id: String(m), label: String(m), x, y });
        if (m !== rootId) {
          edges.push({
            id: `${m}->${parent[m]}`,
            from: String(m),
            to: String(parent[m]),
            directed: true,
          });
        }
      });
    });
    if (!nodes.length) return { nodes: layoutGraphCircle(n), edges: [] };
    return { nodes, edges };
  }

  const frames: VizFrame[] = [];
  let { nodes, edges } = nodesFor();
  frames.push({
    caption: `n=${n} — each node its own parent`,
    nodes,
    edges,
    aux: { parent: parent.join(','), rank: rank.join(',') },
  });

  for (const [a, b] of unions) {
    const pathA: number[] = [];
    const pathB: number[] = [];
    const ra = find(a, pathA);
    const rb = find(b, pathB);
    ({ nodes, edges } = nodesFor());
    frames.push({
      caption: `union(${a},${b}): find → ${ra} & ${rb}`,
      nodes,
      edges,
      active: [String(a), String(b), String(ra), String(rb)],
      stack: pathA.map(String),
      queue: pathB.map(String),
      aux: { parent: parent.join(','), rank: rank.join(',') },
    });

    if (ra === rb) {
      frames.push({
        caption: `Already same component — skip`,
        nodes,
        edges,
        active: [String(ra)],
        aux: { parent: parent.join(',') },
      });
      continue;
    }

    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else {
      parent[rb] = ra;
      rank[ra]++;
    }
    ({ nodes, edges } = nodesFor());
    frames.push({
      caption: `Link by rank — parent=[${parent.join(',')}]`,
      nodes,
      edges,
      active: [String(ra), String(rb)],
      activeEdges: [undirectedEdgeId(a, b)],
      aux: { parent: parent.join(','), rank: rank.join(',') },
      output: [`merged ${a}-${b}`],
    });
  }

  const comps = new Set(parent.map((_, i) => find(i)));
  ({ nodes, edges } = nodesFor());
  frames.push({
    caption: `Done — ${comps.size} components`,
    nodes,
    edges,
    aux: { components: String(comps.size), parent: parent.join(',') },
    output: [String(comps.size)],
  });

  return {
    kit: 'dsu',
    title: 'Disjoint Set (union by rank)',
    inputSummary: `n=${n}, unions=${JSON.stringify(unions)}`,
    expectedOutput: `${comps.size} components`,
    frames,
  };
}
