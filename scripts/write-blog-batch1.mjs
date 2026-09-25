#!/usr/bin/env node
/** Write reviewed batch-1 blogs (topics 1–20). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inv = JSON.parse(fs.readFileSync(path.join(root, 'src/sheets/dsa/content/topicInventory.json'), 'utf8'));
const progress = JSON.parse(fs.readFileSync(path.join(root, 'src/sheets/dsa/content/blogProgress.json'), 'utf8'));
const byId = Object.fromEntries(inv.topics.map((t) => [t.id, t]));
const outDir = path.join(root, 'src/sheets/dsa/content/blogs');

function base(id, extra) {
  const t = byId[id];
  if (!t) throw new Error('missing ' + id);
  return {
    version: 2,
    id,
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
    ...extra,
  };
}

function rel(...ids) {
  return ids.map((id) => ({ id, title: byId[id].title }));
}

const blogs = [];

blogs.push(
  base('srinpttpt', {
    tags: ['io', 'basics'],
    problemStatement:
      'Learn how to read input from stdin and write output to stdout correctly. Online judges treat your program as a pure function of the input stream — format mismatches cause WA even when logic is perfect.',
    example: 'Input:\n3\nAda\n\nOutput:\n3 Ada',
    intuition:
      'Think of the judge as a pipe. You consume tokens in a known order and emit a deterministic answer. Types, separators, and newlines are part of the contract — not decoration.',
    approaches: [
      {
        title: 'Idiomatic Python I/O',
        idea: 'Use input() for simple tasks. For multi-token / larger input, prefer sys.stdin.buffer.',
        algorithm: [
          'Read tokens with the types the statement promises.',
          'Compute.',
          'Print exactly matching the sample (spaces/newlines).',
        ],
        code: `import sys

def main():
    data = sys.stdin.buffer.read().split()
    a = int(data[0])
    s = data[1].decode()
    print(a, s)

if __name__ == "__main__":
    main()`,
        language: 'python',
        time: 'O(total input size)',
        space: 'O(total input size) if you slurp; O(1) extra if you stream',
        spaceNote: 'Slurping is fine for small tasks; stream tokens for huge input',
      },
    ],
    complexity: { time: 'O(size of input)', space: 'O(1) auxiliary if streamed' },
    edgeCases: ['Empty input', 'Multiple tests with leading t', 'Trailing whitespace'],
    commonMistakes: [
      'Printing debug text to stdout (WA).',
      'Heavy flushing on large output (TLE in C++).',
      'Reading the wrong type.',
    ],
    patternRecognition: [
      'Every CP problem starts with an I/O contract.',
      'n ≥ 1e5 in Python → prefer buffered reads to avoid TLE.',
    ],
    followUps: [
      'How do you handle 1e5 test cases efficiently in Python?',
      'When does flushing matter?',
      'Token vs full-line reads?',
    ],
    interviewInsight:
      'Interviews rarely quiz I/O, but messy I/O fails online assessments silently. Treat samples as a contract.',
    related: rel('dttyps', 'timcmplxitylrnbsicsndthnnlysinnxtstps'),
  }),
);

blogs.push(
  base('dttyps', {
    tags: ['types', 'overflow'],
    problemStatement:
      'Understand primitive types and ranges so arithmetic does not silently overflow or truncate.',
    intuition:
      'Constraints tell you the type. If intermediates can exceed 2^31−1, use 64-bit (C++/Java) — Python ints grow automatically, but float precision and // truncation still bite.',
    approaches: [
      {
        title: 'Choose types from constraints',
        idea: 'Map constraint maxima to types before coding.',
        code: `def safe_product(a: int, b: int) -> int:
    return a * b  # Python OK

# Interview note (C++/Java):
# cast before multiply: 1LL * a * b  /  1L * a * b
# when a*b may exceed 2^31-1`,
        language: 'python',
        time: 'O(1)',
        space: 'O(1)',
      },
    ],
    complexity: { time: 'O(1)', space: 'O(1)' },
    edgeCases: ['Peak products near 1e9×1e9', 'Negatives with division'],
    commonMistakes: [
      'Multiplying ints before widening in C++/Java.',
      'Using float for exact integer problems.',
    ],
    followUps: [
      'Range of 32-bit signed int?',
      'When BigInteger vs long long?',
      'Why float equality fails?',
    ],
    interviewInsight:
      'Saying “I’ll use 64-bit because sum ≤ n·maxA” signals constraint awareness.',
    related: rel('srinpttpt', 'timcmplxitylrnbsicsndthnnlysinnxtstps'),
  }),
);

blogs.push(
  base('iflssttmnts', {
    tags: ['branching'],
    problemStatement: 'Encode decision rules with conditionals without overlapping bugs.',
    intuition:
      'Translate English into coherent predicates. Order matters when ranges overlap — test equal / just-below / just-above.',
    approaches: [
      {
        title: 'Decision table → if/elif/else',
        idea: 'Most specific cases first; residual in else. Prefer early returns over deep nesting.',
        code: `def classify(n: int) -> str:
    if n > 0:
        return "positive"
    if n < 0:
        return "negative"
    return "zero"

def withdraw(balance: int, amount: int) -> int:
    if amount <= 0:
        raise ValueError("amount")
    if amount > balance:
        raise ValueError("insufficient")
    return balance - amount`,
        language: 'python',
        time: 'O(1)',
        space: 'O(1)',
      },
    ],
    complexity: { time: 'O(1)', space: 'O(1)' },
    commonMistakes: ['= instead of == in C++/Java/Go', 'Wrong order of overlapping ranges', 'Deep nesting'],
    followUps: ['Rewrite nested ifs with early returns?', 'When is a lookup table clearer?'],
    interviewInsight: 'Shallow, readable branching is a live-coding readability signal.',
    related: rel('switchsttmnt', 'frlps'),
  }),
);

blogs.push(
  base('switchsttmnt', {
    tags: ['branching'],
    problemStatement:
      'Dispatch on a discrete set of labels. Python 3.10+ has match/case; older style uses if/elif.',
    intuition: 'Exact finite labels → switch/match. Always define the default path.',
    approaches: [
      {
        title: 'match/case',
        idea: 'Exact match with default.',
        code: `def day_name(d: int) -> str:
    match d:
        case 1:
            return "mon"
        case 2:
            return "tue"
        case 3:
            return "wed"
        case _:
            return "other"`,
        language: 'python',
        time: 'O(1)',
        space: 'O(1)',
      },
    ],
    complexity: { time: 'O(1)', space: 'O(1)' },
    commonMistakes: ['Fall-through without break in C++/Java', 'Missing default', 'Using switch for ranges'],
    followUps: ['Fall-through in C++?', 'When prefer polymorphism over type-code switches?'],
    interviewInsight: 'Large type-code switches often want Strategy/polymorphism in design rounds.',
    related: rel('iflssttmnts'),
  }),
);

blogs.push(
  base('whtrrrysstrings', {
    tags: ['arrays', 'strings'],
    problemStatement:
      'Arrays/strings are contiguous sequences with O(1) index access — the default DSA canvas.',
    intuition:
      'Index → value in O(1). Python strings are immutable — concat in a loop is a hidden O(n²) TLE trap. Use lists + join.',
    approaches: [
      {
        title: 'Indexing, mutability, building strings',
        idea: 'list for mutable sequences; build strings with join.',
        code: `a = [3, 1, 4]
a[0] = 2
s = "ada"
chars = list(s)
chars[0] = "A"
s2 = "".join(chars)

parts = []
for ch in "abc":
    parts.append(ch)
print("".join(parts))  # O(n)`,
        language: 'python',
        time: 'Access O(1); scan O(n)',
        space: 'O(n) to copy/build',
        flags: ['TLE'],
        limitations: ['Naive string += in a loop → O(n²) → TLE for n~1e5'],
      },
    ],
    complexity: { time: 'Access O(1), scan O(n)', space: 'O(1) extra for scans; O(n) for copies' },
    commonMistakes: [
      'Quadratic string concatenation',
      'Subsequence vs substring confusion',
      '1-based thinking in 0-based languages',
    ],
    patternRecognition: [
      'Contiguous → two pointers / sliding window / prefix sums',
      'Frequencies → hashing',
    ],
    followUps: [
      'Why is list.append amortized O(1)?',
      'Array vs linked list access?',
      'Copy vs in-place?',
    ],
    interviewInsight: 'Random vs sequential access tradeoffs should be automatic.',
    related: rel('frlps', 'cntdigits'),
  }),
);

blogs.push(
  base('frlps', {
    tags: ['loops'],
    problemStatement: 'Counted iteration with correct inclusive/exclusive bounds.',
    intuition:
      'Decide index meaning first, then write the header. Verify n=0 and n=1. Nested loops → state O(n²) and TLE risk when n=1e5.',
    approaches: [
      {
        title: 'range mastery',
        idea: 'range(n) → 0..n-1; range(1,n+1) → 1..n.',
        code: `def print_1_to_n(n: int) -> None:
    for i in range(1, n + 1):
        print(i, end=" ")
    print()

def sum_array(a: list[int]) -> int:
    total = 0
    for x in a:
        total += x
    return total`,
        language: 'python',
        time: 'O(n) for n iterations',
        space: 'O(1) auxiliary',
      },
    ],
    complexity: { time: 'O(iterations)', space: 'O(1) auxiliary' },
    edgeCases: ['n=0', 'n=1', 'empty list'],
    commonMistakes: ['Off-by-one', 'Accidental O(n²) nested loops → TLE'],
    followUps: ['When is while clearer?', 'enumerate for index+value?'],
    interviewInsight: 'Narrate “nested loop is O(n²); n=1e5 TLEs” before coding.',
    related: rel('whillps', 'timcmplxitylrnbsicsndthnnlysinnxtstps'),
  }),
);

blogs.push(
  base('whillps', {
    tags: ['loops'],
    problemStatement: 'Repeat while a condition holds; guarantee progress toward termination.',
    intuition:
      'Identify a progress measure (i increases, window shrinks, queue drains). No progress ⇒ infinite loop ⇒ TLE.',
    approaches: [
      {
        title: 'Initialize → condition → update',
        idea: 'All three parts must be correct.',
        code: `def countdown(n: int) -> None:
    while n > 0:
        print(n)
        n -= 1

def has_pair_sum_sorted(a: list[int], target: int) -> bool:
    i, j = 0, len(a) - 1
    while i < j:
        s = a[i] + a[j]
        if s == target:
            return True
        if s < target:
            i += 1
        else:
            j -= 1
    return False`,
        language: 'python',
        time: 'O(n) typical for linear scans',
        space: 'O(1)',
        flags: ['TLE'],
        limitations: ['Missing update → infinite loop → TLE'],
      },
    ],
    complexity: { time: 'Depends on iterations until exit', space: 'O(1) auxiliary' },
    commonMistakes: ['Forgot update (infinite loop)', 'i < j vs i <= j mistakes'],
    followUps: ['Prove termination?', 'Convert while → for when bounds known?'],
    interviewInsight: 'Narrate the progress measure out loud in live coding.',
    related: rel('frlps'),
  }),
);

blogs.push(
  base('fnctinspssbyrfrncndvl', {
    tags: ['functions', 'memory-model'],
    problemStatement:
      'Know whether a callee can mutate caller data: Python’s object-reference model vs C++ value/reference.',
    intuition:
      'Rebinding a parameter does not rebind the caller’s name. In-place mutation of a mutable object is visible to the caller. C++ makes this explicit with &.',
    approaches: [
      {
        title: 'Rebind vs mutate',
        idea: 'Demonstrate both behaviors.',
        code: `def rebind(x: int) -> None:
    x = x + 1  # local only

def mutate(a: list[int]) -> None:
    a.append(99)  # visible

n = 3
rebind(n)
print(n)  # 3

arr = [1, 2]
mutate(arr)
print(arr)  # [1, 2, 99]

# C++ mapping:
# void f(int x)              // by value
# void g(int& x)             // by reference
# void h(const vector<int>&) // cheap read-only`,
        language: 'python',
        time: 'O(1) for the call mechanism',
        space: 'O(1) frame + callee; recursion adds stack',
        flags: ['MLE', 'TLE'],
        limitations: ['Passing huge vectors by value in C++ → MLE/TLE'],
      },
    ],
    complexity: {
      time: 'Depends on callee',
      space: 'Call overhead O(1) + callee',
      recursionStack: 'O(depth) if recursive',
    },
    commonMistakes: [
      'Thinking Python ints mutate in-place via x += 1 in a callee',
      'Accidental shared-list mutation',
      'Copying large structures by value',
    ],
    followUps: [
      'Is Java pass-by-reference?',
      'How to prevent accidental mutation?',
      'Cost of passing 1e6 vector by value in C++?',
    ],
    interviewInsight: 'Rebind vs mutate confusion is a classic Python interview trap.',
    related: rel('dttyps', 'ndrstndrcrsinbyprintsmthingntims'),
  }),
);

blogs.push(
  base('timcmplxitylrnbsicsndthnnlysinnxtstps', {
    tags: ['complexity', 'tle', 'mle'],
    pattern: 'complexity-analysis',
    problemStatement:
      'Estimate runtime and memory scaling to predict TLE / MLE before you code.',
    intuition:
      'Drop constants and lower-order terms. ~1e8 ops/sec rule of thumb. O(n²) with n=1e5 → TLE. O(n²) int tables with n=1e4 → MLE risk. Recursion stack is not O(1).',
    approaches: [
      {
        title: 'Constraints → algorithm family',
        idea: 'Read limits first; pick a complexity budget; reject impossible families.',
        algorithm: [
          'Identify n, m, k from constraints.',
          'Count nested loops / branching / heavy ops.',
          'Compare to time/memory limits → TLE/MLE flags.',
        ],
        code: `# Feasibility sketch (typical single-test):
# n <= 20      → O(2^n * poly)
# n <= 400     → O(n^3) borderline
# n <= 5000    → O(n^2) usually OK
# n <= 1e5     → O(n log n) / O(n)
# n <= 1e12    → O(log n) / math

def looks_quadratic(a: list[int]) -> int:
    n = len(a)
    best = 0
    for i in range(n):          # O(n^2) — TLE if n ~ 1e5
        for j in range(i, n):
            best = max(best, a[j])
    return best`,
        language: 'python',
        time: 'Analysis — not a runtime',
        space: '—',
        flags: ['TLE', 'MLE'],
      },
    ],
    specialTechnique: {
      title: 'TLE / MLE / RE / WA',
      body: `TLE — too slow (or constant too large).\nMLE — too much memory.\nRE — crash (OOB, div0, recursion depth).\nWA — wrong answer.\n\nAlways separate:\n• Time\n• Auxiliary space\n• Input space\n• Recursion stack depth`,
    },
    complexity: { time: 'Depends on algorithm', space: 'Depends on algorithm' },
    commonMistakes: [
      'Calling recursion stack O(1)',
      'Assuming hashmap worst-case O(1)',
      'O(n²) DP for large n → MLE+TLE',
    ],
    patternRecognition: [
      'Read constraints before choosing the family.',
      'n=1e5 ⇒ discard O(n²) unless asked for brute force first.',
    ],
    followUps: [
      'Auxiliary vs total space?',
      'Why Python O(n log n) may TLE where C++ passes?',
      'Amortized append complexity?',
    ],
    interviewInsight:
      'Narrating complexity and TLE/MLE risk before coding is a strong interview signal.',
    related: rel('frlps', 'cntdigits'),
  }),
);

blogs.push(
  base('pttrns', {
    tags: ['patterns', 'nested-loops'],
    pattern: 'nested-loops',
    problemStatement: 'Print grid patterns using nested loops — trains index formulas before matrices.',
    example: 'n=3:\n*\n**\n***',
    intuition: 'Outer loop = row r. Inner loop prints a function of r (and c). Derive the formula first.',
    approaches: [
      {
        title: 'Row formula → nested loops',
        idea: 'For row r in 1..n print r stars.',
        code: `def triangle(n: int) -> None:
    for r in range(1, n + 1):
        print("*" * r)

def pyramid(n: int) -> None:
    for r in range(1, n + 1):
        print(" " * (n - r) + "*" * (2 * r - 1))`,
        language: 'python',
        time: 'O(total characters) ≈ O(n²)',
        space: 'O(1) auxiliary',
      },
    ],
    complexity: { time: 'O(n²) typical', space: 'O(1) auxiliary' },
    commonMistakes: ['Wrong spaces/stars', 'Off-by-one in 2*r-1'],
    patternRecognition: ['Row/column dependence → nested loops with a closed-form count'],
    followUps: ['Stars in a full pyramid of height n?', 'Build list of lines instead of printing?'],
    interviewInsight: 'Warm-up: they care you can derive the formula, not memorize shapes.',
    related: rel('frlps'),
  }),
);

// ---- 11–20 ----
blogs.push(
  base('cstl', {
    tags: ['stl', 'containers'],
    topicType: 'data-structure',
    problemStatement:
      'Know the core C++ STL containers/algorithms — and their Python equivalents — by access pattern.',
    intuition:
      'Pick containers by operations: sequence → vector/list; ordered unique → set; average lookup → unordered_map/dict; extremes → priority_queue/heapq.',
    approaches: [
      {
        title: 'Python equivalents cheat-sheet',
        idea: 'Map STL → Python for interview bilingualism.',
        code: `# vector          → list
# stack/queue      → list / collections.deque
# priority_queue   → heapq
# set / map        → set / dict (ordered variants: sorted containers manually)
# unordered_map    → dict
# sort             → list.sort / sorted
# lower_bound      → bisect.bisect_left

from collections import deque
import heapq
import bisect

a = [3, 1, 2]
a.sort()
idx = bisect.bisect_left(a, 2)
dq = deque([1, 2])
dq.appendleft(0)
heap = [5, 1, 3]
heapq.heapify(heap)
heapq.heappush(heap, 0)`,
        language: 'python',
        time: 'Container-specific (know dict avg O(1), sort O(n log n))',
        space: 'Container-specific',
      },
    ],
    complexity: { time: 'Know per-operation costs', space: 'Know per-structure costs' },
    commonMistakes: [
      'Using sorted map when hash map suffices (extra log)',
      'Iterator invalidation habits from C++ applied blindly',
    ],
    followUps: [
      'When ordered map vs hash map?',
      'Amortized cost of vector push_back?',
      'Python dict average vs worst case?',
    ],
    interviewInsight: 'Naming the right structure in 10 seconds beats micro-optimizing the wrong one.',
    related: rel('jvcllctins', 'timcmplxitylrnbsicsndthnnlysinnxtstps'),
  }),
);

blogs.push(
  base('jvcllctins', {
    tags: ['collections', 'java'],
    topicType: 'data-structure',
    problemStatement: 'Java Collections counterparts for common DSA needs — mirrored here in Python for this sheet’s default language.',
    intuition:
      'ArrayList≈list, HashMap≈dict, HashSet≈set, ArrayDeque≈deque, PriorityQueue≈heapq. Know average costs and when TreeMap-order matters.',
    approaches: [
      {
        title: 'Common structures in Python',
        idea: 'Same selection criteria as Java Collections.',
        code: `from collections import deque, Counter
import heapq

freqs = Counter([1, 1, 2])
dq = deque()
dq.append(1)
dq.appendleft(0)
dq.pop()
heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 1)
print(heapq.heappop(heap))  # 1`,
        language: 'python',
        time: 'dict/Counter avg O(1); heap push/pop O(log n)',
        space: 'O(n)',
      },
    ],
    complexity: { time: 'Per-operation', space: 'O(n) typical' },
    commonMistakes: ['Modifying a dict while iterating keys', 'Using list as a queue (O(n) pop(0)) → TLE'],
    followUps: ['Why ArrayDeque over Stack in Java?', 'LinkedHashMap use cases?', 'Heap as min vs max?'],
    interviewInsight: 'Using list.pop(0) as queue is a Python TLE classic — prefer deque.',
    related: rel('cstl'),
  }),
);

blogs.push(
  base('cntdigits', {
    tags: ['math', 'digits'],
    problemStatement: 'Given an integer n, return how many digits it has.',
    example: 'n = 120 → 3\nn = 0 → 1',
    intuition:
      'Each division by 10 peels one digit. Work is proportional to digit count = O(log10 n), not O(n).',
    approaches: [
      {
        title: 'Brute: convert to string',
        idea: 'len(str(abs(n))) — clear, but less “mathy” in interviews.',
        code: `def count_digits_str(n: int) -> int:
    return len(str(abs(n)))`,
        language: 'python',
        time: 'O(log n)',
        space: 'O(log n) for the string',
        flags: ['MLE'],
        limitations: ['Fine here; avoid building huge strings in hotter loops'],
      },
      {
        title: 'Optimal: divide by 10',
        idea: 'Count peel operations. Handle 0 explicitly.',
        algorithm: ['If n==0 return 1', 'n = abs(n)', 'While n>0: count++, n//=10'],
        code: `def count_digits(n: int) -> int:
    if n == 0:
        return 1
    n = abs(n)
    c = 0
    while n > 0:
        c += 1
        n //= 10
    return c`,
        language: 'python',
        time: 'O(log n)',
        space: 'O(1) auxiliary',
        dryRun: 'n=120\n120→12 c=1\n12→1 c=2\n1→0 c=3 → answer 3',
      },
    ],
    complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
    edgeCases: ['n=0', 'negatives', 'n=10^k'],
    commonMistakes: ['Returning 0 for n=0', 'Forgetting abs on negatives'],
    patternRecognition: ['Digit DP / digit peeling problems start here'],
    followUps: [
      'Count digits in O(1) with logs? (careful with floats)',
      'Sum of digits?',
      'Digital root?',
    ],
    interviewInsight: 'They want O(1) aux and correct n=0 — tiny problems still expose carelessness.',
    related: rel('rvrsnmbr', 'chckplindrm'),
  }),
);

blogs.push(
  base('rvrsnmbr', {
    tags: ['math', 'overflow'],
    problemStatement: 'Reverse the digits of an integer. Discuss overflow if the reversed value must fit 32-bit.',
    example: '123 → 321\n-120 → -21 (sign kept, trailing zeros dropped)',
    intuition:
      'Pop digits with %10 and push into ans = ans*10 + digit. In fixed-width languages, check overflow before multiplying.',
    approaches: [
      {
        title: 'Digit peel (Python — unbounded ints)',
        idea: 'Python ints do not overflow; still show the overflow check interviewers expect in Java/C++.',
        code: `def reverse_number(n: int) -> int:
    sign = -1 if n < 0 else 1
    n = abs(n)
    ans = 0
    while n:
        ans = ans * 10 + n % 10
        n //= 10
    return sign * ans

# Java/C++ interview variant must guard 32-bit overflow before ans*10`,
        language: 'python',
        time: 'O(log n)',
        space: 'O(1)',
        dryRun: 'n=123\nans=0\n3 → ans=3\n2 → ans=32\n1 → ans=321',
      },
    ],
    complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
    edgeCases: ['Trailing zeros', 'Negative inputs', 'Reversed value overflowing int32'],
    commonMistakes: ['Ignoring overflow in Java', 'Losing the sign', 'Using strings without discussing tradeoffs'],
    followUps: [
      'Return 0 on overflow (LC7 style)?',
      'Reverse only a portion of digits?',
      'Palindrome check without full reverse?',
    ],
    interviewInsight: 'Overflow handling on reverse is a favorite Java follow-up.',
    related: rel('chckplindrm', 'cntdigits'),
    patternRecognition: ['Digit manipulation problems'],
  }),
);

blogs.push(
  base('chckplindrm', {
    tags: ['math', 'palindrome'],
    problemStatement: 'Check whether an integer is a palindrome (same forwards and backwards).',
    example: '121 → true\n-121 → false (usual convention)\n10 → false',
    intuition:
      'A number equals its reverse iff it is a palindrome (for non-negatives). Negatives are usually false. Avoid overflow by comparing half-digits when required.',
    approaches: [
      {
        title: 'Reverse and compare',
        idea: 'Reuse reverse; compare to original.',
        code: `def is_palindrome(n: int) -> bool:
    if n < 0:
        return False
    original = n
    rev = 0
    while n:
        rev = rev * 10 + n % 10
        n //= 10
    return rev == original`,
        language: 'python',
        time: 'O(log n)',
        space: 'O(1)',
      },
      {
        title: 'Interview optimization: reverse half',
        idea: 'Stop at half digits to reduce overflow risk in fixed-width ints.',
        code: `def is_palindrome_half(n: int) -> bool:
    if n < 0 or (n % 10 == 0 and n != 0):
        return False
    rev = 0
    while n > rev:
        rev = rev * 10 + n % 10
        n //= 10
    return n == rev or n == rev // 10`,
        language: 'python',
        time: 'O(log n)',
        space: 'O(1)',
        whyWorks: 'When lengths differ by 1 (odd digits), middle digit sits in rev; drop it with //10.',
      },
    ],
    complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
    edgeCases: ['n<0', 'n=10', 'single digit', 'n=0'],
    commonMistakes: ['Accepting negatives', 'Trailing-zero cases like 10'],
    followUps: ['Do it without converting to string?', 'String palindrome with non-alphanumerics?', 'Longest palindromic substring link?'],
    interviewInsight: 'Half-reverse shows you think about overflow and edge zeros.',
    related: rel('rvrsnmbr', 'cntdigits'),
  }),
);

blogs.push(
  base('gcdrhcf', {
    tags: ['math', 'gcd', 'euclidean'],
    pattern: 'euclidean-algorithm',
    problemStatement: 'Compute GCD/HCF of two integers. Often used to compute LCM = a / gcd * b carefully.',
    example: 'gcd(12, 18) = 6',
    intuition:
      'Euclid: gcd(a,b)=gcd(b, a%b). Remainders shrink quickly → O(log min(a,b)). This is the interview algorithm — not trial from min down to 1.',
    approaches: [
      {
        title: 'Brute: trial from min(a,b)',
        idea: 'Check downward for first common divisor.',
        code: `def gcd_brute(a: int, b: int) -> int:
    a, b = abs(a), abs(b)
    for x in range(min(a, b), 0, -1):
        if a % x == 0 and b % x == 0:
            return x
    return a or b`,
        language: 'python',
        time: 'O(min(a,b))',
        space: 'O(1)',
        flags: ['TLE'],
        limitations: ['TLE for large a,b near 1e12'],
      },
      {
        title: 'Optimal: Euclidean algorithm',
        idea: 'Replace (a,b) with (b, a%b) until b=0.',
        code: `def gcd(a: int, b: int) -> int:
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b
    return a

def lcm(a: int, b: int) -> int:
    return abs(a // gcd(a, b) * b)  # divide before multiply`,
        language: 'python',
        time: 'O(log min(a,b))',
        space: 'O(1)',
        dryRun: 'gcd(12,18)\n12,18 → 18,12 → 12,6 → 6,0 → 6',
        whyWorks: 'Any common divisor of a and b also divides a%b; the sets of common divisors stay aligned.',
      },
    ],
    specialTechnique: {
      title: 'Special technique: Euclidean algorithm',
      body: 'Remainders strictly decrease for b>0, so termination is guaranteed. This underpins fraction simplification, modular inverses (extended Euclid), and LCM calculations.',
    },
    complexity: { time: 'O(log min(a,b))', space: 'O(1) auxiliary' },
    edgeCases: ['gcd(0,0) undefined/controversial — define a convention', 'negatives', 'one zero'],
    commonMistakes: ['LCM overflow by multiplying first', 'Brute trial for huge values → TLE'],
    patternRecognition: [
      'Problems asking “largest number dividing both”',
      'Fraction reduction, lattice points, frog jumps with steps',
    ],
    followUps: [
      'Extended Euclid for modular inverse?',
      'GCD of an array?',
      'Why LCM(a,b)*GCD(a,b)=|a*b|?',
    ],
    interviewInsight: 'Brute vs Euclid is a clean complexity conversation — take it.',
    related: rel('printlldivisrs', 'chckfrprim'),
  }),
);

blogs.push(
  base('rmstrngnmbrs', {
    tags: ['math'],
    problemStatement:
      'Check if n is an Armstrong number: sum of each digit raised to the number-of-digits power equals n.',
    example: '153 → 1³+5³+3³ = 153 → true',
    intuition: 'First count digits (order), then peel digits and accumulate dig^order.',
    approaches: [
      {
        title: 'Count digits then power-sum',
        idea: 'Two passes over digits (or one count + one sum).',
        code: `def is_armstrong(n: int) -> bool:
    if n < 0:
        return False
    original = n
    order = len(str(n)) if n > 0 else 1
    total = 0
    x = n
    while x:
        dig = x % 10
        total += dig ** order
        x //= 10
    return total == original`,
        language: 'python',
        time: 'O(d) where d=number of digits',
        space: 'O(1)',
      },
    ],
    complexity: { time: 'O(log n)', space: 'O(1)' },
    edgeCases: ['0 and 1 (true)', 'negatives usually false/out of scope'],
    commonMistakes: ['Always using power 3 (only for 3-digit examples)', 'Integer overflow on pow in C++'],
    followUps: ['Generate all Armstrong numbers with d digits?', 'Narcissistic number variants?'],
    interviewInsight: 'Tiny problem — they watch whether you generalize beyond the 3-digit example.',
    related: rel('cntdigits'),
  }),
);

blogs.push(
  base('printlldivisrs', {
    tags: ['math', 'divisors'],
    problemStatement: 'Print all positive divisors of n.',
    example: 'n=36 → 1 2 3 4 6 9 12 18 36',
    intuition:
      'Divisors come in pairs (i, n/i). Iterate i to √n to find all pairs — O(√n), not O(n).',
    approaches: [
      {
        title: 'Brute: test every i in 1..n',
        idea: 'If n%i==0, collect i.',
        code: `def divisors_brute(n: int) -> list[int]:
    return [i for i in range(1, n + 1) if n % i == 0]`,
        language: 'python',
        time: 'O(n)',
        space: 'O(number of divisors)',
        flags: ['TLE'],
        limitations: ['TLE for n~1e12'],
      },
      {
        title: 'Optimal: iterate to √n',
        idea: 'For each i | n with i*i<=n, take i and n/i (once if equal).',
        code: `def divisors(n: int) -> list[int]:
    small, large = [], []
    i = 1
    while i * i <= n:
        if n % i == 0:
            small.append(i)
            if i * i != n:
                large.append(n // i)
        i += 1
    return small + large[::-1]`,
        language: 'python',
        time: 'O(√n)',
        space: 'O(number of divisors)',
        dryRun: 'n=36\ni=1 → 1,36\ni=2 → 2,18\ni=3 → 3,12\ni=4 → 4,9\ni=5 no\ni=6 → 6 (square)\nsorted merge → 1 2 3 4 6 9 12 18 36',
        whyWorks: 'Every divisor ≥ √n is paired with one ≤ √n.',
      },
    ],
    complexity: { time: 'O(√n)', space: 'O(#divisors) output' },
    edgeCases: ['n=1', 'prime n', 'perfect squares (avoid duplicating √n)'],
    commonMistakes: ['Duplicating square root', 'Unsorted output when sorted required', 'O(n) loop on huge n → TLE'],
    patternRecognition: ['Factorization, sieve precomputation, sum-of-divisors'],
    followUps: ['Sum of divisors?', 'Count divisors from prime factorization?', 'All divisors of all numbers ≤ N (sieve)?'],
    interviewInsight: 'Brute O(n) vs √n is a classic first filter for number-theory comfort.',
    related: rel('chckfrprim', 'gcdrhcf'),
  }),
);

blogs.push(
  base('chckfrprim', {
    tags: ['math', 'prime'],
    pattern: 'primality',
    problemStatement: 'Check whether n is prime.',
    example: 'n=17 → true\nn=1 → false\nn=9 → false',
    intuition:
      'A prime has no divisor in 2..√n. Checking to n−1 wastes time (TLE on large n). For many queries, precompute a sieve.',
    approaches: [
      {
        title: 'Brute: trial to n-1',
        idea: 'Test every candidate divisor.',
        code: `def is_prime_brute(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True`,
        language: 'python',
        time: 'O(n)',
        space: 'O(1)',
        flags: ['TLE'],
      },
      {
        title: 'Optimal single-query: trial to √n',
        idea: 'Only need divisors ≤ √n; optionally skip evens after 2.',
        code: `def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True`,
        language: 'python',
        time: 'O(√n)',
        space: 'O(1)',
        dryRun: 'n=17\ni=3,5 (25>17 stop) → prime',
      },
    ],
    specialTechnique: {
      title: 'Many queries? Sieve of Eratosthenes',
      body: 'If you must answer primality for all values ≤ N, sieve in O(N log log N) time and O(N) memory — watch MLE if N is huge (e.g. 1e8 booleans).',
    },
    complexity: { time: 'O(√n) single query; sieve O(N log log N) preprocess', space: 'O(1) / O(N) for sieve' },
    edgeCases: ['n<2', 'n=2', 'large primes near 1e12 for single check'],
    commonMistakes: ['Calling 1 prime', 'Looping to n → TLE', 'Sieve of size 1e9 → MLE'],
    patternRecognition: [
      'Factorization, segment sieve, SPF sieve',
      'Constraints with Q queries up to N → sieve',
    ],
    followUps: [
      'Sieve memory layout (bitset) to reduce MLE?',
      'Primality for n~1e18 (Miller-Rabin)?',
      'Count primes in [L,R]?',
    ],
    interviewInsight: 'Connecting single-check √n vs sieve for many queries is the jump most candidates miss.',
    related: rel('printlldivisrs'),
  }),
);

blogs.push(
  base('ndrstndrcrsinbyprintsmthingntims', {
    tags: ['recursion'],
    pattern: 'recursion',
    problemStatement: 'Understand recursion by printing a message N times using recursive calls (no loop).',
    example: 'N=3 → print a line three times',
    intuition:
      'Recursion = base case + smaller self-call. Printing N times: print once, then solve N−1. Stack depth is N — for huge N this is RE (recursion limit) / MLE on stack, even if time looks fine.',
    approaches: [
      {
        title: 'Recursive print',
        idea: 'Base: n==0 stop. Else print and recurse n-1.',
        code: `import sys
sys.setrecursionlimit(10**5)  # demo only — prefer loops for huge N

def print_n_times(n: int, msg: str = "hello") -> None:
    if n == 0:
        return
    print(msg)
    print_n_times(n - 1, msg)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) recursion stack',
        spaceNote: 'Stack is not O(1) — n=1e6 likely RE/MLE',
        flags: ['RE', 'MLE'],
        dryRun: 'n=3\nprint; call 2\nprint; call 1\nprint; call 0 return',
        whyWorks: 'Each call handles one print; induction covers all n≥0.',
      },
    ],
    complexity: {
      time: 'O(n)',
      space: 'O(n) recursion stack',
      recursionStack: 'O(n)',
    },
    edgeCases: ['n=0', 'large n → recursion limit'],
    commonMistakes: [
      'Missing base case → infinite recursion → RE',
      'Calling stack space O(1)',
      'Using recursion where a loop is clearer/safer',
    ],
    patternRecognition: [
      'Problem defined in terms of a smaller subproblem',
      'Tree/graph DFS naturally recursive',
    ],
    followUps: [
      'Convert to iterative?',
      'What is Python’s default recursion limit?',
      'Tail recursion elimination in Python? (not guaranteed)',
    ],
    interviewInsight:
      'They check base case + stack-cost awareness. Saying “O(n) stack, may RE for large n” is the mature answer.',
    related: rel('printnmntimssingrcrsin', 'print1tnsingrcrsin', 'smffirstnnmbrs'),
  }),
);

// write files + update progress
for (const blog of blogs) {
  fs.writeFileSync(path.join(outDir, `${blog.id}.json`), JSON.stringify(blog, null, 2) + '\n');
  progress.byId[blog.id] = {
    topicNumber: blog.topicNumber,
    status: 'reviewed',
    batch: 1,
    quality: 'reviewed',
  };
  const invTopic = byId[blog.id];
  if (invTopic) {
    invTopic.status = 'reviewed';
    invTopic.batch = 1;
  }
}

progress.reviewed = Object.values(progress.byId).filter((x) => x.status === 'reviewed').length;
progress.pending = progress.total - progress.reviewed - (progress.needsReview || 0);
progress.lastBatch = { id: 1, count: blogs.length, topicNumbers: blogs.map((b) => b.topicNumber) };
fs.writeFileSync(path.join(root, 'src/sheets/dsa/content/blogProgress.json'), JSON.stringify(progress, null, 2));
fs.writeFileSync(path.join(root, 'src/sheets/dsa/content/topicInventory.json'), JSON.stringify(inv, null, 2));

console.log(`Batch 1 wrote ${blogs.length} reviewed blogs:`);
console.log(blogs.map((b) => `#${b.topicNumber} ${b.id}`).join('\n'));
console.log(`Progress: ${progress.reviewed}/${progress.total} reviewed`);
