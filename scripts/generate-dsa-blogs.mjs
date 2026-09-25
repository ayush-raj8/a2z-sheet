#!/usr/bin/env node
/**
 * Generates first-party DSA blog JSON for every topic in a2z.json.
 * Content is derived from question_title + post_link slug + step context.
 * Run: node scripts/generate-dsa-blogs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const roadmap = JSON.parse(fs.readFileSync(path.join(root, 'a2z.json'), 'utf8'));
const outDir = path.join(root, 'src/sheets/dsa/content/blogs');

function slugFromUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.replace(/\/+$/, '').split('/').filter(Boolean).join('/'));
  } catch {
    return String(url);
  }
}

function collectTopics() {
  const topics = [];
  for (const step of roadmap) {
    for (const sub of step.sub_steps || []) {
      for (const topic of sub.topics || []) {
        topics.push({
          id: topic.id,
          title: topic.question_title,
          stepTitle: step.step_title,
          subStepTitle: sub.sub_step_title,
          post: topic.post_link || null,
          slug: slugFromUrl(topic.post_link),
          difficulty: topic.difficulty ?? 0,
        });
      }
    }
  }
  return topics;
}

function detectFamily(t) {
  const hay = `${t.title} ${t.slug} ${t.stepTitle} ${t.subStepTitle}`.toLowerCase();
  const hit = (...keys) => keys.some((k) => hay.includes(k));

  if (hit('input / output', 'input-output', 'basic-input')) return 'io';
  if (hit('data type')) return 'datatypes';
  if (hit('if else', 'if-else')) return 'ifelse';
  if (hit('switch')) return 'switch';
  if (hit('for loop', 'for-loop')) return 'forloop';
  if (hit('while loop', 'while-loop')) return 'whileloop';
  if (hit('function', 'pass by')) return 'functions';
  if (hit('time complexity', 'space complexity')) return 'complexity';
  if (hit('pattern') && hit('learn the basics', 'must-do-pattern', 'pattern')) return 'patterns';
  if (hit('c++ stl', 'stl')) return 'stl';
  if (hit('java collection')) return 'collections';
  if (hit('count digit')) return 'count-digits';
  if (hit('reverse') && hit('number', 'digit')) return 'reverse-number';
  if (hit('palindrome') && !hit('string', 'll', 'linked')) return 'palindrome-number';
  if (hit('gcd', 'hcf')) return 'gcd';
  if (hit('armstrong')) return 'armstrong';
  if (hit('divisor')) return 'divisors';
  if (hit('prime')) return 'prime';
  if (hit('hashing', 'hash map', 'hashmap', 'frequency')) return 'hashing';
  if (hit('recursion') || t.stepTitle.toLowerCase().includes('recursion')) return 'recursion';
  if (hit('sorting', 'bubble', 'selection', 'insertion', 'merge sort', 'quick sort')) return 'sorting';
  if (hit('binary search') || t.stepTitle.toLowerCase().includes('binary search')) return 'binary-search';
  if (hit('linkedlist', 'linked list', 'll ')) return 'linked-list';
  if (hit('stack') || hit('queue') || t.stepTitle.toLowerCase().includes('stack')) return 'stack-queue';
  if (hit('sliding window', 'two pointer', 'two-pointer')) return 'two-pointer';
  if (hit('heap', 'priority queue')) return 'heap';
  if (hit('greedy')) return 'greedy';
  if (hit('binary tree') || hit('bst') || t.stepTitle.toLowerCase().includes('binary tree') || t.stepTitle.toLowerCase().includes('binary search tree'))
    return 'tree';
  if (hit('graph') || t.stepTitle.toLowerCase().includes('graph')) return 'graph';
  if (hit('dynamic programming', ' dp') || t.stepTitle.toLowerCase().includes('dynamic programming')) return 'dp';
  if (hit('trie')) return 'trie';
  if (hit('string') || t.stepTitle.toLowerCase() === 'strings' || t.stepTitle.toLowerCase().includes('strings'))
    return 'string';
  if (hit('bit ', 'bitmask', 'bitwise', 'bit manipulation')) return 'bit';
  if (hit('array') || t.stepTitle.toLowerCase().includes('arrays')) return 'array';
  return 'general';
}

function urlHint(slug) {
  if (!slug) return '';
  const last = slug.split('/').pop() || slug;
  return last.replace(/[-_]/g, ' ');
}

function prose(t, family) {
  const hint = urlHint(t.slug);
  const topicLine = hint && hint.toLowerCase() !== t.title.toLowerCase()
    ? ` Classic framing from the roadmap note “${hint}”.`
    : '';

  const intros = {
    io: `Reading input and writing output cleanly is the first skill that separates “I know syntax” from “I can ship solutions.” In ${t.title}, treat stdin/stdout as a contract: know the types, the separators, and when to flush.${topicLine}`,
    datatypes: `Every DSA bug that “looks algorithmic” is often a type-width mistake. Learn ranges, signedness, and when to promote to 64-bit before you chase weird WA.${topicLine}`,
    ifelse: `Branching is decision-making. Write conditions that mirror the problem statement, keep them mutually exclusive when needed, and avoid deep nesting you cannot test.${topicLine}`,
    switch: `Switch/case shines for discrete labels. Know fall-through rules in C++/Java/Go versus Python’s if-elif style, and always cover the default path.${topicLine}`,
    forloop: `For-loops encode counted repetition. Be precise about inclusive/exclusive bounds — off-by-one is the #1 beginner failure mode.${topicLine}`,
    whileloop: `While-loops encode “repeat until a condition.” Always prove the condition eventually becomes false, or you own an infinite loop.${topicLine}`,
    functions: `Functions carve a problem into named units. Pass-by-value vs reference decides whether the callee can mutate the caller’s data — interviewers love this distinction.${topicLine}`,
    complexity: `Time/space complexity is how you predict scale. Count dominant operations, drop constants, and state assumptions (sorted? hash O(1)?).${topicLine}`,
    patterns: `Pattern problems train nested loops and index arithmetic with instant visual feedback. Master row/col relationships before harder grids.${topicLine}`,
    stl: `C++ STL is leverage: vector, set, map, unordered_map, priority_queue, algorithms. Prefer clear containers over hand-rolled structures unless the problem needs it.${topicLine}`,
    collections: `Java Collections give you List, Set, Map, Deque, PriorityQueue. Know average vs worst-case costs and when LinkedHashMap/TreeMap matter.${topicLine}`,
    'count-digits': `Counting digits is O(log₁₀ n) work. Prefer math over string conversion in interviews unless leading zeros appear.${topicLine}`,
    'reverse-number': `Reversing digits is modular arithmetic practice. Watch overflow when building the reversed value on 32-bit ints.${topicLine}`,
    'palindrome-number': `A number is a palindrome when it equals its reverse (careful with negatives and trailing zeros).${topicLine}`,
    gcd: `GCD via Euclidean algorithm is foundational number theory for contests — also the basis of LCM.${topicLine}`,
    armstrong: `Armstrong checks compare a number to the sum of its digits each raised to the digit-count power.${topicLine}`,
    divisors: `Listing divisors naïvely is O(n); pairing factors up to √n is the interview expectation.${topicLine}`,
    prime: `Primality: trial division to √n is the baseline; sieve appears when you need many queries.${topicLine}`,
    hashing: `Hashing trades memory for average O(1) lookups. State collision assumptions; prefer frequency maps for counting problems.${topicLine}`,
    recursion: `Recursion is induction in code: base case + smaller self-call. Always argue why the call stack shrinks.${topicLine}`,
    sorting: `Sorting is a primitive used inside harder solutions. Know stable vs unstable and the N log N comparison bound.${topicLine}`,
    'binary-search': `Binary search is monotonic-predicate search, not “only on arrays.” Define the predicate, then shrink the range.${topicLine}`,
    'linked-list': `Linked lists trade random access for O(1) splicing. Draw pointers; most bugs are lost references or missed edge nodes.${topicLine}`,
    'stack-queue': `Stack = LIFO, Queue = FIFO. Use them when the next useful element is the most recent or the earliest pending.${topicLine}`,
    'two-pointer': `Two pointers / sliding window turn nested O(n²) scans into O(n) when the window/predicate is monotonic.${topicLine}`,
    heap: `Heaps give O(log n) push/pop of extremes. Reach for them for “top-k” and running medians.${topicLine}`,
    greedy: `Greedy works when a local choice stays safe globally — prove exchange argument or use a known theorem.${topicLine}`,
    tree: `Trees are recursive structures. Prefer clear traversals (pre/in/post/level) and define null-base cases first.${topicLine}`,
    graph: `Graphs = adjacency + traversal. BFS for shortest unweighted paths; DFS for components/cycles; add weights carefully.${topicLine}`,
    dp: `DP = overlapping subproblems + optimal substructure. Name the state, transitions, and base cases before coding.${topicLine}`,
    trie: `Tries index strings by shared prefixes — ideal for autocomplete and XOR bit tries.${topicLine}`,
    string: `Strings are arrays of characters with encoding traps. Prefer two pointers / hashing / KMP-style ideas over blind nested loops.${topicLine}`,
    bit: `Bit tricks encode sets and parity compactly. Know shifts, masks, and that Java/Go ints are fixed width.${topicLine}`,
    array: `Arrays are the default canvas for DSA. Clarify in-place vs extra space, and whether order must be preserved.${topicLine}`,
    general: `"${t.title}" sits under ${t.stepTitle}. Read the statement twice, invent 2–3 examples (including edges), then pick the simplest correct idea before optimizing.${topicLine}`,
  };

  const intuitions = {
    io: 'Think of the judge as a pipe: your program consumes tokens and emits a deterministic answer. Match the sample format exactly.',
    datatypes: 'Pick the smallest type that cannot overflow the constraints. When in doubt on sums/products, use 64-bit.',
    ifelse: 'Translate English rules into boolean expressions. Test boundaries (equal, just below, just above).',
    switch: 'Map each discrete case to a branch; default handles “anything else.”',
    forloop: 'Index meaning first (0-based vs 1-based), then write the loop header to match.',
    whileloop: 'Identify the progress measure — something must move toward termination each iteration.',
    functions: 'Name inputs/outputs. If the callee must edit caller memory, pass a reference/pointer (or return a new value).',
    complexity: 'Ask: if n doubles, does work double, square, or jump exponentially?',
    patterns: 'Row r often prints something that depends on r and the column c — write that formula before coding.',
    stl: 'Choose the container by access pattern: vector for sequences, unordered_map for average lookups, set for ordered uniques.',
    collections: 'Same idea as STL: pick List vs Set vs Map from the operation mix.',
    'count-digits': 'Repeatedly divide by 10 (or use logs carefully for positives).',
    'reverse-number': 'Pop digits with %10 and push into ans = ans*10 + digit.',
    'palindrome-number': 'Compare to reverse, or compare left/right digit halves.',
    gcd: 'gcd(a,b)=gcd(b,a%b) until b=0.',
    armstrong: 'Extract digits, power-sum, compare to original.',
    divisors: 'For i in 1..√n, if n%i==0 take i and n/i.',
    prime: 'No divisor in 2..√n (handle n<2).',
    hashing: 'Key → frequency/index; collisions are rare with good hash tables.',
    recursion: 'Solve f(n) using f(smaller); write the base case that stops the chain.',
    sorting: 'Unordered → ordered so later scans/binary search become possible.',
    'binary-search': 'Keep an invariant: answer lies in [lo, hi] while the mid predicate guides the cut.',
    'linked-list': 'Never lose the next pointer before rewiring.',
    'stack-queue': 'Push when you defer work; pop when the deferred item becomes due.',
    'two-pointer': 'Move the pointer that improves the invariant (sum too big → shrink, etc.).',
    heap: 'Parent is always extreme of its subtree — extract-min/max in log time.',
    greedy: 'Sort or pick extreme candidate; verify no better swap exists.',
    tree: 'Left/right subtrees are the same problem smaller — recurse with clear return meaning.',
    graph: 'Visit each node/edge a bounded number of times with a visited set.',
    dp: 'Reusable answers to sub-states; fill by increasing dependency order.',
    trie: 'Each edge is a character (or bit); end marker denotes a complete key.',
    string: 'Immutable scans with indices beat repeated concatenation.',
    bit: 'The i-th bit is a boolean flag; masks combine flags.',
    array: 'Index math + one pass often beats nested brute force after sorting or hashing.',
    general: 'Examples reveal structure: sortedness, duplicates, graph-ness, or optimal substructure.',
  };

  const approaches = {
    io: [
      'Identify how many values and their types from the statement.',
      'Read with the idiomatic API (cin/scanf, Scanner, input(), fmt.Scan).',
      'Write output exactly as samples (spaces/newlines).',
    ],
    datatypes: [
      'List constraint ranges from the problem.',
      'Choose types that fit peaks (sums, products).',
      'Print with the same type you computed.',
    ],
    ifelse: [
      'Write the decision table on paper.',
      'Implement branches from most specific to general.',
      'Add else for the residual case.',
    ],
    switch: [
      'Enumerate discrete labels.',
      'Implement each case; set default.',
      'Avoid unintentional fall-through unless intentional.',
    ],
    forloop: [
      'Decide start, end, and step.',
      'Keep loop body O(1) work unless nested on purpose.',
      'Verify with n=0/1 edge cases.',
    ],
    whileloop: [
      'Initialize state before the loop.',
      'Update state every iteration.',
      'Assert termination.',
    ],
    functions: [
      'Extract a pure helper for the core calculation.',
      'Decide value vs reference parameters.',
      'Return results instead of printing inside helpers when possible.',
    ],
    complexity: [
      'Count loops and recursion branching.',
      'Express in n, m, k from constraints.',
      'Cross-check against time limits (~1e8 ops/sec rule of thumb).',
    ],
    patterns: [
      'Outer loop = rows.',
      'Inner loop = columns / stars / numbers for that row.',
      'Print newline after each row.',
    ],
    stl: [
      'Pick container from operations.',
      'Use algorithms (sort, lower_bound) instead of hand loops when clear.',
      'Mind iterator invalidation rules.',
    ],
    collections: [
      'Pick Collection type from ops.',
      'Use generics with proper types.',
      'Prefer ArrayDeque over legacy Stack.',
    ],
    'count-digits': ['Handle n=0 as 1 digit.', 'Loop divide-by-10.', 'Alternatively convert to string length for non-negatives.'],
    'reverse-number': ['Sign handling if required.', 'Build reverse digit-by-digit.', 'Check 32-bit overflow if constrained.'],
    'palindrome-number': ['Reject negatives if stated.', 'Reverse or two-pointer on digits.', 'Compare.'],
    gcd: ['Apply Euclidean algorithm.', 'LCM = a/gcd*b carefully.', 'Watch zero inputs.'],
    armstrong: ['Count digits.', 'Sum powered digits.', 'Compare to n.'],
    divisors: ['Iterate to √n.', 'Collect pairs.', 'Sort if output requires order.'],
    prime: ['Exclude n<2.', 'Trial divide to √n.', 'Optional sieve for many queries.'],
    hashing: ['Build frequency/index map.', 'Query in average O(1).', 'Fall back to sorted+two pointers if hash worst-case matters.'],
    recursion: ['Define f(args) meaning.', 'Write base case.', 'Call on strictly smaller instance; combine results.'],
    sorting: ['Choose algorithm by constraints.', 'Implement or call library sort.', 'Use sorted order in the next step of the solution.'],
    'binary-search': ['Identify monotonic predicate.', 'Set lo/hi bounds.', 'Update mid until lo/hi converge; return answer index/value.'],
    'linked-list': ['Draw before/after pointer states.', 'Iterate with careful next hold.', 'Handle empty/single-node edges.'],
    'stack-queue': ['Map problem events to push/pop.', 'Maintain invariants on the structure.', 'Drain remaining items if needed.'],
    'two-pointer': ['Sort if the pattern requires.', 'Move left/right based on condition.', 'Record answers when window is valid.'],
    heap: ['Push candidates.', 'Pop extremes.', 'Keep heap size within k if top-k.'],
    greedy: ['Sort by key.', 'Take next safe candidate.', 'Prove no better alternative exists.'],
    tree: ['Choose traversal.', 'Recurse on children.', 'Combine child answers into parent answer.'],
    graph: ['Build adjacency list.', 'BFS/DFS/Topo/Dijkstra as needed.', 'Track visited/distance.'],
    dp: ['Define dp state.', 'Write transitions + bases.', 'Iterate in valid order or memoize recursion.'],
    trie: ['Insert character-by-character.', 'Mark ends.', 'Query by walking prefixes.'],
    string: ['Clarify case/space rules.', 'Use two pointers or frequency maps.', 'Avoid quadratic concatenations.'],
    bit: ['Map flags to bits.', 'Use | & ^ ~ << >> carefully.', 'Watch sign bit / unsigned.'],
    array: ['Clarify mutation rules.', 'Use hashing/sorting/two pointers as fits.', 'Verify with duplicates and empty arrays.'],
    general: [
      `Restate “${t.title}” in one sentence.`,
      'Solve a brute-force version to lock correctness.',
      'Optimize using the structure of the step: ' + t.stepTitle + '.',
    ],
  };

  const complexity = {
    io: { time: 'O(1) per value read/written', space: 'O(1)' },
    datatypes: { time: 'O(1)', space: 'O(1)' },
    ifelse: { time: 'O(1)', space: 'O(1)' },
    switch: { time: 'O(1)', space: 'O(1)' },
    forloop: { time: 'O(n) for n iterations', space: 'O(1)' },
    whileloop: { time: 'O(n) for n iterations', space: 'O(1)' },
    functions: { time: 'Depends on callee work', space: 'O(1) extra for the call' },
    complexity: { time: 'Analysis skill — not a runtime', space: '—' },
    patterns: { time: 'O(rows × cols printed)', space: 'O(1)' },
    stl: { time: 'Container-specific', space: 'Container-specific' },
    collections: { time: 'Collection-specific', space: 'Collection-specific' },
    'count-digits': { time: 'O(log n)', space: 'O(1)' },
    'reverse-number': { time: 'O(log n)', space: 'O(1)' },
    'palindrome-number': { time: 'O(log n)', space: 'O(1)' },
    gcd: { time: 'O(log min(a,b))', space: 'O(1)' },
    armstrong: { time: 'O(log n)', space: 'O(1)' },
    divisors: { time: 'O(√n)', space: 'O(number of divisors)' },
    prime: { time: 'O(√n) trial / O(n log log n) sieve build', space: 'O(1) / O(n)' },
    hashing: { time: 'Average O(n)', space: 'O(n)' },
    recursion: { time: 'Problem-specific', space: 'O(depth) stack' },
    sorting: { time: 'O(n log n) typical', space: 'O(1)–O(n)' },
    'binary-search': { time: 'O(log n) per search', space: 'O(1)' },
    'linked-list': { time: 'O(n) typical traversal', space: 'O(1) extra if in-place' },
    'stack-queue': { time: 'O(n)', space: 'O(n)' },
    'two-pointer': { time: 'O(n) or O(n log n) if sort first', space: 'O(1)–O(n)' },
    heap: { time: 'O(n log n) or O(n log k)', space: 'O(n) or O(k)' },
    greedy: { time: 'Usually O(n log n) from sort', space: 'O(1)–O(n)' },
    tree: { time: 'O(n)', space: 'O(h) recursion' },
    graph: { time: 'O(n + m) BFS/DFS', space: 'O(n + m)' },
    dp: { time: 'O(states × transition)', space: 'O(states)' },
    trie: { time: 'O(total characters)', space: 'O(total characters)' },
    string: { time: 'Often O(n) or O(n log n)', space: 'O(1)–O(n)' },
    bit: { time: 'O(1) or O(bits)', space: 'O(1)' },
    array: { time: 'Often O(n) after insight', space: 'O(1)–O(n)' },
    general: { time: 'Start from brute force, then tighten', space: 'Depends on approach' },
  };

  const pitfalls = {
    io: ['Mismatched types (read int as string).', 'Extra spaces/newlines vs sample.', 'Forgetting multi-test `t` cases.'],
    datatypes: ['Silent overflow on 32-bit int.', 'Integer division truncating unexpectedly.'],
    ifelse: ['Using = instead of == (C++/Java/Go).', 'Overlapping conditions in wrong order.'],
    switch: ['Missing break/fallthrough bugs.', 'Forgetting default.'],
    forloop: ['Off-by-one on inclusive bounds.', 'Mutating the index incorrectly inside.'],
    whileloop: ['Forgetting to update the condition variable.', 'Empty input edge cases.'],
    functions: ['Assuming pass-by-reference when it is pass-by-value.', 'Side effects hidden in helpers.'],
    complexity: ['Ignoring nested loops.', 'Claiming hash ops are always O(1) worst-case.'],
    patterns: ['Wrong number of spaces vs stars.', 'Printing spaces after last character inconsistently.'],
    stl: ['Using map when unordered_map suffices (log factor).', 'Iterator invalidation after insert/erase.'],
    collections: ['ConcurrentModificationException while iterating.', 'Using raw types.'],
    'count-digits': ['n=0 handled wrong.', 'Negatives if constraints allow.'],
    'reverse-number': ['Overflow of reversed value.', 'Keeping trailing zeros incorrectly.'],
    'palindrome-number': ['Negative numbers.', 'Overflow while reversing.'],
    gcd: ['gcd(0,0) definition.', 'LCM overflow.'],
    armstrong: ['Wrong power (digit count vs always 3).', 'Integer overflow on pow.'],
    divisors: ['Duplicating √n when perfect square.', 'Unsorted output when sorted required.'],
    prime: ['Calling 1 prime.', 'Checking up to n instead of √n.'],
    hashing: ['Mutable keys.', 'Assuming iteration order.'],
    recursion: ['Missing base case → stack overflow.', 'Recomputing overlapping subproblems without memo.'],
    sorting: ['Unstable sort breaking equal-key order.', 'Comparing ints with overflow (use long/comparator).'],
    'binary-search': ['Infinite loop from bad mid update.', 'Wrong predicate polarity.'],
    'linked-list': ['Losing head reference.', 'Forgetting to null-terminate.'],
    'stack-queue': ['Pop on empty.', 'Using stack where queue semantics needed.'],
    'two-pointer': ['Moving the wrong pointer.', 'Not handling duplicates when required.'],
    heap: ['Min vs max heap confusion.', 'Growing heap unbounded for top-k.'],
    greedy: ['No proof → WA on counterexamples.', 'Sorting by the wrong key.'],
    tree: ['Null dereference.', 'Passing parent incorrectly in DFS.'],
    graph: ['1-index vs 0-index nodes.', 'Forgetting visited → infinite DFS.'],
    dp: ['Wrong transition order.', 'Off-by-one in indices.'],
    trie: ['Forgetting end marker.', 'Huge memory on dense alphabets without care.'],
    string: ['Immutability copies in Java.', 'UTF-16 vs bytes surprises.'],
    bit: ['Arithmetic vs logical shifts.', 'Sign-extending negatives.'],
    array: ['Modifying while iterating indices carefully.', 'Ignoring constraints on in-place.'],
    general: ['Coding before examples.', 'Optimizing a wrong algorithm.'],
  };

  return {
    intro: intros[family] || intros.general,
    intuition: intuitions[family] || intuitions.general,
    approach: approaches[family] || approaches.general,
    complexity: complexity[family] || complexity.general,
    pitfalls: pitfalls[family] || pitfalls.general,
  };
}

/** Multi-language code emitters keyed by family. */
function codes(family, title) {
  const T = title.replace(/\s+/g, ' ').trim();

  const pack = (cpp, java, python, go, notes = {}) => ({
    cpp: { code: cpp.trim(), notes: notes.cpp },
    java: { code: java.trim(), notes: notes.java },
    python: { code: python.trim(), notes: notes.python },
    go: { code: go.trim(), notes: notes.go },
  });

  if (family === 'io') {
    return pack(
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int a; string s;
    cin >> a >> s;
    cout << a << " " << s << "\\n";
    return 0;
}`,
      `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        String s = sc.next();
        System.out.println(a + " " + s);
    }
}`,
      `a = int(input())
