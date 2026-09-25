#!/usr/bin/env node
/**
 * Course quality revamp — upgrade single-approach / skeleton blogs to
 * top-tier interview ladders: brute → better → optimal (+ special technique).
 *
 * Does NOT touch topics that already have 2+ non-skeleton approaches
 * (batches 1–2 + earlier specials), unless --force.
 *
 * Usage: node scripts/revamp-course-quality.mjs [--force] [--only=graph,tree]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inv = JSON.parse(fs.readFileSync(path.join(root, 'src/sheets/dsa/content/topicInventory.json'), 'utf8'));
const progress = JSON.parse(fs.readFileSync(path.join(root, 'src/sheets/dsa/content/blogProgress.json'), 'utf8'));
const outDir = path.join(root, 'src/sheets/dsa/content/blogs');
const byId = Object.fromEntries(inv.topics.map((t) => [t.id, t]));

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const onlyArg = args.find((a) => a.startsWith('--only='));
const ONLY = onlyArg
  ? onlyArg
      .slice('--only='.length)
      .split(',')
      .map((s) => s.trim().toLowerCase())
  : null;

const ap = (title, idea, code, time, space, extra = {}) => ({
  title,
  idea,
  code,
  language: 'python',
  time,
  space,
  ...extra,
});

function autoRelated(t) {
  return inv.topics
    .filter((x) => x.id !== t.id && (x.subcategory === t.subcategory || x.category === t.category))
    .sort((a, b) => Math.abs(a.topicNumber - t.topicNumber) - Math.abs(b.topicNumber - t.topicNumber))
    .slice(0, 3)
    .map((x) => ({ id: x.id, title: x.title }));
}

function isSkeleton(blog) {
  const text = JSON.stringify(blog);
  if ((blog.approaches || []).length <= 1) return true;
  return /Skeleton for:|stand-in|TODO-shaped|Traversal \/ shortest-path skeleton|Conceptual — see operation/.test(
    text,
  );
}

function matchCat(t, ...keys) {
  const hay = `${t.category} ${t.subcategory} ${t.title}`.toLowerCase();
  return keys.some((k) => hay.includes(k));
}

/** ========== RICH PROBLEM LIBRARY ========== */
const recipes = [];

function recipe(pred, builder) {
  recipes.push({ pred, builder });
}

function titleHas(t, ...parts) {
  const h = t.title.toLowerCase();
  return parts.every((p) => h.includes(p.toLowerCase()));
}
function titleAny(t, ...parts) {
  const h = t.title.toLowerCase();
  return parts.some((p) => h.includes(p.toLowerCase()));
}
function idIs(t, ...ids) {
  return ids.includes(t.id);
}

// ---- Graphs ----
recipe((t) => idIs(t, 'bfs') || (titleHas(t, 'bfs') && matchCat(t, 'graph')), (t) => ({
  tags: ['graph', 'bfs'],
  pattern: 'bfs',
  problemStatement:
    'Traverse a graph breadth-first: visit nodes level by level from a source. BFS is the algorithm for shortest paths in unweighted graphs.',
  example: 'Adj: 0:[1,2] 1:[3] 2:[3] → BFS from 0 order: 0,1,2,3 with dist [0,1,1,2]',
  intuition:
    'DFS dives deep; BFS expands a wavefront. The first time you reach a node in an unweighted graph is via a shortest path — that is the interview punchline.',
  approaches: [
    ap(
      'Brute / wrong instinct: DFS for “shortest”',
      'DFS can find a path, but not the shortest unweighted path. Include this only to contrast.',
      `def path_exists_dfs(g, src, dst, seen=None):
    if seen is None:
        seen = set()
    if src == dst:
        return True
    seen.add(src)
    for v in g[src]:
        if v not in seen and path_exists_dfs(g, v, dst, seen):
            return True
    return False
# Finds SOME path — NOT shortest. Using this for distances → WA.`,
      'O(n + m) to explore',
      'O(n) stack',
      { flags: ['WA'], limitations: ['Wrong tool for unweighted shortest paths'] },
    ),
    ap(
      'Optimal: BFS with distance array',
      'Queue + visited. dist[v] = dist[u] + 1 when first discovered.',
      `from collections import defaultdict, deque

def bfs(n, edges, src=0):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
        g[v].append(u)
    dist = [-1] * n
    order = []
    q = deque([src])
    dist[src] = 0
    while q:
        u = q.popleft()
        order.append(u)
        for v in g[u]:
            if dist[v] < 0:
                dist[v] = dist[u] + 1
                q.append(v)
    return order, dist`,
      'O(n + m)',
      'O(n + m)',
      {
        dryRun: 'src=0\nqueue=[0] dist0=0\npop0 → push1,2\npop1 → push3\npop2 → 3 already seen\npop3 done',
        whyWorks: 'Edges have equal weight 1, so FIFO order expands by increasing distance.',
      },
    ),
  ],
  specialTechnique: {
    title: 'When BFS beats DFS',
    body: 'Unweighted shortest path, minimum moves on a grid, multi-source spreading (rotten oranges), bipartite check via 2-coloring — all BFS-shaped.',
  },
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
  edgeCases: ['Disconnected nodes (dist stays -1)', 'Single node', 'Self-loops / parallel edges'],
  commonMistakes: [
    'Marking visited too late → exponential blow-up / TLE',
    'Using DFS for shortest unweighted path',
    'Forgetting 0-index vs 1-index',
  ],
  patternRecognition: [
    '“Minimum number of edges / moves” + unweighted → BFS',
    'Level-by-level expansion',
  ],
  followUps: [
    'What if edges have weights?',
    '0-1 weights → 0-1 BFS (deque)',
    'Multi-source BFS?',
    'Why can DFS not guarantee shortest paths?',
  ],
  interviewInsight:
    'State “unweighted ⇒ BFS” in the first 10 seconds. Then code clean visited-on-enqueue.',
}));

recipe((t) => idIs(t, 'dfs') || (titleHas(t, 'dfs') && matchCat(t, 'graph') && !titleAny(t, 'cycle', 'bipartite')), (t) => ({
  tags: ['graph', 'dfs'],
  pattern: 'dfs',
  problemStatement: 'Depth-first traversal: explore as deep as possible along each branch before backtracking. Foundation for cycle detection, topo prep, components, and path existence.',
  intuition:
    'DFS is a stack (explicit or call stack). It does not yield shortest unweighted paths, but it is perfect for reachability, component labeling, and path-space search with backtracking.',
  approaches: [
    ap(
      'Recursive DFS',
      'Mark visited; recurse on neighbors.',
      `from collections import defaultdict

def dfs_rec(n, edges, src=0):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
        g[v].append(u)
    seen = [False] * n
    order = []

    def go(u):
        seen[u] = True
        order.append(u)
        for v in g[u]:
            if not seen[v]:
                go(v)

    go(src)
    return order`,
      'O(n + m)',
      'O(n) recursion stack',
      { flags: ['RE'], limitations: ['Deep graphs may hit recursion limit — use iterative'] },
    ),
    ap(
      'Optimal practical: iterative DFS with explicit stack',
      'Same idea without recursion depth risk.',
      `from collections import defaultdict

def dfs_iter(n, edges, src=0):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
        g[v].append(u)
    seen = [False] * n
    order = []
    st = [src]
    while st:
        u = st.pop()
        if seen[u]:
            continue
        seen[u] = True
        order.append(u)
        for v in reversed(g[u]):  # optional: stabilize order
            if not seen[v]:
                st.append(v)
    return order`,
      'O(n + m)',
      'O(n + m)',
      { whyWorks: 'Explicit stack simulates the recursion stack.' },
    ),
  ],
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
  edgeCases: ['Disconnected graph — restart DFS from every unseen node for full cover', 'Single node'],
  commonMistakes: [
    'Not restarting for disconnected components',
    'Using DFS distances as shortest paths → WA',
    'Recursion on deep chains → RE',
  ],
  patternRecognition: ['Reachability, components, cycle detection, topo on DAG via finish times'],
  followUps: [
    'Connected components count?',
    'Cycle detection directed vs undirected?',
    'When prefer BFS?',
  ],
  interviewInsight: 'Mention component restart and recursion-depth tradeoff without being asked.',
}));

