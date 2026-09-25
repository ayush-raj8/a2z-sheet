/**
 * Canonical topic for company-wise grouping.
 * Prefer specific patterns (DP, Graph, Tree, …) over generic containers (Array, String, …).
 * Each problem is assigned to exactly one bucket.
 */

/** Lower number = higher priority when multiple tags are present. */
const TOPIC_PRIORITY: Array<{ match: RegExp | string; bucket: string; rank: number }> = [
  // —— Dynamic Programming family ——
  { match: /^dynamic programming$/i, bucket: 'Dynamic Programming', rank: 10 },
  { match: /^memoization$/i, bucket: 'Dynamic Programming', rank: 11 },
  { match: /^dp on trees$/i, bucket: 'Dynamic Programming', rank: 11 },
  { match: /knapsack/i, bucket: 'Dynamic Programming', rank: 12 },
  { match: /^longest increasing subsequence$/i, bucket: 'Dynamic Programming', rank: 12 },
  { match: /^longest common subsequence$/i, bucket: 'Dynamic Programming', rank: 12 },
  { match: /^bitmask$/i, bucket: 'Dynamic Programming', rank: 40 },

  // —— Trees (before DFS/BFS so tree+DFS stays under Tree) ——
  { match: /^binary search tree$/i, bucket: 'Binary Search Tree', rank: 18 },
  { match: /^tree$/i, bucket: 'Tree', rank: 19 },
  { match: /^binary tree$/i, bucket: 'Tree', rank: 19 },
  { match: /^trie$/i, bucket: 'Trie', rank: 27 },
  { match: /^segment tree$/i, bucket: 'Segment Tree', rank: 27 },
  { match: /^binary indexed tree$/i, bucket: 'Segment Tree', rank: 28 },
  { match: /^lowest common ancestor$/i, bucket: 'Tree', rank: 19 },
  { match: /^binary lifting$/i, bucket: 'Tree', rank: 19 },
  { match: /cartesian tree|treap|k-d tree|suffix (tree|array|automaton)/i, bucket: 'Tree', rank: 29 },

  // —— Graphs ——
  { match: /^graph theory$/i, bucket: 'Graph', rank: 20 },
  { match: /^graph$/i, bucket: 'Graph', rank: 20 },
  { match: /^depth-first search$/i, bucket: 'Graph', rank: 21 },
  { match: /^breadth-first search$/i, bucket: 'Graph', rank: 21 },
  { match: /^topological sort$/i, bucket: 'Graph', rank: 22 },
  { match: /^union-find$/i, bucket: 'Graph', rank: 22 },
  { match: /^shortest path$/i, bucket: 'Graph', rank: 22 },
  { match: /dijkstra/i, bucket: 'Graph', rank: 23 },
  { match: /bellman/i, bucket: 'Graph', rank: 23 },
  { match: /floyd–warshall|floyd-warshall/i, bucket: 'Graph', rank: 23 },
  { match: /prim'?s|kruskal|bor[uů]vka|spanning tree/i, bucket: 'Graph', rank: 23 },
  { match: /kosaraju|tarjan|strongly connected|biconnected|bridge \(graph\)/i, bucket: 'Graph', rank: 23 },
  { match: /^bipartite graph$/i, bucket: 'Graph', rank: 23 },
  { match: /^graph coloring$/i, bucket: 'Graph', rank: 23 },
  { match: /^directed acyclic graph$/i, bucket: 'Graph', rank: 23 },
  { match: /0-1 bfs|bidirectional search|a\* search|eulerian|hamiltonian|flow network|matching \(graph\)/i, bucket: 'Graph', rank: 24 },

  // —— Classic patterns (own A2Z sections) ——
  { match: /^backtracking$/i, bucket: 'Backtracking', rank: 30 },
  { match: /^greedy$/i, bucket: 'Greedy', rank: 31 },
  { match: /^binary search$/i, bucket: 'Binary Search', rank: 32 },
  { match: /^ternary search$/i, bucket: 'Binary Search', rank: 33 },
  { match: /^two pointers$/i, bucket: 'Two Pointers', rank: 34 },
  { match: /^sliding window$/i, bucket: 'Sliding Window', rank: 35 },
  { match: /^divide and conquer$/i, bucket: 'Divide and Conquer', rank: 36 },
  { match: /^recursion$/i, bucket: 'Recursion', rank: 50 },

  // —— Linear / other structures ——
  { match: /^linked list$/i, bucket: 'Linked List', rank: 45 },
  { match: /^doubly-linked list$/i, bucket: 'Linked List', rank: 45 },
  { match: /floyd'?s cycle/i, bucket: 'Linked List', rank: 45 },
  { match: /^heap \(priority queue\)$/i, bucket: 'Heap', rank: 46 },
  { match: /^stack$/i, bucket: 'Stack', rank: 47 },
  { match: /^monotonic stack$/i, bucket: 'Stack', rank: 47 },
  { match: /^queue$/i, bucket: 'Queue', rank: 48 },
  { match: /^monotonic queue$/i, bucket: 'Queue', rank: 48 },
  { match: /^bit manipulation$/i, bucket: 'Bit Manipulation', rank: 49 },
  { match: /^prefix sum$/i, bucket: 'Prefix Sum', rank: 55 },
  { match: /^matrix$/i, bucket: 'Matrix', rank: 56 },
  { match: /^design$/i, bucket: 'Design', rank: 57 },
  { match: /^database$/i, bucket: 'Database', rank: 58 },
  { match: /^string matching$/i, bucket: 'String', rank: 59 },
  { match: /kmp|z algorithm|rolling hash|aho–corasick|manacher|boyer–moore string/i, bucket: 'String', rank: 59 },

  // —— Generics last (only if nothing more specific) ——
  { match: /^sorting$/i, bucket: 'Sorting', rank: 80 },
  { match: /merge sort|quicksort|counting sort|bucket sort|radix sort|bubble sort|timsort/i, bucket: 'Sorting', rank: 80 },
  { match: /^math$/i, bucket: 'Math', rank: 85 },
  { match: /^number theory$/i, bucket: 'Math', rank: 85 },
  { match: /^combinatorics$/i, bucket: 'Math', rank: 85 },
  { match: /^geometry$/i, bucket: 'Math', rank: 85 },
  { match: /^counting$/i, bucket: 'Math', rank: 86 },
  { match: /^simulation$/i, bucket: 'Simulation', rank: 87 },
  { match: /^hash table$/i, bucket: 'Hash Table', rank: 90 },
  { match: /^hash function$/i, bucket: 'Hash Table', rank: 90 },
  { match: /^string$/i, bucket: 'String', rank: 91 },
  { match: /^array$/i, bucket: 'Array', rank: 95 },
  { match: /^enumeration$/i, bucket: 'Array', rank: 96 },
  { match: /^ordered set$/i, bucket: 'Ordered Set', rank: 70 },
  { match: /^game theory$/i, bucket: 'Game Theory', rank: 60 },
  { match: /^data stream$/i, bucket: 'Design', rank: 57 },
];

function resolveTag(tag: string): { bucket: string; rank: number } | null {
  const t = tag.trim();
  if (!t) return null;
  for (const rule of TOPIC_PRIORITY) {
    const ok =
      typeof rule.match === 'string'
        ? t.toLowerCase() === rule.match.toLowerCase()
        : rule.match.test(t);
    if (ok) return { bucket: rule.bucket, rank: rule.rank };
  }
  return { bucket: t, rank: 100 };
}

/**
 * Pick the single display bucket for a problem from its LC topic list.
 * Specific patterns beat Array/String/Hash Table.
 */
export function pickCanonicalTopic(topics: string[] | undefined): string {
  if (!topics?.length) return 'Untagged';
  let best: { bucket: string; rank: number } | null = null;
  for (const tag of topics) {
    const hit = resolveTag(tag);
    if (!hit) continue;
    if (!best || hit.rank < best.rank) best = hit;
  }
  return best?.bucket || 'Untagged';
}

/** Topics that are "generic containers" — documented for UI hints. */
export const GENERIC_TOPIC_BUCKETS = new Set([
  'Array',
  'String',
  'Hash Table',
  'Math',
  'Sorting',
  'Simulation',
  'Counting',
]);

/**
 * Display order for company topic sections — mirrors A2Z roadmap steps.
 * Unknown buckets sort after these, alphabetically.
 */
export const A2Z_TOPIC_ORDER: string[] = [
  // 1 Learn the basics
  'Math',
  'Simulation',
  'Hash Table',
  // 2 Sorting
  'Sorting',
  // 3 Arrays
  'Array',
  'Prefix Sum',
  'Matrix',
  // 4 Binary Search
  'Binary Search',
  // 5 / 18 Strings
  'String',
  // 6 Linked List
  'Linked List',
  // 7 Recursion / Backtracking
  'Recursion',
  'Backtracking',
  'Divide and Conquer',
  // 8 Bit Manipulation
  'Bit Manipulation',
  // 9 Stack and Queues
  'Stack',
  'Queue',
  // 10 Sliding Window & Two Pointer
  'Two Pointers',
  'Sliding Window',
  // 11 Heaps
  'Heap',
  // 12 Greedy
  'Greedy',
  // 13 Binary Trees
  'Tree',
  'Segment Tree',
  // 14 BST
  'Binary Search Tree',
  // 15 Graphs
  'Graph',
  // 16 DP
  'Dynamic Programming',
  // 17 Tries
  'Trie',
  // extras that still appear
  'Design',
  'Database',
  'Ordered Set',
  'Game Theory',
  'Untagged',
];

const A2Z_TOPIC_INDEX = new Map(A2Z_TOPIC_ORDER.map((t, i) => [t, i]));

/** Sort key: A2Z roadmap order, then alphabetical for anything else. */
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