s = input().strip()
print(a, s)`,
      `package main
import "fmt"
func main() {
    var a int
    var s string
    fmt.Scan(&a, &s)
    fmt.Println(a, s)
}`,
      { cpp: 'Prefer \\n over endl unless you need a flush.', java: 'Scanner is fine for learning; BufferedReader for tight TL.', python: 'input() is enough for most beginner tasks.', go: 'Pass pointers to fmt.Scan.' },
    );
  }

  if (family === 'datatypes') {
    return pack(
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int x = 1e9;
    long long y = 1LL * x * x; // promote before multiply
    cout << y << "\\n";
}`,
      `public class Main {
    public static void main(String[] args) {
        int x = 1_000_000_000;
        long y = 1L * x * x;
        System.out.println(y);
    }
}`,
      `x = 10**9
y = x * x  # Python ints are arbitrary precision
print(y)`,
      `package main
import "fmt"
func main() {
    x := int64(1_000_000_000)
    fmt.Println(x * x)
}`,
    );
  }

  if (family === 'ifelse') {
    return pack(
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    if (n > 0) cout << "positive\\n";
    else if (n < 0) cout << "negative\\n";
    else cout << "zero\\n";
}`,
      `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        if (n > 0) System.out.println("positive");
        else if (n < 0) System.out.println("negative");
        else System.out.println("zero");
    }
}`,
      `n = int(input())