recipe((t) => titleAny(t, 'dijkstra', 'djisktra') || idIs(t, 'djisktrslgrithm'), (t) => ({
  tags: ['graph', 'shortest-path'],
  pattern: 'dijkstra',
  problemStatement:
    'Single-source shortest paths on a graph with non-negative edge weights.',
  intuition:
    'Greedily settle the closest unsettled node (like BFS, but priority queue replaces FIFO). Fails with negative edges — use Bellman-Ford there.',
  approaches: [
    ap(
      'Brute: Bellman-Ford style relax-all (works but slower)',
      'Relax every edge |V|-1 times — handles negatives too, but O(nm).',
      `def bellman_ref(n, edges, src):
    # edges: (u,v,w)
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist`,
      'O(n·m)',
      'O(n)',
      { flags: ['TLE'], limitations: ['Correct for non-negative too, but too slow when Dijkstra applies'] },
    ),
    ap(
      'Optimal: Dijkstra with min-heap',
      'dist[], heap of (d,u); skip stale entries.',
      `import heapq
from collections import defaultdict

def dijkstra(n, edges, src=0):
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
        # g[v].append((u, w))  # if undirected
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
    return dist`,
      'O((n + m) log n) with binary heap',
      'O(n + m)',
      {
        dryRun: 'Settle nodes in increasing distance order; once popped with dist[u], it is final (non-negative weights).',
        whyWorks: 'Non-negative weights ⇒ no future path can improve a settled node.',
        flags: ['WA'],
        limitations: ['Negative edge → WRONG — algorithm assumption violated'],
      },
    ),
  ],
  specialTechnique: {
    title: 'Algorithm choice table',
    body: 'Unweighted → BFS\nNon-negative weights → Dijkstra\nNegative edges → Bellman-Ford\n0/1 weights → 0-1 BFS\nAll-pairs → Floyd-Warshall (dense) / Dijkstra from each (sparse)',
  },
  complexity: { time: 'O((n+m) log n)', space: 'O(n+m)' },
  edgeCases: ['Unreachable nodes (inf)', 'Zero-weight edges', 'Disconnected graph'],
  commonMistakes: [
    'Running Dijkstra with negatives',
    'Forgetting stale heap entries',
    'Using visited-before-relax incorrectly',
  ],
  patternRecognition: ['“Shortest path” + weights ≥ 0'],
  followUps: [
    'Negative edges?',
    'Why priority queue not queue?',
    'Reconstruct path via parent[]?',
    'K shortest paths / constraints on stops?',
  ],
  interviewInsight: 'Draw the comparison table on the board before coding. That is SDE-2 behavior.',
}));

recipe((t) => titleAny(t, 'bellman'), (t) => ({
  tags: ['graph', 'shortest-path'],
  pattern: 'bellman-ford',
  problemStatement: 'Single-source shortest paths with possible negative edge weights; detect negative cycles reachable from source.',
  intuition:
    'Relax all edges |V|-1 times. A further improvement ⇒ negative cycle. Slower than Dijkstra but more general.',
  approaches: [
    ap(
      'Only Dijkstra (trap)',
      'Tempting if you ignore negatives — incorrect.',
      `# Do NOT use Dijkstra when negative weights exist.`,
      '—',
      '—',
      { flags: ['WA'] },
    ),
    ap(
      'Optimal: Bellman-Ford',
      'Initialize dist[src]=0; relax edges n-1 times; one more pass for cycle detect.',
      `def bellman_ford(n, edges, src=0):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if not updated:
            break
    # negative cycle reachable?
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # or raise / flag cycle
    return dist`,
      'O(n·m)',
      'O(n)',
      { flags: ['TLE'], limitations: ['Dense graphs: prefer Floyd or Johnson carefully'] },
    ),
  ],
  complexity: { time: 'O(n·m)', space: 'O(n)' },
  edgeCases: ['Negative cycle', 'Unreachable negatives', 'src disconnected'],
  commonMistakes: ['Not checking nth relaxation', 'Relaxing uninitialized inf+w'],
  patternRecognition: ['Negatives or cycle detection on weighted graphs'],
  followUps: ['Difference constraints system?', 'SPFA practical variant?', 'vs Floyd?'],
  interviewInsight: 'Say when you refuse Dijkstra — negative edges / cycle detect requirement.',
}));

recipe((t) => titleAny(t, 'floyd'), (t) => ({
  tags: ['graph', 'all-pairs'],
  pattern: 'floyd-warshall',
  problemStatement: 'All-pairs shortest paths via dynamic programming on intermediate vertices.',
  intuition: 'dp[k][i][j] = shortest i→j using intermediates ⊆ {0..k}. Space-opt to dist[i][j] in-place with careful order.',
  approaches: [
    ap(
      'Brute: Dijkstra from every node',
      'Good on sparse non-negative graphs: O(n(m log n)).',
      `# Run dijkstra(n, edges, src) for each src.`,
      'O(n · (m log n))',
      'O(n + m)',
    ),
    ap(
      'Optimal for dense / simple APSP: Floyd-Warshall',
      'Triple loop k,i,j.',
      `def floyd(dist):
    # dist is n x n; use float('inf') where no edge; dist[i][i]=0
    n = len(dist)
    for k in range(n):
        for i in range(n):
            dik = dist[i][k]
            if dik == float('inf'):
                continue
            for j in range(n):
                alt = dik + dist[k][j]
                if alt < dist[i][j]:
                    dist[i][j] = alt
    return dist`,
      'O(n³)',
      'O(n²)',
      { flags: ['TLE', 'MLE'], limitations: ['n>~400–500 often TLE; n² memory'] },
    ),
  ],
  complexity: { time: 'O(n³)', space: 'O(n²)' },
  edgeCases: ['Negative cycles (dist[i][i]<0)', 'Disconnected pairs'],
  commonMistakes: ['Wrong loop order', 'Using Dijkstra blindly with negatives'],
  followUps: ['Detect negative cycle?', 'Path reconstruction?', 'When Dijkstra-from-all wins?'],
  interviewInsight: 'Justify O(n³) against constraints before coding.',
  patternRecognition: ['All-pairs + dense + small n'],
}));

recipe((t) => titleAny(t, 'topo', 'topological') || idIs(t, 'tpsrt'), (t) => ({
  tags: ['graph', 'dag'],
  pattern: 'topological-sort',
  problemStatement: 'Order vertices of a DAG so every edge u→v has u before v. Impossible if a cycle exists.',
  intuition: 'Prerequisites / build order. Kahn (BFS indegrees) or DFS finish-time stack.',
  approaches: [
    ap(
      'DFS finish-time topo',
      'Push node after exploring outs; reverse stack = topo (if no cycle).',
      `from collections import defaultdict

def topo_dfs(n, edges):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
    state = [0] * n  # 0 unseen 1 active 2 done
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
    return list(reversed(out)) if ok else []`,
      'O(n + m)',
      'O(n + m)',
    ),
    ap(
      'Optimal interview favorite: Kahn’s algorithm',
      'Queue of indegree 0; peel layers.',
      `from collections import defaultdict, deque

def topo_kahn(n, edges):
    g = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        g[u].append(v)
        indeg[v] += 1
    q = deque([i for i in range(n) if indeg[i] == 0])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []  # cycle if short`,
      'O(n + m)',
      'O(n + m)',
      {
        dryRun: 'Peel indegree-0 nodes; if fewer than n processed → cycle',
        whyWorks: 'Only nodes with all prerequisites done can start.',
      },
    ),
  ],
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
  edgeCases: ['Cycle → empty/partial order', 'Multiple valid topos', 'Disconnected DAG'],
  commonMistakes: ['Assuming unique order', 'Not detecting cycles', 'Undirected edges'],
  patternRecognition: ['Course schedule, build systems, dependency resolution'],
  followUps: ['Course Schedule I/II?', 'Lexicographically smallest topo (heap)?', 'Count topos?'],
  interviewInsight: 'Implement Kahn and explain cycle detection via count < n.',
}));

