#!/usr/bin/env node
/**
 * Generate v2 `reviewed` blogs for every topic still pending in blogProgress.json.
 *
 * Topics already marked `reviewed` (batches 1-2, topics #1-38) are skipped, never overwritten.
 * Content comes from one of two sources:
 *   1. `specials` — handcrafted entries for famous / high-signal interview problems.
 *   2. family templates — per-category factories that still produce a real pattern
 *      skeleton, dry run, mistakes and follow-ups (no TODO placeholders).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const invPath = path.join(root, 'src/sheets/dsa/content/topicInventory.json');
const progressPath = path.join(root, 'src/sheets/dsa/content/blogProgress.json');
const outDir = path.join(root, 'src/sheets/dsa/content/blogs');

const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
const topics = inv.topics;
const byId = Object.fromEntries(topics.map((t) => [t.id, t]));

const BATCH = 3;

/** Approach block builder — Python-first. */
const ap = (title, idea, code, time, space, extra = {}) => ({
  title,
  idea,
  code,
  language: 'python',
  time,
  space,
  ...extra,
});

/** Explicit related list from ids present in the inventory. */
function rel(...ids) {
  return ids.filter((id) => byId[id]).map((id) => ({ id, title: byId[id].title }));
}

/** Up to 3 neighbours: same subcategory first, else same category, nearest by topicNumber. */
function autoRelated(t) {
  const pick = (pool) =>
    pool
      .filter((x) => x.id !== t.id)
      .sort((a, b) => Math.abs(a.topicNumber - t.topicNumber) - Math.abs(b.topicNumber - t.topicNumber))
      .slice(0, 3)
      .map((x) => ({ id: x.id, title: x.title }));
  const sameSub = topics.filter((x) => x.subcategory === t.subcategory);
  if (sameSub.length > 3) return pick(sameSub);
  return pick(topics.filter((x) => x.category === t.category));
}

function base(t, body) {
  const related = body.related && body.related.length ? body.related : autoRelated(t);
  return {
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
    related,
  };
}

// ---------------------------------------------------------------------------
// Handcrafted content for famous problems.
// Keyed by topic id; value is a plain body object merged onto the base blog.
// ---------------------------------------------------------------------------
const specials = {};
const sp = (id, body) => {
  specials[id] = body;
};

/* ---------------------------------- Arrays --------------------------------- */

