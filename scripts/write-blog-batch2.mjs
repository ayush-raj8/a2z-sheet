#!/usr/bin/env node
/** Reviewed batch-2 blogs: topics #21–#38 (recursion, hashing, sorting). */
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
  base('printnmntimssingrcrsin', {
    tags: ['recursion'],
    pattern: 'recursion',
    problemStatement: 'Print a given name N times using recursion (no loop).',
    example: 'name="Ada", N=3 → Ada\\nAda\\nAda',
    intuition:
      'Same structure as “print something N times”: one unit of work + recurse on N−1. Stack depth is N — large N → RE (recursion limit), not just TLE.',
    approaches: [
      {
        title: 'Recursive print',
        idea: 'Base n==0; else print name and recurse n-1.',
        code: `def print_name(n: int, name: str = "Ada") -> None:
    if n == 0:
        return
    print(name)
    print_name(n - 1, name)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) recursion stack',
        spaceNote: 'Stack ≠ O(1); prefer a loop for huge n',
        flags: ['RE', 'MLE'],
        dryRun: 'n=2\\nprint Ada; call 1\\nprint Ada; call 0 return',
      },
    ],
    complexity: { time: 'O(n)', space: 'O(n) recursion stack', recursionStack: 'O(n)' },
    edgeCases: ['n=0', 'large n → recursion limit'],
    commonMistakes: ['Missing base case', 'Calling stack O(1)', 'Recursing after print vs before (order of output)'],
    patternRecognition: ['“Do X, then solve a smaller copy of the same task”'],
    followUps: ['Print iteratively?', 'What is Python’s default recursion limit?', 'Head recursion vs tail recursion here?'],
    interviewInsight: 'They check base case + awareness that stack costs memory.',
    related: rel('ndrstndrcrsinbyprintsmthingntims', 'print1tnsingrcrsin'),
  }),
);

blogs.push(
  base('print1tnsingrcrsin', {
    tags: ['recursion'],
    pattern: 'recursion',
    problemStatement: 'Print numbers from 1 to N using recursion.',
    example: 'N=4 → 1 2 3 4',
    intuition:
      'Two equivalent ideas: (1) recurse to N−1 first, then print N (ascending after returning), or (2) print i then recurse i+1 with a helper. The call stack order determines print order.',
    approaches: [
      {
        title: 'Print on the way back (classic)',
        idea: 'Solve 1..N−1, then print N.',
        code: `def print_1_to_n(n: int) -> None:
    if n < 1:
        return
    print_1_to_n(n - 1)
    print(n, end=" ")`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) stack',
        dryRun: 'n=3\\ncall 2 → call 1 → call 0 return\\nprint 1; print 2; print 3',
      },
      {
        title: 'Print on the way down (helper)',
        idea: 'Carry current i; print then go to i+1.',
        code: `def print_1_to_n_down(n: int, i: int = 1) -> None:
    if i > n:
        return
    print(i, end=" ")
    print_1_to_n_down(n, i + 1)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) stack',
      },
    ],
    complexity: { time: 'O(n)', space: 'O(n) recursion stack', recursionStack: 'O(n)' },
    commonMistakes: ['Printing before recurse when you wanted ascending (gets N..1)', 'Off-by-one on base case'],
    followUps: ['How does print-before vs print-after change order?', 'Convert to iteration with a for-loop'],
    interviewInsight: 'Understanding when work happens (descending vs ascending the stack) is the real lesson.',
    related: rel('printnt1singrcrsin', 'printnmntimssingrcrsin'),
  }),
);

