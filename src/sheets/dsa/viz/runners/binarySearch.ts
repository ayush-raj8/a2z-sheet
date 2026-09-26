import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

/** Classic 1D binary search on a sorted array. */
export function runBinarySearch(
  a: number[] = [2, 4, 6, 9, 11, 15, 20],
  target = 11,
): ExecutionTimeline {
  const b = new TimelineBuilder();
  let lo = 0;
  let hi = a.length - 1;

  const snap = (mid?: number) =>
    structuresOf(
      {
        kind: 'array',
        label: 'a',
        values: a,
        highlight: mid != null ? [mid] : [],
        pointers: { lo, hi, ...(mid != null ? { mid } : {}) },
        window: { lo, hi },
      },
      { kind: 'vars', label: 'vars', entries: { target, lo, hi, ...(mid != null ? { mid, 'a[mid]': a[mid] } : {}) } },
    );

  b.at(2, `lo=0, hi=${hi}`, { event: 'init', structures: snap() });

  while (lo <= hi) {
    b.at(3, `lo(${lo}) <= hi(${hi}) — continue`, { event: 'loop', structures: snap() });
    const mid = Math.floor((lo + hi) / 2);
    b.at(4, `mid = (${lo}+${hi})//2 = ${mid}`, { event: 'mid', structures: snap(mid) });
    b.at(5, `a[${mid}] == ${target}? (${a[mid]})`, { event: 'cmp', structures: snap(mid) });
    if (a[mid] === target) {
      b.at(6, `Found — return ${mid}`, { event: 'done', structures: snap(mid) });
      return {
        id: 'binary-search',
        title: 'Binary Search',
        inputSummary: `a=${JSON.stringify(a)}, target=${target}`,
        expectedOutput: String(mid),
        source: { language: 'python', title: 'Optimal', code: CODE },
        meta: {
          visualizationTypes: ['ARRAY', 'POINTER', 'WINDOW', 'VARS'],
          importantVariables: ['lo', 'hi', 'mid', 'target'],
        },
        steps: b.build(),
      };
    }
    if (a[mid] < target) {
      b.at(7, `a[mid]<target → search right`, { event: 'branch', structures: snap(mid) });
      lo = mid + 1;
      b.at(8, `lo = ${lo}`, { event: 'move', structures: snap() });
    } else {
      b.at(9, `a[mid]>target → search left`, { event: 'branch', structures: snap(mid) });
      hi = mid - 1;
      b.at(10, `hi = ${hi}`, { event: 'move', structures: snap() });
    }
  }

  b.at(11, 'Not found — return -1', { event: 'done', structures: snap() });
  return {
    id: 'binary-search',
    title: 'Binary Search',
    inputSummary: `a=${JSON.stringify(a)}, target=${target}`,
    expectedOutput: '-1',
    source: { language: 'python', title: 'Optimal', code: CODE },
    meta: { visualizationTypes: ['ARRAY', 'POINTER', 'WINDOW', 'VARS'] },
    steps: b.build(),
  };
}