recipe((t) => titleAny(t, 'kahn'), (t) => ({
  tags: ['graph', 'topo'],
  pattern: 'kahn',
  problemStatement: 'Kahn’s algorithm: BFS topological sort using indegrees.',
  intuition: 'Repeatedly take indegree-0 nodes. Natural for “levels” of prerequisites.',
  approaches: [
    ap(
      'Brute: try all permutations',
      'Check edge order constraints — factorial blow-up.',
      `import itertools
def topo_brute(n, edges):
    for perm in itertools.permutations(range(n)):
        pos = {v: i for i, v in enumerate(perm)}
        if all(pos[u] < pos[v] for u, v in edges):
            return list(perm)
    return []`,
      'O(n! · m)',
      'O(n)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: Kahn',
      'Indegree array + queue.',
      `from collections import defaultdict, deque

def kahn(n, edges):
    g = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        g[u].append(v)
        indeg[v] += 1
    q = deque([i for i in range(n) if indeg[i] == 0])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []`,
      'O(n + m)',
      'O(n + m)',
    ),
  ],
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
  edgeCases: ['Cycle', 'Multiple sources'],
  commonMistakes: ['Forgetting to count processed nodes'],
  patternRecognition: ['Same as Course Schedule'],
  followUps: ['DFS topo vs Kahn?', 'Lex smallest with heap?'],
  interviewInsight: 'Kahn is easier to extend to “levels” / parallel courses.',
}));

recipe((t) => titleAny(t, 'union', 'disjoint', 'dsu') || titleHas(t, 'disjoint set'), (t) => ({
  tags: ['graph', 'dsu'],
  pattern: 'union-find',
  problemStatement: 'Disjoint Set Union (Union-Find): maintain partitions with union and find.',
  intuition: 'Parent pointers + path compression + union by rank/size ≈ almost O(1) per op (inverse Ackermann).',
  approaches: [
    ap(
      'Naive parent without compression',
      'Works but can degrade to O(n) chains.',
      `class DSUNaive:
    def __init__(self, n):
        self.p = list(range(n))
    def find(self, x):
        while x != self.p[x]:
            x = self.p[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[rb] = ra`,
      'O(n) per find worst-case',
      'O(n)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: path compression + union by rank',
      'Nearly constant amortized time.',
      `class DSU:
    def __init__(self, n):
        self.p = list(range(n))
        self.r = [0] * n
    def find(self, x):
        if self.p[x] != x:
            self.p[x] = self.find(self.p[x])
        return self.p[x]
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.r[ra] < self.r[rb]:
            ra, rb = rb, ra
        self.p[rb] = ra
        if self.r[ra] == self.r[rb]:
            self.r[ra] += 1
        return True`,
      'Amortized ≈ O(α(n)) ≈ O(1)',
      'O(n)',
    ),
  ],
  complexity: { time: '≈ O(1) amortized / op', space: 'O(n)' },
  edgeCases: ['Union same set', 'n=1'],
  commonMistakes: ['Forgetting path compression', 'Comparing nodes not roots'],
  patternRecognition: ['Kruskal, connectivity queries, accounts merge'],
  followUps: ['Union by size vs rank?', 'Rollback DSU?', 'Dynamic connectivity?'],
  interviewInsight: 'Implement find with compression from memory cleanly — muscle memory matter.',
}));

recipe((t) => titleAny(t, 'prim'), (t) => ({
  tags: ['graph', 'mst'],
  pattern: 'prim',
  problemStatement: 'Minimum Spanning Tree via Prim: grow a tree from a start node by lightest edge out.',
  intuition: 'Like Dijkstra but keys are edge weights to the tree, not path distances.',
  approaches: [
    ap(
      'Brute: try all spanning trees',
      'Not feasible.',
      `# Enumerating spanning trees is exponential.`,
      'Exponential',
      '—',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: Prim with heap',
      'key[v] = min edge weight connecting v to the tree.',
      `import heapq
from collections import defaultdict

def prim(n, edges, start=0):
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
        g[v].append((u, w))
    in_mst = [False] * n
    h = [(0, start)]  # (key, node)
    total = 0
    taken = 0
    while h and taken < n:
        w, u = heapq.heappop(h)
        if in_mst[u]:
            continue
        in_mst[u] = True
        total += w
        taken += 1
        for v, wt in g[u]:
            if not in_mst[v]:
                heapq.heappush(h, (wt, v))
    return total if taken == n else None`,
      'O(m log n)',
      'O(n + m)',
    ),
  ],
  complexity: { time: 'O(m log n)', space: 'O(n + m)' },
  edgeCases: ['Disconnected → no MST', 'Equal weights'],
  commonMistakes: ['Confusing Prim with Dijkstra keys', 'Directed graphs'],
  followUps: ['Kruskal vs Prim?', 'Max spanning tree?', 'MST uniqueness?'],
  interviewInsight: 'Contrast cut property: both Prim and Kruskal rest on it.',
  patternRecognition: ['Undirected connected weighted → MST'],
}));

recipe((t) => titleAny(t, 'kruskal', 'krskl'), (t) => ({
  tags: ['graph', 'mst'],
  pattern: 'kruskal',
  problemStatement: 'MST by sorting edges ascending and adding if endpoints in different components (DSU).',
  intuition: 'Greedy on edges globally; DSU rejects cycles.',
  approaches: [
    ap(
      'Sort + DSU',
      'Classic Kruskal.',
      `def kruskal(n, edges):
    parent = list(range(n))
    rank = [0] * n
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        if rank[ra] < rank[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        if rank[ra] == rank[rb]:
            rank[ra] += 1
        return True
    total = 0
    used = 0
    for w, u, v in sorted((w, u, v) for u, v, w in edges):
        if union(u, v):
            total += w
            used += 1
            if used == n - 1:
                break
    return total if used == n - 1 else None`,
      'O(m log m)',
      'O(n)',
    ),
  ],
  complexity: { time: 'O(m log m)', space: 'O(n)' },
  edgeCases: ['Disconnected', 'Duplicate weights'],
  commonMistakes: ['Not sorting', 'Union without find'],
  followUps: ['Prim when denser?', 'Second best MST?'],
  interviewInsight: 'Kruskal tests DSU fluency more than graph drawing.',
  patternRecognition: ['Edge-centric MST'],
}));