blogs.push(
  base('printnt1singrcrsin', {
    tags: ['recursion'],
    pattern: 'recursion',
    problemStatement: 'Print numbers from N down to 1 using recursion.',
    example: 'N=4 → 4 3 2 1',
    intuition: 'Print N first, then solve N−1. Mirror of 1..N with print-after-recurse.',
    approaches: [
      {
        title: 'Print then recurse',
        idea: 'Base n<1; else print n and recurse n-1.',
        code: `def print_n_to_1(n: int) -> None:
    if n < 1:
        return
    print(n, end=" ")
    print_n_to_1(n - 1)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) stack',
        dryRun: 'n=3\\nprint 3; call 2\\nprint 2; call 1\\nprint 1; call 0',
      },
    ],
    complexity: { time: 'O(n)', space: 'O(n) recursion stack', recursionStack: 'O(n)' },
    commonMistakes: ['Swapping with 1..N accidentally', 'Missing base case'],
    followUps: ['Implement with print-after-recurse (trickier)', 'Iterative reverse range'],
    interviewInsight: 'Pair with 1..N to prove you control stack order, not copy-paste.',
    related: rel('print1tnsingrcrsin'),
  }),
);

blogs.push(
  base('smffirstnnmbrs', {
    tags: ['recursion', 'math'],
    pattern: 'recursion',
    problemStatement: 'Compute S(N) = 1+2+…+N. Show recursive thinking and the closed form.',
    example: 'N=5 → 15',
    intuition:
      'Recurrence: S(N)=N+S(N−1), S(0)=0. Also S(N)=N(N+1)/2 — interviewers expect both, and overflow notes for fixed-width ints.',
    approaches: [
      {
        title: 'Brute: loop',
        idea: 'Accumulate 1..N.',
        code: `def sum_n_loop(n: int) -> int:
    return sum(range(1, n + 1))`,
        language: 'python',
        time: 'O(n)',
        space: 'O(1)',
        flags: ['TLE'],
        limitations: ['Fine for teaching; O(n) unnecessary once formula is known'],
      },
      {
        title: 'Recursive recurrence',
        idea: 'S(n)=n+S(n-1).',
        code: `def sum_n_rec(n: int) -> int:
    if n <= 0:
        return 0
    return n + sum_n_rec(n - 1)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) stack',
        flags: ['RE', 'TLE'],
        limitations: ['Stack depth n — use formula in practice'],
      },
      {
        title: 'Optimal: closed form',
        idea: 'N(N+1)/2 — watch overflow in C++/Java (use 64-bit).',
        code: `def sum_n(n: int) -> int:
    return n * (n + 1) // 2`,
        language: 'python',
        time: 'O(1)',
        space: 'O(1)',
        whyWorks: 'Pair 1+(N), 2+(N−1), … → N/2 pairs each summing to N+1.',
      },
    ],
    complexity: { time: 'O(1) optimal', space: 'O(1) optimal; O(n) if recursive' },
    edgeCases: ['n=0', 'large n → overflow in 32-bit'],
    commonMistakes: ['Integer overflow on n*(n+1) before divide in C++', 'Calling recursive version O(1) space'],
    followUps: ['Sum of squares formula?', 'Modulo M version?', 'Prove formula by induction'],
    interviewInsight: 'Moving recurrence → closed form is the optimization story they want.',
    related: rel('fctrilfnnmbrs', 'timcmplxitylrnbsicsndthnnlysinnxtstps'),
    patternRecognition: ['Problems with simple linear recurrence often have closed forms'],
  }),
);

blogs.push(
  base('fctrilfnnmbrs', {
    tags: ['recursion', 'math'],
    pattern: 'recursion',
    problemStatement: 'Compute N! = 1·2·…·N (iterative and recursive).',
    example: 'N=5 → 120',
    intuition:
      'Recurrence: N! = N·(N−1)!, 0!=1. Values grow fast — mention overflow / big integers. Recursion depth N → RE for large N; iteration is safer.',
    approaches: [
      {
        title: 'Recursive',
        idea: 'Base 0/1 → 1; else n * fact(n-1).',
        code: `def factorial_rec(n: int) -> int:
    if n < 0:
        raise ValueError("n")
    if n <= 1:
        return 1
    return n * factorial_rec(n - 1)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) stack',
        flags: ['RE'],
      },
      {
        title: 'Optimal practical: iterative',
        idea: 'Multiply in a loop — O(1) auxiliary.',
        code: `def factorial(n: int) -> int:
    if n < 0:
        raise ValueError("n")
    ans = 1
    for i in range(2, n + 1):
        ans *= i
    return ans`,
        language: 'python',
        time: 'O(n)',
        space: 'O(1) auxiliary',
        dryRun: 'n=5: 1→2→6→24→120',
      },
    ],
    complexity: { time: 'O(n)', space: 'O(1) iterative; O(n) recursive stack', recursionStack: 'O(n) if recursive' },
    edgeCases: ['n=0', 'n=1', 'large n (big integers / overflow in C++)'],
    commonMistakes: ['Undefined negative factorial', 'Silent overflow in fixed-width ints', 'Deep recursion for large n'],
    followUps: ['n! mod p (p prime) — Wilson / factorial prefix?', 'Count trailing zeros of n!?', 'Stirling approximation?'],
    interviewInsight: 'Trailing zeros of n! is the classic follow-up — tests division by 5s, not multiplication loops.',
    related: rel('smffirstnnmbrs', 'fibnccinmbr'),
  }),
);

blogs.push(
  base('rvrsnrry', {
    tags: ['recursion', 'two-pointers', 'arrays'],
    pattern: 'two-pointers',
    problemStatement: 'Reverse an array in-place (iterative two pointers and recursive).',
    example: '[1,2,3,4] → [4,3,2,1]',
    intuition:
      'Swap ends and move inward. Recursive version: swap a[l],a[r] then recurse l+1,r−1. Same O(n) swaps; iterative uses O(1) aux, recursive uses O(n) stack.',
    approaches: [
      {
        title: 'Optimal: two pointers (iterative)',
        idea: 'l=0, r=n-1; swap while l<r.',
        code: `def reverse_array(a: list[int]) -> None:
    l, r = 0, len(a) - 1
    while l < r:
        a[l], a[r] = a[r], a[l]
        l += 1
        r -= 1`,
        language: 'python',
        time: 'O(n)',
        space: 'O(1) auxiliary',
        dryRun: '[1,2,3,4]\\nl=0,r=3 swap → [4,2,3,1]\\nl=1,r=2 swap → [4,3,2,1]\\nl=2,r=1 stop',
      },
      {
        title: 'Recursive two pointers',
        idea: 'Same invariant, expressed recursively.',
        code: `def reverse_array_rec(a: list[int], l: int = 0, r: int | None = None) -> None:
    if r is None:
        r = len(a) - 1
    if l >= r:
        return
    a[l], a[r] = a[r], a[l]
    reverse_array_rec(a, l + 1, r - 1)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) recursion stack',
        flags: ['RE'],
        limitations: ['Prefer iterative in production / large n'],
      },
    ],
    specialTechnique: {
      title: 'In-place O(1) extra space',
      body: 'Two-pointer swap modifies the input array without allocating another array. Distinguish auxiliary space O(1) from input space O(n).',
    },
    complexity: { time: 'O(n)', space: 'O(1) aux iterative; O(n) stack recursive' },
    edgeCases: ['Empty', 'Single element', 'Even/odd length'],
    commonMistakes: ['l <= r causing double-swap center', 'Building a new reversed list when in-place was required', 'Calling recursive stack O(1)'],
    patternRecognition: ['In-place rearrange by symmetric indices', 'Same pattern as palindrome check on arrays'],
    followUps: ['Reverse a subarray [L,R]?', 'Rotate array via reversals?', 'Reverse linked list connection?'],
    interviewInsight: 'State “O(1) auxiliary, in-place” explicitly — interviewers listen for that phrase.',
    related: rel('chckifstringisplindrmrnt', 'lftrttnrrybydplcs'),
  }),
);

