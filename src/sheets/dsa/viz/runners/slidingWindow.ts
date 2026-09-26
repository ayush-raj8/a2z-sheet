import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def max_sum_subarray_k(a, k):
    n = len(a)
    window = sum(a[:k])
    best = window
    for r in range(k, n):
        window += a[r] - a[r - k]
        best = max(best, window)
    return best`;

/** Fixed-size sliding window max sum. */
export function runSlidingWindowK(
  a: number[] = [2, 1, 5, 1, 3, 2],
  k = 3,
): ExecutionTimeline {
  const b = new TimelineBuilder();
  const n = a.length;
  let window = a.slice(0, k).reduce((s, x) => s + x, 0);
  let best = window;

  const snap = (lo: number, hi: number) =>
    structuresOf(
      {
        kind: 'array',
        label: 'a',
        values: a,
        highlight: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
        pointers: { lo, hi },
        window: { lo, hi },
      },
      { kind: 'vars', label: 'vars', entries: { k, window, best, lo, hi } },
    );

  b.at(2, `n = ${n}`, { event: 'init', structures: snap(0, k - 1) });
  b.at(3, `window = sum(a[0:${k}]) = ${window}`, { event: 'init', structures: snap(0, k - 1) });
  b.at(4, `best = ${best}`, { event: 'init', structures: snap(0, k - 1) });

  for (let r = k; r < n; r++) {
    const lo = r - k + 1;
    b.at(5, `r = ${r}`, { event: 'iter', structures: snap(lo, r) });
    window += a[r] - a[r - k];
    b.at(6, `window += a[${r}] - a[${r - k}] → ${window}`, {
      event: 'slide',
      structures: snap(lo, r),
    });
    best = Math.max(best, window);
    b.at(7, `best = max(best, window) → ${best}`, { event: 'update', structures: snap(lo, r) });
  }

  b.at(8, `return ${best}`, { event: 'done', structures: snap(n - k, n - 1) });
  return {
    id: 'sliding-window-k',
    title: 'Sliding Window (fixed K)',
    inputSummary: `a=${JSON.stringify(a)}, k=${k}`,
    expectedOutput: String(best),
    source: { language: 'python', title: 'Optimal', code: CODE },
    meta: { visualizationTypes: ['ARRAY', 'WINDOW', 'POINTER', 'VARS'] },
    steps: b.build(),
  };
}