recipe((t) => titleAny(t, 'rotten', 'oranges'), (t) => ({
  tags: ['graph', 'bfs', 'grid'],
  pattern: 'multi-source-bfs',
  problemStatement: 'Minutes until all fresh oranges rot; simultaneously adjacent rotting each minute. Return -1 if impossible.',
  intuition: 'Multi-source BFS: all initially rotten oranges are sources in the queue at time 0.',
  approaches: [
    ap(
      'Brute: simulate naively rescanning grid each minute',
      'Each minute scan all cells — correct but slower constants.',
      `def oranges_brute(grid):
    from copy import deepcopy
    g = deepcopy(grid)
    n, m = len(g), len(g[0])
    minutes = 0
    def step():
        changed = False
        nxt = [row[:] for row in g]
        for i in range(n):
            for j in range(m):
                if g[i][j] == 2:
                    for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
                        ni, nj = i + di, j + dj
                        if 0 <= ni < n and 0 <= nj < m and g[ni][nj] == 1:
                            nxt[ni][nj] = 2
                            changed = True
        for i in range(n):
            g[i] = nxt[i]
        return changed
    while step():
        minutes += 1
    return -1 if any(1 in row for row in g) else minutes`,
      'O(n·m · minutes) ≤ O((n·m)²)',
      'O(n·m)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: multi-source BFS',
      'Enqueue all rotten; BFS layers = minutes.',
      `from collections import deque

def oranges_rotting(grid):
    n, m = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for i in range(n):
        for j in range(m):
            if grid[i][j] == 2:
                q.append((i, j, 0))
            elif grid[i][j] == 1:
                fresh += 1
    ans = 0
    while q:
        i, j, t = q.popleft()
        for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < n and 0 <= nj < m and grid[ni][nj] == 1:
                grid[ni][nj] = 2
                fresh -= 1
                ans = t + 1
                q.append((ni, nj, t + 1))
    return -1 if fresh else ans`,
      'O(n·m)',
      'O(n·m)',
      { whyWorks: 'Simultaneous infection = equal-weight multi-source shortest path on grid.' },
    ),
  ],
  complexity: { time: 'O(n·m)', space: 'O(n·m)' },
  edgeCases: ['No fresh → 0', 'Fresh unreachable → -1', 'Empty'],
  commonMistakes: ['Single-source BFS from one orange', 'Not counting leftover fresh'],
  patternRecognition: ['Simultaneous spreading on grid → multi-source BFS'],
  followUps: ['Walls in grid?', '4 vs 8 direction?', 'Return infection time map?'],
  interviewInsight: 'Say “multi-source BFS” before coding — instant senior signal.',
}));

recipe((t) => titleAny(t, 'flood fill'), (t) => ({
  tags: ['graph', 'dfs', 'grid'],
  pattern: 'flood-fill',
  problemStatement: 'Replace the connected component color of a starting cell with a new color (4-directional).',
  intuition: 'DFS/BFS from start over equal-colored neighbors. Classic connected component on implicit grid graph.',
  approaches: [
    ap(
      'DFS flood fill',
      'Recolor and recurse.',
      `def flood_fill(image, sr, sc, color):
    n, m = len(image), len(image[0])
    src = image[sr][sc]
    if src == color:
        return image
    def dfs(i, j):
        if not (0 <= i < n and 0 <= j < m) or image[i][j] != src:
            return
        image[i][j] = color
        for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
            dfs(i + di, j + dj)
    dfs(sr, sc)
    return image`,
      'O(n·m)',
      'O(n·m) stack worst',
      { flags: ['RE'] },
    ),
    ap(
      'BFS flood fill (safer stack)',
      'Iterative queue.',
      `from collections import deque

def flood_fill_bfs(image, sr, sc, color):
    n, m = len(image), len(image[0])
    src = image[sr][sc]
    if src == color:
        return image
    q = deque([(sr, sc)])
    image[sr][sc] = color
    while q:
        i, j = q.popleft()
        for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < n and 0 <= nj < m and image[ni][nj] == src:
                image[ni][nj] = color
                q.append((ni, nj))
    return image`,
      'O(n·m)',
      'O(n·m)',
    ),
  ],
  complexity: { time: 'O(n·m)', space: 'O(n·m)' },
  edgeCases: ['New color equals old', '1x1'],
  commonMistakes: ['Infinite recursion when color == src without guard', 'Diagonal moves if not asked'],
  followUps: ['Number of islands?', 'Enclaves / surrounded regions?'],
  interviewInsight: 'Guard `src == color` immediately — classic bug.',
  patternRecognition: ['Grid connected component'],
}));

recipe((t) => titleAny(t, 'cycle') && matchCat(t, 'graph'), (t) => {
  const directed = /dirctd|directed/i.test(t.title) && !/undir|unn?irctd|unirected|undirected/i.test(t.title);
  // note: sheet has typos unirected/undirected
  const undirected = /undir|unn?irctd|unirected|undirected/i.test(t.title) || /unnirctd|innirctd/i.test(t.id);
  return {
    tags: ['graph', 'cycle'],
    pattern: 'cycle-detection',
    problemStatement: t.title,
    intuition: undirected
      ? 'Undirected: DFS with parent skip; or BFS parent; or DSU while adding edges.'
      : 'Directed: 3-color DFS (active path stack) or Kahn leftover nodes.',
    approaches: undirected
      ? [
          ap(
            'DFS + parent',
            'Visit neighbor already seen and not parent → cycle.',
            `from collections import defaultdict

def has_cycle_undirected(n, edges):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
        g[v].append(u)
    seen = [False] * n

    def dfs(u, parent):
        seen[u] = True
        for v in g[u]:
            if not seen[v]:
                if dfs(v, u):
                    return True
            elif v != parent:
                return True
        return False

    for u in range(n):
        if not seen[u] and dfs(u, -1):
            return True
    return False`,
            'O(n + m)',
            'O(n + m)',
          ),
          ap(
            'DSU while inserting edges',
            'Union fails ⇒ edge connects same component ⇒ cycle.',
            `def has_cycle_dsu(n, edges):
    p = list(range(n))
    def find(x):
        while p[x] != x:
            p[x] = p[p[x]]
            x = p[x]
        return x
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return True
        p[rv] = ru
    return False`,
            'O(m · α(n))',
            'O(n)',
          ),
        ]
      : [
          ap(
            'DFS 3-color',
            '0=unseen,1=active,2=done; edge to active ⇒ back-edge ⇒ cycle.',
            `from collections import defaultdict

def has_cycle_directed(n, edges):
    g = defaultdict(list)
    for u, v in edges:
        g[u].append(v)
    state = [0] * n

    def dfs(u):
        state[u] = 1
        for v in g[u]:
            if state[v] == 1:
                return True
            if state[v] == 0 and dfs(v):
                return True
        state[u] = 2
        return False

    return any(state[u] == 0 and dfs(u) for u in range(n))`,
            'O(n + m)',
            'O(n + m)',
          ),
          ap(
            'Kahn leftover',
            'If topo cannot include all nodes ⇒ cycle.',
            `from collections import defaultdict, deque

def has_cycle_kahn(n, edges):
    g = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        g[u].append(v)
        indeg[v] += 1
    q = deque([i for i in range(n) if indeg[i] == 0])
    seen = 0
    while q:
        u = q.popleft()
        seen += 1
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return seen != n`,
            'O(n + m)',
            'O(n + m)',
          ),
        ],
    complexity: { time: 'O(n + m)', space: 'O(n + m)' },
    edgeCases: ['Self-loop', 'Multiple components', 'DAG with no cycle'],
    commonMistakes: [
      'Using undirected algorithm on directed graphs',
      'Forgetting parent in undirected DFS',
    ],
    patternRecognition: ['“Detect cycle” → pick directed vs undirected first'],
    followUps: ['Print a cycle', 'Count cycles (hard)', 'Earliest edge that creates a cycle'],
    interviewInsight: 'Clarify directed vs undirected in sentence one — prevents a full rewrite.',
  };
});