blogs.push(
  base('chckifstringisplindrmrnt', {
    tags: ['recursion', 'two-pointers', 'strings'],
    pattern: 'two-pointers',
    problemStatement: 'Check if a string reads the same forwards and backwards.',
    example: '"aba" → true\\n"ab" → false',
    intuition:
      'Compare characters from both ends. Recursive: equal ends and middle is palindrome. Iterative two pointers is O(1) aux; recursion is O(n) stack.',
    approaches: [
      {
        title: 'Two pointers (optimal practical)',
        idea: 'l/r inward until mismatch.',
        code: `def is_palindrome(s: str) -> bool:
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True`,
        language: 'python',
        time: 'O(n)',
        space: 'O(1) auxiliary',
      },
      {
        title: 'Recursive',
        idea: 'Base l>=r; else s[l]==s[r] and rec(l+1,r-1).',
        code: `def is_palindrome_rec(s: str, l: int = 0, r: int | None = None) -> bool:
    if r is None:
        r = len(s) - 1
    if l >= r:
        return True
    if s[l] != s[r]:
        return False
    return is_palindrome_rec(s, l + 1, r - 1)`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) stack',
        flags: ['RE'],
      },
    ],
    complexity: { time: 'O(n)', space: 'O(1) aux iterative' },
    edgeCases: ['Empty string', 'Single char', 'Case sensitivity / non-alphanumerics if problem filters them'],
    commonMistakes: ['Not clarifying case/space rules', 's == s[::-1] without discussing O(n) extra copy'],
    followUps: [
      'Ignore non-alphanumeric (LC125)?',
      'Longest palindromic substring?',
      'Can you do it with recursion only as practice?',
    ],
    interviewInsight: 'Ask about case and allowed characters before coding — constraint clarification skill.',
    related: rel('rvrsnrry', 'chckplindrm'),
    patternRecognition: ['Symmetric comparison from ends → two pointers'],
  }),
);

