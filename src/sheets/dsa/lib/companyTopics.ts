/**
 * Company-wise topic assignment — one bucket per problem (no double count).
 *
 * Convention (A2Z-aligned):
 * 1. Technique / structure patterns win: DP, Graph, Tree, BST, Binary Search,
 *    Recursion, Backtracking, Greedy, Two Pointers, Sliding Window, …
 * 2. Containers (Array, String, Hash Table, Matrix, …) are the *default medium*
 *    for those techniques — they only form a section when no technique applies.
 */

export type TopicRule = { match: RegExp | string; bucket: string };

/** Ordered technique rules — first match in topic list wins by RULE order, not LC order. */
const TECHNIQUE_RULES: TopicRule[] = [
  // DP family
  { match: /^dynamic programming$/i, bucket: 'Dynamic Programming' },
  { match: /^memoization$/i, bucket: 'Dynamic Programming' },
  { match: /^dp on trees$/i, bucket: 'Dynamic Programming' },
  { match: /knapsack/i, bucket: 'Dynamic Programming' },
  { match: /^longest increasing subsequence$/i, bucket: 'Dynamic Programming' },
  { match: /^longest common subsequence$/i, bucket: 'Dynamic Programming' },
  { match: /^bitmask$/i, bucket: 'Dynamic Programming' },

  // Math-intensive (before containers; not bare "Math")
  { match: /^number theory$/i, bucket: 'Math' },
  { match: /^combinatorics$/i, bucket: 'Math' },
  { match: /^geometry$/i, bucket: 'Math' },
  { match: /greatest common divisor|^gcd$|least common multiple|^lcm$/i, bucket: 'Math' },
  { match: /euclidean algorithm|extended euclidean/i, bucket: 'Math' },
  { match: /primality test|prime factorization|prime number sieve|sieve theory/i, bucket: 'Math' },
  { match: /fermat'?s|euler'?s (totient|theorem)|bézout|chinese remainder/i, bucket: 'Math' },
  { match: /^polygons$|convex hull|triangulation|linear algebra/i, bucket: 'Math' },
  { match: /modular arithmetic|pigeonhole principle/i, bucket: 'Math' },

  // Trees / BST (before Graph DFS so tree+DFS → Tree)
  { match: /^binary search tree$/i, bucket: 'Binary Search Tree' },
  { match: /^tree$/i, bucket: 'Tree' },
  { match: /^binary tree$/i, bucket: 'Tree' },
  { match: /^lowest common ancestor$/i, bucket: 'Tree' },
  { match: /^binary lifting$/i, bucket: 'Tree' },
  { match: /cartesian tree|treap|k-d tree|suffix (tree|array|automaton)/i, bucket: 'Tree' },
  { match: /^trie$/i, bucket: 'Trie' },
  { match: /^segment tree$/i, bucket: 'Segment Tree' },
  { match: /^binary indexed tree$/i, bucket: 'Segment Tree' },

  // Graphs
  { match: /^graph theory$/i, bucket: 'Graph' },
  { match: /^graph$/i, bucket: 'Graph' },
  { match: /^depth-first search$/i, bucket: 'Graph' },
  { match: /^breadth-first search$/i, bucket: 'Graph' },
  { match: /^topological sort$/i, bucket: 'Graph' },
  { match: /^union-find$/i, bucket: 'Graph' },
  { match: /^shortest path$/i, bucket: 'Graph' },
  { match: /dijkstra/i, bucket: 'Graph' },
  { match: /bellman/i, bucket: 'Graph' },
  { match: /floyd–warshall|floyd-warshall/i, bucket: 'Graph' },
  { match: /prim'?s|kruskal|bor[uů]vka|spanning tree/i, bucket: 'Graph' },
  { match: /kosaraju|tarjan|strongly connected|biconnected|bridge \(graph\)/i, bucket: 'Graph' },
  { match: /^bipartite graph$/i, bucket: 'Graph' },
  { match: /^graph coloring$/i, bucket: 'Graph' },
  { match: /^directed acyclic graph$/i, bucket: 'Graph' },
  {
    match: /0-1 bfs|bidirectional search|a\* search|eulerian|hamiltonian|flow network|matching \(graph\)/i,
    bucket: 'Graph',
  },

  // Search / pointers / classic patterns
  { match: /^binary search$/i, bucket: 'Binary Search' },
  { match: /^ternary search$/i, bucket: 'Binary Search' },
  { match: /^backtracking$/i, bucket: 'Backtracking' },
  { match: /^greedy$/i, bucket: 'Greedy' },
  { match: /^two pointers$/i, bucket: 'Two Pointers' },
  { match: /^sliding window$/i, bucket: 'Sliding Window' },
  { match: /^divide and conquer$/i, bucket: 'Divide and Conquer' },
  { match: /^recursion$/i, bucket: 'Recursion' },

  // Linear structures & bits
  { match: /^linked list$/i, bucket: 'Linked List' },
  { match: /^doubly-linked list$/i, bucket: 'Linked List' },
  { match: /floyd'?s cycle/i, bucket: 'Linked List' },
  { match: /^heap \(priority queue\)$/i, bucket: 'Heap' },
  { match: /^stack$/i, bucket: 'Stack' },
  { match: /^monotonic stack$/i, bucket: 'Stack' },
  { match: /^queue$/i, bucket: 'Queue' },
  { match: /^monotonic queue$/i, bucket: 'Queue' },
  { match: /^bit manipulation$/i, bucket: 'Bit Manipulation' },

  // Design-ish
  { match: /^design$/i, bucket: 'Design' },
  { match: /^data stream$/i, bucket: 'Design' },
  { match: /^database$/i, bucket: 'Database' },
  { match: /^game theory$/i, bucket: 'Game Theory' },
  { match: /^ordered set$/i, bucket: 'Ordered Set' },
  { match: /^string matching$/i, bucket: 'String' },
  { match: /kmp|z algorithm|rolling hash|aho–corasick|manacher|boyer–moore string/i, bucket: 'String' },
];

/**
 * Containers / media — only used when no technique matched.
 * Order among containers: more specific residual first.
 */
const CONTAINER_RULES: TopicRule[] = [
  { match: /^prefix sum$/i, bucket: 'Prefix Sum' },
  { match: /^matrix$/i, bucket: 'Matrix' },
  { match: /^sorting$/i, bucket: 'Sorting' },
  { match: /merge sort|quicksort|counting sort|bucket sort|radix sort|bubble sort|timsort/i, bucket: 'Sorting' },
  { match: /^simulation$/i, bucket: 'Simulation' },
  { match: /^counting$/i, bucket: 'Hash Table' },
  { match: /^hash table$/i, bucket: 'Hash Table' },
  { match: /^hash function$/i, bucket: 'Hash Table' },
  { match: /^string$/i, bucket: 'String' },
  { match: /^array$/i, bucket: 'Array' },
  { match: /^enumeration$/i, bucket: 'Array' },
  // Bare math is residual (weak) — intensive math already in TECHNIQUE_RULES
  { match: /^math$/i, bucket: 'Math' },
  { match: /^brainteaser$/i, bucket: 'Math' },
];

/** Buckets that are techniques — containers are hidden from "Also tagged". */
export const TECHNIQUE_BUCKETS = new Set([
  'Dynamic Programming',
  'Math',
  'Binary Search Tree',
  'Tree',
  'Trie',
  'Segment Tree',
  'Graph',
  'Binary Search',
  'Backtracking',
  'Greedy',
  'Two Pointers',
  'Sliding Window',
  'Divide and Conquer',
  'Recursion',
  'Linked List',
  'Heap',
  'Stack',
  'Queue',
  'Bit Manipulation',
  'Design',
  'Database',
  'Game Theory',
  'Ordered Set',
]);

/** Container buckets — Array etc. only after techniques are ruled out. */
export const CONTAINER_BUCKETS = new Set([
  'Prefix Sum',
  'Matrix',
  'Sorting',
  'Simulation',
  'Hash Table',
  'String',
  'Array',
]);

function tagMatches(rule: TopicRule, tag: string): boolean {
  const t = tag.trim();
  if (!t) return false;
  return typeof rule.match === 'string'
    ? t.toLowerCase() === rule.match.toLowerCase()
    : rule.match.test(t);
}

function firstBucket(topics: string[], rules: TopicRule[]): string | null {
  // Scan rules in priority order; if any topic matches a rule, take that bucket.
  for (const rule of rules) {
    if (topics.some((t) => tagMatches(rule, t))) return rule.bucket;
  }
  return null;
}

/**
 * Exactly one bucket per problem.
 * Technique first → else container → else Untagged.
 */
export function pickCanonicalTopic(topics: string[] | undefined): string {
  if (!topics?.length) return 'Untagged';
  return (
    firstBucket(topics, TECHNIQUE_RULES) ||
    firstBucket(topics, CONTAINER_RULES) ||
    'Untagged'
  );
}

/**
 * Secondary tags for display — omit default containers when the primary
 * is a technique (Array on DP/Graph/BS/Tree/… is implied, not double-counted).
 */
export function secondaryTopics(topics: string[] | undefined, canonical: string): string[] {
  if (!topics?.length) return [];
  const hideContainers = TECHNIQUE_BUCKETS.has(canonical) || CONTAINER_BUCKETS.has(canonical);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of topics) {
    const t = raw.trim();
    if (!t) continue;
    const bucket = pickCanonicalTopic([t]);
    if (bucket === canonical) continue;
    if (hideContainers && CONTAINER_BUCKETS.has(bucket)) continue;
    // Also hide raw container tag names when technique-owned
    if (
      hideContainers &&
      /^(array|string|hash table|matrix|prefix sum|sorting|simulation|enumeration|counting|math)$/i.test(
        t,
      )
    ) {
      continue;
    }
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export const GENERIC_TOPIC_BUCKETS = CONTAINER_BUCKETS;

/**
 * Display order for company topic sections — mirrors A2Z roadmap steps.
 */
export const A2Z_TOPIC_ORDER: string[] = [
  'Math',
  'Simulation',
  'Hash Table',
  'Sorting',
  'Array',
  'Prefix Sum',
  'Matrix',
  'Binary Search',
  'String',
  'Linked List',
  'Recursion',
  'Backtracking',
  'Divide and Conquer',
  'Bit Manipulation',
  'Stack',
  'Queue',
  'Two Pointers',
  'Sliding Window',
  'Heap',
  'Greedy',
  'Tree',
  'Segment Tree',
  'Binary Search Tree',
  'Graph',
  'Dynamic Programming',
  'Trie',
  'Design',
  'Database',
  'Ordered Set',
  'Game Theory',
  'Untagged',
];

const A2Z_TOPIC_INDEX = new Map(A2Z_TOPIC_ORDER.map((t, i) => [t, i]));

export function a2zTopicSortKey(topic: string): number {
  const i = A2Z_TOPIC_INDEX.get(topic);
  if (i != null) return i;
  return A2Z_TOPIC_ORDER.length + topic.charCodeAt(0) / 1000;
}

export function compareTopicsA2zOrder(a: string, b: string): number {
  const ka = a2zTopicSortKey(a);
  const kb = a2zTopicSortKey(b);
  if (ka !== kb) return ka - kb;
  return a.localeCompare(b);
}