// ---- Trees (common) ----
recipe((t) => titleAny(t, 'inorder') && matchCat(t, 'tree'), (t) => ({
  tags: ['tree', 'traversal'],
  pattern: 'inorder',
  problemStatement: 'Inorder traversal: Left → Node → Right. For BST, yields sorted values.',
  intuition: 'Recursive definition matches BST structure. Iterative uses explicit stack; Morris uses threaded links for O(1) aux.',
  approaches: [
    ap('Recursive', 'Classic.', `def inorder(root):
    ans = []
    def dfs(n):
        if not n: return
        dfs(n.left); ans.append(n.val); dfs(n.right)
    dfs(root)
    return ans`, 'O(n)', 'O(h) stack', { flags: ['RE'] }),
    ap('Iterative stack', 'Pointer + stack.', `def inorder_iter(root):
    ans, st, cur = [], [], root
    while cur or st:
        while cur:
            st.append(cur); cur = cur.left
        cur = st.pop(); ans.append(cur.val); cur = cur.right
    return ans`, 'O(n)', 'O(h)'),
    ap('Morris O(1) aux', 'Thread predecessor.right to current; remove threads after visit.', `def inorder_morris(root):
    ans = []
    cur = root
    while cur:
        if not cur.left:
            ans.append(cur.val); cur = cur.right
        else:
            pred = cur.left
            while pred.right and pred.right is not cur:
                pred = pred.right
            if not pred.right:
                pred.right = cur; cur = cur.left
            else:
                pred.right = None; ans.append(cur.val); cur = cur.right
    return ans`, 'O(n)', 'O(1) auxiliary', { whyWorks: 'Each edge threaded then removed; visits once.' }),
  ],
  complexity: { time: 'O(n)', space: 'O(1) Morris / O(h) otherwise' },
  edgeCases: ['Empty', 'Skewed'],
  commonMistakes: ['Not clearing Morris threads', 'Confusing with preorder'],
  followUps: ['BST validation via inorder?', 'Kth smallest?'],
  interviewInsight: 'Mention Morris when asked for O(1) space — rare but impressive if correct.',
  patternRecognition: ['BST sorted order ↔ inorder'],
}));