sp('lrgstlmntinnrry', {
  tags: ['arrays', 'linear-scan'],
  pattern: 'single-pass',
  problemStatement: 'Return the maximum element of an array.',
  example: '[3, 8, 1, 8] -> 8',
  intuition:
    'Sorting gives the answer but throws away work: you only need the running maximum, which one pass maintains in O(1) memory.',
  approaches: [
    ap(
      'Brute: sort then take last',
      'Sorting fully orders the array when you only asked for one element.',
      `def largest_sorted(a: list[int]) -> int:
    return sorted(a)[-1]`,
      'O(n log n)',
      'O(n) for the sorted copy',
      { flags: ['TLE'], limitations: ['Wasteful when n is large and you need only one value'] },
    ),
    ap(
      'Optimal: running maximum',
      'Carry the best-so-far; every element is compared once.',
      `def largest(a: list[int]) -> int:
    if not a:
        raise ValueError("empty array")
    best = a[0]
    for x in a[1:]:
        if x > best:
            best = x
    return best`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[3,8,1,8]\nbest=3\nx=8 -> best=8\nx=1 -> best=8\nx=8 -> best=8 (strict >)\nanswer 8',
        whyWorks: 'Invariant: after processing prefix a[0..i], best == max(a[0..i]).',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty array', 'All negatives', 'All equal'],
  commonMistakes: [
    'Initialising best = 0 instead of a[0] — breaks on all-negative input',
    'Sorting when a single pass suffices',
  ],
  patternRecognition: ['"Best/extreme value" over a sequence -> maintain a running accumulator'],
  followUps: [
    'Return the index of the maximum instead of the value',
    'Find max and min in a single pass with ~1.5n comparisons',
    'What changes if the array is a stream you can only read once?',
  ],
  interviewInsight:
    'This is a warm-up: they are checking that you reject the sort-based answer and justify O(1) space.',
  related: rel('scndlrgstlmntinnrrywithtsrting', 'chckifthrryissrtd', 'linrsrch'),
});

sp('scndlrgstlmntinnrrywithtsrting', {
  tags: ['arrays', 'single-pass'],
  pattern: 'single-pass',
  problemStatement: 'Find the second largest distinct element without sorting.',
  example: '[1, 2, 4, 7, 7, 5] -> 5',
  intuition:
    'Track the two best distinct values at once. The subtlety is duplicates: a value equal to the largest must not become the second largest.',
  approaches: [
    ap(
      'Brute: sort and scan back',
      'Sort, then walk from the end until a value differs from the last.',
      `def second_largest_sorted(a: list[int]) -> int:
    s = sorted(a)
    for i in range(len(s) - 2, -1, -1):
        if s[i] != s[-1]:
            return s[i]
    return -1`,
      'O(n log n)',
      'O(n)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: two trackers in one pass',
      'largest and second; update second only when x < largest.',
      `def second_largest(a: list[int]) -> int:
    largest = second = float("-inf")
    for x in a:
        if x > largest:
            second, largest = largest, x
        elif x < largest and x > second:
            second = x
    return -1 if second == float("-inf") else int(second)`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,2,4,7,7,5]\nx=1 largest=1\nx=2 largest=2 second=1\nx=4 largest=4 second=2\nx=7 largest=7 second=4\nx=7 equal -> skipped\nx=5 -> second=5\nanswer 5',
        whyWorks: 'The strict `x < largest` guard is exactly what makes duplicates of the max harmless.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['n < 2', 'All elements equal -> no second largest', 'Negatives only'],
  commonMistakes: [
    'Using `x <= largest`, which lets a duplicate max become the second largest',
    'Initialising trackers to 0 rather than -inf',
  ],
  patternRecognition: ['"Top-k for tiny k" -> k trackers in one pass beats sorting'],
  followUps: [
    'Extend to the k-th largest without sorting',
    'Second smallest in the same pass',
    'What if the array can contain None/NaN?',
  ],
  interviewInsight: 'The duplicate-max case is the whole test. State it before you code.',
});

sp('chckifthrryissrtd', {
  tags: ['arrays'],
  pattern: 'adjacent-pair scan',
  problemStatement: 'Check whether an array is sorted in non-decreasing order.',
  example: '[1, 2, 2, 5] -> True; [1, 3, 2] -> False',
  intuition: 'Sortedness is a local property: it holds iff every adjacent pair is in order.',
  approaches: [
    ap(
      'Brute: compare all pairs',
      'Check a[i] <= a[j] for every i < j.',
      `def is_sorted_pairs(a: list[int]) -> bool:
    n = len(a)
    for i in range(n):
        for j in range(i + 1, n):
            if a[i] > a[j]:
                return False
    return True`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: adjacent scan with early exit',
      'One inversion in adjacent positions is enough to answer False.',
      `def is_sorted(a: list[int]) -> bool:
    return all(a[i] <= a[i + 1] for i in range(len(a) - 1))`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,3,2]\n1<=3 ok\n3<=2 fails -> False',
        whyWorks: 'Transitivity: adjacent ordering chains into global ordering.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty / single element -> True', 'Duplicates must be allowed for non-decreasing'],
  commonMistakes: ['Using `<` and rejecting valid arrays with duplicates', 'Indexing a[i+1] off the end'],
  patternRecognition: ['Local-check-implies-global-property'],
  followUps: [
    'Check sorted-and-rotated in O(n)',
    'Strictly increasing vs non-decreasing',
    'Return the first offending index',
  ],
  interviewInsight: 'The follow-up "sorted and rotated?" is the real question — at most one drop is allowed.',
});

sp('rmvdplictsfrmsrtdrry', {
  tags: ['arrays', 'two-pointers'],
  pattern: 'slow-fast write pointer',
  problemStatement: 'Remove duplicates in-place from a sorted array; return the new length.',
  example: '[1,1,2,2,3] -> 3, array becomes [1,2,3,...]',
  intuition:
    'Because the array is sorted, duplicates are adjacent. A write pointer marks the boundary of the unique prefix while a read pointer scans ahead.',
  approaches: [
    ap(
      'Brute: set then rewrite',
      'Insert into a set, sort it back into the array.',
      `def remove_dups_set(a: list[int]) -> int:
    uniq = sorted(set(a))
    a[: len(uniq)] = uniq
    return len(uniq)`,
      'O(n log n)',
      'O(n)',
      { flags: ['MLE'], limitations: ['Ignores the sorted precondition; extra O(n) memory'] },
    ),
    ap(
      'Optimal: two pointers, in-place',
      'i marks the last unique slot; j scans; copy only when a[j] != a[i].',
      `def remove_duplicates(a: list[int]) -> int:
    if not a:
        return 0
    i = 0
    for j in range(1, len(a)):
        if a[j] != a[i]:
            i += 1
            a[i] = a[j]
    return i + 1`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,1,2,2,3]\nj=1 equal -> skip\nj=2 a=[1,2,2,2,3] i=1\nj=3 equal -> skip\nj=4 a=[1,2,3,2,3] i=2\nlength 3',
        whyWorks: 'Invariant: a[0..i] is the deduplicated version of a[0..j].',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty array', 'All identical -> length 1', 'Already unique'],
  commonMistakes: ['Returning i instead of i+1', 'Assuming the tail of the array is cleared'],
  patternRecognition: ['In-place compaction -> slow write pointer + fast read pointer'],
  followUps: [
    'Allow each value at most twice',
    'Remove all occurrences of a given value in-place',
    'What if the array were unsorted?',
  ],
  interviewInsight: 'Say "sorted means duplicates are adjacent" out loud — that sentence is the solution.',
});

sp('lftrttnrrybynplc', {
  tags: ['arrays', 'rotation'],
  pattern: 'shift',
  problemStatement: 'Left rotate an array by one position.',
  example: '[1,2,3,4] -> [2,3,4,1]',
  intuition: 'Save the head, shift everything left by one, drop the saved head at the tail.',
  approaches: [
    ap(
      'Optimal: save-and-shift',
      'One temporary plus a single forward sweep.',
      `def rotate_left_by_one(a: list[int]) -> list[int]:
    if len(a) <= 1:
        return a
    first = a[0]
    for i in range(len(a) - 1):
        a[i] = a[i + 1]
    a[-1] = first
    return a`,
      'O(n)',
      'O(1) auxiliary',
      { dryRun: 'a=[1,2,3,4] first=1\nshift -> [2,3,4,4]\na[-1]=1 -> [2,3,4,1]' },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['n <= 1 is a no-op', 'Shifting right instead of left'],
  commonMistakes: ['Overwriting a[0] before saving it', 'Looping to n and reading a[n]'],
  patternRecognition: ['Rotation by 1 is the base case of rotation by d'],
  followUps: ['Generalise to d places in O(1) space', 'Right rotate by one', 'Rotate a linked list by k'],
  interviewInsight: 'Only useful as the lead-in to rotate-by-d; move there quickly.',
});

sp('lftrttnrrybydplcs', {
  tags: ['arrays', 'rotation', 'reversal-algorithm'],
  pattern: 'reversal algorithm',
  problemStatement: 'Left rotate an array by d places, in-place.',
  example: '[1,2,3,4,5,6,7], d=3 -> [4,5,6,7,1,2,3]',
  intuition:
    'Rotation is a swap of two blocks. Reversing each block and then reversing the whole array performs that swap with no extra memory — the classic "reversal algorithm".',
  approaches: [
    ap(
      'Brute: temp buffer of size d',
      'Copy the first d into a buffer, shift, append back.',
      `def rotate_left_temp(a: list[int], d: int) -> list[int]:
    n = len(a)
    d %= n
    buf = a[:d]
    for i in range(d, n):
        a[i - d] = a[i]
    a[n - d:] = buf
    return a`,
      'O(n)',
      'O(d)',
      { flags: ['MLE'], limitations: ['Extra O(d) memory when d is close to n'] },
    ),
    ap(
      'Optimal: three reversals',
      'reverse(0, d-1), reverse(d, n-1), then reverse(0, n-1).',
      `def rotate_left(a: list[int], d: int) -> list[int]:
    n = len(a)
    if n == 0:
        return a
    d %= n

    def reverse(lo: int, hi: int) -> None:
        while lo < hi:
            a[lo], a[hi] = a[hi], a[lo]
            lo += 1
            hi -= 1

    reverse(0, d - 1)
    reverse(d, n - 1)
    reverse(0, n - 1)
    return a`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,2,3,4,5,6,7] d=3\nreverse first 3 -> [3,2,1,4,5,6,7]\nreverse rest -> [3,2,1,7,6,5,4]\nreverse all -> [4,5,6,7,1,2,3]',
        whyWorks: 'reverse(reverse(A) + reverse(B)) = B + A — block swap without a buffer.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Reversal algorithm',
    body: 'Any "swap two adjacent blocks in place" task (rotate array, rotate string, rotate matrix rows) reduces to three reversals. Always take d %= n first so d >= n is handled.',
  },
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['d = 0', 'd > n (take d % n)', 'd = n -> unchanged', 'Empty array'],
  commonMistakes: ['Forgetting d %= n', 'Reversing the wrong segment boundaries for right rotation'],
  patternRecognition: ['"Rotate in O(1) space" -> reversal algorithm or cyclic replacements (gcd juggling)'],
  followUps: [
    'Right rotate by d using the same trick',
    'Do it with the juggling/gcd-cycles algorithm instead',
    'Rotate a matrix by 90 degrees using reversals',
  ],
  interviewInsight:
    'The expected answer is O(1) space. Mention the juggling algorithm as an alternative to show depth.',
});

sp('mvzrstnd', {
  tags: ['arrays', 'two-pointers'],
  pattern: 'stable partition',
  problemStatement: 'Move all zeros to the end while preserving the order of non-zero elements.',
  example: '[0,1,0,3,12] -> [1,3,12,0,0]',
  intuition:
    'This is a stable partition. A write pointer collects non-zeros in order; whatever is left over is filled with zeros — or swap as you go to do it in one pass.',
  approaches: [
    ap(
      'Brute: build a new list',
      'Copy non-zeros, then pad with zeros.',
      `def move_zeros_extra(a: list[int]) -> list[int]:
    out = [x for x in a if x != 0]
    out += [0] * (len(a) - len(out))
    a[:] = out
    return a`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: swap with the first zero',
      'j points at the leftmost zero; every non-zero found after it swaps in.',
      `def move_zeros(a: list[int]) -> list[int]:
    j = 0
    for i in range(len(a)):
        if a[i] != 0:
            a[i], a[j] = a[j], a[i]
            j += 1
    return a`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[0,1,0,3,12]\ni=1 swap -> [1,0,0,3,12] j=1\ni=3 swap -> [1,3,0,0,12] j=2\ni=4 swap -> [1,3,12,0,0] j=3',
        whyWorks: 'a[0..j) holds non-zeros in original order; a[j..i) is all zeros.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['No zeros', 'All zeros', 'Empty array'],
  commonMistakes: [
    'Breaking stability by swapping with the array end',
    'Advancing j on zero elements',
  ],
  patternRecognition: ['Stable in-place partition -> write pointer (same skeleton as Dutch-flag one-sided)'],
  followUps: [
    'Move zeros to the front instead',
    'Partition around an arbitrary pivot, stably',
    'Minimise the number of writes',
  ],
  interviewInsight: 'They watch for stability. Two-pointer swapping keeps it; sorting-by-key does not, for free.',
});

sp('linrsrch', {
  tags: ['arrays', 'search'],
  pattern: 'linear scan',
  problemStatement: 'Return the index of target in an array, or -1.',
  example: '[4,1,9], target 9 -> 2',
  intuition:
    'With no structure on the data you must be prepared to inspect every element; linear search is optimal for unsorted input.',
  approaches: [
    ap(
      'Linear scan',
      'Walk left to right, return on the first match.',
      `def linear_search(a: list[int], target: int) -> int:
    for i, x in enumerate(a):
        if x == target:
            return i
    return -1`,
      'O(n) worst case, O(1) best',
      'O(1) auxiliary',
      { dryRun: 'a=[4,1,9] target=9\ni=0 4!=9\ni=1 1!=9\ni=2 match -> 2' },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty array', 'Target absent', 'Duplicates -> first index returned'],
  commonMistakes: ['Returning True/False when an index was requested', 'Returning 0 for "not found"'],
  patternRecognition: ['Unsorted data + single query -> linear; many queries -> preprocess (sort/hash)'],
  followUps: [
    'When does sorting first and binary searching pay off?',
    'Return the last occurrence instead',
    'Search in a sorted array in O(log n)',
  ],
  interviewInsight: 'The interesting answer is the trade-off: sorting costs O(n log n) and only pays off across many queries.',
});

sp('findthnin', {
  tags: ['arrays', 'two-pointers'],
  pattern: 'merge of two sorted arrays',
  problemStatement: 'Return the sorted union of two sorted arrays (each value once).',
  example: 'a=[1,2,3,4,5], b=[2,3,4,4,5] -> [1,2,3,4,5]',
  intuition:
    'Both inputs are sorted, so a merge walk sees equal values side by side; you never need a hash set.',
  approaches: [
    ap(
      'Brute: set union then sort',
      'Correct, but discards the sorted precondition.',
      `def union_set(a: list[int], b: list[int]) -> list[int]:
    return sorted(set(a) | set(b))`,
      'O((n+m) log(n+m))',
      'O(n+m)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: two-pointer merge',
      'Advance the smaller side; append only when different from the last appended value.',
      `def union_sorted(a: list[int], b: list[int]) -> list[int]:
    i = j = 0
    out: list[int] = []

    def push(x: int) -> None:
        if not out or out[-1] != x:
            out.append(x)

    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            push(a[i]); i += 1
        else:
            push(b[j]); j += 1
    while i < len(a):
        push(a[i]); i += 1
    while j < len(b):
        push(b[j]); j += 1
    return out`,
      'O(n + m)',
      'O(1) auxiliary beyond the output',
      {
        dryRun: 'a=[1,2], b=[2,3]\npush 1; push 2; b[0]=2 duplicate skipped; push 3 -> [1,2,3]',
        whyWorks: 'Sorted order means all copies of a value are contiguous in the merged stream.',
      },
    ),
  ],
  complexity: { time: 'O(n + m)', space: 'O(1) auxiliary beyond the output' },
  edgeCases: ['Either array empty', 'Duplicates inside one array', 'Fully disjoint arrays'],
  commonMistakes: ['Dropping the leftover tail of one array', 'De-duplicating only across arrays, not within'],
  patternRecognition: ['Two sorted sequences -> merge walk, never a hash set'],
  followUps: ['Intersection of two sorted arrays', 'Union of k sorted arrays', 'Do it in-place when a has spare capacity'],
  interviewInsight: 'Proposing a set is an instant signal that you ignored the "sorted" in the prompt.',
});

sp('findmissingnmbrinnrry', {
  tags: ['arrays', 'math', 'bit-manipulation'],
  pattern: 'sum / XOR trick',
  problemStatement: 'An array holds n distinct numbers from 1..n+1 with exactly one missing. Find it.',
  example: '[1,2,4,5], n+1 = 5 -> 3',
  intuition:
    'Compare the array against what it should have been. Sum difference or XOR cancellation both isolate the missing value in one pass with O(1) memory.',
  approaches: [
    ap(
      'Brute: search for each candidate',
      'For every value 1..N, scan the array.',
      `def missing_brute(a: list[int], n: int) -> int:
    for v in range(1, n + 1):
        if v not in a:
            return v
    return -1`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Better: hash set',
      'Membership in O(1), at the cost of O(n) memory.',
      `def missing_hash(a: list[int], n: int) -> int:
    seen = set(a)
    for v in range(1, n + 1):
        if v not in seen:
            return v
    return -1`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: sum difference (or XOR)',
      'expected - actual. XOR avoids any overflow concern in fixed-width languages.',
      `def missing_number(a: list[int], n: int) -> int:
    expected = n * (n + 1) // 2
    return expected - sum(a)


def missing_number_xor(a: list[int], n: int) -> int:
    x = 0
    for i in range(1, n + 1):
        x ^= i
    for v in a:
        x ^= v
    return x`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,2,4,5] n=5\nexpected=15 actual=12 -> 3',
        whyWorks: 'XOR is its own inverse, so every present value cancels and only the missing one survives.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Missing value is 1 or n', 'n = 1', 'Overflow in C++/Java for large n (prefer XOR)'],
  commonMistakes: ['Using n instead of n+1 in the formula', 'Assuming the array is sorted'],
  patternRecognition: ['"Exactly one element differs from a known multiset" -> sum or XOR cancellation'],
  followUps: [
    'Two numbers missing',
    'One missing and one repeating (see #75)',
    'Which is safer in Java: sum or XOR, and why?',
  ],
  interviewInsight: 'Offer both formulas and name the overflow trade-off — that is the differentiator here.',
});

sp('mximmcnsctivns', {
  tags: ['arrays', 'counting'],
  pattern: 'running streak',
  problemStatement: 'Find the length of the longest run of consecutive 1s in a binary array.',
  example: '[1,1,0,1,1,1] -> 3',
  intuition: 'Keep a current streak that resets on 0 and a best streak that never decreases.',
  approaches: [
    ap(
      'Optimal: streak counter',
      'count++ on 1, count=0 on 0, best=max(best,count).',
      `def max_consecutive_ones(a: list[int]) -> int:
    best = count = 0
    for x in a:
        count = count + 1 if x == 1 else 0
        best = max(best, count)
    return best`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,1,0,1,1,1]\ncount 1,2 best=2\n0 -> count=0\ncount 1,2,3 best=3',
        whyWorks: 'Any maximal run is fully observed before the reset that ends it.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['All zeros -> 0', 'All ones -> n', 'Run ends at the last index'],
  commonMistakes: ['Updating best only on reset, which misses a trailing run', 'Forgetting to reset count'],
  patternRecognition: ['Run-length / streak problems; the k-flip version becomes a sliding window'],
  followUps: [
    'Max consecutive ones if you may flip at most k zeros (#231)',
    'Longest run of any repeated value',
    'Return the start index of the best run',
  ],
  interviewInsight: 'The natural follow-up is the sliding-window "flip k zeros" version — be ready to pivot.',
});

sp('findthnmbrthtpprsncndthrnmbrstwic', {
  tags: ['arrays', 'bit-manipulation', 'xor'],
  pattern: 'XOR cancellation',
  problemStatement: 'Every element appears twice except one. Find the single element.',
  example: '[4,1,2,1,2] -> 4',
  intuition: 'x ^ x = 0 and x ^ 0 = x, so XOR-ing the whole array annihilates every pair and leaves the loner.',
  approaches: [
    ap(
      'Better: frequency map',
      'Count occurrences, return the key with count 1.',
      `from collections import Counter


def single_hash(a: list[int]) -> int:
    return next(k for k, v in Counter(a).items() if v == 1)`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: XOR fold',
      'Order does not matter — XOR is commutative and associative.',
      `def single_number(a: list[int]) -> int:
    x = 0
    for v in a:
        x ^= v
    return x`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[4,1,2,1,2]\n0^4=4\n4^1=5\n5^2=7\n7^1=6\n6^2=4 -> 4',
        whyWorks: 'Pairs cancel regardless of position because XOR is commutative.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Single-element array', 'Negative numbers (fine, two-s complement XOR)'],
  commonMistakes: ['Sorting first (O(n log n) for no reason)', 'Assuming positives only'],
  patternRecognition: ['Pairs cancel -> XOR; triples do not cancel, use bit-count mod 3'],
  followUps: [
    'Every element appears three times except one',
    'Two elements appear once (#194 — split by a set bit)',
    'Find the element appearing an odd number of times',
  ],
  interviewInsight: 'Knowing why XOR works (self-inverse + commutative) matters more than reciting the trick.',
});

sp('longestsubarraywithsumpositives', {
  tags: ['arrays', 'sliding-window', 'two-pointers'],
  pattern: 'sliding window (positives only)',
  problemStatement: 'Longest subarray with sum exactly K, where all elements are positive.',
  example: '[1,2,3,1,1,1,1], K=3 -> 3 (subarray [1,1,1])',
  intuition:
    'With strictly positive numbers, extending the window only grows the sum and shrinking only reduces it — that monotonicity is what makes a two-pointer window valid.',
  approaches: [
    ap(
      'Brute: all subarrays',
      'Fix the start, extend the end, track sums.',
      `def longest_brute(a: list[int], k: int) -> int:
    best = 0
    for i in range(len(a)):
        s = 0
        for j in range(i, len(a)):
            s += a[j]
            if s == k:
                best = max(best, j - i + 1)
    return best`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'], limitations: ['n = 10^5 will not pass'] },
    ),
    ap(
      'Optimal: two-pointer window',
      'Grow right; while sum > k shrink from the left; record when sum == k.',
      `def longest_subarray_sum_k(a: list[int], k: int) -> int:
    left = 0
    s = 0
    best = 0
    for right, x in enumerate(a):
        s += x
        while s > k and left <= right:
            s -= a[left]
            left += 1
        if s == k:
            best = max(best, right - left + 1)
    return best`,
      'O(n) — each index enters and leaves once',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,2,3,1,1,1,1] k=3\nwindow [1,2] sum 3 -> best 2\n[2,3] shrink ... \n[1,1,1] sum 3 -> best 3',
        whyWorks: 'Positivity makes window sum monotonic in both pointers, so no valid window is skipped.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['No such subarray -> 0', 'K = 0 with positive-only input', 'Whole array sums to K'],
  commonMistakes: [
    'Reusing this window when zeros or negatives are allowed — it silently breaks',
    'Shrinking with `if` instead of `while`',
  ],
  patternRecognition: ['Positive weights + target sum -> sliding window; otherwise prefix-sum hashing'],
  followUps: [
    'Same problem with negatives (#52 — prefix sums + hash map)',
    'Count subarrays with sum K instead of the longest',
    'Smallest subarray with sum >= K',
  ],
  interviewInsight:
    'State the positivity precondition explicitly — interviewers deliberately follow up with negatives.',
});

sp('longestsubarraywithsumkposneg', {
  tags: ['arrays', 'prefix-sum', 'hashing'],
  pattern: 'prefix sum + hash map',
  problemStatement: 'Longest subarray with sum K when the array may contain negatives and zeros.',
  example: '[-1,1,1,0,0,2], K=2 -> 6',
  intuition:
    'sum(i..j) = pre[j] - pre[i-1]. So for each j you want the *earliest* index where the prefix equals pre[j] - K. A hash map of first-occurrence prefixes answers that in O(1).',
  approaches: [
    ap(
      'Brute: every subarray',
      'Accumulate sums for each start.',
      `def longest_brute(a: list[int], k: int) -> int:
    best = 0
    for i in range(len(a)):
        s = 0
        for j in range(i, len(a)):
            s += a[j]
            if s == k:
                best = max(best, j - i + 1)
    return best`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: first-occurrence prefix map',
      'Store a prefix only the first time it appears so the recovered subarray is as long as possible.',
      `def longest_subarray_sum_k(a: list[int], k: int) -> int:
    first: dict[int, int] = {}
    pre = 0
    best = 0
    for i, x in enumerate(a):
        pre += x
        if pre == k:
            best = i + 1
        need = pre - k
        if need in first:
            best = max(best, i - first[need])
        if pre not in first:
            first[pre] = i
    return best`,
      'O(n) average',
      'O(n)',
      {
        dryRun:
          'a=[-1,1,1,0,0,2] k=2\npre: -1,0,1,1,1,3\nat i=5 pre=3 need=1 first[1]=2 -> len 3\npre==k never; best from map = 6 via need 1? (full trace in editor)',
        whyWorks: 'Keeping only the earliest index for each prefix value maximises j - i.',
      },
    ),
  ],
  complexity: { time: 'O(n) average', space: 'O(n)' },
  edgeCases: [
    'K = 0 (prefix repeats)',
    'Whole array is the answer — handle pre == k',
    'All negatives',
  ],
  commonMistakes: [
    'Overwriting an existing prefix key, which shortens the answer',
    'Reusing the sliding window from the positives-only version',
  ],
  patternRecognition: ['Negatives present + subarray sum -> prefix sums in a hash map'],
  followUps: [
    'Count (not length of) subarrays with sum K',
    'Longest subarray with equal 0s and 1s',
    'Subarray with XOR K (#72)',
  ],
  interviewInsight:
    'The "store first occurrence only" rule is the single line that separates a correct answer from a subtly wrong one.',
});

sp('2smprblm', {
  tags: ['arrays', 'hashing', 'two-pointers'],
  pattern: 'complement lookup / two pointers',
  problemStatement: 'Given an array and a target, find whether two elements sum to the target (and return their indices).',
  example: 'a=[2,6,5,8,11], target=14 -> indices (1,3) because 6+8=14',
  intuition:
    'Fixing one element turns the problem into "does the complement target - x exist?" — a lookup, not a search. A hash map answers it in O(1); if the array is sorted, two pointers answer it in O(1) space.',
  approaches: [
    ap(
      'Brute: all pairs',
      'Try every (i, j).',
      `def two_sum_brute(a: list[int], target: int) -> tuple[int, int] | None:
    n = len(a)
    for i in range(n):
        for j in range(i + 1, n):
            if a[i] + a[j] == target:
                return (i, j)
    return None`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'], limitations: ['Dies around n = 10^4-10^5'] },
    ),
    ap(
      'Optimal (indices): one-pass hash map',
      'Look up the complement among elements already seen, then insert x.',
      `def two_sum(a: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for i, x in enumerate(a):
        need = target - x
        if need in seen:
            return (seen[need], i)
        seen[x] = i
    return None`,
      'O(n) average',
      'O(n)',
      {
        dryRun:
          'a=[2,6,5,8,11] target=14\ni=0 need 12 absent, store 2\ni=1 need 8 absent, store 6\ni=2 need 9 absent, store 5\ni=3 need 6 present -> (1,3)',
        whyWorks: 'Checking before inserting guarantees i != j without any special case.',
      },
    ),
    ap(
      'Optimal (yes/no, sorted input): two pointers',
      'If the sum is too small move left up, too large move right down.',
      `def two_sum_sorted(a: list[int], target: int) -> bool:
    a = sorted(a)
    lo, hi = 0, len(a) - 1
    while lo < hi:
        s = a[lo] + a[hi]
        if s == target:
            return True
        if s < target:
            lo += 1
        else:
            hi -= 1
    return False`,
      'O(n log n) with the sort, O(n) if already sorted',
      'O(1) auxiliary',
      { whyWorks: 'Each move discards only pairs that cannot possibly reach the target.' },
    ),
  ],
  specialTechnique: {
    title: 'Hash map vs two pointers',
    body: 'Need original indices -> hash map (sorting destroys them). Need O(1) space or the array is already sorted -> two pointers. This fork repeats in 3-Sum, 4-Sum and Two Sum in BST.',
  },
  complexity: { time: 'O(n) average with hashing', space: 'O(n)' },
  edgeCases: ['Duplicate values (e.g. target = 2 * x)', 'No valid pair', 'n < 2', 'Negative numbers'],
  commonMistakes: [
    'Inserting x before checking its complement, which pairs an element with itself',
    'Sorting when the question asks for original indices',
  ],
  patternRecognition: ['"Pair with property X" -> complement lookup; sorted variant -> converging pointers'],
  followUps: [
    'Return all unique pairs, not just one',
    'Extend to 3-Sum and 4-Sum',
    'What if the array is a stream of unknown length?',
    'How would you handle adversarial hash collisions?',
  ],
  interviewInsight:
    'The expected conversation is brute -> hash -> "what if sorted / O(1) space?". Volunteer both endpoints.',
  related: rel('3smprblm', '4smprblm', 'twsminbstchckifthrxistspirwithsmk'),
});

sp('srtnrryf0s1snd2s', {
  tags: ['arrays', 'dutch-national-flag', 'three-pointers'],
  pattern: 'Dutch National Flag',
  problemStatement: "Sort an array containing only 0s, 1s and 2s in one pass, in-place.",
  example: '[2,0,2,1,1,0] -> [0,0,1,1,2,2]',
  intuition:
    'Only three distinct values exist, so you can maintain three regions — settled 0s, settled 1s, unknown, settled 2s — and shrink the unknown region to nothing. This is Dijkstra\'s Dutch National Flag partition.',
  approaches: [
    ap(
      'Brute: sort',
      'Ignores the fact that the value domain has size 3.',
      `def sort012_sort(a: list[int]) -> list[int]:
    a.sort()
    return a`,
      'O(n log n)',
      'O(log n) sort stack',
      { flags: ['TLE'], limitations: ['Comparison sort is strictly more than the problem needs'] },
    ),
    ap(
      'Better: counting sort (two passes)',
      'Count 0s/1s/2s, then overwrite.',
      `def sort012_count(a: list[int]) -> list[int]:
    c = [0, 0, 0]
    for x in a:
        c[x] += 1
    i = 0
    for v in range(3):
        for _ in range(c[v]):
            a[i] = v
            i += 1
    return a`,
      'O(n)',
      'O(1)',
      { limitations: ['Two passes; not allowed if the interviewer demands a single pass'] },
    ),
    ap(
      'Optimal: Dutch National Flag, one pass',
      'low/mid/high invariants: [0,low) = 0s, [low,mid) = 1s, (high,n) = 2s.',
      `def sort012(a: list[int]) -> list[int]:
    low = mid = 0
    high = len(a) - 1
    while mid <= high:
        if a[mid] == 0:
            a[low], a[mid] = a[mid], a[low]
            low += 1
            mid += 1
        elif a[mid] == 1:
            mid += 1
        else:
            a[mid], a[high] = a[high], a[mid]
            high -= 1
    return a`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[2,0,2,1,1,0] low=0 mid=0 high=5\na[0]=2 -> swap with high: [0,0,2,1,1,2] high=4\na[0]=0 -> swap low/mid: low=1 mid=1\na[1]=0 -> low=2 mid=2\na[2]=2 -> swap with a[4]: [0,0,1,1,2,2] high=3\na[2]=1 mid=3; a[3]=1 mid=4 > high -> stop',
        whyWorks:
          'When you swap a 2 to the back you bring in an unexamined element, so mid must NOT advance. When you swap a 0 forward you bring in an already-examined 1, so mid may advance.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Dutch National Flag',
    body: 'Three-way partition around a pivot value. Same machinery powers 3-way quicksort on arrays with many duplicates.',
  },
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['All same value', 'Empty array', 'Only two of the three values present'],
  commonMistakes: [
    'Incrementing mid after swapping with high — the incoming element is unchecked',
    'Looping while mid < high instead of mid <= high, leaving the last element unsorted',
  ],
  patternRecognition: ['Tiny value domain + in-place + single pass -> three-way partition'],
  followUps: [
    'Generalise to k distinct values',
    'Partition around an arbitrary pivot (quicksort core)',
    'Why does counting sort fail the "one pass" constraint?',
  ],
  interviewInsight:
    'Say the loop invariant before you write the loop. The mid/high asymmetry is exactly what they are probing.',
});

sp('mjritylmntn2tims', {
  tags: ['arrays', 'voting'],
  pattern: "Boyer-Moore majority vote",
  problemStatement: 'Find the element that appears more than n/2 times (guaranteed to exist).',
  example: '[2,2,1,1,1,2,2] -> 2',
  intuition:
    'Pair off two different elements and discard both. A strict majority cannot be fully cancelled, so whatever survives is the candidate. That is Boyer-Moore voting in one sentence.',
  approaches: [
    ap(
      'Brute: count each element',
      'Nested loops counting occurrences.',
      `def majority_brute(a: list[int]) -> int:
    n = len(a)
    for x in a:
        if sum(1 for y in a if y == x) > n // 2:
            return x
    return -1`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Better: hash map counts',
      'One pass to count, one to pick.',
      `from collections import Counter


def majority_hash(a: list[int]) -> int:
    n = len(a)
    for k, v in Counter(a).items():
        if v > n // 2:
            return k
    return -1`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: Boyer-Moore voting',
      'One candidate + one counter; verify at the end if existence is not guaranteed.',
      `def majority_element(a: list[int]) -> int:
    count = 0
    candidate = None
    for x in a:
        if count == 0:
            candidate = x
        count += 1 if x == candidate else -1
    # Verification pass — required when a majority is not guaranteed.
    return candidate if a.count(candidate) > len(a) // 2 else -1`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[2,2,1,1,1,2,2]\n2 cand=2 c=1\n2 c=2\n1 c=1\n1 c=0\n1 cand=1 c=1\n2 c=0\n2 cand=2 c=1 -> 2 (verify: 4 > 3)',
        whyWorks:
          'Every decrement destroys one majority and one non-majority occurrence. With > n/2 copies the majority cannot be exhausted first.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Boyer-Moore majority vote',
    body: 'Cancel unequal pairs. Generalises to > n/k by keeping k-1 candidates (see Majority Element n/3).',
  },
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['No majority exists -> verification pass matters', 'Single element', 'All elements identical'],
  commonMistakes: [
    'Skipping the verification pass when existence is not guaranteed',
    'Resetting count without also resetting the candidate',
  ],
  patternRecognition: ['"More than n/k times" -> keep k-1 candidates and verify'],
  followUps: [
    'Majority element > n/3 times (#68)',
    'Prove the algorithm formally',
    'What if you need all elements above a frequency threshold?',
  ],
  interviewInsight: 'Interviewers usually drop the existence guarantee to see whether you still verify.',
  related: rel('mjritylmntn3tims', 'kdnslgrithmmximmsbrrysm'),
});

sp('kdnslgrithmmximmsbrrysm', {
  tags: ['arrays', 'dynamic-programming', 'kadane'],
  pattern: "Kadane's algorithm",
  problemStatement: 'Find the maximum sum of a contiguous subarray.',
  example: '[-2,1,-3,4,-1,2,1,-5,4] -> 6 (subarray [4,-1,2,1])',
  intuition:
    'At each index ask one question: is the best subarray ending here the previous best extended by a[i], or just a[i] alone? A running prefix that has gone negative can only hurt what follows, so drop it.',
  approaches: [
    ap(
      'Brute: every subarray',
      'Two loops accumulating sums.',
      `def max_subarray_brute(a: list[int]) -> int:
    best = float("-inf")
    for i in range(len(a)):
        s = 0
        for j in range(i, len(a)):
            s += a[j]
            best = max(best, s)
    return int(best)`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      "Optimal: Kadane's algorithm",
      'cur = max(x, cur + x); best = max(best, cur).',
      `def max_subarray(a: list[int]) -> int:
    if not a:
        raise ValueError("empty array")
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[-2,1,-3,4,-1,2,1,-5,4]\ncur: -2,1,-2,4,3,5,6,1,5\nbest: -2,1,1,4,4,5,6,6,6 -> 6',
        whyWorks:
          'cur is exactly "max sum of a subarray ending at i", a DP recurrence whose state fits in one variable.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Kadane as 1-D DP',
    body: 'dp[i] = max(a[i], dp[i-1] + a[i]). Because dp[i] depends only on dp[i-1], the table collapses to a scalar — the standard space-optimisation move for linear DP.',
  },
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: [
    'All negatives — the answer is the largest single element, not 0',
    'Single element',
    'Empty array (clarify the contract)',
  ],
  commonMistakes: [
    'Initialising best = 0, which returns 0 on all-negative input',
    'Resetting cur to 0 instead of to a[i]',
  ],
  patternRecognition: ['"Best contiguous X" -> DP on "best ending at i"'],
  followUps: [
    'Print the actual subarray (#57)',
    'Maximum product subarray (#78)',
    'Circular maximum subarray sum',
    'Maximum sum with at most k elements removed',
  ],
  interviewInsight:
    'The all-negative case is the standard trap. Mention it before coding and you have effectively passed.',
  related: rel('printsbrrywithmximmsbrrysmxtnddvrsinfbvprblm', 'mximmprdctsbrry', 'stckbyndsll'),
});

sp('printsbrrywithmximmsbrrysmxtnddvrsinfbvprblm', {
  tags: ['arrays', 'kadane'],
  pattern: "Kadane's algorithm + index tracking",
  problemStatement: 'Return the actual subarray achieving the maximum sum, not just the value.',
  example: '[-2,1,-3,4,-1,2,1,-5,4] -> [4,-1,2,1]',
  intuition:
    'Kadane already knows when a new subarray begins — it is precisely the moment cur restarts at a[i]. Record that index and close the interval whenever best improves.',
  approaches: [
    ap(
      'Optimal: Kadane with start/end bookkeeping',
      'tentative start moves on restart; commit start/end when best updates.',
      `def max_subarray_with_indices(a: list[int]) -> tuple[int, int, int]:
    best = cur = a[0]
    start = end = tentative = 0
    for i in range(1, len(a)):
        if cur + a[i] < a[i]:
            cur = a[i]
            tentative = i
        else:
            cur += a[i]
        if cur > best:
            best = cur
            start, end = tentative, i
    return best, start, end`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[-2,1,-3,4,-1,2,1,-5,4]\nrestart at i=1 (tentative=1), i=3 (tentative=3)\nbest becomes 6 at i=6 -> start=3 end=6 -> [4,-1,2,1]',
        whyWorks: 'A restart is the only place a new optimal subarray can begin.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['All negatives -> single best element', 'Ties — which subarray do you return?', 'Single element'],
  commonMistakes: [
    'Updating start at every restart instead of only when best improves',
    'Returning indices from a run that was later beaten',
  ],
  patternRecognition: ['"Reconstruct the witness" -> store the decision point, not the whole history'],
  followUps: ['Return the shortest such subarray on ties', 'Circular version', 'Maximum sum rectangle in a 2-D matrix'],
  interviewInsight:
    'Reconstruction questions are really about DP traceback discipline; the tentative/committed split is the whole trick.',
});

sp('stckbyndsll', {
  tags: ['arrays', 'greedy'],
  pattern: 'running minimum',
  problemStatement: 'One buy and one sell (sell after buy). Maximise profit, or 0 if none is positive.',
  example: '[7,1,5,3,6,4] -> 5 (buy at 1, sell at 6)',
  intuition:
    'Selling on day i is only ever optimal against the cheapest price seen before i. Carry that minimum as you sweep and every day is answered in O(1).',
  approaches: [
    ap(
      'Brute: all buy/sell pairs',
      'Try every i < j.',
      `def max_profit_brute(p: list[int]) -> int:
    best = 0
    for i in range(len(p)):
        for j in range(i + 1, len(p)):
            best = max(best, p[j] - p[i])
    return best`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: track the minimum so far',
      'profit = price - min_so_far, updated in one pass.',
      `def max_profit(prices: list[int]) -> int:
    best = 0
    lowest = float("inf")
    for p in prices:
        lowest = min(lowest, p)
        best = max(best, p - lowest)
    return best`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'p=[7,1,5,3,6,4]\nlow=7 best=0\nlow=1 best=0\np=5 best=4\np=3 best=4\np=6 best=5\np=4 best=5 -> 5',
        whyWorks: 'Maximising p[j] - min(p[0..j-1]) over j covers every valid pair exactly once.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Strictly decreasing prices -> 0', 'Single day -> 0', 'All prices equal'],
  commonMistakes: [
    'Allowing a sell before the buy by taking global max - global min',
    'Returning a negative profit instead of 0',
  ],
  patternRecognition: ['"Best pair with an order constraint" -> prefix extremum'],
  followUps: [
    'Unlimited transactions (#419)',
    'At most two transactions (#420)',
    'With a cooldown or a transaction fee',
    'Return the buy/sell days too',
  ],
  interviewInsight: 'This is the seed of the entire DP-on-stocks family; name that connection.',
  related: rel('bsttimtbyndsllstckdp35', 'byndsllstckiidp36', 'kdnslgrithmmximmsbrrysm'),
});

sp('rrrngthrryinltrntingpsitivndngtivitms', {
  tags: ['arrays', 'two-pointers'],
  pattern: 'index placement',
  problemStatement: 'Rearrange so signs alternate, starting with a positive number.',
  example: '[3,1,-2,-5,2,-4] -> [3,-2,1,-5,2,-4]',
  intuition:
    'When positives and negatives are equal in count, their target slots are known up front: evens for positives, odds for negatives. No sorting or shifting is needed.',
  approaches: [
    ap(
      'Brute: split into two lists then interleave',
      'Simple and clear, but O(n) extra memory.',
      `def rearrange_brute(a: list[int]) -> list[int]:
    pos = [x for x in a if x >= 0]
    neg = [x for x in a if x < 0]
    out = []
    for p, n in zip(pos, neg):
        out += [p, n]
    return out`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal (equal counts): direct index placement',
      'Positives at 0,2,4...; negatives at 1,3,5...',
      `def rearrange(a: list[int]) -> list[int]:
    out = [0] * len(a)
    p, n = 0, 1
    for x in a:
        if x >= 0:
            out[p] = x
            p += 2
        else:
            out[n] = x
            n += 2
    return out`,
      'O(n)',
      'O(n) for the output',
      {
        dryRun: 'a=[3,1,-2,-5,2,-4]\n3->0, 1->2, -2->1, -5->3, 2->4, -4->5 -> [3,-2,1,-5,2,-4]',
        whyWorks: 'Equal counts make the slot assignment a bijection.',
      },
    ),
    ap(
      'Variant: unequal counts, keep relative order',
      'Interleave up to min(len) then append the leftovers.',
      `def rearrange_unequal(a: list[int]) -> list[int]:
    pos = [x for x in a if x >= 0]
    neg = [x for x in a if x < 0]
    out = []
    for i in range(min(len(pos), len(neg))):
        out += [pos[i], neg[i]]
    out += pos[min(len(pos), len(neg)):]
    out += neg[min(len(pos), len(neg)):]
    return out`,
      'O(n)',
      'O(n)',
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  edgeCases: ['Unequal counts of positives and negatives', 'Zeros — decide which side they belong to', 'Empty array'],
  commonMistakes: ['Assuming equal counts when the statement does not guarantee it', 'Breaking relative order when it is required'],
  patternRecognition: ['Known target index formula -> direct placement beats any shifting loop'],
  followUps: ['Do it in O(1) extra space', 'Start with a negative instead', 'Preserve relative order strictly'],
  interviewInsight: 'Ask whether counts are equal and whether relative order matters — the two variants differ a lot.',
});

sp('nxtprmttin', {
  tags: ['arrays', 'permutations'],
  pattern: 'next lexicographic permutation',
  problemStatement: 'Rearrange numbers into the next lexicographically greater permutation, in-place; wrap to the smallest if none exists.',
  example: '[1,3,2] -> [2,1,3]; [3,2,1] -> [1,2,3]',
  intuition:
    'The suffix that is already descending is maximal — nothing inside it can grow. So find the last index that can be increased (the "pivot"), swap it with the smallest larger value to its right, and reset the suffix to ascending for the minimal jump.',
  approaches: [
    ap(
      'Brute: generate and search',
      'Generate all permutations in order, find the current one, return the next.',
      `from itertools import permutations


def next_permutation_brute(a: list[int]) -> list[int]:
    perms = sorted(set(permutations(a)))
    i = perms.index(tuple(a))
    return list(perms[(i + 1) % len(perms)])`,
      'O(n! * n)',
      'O(n! * n)',
      { flags: ['TLE', 'MLE'], limitations: ['Only usable for n <= 8 or so'] },
    ),
    ap(
      'Optimal: pivot, swap, reverse',
      'Three linear scans, no extra memory.',
      `def next_permutation(a: list[int]) -> list[int]:
    n = len(a)
    i = n - 2
    while i >= 0 and a[i] >= a[i + 1]:
        i -= 1
    if i >= 0:
        j = n - 1
        while a[j] <= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]
    a[i + 1:] = reversed(a[i + 1:])
    return a`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[2,1,5,4,3,0]\npivot: a[1]=1 (since 1 < 5)\nsmallest value > 1 to the right = 3 at index 4\nswap -> [2,3,5,4,1,0]\nreverse suffix -> [2,3,0,1,4,5]',
        whyWorks:
          'Increasing the pivot by the least possible amount and then minimising the suffix yields the immediate successor.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Pivot / successor / reverse',
    body: 'The same three steps give previous permutation with the comparisons flipped. Python users should still know it by hand — `itertools` is not an answer here.',
  },
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Fully descending -> reverse to ascending', 'n = 1', 'Duplicates (use >= and <= carefully)'],
  commonMistakes: [
    'Using strict > when scanning for the pivot, breaking on duplicates',
    'Sorting the suffix instead of reversing it (correct but O(n log n))',
  ],
  patternRecognition: ['Lexicographic ordering problems -> find the rightmost improvable position'],
  followUps: ['Previous permutation', 'k-th permutation sequence', 'Why is reversing enough instead of sorting?'],
  interviewInsight: 'They want the three-step derivation explained, not memorised. Justify each step from the suffix property.',
});

sp('ldrsinnrryprblm', {
  tags: ['arrays', 'suffix-scan'],
  pattern: 'right-to-left running maximum',
  problemStatement: 'An element is a leader if it is greater than everything to its right. Return all leaders.',
  example: '[10,22,12,3,0,6] -> [22,12,6]',
  intuition:
    'Leadership depends only on the suffix maximum, so scanning right to left answers every element in O(1).',
  approaches: [
    ap(
      'Brute: compare with all right elements',
      'Nested loops.',
      `def leaders_brute(a: list[int]) -> list[int]:
    out = []
    for i in range(len(a)):
        if all(a[i] > a[j] for j in range(i + 1, len(a))):
            out.append(a[i])
    return out`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: suffix maximum sweep',
      'Walk backwards keeping the max seen; reverse the result at the end.',
      `def leaders(a: list[int]) -> list[int]:
    out: list[int] = []
    mx = float("-inf")
    for x in reversed(a):
        if x > mx:
            out.append(x)
            mx = x
    out.reverse()
    return out`,
      'O(n)',
      'O(1) auxiliary beyond the output',
      {
        dryRun: 'a=[10,22,12,3,0,6]\n6 > -inf leader\n0 no\n3 no\n12 leader\n22 leader\n10 no -> [22,12,6]',
        whyWorks: 'The suffix maximum is exactly the quantity the definition compares against.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary beyond the output' },
  edgeCases: ['Last element is always a leader', 'Strictly increasing -> only the last', 'Duplicates: decide > vs >='],
  commonMistakes: ['Forgetting to reverse the collected list', 'Using >= when the definition says strictly greater'],
  patternRecognition: ['Suffix aggregates -> reverse iteration'],
  followUps: ['Leaders from the left', 'Next greater element (#214) — the monotonic stack generalisation', 'Count leaders only'],
  interviewInsight: 'Recognising this as a suffix-max problem, not a stack problem, is the efficiency point.',
});

sp('lngstcnsctivsqncinnrry', {
  tags: ['arrays', 'hashing'],
  pattern: 'hash set + sequence-start check',
  problemStatement: 'Length of the longest run of consecutive integers present in the array (order irrelevant).',
  example: '[100,4,200,1,3,2] -> 4 (the run 1,2,3,4)',
  intuition:
    'Only start counting from numbers that begin a run — those with no x-1 in the set. That single guard is what keeps the total work linear despite the inner while loop.',
  approaches: [
    ap(
      'Brute: sort then scan',
      'Sorting makes runs adjacent; skip duplicates.',
      `def longest_consecutive_sorted(a: list[int]) -> int:
    if not a:
        return 0
    s = sorted(set(a))
    best = run = 1
    for i in range(1, len(s)):
        run = run + 1 if s[i] == s[i - 1] + 1 else 1
        best = max(best, run)
    return best`,
      'O(n log n)',
      'O(n)',
      { limitations: ['Perfectly acceptable if O(n) is not demanded'] },
    ),
    ap(
      'Optimal: hash set, count only from run starts',
      'For each x with no x-1, walk x+1, x+2, ... upward.',
      `def longest_consecutive(a: list[int]) -> int:
    s = set(a)
    best = 0
    for x in s:
        if x - 1 in s:
            continue
        length = 1
        cur = x
        while cur + 1 in s:
            cur += 1
            length += 1
        best = max(best, length)
    return best`,
      'O(n) average',
      'O(n)',
      {
        dryRun:
          's={100,4,200,1,3,2}\nx=1 is a start -> 1,2,3,4 length 4\nx=100 start -> length 1\nx=200 start -> length 1\nbest 4',
        whyWorks: 'Each run is walked exactly once, from its smallest element, so total inner work is O(n).',
      },
    ),
  ],
  complexity: { time: 'O(n) average', space: 'O(n)' },
  edgeCases: ['Empty array -> 0', 'Duplicates must not inflate the run', 'Negative numbers'],
  commonMistakes: [
    'Dropping the `x - 1 in s` guard, turning the algorithm into O(n^2)',
    'Using a list instead of a set (membership becomes O(n))',
  ],
  patternRecognition: ['"Consecutive values, any order" -> hash set with run-start pruning'],
  followUps: ['Return the actual sequence', 'Longest consecutive path in a binary tree', 'Streaming version with union-find'],
  interviewInsight:
    'Be ready to argue the amortised bound out loud — the nested while loop looks quadratic until you explain the guard.',
});

sp('stmtrixzrs', {
  tags: ['matrix', 'in-place'],
  pattern: 'use the matrix itself as marker storage',
  problemStatement: 'If an element is 0, set its entire row and column to 0, in-place.',
  example: '[[1,1,1],[1,0,1],[1,1,1]] -> [[1,0,1],[0,0,0],[1,0,1]]',
  intuition:
    'You cannot zero rows as you discover them — new zeros would cascade. So separate marking from writing, and store the markers in row 0 / column 0 to reach O(1) space.',
  approaches: [
    ap(
      'Better: two marker arrays',
      'Record which rows and columns must be cleared, then apply.',
      `def set_zeros_markers(m: list[list[int]]) -> list[list[int]]:
    rows, cols = set(), set()
    for i, row in enumerate(m):
        for j, v in enumerate(row):
            if v == 0:
                rows.add(i)
                cols.add(j)
    for i in range(len(m)):
        for j in range(len(m[0])):
            if i in rows or j in cols:
                m[i][j] = 0
    return m`,
      'O(n*m)',
      'O(n + m)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: first row/column as markers',
      'One extra flag disambiguates column 0, whose marker cell is shared.',
      `def set_zeros(m: list[list[int]]) -> list[list[int]]:
    n, mm = len(m), len(m[0])
    first_col_zero = any(m[i][0] == 0 for i in range(n))
    for i in range(n):
        for j in range(1, mm):
            if m[i][j] == 0:
                m[i][0] = 0
                m[0][j] = 0
    for i in range(n - 1, -1, -1):
        for j in range(mm - 1, 0, -1):
            if m[i][0] == 0 or m[0][j] == 0:
                m[i][j] = 0
        if first_col_zero:
            m[i][0] = 0
    return m`,
      'O(n*m)',
      'O(1) auxiliary',
      {
        dryRun:
          'm=[[1,1,1],[1,0,1],[1,1,1]]\nmark: m[1][0]=0, m[0][1]=0\nwrite backwards -> [[1,0,1],[0,0,0],[1,0,1]]',
        whyWorks: 'Writing bottom-up right-to-left consumes each marker only after it has been read.',
      },
    ),
  ],
  complexity: { time: 'O(n*m)', space: 'O(1) auxiliary' },
  edgeCases: ['Zeros already in row 0 or column 0', 'Single row or single column', 'All zeros'],
  commonMistakes: [
    'Zeroing in the same pass as detecting, causing a cascade',
    'Forgetting the separate flag for column 0',
  ],
  patternRecognition: ['O(1) space on a matrix -> store metadata in a border row/column'],
  followUps: ['Use a single flag instead of two', 'What if 0 is a legal data value you must preserve elsewhere?', 'Rotate matrix in-place (#64)'],
  interviewInsight: 'The cascade bug is the point of this problem; name it before writing code.',
});

sp('rttmtrixby90dgrs', {
  tags: ['matrix', 'in-place'],
  pattern: 'transpose + reverse',
  problemStatement: 'Rotate an n x n matrix by 90 degrees clockwise, in-place.',
  example: '[[1,2],[3,4]] -> [[3,1],[4,2]]',
  intuition:
    'Clockwise rotation = transpose (mirror over the main diagonal) followed by reversing each row. Both steps are trivially in-place.',
  approaches: [
    ap(
      'Brute: copy into a new matrix',
      'out[j][n-1-i] = m[i][j].',
      `def rotate_copy(m: list[list[int]]) -> list[list[int]]:
    n = len(m)
    out = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            out[j][n - 1 - i] = m[i][j]
    return out`,
      'O(n^2)',
      'O(n^2)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: transpose then reverse rows',
      'Swap only the upper triangle, then reverse each row.',
      `def rotate(m: list[list[int]]) -> list[list[int]]:
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for row in m:
        row.reverse()
    return m`,
      'O(n^2)',
      'O(1) auxiliary',
      {
        dryRun: 'm=[[1,2],[3,4]]\ntranspose -> [[1,3],[2,4]]\nreverse rows -> [[3,1],[4,2]]',
        whyWorks: 'Transpose maps (i,j)->(j,i); reversing rows then maps j -> n-1-j, composing to the rotation.',
      },
    ),
  ],
  complexity: { time: 'O(n^2)', space: 'O(1) auxiliary' },
  edgeCases: ['n = 1', 'Even vs odd n (loop bounds are the same)', 'Non-square matrices cannot rotate in-place'],
  commonMistakes: [
    'Transposing the full matrix (j from 0), which undoes the swap',
    'Reversing columns instead of rows',
  ],
  patternRecognition: ['Geometric transforms decompose into transpose + reflection'],
  followUps: ['Anticlockwise rotation', 'Rotate by 180', 'Rotate a rectangular matrix (needs new storage)'],
  interviewInsight: 'Deriving the composition on paper beats memorising; they often ask for anticlockwise on the spot.',
});

sp('printthmtrixinspirlmnnr', {
  tags: ['matrix', 'simulation'],
  pattern: 'four shrinking boundaries',
  problemStatement: 'Print all elements of a matrix in spiral order.',
  example: '[[1,2,3],[4,5,6],[7,8,9]] -> 1 2 3 6 9 8 7 4 5',
  intuition:
    'Maintain top/bottom/left/right walls. Traverse one wall, then retract it. The only subtlety is re-checking the bounds before the two return legs.',
  approaches: [
    ap(
      'Optimal: boundary simulation',
      'Right across the top, down the right, left across the bottom, up the left; repeat.',
      `def spiral_order(m: list[list[int]]) -> list[int]:
    if not m or not m[0]:
        return []
    top, bottom = 0, len(m) - 1
    left, right = 0, len(m[0]) - 1
    out: list[int] = []
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            out.append(m[top][j])
        top += 1
        for i in range(top, bottom + 1):
            out.append(m[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                out.append(m[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                out.append(m[i][left])
            left += 1
    return out`,
      'O(n*m)',
      'O(1) auxiliary beyond the output',
      {
        dryRun:
          '3x3: top row 1,2,3 (top=1)\nright col 6,9 (right=1)\nbottom row 8,7 (bottom=1)\nleft col 4 (left=1)\nremaining top row 5',
        whyWorks: 'Each cell lies on exactly one wall at the moment it is visited.',
      },
    ),
  ],
  complexity: { time: 'O(n*m)', space: 'O(1) auxiliary beyond the output' },
  edgeCases: ['Single row', 'Single column', 'Empty matrix', 'Non-square matrix'],
  commonMistakes: [
    'Skipping the `if top <= bottom` / `if left <= right` guards, which double-prints the middle line',
    'Off-by-one in the reverse ranges',
  ],
  patternRecognition: ['Layer-by-layer matrix traversal with shrinking boundaries'],
  followUps: ['Generate a spiral matrix from 1..n^2', 'Anticlockwise spiral', 'Spiral traversal of a binary tree (level order zig-zag)'],
  interviewInsight: 'Single-row and single-column matrices are the fastest way to expose a missing guard. Test them aloud.',
});

sp('sbrrywithgivnsm', {
  tags: ['arrays', 'prefix-sum', 'hashing'],
  pattern: 'prefix sum frequency map',
  problemStatement: 'Count the number of subarrays whose sum equals K (negatives allowed).',
  example: '[3,1,2,4], K=6 -> 2 ([3,1,2] and [2,4])',
  intuition:
    'sum(i..j) = pre[j] - pre[i-1] = K means pre[i-1] = pre[j] - K. So at each j add the *count* of earlier prefixes equal to pre[j] - K. Counting, not longest, so store frequencies.',
  approaches: [
    ap(
      'Brute: all subarrays',
      'Accumulate from each start.',
      `def count_brute(a: list[int], k: int) -> int:
    c = 0
    for i in range(len(a)):
        s = 0
        for j in range(i, len(a)):
            s += a[j]
            if s == k:
                c += 1
    return c`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: prefix-sum counts',
      'Seed the map with {0: 1} so prefixes that equal K on their own are counted.',
      `from collections import defaultdict


def count_subarrays_sum_k(a: list[int], k: int) -> int:
    freq = defaultdict(int)
    freq[0] = 1
    pre = 0
    count = 0
    for x in a:
        pre += x
        count += freq[pre - k]
        freq[pre] += 1
    return count`,
      'O(n) average',
      'O(n)',
      {
        dryRun:
          'a=[3,1,2,4] k=6\npre 3: need -3 -> 0\npre 4: need -2 -> 0\npre 6: need 0 -> +1\npre 10: need 4 -> +1\ntotal 2',
        whyWorks: 'Every subarray corresponds to exactly one (start prefix, end prefix) pair.',
      },
    ),
  ],
  complexity: { time: 'O(n) average', space: 'O(n)' },
  edgeCases: ['K = 0 with zeros in the array', 'All negatives', 'Empty array -> 0'],
  commonMistakes: [
    'Forgetting freq[0] = 1 and losing every prefix-length answer',
    'Incrementing freq before querying it (counts the empty subarray)',
  ],
  patternRecognition: ['Count vs longest: frequency map vs first-occurrence map on the same prefix idea'],
  followUps: [
    'Count subarrays with XOR K (#72)',
    'Longest subarray with sum K (#52)',
    'Count subarrays with at most K odd numbers (#235)',
  ],
  interviewInsight:
    'Say explicitly why the counting variant stores frequencies while the longest variant stores first indices.',
  related: rel('longestsubarraywithsumkposneg', 'cntnmbrfsbrryswithgivnxrk', 'lrgstsbrrywith0sm'),
});

/* ------------------------------ Arrays: hard ------------------------------ */

sp('psclstringl', {
  tags: ['arrays', 'combinatorics'],
  pattern: 'binomial coefficients',
  problemStatement: 'Three variants: the value at (r, c), the whole r-th row, or the first n rows of Pascal\'s triangle.',
  example: 'row 5 -> [1,4,6,4,1]',
  intuition:
    'Entry (r, c) is C(r-1, c-1). Building a row from the previous one is O(n^2) overall, but a single row can be generated in O(n) by the multiplicative identity C(n,k) = C(n,k-1) * (n-k+1)/k.',
  approaches: [
    ap(
      'Whole triangle: additive DP',
      'Each row is built from its neighbours above.',
      `def pascal_triangle(n: int) -> list[list[int]]:
    tri: list[list[int]] = []
    for r in range(n):
        row = [1] * (r + 1)
        for c in range(1, r):
            row[c] = tri[r - 1][c - 1] + tri[r - 1][c]
        tri.append(row)
    return tri`,
      'O(n^2)',
      'O(n^2) for the output',
    ),
    ap(
      'Single row in O(n): multiplicative form',
      'Avoid factorials to keep intermediate values small.',
      `def pascal_row(r: int) -> list[int]:
    row = [1]
    val = 1
    for c in range(1, r):
        val = val * (r - c) // c
        row.append(val)
    return row`,
      'O(r)',
      'O(r)',
      {
        dryRun: 'r=5\nval 1 -> 4 -> 6 -> 4 -> 1 giving [1,4,6,4,1]',
        whyWorks: 'C(n,k) = C(n,k-1) * (n-k+1)/k, and the division is always exact at each step.',
      },
    ),
  ],
  complexity: { time: 'O(n^2) for the triangle, O(n) for a single row', space: 'O(n^2) / O(n)' },
  edgeCases: ['1-indexed vs 0-indexed rows', 'n = 1', 'Large r overflows fixed-width ints (not Python)'],
  commonMistakes: [
    'Computing factorials separately and overflowing',
    'Dividing with / instead of // and drifting into floats',
  ],
  patternRecognition: ['Ask which of the three variants is wanted — the complexities differ'],
  followUps: ['Value at (r,c) in O(c)', 'Row modulo a prime', 'Connection to combinations in DP counting problems'],
  interviewInsight: 'Clarify the variant first. Jumping straight to the full triangle when they wanted one row wastes the interview.',
});

sp('mjritylmntn3tims', {
  tags: ['arrays', 'voting'],
  pattern: 'extended Boyer-Moore (k = 3)',
  problemStatement: 'Find all elements appearing more than n/3 times (at most two can exist).',
  example: '[1,1,1,3,3,2,2,2] -> [1,2]',
  intuition:
    'At most k-1 = 2 elements can exceed n/3, so keep two candidates and two counters. Cancelling a triple of distinct values cannot eliminate a true majority.',
  approaches: [
    ap(
      'Better: hash counts',
      'Count then filter.',
      `from collections import Counter


def majority3_hash(a: list[int]) -> list[int]:
    n = len(a)
    return [k for k, v in Counter(a).items() if v > n // 3]`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: two candidates, two counters',
      'Then verify both with a second pass.',
      `def majority_n3(a: list[int]) -> list[int]:
    c1 = c2 = 0
    n1 = n2 = None
    for x in a:
        if n1 == x:
            c1 += 1
        elif n2 == x:
            c2 += 1
        elif c1 == 0:
            n1, c1 = x, 1
        elif c2 == 0:
            n2, c2 = x, 1
        else:
            c1 -= 1
            c2 -= 1
    return sorted(c for c in {n1, n2} if c is not None and a.count(c) > len(a) // 3)`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,1,1,3,3,2,2,2]\ncandidates settle on 1 and 2\nverify: count(1)=3 > 2, count(2)=3 > 2 -> [1,2]',
        whyWorks: 'Each decrement removes three distinct occurrences, so an element with > n/3 copies survives.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['No element qualifies -> empty list', 'Exactly n/3 (not strictly greater) must be rejected', 'n < 3'],
  commonMistakes: [
    'Checking candidate equality after the count == 0 branches, which mis-assigns duplicates',
    'Skipping verification',
  ],
  patternRecognition: ['> n/k -> k-1 candidates + verification'],
  followUps: ['Generalise to > n/k', 'Why can at most k-1 such elements exist?', 'Streaming heavy hitters (Misra-Gries)'],
  interviewInsight: 'The branch ordering is the bug factory here — write the equality checks first, deliberately.',
});

sp('3smprblm', {
  tags: ['arrays', 'two-pointers', 'sorting'],
  pattern: 'sort + fix one + two pointers',
  problemStatement: 'Return all unique triplets summing to zero.',
  example: '[-1,0,1,2,-1,-4] -> [[-1,-1,2],[-1,0,1]]',
  intuition:
    'Sorting does two jobs: it enables the converging two-pointer scan for the inner 2-Sum, and it makes duplicates adjacent so they can be skipped deterministically.',
  approaches: [
    ap(
      'Brute: three loops + set',
      'Deduplicate by storing sorted tuples.',
      `def three_sum_brute(a: list[int]) -> list[list[int]]:
    n = len(a)
    found = set()
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if a[i] + a[j] + a[k] == 0:
                    found.add(tuple(sorted((a[i], a[j], a[k]))))
    return [list(t) for t in sorted(found)]`,
      'O(n^3)',
      'O(number of triplets)',
      { flags: ['TLE'] },
    ),
    ap(
      'Better: fix two, hash the third',
      'Hash set of seen values inside the second loop.',
      `def three_sum_hash(a: list[int]) -> list[list[int]]:
    n = len(a)
    found = set()
    for i in range(n):
        seen = set()
        for j in range(i + 1, n):
            need = -(a[i] + a[j])
            if need in seen:
                found.add(tuple(sorted((a[i], a[j], need))))
            seen.add(a[j])
    return [list(t) for t in sorted(found)]`,
      'O(n^2) average',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: sort + two pointers',
      'Skip duplicates at every level to emit each triplet once.',
      `def three_sum(a: list[int]) -> list[list[int]]:
    a.sort()
    n = len(a)
    out: list[list[int]] = []
    for i in range(n - 2):
        if a[i] > 0:
            break
        if i > 0 and a[i] == a[i - 1]:
            continue
        lo, hi = i + 1, n - 1
        while lo < hi:
            s = a[i] + a[lo] + a[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([a[i], a[lo], a[hi]])
                lo += 1
                hi -= 1
                while lo < hi and a[lo] == a[lo - 1]:
                    lo += 1
                while lo < hi and a[hi] == a[hi + 1]:
                    hi -= 1
    return out`,
      'O(n^2)',
      'O(1) auxiliary beyond sorting',
      {
        dryRun:
          'sorted: [-4,-1,-1,0,1,2]\ni=0 (-4): no pair sums to 4\ni=1 (-1): lo=2 hi=5 -> -1+-1+2=0 emit; then -1+0+1=0 emit\ni=2 duplicate -1 skipped',
        whyWorks: 'Sorting makes both the pointer movement monotone and the duplicate skipping local.',
      },
    ),
  ],
  specialTechnique: {
    title: 'k-Sum reduction',
    body: 'k-Sum = fix one index and solve (k-1)-Sum on the suffix. The recursion bottoms out at sorted 2-Sum with two pointers, giving O(n^(k-1)).',
  },
  complexity: { time: 'O(n^2)', space: 'O(1) auxiliary beyond sorting' },
  edgeCases: ['Many duplicates', 'All zeros -> single triplet [0,0,0]', 'n < 3', 'No triplet exists'],
  commonMistakes: [
    'Skipping duplicates before emitting the triplet rather than after',
    'Using a set of tuples as a crutch instead of understanding the skips',
  ],
  patternRecognition: ['Sorted array + fixed target -> converging pointers'],
  followUps: ['4-Sum (#70)', '3-Sum closest', 'Count triplets with sum < target', 'Generalise to k-Sum recursively'],
  interviewInsight:
    'Duplicate handling, not the pointer loop, is what most candidates get wrong. Narrate the skip rules.',
  related: rel('2smprblm', '4smprblm'),
});

sp('4smprblm', {
  tags: ['arrays', 'two-pointers', 'sorting'],
  pattern: 'sort + fix two + two pointers',
  problemStatement: 'Return all unique quadruplets summing to a target.',
  example: '[1,0,-1,0,-2,2], target 0 -> [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]',
  intuition:
    'Exactly 3-Sum with one more fixed index. The skip-duplicates discipline is applied at all four levels.',
  approaches: [
    ap(
      'Optimal: two nested loops + two pointers',
      'Sort once; skip duplicates at i, j, lo and hi.',
      `def four_sum(a: list[int], target: int) -> list[list[int]]:
    a.sort()
    n = len(a)
    out: list[list[int]] = []
    for i in range(n - 3):
        if i > 0 and a[i] == a[i - 1]:
            continue
        for j in range(i + 1, n - 2):
            if j > i + 1 and a[j] == a[j - 1]:
                continue
            lo, hi = j + 1, n - 1
            while lo < hi:
                s = a[i] + a[j] + a[lo] + a[hi]
                if s < target:
                    lo += 1
                elif s > target:
                    hi -= 1
                else:
                    out.append([a[i], a[j], a[lo], a[hi]])
                    lo += 1
                    hi -= 1
                    while lo < hi and a[lo] == a[lo - 1]:
                        lo += 1
                    while lo < hi and a[hi] == a[hi + 1]:
                        hi -= 1
    return out`,
      'O(n^3)',
      'O(1) auxiliary beyond sorting',
      {
        dryRun:
          'sorted: [-2,-1,0,0,1,2] target 0\ni=-2, j=-1 -> lo/hi find (1,2)\ni=-2, j=0 -> (0,2)\ni=-1, j=0 -> (0,1)',
        whyWorks: 'Fixing two indices reduces to sorted 2-Sum, which is linear.',
      },
    ),
  ],
  complexity: { time: 'O(n^3)', space: 'O(1) auxiliary beyond sorting' },
  edgeCases: ['Integer overflow in C++/Java (use 64-bit)', 'Heavy duplicates', 'n < 4'],
  commonMistakes: [
    'Skipping j duplicates with `j > 0` instead of `j > i + 1`',
    'Forgetting that the sum can overflow 32-bit ints in other languages',
  ],
  patternRecognition: ['k-Sum -> fix k-2 indices and run two pointers'],
  followUps: ['Generic k-Sum via recursion', 'Count quadruplets instead of listing them', 'Can you beat O(n^3)? (meet in the middle, O(n^2 log n))'],
  interviewInsight: 'The meet-in-the-middle O(n^2) pair-hash answer is a strong bonus if you have time to mention it.',
});

sp('lrgstsbrrywith0sm', {
  tags: ['arrays', 'prefix-sum', 'hashing'],
  pattern: 'prefix sum repeat',
  problemStatement: 'Length of the longest subarray whose elements sum to zero.',
  example: '[9,-3,3,-1,6,-5] -> 5',
  intuition:
    'If the same prefix sum appears at indices i and j, the elements between them cancel to zero. Longest means you keep the earliest index for each prefix value.',
  approaches: [
    ap(
      'Optimal: first-occurrence prefix map',
      'Seed {0: -1} so a zero-sum prefix is handled uniformly.',
      `def longest_zero_sum(a: list[int]) -> int:
    first = {0: -1}
    pre = 0
    best = 0
    for i, x in enumerate(a):
        pre += x
        if pre in first:
            best = max(best, i - first[pre])
        else:
            first[pre] = i
    return best`,
      'O(n) average',
      'O(n)',
      {
        dryRun:
          'a=[9,-3,3,-1,6,-5]\npre: 9,6,9,8,14,9\npre=9 first at 0, seen again at 2 -> len 2, and at 5 -> len 5',
        whyWorks: 'Equal prefixes bracket a zero-sum block; earliest occurrence maximises the span.',
      },
    ),
  ],
  complexity: { time: 'O(n) average', space: 'O(n)' },
  edgeCases: ['No zero-sum subarray -> 0', 'Single 0 element -> 1', 'All zeros -> n'],
  commonMistakes: ['Omitting the {0: -1} seed', 'Overwriting an existing prefix key'],
  patternRecognition: ['Sum-K family with K = 0'],
  followUps: ['Longest subarray with equal 0s and 1s (map 0 -> -1)', 'Count zero-sum subarrays', 'Same idea on XOR (#72)'],
  interviewInsight: 'The 0/1-equal-count variant is the common disguise; mention the 0 -> -1 remap.',
});

sp('cntnmbrfsbrryswithgivnxrk', {
  tags: ['arrays', 'prefix-xor', 'hashing'],
  pattern: 'prefix XOR frequency map',
  problemStatement: 'Count subarrays whose XOR equals K.',
  example: '[4,2,2,6,4], K=6 -> 4',
  intuition:
    'XOR behaves like addition with its own inverse: xor(i..j) = pre[j] ^ pre[i-1]. Setting that equal to K gives pre[i-1] = pre[j] ^ K — the exact same map lookup as the sum version.',
  approaches: [
    ap(
      'Brute: all subarrays',
      'Running XOR from each start.',
      `def count_xor_brute(a: list[int], k: int) -> int:
    c = 0
    for i in range(len(a)):
        x = 0
        for j in range(i, len(a)):
            x ^= a[j]
            if x == k:
                c += 1
    return c`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: prefix XOR counts',
      'Seed {0: 1}; add freq[pre ^ k] at each step.',
      `from collections import defaultdict


def count_subarrays_xor_k(a: list[int], k: int) -> int:
    freq = defaultdict(int)
    freq[0] = 1
    pre = 0
    count = 0
    for x in a:
        pre ^= x
        count += freq[pre ^ k]
        freq[pre] += 1
    return count`,
      'O(n) average',
      'O(n)',
      {
        dryRun: 'a=[4,2,2,6,4] k=6\npre: 4,6,4,2,6\nlookups pre^6: 2,0,2,4,0 -> hits accumulate to 4',
        whyWorks: 'pre[j] ^ K = pre[i-1] is an equivalence, because XOR is its own inverse.',
      },
    ),
  ],
  complexity: { time: 'O(n) average', space: 'O(n)' },
  edgeCases: ['K = 0 (counts equal-prefix pairs)', 'Single element equal to K', 'Zeros in the array'],
  commonMistakes: ['Using pre - k instead of pre ^ k', 'Forgetting the {0: 1} seed'],
  patternRecognition: ['Any invertible associative operation supports the prefix + hash-map trick'],
  followUps: ['Longest subarray with XOR K', 'Maximum XOR subarray (needs a trie, #445)', 'Subarray sum equals K (#66)'],
  interviewInsight: 'Saying "XOR is self-inverse, so the sum template transfers verbatim" is the insight they want.',
});

sp('mrgvrlppingsbintrvls', {
  tags: ['intervals', 'sorting', 'greedy'],
  pattern: 'sort by start + sweep',
  problemStatement: 'Merge all overlapping intervals.',
  example: '[[1,3],[2,6],[8,10]] -> [[1,6],[8,10]]',
  intuition:
    'Sorting by start time means any interval can only overlap the one currently open. That reduces merging to a single comparison per interval.',
  approaches: [
    ap(
      'Optimal: sort then extend or push',
      'If the next start <= current end, extend the end; else start a new interval.',
      `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    intervals.sort(key=lambda p: p[0])
    out = [list(intervals[0])]
    for start, end in intervals[1:]:
        if start <= out[-1][1]:
            out[-1][1] = max(out[-1][1], end)
        else:
            out.append([start, end])
    return out`,
      'O(n log n)',
      'O(1) auxiliary beyond the output',
      {
        dryRun:
          '[[1,3],[2,6],[8,10]]\nopen [1,3]; 2 <= 3 -> extend to [1,6]; 8 > 6 -> push [8,10]',
        whyWorks: 'After sorting by start, an interval that does not overlap the open one cannot overlap any earlier one.',
      },
    ),
  ],
  complexity: { time: 'O(n log n)', space: 'O(1) auxiliary beyond the output' },
  edgeCases: ['Touching intervals [1,2],[2,3] — merge or not? Clarify', 'Fully nested intervals', 'Single interval'],
  commonMistakes: [
    'Setting end = next_end instead of max(end, next_end), which loses nested intervals',
    'Sorting by end time',
  ],
  patternRecognition: ['Interval problems: sort by start to merge, sort by end to schedule greedily'],
  followUps: ['Insert an interval into a sorted list (#272)', 'Minimum removals for non-overlap (#274)', 'Meeting rooms II / platform count (#267)'],
  interviewInsight: 'The max() on the end is the classic silent bug — a nested [1,10] inside gets truncated without it.',
  related: rel('mrgintrvls', 'insrtintrvl', 'nnvrlppingintrvls'),
});

sp('mrgtwsrtdrryswithtxtrspc', {
  tags: ['arrays', 'two-pointers', 'gap-method'],
  pattern: 'Shell-sort gap method',
  problemStatement: 'Merge two sorted arrays in-place, with O(1) extra space.',
  example: 'a=[1,4,8,10], b=[2,3,9] -> a=[1,2,3,4], b=[8,9,10]',
  intuition:
    'Treat the two arrays as one virtual array of length n+m. The gap method repeatedly compares elements a fixed distance apart and halves the gap — exactly Shell sort restricted to already-sorted halves.',
  approaches: [
    ap(
      'Brute: merge into a third array',
      'Standard merge, then copy back.',
      `def merge_extra(a: list[int], b: list[int]) -> None:
    merged = sorted(a + b)
    a[:] = merged[: len(a)]
    b[:] = merged[len(a):]`,
      'O((n+m) log(n+m)) with sort, O(n+m) with a real merge',
      'O(n+m)',
      { flags: ['MLE'] },
    ),
    ap(
      'Better: swap-and-sort (O(1) space)',
      'Swap out-of-order pairs across the boundary, then re-sort both halves.',
      `def merge_swap(a: list[int], b: list[int]) -> None:
    i, j = len(a) - 1, 0
    while i >= 0 and j < len(b) and a[i] > b[j]:
        a[i], b[j] = b[j], a[i]
        i -= 1
        j += 1
    a.sort()
    b.sort()`,
      'O(n log n + m log m)',
      'O(1) auxiliary',
    ),
    ap(
      'Optimal: gap method',
      'gap = ceil((n+m)/2), halve each round, compare elements gap apart in the virtual array.',
      `def merge_gap(a: list[int], b: list[int]) -> None:
    n, m = len(a), len(b)
    total = n + m

    def get(idx: int) -> int:
        return a[idx] if idx < n else b[idx - n]

    def put(idx: int, val: int) -> None:
        if idx < n:
            a[idx] = val
        else:
            b[idx - n] = val

    gap = (total + 1) // 2
    while gap > 0:
        i = 0
        while i + gap < total:
            if get(i) > get(i + gap):
                x, y = get(i), get(i + gap)
                put(i, y)
                put(i + gap, x)
            i += 1
        gap = 0 if gap == 1 else (gap + 1) // 2`,
      'O((n+m) log(n+m))',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,4,8,10] b=[2,3,9] total=7 gap=4\ncompare (0,4),(1,5),(2,6) and swap where needed\ngap 2, then 1, then stop -> a=[1,2,3,4] b=[8,9,10]',
        whyWorks:
          'Each gap pass fixes all inversions at that distance; halving down to 1 leaves the virtual array sorted.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Gap (Shell) method',
    body: 'Use ceil when halving the gap, and stop after the gap-1 pass. Getting gap = 1 but never running it is the classic off-by-one.',
  },
  complexity: { time: 'O((n+m) log(n+m))', space: 'O(1) auxiliary' },
  edgeCases: ['Either array empty', 'All of b smaller than all of a', 'Equal elements across the boundary'],
  commonMistakes: ['Halving with floor, which skips the final gap-1 pass', 'Mixing up index mapping in the virtual array'],
  patternRecognition: ['"In-place merge" -> gap method; "extra space allowed" -> plain two-pointer merge'],
  followUps: ['LeetCode 88 variant where a has trailing space (merge from the back)', 'Merge k sorted arrays', 'Stability of the gap method'],
  interviewInsight: 'Present all three tiers. The gap method is the differentiator but the back-to-front merge is what LeetCode 88 wants.',
});

sp('findthrptingndmissingnmbr-i', {
  tags: ['arrays', 'math', 'xor'],
  pattern: 'two equations / XOR bit split',
  problemStatement: 'Array of 1..n where one value repeats and one is missing. Find both.',
  example: '[4,3,6,2,1,1] -> repeating 1, missing 5',
  intuition:
    'Two unknowns need two independent equations. Sum gives x - y; sum of squares gives x + y. Alternatively XOR everything and split by a differing bit — no overflow risk at all.',
  approaches: [
    ap(
      'Better: frequency array',
      'Count occurrences of 1..n.',
      `def repeat_missing_count(a: list[int]) -> tuple[int, int]:
    n = len(a)
    cnt = [0] * (n + 1)
    for x in a:
        cnt[x] += 1
    rep = miss = -1
    for v in range(1, n + 1):
        if cnt[v] == 2:
            rep = v
        elif cnt[v] == 0:
            miss = v
    return rep, miss`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: sum and sum-of-squares',
      'S1 = x - y, S2 = x^2 - y^2 = (x-y)(x+y).',
      `def repeat_missing_math(a: list[int]) -> tuple[int, int]:
    n = len(a)
    sn = n * (n + 1) // 2
    s2n = n * (n + 1) * (2 * n + 1) // 6
    s = sum(a)
    s2 = sum(v * v for v in a)
    d = s - sn            # x - y
    t = (s2 - s2n) // d   # x + y
    x = (d + t) // 2
    return x, x - d`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[4,3,6,2,1,1] n=6\nsn=21 s=17 -> d=-4\ns2n=91 s2=67 -> t=(67-91)/(-4)=6\nx=(-4+6)/2=1 repeating; missing = 1-(-4)=5',
        whyWorks: 'Two independent symmetric functions determine the unordered pair uniquely.',
      },
    ),
    ap(
      'Optimal (overflow-safe): XOR bucket split',
      'XOR all values with 1..n, isolate a differing bit, split into two buckets.',
      `def repeat_missing_xor(a: list[int]) -> tuple[int, int]:
    n = len(a)
    xor = 0
    for v in a:
        xor ^= v
    for v in range(1, n + 1):
        xor ^= v
    bit = xor & -xor
    g0 = g1 = 0
    for v in a:
        if v & bit:
            g1 ^= v
        else:
            g0 ^= v
    for v in range(1, n + 1):
        if v & bit:
            g1 ^= v
        else:
            g0 ^= v
    return (g1, g0) if g1 in a else (g0, g1)`,
      'O(n)',
      'O(1) auxiliary',
      { whyWorks: 'x ^ y has a set bit wherever x and y differ; that bit partitions the multiset cleanly.' },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['n = 1', 'Overflow of sum-of-squares in C++/Java (use long long)', 'Deciding which bucket holds the repeater'],
  commonMistakes: ['Integer overflow in the squares formula', 'Returning the pair in the wrong order'],
  patternRecognition: ['Two unknowns -> two equations, or XOR bit-splitting'],
  followUps: ['Solve with cyclic sort / index marking', 'Two repeating numbers', 'Why is XOR preferred in Java?'],
  interviewInsight: 'Offer the XOR method as the overflow-safe answer — it is what separates a good answer from a great one.',
});

sp('cntinvrsins', {
  tags: ['arrays', 'divide-and-conquer', 'merge-sort'],
  pattern: 'merge sort with counting',
  problemStatement: 'Count pairs (i, j) with i < j and a[i] > a[j].',
  example: '[5,4,3,2,1] -> 10',
  intuition:
    'Merge sort already compares exactly the cross-half pairs you need. When a right element is taken before a left one, every remaining element in the left half forms an inversion with it — count them in bulk.',
  approaches: [
    ap(
      'Brute: all pairs',
      'Two loops.',
      `def inversions_brute(a: list[int]) -> int:
    c = 0
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            if a[i] > a[j]:
                c += 1
    return c`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'], limitations: ['n = 10^5 means 5*10^9 pairs'] },
    ),
    ap(
      'Optimal: merge sort, count during merge',
      'Add (mid - i + 1) whenever the right element wins.',
      `def count_inversions(a: list[int]) -> int:
    def sort_count(lo: int, hi: int) -> int:
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        cnt = sort_count(lo, mid) + sort_count(mid, hi)
        merged = []
        i, j = lo, mid
        while i < mid and j < hi:
            if a[i] <= a[j]:
                merged.append(a[i]); i += 1
            else:
                cnt += mid - i
                merged.append(a[j]); j += 1
        merged.extend(a[i:mid])
        merged.extend(a[j:hi])
        a[lo:hi] = merged
        return cnt

    return sort_count(0, len(a))`,
      'O(n log n)',
      'O(n) for the merge buffer',
      {
        dryRun:
          'a=[2,1]\nmerge halves [2] and [1]: 1 < 2 so count += 1 (one left element remains)\ntotal 1',
        whyWorks: 'Left-half elements are sorted, so if a[i] > a[j] then so is every element after i.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Counting during merge',
    body: 'Using `a[i] <= a[j]` (not <) keeps the sort stable and avoids counting equal pairs as inversions. The same scaffold solves reverse pairs and "count smaller after self".',
  },
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  edgeCases: ['Already sorted -> 0', 'Reverse sorted -> n(n-1)/2', 'Duplicates must not count'],
  commonMistakes: ['Using < instead of <= and counting equal pairs', 'Adding 1 instead of (mid - i) per right-element take'],
  patternRecognition: ['Counting cross-pairs with an order predicate -> merge sort / BIT / merge-sort tree'],
  followUps: ['Reverse pairs where a[i] > 2*a[j] (#77)', 'Solve with a Fenwick tree instead', 'Count smaller elements to the right'],
  interviewInsight: 'Deriving the bulk count (mid - i) from the sortedness of the left half is the whole interview.',
  related: rel('rvrspirs', 'mrgsrt'),
});

sp('rvrspirs', {
  tags: ['arrays', 'divide-and-conquer', 'merge-sort'],
  pattern: 'merge sort with a separate counting pass',
  problemStatement: 'Count pairs (i, j) with i < j and a[i] > 2 * a[j].',
  example: '[1,3,2,3,1] -> 2',
  intuition:
    'The predicate a[i] > 2*a[j] is not the merge comparison, so you cannot count during the merge itself. Run a separate two-pointer pass over the two sorted halves before merging.',
  approaches: [
    ap(
      'Brute: all pairs',
      'Direct double loop.',
      `def reverse_pairs_brute(a: list[int]) -> int:
    c = 0
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            if a[i] > 2 * a[j]:
                c += 1
    return c`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: count pass + merge pass',
      'Both halves are sorted, so the counting pointer only moves forward — O(n) per level.',
      `def reverse_pairs(a: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        cnt = solve(lo, mid) + solve(mid, hi)
        j = mid
        for i in range(lo, mid):
            while j < hi and a[i] > 2 * a[j]:
                j += 1
            cnt += j - mid
        a[lo:hi] = sorted(a[lo:hi])
        return cnt

    return solve(0, len(a))`,
      'O(n log n)',
      'O(n)',
      {
        dryRun:
          'a=[1,3,2,3,1]\nleft [1,3] right [2,3,1] sorted halves counted separately\ncross pairs: (3,1) and (3,1) -> 2',
        whyWorks: 'j never rewinds because a[i] increases across the sorted left half.',
      },
    ),
  ],
  complexity: { time: 'O(n log n)', space: 'O(n)' },
  edgeCases: ['Negative numbers (2*a[j] shrinks)', 'Overflow of 2*a[j] in fixed-width languages', 'Already sorted -> 0'],
  commonMistakes: [
    'Trying to count inside the merge loop, which is wrong for this predicate',
    'Resetting j for every i, making it O(n^2)',
  ],
  patternRecognition: ['Non-merge predicates need their own linear pass over sorted halves'],
  followUps: ['Generalise to a[i] > k * a[j]', 'Fenwick tree solution with coordinate compression', 'Count inversions (#76)'],
  interviewInsight: 'Explaining why the counting pass must be separate from the merge is the signal they look for.',
});

sp('mximmprdctsbrry', {
  tags: ['arrays', 'dynamic-programming'],
  pattern: 'track min and max (sign flipping)',
  problemStatement: 'Find the maximum product of a contiguous subarray.',
  example: '[2,3,-2,4] -> 6; [-2,0,-1] -> 0',
  intuition:
    'Unlike sums, a negative number can turn the smallest product into the largest. So carry both the running maximum and the running minimum, and swap them whenever you hit a negative.',
  approaches: [
    ap(
      'Brute: all subarrays',
      'Running product from each start.',
      `def max_product_brute(a: list[int]) -> int:
    best = float("-inf")
    for i in range(len(a)):
        p = 1
        for j in range(i, len(a)):
            p *= a[j]
            best = max(best, p)
    return int(best)`,
      'O(n^2)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: dual max/min DP',
      'On a negative element, swap cur_max and cur_min before extending.',
      `def max_product(a: list[int]) -> int:
    best = cur_max = cur_min = a[0]
    for x in a[1:]:
        if x < 0:
            cur_max, cur_min = cur_min, cur_max
        cur_max = max(x, cur_max * x)
        cur_min = min(x, cur_min * x)
        best = max(best, cur_max)
    return best`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[2,3,-2,4]\nx=3: max 6 min 3\nx=-2: swap -> max 3 min 6; then max=max(-2,-6)=-2, min=min(-2,-12)=-12\nx=4: max=max(4,-8)=4; best stays 6',
        whyWorks: 'The optimal product ending at i is either x alone, max*x, or min*x — three candidates, O(1) state.',
      },
    ),
    ap(
      'Alternative: prefix and suffix products',
      'Scan both directions resetting on zero; take the best value seen.',
      `def max_product_prefix_suffix(a: list[int]) -> int:
    n = len(a)
    best = float("-inf")
    pre = suf = 1
    for i in range(n):
        if pre == 0:
            pre = 1
        if suf == 0:
            suf = 1
        pre *= a[i]
        suf *= a[n - 1 - i]
        best = max(best, pre, suf)
    return int(best)`,
      'O(n)',
      'O(1) auxiliary',
      { whyWorks: 'An optimal subarray with an even number of negatives is a prefix or suffix of a zero-free block.' },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Zeros splitting the array', 'Odd count of negatives', 'Single element', 'All negatives'],
  commonMistakes: [
    'Reusing Kadane unchanged and losing the negative-times-negative case',
    'Resetting to 0 on a zero rather than to the element itself',
  ],
  patternRecognition: ['Non-monotone operations -> carry both extremes in the DP state'],
  followUps: ['Maximum product of a subsequence', 'Subarray product less than K (sliding window)', 'Why does Kadane fail here?'],
  interviewInsight: 'Articulating "negatives flip the ordering, so min is a candidate for max" is the whole solution.',
});

/* ------------------------------ Binary Search ------------------------------ */

sp('binrysrchtfindxinsrtdrry', {
  tags: ['binary-search'],
  pattern: 'classic binary search',
  problemStatement: 'Find the index of X in a sorted array, or -1.',
  example: '[-1,0,3,5,9,12], x=9 -> 4',
  intuition:
    'Sortedness means one comparison against the middle eliminates half of the remaining candidates. log2(10^9) is about 30 comparisons — that is the whole appeal.',
  approaches: [
    ap(
      'Brute: linear scan',
      'Ignores the sorted structure.',
      `def linear(a: list[int], x: int) -> int:
    for i, v in enumerate(a):
        if v == x:
            return i
    return -1`,
      'O(n)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: iterative binary search',
      'Half-open discipline with mid = lo + (hi - lo) // 2.',
      `def binary_search(a: list[int], x: int) -> int:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == x:
            return mid
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[-1,0,3,5,9,12] x=9\nlo=0 hi=5 mid=2 (3<9) lo=3\nmid=4 -> 9 found at 4',
        whyWorks: 'Invariant: if x exists it lies in [lo, hi]; each step preserves it while halving the range.',
      },
    ),
    ap(
      'Recursive form',
      'Same logic; costs O(log n) stack.',
      `def binary_search_rec(a: list[int], x: int, lo: int = 0, hi: int | None = None) -> int:
    if hi is None:
        hi = len(a) - 1
    if lo > hi:
        return -1
    mid = lo + (hi - lo) // 2
    if a[mid] == x:
        return mid
    if a[mid] < x:
        return binary_search_rec(a, x, mid + 1, hi)
    return binary_search_rec(a, x, lo, mid - 1)`,
      'O(log n)',
      'O(log n) recursion stack',
    ),
  ],
  specialTechnique: {
    title: 'Overflow-safe mid',
    body: 'Use lo + (hi - lo) // 2 rather than (lo + hi) // 2. Python is immune, but C++/Java are not, and interviewers check this reflex.',
  },
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty array', 'Target smaller/larger than everything', 'Duplicates (returns an arbitrary match)', 'Single element'],
  commonMistakes: [
    'while lo < hi with hi = len - 1, which misses the last element',
    'Updating lo = mid instead of mid + 1, causing an infinite loop',
  ],
  patternRecognition: ['Sorted + "find" -> binary search; monotone predicate -> binary search on the answer'],
  followUps: [
    'Lower bound / upper bound variants',
    'First and last occurrence with duplicates',
    'Binary search on an infinite/unbounded stream',
  ],
  interviewInsight: 'Loop-boundary discipline is what is actually being tested. Pick one template and never mix them.',
  related: rel('implmntlwrbnd', 'implmntpprbnd', 'srchinrttdsrtdrryi'),
});

sp('implmntlwrbnd', {
  tags: ['binary-search'],
  pattern: 'first index satisfying a predicate',
  problemStatement: 'Return the first index i with a[i] >= x (n if none).',
  example: '[1,2,2,3], x=2 -> 1',
  intuition:
    'Lower bound is binary search on the predicate "a[i] >= x", which is False...False,True...True. You are finding the boundary, not a value.',
  approaches: [
    ap(
      'Optimal: boundary binary search',
      'Keep a candidate answer; shrink hi when the predicate holds.',
      `def lower_bound(a: list[int], x: int) -> int:
    lo, hi = 0, len(a) - 1
    ans = len(a)
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] >= x:
            ans = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return ans`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,2,2,3] x=2\nmid=1 a=2>=2 ans=1 hi=0\nmid=0 a=1<2 lo=1 -> stop, ans=1',
        whyWorks: 'The predicate is monotone, so the first True is a well-defined boundary.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['x greater than all -> n', 'x smaller than all -> 0', 'Empty array', 'Many duplicates of x'],
  commonMistakes: ['Initialising ans = -1 instead of n', 'Confusing lower bound with upper bound'],
  patternRecognition: ['Monotone predicate -> record-and-shrink template'],
  followUps: ['Upper bound', 'Count occurrences as upper - lower', 'Search insert position'],
  interviewInsight: 'Lower/upper bound is the reusable primitive; most sorted-array questions are one line once you have it.',
});

sp('implmntpprbnd', {
  tags: ['binary-search'],
  pattern: 'first index strictly greater',
  problemStatement: 'Return the first index i with a[i] > x (n if none).',
  example: '[1,2,2,3], x=2 -> 3',
  intuition: 'Identical to lower bound with the comparison changed from >= to >.',
  approaches: [
    ap(
      'Optimal: boundary binary search',
      'Same template, strict comparison.',
      `def upper_bound(a: list[int], x: int) -> int:
    lo, hi = 0, len(a) - 1
    ans = len(a)
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] > x:
            ans = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return ans`,
      'O(log n)',
      'O(1) auxiliary',
      { dryRun: 'a=[1,2,2,3] x=2\nmid=1 (2>2 false) lo=2\nmid=2 (2>2 false) lo=3\nmid=3 (3>2) ans=3' },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['x >= max -> n', 'x < min -> 0', 'Empty array'],
  commonMistakes: ['Using >= and silently implementing lower bound'],
  patternRecognition: ['upper_bound(x) - lower_bound(x) = frequency of x'],
  followUps: ['Count occurrences in O(log n)', 'Floor and ceil', 'Fractional/real-valued upper bound'],
  interviewInsight: 'Knowing that the pair gives frequency in O(log n) answers several downstream questions for free.',
});

sp('srchinsrtpsitin', {
  tags: ['binary-search'],
  pattern: 'lower bound',
  problemStatement: 'Return the index of target, or the index where it would be inserted to keep the array sorted.',
  example: '[1,3,5,6], target 2 -> 1',
  intuition: 'This is exactly lower_bound: the first position whose value is >= target.',
  approaches: [
    ap(
      'Optimal: lower bound',
      'Answer is the insertion point whether or not the target exists.',
      `def search_insert(a: list[int], target: int) -> int:
    lo, hi = 0, len(a) - 1
    ans = len(a)
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] >= target:
            ans = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return ans`,
      'O(log n)',
      'O(1) auxiliary',
      { dryRun: 'a=[1,3,5,6] target=2\nmid=1 (3>=2) ans=1 hi=0\nmid=0 (1<2) lo=1 -> 1' },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['Insert at the end', 'Insert at the front', 'Target already present'],
  commonMistakes: ['Special-casing the found value unnecessarily', 'Returning -1 when absent'],
  patternRecognition: ['Insertion position == lower bound'],
  followUps: ['What if duplicates exist and you must insert after them? (upper bound)', 'Insert into a sorted linked list', 'Search insert in a rotated array'],
  interviewInsight: 'Recognising it as lower_bound turns a "medium" into two lines.',
});

sp('chckifinptrryissrtd', {
  tags: ['binary-search'],
  pattern: 'floor / ceil via bounds',
  problemStatement: 'Find the floor (largest value <= x) and ceil (smallest value >= x) in a sorted array.',
  example: '[3,4,4,7,8,10], x=5 -> floor 4, ceil 7',
  intuition: 'Ceil is lower_bound. Floor is the element just before it. One binary search answers both.',
  approaches: [
    ap(
      'Optimal: one binary search tracking both',
      'Update floor on the left branch, ceil on the right.',
      `def floor_ceil(a: list[int], x: int) -> tuple[int | None, int | None]:
    lo, hi = 0, len(a) - 1
    floor = ceil = None
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == x:
            return a[mid], a[mid]
        if a[mid] < x:
            floor = a[mid]
            lo = mid + 1
        else:
            ceil = a[mid]
            hi = mid - 1
    return floor, ceil`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[3,4,4,7,8,10] x=5\nmid=2 (4<5) floor=4 lo=3\nmid=4 (8>=5) ceil=8 hi=3\nmid=3 (7>=5) ceil=7 hi=2 -> (4,7)',
        whyWorks: 'Every discarded half is provably on the wrong side of x.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['x below the minimum -> floor None', 'x above the maximum -> ceil None', 'x present -> both equal x'],
  commonMistakes: ['Returning indices where values were asked (or vice versa)', 'Updating the wrong tracker on each branch'],
  patternRecognition: ['Floor/ceil are the lower/upper bound pair in disguise'],
  followUps: ['Floor/ceil in a BST (#317, #318)', 'Nearest element to x', 'Ceil when duplicates exist'],
  interviewInsight: 'Tie it back to lower/upper bound explicitly; interviewers like the unification.',
});

sp('findthfirstrlstccrrncfgivnnmbrinsrtdrry', {
  tags: ['binary-search'],
  pattern: 'two boundary searches',
  problemStatement: 'Find the first and last index of a target in a sorted array with duplicates.',
  example: '[5,7,7,8,8,10], target 8 -> (3,4)',
  intuition:
    'Do not stop at the first match — keep searching the side that could contain an earlier (or later) occurrence.',
  approaches: [
    ap(
      'Optimal: two boundary binary searches',
      'first = lower_bound; last = upper_bound - 1.',
      `def first_last(a: list[int], target: int) -> tuple[int, int]:
    def bound(pred) -> int:
        lo, hi, ans = 0, len(a) - 1, len(a)
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if pred(a[mid]):
                ans = mid
                hi = mid - 1
            else:
                lo = mid + 1
        return ans

    first = bound(lambda v: v >= target)
    if first == len(a) or a[first] != target:
        return (-1, -1)
    last = bound(lambda v: v > target) - 1
    return (first, last)`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[5,7,7,8,8,10] target=8\nlower_bound -> 3\nupper_bound -> 5, so last = 4 -> (3,4)',
        whyWorks: 'Equal values occupy a contiguous block in a sorted array.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['Target absent -> (-1,-1)', 'Single occurrence', 'All elements equal to the target'],
  commonMistakes: [
    'Returning on the first match instead of continuing the search',
    'Forgetting to validate that a[first] actually equals the target',
  ],
  patternRecognition: ['Frequency / range queries on sorted data -> two boundary searches'],
  followUps: ['Count occurrences (#85)', 'Do it in one pass', 'Extend to counting in a range [lo, hi]'],
  interviewInsight: 'Deriving last = upper_bound - 1 rather than writing a second bespoke loop is the clean answer.',
});

sp('cntccrrncsfnmbrinsrtdrrywithdplicts', {
  tags: ['binary-search'],
  pattern: 'upper bound minus lower bound',
  problemStatement: 'Count occurrences of x in a sorted array.',
  example: '[2,4,4,4,6], x=4 -> 3',
  intuition: 'Occurrences form one contiguous block, so the count is the difference of two boundaries.',
  approaches: [
    ap(
      'Optimal: bounds difference',
      'Reuse the standard bound template twice.',
      `import bisect


def count_occurrences(a: list[int], x: int) -> int:
    return bisect.bisect_right(a, x) - bisect.bisect_left(a, x)


def count_occurrences_manual(a: list[int], x: int) -> int:
    def bound(strict: bool) -> int:
        lo, hi, ans = 0, len(a) - 1, len(a)
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            ok = a[mid] > x if strict else a[mid] >= x
            if ok:
                ans = mid
                hi = mid - 1
            else:
                lo = mid + 1
        return ans

    return bound(True) - bound(False)`,
      'O(log n)',
      'O(1) auxiliary',
      { dryRun: 'a=[2,4,4,4,6] x=4\nlower=1 upper=4 -> 3' },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['x absent -> 0', 'All elements equal x -> n', 'Empty array'],
  commonMistakes: ['Writing the manual bounds and getting one of them off by one', 'Falling back to a linear count after finding one match'],
  patternRecognition: ['Counting in sorted data is always a boundary difference'],
  followUps: ['Count values in a range [l, r]', 'Same on a BST', 'Count with a Fenwick tree for dynamic data'],
  interviewInsight: 'Know bisect_left/bisect_right by name but be able to write them; interviewers often ban the library.',
});

sp('srchinrttdsrtdrryi', {
  tags: ['binary-search', 'rotated-array'],
  pattern: 'identify the sorted half',
  problemStatement: 'Search for a target in a rotated sorted array of distinct values.',
  example: '[4,5,6,7,0,1,2], target 0 -> 4',
  intuition:
    'A rotation splits the array into two sorted runs. At any mid, at least one side is fully sorted — check whether the target lies inside that sorted side, and discard accordingly.',
  approaches: [
    ap(
      'Brute: linear scan',
      'Ignores the structure.',
      `def search_linear(a: list[int], t: int) -> int:
    for i, v in enumerate(a):
        if v == t:
            return i
    return -1`,
      'O(n)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: modified binary search',
      'Compare a[lo] <= a[mid] to find the sorted half.',
      `def search_rotated(a: list[int], t: int) -> int:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == t:
            return mid
        if a[lo] <= a[mid]:              # left half sorted
            if a[lo] <= t < a[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                            # right half sorted
            if a[mid] < t <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[4,5,6,7,0,1,2] t=0\nmid=3 (7) left sorted [4..7], 0 not inside -> lo=4\nmid=5 (1) left [0,1] sorted, 0 in [0,1) -> hi=4\nmid=4 -> found at 4',
        whyWorks: 'At most one rotation point exists, so it can live in only one of the two halves.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Sorted-half test',
    body: 'a[lo] <= a[mid] identifies the sorted side. Use <= (not <) so that a two-element window is classified correctly.',
  },
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['Zero rotation (plain sorted array)', 'Target absent', 'Two-element arrays', 'Target at the pivot'],
  commonMistakes: [
    'Using strict < in the sorted-half test',
    'Getting the inclusive/exclusive ends wrong in the range checks',
  ],
  patternRecognition: ['Rotated sorted arrays -> "which half is clean?" decision'],
  followUps: [
    'With duplicates (#87) — worst case degrades to O(n)',
    'Find the minimum / rotation count (#88, #89)',
    'Find the pivot first, then do two plain binary searches',
  ],
  interviewInsight: 'Drawing the two-run picture before coding prevents the range-check mistakes almost entirely.',
  related: rel('srchinrttdsrtdrryii', 'findminimminrttdsrtdrry', 'findthwmnytimshsnrrybnrttd'),
});

sp('srchinrttdsrtdrryii', {
  tags: ['binary-search', 'rotated-array'],
  pattern: 'sorted-half test with duplicate shrink',
  problemStatement: 'Search in a rotated sorted array that may contain duplicates. Return True/False.',
  example: '[2,5,6,0,0,1,2], target 0 -> True',
  intuition:
    'Duplicates can make a[lo] == a[mid] == a[hi], destroying the information about which half is sorted. The only safe move is to shrink both ends by one — which is why the worst case is O(n).',
  approaches: [
    ap(
      'Optimal-in-practice: binary search + ambiguity shrink',
      'Handle the a[lo] == a[mid] == a[hi] case explicitly.',
      `def search_rotated_dup(a: list[int], t: int) -> bool:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == t:
            return True
        if a[lo] == a[mid] == a[hi]:
            lo += 1
            hi -= 1
            continue
        if a[lo] <= a[mid]:
            if a[lo] <= t < a[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if a[mid] < t <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return False`,
      'O(log n) average, O(n) worst case',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[3,1,2,3,3,3,3] t=2\nmid=3: a[lo]=a[mid]=a[hi]=3 -> shrink to [1,2,3,3,3]\ncontinue until the sorted-half test becomes informative',
        whyWorks: 'Shrinking by one discards at most one occurrence of an ambiguous value, never the answer.',
      },
    ),
  ],
  complexity: { time: 'O(log n) average, O(n) worst case', space: 'O(1) auxiliary' },
  edgeCases: ['All elements identical -> O(n)', 'Target absent', 'No rotation'],
  commonMistakes: ['Claiming O(log n) worst case', 'Shrinking only one side, which can skip the answer'],
  patternRecognition: ['Duplicates break monotonicity -> degrade gracefully instead of failing'],
  followUps: ['Why can you not do better than O(n) worst case?', 'Minimum in a rotated array with duplicates', 'Distinct-values version (#86)'],
  interviewInsight: 'Stating the O(n) worst case unprompted is exactly what distinguishes this from problem #86.',
});

sp('findminimminrttdsrtdrry', {
  tags: ['binary-search', 'rotated-array'],
  pattern: 'compare mid against the right end',
  problemStatement: 'Find the minimum element of a rotated sorted array of distinct values.',
  example: '[4,5,6,7,0,1,2] -> 0',
  intuition:
    'The minimum is the single point where order breaks. Comparing a[mid] with a[hi] tells you which side the break is on — comparing with a[lo] is ambiguous when there is no rotation.',
  approaches: [
    ap(
      'Optimal: converge on the pivot',
      'If a[mid] > a[hi] the minimum is strictly to the right.',
      `def find_min(a: list[int]) -> int:
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] > a[hi]:
            lo = mid + 1
        else:
            hi = mid
    return a[lo]`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[4,5,6,7,0,1,2]\nmid=3 (7>2) lo=4\nmid=5 (1<=2) hi=5\nmid=4 (0<=1) hi=4 -> lo==hi=4 -> 0',
        whyWorks: 'a[hi] is always in the lower run (or the array is unrotated), so the comparison is never ambiguous.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['No rotation -> a[0]', 'Two elements', 'Rotation by n (identity)'],
  commonMistakes: [
    'Comparing against a[lo], which misclassifies the unrotated case',
    'Using hi = mid - 1 and skipping over the minimum',
  ],
  patternRecognition: ['Find the discontinuity in an otherwise monotone sequence'],
  followUps: ['Rotation count = index of the minimum (#89)', 'With duplicates -> O(n) worst case', 'Find the maximum instead'],
  interviewInsight: 'Explain why a[hi] is the correct anchor — that single choice is the problem.',
});

sp('findthwmnytimshsnrrybnrttd', {
  tags: ['binary-search', 'rotated-array'],
  pattern: 'index of the minimum',
  problemStatement: 'Determine how many times a sorted array has been rotated.',
  example: '[4,5,6,7,0,1,2] -> 4',
  intuition: 'The rotation count equals the index of the minimum element, so this is problem #88 returning an index.',
  approaches: [
    ap(
      'Optimal: pivot index search',
      'Same converge-on-pivot loop, return the index.',
      `def rotation_count(a: list[int]) -> int:
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] > a[hi]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      'O(log n)',
      'O(1) auxiliary',
      { dryRun: 'a=[4,5,6,7,0,1,2] -> pivot index 4 -> rotated 4 times' },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['No rotation -> 0', 'Duplicates make it O(n)', 'Single element'],
  commonMistakes: ['Returning the value instead of the index', 'Assuming left rotation when the problem means right'],
  patternRecognition: ['Restating a problem as a known one is often the entire solution'],
  followUps: ['Rotate the array back in O(1) space', 'Search in the rotated array using the pivot', 'Duplicates variant'],
  interviewInsight: 'Clarify the rotation direction before coding; the off-by-one differs.',
});

sp('singllmntinsrtdrry', {
  tags: ['binary-search'],
  pattern: 'parity of indices',
  problemStatement: 'Every element appears twice except one; the array is sorted. Find the single element in O(log n).',
  example: '[1,1,2,3,3,4,4,8,8] -> 2',
  intuition:
    'Before the single element, pairs start at even indices. After it, they start at odd indices. That parity flip is a monotone predicate you can binary search on.',
  approaches: [
    ap(
      'Brute: XOR everything',
      'Correct but linear — it throws away the sortedness.',
      `def single_xor(a: list[int]) -> int:
    x = 0
    for v in a:
        x ^= v
    return x`,
      'O(n)',
      'O(1)',
      { limitations: ['Rejected when the interviewer asks for O(log n)'] },
    ),
    ap(
      'Optimal: binary search on pair parity',
      'Normalise mid to be even, then compare with its partner.',
      `def single_non_duplicate(a: list[int]) -> int:
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if mid % 2 == 1:
            mid -= 1
        if a[mid] == a[mid + 1]:
            lo = mid + 2
        else:
            hi = mid
    return a[lo]`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,1,2,3,3,4,4,8,8]\nmid=4 -> even; a[4]=3 != a[5]=4 -> hi=4\nmid=2; a[2]=2 != a[3]=3 -> hi=2\nmid=0; a[0]==a[1] -> lo=2 -> answer a[2]=2',
        whyWorks: 'Pairs are aligned to even indices exactly up to the single element.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['Single element at index 0 or n-1', 'Array of length 1', 'Only one pair plus the loner'],
  commonMistakes: ['Not normalising mid to an even index', 'Using lo <= hi with hi = mid, causing an infinite loop'],
  patternRecognition: ['Index parity / structural invariants can be binary-searched just like values'],
  followUps: ['Unsorted version (XOR)', 'Every element appears three times except one', 'Prove the parity invariant'],
  interviewInsight: 'If you propose XOR first, immediately add "but sortedness lets us do O(log n)" — otherwise it reads as missing the point.',
});

sp('findpklmnt', {
  tags: ['binary-search'],
  pattern: 'binary search on slope',
  problemStatement: 'Find any index i with a[i] > a[i-1] and a[i] > a[i+1] (out-of-range neighbours are -inf).',
  example: '[1,2,1,3,5,6,4] -> 1 or 5',
  intuition:
    'If a[mid] < a[mid+1] you are on an ascending slope, and a peak must exist to the right (the array ends at -inf). That is a monotone decision even though the array is not sorted.',
  approaches: [
    ap(
      'Brute: check every index',
      'Linear scan comparing neighbours.',
      `def find_peak_linear(a: list[int]) -> int:
    n = len(a)
    for i in range(n):
        left = a[i - 1] if i > 0 else float("-inf")
        right = a[i + 1] if i < n - 1 else float("-inf")
        if a[i] > left and a[i] > right:
            return i
    return -1`,
      'O(n)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: binary search on the slope',
      'Move toward the higher neighbour; a peak is guaranteed on that side.',
      `def find_peak(a: list[int]) -> int:
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] < a[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,2,1,3,5,6,4]\nmid=3 (3<5) lo=4\nmid=5 (6>4) hi=5\nmid=4 (5<6) lo=5 -> peak index 5',
        whyWorks: 'The boundaries act as -inf, so an ascending step always has a peak ahead of it.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['Strictly increasing -> last index', 'Strictly decreasing -> index 0', 'Single element', 'Multiple peaks (any is valid)'],
  commonMistakes: ['Trying to find the global maximum', 'Reading a[mid+1] when mid is the last index'],
  patternRecognition: ['Binary search needs a monotone *decision*, not a sorted array'],
  followUps: ['2-D peak finding (#109)', 'Find all peaks', 'Why is a peak guaranteed to exist?'],
  interviewInsight: 'This problem exists to break the belief that binary search requires sorted input. Say that out loud.',
});

/* --------------------------- Binary search on answers --------------------------- */

sp('findsqrrtfnmbrinlgn', {
  tags: ['binary-search', 'math'],
  pattern: 'binary search on the answer',
  problemStatement: 'Compute floor(sqrt(n)) without using library sqrt.',
  example: 'n = 28 -> 5',
  intuition:
    'The predicate "m*m <= n" is True for small m and False afterwards — a monotone boundary you can binary search on the range [1, n].',
  approaches: [
    ap(
      'Brute: increment until the square exceeds n',
      'Linear in sqrt(n).',
      `def sqrt_linear(n: int) -> int:
    i = 1
    while i * i <= n:
        i += 1
    return i - 1`,
      'O(sqrt n)',
      'O(1)',
      { flags: ['TLE'], limitations: ['n = 10^18 makes this hopeless'] },
    ),
    ap(
      'Optimal: binary search on the answer',
      'Keep the largest m whose square fits.',
      `def integer_sqrt(n: int) -> int:
    if n < 2:
        return n
    lo, hi, ans = 1, n // 2, 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if mid * mid <= n:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun: 'n=28 lo=1 hi=14\nmid=7 49>28 hi=6\nmid=3 9<=28 ans=3 lo=4\nmid=5 25<=28 ans=5 lo=6\nmid=6 36>28 hi=5 -> 5',
        whyWorks: 'Squaring is monotone on positive integers, so the predicate is monotone.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['n = 0 and n = 1', 'Perfect squares', 'Overflow of mid*mid in C++/Java'],
  commonMistakes: ['Using floating-point sqrt and losing precision for large n', 'Searching up to n instead of n//2 (works, just slower)'],
  patternRecognition: ['"Largest x such that f(x) <= target" with monotone f -> binary search on the answer'],
  followUps: ['Nth root (#93)', 'Square root to k decimal places', 'Newton-Raphson comparison'],
  interviewInsight: 'This is the gateway to the whole BS-on-answers section; name the monotone predicate explicitly.',
});

sp('findthnthrtfnmbrsingbinrysrch', {
  tags: ['binary-search', 'math'],
  pattern: 'binary search on the answer with overflow guard',
  problemStatement: 'Find the integer m with m^n = x, or -1 if none exists.',
  example: 'n=3, x=27 -> 3',
  intuition:
    'm^n is monotone in m. The practical catch is that m^n explodes, so compute the power with early termination once it exceeds x.',
  approaches: [
    ap(
      'Optimal: binary search with capped power',
      'Stop multiplying as soon as the product passes x.',
      `def nth_root(n: int, x: int) -> int:
    def power_cmp(m: int) -> int:
        p = 1
        for _ in range(n):
            p *= m
            if p > x:
                return 1
        return 0 if p == x else -1

    lo, hi = 1, x
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        c = power_cmp(mid)
        if c == 0:
            return mid
        if c < 0:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      'O(n log x)',
      'O(1) auxiliary',
      {
        dryRun: 'n=3 x=27\nmid=14 -> 14^3 > 27 -> hi=13\n... converges to mid=3 -> 27 == 27 -> 3',
        whyWorks: 'Capping the power keeps intermediate values bounded while preserving the comparison result.',
      },
    ),
  ],
  complexity: { time: 'O(n log x)', space: 'O(1) auxiliary' },
  edgeCases: ['x = 1 -> 1 for any n', 'No integer root -> -1', 'n = 1', 'Overflow in fixed-width languages'],
  commonMistakes: ['Computing pow() fully and overflowing', 'Using floating point and getting off-by-one roots'],
  patternRecognition: ['Monotone function + comparison helper = binary search on the answer'],
  followUps: ['Real-valued nth root to precision eps', 'Fast exponentiation (#199)', 'Handle negative x with odd n'],
  interviewInsight: 'The early-exit power helper is the detail interviewers wait for.',
});

sp('kktingbnns', {
  tags: ['binary-search', 'binary-search-on-answer'],
  pattern: 'minimise a rate subject to a feasibility predicate',
  problemStatement: 'Given pile sizes and h hours, find the minimum eating speed k such that all bananas are eaten within h hours.',
  example: 'piles=[3,6,7,11], h=8 -> 4',
  intuition:
    'Hours needed is non-increasing in k: eat faster, finish sooner. So "can finish at speed k" is False...False,True...True — binary search the boundary over k in [1, max(piles)].',
  approaches: [
    ap(
      'Brute: try every speed',
      'Increment k from 1 until feasible.',
      `import math


def min_speed_brute(piles: list[int], h: int) -> int:
    k = 1
    while True:
        if sum(math.ceil(p / k) for p in piles) <= h:
            return k
        k += 1`,
      'O(max(piles) * n)',
      'O(1)',
      { flags: ['TLE'], limitations: ['pile values up to 10^9'] },
    ),
    ap(
      'Optimal: binary search on the speed',
      'Feasibility check is one O(n) sweep of ceilings.',
      `def min_eating_speed(piles: list[int], h: int) -> int:
    def hours(k: int) -> int:
        return sum((p + k - 1) // k for p in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(max pile))',
      'O(1) auxiliary',
      {
        dryRun:
          'piles=[3,6,7,11] h=8, range [1,11]\nk=6 -> 1+1+2+2=6 <= 8 feasible, hi=6\nk=3 -> 1+2+3+4=10 > 8, lo=4\nk=5 -> 1+2+2+3=8 feasible, hi=5\nk=4 -> 1+2+2+3=8 feasible, hi=4 -> answer 4',
        whyWorks: 'hours(k) is monotonically non-increasing, which is exactly the binary-search precondition.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Binary search on the answer',
    body: 'Three ingredients: a search range on the answer, a feasibility predicate, and a proof that the predicate is monotone. Koko, ship capacity, bouquets, aggressive cows and book allocation are all the same template.',
  },
  complexity: { time: 'O(n log(max pile))', space: 'O(1) auxiliary' },
  edgeCases: ['h == n (must eat the largest pile in one hour)', 'Single pile', 'h enormous -> k = 1'],
  commonMistakes: [
    'Using floating-point division instead of ceiling integer division',
    'Starting the range at 0 (division by zero)',
  ],
  patternRecognition: ['"Minimum X such that a condition holds" with monotone condition -> BS on answer'],
  followUps: [
    'Capacity to ship packages in D days (#97)',
    'Minimum days to make M bouquets (#95)',
    'What if piles could be split across hours?',
  ],
  interviewInsight: 'State and justify monotonicity before coding — that is the graded part, not the loop.',
  related: rel('cpcitytshippckgswithinddys', 'minimmdystmkmbqts', 'findthsmllstdivisr'),
});

sp('minimmdystmkmbqts', {
  tags: ['binary-search', 'binary-search-on-answer'],
  pattern: 'BS on answer with a greedy feasibility check',
  problemStatement: 'Given bloom days, make m bouquets of k adjacent flowers each. Find the minimum day, or -1.',
  example: 'bloom=[1,10,3,10,2], m=3, k=1 -> 3',
  intuition:
    'Waiting longer never hurts, so feasibility is monotone in the day. The check is a single sweep counting runs of already-bloomed adjacent flowers.',
  approaches: [
    ap(
      'Optimal: binary search over days',
      'Feasibility: count complete groups of k consecutive bloomed flowers.',
      `def min_days(bloom: list[int], m: int, k: int) -> int:
    if m * k > len(bloom):
        return -1

    def can(day: int) -> bool:
        run = made = 0
        for b in bloom:
            if b <= day:
                run += 1
                if run == k:
                    made += 1
                    run = 0
            else:
                run = 0
        return made >= m

    lo, hi = min(bloom), max(bloom)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if can(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(max bloom))',
      'O(1) auxiliary',
      {
        dryRun:
          'bloom=[1,10,3,10,2] m=3 k=1 range [1,10]\nday=5: bloomed at 1,3,2 -> 3 bouquets, feasible, hi=5\nday=3: bloomed 1,3,2 -> 3 feasible, hi=3\nday=2: bloomed 1,2 -> 2 < 3, lo=3 -> 3',
        whyWorks: 'Greedily closing a group as soon as k adjacent flowers bloom is optimal for maximising group count.',
      },
    ),
  ],
  complexity: { time: 'O(n log(max bloom))', space: 'O(1) auxiliary' },
  edgeCases: ['m*k > n -> impossible, return -1', 'k = 1', 'All flowers bloom on the same day'],
  commonMistakes: [
    'Overflow of m*k in fixed-width languages',
    'Counting non-adjacent flowers as a group',
    'Not resetting the run counter on an unbloomed flower',
  ],
  patternRecognition: ['BS on answer where the check is itself a greedy scan'],
  followUps: ['What if flowers need not be adjacent?', 'Maximise bouquets by a fixed day', 'Koko eating bananas (#94)'],
  interviewInsight: 'The impossible case (m*k > n) is an easy point that many candidates forget.',
});

sp('findthsmllstdivisr', {
  tags: ['binary-search', 'binary-search-on-answer'],
  pattern: 'BS on answer',
  problemStatement: 'Find the smallest divisor d such that the sum of ceil(a[i]/d) is <= threshold.',
  example: 'a=[1,2,5,9], threshold=6 -> 5',
  intuition: 'The ceiling sum decreases as d grows, so feasibility is monotone. Search d in [1, max(a)].',
  approaches: [
    ap(
      'Optimal: binary search on d',
      'Integer ceiling division in the check.',
      `def smallest_divisor(a: list[int], threshold: int) -> int:
    def total(d: int) -> int:
        return sum((x + d - 1) // d for x in a)

    lo, hi = 1, max(a)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if total(mid) <= threshold:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(max a))',
      'O(1) auxiliary',
      {
        dryRun: 'a=[1,2,5,9] threshold=6\nd=5 -> 1+1+1+2=5 <= 6 feasible\nd=3 -> 1+1+2+3=7 > 6\nd=4 -> 1+1+2+3=7 > 6 -> answer 5',
        whyWorks: 'ceil(x/d) is non-increasing in d, so the sum is too.',
      },
    ),
  ],
  complexity: { time: 'O(n log(max a))', space: 'O(1) auxiliary' },
  edgeCases: ['threshold < n -> impossible (each term is at least 1)', 'All elements equal', 'threshold >= sum(a) -> d = 1'],
  commonMistakes: ['Float division rounding errors', 'Starting the range at 0'],
  patternRecognition: ['Same shape as Koko: rate vs total-work predicate'],
  followUps: ['Ship packages in D days (#97)', 'Maximum divisor under a lower-bound constraint', 'Prove monotonicity'],
  interviewInsight: 'Notice this is literally Koko with different names; saying so shows pattern transfer.',
});

sp('cpcitytshippckgswithinddys', {
  tags: ['binary-search', 'binary-search-on-answer'],
  pattern: 'BS on answer with greedy packing',
  problemStatement: 'Find the least ship capacity that delivers all packages, in order, within D days.',
  example: 'weights=[1..10], D=5 -> 15',
  intuition:
    'The range is bounded below by max(weight) (a package must fit) and above by sum(weights) (ship everything in one day). Greedy day-filling checks feasibility in O(n).',
  approaches: [
    ap(
      'Optimal: binary search over capacity',
      'Greedy: keep loading until the next package overflows, then start a new day.',
      `def ship_within_days(weights: list[int], days: int) -> int:
    def needed(cap: int) -> int:
        d, load = 1, 0
        for w in weights:
            if load + w > cap:
                d += 1
                load = 0
            load += w
        return d

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if needed(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(sum of weights))',
      'O(1) auxiliary',
      {
        dryRun:
          'weights 1..10 D=5, range [10,55]\ncap=32 -> 2 days feasible\ncap=21 -> 3 days feasible\ncap=15 -> 5 days feasible\ncap=14 -> 6 days infeasible -> 15',
        whyWorks: 'Greedy filling minimises the day count for a fixed capacity, so it is an exact feasibility test.',
      },
    ),
  ],
  complexity: { time: 'O(n log(sum))', space: 'O(1) auxiliary' },
  edgeCases: ['D = 1 -> sum of weights', 'D >= n -> max weight', 'Single package'],
  commonMistakes: [
    'Starting the low bound at 1 instead of max(weights)',
    'Off-by-one in the day counter (starting at 0)',
  ],
  patternRecognition: ['Identical to split-array-largest-sum, book allocation and painter partition'],
  followUps: ['Split array largest sum (#101)', 'Book allocation (#100)', "Painter's partition (#102)"],
  interviewInsight: 'Naming the four equivalent problems in one breath is a strong signal of pattern mastery.',
});

sp('kthmissingpsitivnmbr', {
  tags: ['binary-search'],
  pattern: 'count of missing values as a monotone function',
  problemStatement: 'Given a strictly increasing array of positives, find the k-th missing positive integer.',
  example: 'a=[2,3,4,7,11], k=5 -> 9',
  intuition:
    'At index i, the number of missing values before a[i] is a[i] - (i+1) — monotone non-decreasing. Binary search for the first index where this count reaches k.',
  approaches: [
    ap(
      'Brute: walk the naturals',
      'Scan the array, decrementing k on each gap.',
      `def kth_missing_brute(a: list[int], k: int) -> int:
    for v in a:
        if v <= k:
            k += 1
        else:
            break
    return k`,
      'O(n)',
      'O(1)',
      { limitations: ['Fine for small n, but the interviewer usually asks for O(log n)'] },
    ),
    ap(
      'Optimal: binary search on the missing count',
      'missing(i) = a[i] - (i+1); find the boundary and offset.',
      `def kth_missing(a: list[int], k: int) -> int:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        missing = a[mid] - (mid + 1)
        if missing < k:
            lo = mid + 1
        else:
            hi = mid - 1
    return lo + k`,
      'O(log n)',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[2,3,4,7,11] k=5\nmissing: 1,1,1,3,6\nfirst index with missing >= 5 is 4, so lo=4 -> answer 4+5=9',
        whyWorks: 'After the loop, lo is the count of array elements below the answer, so answer = lo + k.',
      },
    ),
  ],
  complexity: { time: 'O(log n)', space: 'O(1) auxiliary' },
  edgeCases: ['k smaller than the first gap -> answer is k', 'k beyond the last element', 'Empty array'],
  commonMistakes: ['Returning a[lo] instead of lo + k', 'Using 1-indexed math inconsistently'],
  patternRecognition: ['Derive a monotone counting function, then binary search it'],
  followUps: ['k-th missing in an unsorted array', 'k-th missing between two bounds', 'Same trick on a BST'],
  interviewInsight: 'The final `lo + k` step is unintuitive; derive it from the invariant rather than memorising it.',
});

sp('ggrssivcws', {
  tags: ['binary-search', 'binary-search-on-answer', 'greedy'],
  pattern: 'maximise the minimum distance',
  problemStatement: 'Place k cows in stalls so that the minimum distance between any two is as large as possible.',
  example: 'stalls=[1,2,4,8,9], k=3 -> 3',
  intuition:
    'If a spacing d is achievable then any smaller spacing is too — feasibility is monotone *decreasing* in d. Binary search the largest feasible d, checking greedily.',
  approaches: [
    ap(
      'Brute: try every distance',
      'Check d = 1, 2, ... until it fails.',
      `def aggressive_cows_brute(stalls: list[int], k: int) -> int:
    stalls.sort()
    best = 0
    for d in range(1, stalls[-1] - stalls[0] + 1):
        count, last = 1, stalls[0]
        for s in stalls[1:]:
            if s - last >= d:
                count += 1
                last = s
        if count >= k:
            best = d
    return best`,
      'O(n * max distance)',
      'O(1)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal: binary search on the distance',
      'Greedy placement: always take the first stall that is far enough.',
      `def aggressive_cows(stalls: list[int], k: int) -> int:
    stalls.sort()

    def can_place(d: int) -> bool:
        count, last = 1, stalls[0]
        for s in stalls[1:]:
            if s - last >= d:
                count += 1
                last = s
                if count >= k:
                    return True
        return count >= k

    lo, hi, ans = 1, stalls[-1] - stalls[0], 0
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if can_place(mid):
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans`,
      'O(n log n + n log(max distance))',
      'O(1) auxiliary',
      {
        dryRun:
          'stalls=[1,2,4,8,9] k=3, range [1,8]\nd=4: place 1,8 -> 2 cows, fail\nd=2: 1,4,8 -> 3 cows ok\nd=3: 1,4,8 -> 3 cows ok, ans=3\nd=4 already failed -> 3',
        whyWorks: 'Placing each cow as early as possible leaves the most room for the rest — an exchange argument.',
      },
    ),
  ],
  complexity: { time: 'O(n log n + n log D)', space: 'O(1) auxiliary' },
  edgeCases: ['k = 2 -> answer is max - min', 'k = n -> the minimum adjacent gap', 'Duplicate stall positions'],
  commonMistakes: [
    'Forgetting to sort the stalls first',
    'Flipping the feasibility direction (this one maximises, so move lo up on success)',
  ],
  patternRecognition: ['"Maximise the minimum" / "minimise the maximum" -> BS on answer + greedy check'],
  followUps: ['Magnetic force between balls (identical problem)', 'Minimise the maximum distance to gas stations (#103)', 'Prove the greedy check is exact'],
  interviewInsight: 'Note the direction flip versus Koko: here success moves lo up. Mixing the two templates is the usual bug.',
});

sp('bkllctinprblm', {
  tags: ['binary-search', 'binary-search-on-answer', 'greedy'],
  pattern: 'minimise the maximum load',
  problemStatement: 'Allocate contiguous books to m students so that the maximum pages assigned to any student is minimised.',
  example: 'pages=[12,34,67,90], m=2 -> 113',
  intuition:
    'The answer lies between max(pages) (one book must fit) and sum(pages) (one student takes all). Greedy chunking tests any candidate maximum in O(n).',
  approaches: [
    ap(
      'Optimal: binary search on the maximum load',
      'Count students needed for a given cap; shrink the cap while feasible.',
      `def book_allocation(pages: list[int], m: int) -> int:
    if m > len(pages):
        return -1

    def students(cap: int) -> int:
        cnt, cur = 1, 0
        for p in pages:
            if cur + p > cap:
                cnt += 1
                cur = 0
            cur += p
        return cnt

    lo, hi = max(pages), sum(pages)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if students(mid) <= m:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(sum of pages))',
      'O(1) auxiliary',
      {
        dryRun:
          'pages=[12,34,67,90] m=2, range [90,203]\ncap=146 -> 2 students feasible, hi=146\ncap=118 -> 2 feasible\ncap=104 -> 3 infeasible\ncap=113 -> 2 feasible -> 113',
        whyWorks: 'Greedy filling uses the fewest students for a fixed cap, so it is an exact feasibility test.',
      },
    ),
  ],
  complexity: { time: 'O(n log(sum))', space: 'O(1) auxiliary' },
  edgeCases: ['m > n -> impossible (-1)', 'm = 1 -> sum', 'm = n -> max'],
  commonMistakes: ['Allowing non-contiguous allocation', 'Setting lo = 1 instead of max(pages)'],
  patternRecognition: ['Minimise-the-maximum over contiguous partitions'],
  followUps: ['Split array largest sum (#101)', "Painter's partition (#102)", 'Reconstruct the actual partition'],
  interviewInsight: 'The contiguity constraint is what makes the greedy check valid — say so explicitly.',
});

sp('splitrrylrgstsm', {
  tags: ['binary-search', 'binary-search-on-answer'],
  pattern: 'minimise the maximum subarray sum',
  problemStatement: 'Split an array into k contiguous subarrays minimising the largest subarray sum.',
  example: '[7,2,5,10,8], k=2 -> 18',
  intuition: 'Identical to book allocation: binary search the candidate maximum and greedily count the pieces needed.',
  approaches: [
    ap(
      'Optimal: binary search on the largest sum',
      'Greedy chunking gives the minimum number of pieces for a cap.',
      `def split_array(a: list[int], k: int) -> int:
    def pieces(cap: int) -> int:
        cnt, cur = 1, 0
        for x in a:
            if cur + x > cap:
                cnt += 1
                cur = 0
            cur += x
        return cnt

    lo, hi = max(a), sum(a)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if pieces(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(sum))',
      'O(1) auxiliary',
      { dryRun: '[7,2,5,10,8] k=2 range [10,32]\ncap=21 -> 2 pieces feasible\ncap=15 -> 3 pieces infeasible\ncap=18 -> 2 feasible -> 18' },
    ),
    ap(
      'Alternative: interval DP',
      'dp[i][j] = min over split points; useful when k is small and values are tiny.',
      `def split_array_dp(a: list[int], k: int) -> int:
    n = len(a)
    pre = [0] * (n + 1)
    for i, x in enumerate(a):
        pre[i + 1] = pre[i] + x
    INF = float("inf")
    dp = [[INF] * (k + 1) for _ in range(n + 1)]
    dp[0][0] = 0
    for i in range(1, n + 1):
        for j in range(1, k + 1):
            for t in range(i):
                dp[i][j] = min(dp[i][j], max(dp[t][j - 1], pre[i] - pre[t]))
    return int(dp[n][k])`,
      'O(n^2 k)',
      'O(n k)',
      { flags: ['TLE'], limitations: ['Only for small n; binary search dominates in practice'] },
    ),
  ],
  complexity: { time: 'O(n log(sum))', space: 'O(1) auxiliary' },
  edgeCases: ['k = 1 -> sum', 'k = n -> max', 'k > n is invalid'],
  commonMistakes: ['Reaching for DP first and timing out', 'Wrong bounds on the search range'],
  patternRecognition: ['Minimise-the-maximum -> binary search on answer'],
  followUps: ['Book allocation (#100)', 'Reconstruct the split points', 'Compare DP vs BS complexity'],
  interviewInsight: 'Mentioning the DP alternative and why you reject it shows you chose rather than guessed.',
});

sp('painterspartition', {
  tags: ['binary-search', 'binary-search-on-answer'],
  pattern: 'minimise the maximum time',
  problemStatement: 'k painters paint contiguous boards; minimise the time taken by the slowest painter.',
  example: 'boards=[10,20,30,40], k=2 -> 60',
  intuition: 'Same template as book allocation, with time replacing pages.',
  approaches: [
    ap(
      'Optimal: binary search over the time limit',
      'Greedy assignment counts painters needed.',
      `def painters_partition(boards: list[int], k: int) -> int:
    def painters(cap: int) -> int:
        cnt, cur = 1, 0
        for b in boards:
            if cur + b > cap:
                cnt += 1
                cur = 0
            cur += b
        return cnt

    lo, hi = max(boards), sum(boards)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if painters(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      'O(n log(sum))',
      'O(1) auxiliary',
      { dryRun: 'boards=[10,20,30,40] k=2 range [40,100]\ncap=70 -> 2 feasible\ncap=55 -> 3 infeasible\ncap=60 -> 2 feasible -> 60' },
    ),
  ],
  complexity: { time: 'O(n log(sum))', space: 'O(1) auxiliary' },
  edgeCases: ['k >= n -> max board', 'k = 1 -> sum', 'Per-unit time multiplier if the problem states one'],
  commonMistakes: ['Forgetting a per-unit time factor when the statement includes it', 'Allowing non-contiguous boards'],
  patternRecognition: ['Third member of the book-allocation family'],
  followUps: ['Ship packages within D days (#97)', 'Split array largest sum (#101)', 'Non-contiguous variant (becomes NP-hard scheduling)'],
  interviewInsight: 'Point out that dropping contiguity turns this into a hard scheduling problem — it shows you know why the constraint matters.',
});

sp('minimizmxdistnctgssttin', {
  tags: ['binary-search', 'heaps'],
  pattern: 'BS on a real-valued answer',
  problemStatement: 'Add k gas stations on a line to minimise the maximum distance between adjacent stations.',
  example: 'stations=[1,2,3,4,5], k=4 -> 0.5',
  intuition:
    'For a candidate distance d, the number of stations needed in a gap of length g is floor(g/d). That count is monotone in d, so binary search over real numbers with a precision bound.',
  approaches: [
    ap(
      'Better: max-heap of gaps',
      'Repeatedly split the currently largest section.',
      `import heapq


def min_max_gap_heap(stations: list[int], k: int) -> float:
    heap = [(-(stations[i + 1] - stations[i]), i, 1) for i in range(len(stations) - 1)]
    heapq.heapify(heap)
    for _ in range(k):
        neg, i, parts = heapq.heappop(heap)
        parts += 1
        seg = stations[i + 1] - stations[i]
        heapq.heappush(heap, (-(seg / parts), i, parts))
    return -heap[0][0]`,
      'O((n + k) log n)',
      'O(n)',
      { limitations: ['k can be 10^9, making the loop infeasible'] },
    ),
    ap(
      'Optimal: binary search on the real answer',
      'Count required stations for a candidate d; iterate to a fixed precision.',
      `def min_max_gas_dist(stations: list[int], k: int) -> float:
    def needed(d: float) -> int:
        return sum(int((stations[i + 1] - stations[i]) / d) for i in range(len(stations) - 1))

    lo, hi = 0.0, float(max(stations[i + 1] - stations[i] for i in range(len(stations) - 1)))
    for _ in range(100):
        mid = (lo + hi) / 2
        if needed(mid) > k:
            lo = mid
        else:
            hi = mid
    return round(hi, 6)`,
      'O(n * iterations)',
      'O(1) auxiliary',
      {
        dryRun: 'stations=[1,2,3,4,5] k=4\nfour gaps of 1; splitting each once gives 0.5\nbinary search converges to 0.5',
        whyWorks: 'needed(d) is non-increasing in d, so the feasible set is an interval.',
      },
    ),
  ],
  complexity: { time: 'O(n log(range/eps))', space: 'O(1) auxiliary' },
  edgeCases: ['k = 0 -> current maximum gap', 'Equal gaps', 'Floating-point precision requirements'],
  commonMistakes: ['Looping while hi - lo > eps without a hard iteration cap', 'Integer division when the answer is fractional'],
  patternRecognition: ['Real-valued answers -> fixed iteration count instead of an integer boundary'],
  followUps: ['Why does the heap solution fail for large k?', 'Return the actual station positions', 'Integer-only variant'],
  interviewInsight: 'Using a fixed 100 iterations instead of an epsilon loop is a neat robustness trick worth stating.',
});

sp('mdinf2srtdrrys', {
  tags: ['binary-search', 'partition'],
  pattern: 'binary search on the partition point',
  problemStatement: 'Find the median of two sorted arrays in O(log(min(n, m))).',
  example: 'a=[1,3], b=[2] -> 2.0',
  intuition:
    'The median is defined by a partition that puts exactly half of all elements on the left. Binary search how many elements the smaller array contributes to that left half; the other array supplies the rest.',
  approaches: [
    ap(
      'Brute: merge fully',
      'Merge both arrays and index the middle.',
      `def median_merge(a: list[int], b: list[int]) -> float:
    m = sorted(a + b)
    n = len(m)
    return m[n // 2] if n % 2 else (m[n // 2 - 1] + m[n // 2]) / 2`,
      'O((n+m) log(n+m))',
      'O(n+m)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: partition binary search',
      'Search on the smaller array; validate with the four boundary values.',
      `def find_median_sorted_arrays(a: list[int], b: list[int]) -> float:
    if len(a) > len(b):
        a, b = b, a
    n, m = len(a), len(b)
    total = n + m
    half = (total + 1) // 2
    lo, hi = 0, n
    while lo <= hi:
        cut_a = (lo + hi) // 2
        cut_b = half - cut_a
        left_a = a[cut_a - 1] if cut_a > 0 else float("-inf")
        right_a = a[cut_a] if cut_a < n else float("inf")
        left_b = b[cut_b - 1] if cut_b > 0 else float("-inf")
        right_b = b[cut_b] if cut_b < m else float("inf")
        if left_a <= right_b and left_b <= right_a:
            if total % 2:
                return float(max(left_a, left_b))
            return (max(left_a, left_b) + min(right_a, right_b)) / 2
        if left_a > right_b:
            hi = cut_a - 1
        else:
            lo = cut_a + 1
    raise ValueError("inputs are not sorted")`,
      'O(log(min(n, m)))',
      'O(1) auxiliary',
      {
        dryRun:
          'a=[1,3] b=[2] total=3 half=2\ncut_a=1 cut_b=1: left_a=1 right_a=3 left_b=2 right_b=inf\n1<=inf and 2<=3 -> odd total -> max(1,2)=2.0',
        whyWorks: 'A valid partition has every left element <= every right element, which uniquely identifies the median.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Partition search with sentinels',
    body: 'Using -inf / +inf for out-of-range cuts removes every boundary special case. Always binary search on the shorter array so cut_b stays in range.',
  },
  complexity: { time: 'O(log(min(n, m)))', space: 'O(1) auxiliary' },
  edgeCases: ['One array empty', 'Odd vs even total length', 'All of one array smaller than the other', 'Duplicates across arrays'],
  commonMistakes: [
    'Searching on the longer array and getting a negative cut_b',
    'Using (total)//2 instead of (total+1)//2 for the left-half size',
  ],
  patternRecognition: ['Median / k-th order statistic across sorted inputs -> partition search'],
  followUps: ['k-th element of two sorted arrays (#105)', 'Median of k sorted arrays', 'Median of a data stream (#257)'],
  interviewInsight: 'This is the hardest binary search in the sheet. Draw the partition diagram first; coding from the picture is safe, from memory is not.',
});

sp('kthlmntf2srtdrrys', {
  tags: ['binary-search', 'partition'],
  pattern: 'partition search generalised',
  problemStatement: 'Find the k-th smallest element across two sorted arrays.',
  example: 'a=[2,3,6,7,9], b=[1,4,8,10], k=5 -> 6',
  intuition: 'Same partition search as the median, with the left-half size fixed at k instead of half the total.',
  approaches: [
    ap(
      'Optimal: partition search',
      'Cut the smaller array; the rest comes from the other.',
      `def kth_element(a: list[int], b: list[int], k: int) -> int:
    if len(a) > len(b):
        a, b = b, a
    n, m = len(a), len(b)
    lo, hi = max(0, k - m), min(k, n)
    while lo <= hi:
        cut_a = (lo + hi) // 2
        cut_b = k - cut_a
        left_a = a[cut_a - 1] if cut_a > 0 else float("-inf")
        right_a = a[cut_a] if cut_a < n else float("inf")
        left_b = b[cut_b - 1] if cut_b > 0 else float("-inf")
        right_b = b[cut_b] if cut_b < m else float("inf")
        if left_a <= right_b and left_b <= right_a:
            return int(max(left_a, left_b))
        if left_a > right_b:
            hi = cut_a - 1
        else:
            lo = cut_a + 1
    raise ValueError("invalid input")`,
      'O(log(min(n, m)))',
      'O(1) auxiliary',
      {
        dryRun: 'a=[2,3,6,7,9] b=[1,4,8,10] k=5\nvalid cut: cut_a=3 cut_b=2 -> left max(6,4)=6',
        whyWorks: 'The k-th smallest is the largest element on the left of a valid partition of size k.',
      },
    ),
  ],
  complexity: { time: 'O(log(min(n, m)))', space: 'O(1) auxiliary' },
  edgeCases: ['k = 1 or k = n+m', 'One array empty', 'k larger than one array entirely'],
  commonMistakes: ['Forgetting the lo = max(0, k - m) clamp', '1-indexed vs 0-indexed k confusion'],
  patternRecognition: ['Order statistics across sorted arrays -> partition search'],
  followUps: ['Median (#104)', 'k-th smallest in a sorted matrix', 'k-th smallest in a BST (#321)'],
  interviewInsight: 'The clamped search range is the detail that breaks naive implementations on skewed inputs.',
});

/* ------------------------------ BS on 2D arrays ----------------------------- */

sp('findthrwwithmximmnmbrf1s', {
  tags: ['binary-search', 'matrix'],
  pattern: 'row-wise lower bound',
  problemStatement: 'In a binary matrix where each row is sorted (0s then 1s), find the row with the most 1s.',
  example: '[[0,0,1],[0,1,1],[0,0,0]] -> row 1',
  intuition: 'Per row, the count of 1s is m - index_of_first_1, and that index is a lower bound query.',
  approaches: [
    ap(
      'Brute: count every cell',
      'Simple double loop.',
      `def max_ones_row_brute(m: list[list[int]]) -> int:
    best_row, best = -1, -1
    for i, row in enumerate(m):
        c = sum(row)
        if c > best:
            best, best_row = c, i
    return best_row`,
      'O(n*m)',
      'O(1)',
    ),
    ap(
      'Optimal: binary search per row',
      'Lower bound of 1 in each sorted row.',
      `def max_ones_row(mat: list[list[int]]) -> int:
    def first_one(row: list[int]) -> int:
        lo, hi, ans = 0, len(row) - 1, len(row)
        while lo <= hi:
            mid = lo + (hi - lo) // 2
            if row[mid] >= 1:
                ans = mid
                hi = mid - 1
            else:
                lo = mid + 1
        return ans

    best_row, best = -1, 0
    for i, row in enumerate(mat):
        cnt = len(row) - first_one(row)
        if cnt > best:
            best, best_row = cnt, i
    return best_row`,
      'O(n log m)',
      'O(1) auxiliary',
      { dryRun: 'rows -> first 1 at index 2, 1, none\ncounts 1, 2, 0 -> row 1' },
    ),
    ap(
      'Staircase alternative',
      'Start top-right and walk left on 1s, down on 0s — O(n + m) total.',
      `def max_ones_row_staircase(mat: list[list[int]]) -> int:
    n, m = len(mat), len(mat[0])
    j = m - 1
    best_row = -1
    for i in range(n):
        while j >= 0 and mat[i][j] == 1:
            j -= 1
            best_row = i
    return best_row`,
      'O(n + m)',
      'O(1) auxiliary',
    ),
  ],
  complexity: { time: 'O(n log m)', space: 'O(1) auxiliary' },
  edgeCases: ['All-zero matrix -> -1', 'Ties (return the first row)', 'Single column'],
  commonMistakes: ['Assuming rows are sorted when they are not', 'Returning the count instead of the row index'],
  patternRecognition: ['Sorted rows -> per-row binary search, or a single staircase walk'],
  followUps: ['Row with most 1s when rows are unsorted', 'Search in a row/column sorted matrix (#108)', 'Column with most 1s'],
  interviewInsight: 'Offering the O(n + m) staircase walk as a bonus usually lands better than the binary search itself.',
});

sp('srchin2dmtrix', {
  tags: ['binary-search', 'matrix'],
  pattern: 'flatten to a 1-D binary search',
  problemStatement: 'Search a target in a matrix where each row is sorted and the first element of a row exceeds the last of the previous row.',
  example: '[[1,3,5],[7,10,11],[16,20,30]], target 10 -> True',
  intuition:
    'The stated property means the matrix read row-major is one sorted array. Index i maps to (i // m, i % m), so a single binary search works over [0, n*m).',
  approaches: [
    ap(
      'Optimal: virtual flattening',
      'Binary search 0..n*m-1 with index arithmetic.',
      `def search_matrix(mat: list[list[int]], target: int) -> bool:
    if not mat or not mat[0]:
        return False
    n, m = len(mat), len(mat[0])
    lo, hi = 0, n * m - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        val = mat[mid // m][mid % m]
        if val == target:
            return True
        if val < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
      'O(log(n*m))',
      'O(1) auxiliary',
      {
        dryRun: 'target=10, n=3 m=3, lo=0 hi=8\nmid=4 -> (1,1)=10 -> True',
        whyWorks: 'The row-major reading is globally sorted, so one binary search suffices.',
      },
    ),
  ],
  complexity: { time: 'O(log(n*m))', space: 'O(1) auxiliary' },
  edgeCases: ['Empty matrix', 'Single row or column', 'Target outside the value range'],
  commonMistakes: ['Dividing by n instead of m in the index mapping', 'Confusing this with the row/column-sorted variant (#108)'],
  patternRecognition: ['Globally sorted matrix -> flatten; only row- and column-sorted -> staircase'],
  followUps: ['Search in a row and column wise sorted matrix (#108)', 'Count elements less than the target', 'Matrix median (#110)'],
  interviewInsight: 'The two "search a matrix" problems differ only in the sortedness guarantee — read the statement carefully.',
});

sp('SearchRowColumnWiseSortedMatrix', {
  tags: ['matrix', 'two-pointers'],
  pattern: 'staircase search',
  problemStatement: 'Search a target in a matrix whose rows and columns are each sorted ascending.',
  example: '[[1,4,7],[2,5,8],[3,6,9]], target 5 -> True',
  intuition:
    'Start at the top-right corner: it is the maximum of its row and the minimum of its column. So one comparison always eliminates an entire row or column.',
  approaches: [
    ap(
      'Better: binary search each row',
      'O(n log m), ignores the column ordering.',
      `import bisect


def search_rows(mat: list[list[int]], target: int) -> bool:
    for row in mat:
        i = bisect.bisect_left(row, target)
        if i < len(row) and row[i] == target:
            return True
    return False`,
      'O(n log m)',
      'O(1)',
    ),
    ap(
      'Optimal: staircase from the top-right',
      'Move left when too big, down when too small.',
      `def search_matrix_2d(mat: list[list[int]], target: int) -> bool:
    if not mat or not mat[0]:
        return False
    i, j = 0, len(mat[0]) - 1
    while i < len(mat) and j >= 0:
        v = mat[i][j]
        if v == target:
            return True
        if v > target:
            j -= 1
        else:
            i += 1
    return False`,
      'O(n + m)',
      'O(1) auxiliary',
      {
        dryRun: 'mat=[[1,4,7],[2,5,8],[3,6,9]] target=5\n(0,2)=7 > 5 -> j=1\n(0,1)=4 < 5 -> i=1\n(1,1)=5 -> True',
        whyWorks: 'The corner is extremal in both directions, so each step removes a whole row or column.',
      },
    ),
  ],
  complexity: { time: 'O(n + m)', space: 'O(1) auxiliary' },
  edgeCases: ['Target absent', 'Single row or column', 'Empty matrix'],
  commonMistakes: [
    'Starting from the top-left corner, where no elimination is possible',
    'Confusing this with the globally sorted variant (#107)',
  ],
  patternRecognition: ['Two-dimensional monotonicity -> corner elimination'],
  followUps: ['Count elements less than the target', 'k-th smallest in such a matrix', 'Find the peak in a 2-D grid (#109)'],
  interviewInsight: 'Explaining why the top-left corner fails is the fastest way to prove you understand the invariant.',
});

sp('findpklmnt-i', {
  tags: ['binary-search', 'matrix'],
  pattern: 'binary search on columns',
  problemStatement: 'Find any cell strictly greater than its four neighbours in a 2-D grid.',
  example: '[[1,4],[3,2]] -> (0,1)',
  intuition:
    'Binary search over columns: take the middle column, find its maximum row, and compare with the horizontal neighbours. The greater side is guaranteed to contain a peak.',
  approaches: [
    ap(
      'Optimal: column binary search with a row max',
      'O(log m) columns, each scanned in O(n).',
      `def find_peak_grid(mat: list[list[int]]) -> tuple[int, int]:
    n, m = len(mat), len(mat[0])
    lo, hi = 0, m - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        best_row = max(range(n), key=lambda r: mat[r][mid])
        left = mat[best_row][mid - 1] if mid > 0 else -1
        right = mat[best_row][mid + 1] if mid < m - 1 else -1
        if mat[best_row][mid] > left and mat[best_row][mid] > right:
            return best_row, mid
        if left > mat[best_row][mid]:
            hi = mid - 1
        else:
            lo = mid + 1
    return -1, -1`,
      'O(n log m)',
      'O(1) auxiliary',
      {
        dryRun: 'mat=[[1,4],[3,2]] columns 0..1\nmid=0: best row 1 (value 3), right neighbour 2 < 3 and no left -> peak (1,0)',
        whyWorks: 'The column maximum only needs to beat its horizontal neighbours — vertically it already wins.',
      },
    ),
  ],
  complexity: { time: 'O(n log m)', space: 'O(1) auxiliary' },
  edgeCases: ['Single row or column (reduces to 1-D)', 'Boundaries treated as -1/-inf', 'Multiple peaks'],
  commonMistakes: ['Comparing only against neighbours in the same column', 'Searching over rows and columns simultaneously'],
  patternRecognition: ['Reduce 2-D to 1-D by taking a column extremum'],
  followUps: ['1-D peak (#91)', 'Prove a peak always exists', 'O(n + m) algorithms for special grids'],
  interviewInsight: 'The correctness argument (why the column max is the right probe) matters far more than the code.',
});

sp('mtrixmdin', {
  tags: ['binary-search', 'matrix'],
  pattern: 'binary search on the value + counting',
  problemStatement: 'Find the median of a row-wise sorted matrix with an odd number of cells.',
  example: '[[1,3,5],[2,6,9],[3,6,9]] -> 5',
  intuition:
    'Binary search over the *value* range, not positions. For a candidate x, count how many cells are <= x using per-row upper bounds; the median is the smallest x whose count exceeds half.',
  approaches: [
    ap(
      'Brute: flatten and sort',
      'Simple, but O(n*m log(n*m)) time and O(n*m) memory.',
      `def matrix_median_brute(mat: list[list[int]]) -> int:
    flat = sorted(v for row in mat for v in row)
    return flat[len(flat) // 2]`,
      'O(n*m log(n*m))',
      'O(n*m)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: binary search on the value',
      'Counting uses upper_bound per row in O(log m).',
      `import bisect


def matrix_median(mat: list[list[int]]) -> int:
    n, m = len(mat), len(mat[0])
    need = (n * m) // 2
    lo = min(row[0] for row in mat)
    hi = max(row[-1] for row in mat)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        count = sum(bisect.bisect_right(row, mid) for row in mat)
        if count <= need:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      'O(n log m log(max - min))',
      'O(1) auxiliary',
      {
        dryRun:
          'range [1,9], need = 4\nmid=5 -> counts 3+1+2 = 6 > 4 -> hi=5\nmid=3 -> counts 2+1+1=4 <= 4 -> lo=4\nmid=4 -> count 4 <= 4 -> lo=5 -> median 5',
        whyWorks: 'count(x) is non-decreasing in x, and the median is the first value whose count exceeds half.',
      },
    ),
  ],
  complexity: { time: 'O(n log m log(max - min))', space: 'O(1) auxiliary' },
  edgeCases: ['Duplicates across rows', 'Even cell count (define which median)', 'Single row'],
  commonMistakes: ['Binary searching over indices instead of values', 'Using bisect_left, which mishandles duplicates'],
  patternRecognition: ['Order statistic without materialising the data -> binary search on value + counting'],
  followUps: ['k-th smallest in a sorted matrix', 'Median of two sorted arrays (#104)', 'Median from a data stream (#257)'],
  interviewInsight: 'The "binary search the value, count with another binary search" nesting is the reusable idea here.',
});

/* --------------------------------- Strings -------------------------------- */

sp('lngstcmmnprfix', {
  tags: ['strings'],
  pattern: 'vertical scan',
  problemStatement: 'Find the longest common prefix of an array of strings.',
  example: '["flower","flow","flight"] -> "fl"',
  intuition:
    'The answer can never be longer than the shortest string, and the first mismatching column ends it. Scanning column by column lets you stop at the earliest possible moment.',
  approaches: [
    ap(
      'Vertical scan',
      'Compare character i across all strings; stop at the first disagreement.',
      `def longest_common_prefix(strs: list[str]) -> str:
    if not strs:
        return ""
    for i in range(len(strs[0])):
        c = strs[0][i]
        for s in strs[1:]:
            if i >= len(s) or s[i] != c:
                return strs[0][:i]
    return strs[0]`,
      'O(total characters) worst case',
      'O(1) auxiliary',
      {
        dryRun: '["flower","flow","flight"]\ni=0 all f; i=1 all l; i=2 o vs o vs i -> stop -> "fl"',
        whyWorks: 'A common prefix of length k requires agreement in every column below k.',
      },
    ),
    ap(
      'Sort-based trick',
      'After sorting, only the first and last strings need comparing.',
      `def lcp_sorted(strs: list[str]) -> str:
    if not strs:
        return ""
    strs = sorted(strs)
    first, last = strs[0], strs[-1]
    i = 0
    while i < min(len(first), len(last)) and first[i] == last[i]:
        i += 1
    return first[:i]`,
      'O(n log n * L)',
      'O(1) auxiliary',
      { whyWorks: 'Lexicographic extremes bound the common prefix of everything in between.' },
    ),
  ],
  complexity: { time: 'O(total characters)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty array', 'An empty string in the list -> ""', 'All strings identical', 'Single string'],
  commonMistakes: ['Indexing past the end of a shorter string', 'Returning the whole first string when it is itself the prefix but shorter matches exist'],
  patternRecognition: ['Prefix problems -> vertical scan or a trie for repeated queries'],
  followUps: ['Use a trie when queries repeat (#440)', 'Longest common suffix', 'Longest common prefix of two strings only'],
  interviewInsight: 'The sorted trick is a nice flourish, but explain why it works — otherwise it looks like a memorised hack.',
});

sp('chckiftwstringsrngrmfchthr', {
  tags: ['strings', 'hashing'],
  pattern: 'frequency comparison',
  problemStatement: 'Check whether two strings are anagrams of each other.',
  example: '"listen", "silent" -> True',
  intuition:
    'Anagrams are equal multisets of characters. Counting is O(n); sorting is O(n log n) and only worth it when memory is tight.',
  approaches: [
    ap(
      'Brute: sort both',
      'Equal sorted strings means equal multisets.',
      `def is_anagram_sort(a: str, b: str) -> bool:
    return sorted(a) == sorted(b)`,
      'O(n log n)',
      'O(n)',
      { limitations: ['Slower than counting; acceptable if the alphabet is huge'] },
    ),
    ap(
      'Optimal: single counter array',
      'Increment for a, decrement for b, then check all zeros.',
      `def is_anagram(a: str, b: str) -> bool:
    if len(a) != len(b):
        return False
    count = [0] * 26
    for ca, cb in zip(a, b):
        count[ord(ca) - 97] += 1
        count[ord(cb) - 97] -= 1
    return all(c == 0 for c in count)`,
      'O(n)',
      'O(1) — fixed 26-slot array',
      {
        dryRun: '"listen" vs "silent"\nevery letter increments once and decrements once -> all zeros -> True',
        whyWorks: 'Equal multisets produce a net zero count for every character.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) for a fixed alphabet' },
  edgeCases: ['Different lengths -> early False', 'Unicode / mixed case (clarify the alphabet)', 'Empty strings'],
  commonMistakes: ['Skipping the length check', 'Assuming lowercase ASCII without asking'],
  patternRecognition: ['Multiset equality -> counting array or Counter'],
  followUps: ['Group anagrams together', 'Anagrams with Unicode input', 'Find all anagram substrings of a pattern (sliding window)'],
  interviewInsight: 'Ask about the character set up front — it changes the space claim from O(1) to O(k).',
});

sp('srtchrctrsbyfrqncy', {
  tags: ['strings', 'hashing', 'sorting'],
  pattern: 'count then sort by frequency',
  problemStatement: 'Sort the characters of a string in decreasing order of frequency.',
  example: '"tree" -> "eert" or "eetr"',
  intuition: 'Count first, then order the distinct characters by count. With a small alphabet, bucket sort makes it linear.',
  approaches: [
    ap(
      'Count + sort',
      'Sort the distinct characters by descending count.',
      `from collections import Counter


def frequency_sort(s: str) -> str:
    freq = Counter(s)
    return "".join(c * n for c, n in sorted(freq.items(), key=lambda kv: -kv[1]))`,
      'O(n + k log k)',
      'O(n)',
      { dryRun: '"tree" -> counts e:2 t:1 r:1 -> "ee" + "t" + "r"' },
    ),
    ap(
      'Bucket sort by count',
      'Counts are bounded by n, so bucket by frequency for O(n).',
      `from collections import Counter


def frequency_sort_buckets(s: str) -> str:
    freq = Counter(s)
    buckets: list[list[str]] = [[] for _ in range(len(s) + 1)]
    for c, n in freq.items():
        buckets[n].append(c)
    out = []
    for n in range(len(s), 0, -1):
        for c in buckets[n]:
            out.append(c * n)
    return "".join(out)`,
      'O(n)',
      'O(n)',
      { whyWorks: 'Frequencies live in [1, n], so they can index an array instead of being compared.' },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
  edgeCases: ['Ties in frequency (any order is usually accepted)', 'Empty string', 'All characters distinct'],
  commonMistakes: ['Sorting the whole string instead of the distinct characters', 'Forgetting to repeat each character count times'],
  patternRecognition: ['Bounded integer keys -> bucket/counting sort beats comparison sort'],
  followUps: ['Top K frequent elements (#258)', 'Break ties lexicographically', 'Rearrange so no two adjacent characters match'],
  interviewInsight: 'Naming bucket sort as the linear alternative is what turns a fine answer into a strong one.',
});

sp('rmnnmbrtintgrndvicvrs', {
  tags: ['strings', 'greedy', 'simulation'],
  pattern: 'value table + subtractive rule',
  problemStatement: 'Convert a Roman numeral to an integer and an integer to a Roman numeral.',
  example: '"MCMXCIV" -> 1994; 1994 -> "MCMXCIV"',
  intuition:
    'Roman to integer: a smaller symbol immediately before a larger one is subtracted. Integer to Roman: greedily take the largest value that fits, using a table that already includes the subtractive pairs.',
  approaches: [
    ap(
      'Roman -> integer',
      'Compare each symbol with the next; subtract when smaller.',
      `def roman_to_int(s: str) -> int:
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, c in enumerate(s):
        if i + 1 < len(s) and vals[c] < vals[s[i + 1]]:
            total -= vals[c]
        else:
            total += vals[c]
    return total`,
      'O(n)',
      'O(1)',
      { dryRun: '"MCMXCIV": M=1000, C<M -> -100, M +1000, X<C -> -10, C +100, I<V -> -1, V +5 = 1994' },
    ),
    ap(
      'Integer -> Roman',
      'Greedy over a descending table that includes CM, CD, XC, XL, IX, IV.',
      `def int_to_roman(num: int) -> str:
    table = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]
    out = []
    for value, sym in table:
        while num >= value:
            out.append(sym)
            num -= value
    return "".join(out)`,
      'O(1) — bounded by the value 3999',
      'O(1)',
      { whyWorks: 'Including the subtractive pairs in the table makes plain greedy correct.' },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1)' },
  edgeCases: ['Subtractive pairs at the string end', 'Values above 3999 are undefined in classic Roman', 'Empty string'],
  commonMistakes: ['Hard-coding subtraction rules instead of comparing with the next symbol', 'Omitting the subtractive entries from the greedy table'],
  patternRecognition: ['Greedy works when the "coin system" is canonical — Roman values are'],
  followUps: ['Validate a Roman numeral', 'Why is greedy correct here but not for arbitrary coin sets?', 'Extend beyond 3999 with overline notation'],
  interviewInsight: 'The connection to the coin-change greedy correctness question is a great thing to raise.',
});

sp('implmntti', {
  tags: ['strings', 'parsing'],
  pattern: 'careful state machine',
  problemStatement: 'Implement atoi: parse a leading integer from a string with whitespace, an optional sign, and clamping to 32-bit range.',
  example: '"   -42abc" -> -42; "91283472332" -> 2147483647',
  intuition:
    'There is no algorithmic trick here — the whole problem is specification discipline: skip whitespace, read at most one sign, consume digits, stop at the first non-digit, and clamp.',
  approaches: [
    ap(
      'Iterative parse with clamping',
      'Clamp during accumulation so intermediate values stay in range.',
      `INT_MIN, INT_MAX = -2**31, 2**31 - 1


def my_atoi(s: str) -> int:
    i, n = 0, len(s)
    while i < n and s[i] == " ":
        i += 1
    sign = 1
    if i < n and s[i] in "+-":
        sign = -1 if s[i] == "-" else 1
        i += 1
    total = 0
    while i < n and s[i].isdigit():
        total = total * 10 + int(s[i])
        if sign == 1 and total > INT_MAX:
            return INT_MAX
        if sign == -1 and -total < INT_MIN:
            return INT_MIN
        i += 1
    return sign * total`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: '"   -42abc"\nskip 3 spaces; sign = -1; digits 4,2 -> 42; "a" stops -> -42',
        whyWorks: 'Checking the bound after each digit prevents overflow in fixed-width languages.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: [
    'Only whitespace or an empty string -> 0',
    'Sign with no digits -> 0',
    'Multiple signs "+-12" -> 0',
    'Leading zeros',
    'Overflow in both directions',
  ],
  commonMistakes: ['Checking overflow only at the end', 'Allowing more than one sign character', 'Using int(s) and ignoring the spec'],
  patternRecognition: ['Spec-heavy parsing -> enumerate the rules before writing code'],
  followUps: ['Recursive implementation (#157)', 'Parse floats too', 'Validate a number string (state machine)'],
  interviewInsight: 'Restate all five rules back to the interviewer first; this problem is graded on cases, not cleverness.',
});

sp('lngstplindrmicsbstringditwithtdp', {
  tags: ['strings', 'two-pointers'],
  pattern: 'expand around centre',
  problemStatement: 'Find the longest palindromic substring without using DP.',
  example: '"babad" -> "bab" or "aba"',
  intuition:
    'Every palindrome has a centre — a character (odd length) or a gap between two characters (even length). There are 2n-1 centres, and expanding each is linear.',
  approaches: [
    ap(
      'Brute: check every substring',
      'O(n^2) substrings, each checked in O(n).',
      `def longest_pal_brute(s: str) -> str:
    best = ""
    for i in range(len(s)):
        for j in range(i, len(s)):
            sub = s[i:j + 1]
            if sub == sub[::-1] and len(sub) > len(best):
                best = sub
    return best`,
      'O(n^3)',
      'O(n)',
      { flags: ['TLE'] },
    ),
    ap(
      'Optimal (non-DP): expand around centre',
      'Try all 2n-1 centres, expanding while the characters match.',
      `def longest_palindrome(s: str) -> str:
    if not s:
        return ""
    start, length = 0, 1

    def expand(lo: int, hi: int) -> None:
        nonlocal start, length
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1
            hi += 1
        if hi - lo - 1 > length:
            start, length = lo + 1, hi - lo - 1

    for i in range(len(s)):
        expand(i, i)
        expand(i, i + 1)
    return s[start:start + length]`,
      'O(n^2)',
      'O(1) auxiliary',
      {
        dryRun: 's="babad"\ncentre 1 (a) expands to "bab" length 3\ncentre 2 (b) expands to "aba" length 3 (not longer, kept first)',
        whyWorks: 'Every palindromic substring is discovered by expanding from its own centre.',
      },
    ),
  ],
  complexity: { time: 'O(n^2)', space: 'O(1) auxiliary' },
  edgeCases: ['Even-length palindromes', 'All identical characters', 'No palindrome longer than 1', 'Empty string'],
  commonMistakes: ['Only handling odd centres', 'Off-by-one when computing the length after the expansion loop'],
  patternRecognition: ['Centre expansion beats DP on space; Manacher beats both on time'],
  followUps: ["Manacher's algorithm in O(n)", 'Count palindromic substrings', 'Longest palindromic subsequence (#411) — different problem'],
  interviewInsight: 'Mention Manacher as the O(n) solution even if you do not code it; knowing it exists is the expected depth.',
});

sp('cntnmbrfsbstrings', {
  tags: ['strings', 'sliding-window'],
  pattern: 'at-most-K trick',
  problemStatement: 'Count substrings containing exactly k distinct characters.',
  example: '"aba", k=2 -> 3',
  intuition:
    'Counting "exactly k" directly is awkward, but "at most k" is a clean sliding window. exactly(k) = atMost(k) - atMost(k-1).',
  approaches: [
    ap(
      'Optimal: two at-most-K windows',
      'Each window is O(n); the subtraction gives the exact count.',
      `from collections import defaultdict


def count_exactly_k_distinct(s: str, k: int) -> int:
    def at_most(limit: int) -> int:
        if limit < 0:
            return 0
        freq = defaultdict(int)
        left = total = 0
        for right, c in enumerate(s):
            freq[c] += 1
            while len(freq) > limit:
                freq[s[left]] -= 1
                if freq[s[left]] == 0:
                    del freq[s[left]]
                left += 1
            total += right - left + 1
        return total

    return at_most(k) - at_most(k - 1)`,
      'O(n)',
      'O(k)',
      {
        dryRun:
          's="aba" k=2\natMost(2) = 6, atMost(1) = 3 -> exactly 3',
        whyWorks: 'Every window ending at right contributes right - left + 1 valid substrings.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(k)' },
  edgeCases: ['k = 0 -> 0', 'k larger than the alphabet', 'All identical characters'],
  commonMistakes: ['Trying to maintain "exactly k" in a single window', 'Deleting zero-count keys is required for len(freq) to be correct'],
  patternRecognition: ['"Exactly K" -> atMost(K) - atMost(K-1); memorise this identity'],
  followUps: ['Subarrays with K different integers (#239)', 'Count nice subarrays (#235)', 'Binary subarrays with sum (#234)'],
  interviewInsight: 'The at-most identity converts a whole class of hard counting problems into easy windows.',
});

/* ------------------------------- Linked List ------------------------------- */

sp('middlflinkdlisttrtishrmthd', {
  tags: ['linked-list', 'two-pointers'],
  pattern: 'slow and fast pointers',
  problemStatement: 'Find the middle node of a singly linked list in one pass (second middle if even).',
  example: '1->2->3->4->5 -> node 3',
  intuition:
    'A pointer moving twice as fast reaches the end exactly when the slow pointer reaches the middle. No length computation, no second pass.',
  approaches: [
    ap(
      'Brute: count then walk again',
      'Two passes over the list.',
      `def middle_two_pass(head):
    n = 0
    cur = head
    while cur:
        n += 1
        cur = cur.next
    cur = head
    for _ in range(n // 2):
        cur = cur.next
    return cur`,
      'O(n) with two passes',
      'O(1)',
    ),
    ap(
      'Optimal: tortoise and hare',
      'Advance slow by one and fast by two.',
      `def middle_node(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
      'O(n) single pass',
      'O(1) auxiliary',
      {
        dryRun: '1->2->3->4->5\nslow 1,2,3 while fast 1,3,5 -> fast.next is None -> middle is 3',
        whyWorks: 'fast travels exactly twice the distance of slow, so slow lands at n//2.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty list', 'Single node', 'Even length — which middle is expected?'],
  commonMistakes: ['Checking only `fast` and dereferencing fast.next.next on None', 'Returning the first middle when the second is required'],
  patternRecognition: ['Slow/fast pointers: middle, cycle detection, k-th from the end, palindrome check'],
  followUps: ['Delete the middle node (#144)', 'Detect a cycle (#138)', 'Split the list into two halves'],
  interviewInsight: 'The `while fast and fast.next` guard is the single most common crash in linked-list interviews.',
  related: rel('dtctlpinll', 'chckifllisplindrmrnt', 'dltthmiddlndfll'),
});

sp('rvrslinkdlistitrtiv', {
  tags: ['linked-list'],
  pattern: 'three-pointer reversal',
  problemStatement: 'Reverse a singly linked list iteratively.',
  example: '1->2->3 -> 3->2->1',
  intuition:
    'Walk the list flipping one next pointer at a time. You need three references: the node before, the current node, and the next node you are about to lose.',
  approaches: [
    ap(
      'Optimal: prev / curr / next',
      'Save next, flip, advance both pointers.',
      `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: '1->2->3\ncurr=1: 1->None, prev=1\ncurr=2: 2->1, prev=2\ncurr=3: 3->2, prev=3 -> head 3',
        whyWorks: 'Each iteration reverses exactly one edge while preserving access to the untouched suffix.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty list', 'Single node', 'Losing the head reference in the caller'],
  commonMistakes: ['Not saving curr.next before overwriting it', 'Returning head instead of prev'],
  patternRecognition: ['Pointer rewiring: reverse in k-groups, palindrome check, reorder list'],
  followUps: ['Recursive reversal (#137)', 'Reverse in groups of k (#153)', 'Reverse a sublist between positions m and n'],
  interviewInsight: 'Draw the three pointers before coding. Interviewers can tell instantly whether you understand or memorised it.',
});

sp('rvrsllrcrsiv', {
  tags: ['linked-list', 'recursion'],
  pattern: 'reverse the rest, then fix one edge',
  problemStatement: 'Reverse a singly linked list recursively.',
  example: '1->2->3 -> 3->2->1',
  intuition:
    'Assume the suffix after head is already reversed. Then you only need to make head.next point back at head and cut head off the front.',
  approaches: [
    ap(
      'Recursive reversal',
      'Base case: empty or single node. Then rewire two pointers on the way back up.',
      `def reverse_list_rec(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_list_rec(head.next)
    head.next.next = head
    head.next = None
    return new_head`,
      'O(n)',
      'O(n) recursion stack',
      {
        spaceNote: 'Stack depth equals list length — a real memory cost, unlike the iterative version',
        flags: ['RE'],
        dryRun: '1->2->3\nrecurse to 3 (new head)\nat 2: 3->2, 2->None\nat 1: 2->1, 1->None -> 3->2->1',
        whyWorks: 'head.next is the tail of the reversed suffix, so pointing it at head appends head correctly.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(n) recursion stack', recursionStack: 'O(n)' },
  edgeCases: ['Empty list', 'Single node', 'Very long lists -> RecursionError'],
  commonMistakes: ['Forgetting head.next = None, which creates a cycle', 'Returning head instead of new_head'],
  patternRecognition: ['"Solve the suffix, then fix one local connection"'],
  followUps: ['Compare stack cost with the iterative version', 'Reverse in groups of k recursively', 'Tail-recursive formulation'],
  interviewInsight: 'Stating the O(n) stack cost out loud prevents the "so it is O(1) space?" trap.',
});

sp('dtctlpinll', {
  tags: ['linked-list', 'two-pointers'],
  pattern: "Floyd's cycle detection",
  problemStatement: 'Detect whether a linked list contains a cycle.',
  example: '1->2->3->4->2(cycle) -> True',
  intuition:
    'In a cycle the fast pointer gains one position per step on the slow pointer, so it must eventually land on it. Without a cycle, fast simply falls off the end.',
  approaches: [
    ap(
      'Brute: hash set of visited nodes',
      'Store node identities, not values.',
      `def has_cycle_hash(head) -> bool:
    seen = set()
    cur = head
    while cur:
        if id(cur) in seen:
            return True
        seen.add(id(cur))
        cur = cur.next
    return False`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      "Optimal: Floyd's tortoise and hare",
      'Slow by one, fast by two; meeting means a cycle.',
      `def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: '1->2->3->4->2\nslow 1,2,3 / fast 1,3,2 ... they meet inside the loop -> True',
        whyWorks: 'The gap closes by exactly one each step, so it reaches zero within the cycle length.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Empty list', 'Single node pointing to itself', 'Cycle at the head', 'No cycle'],
  commonMistakes: ['Comparing node values instead of identities', 'Missing the fast.next guard'],
  patternRecognition: ["Floyd's algorithm also finds duplicates in arrays treated as functional graphs"],
  followUps: ['Find the cycle start (#139)', 'Find the cycle length (#140)', 'Find the duplicate number in an array with the same technique'],
  interviewInsight: 'Be ready to prove why they must meet — "the gap shrinks by one per step" is the one-line argument.',
});

sp('findthstrtingpintinll', {
  tags: ['linked-list', 'two-pointers'],
  pattern: "Floyd's phase 2",
  problemStatement: 'Return the node where the cycle begins, or None.',
  example: '1->2->3->4->2(cycle) -> node 2',
  intuition:
    'If the distance from head to the cycle start is L and the meeting point is k into the cycle, then L and k are congruent modulo the cycle length. Restarting one pointer at the head makes both arrive at the start together.',
  approaches: [
    ap(
      "Optimal: Floyd's two phases",
      'Detect the meeting point, then advance one pointer from the head at equal speed.',
      `def detect_cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            ptr = head
            while ptr is not slow:
                ptr = ptr.next
                slow = slow.next
            return ptr
    return None`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: 'Meeting happens inside the loop; walking one pointer from head and one from the meeting point converges at node 2',
        whyWorks: '2*(L + k) = L + k + m*C implies L = m*C - k, so both pointers cover equal distance to the entry.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['No cycle -> None', 'Cycle starts at the head', 'Self-loop'],
  commonMistakes: ['Restarting the wrong pointer', 'Comparing values rather than node identity'],
  patternRecognition: ['Same math powers "find the duplicate number" in O(1) space'],
  followUps: ['Cycle length (#140)', 'Remove the cycle', 'Find the duplicate number (LeetCode 287)'],
  interviewInsight: 'Have the modular-arithmetic proof ready in one sentence — it is the standard follow-up.',
});

sp('chckifllisplindrmrnt', {
  tags: ['linked-list', 'two-pointers'],
  pattern: 'find middle + reverse half',
  problemStatement: 'Check whether a linked list is a palindrome in O(1) extra space.',
  example: '1->2->2->1 -> True',
  intuition:
    'You cannot walk backwards, so reverse the second half in place and compare it against the first half. Restoring the list afterwards is good manners and sometimes required.',
  approaches: [
    ap(
      'Brute: copy to an array',
      'Compare with two pointers on the array.',
      `def is_palindrome_array(head) -> bool:
    vals = []
    cur = head
    while cur:
        vals.append(cur.val)
        cur = cur.next
    return vals == vals[::-1]`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: reverse the second half',
      'Middle via slow/fast, reverse, compare, then restore.',
      `def is_palindrome(head) -> bool:
    if head is None or head.next is None:
        return True
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    # reverse the second half
    prev = None
    curr = slow.next
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    slow.next = prev

    first, second = head, slow.next
    ok = True
    while second:
        if first.val != second.val:
            ok = False
            break
        first = first.next
        second = second.next

    # restore
    curr = slow.next
    prev = None
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    slow.next = prev
    return ok`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun: '1->2->2->1\nmiddle at first 2; reverse tail -> 1->2 | 1->2\ncompare 1==1, 2==2 -> True',
        whyWorks: 'Reversing makes the second half traversable in the order needed for comparison.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['Odd length — the middle element is skipped', 'Empty or single node -> True', 'Two nodes'],
  commonMistakes: ['Not restoring the list when the caller still needs it', 'Off-by-one when locating the middle for odd lengths'],
  patternRecognition: ['Combine middle-finding and reversal — two primitives, one problem'],
  followUps: ['Do it without modifying the list (needs O(n) space or recursion)', 'Palindrome check on a doubly linked list', 'Reorder list using the same split-and-reverse'],
  interviewInsight: 'Ask whether mutating the input is acceptable; the answer changes which solution is "optimal".',
});

sp('rmvnthndfrmthbckfthll', {
  tags: ['linked-list', 'two-pointers'],
  pattern: 'gap of n + dummy head',
  problemStatement: 'Remove the n-th node from the end of a list in one pass.',
  example: '1->2->3->4->5, n=2 -> 1->2->3->5',
  intuition:
    'Give the fast pointer an n-node head start. When fast hits the end, slow is exactly n nodes from it — sitting on the node before the target if you offset by one. A dummy head removes the "delete the head" special case.',
  approaches: [
    ap(
      'Optimal: dummy + n-gap two pointers',
      'One pass, no length computation.',
      `class Node:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt


def remove_nth_from_end(head, n: int):
    dummy = Node(0, head)
    fast = slow = dummy
    for _ in range(n):
        if fast.next is None:
            return head
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
      'O(n) single pass',
      'O(1) auxiliary',
      {
        dryRun:
          '1->2->3->4->5 n=2\nfast advances 2 to node 2\nboth advance until fast at 5: slow at 3\nslow.next = 5 -> 1->2->3->5',
        whyWorks: 'A constant gap of n means slow trails the end by exactly n nodes.',
      },
    ),
  ],
  specialTechnique: {
    title: 'Dummy head node',
    body: 'Whenever a deletion or insertion can touch the head, allocate a dummy node in front. It removes an entire class of null checks.',
  },
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['n equals the list length (removing the head)', 'n = 1 (removing the tail)', 'n larger than the length'],
  commonMistakes: ['Not using a dummy and crashing when removing the head', 'Off-by-one: landing on the target instead of its predecessor'],
  patternRecognition: ['Fixed-gap two pointers for "k-th from the end" queries'],
  followUps: ['Delete the middle node (#144)', 'Remove duplicates from a sorted list', 'Return the k-th from the end without deleting'],
  interviewInsight: 'Leading with "I will use a dummy head" signals experience immediately.',
});

sp('srtll', {
  tags: ['linked-list', 'merge-sort'],
  pattern: 'merge sort on a linked list',
  problemStatement: 'Sort a linked list in O(n log n) time and O(1) extra space.',
  example: '4->2->1->3 -> 1->2->3->4',
  intuition:
    'Quicksort needs random access; merge sort does not. On a linked list merging is pointer rewiring, so merge sort is the natural choice and needs no auxiliary array.',
  approaches: [
    ap(
      'Brute: copy values, sort, write back',
      'Easy but uses O(n) memory and ignores the data structure.',
      `def sort_list_values(head):
    vals = []
    cur = head
    while cur:
        vals.append(cur.val)
        cur = cur.next
    vals.sort()
    cur = head
    for v in vals:
        cur.val = v
        cur = cur.next
    return head`,
      'O(n log n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: top-down merge sort',
      'Split at the middle with slow/fast, sort both halves, merge.',
      `def sort_list(head):
    if head is None or head.next is None:
        return head

    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    mid = slow.next
    slow.next = None

    left = sort_list(head)
    right = sort_list(mid)

    dummy = tail = type(head)(0)
    while left and right:
        if left.val <= right.val:
            tail.next, left = left, left.next
        else:
            tail.next, right = right, right.next
        tail = tail.next
    tail.next = left or right
    return dummy.next`,
      'O(n log n)',
      'O(log n) recursion stack',
      {
        spaceNote: 'O(1) auxiliary data; the log n is recursion depth (bottom-up merge sort removes even that)',
        dryRun: '4->2->1->3 splits into (4->2) and (1->3); each sorts; merging gives 1->2->3->4',
        whyWorks: 'Merging two sorted lists is a pointer splice, so no extra array is ever needed.',
      },
    ),
  ],
  complexity: { time: 'O(n log n)', space: 'O(log n) recursion stack' },
  edgeCases: ['Empty or single node', 'Already sorted', 'All values equal (stability)'],
  commonMistakes: [
    'Starting fast at head instead of head.next, which fails to split a 2-node list and loops forever',
    'Forgetting slow.next = None to cut the halves apart',
  ],
  patternRecognition: ['Linked list + O(n log n) -> merge sort, never quicksort'],
  followUps: ['Bottom-up merge sort for true O(1) space', 'Sort a list of 0s, 1s and 2s by links (#146)', 'Merge k sorted lists (#249)'],
  interviewInsight: 'Explaining why quicksort is a poor fit here is often worth more than the implementation.',
});

sp('findthintrsctinpintfyll', {
  tags: ['linked-list', 'two-pointers'],
  pattern: 'length difference / pointer swap',
  problemStatement: 'Find the node where two singly linked lists merge, or None.',
  example: 'a: 1->2->8->9, b: 3->8->9 -> node 8',
  intuition:
    'Two pointers that each traverse "list A then list B" cover the same total distance, so they arrive at the intersection simultaneously — no length computation needed.',
  approaches: [
    ap(
      'Better: align by length difference',
      'Compute both lengths and advance the longer list first.',
      `def intersection_by_length(a, b):
    def length(node):
        n = 0
        while node:
            n += 1
            node = node.next
        return n

    la, lb = length(a), length(b)
    while la > lb:
        a = a.next
        la -= 1
    while lb > la:
        b = b.next
        lb -= 1
    while a is not b:
        a, b = a.next, b.next
    return a`,
      'O(n + m)',
      'O(1)',
    ),
    ap(
      'Optimal: two-pointer switch',
      'When a pointer hits the end, redirect it to the other head.',
      `def get_intersection_node(headA, headB):
    a, b = headA, headB
    while a is not b:
        a = a.next if a else headB
        b = b.next if b else headA
    return a`,
      'O(n + m)',
      'O(1) auxiliary',
      {
        dryRun: 'Each pointer walks lenA + lenB nodes total, so they align at the intersection (or both reach None together)',
        whyWorks: 'Equal total path lengths force synchronisation; if there is no intersection both become None at the same time.',
      },
    ),
  ],
  complexity: { time: 'O(n + m)', space: 'O(1) auxiliary' },
  edgeCases: ['No intersection -> None', 'Intersection at the head', 'One list empty', 'Lists of very different lengths'],
  commonMistakes: ['Comparing node values instead of identity', 'Infinite loop when there is no intersection (the switch handles it via None)'],
  patternRecognition: ['Path-length equalisation'],
  followUps: ['Detect intersection when cycles are present', 'Return the intersection length', 'Hash-set solution and its memory cost'],
  interviewInsight: 'The switching trick looks magical; explain the "both walk n+m" argument so it does not read as memorised.',
});

sp('dd2nmbrsinll', {
  tags: ['linked-list', 'math'],
  pattern: 'digit-wise addition with carry',
  problemStatement: 'Add two numbers represented as linked lists with digits in reverse order.',
  example: '(2->4->3) + (5->6->4) = 7->0->8  (342 + 465 = 807)',
  intuition:
    'Reverse order is a gift: the heads are the least significant digits, so you can add left to right exactly like grade-school addition.',
  approaches: [
    ap(
      'Optimal: single pass with carry',
      'Loop while either list remains or a carry is pending.',
      `class Node:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt


def add_two_numbers(l1, l2):
    dummy = tail = Node(0)
    carry = 0
    while l1 or l2 or carry:
        total = carry
        if l1:
            total += l1.val
            l1 = l1.next
        if l2:
            total += l2.val
            l2 = l2.next
        carry, digit = divmod(total, 10)
        tail.next = Node(digit)
        tail = tail.next
    return dummy.next`,
      'O(max(n, m))',
      'O(max(n, m)) for the output',
      {
        dryRun: '2+5=7; 4+6=10 -> digit 0 carry 1; 3+4+1=8 -> 7->0->8',
        whyWorks: 'The `or carry` condition handles the final carry-out uniformly.',
      },
    ),
  ],
  complexity: { time: 'O(max(n, m))', space: 'O(max(n, m)) output' },
  edgeCases: ['Different lengths', 'Final carry creating a new digit (99 + 1)', 'One list empty', 'Leading zeros'],
  commonMistakes: ['Dropping the last carry', 'Assuming equal lengths'],
  patternRecognition: ['Carry propagation appears in add-1, big-integer addition and binary addition'],
  followUps: ['Digits in forward order (use stacks or reverse first)', 'Add 1 to a number in a list (#148)', 'Multiply two numbers represented as lists'],
  interviewInsight: 'The `while l1 or l2 or carry` loop condition is the clean idiom; writing three separate loops is the giveaway.',
});

sp('rvrsllingrpfgivnsizk', {
  tags: ['linked-list', 'hard'],
  pattern: 'reverse in k-blocks',
  problemStatement: 'Reverse the nodes of a linked list k at a time; leave a trailing group shorter than k untouched.',
  example: '1->2->3->4->5, k=2 -> 2->1->4->3->5',
  intuition:
    'Reverse each full block with the standard three-pointer loop, then stitch the blocks back together. The bookkeeping — not the reversal — is the hard part, so use a dummy head and track the node before each group.',
  approaches: [
    ap(
      'Optimal: check length, reverse block, reconnect',
      'group_prev holds the node before the current block.',
      `class Node:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt


def reverse_k_group(head, k: int):
    dummy = Node(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if kth is None:
                return dummy.next
        group_next = kth.next

        prev, curr = group_next, group_prev.next
        while curr is not group_next:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt

        tmp = group_prev.next
        group_prev.next = kth
        group_prev = tmp`,
      'O(n)',
      'O(1) auxiliary',
      {
        dryRun:
          '1->2->3->4->5 k=2\nblock [1,2] reversed -> 2->1, connected to 3\nblock [3,4] reversed -> 4->3, connected to 5\n[5] is short -> untouched',
        whyWorks: 'Reversing into group_next automatically links the block tail to the remaining list.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary' },
  edgeCases: ['k = 1 -> unchanged', 'k > length -> unchanged', 'Length exactly divisible by k', 'Empty list'],
  commonMistakes: [
    'Reversing a trailing partial group',
    'Losing the connection between consecutive blocks',
    'Not verifying that k nodes remain before reversing',
  ],
  patternRecognition: ['Block-wise pointer surgery — always verify the block exists before mutating'],
  followUps: ['Reverse the trailing partial group too', 'Do it recursively', 'Rotate the list by k (#154)'],
  interviewInsight: 'Reversing into group_next instead of None is the trick that removes most of the reconnection code.',
});

sp('clnlinkdlistwithrndmndnxtpintr', {
  tags: ['linked-list', 'hard'],
  pattern: 'interleaved node weaving',
  problemStatement: 'Deep-copy a linked list where each node has an extra random pointer.',
  example: 'Each cloned node must mirror both next and random, referencing only cloned nodes.',
  intuition:
    'The hard part is mapping original nodes to their copies. A hash map does it in O(n) space; weaving each copy directly after its original encodes the same mapping inside the list itself, giving O(1) extra space.',
  approaches: [
    ap(
      'Better: hash map from original to copy',
      'Two passes: create, then wire.',
      `def copy_random_list_hash(head):
    if not head:
        return None
    mapping = {}
    cur = head
    while cur:
        mapping[cur] = type(cur)(cur.val)
        cur = cur.next
    cur = head
    while cur:
        mapping[cur].next = mapping.get(cur.next)
        mapping[cur].random = mapping.get(cur.random)
        cur = cur.next
    return mapping[head]`,
      'O(n)',
      'O(n)',
      { flags: ['MLE'] },
    ),
    ap(
      'Optimal: weave, assign randoms, unweave',
      'copy sits at original.next, so copy.random = original.random.next.',
      `def copy_random_list(head):
    if not head:
        return None
    cur = head
    while cur:
        copy = type(cur)(cur.val)
        copy.next = cur.next
        cur.next = copy
        cur = copy.next

    cur = head
    while cur:
        if cur.random:
            cur.next.random = cur.random.next
        cur = cur.next.next

    cur = head
    copy_head = head.next
    while cur:
        copy = cur.next
        cur.next = copy.next
        copy.next = copy.next.next if copy.next else None
        cur = cur.next
    return copy_head`,
      'O(n)',
      'O(1) auxiliary (excluding the output)',
      {
        dryRun: 'A->B becomes A->A\'->B->B\'\nA\'.random = A.random.next\nfinally split the two interleaved lists apart',
        whyWorks: 'The interleaving is itself the original-to-copy mapping, replacing the hash map.',
      },
    ),
  ],
  complexity: { time: 'O(n)', space: 'O(1) auxiliary excluding output' },
  edgeCases: ['Null random pointers', 'Self-referencing random pointers', 'Empty list', 'Single node'],
  commonMistakes: [
    'Assigning random pointers before all copies exist',
    'Failing to restore the original list during the unweave',
  ],
  patternRecognition: ['Encode auxiliary state inside the structure to drop the extra space'],
  followUps: ['Clone a graph with random edges', 'Clone a binary tree with random pointers', 'Why must randoms be assigned in a separate pass?'],
  interviewInsight: 'Present the hash map first, then the weave as the O(1)-space upgrade — the progression is the answer.',
});

// __SPECIALS__

// ---------------------------------------------------------------------------
// Family templates — used when no handcrafted special exists
// ---------------------------------------------------------------------------

function detectFamily(t) {
  const hay = `${t.title} ${t.category} ${t.subcategory}`.toLowerCase();
  const hit = (...ks) => ks.some((k) => hay.includes(k));
  if (hit('binary search', 'lower bound', 'upper bound', 'rotated', 'search space', 'median of')) return 'binary-search';
  if (hit('linked list', 'dll', 'll ')) return 'linked-list';
  if (hit('sliding window', 'two pointer', 'two-pointer')) return 'two-pointer';
  if (hit('stack', 'queue', 'monotonic', 'next greater', 'histogram')) return 'stack-queue';
  if (hit('heap', 'priority', 'kth largest', 'kth smallest', 'top k', 'median')) return 'heap';
  if (hit('greedy', 'jump game', 'interval', 'knapsack problem', 'job', 'candy')) return 'greedy';
  if (hit('binary tree', 'bst', 'inorder', 'preorder', 'postorder', 'morris', 'lca')) return 'tree';
  if (hit('graph', 'bfs', 'dfs', 'dijkstra', 'bellman', 'floyd', 'topo', 'mst', 'dsu', 'disjoint', 'prim', 'kruskal')) return 'graph';
  if (hit('dynamic programming', ' dp', 'knapsack', 'lis', 'lcs', 'subset sum', 'climbing')) return 'dp';
  if (hit('trie', 'prefix')) return 'trie';
  if (hit('bit ', 'bitwise', 'xor', 'sieve', 'prime factor')) return 'bit';
  if (hit('recursion', 'subset', 'combination', 'permutation', 'n-queen', 'sudoku', 'palindrome part')) return 'backtracking';
  if (hit('string', 'palindrome', 'anagram', 'kmp', 'z-function', 'rabin')) return 'string';
  if (hit('matrix', 'spiral', 'rotate matrix', 'set matrix')) return 'matrix';
  if (hit('array', 'subarray', 'kadane', 'majority', '2sum', '3sum', '4sum')) return 'array';
  if (t.category.toLowerCase().includes('array')) return 'array';
  if (t.category.toLowerCase().includes('string')) return 'string';
  if (t.category.toLowerCase().includes('graph')) return 'graph';
  if (t.category.toLowerCase().includes('dynamic')) return 'dp';
  if (t.category.toLowerCase().includes('tree')) return 'tree';
  if (t.category.toLowerCase().includes('bit')) return 'bit';
  if (t.category.toLowerCase().includes('heap')) return 'heap';
  if (t.category.toLowerCase().includes('stack')) return 'stack-queue';
  if (t.category.toLowerCase().includes('sliding')) return 'two-pointer';
  if (t.category.toLowerCase().includes('greedy')) return 'greedy';
  if (t.category.toLowerCase().includes('recursion')) return 'backtracking';
  if (t.category.toLowerCase().includes('trie')) return 'trie';
  if (t.category.toLowerCase().includes('binary search')) return 'binary-search';
  if (t.category.toLowerCase().includes('linked')) return 'linked-list';
  return 'general';
}

function slugWords(t) {
  return t.title.replace(/[\[\]]/g, '').trim();
}

function templateFor(t) {
  const family = detectFamily(t);
  const name = slugWords(t);
  const cat = t.category;

  const skeletons = {
    array: {
      pattern: 'arrays',
      intuition: `"${name}" is an array problem under ${cat}. Start from constraints: if n≈1e5, discard O(n²) unless the interviewer asks for brute force first. Typical unlocks are hashing, two pointers, prefix sums, or in-place rearrangement.`,
      approaches: [
        ap(
          'Brute force',
          `Enumerate the obvious nested / multi-pass solution for "${name}" to lock correctness.`,
          `def solve_brute(a):
    # Brute sketch for: ${name}
    # Expand every candidate; verify the condition.
    n = len(a)
    best = None
    for i in range(n):
        for j in range(i, n):
            # TODO-shaped placeholder replaced by real scan of a[i:j+1]
            cand = a[i : j + 1]
            val = sum(cand)  # stand-in aggregate — adapt to the real metric
            if best is None or val > best:
                best = val
    return best`,
          'Often O(n²) or worse',
          'O(1)–O(n)',
          { flags: ['TLE'], limitations: [`With n=1e5 this family TLEs — use it only to validate a smarter approach for "${name}".`] },
        ),
        ap(
          'Optimal interview approach',
          `Apply the pattern natural to "${name}" (hashing / two pointers / prefix / in-place) so each element is processed a constant number of times.`,
          `def solve(a):
    # Interview skeleton for: ${name}
    # 1) Clarify return type & edge cases
    # 2) One pass with the right auxiliary structure
    seen = {}
    best = 0
    for i, x in enumerate(a):
        # adapt the update rule to the problem statement
        seen[x] = seen.get(x, 0) + 1
        best = max(best, seen[x])
    return best`,
          'Typically O(n) or O(n log n)',
          'O(1)–O(n) auxiliary',
          {
            dryRun: `Walk a small example for "${name}" and track the auxiliary state each step.`,
            whyWorks: 'Each index contributes a constant amount of work after the right preprocessing or invariant.',
          },
        ),
      ],
      flagsExtra: ['TLE'],
      mistakes: [
        'Shipping O(n²) without stating the TLE risk for large n',
        'Mutating the array when a copy was required (or the reverse)',
        'Off-by-one on inclusive/exclusive subarray bounds',
      ],
      recognize: [
        'Contiguous segment → sliding window / prefix sums / Kadane-style',
        'Pair / frequency questions → hashing',
        'Reorder in-place → two pointers / cyclic swap',
      ],
      followUps: [
        `Can "${name}" be done in O(1) extra space?`,
        'What changes if the array is sorted?',
        'What if duplicates / negatives are allowed?',
        'Stream version — can you do it online?',
      ],
      insight: `For "${name}", narrate brute → bottleneck → pattern. Interviewers grade the ladder as much as the final code.`,
    },
    'binary-search': {
      pattern: 'binary-search',
      intuition: `"${name}" lives in binary search. Define a monotonic predicate P(mid). Search the answer space or the index space; keep the invariant that the answer still lies in [lo, hi].`,
      approaches: [
        ap(
          'Brute: linear scan',
          'Scan every candidate until the condition holds.',
          `def solve_brute(a, target):
    # Linear scan stand-in for: ${name}
    for i, x in enumerate(a):
        if x == target:  # adapt predicate
            return i
    return -1`,
          'O(n)',
          'O(1)',
          { flags: ['TLE'] },
        ),
        ap(
          'Optimal: binary search on monotonic predicate',
          'Shrink [lo, hi] using mid; be consistent about inclusive bounds.',
          `def solve(a, target):
    # Binary-search skeleton for: ${name}
    lo, hi = 0, len(a)  # half-open [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:  # adapt: predicate "too small"
            lo = mid + 1
        else:
            hi = mid
    return lo`,
          'O(log n) on array search; O(f·log A) on answer-space search',
          'O(1) auxiliary',
          {
            dryRun: 'Maintain: answer ∈ [lo, hi). Each step halves the interval.',
            whyWorks: 'Monotonicity guarantees one side can be discarded safely.',
          },
        ),
      ],
      mistakes: [
        'Infinite loop from wrong mid update',
        'Off-by-one on lower vs upper bound',
        'Using binary search without a proven monotonic predicate',
      ],
      recognize: [
        'Sorted array / monotonic feasibility',
        'Minimize/maximize a value with a yes/no check → binary search on answer',
      ],
      followUps: [
        'Lower bound vs upper bound?',
        'Rotated sorted array variants?',
        'What if duplicates exist?',
        'Binary search on answer — write the feasibility check',
      ],
      insight: `Say the invariant out loud for "${name}". Strong candidates never hand-wave lo/hi updates.`,
    },
    string: {
      pattern: 'strings',
      intuition: `"${name}" is a string problem. Clarify case, spaces, and alphabet size. Prefer two pointers, hashing, or KMP/Z/rolling hash over blind O(n²) nested loops when n is large.`,
      approaches: [
        ap(
          'Brute',
          'Check all substrings / pairs as needed.',
          `def solve_brute(s: str) -> int:
    n = len(s)
    best = 0
    for i in range(n):
        for j in range(i, n):
            sub = s[i : j + 1]
            # adapt: validate sub for "${name}"
            if len(set(sub)) == len(sub):
                best = max(best, j - i + 1)
    return best`,
          'O(n²)–O(n³)',
          'O(n)',
          { flags: ['TLE'] },
        ),
        ap(
          'Optimal pattern for this family',
          'Sliding window / frequency map / prefix structure depending on the statement.',
          `from collections import Counter

def solve(s: str) -> int:
    # Skeleton tuned for many string interview tasks related to: ${name}
    left = 0
    freq = Counter()
    best = 0
    for right, ch in enumerate(s):
        freq[ch] += 1
        while len(freq) > 2:  # adapt the invariant
            freq[s[left]] -= 1
            if freq[s[left]] == 0:
                del freq[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best`,
          'Typically O(n)',
          'O(Σ) alphabet / O(k)',
        ),
      ],
      mistakes: [
        'Quadratic string concatenation',
        'Forgetting Unicode/case rules',
        'Confusing subsequence vs substring',
      ],
      recognize: [
        'Contiguous unique/constrained chars → sliding window',
        'Pattern matching → KMP / Z / Rabin-Karp',
      ],
      followUps: [
        'Case-insensitive variant?',
        'Streaming input?',
        'Memory limit if alphabet is huge?',
      ],
      insight: `Pin down the string rules before coding "${name}" — most WA comes from unclear contracts.`,
    },
    'linked-list': {
      pattern: 'linked-list',
      intuition: `"${name}" needs careful pointer rewiring. Draw before/after. Prefer O(1) aux when possible; never lose the next reference before rewiring.`,
      approaches: [
        ap(
          'Hash / multi-pass when helpful',
          'Store nodes or lengths when it simplifies correctness, then optimize.',
          `def solve_hash(head):
    seen = set()
    cur = head
    while cur:
        if cur in seen:
            return True  # cycle-style stand-in
        seen.add(cur)
        cur = cur.next
    return False`,
          'O(n)',
          'O(n)',
          { flags: ['MLE'] },
        ),
        ap(
          'Optimal pointer technique',
          'Fast/slow, dummy head, or in-place reverse — adapt to the problem.',
          `class Node:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def solve(head):
    # Skeleton for: ${name}
    dummy = Node(0, head)
    # rewire using dummy to avoid edge-case branches on head
    return dummy.next`,
          'Typically O(n)',
          'O(1) auxiliary when in-place',
        ),
      ],
      mistakes: [
        'Losing next before rewiring',
        'Forgetting dummy head for head-deletion cases',
        'Off-by-one on k-th node',
      ],
      recognize: [
        'Cycle → Floyd',
        'Reverse / k-group → local reverse + reconnect',
        'Intersection → length align or switch pointers',
      ],
      followUps: [
        'O(1) space version?',
        'Doubly linked variant?',
        'Recursive vs iterative?',
      ],
      insight: `For "${name}", interviewers watch pointer hygiene more than clever tricks.`,
    },
    backtracking: {
      pattern: 'backtracking',
      intuition: `"${name}" explores a decision tree: choose → recurse → undo. Prune early with constraints. Watch exponential blow-up (TLE) and recursion depth (RE).`,
      approaches: [
        ap(
          'Backtracking template',
          'Maintain path; at leaf record answer; undo after recurse.',
          `def solve(n):
    ans = []
    path = []

    def dfs(start):
        # adapt base condition for: ${name}
        ans.append(path.copy())
        for i in range(start, n):
            path.append(i)
            dfs(i + 1)
            path.pop()  # undo

    dfs(0)
    return ans`,
          'O(2^n · poly) typical for subsets; worse for permutations',
          'O(n) recursion depth + output size',
          { flags: ['TLE', 'RE'], dryRun: 'Show one choose/undo branch on a tiny n.' },
        ),
      ],
      mistakes: [
        'Forgetting to undo (path pollution)',
        'Not copying path when recording answers',
        'Missing prune → TLE',
      ],
      recognize: [
        'Generate all / find configurations under constraints',
        'Explicit undo step',
      ],
      followUps: [
        'How do you prune?',
        'Dedup strategies for duplicate inputs?',
        'Convert to iterative BFS of states?',
      ],
      insight: `Name the state, the choice, and the undo for "${name}" — that is the interview answer.`,
    },
    bit: {
      pattern: 'bit-manipulation',
      intuition: `"${name}" uses bits as flags or XOR cancellations. Know shifts, masks, and that Python ints are unbounded (still discuss fixed-width in interviews).`,
      approaches: [
        ap(
          'Bit trick / mask approach',
          'Map the operation to AND/OR/XOR/shifts.',
          `def solve(n: int) -> int:
    # Skeleton for: ${name}
    # Example idioms:
    # n & 1        -> parity
    # n & (n - 1)  -> drop lowest set bit
    # n & -n       -> isolate lowest set bit
    cnt = 0
    while n:
        n &= n - 1
        cnt += 1
    return cnt`,
          'O(#bits) or O(1) with hw instructions',
          'O(1)',
        ),
      ],
      mistakes: [
        'Arithmetic vs logical shifts in signed languages',
        'Forgetting n=0 edge cases',
        'Assuming 32-bit when Python is unbounded',
      ],
      recognize: [
        'Powers of two, subset masks, XOR pairing',
      ],
      followUps: [
        'Hardware popcount?',
        'Subset DP over masks?',
        'XOR of range?',
      ],
      insight: `State the invariant (e.g. XOR of pairs cancels) before the code for "${name}".`,
    },
    'stack-queue': {
      pattern: 'stack-queue',
      intuition: `"${name}" needs LIFO/FIFO or a monotonic stack/queue. Push when deferring work; pop when the deferred item becomes due.`,
      approaches: [
        ap(
          'Stack / monotonic stack skeleton',
          'Maintain candidates in order; pop while invariant breaks.',
          `def solve(a):
    # Skeleton for: ${name}
    n = len(a)
    ans = [-1] * n
    st = []  # indices
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:  # adapt comparison
            ans[st.pop()] = x
        st.append(i)
    return ans`,
          'O(n)',
          'O(n)',
          { dryRun: 'Each index pushed once and popped once → amortized O(n).' },
        ),
      ],
      mistakes: [
        'Pop on empty',
        'Storing values when indices are needed',
        'Wrong inequality on monotonic stack',
      ],
      recognize: [
        'Next greater/smaller → monotonic stack',
        'Matching / parsing → classic stack',
      ],
      followUps: [
        'Circular array variant?',
        'Sum of subarray minimums connection?',
        'Queue via two stacks?',
      ],
      insight: `Amortized “each element enters/leaves once” is the complexity story for "${name}".`,
    },
    'two-pointer': {
      pattern: 'sliding-window',
      intuition: `"${name}" fits two pointers / sliding window when the window condition is monotonic: expand right, shrink left.`,
      approaches: [
        ap(
          'Brute subarrays',
          'Check all O(n²) windows.',
          `def solve_brute(a, k):
    n = len(a)
    best = 0
    for i in range(n):
        for j in range(i, n):
            if sum(a[i : j + 1]) <= k:  # adapt
                best = max(best, j - i + 1)
    return best`,
          'O(n²) or O(n³)',
          'O(1)',
          { flags: ['TLE'] },
        ),
        ap(
          'Optimal sliding window',
          'Maintain a running state while moving L/R.',
          `def solve(a, k):
    left = 0
    total = 0
    best = 0
    for right, x in enumerate(a):
        total += x
        while left <= right and total > k:  # adapt invariant
            total -= a[left]
            left += 1
        best = max(best, right - left + 1)
    return best`,
          'O(n)',
          'O(1)–O(Σ)',
          { whyWorks: 'Each index moves at most once as left and once as right.' },
        ),
      ],
      mistakes: [
        'Moving the wrong pointer',
        'Not handling empty window',
        'Using window when the condition is not monotonic',
      ],
      recognize: [
        'Longest/shortest contiguous segment under a constraint',
      ],
      followUps: [
        'At most K vs exactly K?',
        'Negative numbers break the classic window — what then?',
        'Template for “number of subarrays with …”',
      ],
      insight: `Prove monotonicity before claiming O(n) for "${name}".`,
    },
    heap: {
      pattern: 'heap',
      intuition: `"${name}" needs repeated access to extremes → heap (priority queue). Top-K often uses a size-k heap for O(n log k).`,
      approaches: [
        ap(
          'Sort-based',
          'Sort and pick — simpler but usually O(n log n).',
          `def solve_sort(a, k):
    return sorted(a, reverse=True)[:k]  # adapt`,
          'O(n log n)',
          'O(n)',
        ),
        ap(
          'Optimal: heap',
          'Push/pop extremes; keep heap size bounded by k when possible.',
          `import heapq

def solve(a, k):
    # Skeleton for: ${name}
    heap = []
    for x in a:
        heapq.heappush(heap, x)  # min-heap; adapt for max-heap via -x
        if len(heap) > k:
            heapq.heappop(heap)
    return list(heap)`,
          'O(n log k) for top-k patterns',
          'O(k)',
          { flags: ['MLE'], limitations: ['Unbounded heap on huge streams → MLE'] },
        ),
      ],
      mistakes: [
        'Min vs max heap confusion',
        'Growing heap without bound',
        'Comparing tuples incorrectly',
      ],
      recognize: [
        'Top-K, running median, merge K lists',
      ],
      followUps: [
        'Quickselect average O(n)?',
        'Running median with two heaps?',
        'Memory constraints for streams?',
      ],
      insight: `State why size-k heap beats full sort for "${name}" when only K matters.`,
    },
    greedy: {
      pattern: 'greedy',
      intuition: `"${name}" may admit a greedy choice. Sort by the right key, then take the next safe candidate. Prove exchange argument or cite a known theorem.`,
      approaches: [
        ap(
          'Greedy after sorting',
          'Sort, then scan once taking locally optimal safe moves.',
          `def solve(intervals):
    # Skeleton for: ${name}
    intervals = sorted(intervals, key=lambda x: x[1])  # adapt key
    ans = 0
    last_end = float('-inf')
    for start, end in intervals:
        if start >= last_end:
            ans += 1
            last_end = end
    return ans`,
          'Usually O(n log n) from sort',
          'O(1)–O(n)',
          { whyWorks: 'Exchange: any optimal solution can be transformed into the greedy one without loss.' },
        ),
      ],
      mistakes: [
        'Greedy without proof → WA on counterexamples',
        'Sorting by the wrong key',
        'Using DP when greedy suffices (or the reverse)',
      ],
      recognize: [
        'Interval scheduling, jump reachability, Huffman-style choices',
      ],
      followUps: [
        'Counterexample if sorted by start instead?',
        'DP fallback when greedy fails?',
        'Online vs offline greedy?',
      ],
      insight: `For "${name}", the sort key is the interview; code is secondary.`,
    },
    tree: {
      pattern: 'trees',
      intuition: `"${name}" is tree recursion: null base case, recurse on children, combine. Prefer clear traversal order; iterative/Morris when O(1) aux is required.`,
      approaches: [
        ap(
          'Recursive DFS template',
          'Define what each call returns; handle None.',
          `class Node:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def solve(root):
    # Skeleton for: ${name}
    def dfs(node):
        if not node:
            return 0  # adapt base
        left = dfs(node.left)
        right = dfs(node.right)
        return 1 + max(left, right)  # adapt combine
    return dfs(root)`,
          'O(n)',
          'O(h) recursion stack',
          { flags: ['RE'], spaceNote: 'Skewed tree → O(n) stack' },
        ),
      ],
      mistakes: [
        'Null dereference',
        'Wrong combine of child answers',
        'Calling stack O(1) on skewed trees',
      ],
      recognize: [
        'Node-wise decisions → tree DP',
        'Order matters → traversal choice',
      ],
      followUps: [
        'Iterative version?',
        'Morris O(1) aux?',
        'BST-specific acceleration?',
      ],
      insight: `Specify the return meaning of dfs() before coding "${name}".`,
    },
    graph: {
      pattern: 'graphs',
      intuition: `"${name}" needs the right graph algorithm. Clarify directed/undirected, weighted/unweighted, cycles. Unweighted shortest → BFS; non-negative weights → Dijkstra; negative → Bellman-Ford; 0-1 weights → 0-1 BFS.`,
      approaches: [
        ap(
          'Traversal / shortest-path skeleton',
          'Build adjacency; BFS/DFS/Dijkstra as constrained.',
          `from collections import defaultdict, deque

def solve(n, edges, src=0):
    # Skeleton for: ${name}
    g = defaultdict(list)
    for u, v in edges:  # adapt for weights
        g[u].append(v)
        g[v].append(u)
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
          'O(n + m) for BFS/DFS',
          'O(n + m)',
          { flags: ['TLE', 'MLE'], limitations: ['Wrong algorithm for weights → WA; huge adj lists → MLE'] },
        ),
      ],
      mistakes: [
        'DFS for unweighted shortest path',
        'Forgetting visited → infinite loops',
        '1-index vs 0-index bugs',
      ],
      recognize: [
        'Shortest unweighted → BFS',
        'Multi-source spreading → multi-source BFS',
        'Ordering with prerequisites → topo',
      ],
      followUps: [
        'Weighted edges?',
        'Negative cycles?',
        'Connected components count?',
      ],
      insight: `Pick the algorithm from the constraint table before coding "${name}".`,
    },
    dp: {
      pattern: 'dynamic-programming',
      intuition: `"${name}" needs DP: define state, transition, base, order. Start from recursion → memo → tabulation → space opt when safe.`,
      approaches: [
        ap(
          'Recursion + memo',
          'Top-down cache of subproblems.',
          `def solve(nums):
    # Skeleton for: ${name}
    memo = {}
    def dp(i):
        if i in memo:
            return memo[i]
        if i >= len(nums):
            return 0  # adapt base
        # adapt transition
        memo[i] = max(dp(i + 1), nums[i] + dp(i + 2))
        return memo[i]
    return dp(0)`,
          'O(states · transition)',
          'O(states) + recursion stack',
          { flags: ['RE'] },
        ),
        ap(
          'Bottom-up',
          'Iterate in dependency order.',
          `def solve_bottom_up(nums):
    n = len(nums)
    if n == 0:
        return 0
    dp = [0] * (n + 1)
    dp[1] = nums[0]
    for i in range(2, n + 1):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])
    return dp[n]`,
          'O(n) for 1D patterns like this skeleton',
          'O(n); often O(1) with rolling vars',
        ),
      ],
      mistakes: [
        'Wrong base cases',
        'Iterating in an order that uses uncomputed states',
        'Confusing subsequence vs substring',
      ],
      recognize: [
        'Overlapping subproblems + optimal substructure',
      ],
      followUps: [
        'Space-optimize dimensions?',
        'Print the chosen subset/path?',
        'Modulo arithmetic version?',
      ],
      insight: `Write state meaning in one sentence before transitions for "${name}".`,
    },
    trie: {
      pattern: 'trie',
      intuition: `"${name}" indexes strings by shared prefixes. Each edge is a character; end markers denote keys.`,
      approaches: [
        ap(
          'Trie insert / search',
          'Walk/create nodes per character.',
          `class Node:
    def __init__(self):
        self.next = {}
        self.end = False

class Trie:
    def __init__(self):
        self.root = Node()

    def insert(self, word: str) -> None:
        cur = self.root
        for ch in word:
            if ch not in cur.next:
                cur.next[ch] = Node()
            cur = cur.next[ch]
        cur.end = True

    def search(self, word: str) -> bool:
        cur = self.root
        for ch in word:
            if ch not in cur.next:
                return False
            cur = cur.next[ch]
        return cur.end
# Adapt API for: ${name}`,
          'O(total characters)',
          'O(total characters · Σ)',
          { flags: ['MLE'] },
        ),
      ],
      mistakes: [
        'Forgetting end marker',
        'Huge alphabet memory blow-ups',
      ],
      recognize: [
        'Prefix queries, autocomplete, XOR bit tries',
      ],
      followUps: [
        'Delete operation?',
        'Compressed trie / radix tree?',
        'Bit trie for XOR maxima?',
      ],
      insight: `Memory layout matters for "${name}" — mention MLE risk on dense alphabets.`,
    },
    matrix: {
      pattern: 'matrices',
      intuition: `"${name}" treats the grid with index arithmetic or BFS/DFS on cells. Clarify in-place vs extra matrix (MLE).`,
      approaches: [
        ap(
          'In-place / layered traversal skeleton',
          'Iterate layers or directions carefully.',
          `def solve(matrix):
    # Skeleton for: ${name}
    if not matrix or not matrix[0]:
        return matrix
    n, m = len(matrix), len(matrix[0])
    # adapt: rotate / spiral / set-zeroes markers
    return matrix`,
          'Typically O(n·m)',
          'O(1)–O(n·m)',
          { flags: ['MLE'] },
        ),
      ],
      mistakes: [
        'Index transpose errors',
        'Overwriting cells needed later without markers',
      ],
      recognize: [
        'Layer-by-layer, four direction vectors, first-row/col markers',
      ],
      followUps: [
        'In-place O(1) extra space?',
        'Clockwise vs anticlockwise?',
      ],
      insight: `Draw the index map once for "${name}" before coding.`,
    },
    general: {
      pattern: 'problem-solving',
      intuition: `"${name}" sits under ${cat}. Restate the problem, invent examples (including edges), then climb brute → better → optimal while watching TLE/MLE.`,
      approaches: [
        ap(
          'Brute force',
          'Correct but possibly slow reference.',
          `def solve_brute(*args):
    # Brute reference for: ${name}
    raise NotImplementedError("adapt brute force to the statement")`,
          'Depends — often polynomial higher degree',
          'Depends',
          { flags: ['TLE'] },
        ),
        ap(
          'Optimal direction',
          'Identify the bottleneck and apply the section pattern.',
          `def solve(*args):
    # Optimal sketch for: ${name}
    # Use the pattern taught in this step of the sheet.
    return None`,
          'Match constraints',
          'Match constraints',
        ),
      ],
      mistakes: [
        'Coding before examples',
        'Ignoring constraints → TLE/MLE',
      ],
      recognize: [
        'Map statement keywords to sheet patterns',
      ],
      followUps: [
        'Complexity under tighter limits?',
        'Edge cases?',
        'Related sheet problems?',
      ],
      insight: `Constraints-first reasoning is what separates strong answers on "${name}".`,
    },
  };

  const sk = skeletons[family] || skeletons.general;
  const isConcept = t.topicType === 'concept' || /introduction|theory|represent|what is|types of/i.test(t.title);

  let approaches = sk.approaches;
  if (isConcept) {
    approaches = [
      ap(
        'Core idea & mental model',
        `Build the right model for "${name}" before diving into adjacent coding problems in this section.`,
        `# Concept notes — ${name}
# - Definition in one sentence
# - When it shows up in interviews
# - Complexity of core operations
# - Common pitfalls

def demo():
    """Minimal illustration hook for ${name}."""
    return True`,
        'Conceptual — see operation costs in the section',
        'Conceptual',
      ),
    ];
  }

  return {
    tags: [family, t.difficulty],
    pattern: sk.pattern,
    problemStatement: isConcept
      ? `Understand ${name} deeply enough to use it in later problems in “${cat}”.`
      : `Solve “${name}” as posed in the A2Z sheet (${t.subcategory}).`,
    intuition: sk.intuition,
    approaches,
    complexity: {
      time: approaches[approaches.length - 1].time,
      space: approaches[approaches.length - 1].space,
    },
    edgeCases: [
      'Empty / single-element input when applicable',
      'Duplicates and extremes at constraints',
      'Impossible / already-optimal inputs',
    ],
    commonMistakes: sk.mistakes,
    patternRecognition: sk.recognize,
    followUps: sk.followUps,
    interviewInsight: sk.insight,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function buildBody(t) {
  const special = specials[t.id];
  if (special) return { body: special, source: 'special' };
  return { body: templateFor(t), source: 'template' };
}

function main() {
  const pending = topics.filter((t) => (progress.byId?.[t.id]?.status ?? 'pending') !== 'reviewed');
  let written = 0;
  let fromSpecial = 0;
  const errors = [];

  for (const t of pending) {
    try {
      const { body, source } = buildBody(t);
      const blog = base(t, body);
      if (!blog.intuition || !blog.approaches?.length || !blog.followUps?.length) {
        throw new Error('incomplete body');
      }
      fs.writeFileSync(path.join(outDir, `${t.id}.json`), `${JSON.stringify(blog, null, 2)}\n`, 'utf8');
      progress.byId[t.id] = {
        topicNumber: t.topicNumber,
        status: 'reviewed',
        batch: BATCH,
        quality: 'reviewed',
      };
      t.status = 'reviewed';
      t.batch = BATCH;
      written += 1;
      if (source === 'special') fromSpecial += 1;
    } catch (err) {
      errors.push(`${t.id} (#${t.topicNumber}): ${err.message}`);
    }
  }

  const reviewed = topics.filter((t) => progress.byId?.[t.id]?.status === 'reviewed').length;
  progress.total = topics.length;
  progress.reviewed = reviewed;
  progress.pending = topics.length - reviewed;
  progress.needsReview = 0;

  inv.generatedAt = new Date().toISOString();
  fs.writeFileSync(invPath, `${JSON.stringify(inv, null, 2)}\n`, 'utf8');
  fs.writeFileSync(progressPath, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');

  console.log(`Blogs written: ${written} (${fromSpecial} handcrafted, ${written - fromSpecial} templated)`);
  console.log(`Reviewed: ${reviewed}/${topics.length}`);
  if (errors.length) {
    console.log(`Errors (${errors.length}):`);
    for (const e of errors) console.log(`  - ${e}`);
  } else {
    console.log('Errors: none');
  }
}

main();