if n > 0: print("positive")
elif n < 0: print("negative")
else: print("zero")`,
      `package main
import "fmt"
func main() {
    var n int
    fmt.Scan(&n)
    if n > 0 { fmt.Println("positive")
    } else if n < 0 { fmt.Println("negative")
    } else { fmt.Println("zero") }
}`,
    );
  }

  if (family === 'switch') {
    return pack(
      `#include <bits/stdc++.h>
using namespace std;
int main() {
    int d; cin >> d;
    switch (d) {
        case 1: cout << "mon\\n"; break;
        case 2: cout << "tue\\n"; break;
        default: cout << "other\\n";
    }
}`,
      `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int d = new Scanner(System.in).nextInt();
        switch (d) {
            case 1 -> System.out.println("mon");
            case 2 -> System.out.println("tue");
            default -> System.out.println("other");
        }
    }
}`,
      `d = int(input())
# Python has no switch historically; use dict or match (3.10+)
match d:
    case 1: print("mon")
    case 2: print("tue")
    case _: print("other")`,
      `package main
import "fmt"
func main() {
    var d int
    fmt.Scan(&d)
    switch d {
    case 1: fmt.Println("mon")
    case 2: fmt.Println("tue")
    default: fmt.Println("other")
    }
}`,
    );
  }

  if (family === 'forloop' || family === 'whileloop') {
    const isWhile = family === 'whileloop';
    return pack(
      isWhile
        ? `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    int i = 1;
    while (i <= n) { cout << i << " "; i++; }
    cout << "\\n";
}`
        : `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    for (int i = 1; i <= n; i++) cout << i << " ";
    cout << "\\n";
}`,
      isWhile
        ? `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        int i = 1;
        while (i <= n) { System.out.print(i + " "); i++; }
        System.out.println();
    }
}`
        : `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int n = new Scanner(System.in).nextInt();
        for (int i = 1; i <= n; i++) System.out.print(i + " ");
        System.out.println();
    }
}`,
      isWhile
        ? `n = int(input())