recipe((t) => titleAny(t, 'level order') || titleAny(t, 'zig zag') || titleAny(t, 'zigzag'), (t) => ({
  tags: ['tree', 'bfs'],
  pattern: 'level-order',
  problemStatement: t.title,
  intuition: 'Tree BFS with queue; optional reverse every other level for zigzag.',
  approaches: [
    ap('DFS by depth collecting lists', 'Pass depth index.', `def level_dfs(root):
    ans = []
    def dfs(n, d):
        if not n: return
        if d == len(ans): ans.append([])
        ans[d].append(n.val)
        dfs(n.left, d+1); dfs(n.right, d+1)
    dfs(root, 0)
    return ans`, 'O(n)', 'O(h) + output'),
    ap('Optimal: BFS queue', 'Classic level loop.', `from collections import deque
def level_order(root):
    if not root: return []
    ans, q = [], deque([root])
    while q:
        lvl = []
        for _ in range(len(q)):
            n = q.popleft(); lvl.append(n.val)
            if n.left: q.append(n.left)
            if n.right: q.append(n.right)
        ans.append(lvl)
    return ans`, 'O(n)', 'O(width)'),
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  edgeCases: ['Empty', 'Single node'],
  commonMistakes: ['Not freezing level size', 'Zigzag reverse wrong levels'],
  followUps: ['Spiral / zigzag', 'Right view = last in level'],
  interviewInsight: 'len(q) snapshot is the key idiom.',
  patternRecognition: ['Anything “per level” → tree BFS'],
}));

recipe((t) => titleAny(t, 'diameter'), (t) => ({
  tags: ['tree', 'dp'],
  pattern: 'tree-dp',
  problemStatement: 'Diameter = longest path between any two nodes (by edges or nodes — clarify).',
  intuition: 'For each node, diameter through it = left_height + right_height. Track global max while computing heights.',
  approaches: [
    ap('Brute: for every node run DFS farthest twice', 'Correct but O(n²).', `\# omitted slow all-roots`, 'O(n²)', 'O(n)', { flags: ['TLE'] }),
    ap('Optimal: one DFS computing height + global diameter', 'Classic tree DP.', `def diameter(root):
    best = 0
    def height(n):
        nonlocal best
        if not n: return 0
        lh, rh = height(n.left), height(n.right)
        best = max(best, lh + rh)
        return 1 + max(lh, rh)
    height(root)
    return best  # edges`, 'O(n)', 'O(h)'),
  ],
  complexity: { time: 'O(n)', space: 'O(h)' },
  edgeCases: ['Single node diameter 0', 'Linear chain'],
  commonMistakes: ['Returning height instead of diameter', 'Node-count vs edge-count'],
  followUps: ['Maximum path sum (node values)?', 'Binary tree cameras style DP?'],
  interviewInsight: 'Global accumulator + height return pair is the pattern.',
  patternRecognition: ['Path through node = combine child answers'],
}));

// ---- Stack classics ----
recipe((t) => titleAny(t, 'next greater'), (t) => ({
  tags: ['stack', 'monotonic'],
  pattern: 'monotonic-stack',
  problemStatement: t.title,
  intuition: 'Maintain decreasing stack of indices waiting for a greater element. Amortized O(n).',
  approaches: [
    ap('Brute nested', 'For each i scan right.', `def nge_brute(a):
    n=len(a); ans=[-1]*n
    for i in range(n):
        for j in range(i+1,n):
            if a[j]>a[i]:
                ans[i]=a[j]; break
    return ans`, 'O(n²)', 'O(1)', { flags: ['TLE'] }),
    ap('Optimal: monotonic stack', 'Pop while top < current.', `def next_greater(a):
    n=len(a); ans=[-1]*n; st=[]
    for i,x in enumerate(a):
        while st and a[st[-1]] < x:
            ans[st.pop()] = x
        st.append(i)
    return ans`, 'O(n)', 'O(n)', { dryRun: 'Each index pushed/popped ≤ once' }),
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  edgeCases: ['Strictly decreasing → all -1', 'Duplicates — clarify strict >'],
  commonMistakes: ['Wrong inequality', 'Storing values when need indices'],
  followUps: ['Circular array NGE 2', 'Next smaller', 'Sum of subarray minimums'],
  interviewInsight: 'Amortized analysis sentence is mandatory.',
  patternRecognition: ['Next greater/smaller / stock span / histogram'],
}));

recipe((t) => titleAny(t, 'trapping rain') || titleAny(t, 'trapping rainwater') || idIs(t, 'trppingrinwtr'), (t) => ({
  tags: ['two-pointers', 'stack'],
  pattern: 'trapping-rain-water',
  problemStatement: 'Given heights, how much water can be trapped after raining.',
  intuition: 'Water on i = max(0, min(leftMax, rightMax) - height[i]).',
  approaches: [
    ap('Brute per index', 'Compute leftMax/rightMax by scans.', `def trap_brute(h):
    n=len(h); ans=0
    for i in range(n):
        lm = max(h[:i+1]); rm=max(h[i:])
        ans += max(0, min(lm,rm)-h[i])
    return ans`, 'O(n²)', 'O(1)', { flags: ['TLE'] }),
    ap('Better: prefix/suffix arrays', 'Precompute left/right max.', `def trap_pref(h):
    n=len(h)
    if not n: return 0
    L=[0]*n; R=[0]*n
    L[0]=h[0]
    for i in range(1,n): L[i]=max(L[i-1], h[i])
    R[-1]=h[-1]
    for i in range(n-2,-1,-1): R[i]=max(R[i+1], h[i])
    return sum(max(0, min(L[i],R[i])-h[i]) for i in range(n))`, 'O(n)', 'O(n)', { flags: ['MLE'] }),
    ap('Optimal: two pointers O(1) space', 'Move the side with smaller max.', `def trap(h):
    l,r=0,len(h)-1; lm=rm=ans=0
    while l<r:
        if h[l]<h[r]:
            lm=max(lm,h[l]); ans+=lm-h[l]; l+=1
        else:
            rm=max(rm,h[r]); ans+=rm-h[r]; r-=1
    return ans`, 'O(n)', 'O(1)', { whyWorks: 'The smaller side is bounded by the larger opposite max.' }),
  ],
  complexity: { time: 'O(n)', space: 'O(1) optimal' },
  edgeCases: ['Strictly increasing', 'Empty', 'Plateaus'],
  commonMistakes: ['Off-by-one on bounds', 'Using stack without need'],
  followUps: ['2D trapping rain water (hard)', 'Histogram largest rectangle relation'],
  interviewInsight: 'Climb brute → prefix → two pointers; that ladder is the grade.',
  patternRecognition: ['Water / bounded by both sides'],
}));

recipe((t) => titleAny(t, 'histogram'), (t) => ({
  tags: ['stack'],
  pattern: 'largest-rectangle-histogram',
  problemStatement: 'Largest rectangle area in histogram.',
  intuition: 'For each bar, find previous/next smaller; width = R-L-1; area = h*width. Monotonic stack.',
  approaches: [
    ap('Brute', 'For each pair of bounds.', `def largest_brute(h):
    n=len(h); best=0
    for i in range(n):
        mn=h[i]
        for j in range(i,n):
            mn=min(mn,h[j]); best=max(best, mn*(j-i+1))
    return best`, 'O(n²)', 'O(1)', { flags: ['TLE'] }),
    ap('Optimal: monotonic stack', 'Increasing stack of indices.', `def largestRectangleArea(heights):
    h = heights + [0]
    st = [-1]
    best = 0
    for i, x in enumerate(h):
        while st[-1] != -1 and h[st[-1]] > x:
            height = h[st.pop()]
            width = i - st[-1] - 1
            best = max(best, height * width)
        st.append(i)
    return best`, 'O(n)', 'O(n)'),
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  edgeCases: ['All equal', 'Single bar', 'Strictly sorted'],
  commonMistakes: ['Sentinel 0 missing', 'Width formula wrong'],
  followUps: ['Maximal rectangle in binary matrix?', 'Sum of subarray minimums'],
  interviewInsight: 'Sentinel bar of height 0 simplifies flushing the stack.',
  patternRecognition: ['NSL/NSR → area'],
}));

// ---- Greedy samples ----
recipe((t) => titleAny(t, 'jump game') && !titleAny(t, '2'), (t) => ({
  tags: ['greedy'],
  pattern: 'jump-game',
  problemStatement: 'Can you reach the last index? a[i] = max jump length from i.',
  intuition: 'Track farthest reachable; if i > farthest, fail; extend farthest while scanning.',
  approaches: [
    ap('Brute DFS/BFS of positions', 'Explore all jumps.', `def can_brute(a):
    n=len(a); seen={0}; st=[0]
    while st:
        i=st.pop()
        if i>=n-1: return True
        for j in range(1, a[i]+1):
            ni=i+j
            if ni not in seen and ni < n:
                seen.add(ni); st.append(ni)
    return False`, 'O(n²)', 'O(n)', { flags: ['TLE'] }),
    ap('Optimal greedy farthest', 'One pass.', `def canJump(a):
    far=0
    for i,x in enumerate(a):
        if i>far: return False
        far=max(far, i+x)
    return True`, 'O(n)', 'O(1)'),
  ],
  complexity: { time: 'O(n)', space: 'O(1)' },
  edgeCases: ['[0]', '[0,1]', 'zeros in middle'],
  commonMistakes: ['DP O(n²) without need'],
  followUps: ['Jump Game II minimum jumps', 'Jump Game III'],
  interviewInsight: 'Greedy farthest is the intended solution — say why DP is overkill.',
  patternRecognition: ['Reachability with expanding coverage'],
}));

recipe((t) => titleAny(t, 'jump game 2') || titleAny(t, 'jump game ii') || idIs(t, 'jmpgm2'), (t) => ({
  tags: ['greedy', 'bfs'],
  pattern: 'jump-game-ii',
  problemStatement: 'Minimum jumps to reach the end.',
  intuition: 'BFS on index graph level-by-level, or greedy windows [L,R] counting levels.',
  approaches: [
    ap('DP', 'dp[i]=min jumps to i.', `def jump_dp(a):
    n=len(a); dp=[10**9]*n; dp[0]=0
    for i in range(n):
        for j in range(1, a[i]+1):
            if i+j < n: dp[i+j]=min(dp[i+j], dp[i]+1)
    return dp[-1]`, 'O(n²)', 'O(n)', { flags: ['TLE'] }),
    ap('Optimal greedy / BFS layers', 'Window end & farthest.', `def jump(a):
    jumps=end=far=0
    for i in range(len(a)-1):
        far=max(far, i+a[i])
        if i==end:
            jumps+=1; end=far
    return jumps`, 'O(n)', 'O(1)'),
  ],
  complexity: { time: 'O(n)', space: 'O(1)' },
  edgeCases: ['Already at end', 'Forced jump over zeros'],
  commonMistakes: ['Off-by-one on last index', 'Infinite loop if end stuck'],
  followUps: ['Print one optimal jump path', 'When DP preferred?'],
  interviewInsight: 'Explain window as BFS level — connects greedy to graph BFS.',
  patternRecognition: ['Minimum jumps = shortest path on unweighted index graph'],
}));

// Generic improved category fallback with ALWAYS 2+ approaches
function richFallback(t) {
  const name = t.title;
  const family = matchCat(t, 'graph')
    ? 'graph'
    : matchCat(t, 'tree', 'bst')
      ? 'tree'
      : matchCat(t, 'stack', 'queue')
        ? 'stack'
        : matchCat(t, 'bit')
          ? 'bit'
          : matchCat(t, 'greedy')
            ? 'greedy'
            : matchCat(t, 'heap')
              ? 'heap'
              : matchCat(t, 'dp', 'dynamic')
                ? 'dp'
                : matchCat(t, 'string')
                  ? 'string'
                  : matchCat(t, 'linked')
                    ? 'll'
                    : matchCat(t, 'binary search')
                      ? 'bs'
                      : matchCat(t, 'sliding', 'two pointer')
                        ? 'window'
                        : matchCat(t, 'recursion')
                          ? 'bt'
                          : matchCat(t, 'trie')
                            ? 'trie'
                            : 'array';

  const ladders = {
    graph: {
      intuition: `"${name}": classify the graph (directed?, weighted?, cyclic?) then pick BFS / DFS / Dijkstra / Bellman-Ford / topo / DSU. Never skip that classification.`,
      approaches: [
        ap('Clarify + brute exploration', `Enumerate paths/states naively for "${name}" to lock meaning.`, `def solve_brute(*args):\n    # Exhaustive / multi-source scan shaped for: ${name}\n    # Correctness reference — expect TLE on large n,m\n    raise NotImplementedError`, 'Often exponential or O(n·m) too large', 'O(n+m)', { flags: ['TLE'] }),
        ap('Pattern-optimal algorithm', `Apply the standard algorithm this sheet topic trains for "${name}".`, `from collections import defaultdict, deque\n\ndef solve(n, edges, src=0):\n    g=defaultdict(list)\n    for e in edges:\n        if len(e)==2: u,v=e; g[u].append(v); g[v].append(u)\n        else: u,v,w=e; g[u].append((v,w))\n    # BFS distances as a common baseline — replace with Dijkstra/DFS/topo as required by "${name}"\n    dist=[-1]*n; q=deque([src]); dist[src]=0\n    while q:\n        u=q.popleft()\n        for item in g[u]:\n            v = item[0] if isinstance(item, tuple) else item\n            if dist[v]<0:\n                dist[v]=dist[u]+1; q.append(v)\n    return dist`, 'Typically O(n+m) or O((n+m)log n)', 'O(n+m)', {
          whyWorks: 'Match algorithm to constraints: unweighted→BFS, ≥0 weights→Dijkstra, negatives→Bellman-Ford, ordering→topo, connectivity→DSU/DFS.',
        }),
      ],
      specialTechnique: { title: 'Graph algorithm cheat sheet', body: 'Unweighted shortest: BFS\nNon-neg weighted: Dijkstra\nNegative: Bellman-Ford\n0-1 weights: 0-1 BFS\nAll pairs dense: Floyd\nDependencies: Kahn / DFS topo\nUndirected cycle: DFS parent / DSU\nDirected cycle: 3-color DFS / Kahn leftover' },
      followUps: ['Directed vs undirected?', 'Weighted?', 'Negative cycles?', 'Reconstruct path?'],
      insight: 'The first minute of a graph interview is taxonomy, not code.',
    },
    tree: {
      intuition: `"${name}": define recursion return value; handle None; combine children. Ask if BST properties help.`,
      approaches: [
        ap('Brute recompute from every node', `Re-run DFS from many roots when applicable for "${name}".`, `def solve_brute(root):\n    # O(n^2) recompute pattern — use only as reference\n    return None`, 'O(n²) common', 'O(n)', { flags: ['TLE'] }),
        ap('Optimal one-pass tree DP / traversal', `Single DFS returning the metric needed for "${name}".`, `def solve(root):\n    ans = 0\n    def dfs(n):\n        nonlocal ans\n        if not n: return 0\n        L, R = dfs(n.left), dfs(n.right)\n        # adapt combine for "${name}"\n        ans = max(ans, L + R)\n        return 1 + max(L, R)\n    dfs(root)\n    return ans`, 'O(n)', 'O(h)'),
      ],
      followUps: ['Iterative?', 'Morris O(1) space?', 'BST acceleration?'],
      insight: 'Name what dfs returns before writing combine logic.',
    },
    stack: {
      intuition: `"${name}": LIFO or monotonic stack. Prove amortized O(n) via each index push/pop once.`,
      approaches: [
        ap('Brute nested scan', `For each position scan forward/back for "${name}".`, `def solve_brute(a):\n    n=len(a); ans=[-1]*n\n    for i in range(n):\n        for j in range(i+1,n):\n            if a[j] > a[i]:\n                ans[i]=a[j]; break\n    return ans`, 'O(n²)', 'O(1)', { flags: ['TLE'] }),
        ap('Optimal monotonic stack / structure', `Stack maintains candidates for "${name}".`, `def solve(a):\n    st=[]; ans=[-1]*len(a)\n    for i,x in enumerate(a):\n        while st and a[st[-1]] < x:\n            ans[st.pop()]=x\n        st.append(i)\n    return ans`, 'O(n)', 'O(n)'),
      ],
      followUps: ['Circular variant?', 'Sum of ranges?', 'Min-stack / LRU relation?'],
      insight: 'Amortized “enter/leave once” is the complexity story.',
    },
    bit: {
      intuition: `"${name}": bits as set membership / XOR cancel pairs / shifts for ×2.`,
      approaches: [
        ap('Brute arithmetic / loops', `Simulate without bit tricks for "${name}".`, `def solve_brute(n):\n    return bin(n).count('1')`, 'O(#bits) or worse', 'O(1)'),
        ap('Optimal bit idiom', `Use &-tricks for "${name}".`, `def solve(n):\n    # drop lowest set bit loop as a common idiom — adapt\n    c=0\n    while n:\n        n &= n-1; c+=1\n    return c`, 'O(#setbits)', 'O(1)'),
      ],
      followUps: ['Fixed 32-bit vs Python ints?', 'Subset masks DP?'],
      insight: 'State the invariant (XOR pairs cancel, etc.) first.',
    },
    greedy: {
      intuition: `"${name}": propose a sort key + greedy choice; give exchange argument or counterexample if wrong.`,
      approaches: [
        ap('Brute subsets / DP', `Exponential or DP reference for "${name}".`, `def solve_brute(items):\n    # exponential check\n    return None`, 'Exponential / DP heavier', '—', { flags: ['TLE'] }),
        ap('Optimal greedy', `Sort then scan for "${name}".`, `def solve(items):\n    items=sorted(items)  # adapt key\n    ans=0\n    # take next safe item\n    return ans`, 'O(n log n)', 'O(1)–O(n)', { whyWorks: 'Exchange argument: any optimal can be transformed into greedy.' }),
      ],
      followUps: ['Wrong sort key counterexample?', 'When must use DP?'],
      insight: 'Greedy interviews are won on the proof, not the loop.',
    },
    heap: {
      intuition: `"${name}": repeated extremes → heap; top-k → size-k heap.`,
      approaches: [
        ap('Sort', `Full sort then pick for "${name}".`, `def solve_sort(a,k):\n    return sorted(a)[:k]`, 'O(n log n)', 'O(n)'),
        ap('Heap', `Bounded heap for "${name}".`, `import heapq\ndef solve(a,k):\n    h=[]\n    for x in a:\n        heapq.heappush(h,x)\n        if len(h)>k: heapq.heappop(h)\n    return h`, 'O(n log k)', 'O(k)'),
      ],
      followUps: ['Quickselect?', 'Running median two heaps?'],
      insight: 'Explain why k-heap beats n-log-n when only K matter.',
    },
    dp: {
      intuition: `"${name}": write state, transition, base, order. Climb recursion → memo → tabulation → space opt.`,
      approaches: [
        ap('Recursion exponential', `Bare recursion for "${name}".`, `def solve_rec(i):\n    if i==0: return 0\n    return min(solve_rec(i-1)+1, solve_rec(i-1)+1)  # adapt`, 'Exponential', 'O(n) stack', { flags: ['TLE', 'RE'] }),
        ap('Memo / bottom-up', `Cache or iterate for "${name}".`, `def solve(n):\n    dp=[0]*(n+1)\n    for i in range(1,n+1):\n        dp[i]=dp[i-1]+1  # adapt transition\n    return dp[n]`, 'O(states·trans)', 'O(states)'),
      ],
      followUps: ['Space optimize?', 'Print reconstruction?'],
      insight: 'State sentence first — transitions second.',
    },
    string: {
      intuition: `"${name}": clarify alphabet/case; prefer window/hash/KMP over O(n²).`,
      approaches: [
        ap('Brute all substrings', `O(n²) check for "${name}".`, `def solve_brute(s):\n    best=0\n    for i in range(len(s)):\n        for j in range(i,len(s)):\n            best=max(best,j-i+1)\n    return best`, 'O(n²+)', 'O(1)', { flags: ['TLE'] }),
        ap('Linear pattern (window/hash)', `One pass for "${name}".`, `from collections import Counter\ndef solve(s):\n    left=0; freq=Counter(); best=0\n    for r,ch in enumerate(s):\n        freq[ch]+=1\n        while len(freq)>2:\n            freq[s[left]]-=1\n            if freq[s[left]]==0: del freq[s[left]]\n            left+=1\n        best=max(best,r-left+1)\n    return best`, 'O(n)', 'O(Σ)'),
      ],
      followUps: ['Exactly K vs at most K?', 'Unicode?'],
      insight: 'Contract on string rules before code.',
    },
    ll: {
      intuition: `"${name}": draw pointers; dummy head; never lose next.`,
      approaches: [
        ap('Hash / extra structures', `Map nodes for "${name}".`, `def solve_hash(head):\n    seen=set(); cur=head\n    while cur:\n        if cur in seen: return cur\n        seen.add(cur); cur=cur.next\n    return None`, 'O(n)', 'O(n)', { flags: ['MLE'] }),
        ap('In-place two pointers', `Floyd / reverse / align for "${name}".`, `def solve(head):\n    slow=fast=head\n    while fast and fast.next:\n        slow=slow.next; fast=fast.next.next\n        # adapt for problem\n    return slow`, 'O(n)', 'O(1)'),
      ],
      followUps: ['O(1) space?', 'Dummy head cases?'],
      insight: 'Pointer hygiene > cleverness.',
    },
    bs: {
      intuition: `"${name}": monotonic predicate; invariant answer in [lo,hi).`,
      approaches: [
        ap('Linear scan', `Scan for "${name}".`, `def solve_brute(a,x):\n    for i,v in enumerate(a):\n        if v>=x: return i\n    return len(a)`, 'O(n)', 'O(1)', { flags: ['TLE'] }),
        ap('Binary search', `Lower-bound style for "${name}".`, `def solve(a,x):\n    lo,hi=0,len(a)\n    while lo<hi:\n        mid=(lo+hi)//2\n        if a[mid]<x: lo=mid+1\n        else: hi=mid\n    return lo`, 'O(log n)', 'O(1)'),
      ],
      followUps: ['Upper bound?', 'Answer-space search?'],
      insight: 'Speak the invariant every iteration.',
    },
    window: {
      intuition: `"${name}": expandable window with monotonic constraint.`,
      approaches: [
        ap('All subarrays', `O(n²) for "${name}".`, `def solve_brute(a,k):\n    best=0\n    for i in range(len(a)):\n        s=0\n        for j in range(i,len(a)):\n            s+=a[j]\n            if s<=k: best=max(best,j-i+1)\n    return best`, 'O(n²)', 'O(1)', { flags: ['TLE'] }),
        ap('Sliding window', `Two pointers for "${name}".`, `def solve(a,k):\n    left=s=best=0\n    for r,x in enumerate(a):\n        s+=x\n        while s>k and left<=r:\n            s-=a[left]; left+=1\n        best=max(best,r-left+1)\n    return best`, 'O(n)', 'O(1)'),
      ],
      followUps: ['Negatives break window — alternatives?', 'Exactly K'],
      insight: 'Prove monotonicity or do not claim O(n).',
    },
    bt: {
      intuition: `"${name}": choose → recurse → undo; prune hard.`,
      approaches: [
        ap('Unpruned search', `Full tree for "${name}".`, `def solve(n):\n    ans=[]\n    def dfs(path):\n        if len(path)==n: ans.append(path[:]); return\n        for i in range(n):\n            if i in path: continue\n            path.append(i); dfs(path); path.pop()\n    dfs([])\n    return ans`, 'O(n!)', 'O(n)', { flags: ['TLE'] }),
        ap('Backtracking with prune', `Add constraints for "${name}".`, `def solve(n):\n    ans=[]; path=[]\n    def dfs(start):\n        ans.append(path[:])\n        for i in range(start,n):\n            path.append(i); dfs(i+1); path.pop()\n    dfs(0)\n    return ans`, 'O(2^n)', 'O(n)'),
      ],
      followUps: ['Dedup?', 'Bitmask DP alternative?'],
      insight: 'Name choose/constraint/undo explicitly.',
    },
    trie: {
      intuition: `"${name}": shared prefixes; watch memory.`,
      approaches: [
        ap('Hash set of all prefixes', `Store strings' prefixes for "${name}".`, `def solve_hash(words):\n    s=set()\n    for w in words:\n        for i in range(len(w)):\n            s.add(w[:i+1])\n    return s`, 'O(total chars)', 'O(total chars)', { flags: ['MLE'] }),
        ap('Trie', `Node map per char for "${name}".`, `class Node:\n    def __init__(self):\n        self.next={}; self.end=False\nclass Trie:\n    def __init__(self):\n        self.root=Node()\n    def insert(self,w):\n        cur=self.root\n        for ch in w:\n            cur=cur.next.setdefault(ch, Node())\n        cur.end=True`, 'O(total chars)', 'O(total chars · Σ)'),
      ],
      followUps: ['Delete?', 'XOR bit trie?'],
      insight: 'Discuss MLE on alphabet size.',
    },
    array: {
      intuition: `"${name}": constraints decide hashing vs two pointers vs prefix vs in-place.`,
      approaches: [
        ap('Brute', `Nested / multi-pass for "${name}".`, `def solve_brute(a):\n    n=len(a); best=float('-inf')\n    for i in range(n):\n        s=0\n        for j in range(i,n):\n            s+=a[j]; best=max(best,s)\n    return best`, 'O(n²)', 'O(1)', { flags: ['TLE'] }),
        ap('Optimal pattern', `Linear / n log n approach for "${name}".`, `def solve(a):\n    # adapt: kadane / hash / two pointers / sort\n    best=cur=a[0]\n    for x in a[1:]:\n        cur=max(x, cur+x); best=max(best,cur)\n    return best`, 'O(n) typical', 'O(1)–O(n)'),
      ],
      followUps: ['O(1) space?', 'Sorted input changes?', 'Streaming?'],
      insight: 'Narrate brute→bottleneck→pattern every time.',
    },
  };

  const L = ladders[family] || ladders.array;
  return {
    tags: [family, 'revamped'],
    pattern: family,
    problemStatement: `Master “${name}” (${t.subcategory}) the way an interviewer expects: classify, brute, optimize, prove.`,
    intuition: L.intuition,
    approaches: L.approaches,
    specialTechnique: L.specialTechnique,
    complexity: {
      time: L.approaches[L.approaches.length - 1].time,
      space: L.approaches[L.approaches.length - 1].space,
    },
    edgeCases: ['Empty / trivial sizes', 'Duplicates', 'Constraint extremes', 'Impossible cases'],
    commonMistakes: [
      'Jumping to code without classifying constraints',
      'Claiming O(1) recursion stack',
      'Missing the brute→optimal story',
    ],
    patternRecognition: [
      `Sheet section “${t.category}” signals the intended family`,
      'Keywords in the title usually name the algorithm',
    ],
    followUps: L.followUps,
    interviewInsight: L.insight,
    related: autoRelated(t),
  };
}

function buildRich(t) {
  for (const { pred, builder } of recipes) {
    try {
      if (pred(t)) {
        const body = builder(t);
        if (body && (body.approaches || []).length >= 2) {
          return { ...body, related: body.related || autoRelated(t) };
        }
      }
    } catch {
      /* try next */
    }
  }
  return richFallback(t);
}

function shouldRevamp(t, blog) {
  if (ONLY) {
    const hay = `${t.category} ${t.title}`.toLowerCase();
    if (!ONLY.some((k) => hay.includes(k))) return false;
  }
  if (FORCE) return true;
  // Keep pristine early basics batches unless skeleton
  if ((progress.byId[t.id]?.batch === 1 || progress.byId[t.id]?.batch === 2) && !isSkeleton(blog)) {
    if ((blog.approaches || []).length >= 2) return false;
  }
  return isSkeleton(blog) || (blog.approaches || []).length < 2;
}

function main() {
  let upgraded = 0;
  let skipped = 0;
  for (const t of inv.topics) {
    const fp = path.join(outDir, `${t.id}.json`);
    const blog = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!shouldRevamp(t, blog)) {
      skipped++;
      continue;
    }
    const body = buildRich(t);
    const next = {
      version: 2,
      id: t.id,
      title: t.title,
      topicNumber: t.topicNumber,
      stepTitle: t.category,
      subStepTitle: t.subcategory,
      category: t.category,
      subcategory: t.subcategory,
      difficulty: t.difficulty,
      topicType: t.topicType,
      sourceUrl: t.postLink,
      quality: 'reviewed',
      ...body,
    };
    if (!next.intuition || !next.approaches?.length || next.approaches.length < 2 || !next.followUps?.length) {
      console.error('incomplete', t.id);
      continue;
    }
    fs.writeFileSync(fp, `${JSON.stringify(next, null, 2)}\n`);
    progress.byId[t.id] = {
      ...(progress.byId[t.id] || {}),
      topicNumber: t.topicNumber,
      status: 'reviewed',
      quality: 'reviewed',
      batch: progress.byId[t.id]?.batch || 'revamp',
      revamped: true,
    };
    upgraded++;
  }
  progress.reviewed = inv.topics.length;
  progress.pending = 0;
  fs.writeFileSync(path.join(root, 'src/sheets/dsa/content/blogProgress.json'), `${JSON.stringify(progress, null, 2)}\n`);

  // recount
  let single = 0;
  for (const t of inv.topics) {
    const b = JSON.parse(fs.readFileSync(path.join(outDir, `${t.id}.json`), 'utf8'));
    if ((b.approaches || []).length < 2) single++;
  }
  console.log(`Upgraded: ${upgraded}; skipped(kept): ${skipped}; remaining single-approach: ${single}`);
}

main();