blogs.push(
  base('fibnccinmbr', {
    tags: ['recursion', 'dp', 'memoization'],
    pattern: 'dynamic-programming',
    problemStatement: 'Compute the N-th Fibonacci number (define F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)).',
    example: 'N=6 → 8',
    intuition:
      'Naive recursion recomputes the same subproblems exponentially → TLE. Memoization / iterative DP makes it O(n). Space can drop to O(1) with two rolling variables.',
    approaches: [
      {
        title: 'Brute: naive recursion',
        idea: 'Direct recurrence — exponential tree.',
        code: `def fib_naive(n: int) -> int:
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)`,
        language: 'python',
        time: 'O(φ^n) ≈ exponential',
        space: 'O(n) stack',
        flags: ['TLE', 'RE'],
        limitations: ['TLE even for n~40–50'],
      },
      {
        title: 'Better: top-down memoization',
        idea: 'Cache F(i) after computing once.',
        code: `def fib_memo(n: int, memo: dict[int, int] | None = None) -> int:
    if memo is None:
        memo = {}
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]`,
        language: 'python',
        time: 'O(n)',
        space: 'O(n) memo + O(n) stack',
      },
      {
        title: 'Optimal practical: iterative O(1) space',
        idea: 'Keep only last two values.',
        code: `def fib(n: int) -> int:
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
        language: 'python',
        time: 'O(n)',
        space: 'O(1) auxiliary',
        dryRun: 'n=5: (0,1)→(1,1)→(1,2)→(2,3)→(3,5) → 5',
        whyWorks: 'Each step uses the recurrence; induction from base cases.',
      },
    ],
    specialTechnique: {
      title: 'Space optimization (rolling variables)',
      body: 'When dp[i] depends only on dp[i-1] and dp[i-2], store two scalars instead of an array — classic DP space trim.',
    },
    complexity: { time: 'O(n) optimal', space: 'O(1) optimal aux' },
    edgeCases: ['n=0', 'n=1', 'large n (big ints / overflow in C++)'],
    commonMistakes: ['Shipping naive recursion for n≥40', 'Off-by-one on definition F0/F1', 'Ignoring overflow in Java int'],
    patternRecognition: [
      'Overlapping subproblems + optimal substructure → DP',
      'Exponential recursion tree with repeated nodes → memoize',
    ],
    followUps: [
      'Matrix exponentiation O(log n)?',
      'F(n) mod M?',
      'Climbing stairs relation?',
    ],
    interviewInsight: 'This is the canonical “recursion → memo → iterative → space-opt” teaching problem. Walk that ladder out loud.',
    related: rel('fctrilfnnmbrs', 'smffirstnnmbrs'),
  }),
);

blogs.push(
  base('hshingthry', {
    tags: ['hashing', 'hashmap'],
    topicType: 'concept',
    pattern: 'hashing',
    problemStatement:
      'Understand hashing: map keys to indices for average O(1) insert/lookup/delete — foundation for frequency maps and interview hash tricks.',
    intuition:
      'A hash function spreads keys across buckets. Collisions are normal; chaining or open addressing resolves them. Average O(1) assumes a good hash + load factor; worst case can degrade (mention it, don’t panic).',
    approaches: [
      {
        title: 'Python dict as the interview hashmap',
        idea: 'dict/Counter give average O(1) ops. Know when to prefer sorting + two pointers instead (ordered needs / worst-case concerns).',
        code: `from collections import Counter

freq = Counter([1, 2, 1, 3, 2, 1])
print(freq[1])       # 3
print(1 in freq)     # True

# Manual frequency map
mp: dict[int, int] = {}
for x in [1, 2, 1]:
    mp[x] = mp.get(x, 0) + 1`,
        language: 'python',
        time: 'Average O(1) per op; building map O(n)',
        space: 'O(k) distinct keys',
        flags: ['MLE'],
        limitations: ['Huge key sets → MLE; pathological hashing rare in Python but discuss worst case'],
      },
    ],
    specialTechnique: {
      title: 'Average vs worst-case',
      body: 'Interviews: say “average O(1), worst-case O(n) with collisions.” For adversarial constraints, sorting O(n log n) can be safer. Load factor / resizing explains amortized cost.',
    },
    complexity: { time: 'Average O(1) ops', space: 'O(#keys)' },
    commonMistakes: [
      'Assuming worst-case O(1) always',
      'Using mutable keys',
      'Forgetting existence checks before indexing in some languages',
    ],
    patternRecognition: [
      'Need frequencies / seen-before / complements (Two Sum)',
      '“Have I met this state?” → hash set/map',
    ],
    followUps: [
      'Chaining vs open addressing?',
      'What is load factor?',
      'When use TreeMap/ordered map instead?',
    ],
    interviewInsight: 'Naming “average O(1)” and a collision caveat separates juniors from mid-levels.',
    related: rel('cntingfrqncisfrrylmnts', 'findthhighstlwstfrqncylmnt'),
  }),
);

blogs.push(
  base('cntingfrqncisfrrylmnts', {
    tags: ['hashing', 'arrays'],
    pattern: 'hashing',
    problemStatement: 'Count how many times each element appears in an array.',
    example: '[1,2,1,3,2,1] → 1:3, 2:2, 3:1',
    intuition:
      'One pass: for each value, increment a map. Brute nested counting is O(n²) → TLE for n=1e5.',
    approaches: [
      {
        title: 'Brute: for each index recount',
        idea: 'For every i, scan j to count matches — or count only when i is first occurrence.',
        code: `def frequencies_brute(a: list[int]) -> dict[int, int]:
    n = len(a)
    out: dict[int, int] = {}
    for i in range(n):
        if a[i] in out:
            continue
        cnt = 0
        for j in range(n):
            if a[j] == a[i]:
                cnt += 1
        out[a[i]] = cnt
    return out`,
        language: 'python',
        time: 'O(n²)',
        space: 'O(k)',
        flags: ['TLE'],
      },
      {
        title: 'Optimal: hash map',
        idea: 'Single pass Counter/dict.',
        code: `from collections import Counter

def frequencies(a: list[int]) -> dict[int, int]:
    return dict(Counter(a))`,
        language: 'python',
        time: 'O(n) average',
        space: 'O(k) distinct keys',
        dryRun: '[1,2,1]\\n{} → {1:1} → {1:1,2:1} → {1:2,2:1}',
      },
    ],
    complexity: { time: 'O(n)', space: 'O(k)' },
    edgeCases: ['Empty array', 'All equal', 'All unique'],
    commonMistakes: ['O(n²) nested loops on large n', 'Returning list of counts without mapping to values'],
    patternRecognition: ['“How many times does X appear?” → frequency map'],
    followUps: ['Top-K frequent elements?', 'Sort by frequency?', 'Stream / limited memory?'],
    interviewInsight: 'Always contrast O(n²) brute with O(n) hash — easy complexity win.',
    related: rel('hshingthry', 'findthhighstlwstfrqncylmnt'),
  }),
);

blogs.push(
  base('findthhighstlwstfrqncylmnt', {
    tags: ['hashing', 'arrays'],
    pattern: 'hashing',
    problemStatement: 'Find the element(s) with highest and lowest frequency in an array.',
    example: '[1,2,1,3,2,1] → highest freq element 1 (3), lowest 3 (1)',
    intuition:
      'Build frequencies first, then scan the map for max/min counts. Clarify tie-breaking (any? smallest value?).',
    approaches: [
      {
        title: 'Hash map + one scan of entries',
        idea: 'Counter, then track best high/low.',
        code: `from collections import Counter

def high_low_freq(a: list[int]) -> tuple[int, int]:
    if not a:
        raise ValueError("empty")
    freq = Counter(a)
    # tie-break: smaller value wins (explicit policy)
    high = min(((-c, v) for v, c in freq.items()))[1]
    low = min(((c, v) for v, c in freq.items()))[1]
    return high, low`,
        language: 'python',
        time: 'O(n)',
        space: 'O(k)',
        dryRun: 'freq={1:3,2:2,3:1} → high=1, low=3',
      },
    ],
    complexity: { time: 'O(n)', space: 'O(k)' },
    edgeCases: ['Single element', 'All frequencies equal', 'Ties for max/min'],
    commonMistakes: ['Unspecified tie-break', 'Scanning array again O(n²) after map built'],
    followUps: [
      'Return all elements with max frequency?',
      'What if we need stable order of first occurrence?',
      'Online updates (insert/delete)?',
    ],
    interviewInsight: 'Ask tie-break before coding — shows product/interview maturity.',
    related: rel('cntingfrqncisfrrylmnts', 'hshingthry'),
    patternRecognition: ['Aggregate then argmax/argmin on map values'],
  }),
);

// ---- Sorting ----
blogs.push(
  base('slctinsrt', {
    tags: ['sorting'],
    pattern: 'sorting',
    problemStatement: 'Sort an array using Selection Sort.',
    example: '[4,1,3,2] → [1,2,3,4]',
    intuition:
      'For position i, select the minimum in a[i..] and swap it into place. After i steps, a[0..i-1] is the smallest i elements in order.',
    approaches: [
      {
        title: 'Selection sort',
        idea: 'i from 0..n-2; find min index in i..n-1; swap with i.',
        algorithm: [
          'For i in 0..n-2:',
          '  min_idx = argmin(a[i..n-1])',
          '  swap a[i], a[min_idx]',
        ],
        code: `def selection_sort(a: list[int]) -> None:
    n = len(a)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j
        a[i], a[min_idx] = a[min_idx], a[i]`,
        language: 'python',
        time: 'O(n²) always',
        space: 'O(1) auxiliary',
        dryRun: '[4,1,3,2]\\ni=0 min=1 → [1,4,3,2]\\ni=1 min=2 → [1,2,3,4]\\ni=2 ok',
        whyWorks: 'Invariant: prefix a[0..i-1] holds the i smallest elements sorted.',
      },
    ],
    complexity: { time: 'O(n²)', space: 'O(1) aux' },
    edgeCases: ['Already sorted', 'Reverse sorted', 'Duplicates'],
    commonMistakes: ['Restarting min_idx wrong', 'Thinking it is adaptive / early-exit like bubble'],
    patternRecognition: ['Teaching sort; not used for n=1e5 (TLE)'],
    followUps: [
      'Number of swaps vs bubble?',
      'Stable? (no — equal elements can swap order)',
      'When is O(n²) with O(1) space acceptable?',
    ],
    interviewInsight: 'Know selection vs bubble vs insertion tradeoffs (swaps, stability, adaptive).',
    related: rel('bbblsrt', 'insrtinsrt', 'mrgsrt'),
    flagsNote: 'O(n²) → TLE for large n; interview teaching only',
  }),
);

blogs.push(
  base('bbblsrt', {
    tags: ['sorting'],
    pattern: 'sorting',
    problemStatement: 'Sort an array using Bubble Sort (with optimized early exit).',
    example: '[4,1,3,2] → [1,2,3,4]',
    intuition:
      'Repeatedly swap adjacent out-of-order pairs; each pass bubbles the next maximum to the end. If a pass does zero swaps, the array is sorted — early exit.',
    approaches: [
      {
        title: 'Bubble sort (optimized)',
        idea: 'n-1 passes; shrink unsorted suffix; break if no swaps.',
        code: `def bubble_sort(a: list[int]) -> None:
    n = len(a)
    for pass_i in range(n - 1):
        swapped = False
        for j in range(0, n - 1 - pass_i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break`,
        language: 'python',
        time: 'O(n²) worst / avg; O(n) best when already sorted',
        space: 'O(1) auxiliary',
        flags: ['TLE'],
        dryRun: '[4,1,3,2]\\npass: (1,4,3,2)→(1,3,4,2)→(1,3,2,4)\\nthen … → [1,2,3,4]',
        whyWorks: 'After k passes, the k largest elements are in the last k positions.',
      },
    ],
    complexity: { time: 'O(n²) worst; O(n) best with flag', space: 'O(1) aux' },
    edgeCases: ['Already sorted (should O(n) with flag)', 'Single element'],
    commonMistakes: ['Forgetting early-exit flag', 'Wrong j range causing index errors'],
    followUps: ['Is bubble stable? (yes)', 'Cocktail shaker sort?', 'Why never use in production?'],
    interviewInsight: 'Mention best-case O(n) with swap flag — shows you know adaptive behavior.',
    related: rel('slctinsrt', 'insrtinsrt', 'rcrsivbbblsrt'),
  }),
);

blogs.push(
  base('insrtinsrt', {
    tags: ['sorting'],
    pattern: 'sorting',
    problemStatement: 'Sort an array using Insertion Sort.',
    example: '[4,1,3,2] → [1,2,3,4]',
    intuition:
      'Maintain a sorted prefix. Take next element and insert it into the correct position by shifting larger elements right — like sorting cards in hand.',
    approaches: [
      {
        title: 'Insertion sort',
        idea: 'For i=1..n-1, insert a[i] into sorted a[0..i-1].',
        code: `def insertion_sort(a: list[int]) -> None:
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key`,
        language: 'python',
        time: 'O(n²) worst; O(n) best (already sorted)',
        space: 'O(1) auxiliary',
        flags: ['TLE'],
        dryRun: '[4,1,3,2]\\ni=1 key=1 → [1,4,3,2]\\ni=2 key=3 → [1,3,4,2]\\ni=3 key=2 → [1,2,3,4]',
        whyWorks: 'Invariant: a[0..i-1] sorted after step i.',
      },
    ],
    complexity: { time: 'O(n²) worst; O(n) best', space: 'O(1) aux' },
    edgeCases: ['Sorted input', 'Reverse sorted', 'Duplicates'],
    commonMistakes: ['Off-by-one when shifting', 'Using >= vs > and breaking stability'],
    followUps: [
      'Stable? (yes with > not >=)',
      'Why good for nearly sorted / small n?',
      'Binary insertion sort?',
    ],
    interviewInsight: 'Insertion is the practical O(n²) sort — adaptive + stable + good on nearly sorted data.',
    related: rel('bbblsrt', 'rcrsivinsrtinsrt', 'mrgsrt'),
  }),
);

blogs.push(
  base('mrgsrt', {
    tags: ['sorting', 'divide-conquer'],
    pattern: 'divide-and-conquer',
    problemStatement: 'Sort an array using Merge Sort.',
    example: '[4,1,3,2] → [1,2,3,4]',
    intuition:
      'Divide into halves, sort each, merge two sorted runs. Merge needs O(n) temporary space. Guarantees O(n log n) — no TLE from quadratic worst case.',
    approaches: [
      {
        title: 'Merge sort',
        idea: 'Recurse left/right; merge with two pointers into temp, copy back.',
        code: `def merge_sort(a: list[int]) -> None:
    def merge(lo: int, mid: int, hi: int) -> None:
        left = a[lo : mid + 1]
        right = a[mid + 1 : hi + 1]
        i = j = 0
        k = lo
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                a[k] = left[i]
                i += 1
            else:
                a[k] = right[j]
                j += 1
            k += 1
        while i < len(left):
            a[k] = left[i]
            i += 1
            k += 1
        while j < len(right):
            a[k] = right[j]
            j += 1
            k += 1

    def sort(lo: int, hi: int) -> None:
        if lo >= hi:
            return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid + 1, hi)
        merge(lo, mid, hi)

    if a:
        sort(0, len(a) - 1)`,
        language: 'python',
        time: 'O(n log n) always',
        space: 'O(n) auxiliary + O(log n) stack',
        spaceNote: 'Aux arrays O(n); recursion depth O(log n)',
        flags: ['MLE'],
        limitations: ['Extra O(n) memory — MLE risk if memory tight vs in-place quicksort'],
        whyWorks: 'Merge of two sorted lists is sorted; induction on divide-and-conquer tree.',
        dryRun: '[4,1,3,2] → sort [4,1] & [3,2] → [1,4],[2,3] → merge [1,2,3,4]',
      },
    ],
    specialTechnique: {
      title: 'Stable O(n log n) guarantee',
      body: 'Use <= in merge to keep stability. Prefer merge sort when you need stable sort or hard O(n log n) worst case (vs quicksort’s average).',
    },
    complexity: {
      time: 'O(n log n)',
      space: 'O(n) aux + O(log n) stack',
      recursionStack: 'O(log n)',
    },
    edgeCases: ['n≤1', 'Duplicates (stability)', 'Already sorted'],
    commonMistakes: ['Using < instead of <= (breaks stability)', 'Wrong mid / indices', 'Forgetting to copy leftovers'],
    patternRecognition: [
      'Divide & conquer sorting',
      'Count inversions — same merge framework',
    ],
    followUps: [
      'Count inversions during merge?',
      'Bottom-up merge sort?',
      'Why not always quicksort?',
    ],
    interviewInsight: 'Contrast with quicksort: merge = stable + worst O(n log n) + O(n) memory.',
    related: rel('qicksrt', 'insrtinsrt'),
  }),
);

blogs.push(
  base('rcrsivbbblsrt', {
    tags: ['sorting', 'recursion'],
    pattern: 'sorting',
    problemStatement: 'Implement Bubble Sort recursively.',
    intuition:
      'One recursive call = one bubble pass that places the next maximum at the end; then recurse on n−1. Same O(n²) — recursion is pedagogical, not an asymptotic win.',
    approaches: [
      {
        title: 'Recursive bubble',
        idea: 'Bubble pass on a[0..n-1], then recurse with n-1.',
        code: `def bubble_sort_rec(a: list[int], n: int | None = None) -> None:
    if n is None:
        n = len(a)
    if n <= 1:
        return
    for j in range(n - 1):
        if a[j] > a[j + 1]:
            a[j], a[j + 1] = a[j + 1], a[j]
    bubble_sort_rec(a, n - 1)`,
        language: 'python',
        time: 'O(n²)',
        space: 'O(n) recursion stack',
        flags: ['TLE', 'RE'],
        limitations: ['Worse constants than iterative; stack depth n'],
      },
    ],
    complexity: { time: 'O(n²)', space: 'O(n) stack', recursionStack: 'O(n)' },
    commonMistakes: ['Thinking recursion improves complexity', 'Forgetting to reduce n'],
    followUps: ['Add early-exit flag recursively?', 'Convert to iterative?'],
    interviewInsight: 'Show you can rewrite loops as recursion without changing big-O.',
    related: rel('bbblsrt', 'rcrsivinsrtinsrt'),
  }),
);

blogs.push(
  base('rcrsivinsrtinsrt', {
    tags: ['sorting', 'recursion'],
    pattern: 'sorting',
    problemStatement: 'Implement Insertion Sort recursively.',
    intuition:
      'Recursively sort a[0..n-2], then insert a[n-1] into the sorted prefix — same insertion step as iterative.',
    approaches: [
      {
        title: 'Recursive insertion',
        idea: 'sort(n-1) then insert last element leftward.',
        code: `def insertion_sort_rec(a: list[int], n: int | None = None) -> None:
    if n is None:
        n = len(a)
    if n <= 1:
        return
    insertion_sort_rec(a, n - 1)
    key = a[n - 1]
    j = n - 2
    while j >= 0 and a[j] > key:
        a[j + 1] = a[j]
        j -= 1
    a[j + 1] = key`,
        language: 'python',
        time: 'O(n²)',
        space: 'O(n) stack',
        flags: ['TLE', 'RE'],
      },
    ],
    complexity: { time: 'O(n²)', space: 'O(n) stack', recursionStack: 'O(n)' },
    commonMistakes: ['Inserting before recursive sort finishes', 'Index errors on j'],
    followUps: ['Tail recursion here?', 'Why insertion recurses naturally on prefixes?'],
    interviewInsight: 'Recursive insertion mirrors the inductive proof of correctness.',
    related: rel('insrtinsrt', 'rcrsivbbblsrt'),
  }),
);

blogs.push(
  base('qicksrt', {
    tags: ['sorting', 'divide-conquer'],
    pattern: 'divide-and-conquer',
    problemStatement: 'Sort an array using Quick Sort (Lomuto or Hoare partition).',
    example: '[4,1,3,2] → [1,2,3,4]',
    intuition:
      'Partition around a pivot: left ≤ pivot ≤ right (policy depends on scheme), then recurse. Average O(n log n), worst O(n²) on bad pivots (sorted array + poor pivot) → TLE risk; randomize or use median-of-three. In-place: O(log n) stack average.',
    approaches: [
      {
        title: 'Quick sort (Lomuto partition)',
        idea: 'Pivot = last element; grow ≤ region with i; recurse.',
        code: `def quick_sort(a: list[int]) -> None:
    def partition(lo: int, hi: int) -> int:
        pivot = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] <= pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        return i

    def sort(lo: int, hi: int) -> None:
        if lo >= hi:
            return
        p = partition(lo, hi)
        sort(lo, p - 1)
        sort(p + 1, hi)

    if a:
        sort(0, len(a) - 1)`,
        language: 'python',
        time: 'Average O(n log n); worst O(n²)',
        space: 'O(log n) avg stack; O(n) worst stack',
        flags: ['TLE', 'RE'],
        limitations: ['Sorted input + last-element pivot → worst O(n²) TLE; randomize pivot in interviews'],
        dryRun: '[3,1,4,2] pivot 2 → partition ≈ [1,2,4,3] then sort sides',
        whyWorks: 'After partition, pivot is in final sorted index; recurse on independent sides.',
      },
    ],
    specialTechnique: {
      title: 'Avoiding worst-case TLE',
      body: 'Random pivot or median-of-three. For guaranteed O(n log n), use mergesort / heapsort / library sort (introsort). Mention 3-way partition for many duplicates.',
    },
    complexity: {
      time: 'Avg O(n log n); worst O(n²)',
      space: 'Avg O(log n) stack',
      recursionStack: 'O(log n) avg; O(n) worst',
    },
    edgeCases: ['Already sorted', 'All equal', 'n≤1'],
    commonMistakes: [
      'Ignoring worst-case on sorted data',
      'Off-by-one in partition',
      'Claiming O(1) space (forget stack)',
    ],
    patternRecognition: [
      'In-place divide-and-conquer',
      'Quickselect uses same partition for k-th element',
    ],
    followUps: [
      'Hoare vs Lomuto?',
      'Quickselect for k-th largest?',
      '3-way partition for duplicates?',
      'Why standard libraries use introsort?',
    ],
    interviewInsight: 'Must discuss average vs worst case and pivot strategy — otherwise you look shallow.',
    related: rel('mrgsrt', 'slctinsrt'),
  }),
);

for (const blog of blogs) {
  fs.writeFileSync(path.join(outDir, `${blog.id}.json`), JSON.stringify(blog, null, 2) + '\n');
  progress.byId[blog.id] = {
    topicNumber: blog.topicNumber,
    status: 'reviewed',
    batch: 2,
    quality: 'reviewed',
  };
  const invTopic = byId[blog.id];
  if (invTopic) {
    invTopic.status = 'reviewed';
    invTopic.batch = 2;
  }
}

progress.reviewed = Object.values(progress.byId).filter((x) => x.status === 'reviewed').length;
progress.pending = progress.total - progress.reviewed;
progress.needsReview = progress.needsReview || 0;
progress.lastBatch = { id: 2, count: blogs.length, topicNumbers: blogs.map((b) => b.topicNumber) };
fs.writeFileSync(path.join(root, 'src/sheets/dsa/content/blogProgress.json'), JSON.stringify(progress, null, 2));
fs.writeFileSync(path.join(root, 'src/sheets/dsa/content/topicInventory.json'), JSON.stringify(inv, null, 2));

console.log(`Batch 2 wrote ${blogs.length} reviewed blogs:`);
console.log(blogs.map((b) => `#${b.topicNumber} ${b.id}`).join('\n'));
console.log(`Progress: ${progress.reviewed}/${progress.total} reviewed`);