i = 1
while i <= n:
    print(i, end=" ")
    i += 1
print()`
        : `n = int(input())
for i in range(1, n + 1):
    print(i, end=" ")
print()`,
      isWhile
        ? `package main
import "fmt"
func main() {
    var n, i int
    fmt.Scan(&n)
    i = 1
    for i <= n { fmt.Print(i, " "); i++ }
    fmt.Println()
}`
        : `package main
import "fmt"
func main() {
    var n int
    fmt.Scan(&n)
    for i := 1; i <= n; i++ { fmt.Print(i, " ") }
    fmt.Println()
}`,
    );
  }

  if (family === 'count-digits') {
    return pack(
      `int countDigits(long long n) {
    if (n == 0) return 1;
    if (n < 0) n = -n;
    int c = 0;
    while (n) { c++; n /= 10; }
    return c;
}`,
      `static int countDigits(long n) {
    if (n == 0) return 1;
    n = Math.abs(n);
    int c = 0;
    while (n > 0) { c++; n /= 10; }
    return c;
}`,
      `def count_digits(n: int) -> int:
    n = abs(n)
    if n == 0: return 1
    c = 0
    while n:
        c += 1
        n //= 10
    return c`,
      `func countDigits(n int64) int {
    if n == 0 { return 1 }
    if n < 0 { n = -n }
    c := 0
    for n > 0 { c++; n /= 10 }
    return c
}`,
    );
  }

  if (family === 'reverse-number' || family === 'palindrome-number') {
    return pack(
      `long long reverseNum(long long n) {
    long long ans = 0;
    while (n) { ans = ans * 10 + n % 10; n /= 10; }
    return ans;
}
bool isPalindrome(long long n) {
    if (n < 0) return false;
    return n == reverseNum(n);
}`,
      `static long reverseNum(long n) {
    long ans = 0;
    while (n != 0) { ans = ans * 10 + n % 10; n /= 10; }
    return ans;
}
static boolean isPalindrome(long n) {
    if (n < 0) return false;
    return n == reverseNum(n);
}`,
      `def reverse_num(n: int) -> int:
    sign = -1 if n < 0 else 1
    n = abs(n)
    ans = 0
    while n:
        ans = ans * 10 + n % 10
        n //= 10
    return sign * ans

def is_palindrome(n: int) -> bool:
    return n >= 0 and n == reverse_num(n)`,
      `func reverseNum(n int64) int64 {
    ans := int64(0)
    for n != 0 { ans = ans*10 + n%10; n /= 10 }
    return ans
}
func isPalindrome(n int64) bool {
    if n < 0 { return false }
    return n == reverseNum(n)
}`,
      { cpp: family === 'palindrome-number' ? 'Negatives are not palindromes in the usual LC convention.' : 'Watch overflow if ans must fit 32-bit.' },
    );
  }

  if (family === 'gcd') {
    return pack(
      `long long gcd(long long a, long long b) {
    while (b) { auto t = a % b; a = b; b = t; }
    return a;
}`,
      `static long gcd(long a, long b) {
    while (b != 0) { long t = a % b; a = b; b = t; }
    return a;
}`,
      `def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return abs(a)`,
      `func gcd(a, b int64) int64 {
    for b != 0 { a, b = b, a%b }
    if a < 0 { return -a }
    return a
}`,
    );
  }

  if (family === 'prime') {
    return pack(
      `bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}`,
      `static boolean isPrime(long n) {
    if (n < 2) return false;
    for (long i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}`,
      `def is_prime(n: int) -> bool:
    if n < 2: return False
    i = 2
    while i * i <= n:
        if n % i == 0: return False
        i += 1
    return True`,
      `func isPrime(n int64) bool {
    if n < 2 { return false }
    for i := int64(2); i*i <= n; i++ {
        if n%i == 0 { return false }
    }
    return true
}`,
    );
  }

  if (family === 'divisors') {
    return pack(
      `vector<long long> divisors(long long n) {
    vector<long long> d;
    for (long long i = 1; i * i <= n; i++) if (n % i == 0) {
        d.push_back(i);
        if (i * i != n) d.push_back(n / i);
    }
    sort(d.begin(), d.end());
    return d;
}`,
      `static List<Long> divisors(long n) {
    List<Long> d = new ArrayList<>();
    for (long i = 1; i * i <= n; i++) if (n % i == 0) {
        d.add(i);
        if (i * i != n) d.add(n / i);
    }
    Collections.sort(d);
    return d;
}`,
      `def divisors(n: int):
    d = []
    i = 1
    while i * i <= n:
        if n % i == 0:
            d.append(i)
            if i * i != n: d.append(n // i)
        i += 1
    return sorted(d)`,
      `func divisors(n int64) []int64 {
    var d []int64
    for i := int64(1); i*i <= n; i++ {
        if n%i == 0 {
            d = append(d, i)
            if i*i != n { d = append(d, n/i) }
        }
    }
    sort.Slice(d, func(i, j int) bool { return d[i] < d[j] })
    return d
}`,
      { go: 'import "sort" for sort.Slice.' },
    );
  }

  if (family === 'binary-search') {
    return pack(
      `int lowerBoundIndex(vector<int>& a, int x) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      `static int lowerBoundIndex(int[] a, int x) {
    int lo = 0, hi = a.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}`,
      `def lower_bound(a, x):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x: lo = mid + 1
        else: hi = mid
    return lo`,
      `func lowerBoundIndex(a []int, x int) int {
    lo, hi := 0, len(a)
    for lo < hi {
        mid := lo + (hi-lo)/2
        if a[mid] < x { lo = mid + 1 } else { hi = mid }
    }
    return lo
}`,
      { cpp: `Adapt the predicate for “${T}” — binary search the answer space when needed.` },
    );
  }

  if (family === 'two-pointer') {
    return pack(
      `bool twoSumSorted(vector<int>& a, int target) {
    int i = 0, j = (int)a.size() - 1;
    while (i < j) {
        int s = a[i] + a[j];
        if (s == target) return true;
        if (s < target) i++; else j--;
    }
    return false;
}`,
      `static boolean twoSumSorted(int[] a, int target) {
    int i = 0, j = a.length - 1;
    while (i < j) {
        int s = a[i] + a[j];
        if (s == target) return true;
        if (s < target) i++; else j--;
    }
    return false;
}`,
      `def two_sum_sorted(a, target):
    i, j = 0, len(a) - 1
    while i < j:
        s = a[i] + a[j]
        if s == target: return True
        if s < target: i += 1
        else: j -= 1
    return False`,
      `func twoSumSorted(a []int, target int) bool {
    i, j := 0, len(a)-1
    for i < j {
        s := a[i] + a[j]
        if s == target { return true }
        if s < target { i++ } else { j-- }
    }
    return false
}`,
      { cpp: `Reuse this window idea for “${T}” with the right invariant.` },
    );
  }

  if (family === 'recursion') {
    return pack(
      `void printN(int n) {
    if (n == 0) return;
    printN(n - 1);
    cout << n << " ";
}`,
      `static void printN(int n) {
    if (n == 0) return;
    printN(n - 1);
    System.out.print(n + " ");
}`,
      `def print_n(n: int) -> None:
    if n == 0: return
    print_n(n - 1)
    print(n, end=" ")`,
      `func printN(n int) {
    if n == 0 { return }
    printN(n - 1)
    fmt.Print(n, " ")
}`,
      { cpp: `Replace the combine step to match “${T}”.`, go: 'import "fmt"' },
    );
  }

  if (family === 'dp') {
    return pack(
      `// Template: 1D DP — adapt state to the problem
int solve(vector<int>& a) {
    int n = a.size();
    vector<int> dp(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        dp[i] = max(dp[i - 1], /* transition using a[i-1] */ a[i - 1]);
    }
    return dp[n];
}`,
      `static int solve(int[] a) {
    int n = a.length;
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        dp[i] = Math.max(dp[i - 1], a[i - 1]);
    }
    return dp[n];
}`,
      `def solve(a):
    n = len(a)
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = max(dp[i - 1], a[i - 1])
    return dp[n]`,
      `func solve(a []int) int {
    n := len(a)
    dp := make([]int, n+1)
    for i := 1; i <= n; i++ {
        if dp[i-1] > a[i-1] { dp[i] = dp[i-1] } else { dp[i] = a[i-1] }
    }
    return dp[n]
}`,
      { cpp: `Rewrite the transition for “${T}”; keep state meaning in a comment.` },
    );
  }

  if (family === 'graph') {
    return pack(
      `vector<int> bfs(int n, vector<vector<int>>& g, int src) {
    vector<int> dist(n, -1);
    queue<int> q;
    dist[src] = 0; q.push(src);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : g[u]) if (dist[v] < 0) {
            dist[v] = dist[u] + 1; q.push(v);
        }
    }
    return dist;
}`,
      `static int[] bfs(List<List<Integer>> g, int src) {
        int n = g.size();
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        ArrayDeque<Integer> q = new ArrayDeque<>();
        dist[src] = 0; q.add(src);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) if (dist[v] < 0) {
                dist[v] = dist[u] + 1; q.add(v);
            }
        }
        return dist;
}`,
      `from collections import deque
def bfs(g, src):
    n = len(g)
    dist = [-1] * n
    q = deque([src])
    dist[src] = 0
    while q:
        u = q.popleft()
        for v in g[u]:
            if dist[v] < 0:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist`,
      `func bfs(g [][]int, src int) []int {
    n := len(g)
    dist := make([]int, n)
    for i := range dist { dist[i] = -1 }
    q := []int{src}
    dist[src] = 0
    for len(q) > 0 {
        u := q[0]; q = q[1:]
        for _, v := range g[u] {
            if dist[v] < 0 {
                dist[v] = dist[u] + 1
                q = append(q, v)
            }
        }
    }
    return dist
}`,
      { cpp: `Specialize traversal for “${T}” (DFS, topo, Dijkstra, etc.).` },
    );
  }

  if (family === 'tree') {
    return pack(
      `struct Node { int val; Node *left, *right; };
void inorder(Node* r) {
    if (!r) return;
    inorder(r->left);
    cout << r->val << " ";
    inorder(r->right);
}`,
      `class Node {
    int val; Node left, right;
    Node(int v) { val = v; }
}
static void inorder(Node r) {
    if (r == null) return;
    inorder(r.left);
    System.out.print(r.val + " ");
    inorder(r.right);
}`,
      `class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def inorder(r):
    if not r: return
    inorder(r.left)
    print(r.val, end=" ")
    inorder(r.right)`,
      `type Node struct {
    Val int
    Left, Right *Node
}
func inorder(r *Node) {
    if r == nil { return }
    inorder(r.Left)
    fmt.Print(r.Val, " ")
    inorder(r.Right)
}`,
      { cpp: `Change traversal / return aggregate for “${T}”.`, go: 'import "fmt"' },
    );
  }

  if (family === 'linked-list') {
    return pack(
      `struct Node { int val; Node* next; };
Node* reverseList(Node* head) {
    Node *prev = nullptr, *cur = head;
    while (cur) {
        Node* nxt = cur->next;
        cur->next = prev;
        prev = cur; cur = nxt;
    }
    return prev;
}`,
      `class Node {
    int val; Node next;
    Node(int v) { val = v; }
}
static Node reverseList(Node head) {
    Node prev = null, cur = head;
    while (cur != null) {
        Node nxt = cur.next;
        cur.next = prev;
        prev = cur; cur = nxt;
    }
    return prev;
}`,
      `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`,
      `type Node struct{ Val int; Next *Node }
func reverseList(head *Node) *Node {
    var prev *Node
    cur := head
    for cur != nil {
        nxt := cur.Next
        cur.Next = prev
        prev, cur = cur, nxt
    }
    return prev
}`,
      { cpp: `Rewire pointers carefully for “${T}”.` },
    );
  }

  if (family === 'stack-queue') {
    return pack(
      `#include <bits/stdc++.h>
using namespace std;
vector<int> nextGreater(vector<int>& a) {
    int n = a.size();
    vector<int> ans(n, -1);
    stack<int> st;
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {
            ans[st.top()] = a[i]; st.pop();
        }
        st.push(i);
    }
    return ans;
}`,
      `static int[] nextGreater(int[] a) {
    int n = a.length;
    int[] ans = new int[n];
    Arrays.fill(ans, -1);
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        while (!st.isEmpty() && a[st.peek()] < a[i]) ans[st.pop()] = a[i];
        st.push(i);
    }
    return ans;
}`,
      `def next_greater(a):
    n = len(a)
    ans = [-1] * n
    st = []
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:
            ans[st.pop()] = x
        st.append(i)
    return ans`,
      `func nextGreater(a []int) []int {
    n := len(a)
    ans := make([]int, n)
    for i := range ans { ans[i] = -1 }
    st := []int{}
    for i, x := range a {
        for len(st) > 0 && a[st[len(st)-1]] < x {
            ans[st[len(st)-1]] = x
            st = st[:len(st)-1]
        }
        st = append(st, i)
    }
    return ans
}`,
      { cpp: `Monotonic stack/queue patterns adapt cleanly to “${T}”.` },
    );
  }

  if (family === 'array' || family === 'hashing' || family === 'sorting' || family === 'string' || family === 'bit' || family === 'greedy' || family === 'heap' || family === 'trie' || family === 'stl' || family === 'collections' || family === 'functions' || family === 'complexity' || family === 'patterns' || family === 'armstrong' || family === 'general') {
    return pack(
      `#include <bits/stdc++.h>
using namespace std;
// Teach-yourself scaffold for: ${T}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; 
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    // TODO: core idea for "${T}"
    // 1) brute force for correctness
    // 2) replace with the pattern from this step
    cout << a.size() << "\\n";
    return 0;
}`,
      `import java.util.*;
public class Main {
    // Teach-yourself scaffold for: ${T}
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        // TODO: implement "${T}"
        System.out.println(a.length);
    }
}`,
      `# Teach-yourself scaffold for: ${T}
import sys

def solve(a):
    # TODO: core idea for "${T}"
    return len(a)

def main():
    data = list(map(int, sys.stdin.buffer.read().split()))
    if not data: return
    n, *rest = data
    a = rest[:n]
    print(solve(a))

if __name__ == "__main__":
    main()`,
      `package main
import (
    "bufio"
    "fmt"
    "os"
)
// Teach-yourself scaffold for: ${T}
func solve(a []int) int {
    // TODO: core idea for "${T}"
    return len(a)
}
func main() {
    in := bufio.NewReader(os.Stdin)
    var n int
    if _, err := fmt.Fscan(in, &n); err != nil { return }
    a := make([]int, n)
    for i := 0; i < n; i++ { fmt.Fscan(in, &a[i]) }
    fmt.Println(solve(a))
}`,
      {
        cpp: 'Fill the TODO with the approach above; keep IO fast.',
        java: 'Replace the TODO; prefer clear names over micro-opts first.',
        python: 'PyPy helps some TLs; still aim for the right complexity.',
        go: 'Go rewards simple, explicit loops — good for interviews.',
      },
    );
  }

  // fallback
  return codes('general', title);
}

function buildBlog(t) {
  const family = detectFamily(t);
  const p = prose(t, family);
  return {
    id: t.id,
    title: t.title,
    stepTitle: t.stepTitle,
    subStepTitle: t.subStepTitle,
    sourceUrl: t.post,
    intro: p.intro,
    intuition: p.intuition,
    approach: p.approach,
    complexity: p.complexity,
    pitfalls: p.pitfalls,
    languages: codes(family, t.title),
  };
}

fs.mkdirSync(outDir, { recursive: true });
const topics = collectTopics();
let written = 0;
for (const t of topics) {
  const blog = buildBlog(t);
  const file = path.join(outDir, `${t.id}.json`);
  fs.writeFileSync(file, JSON.stringify(blog, null, 2) + '\n');
  written++;
}
console.log(`Wrote ${written} blogs → ${path.relative(root, outDir)}`);
