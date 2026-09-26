import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def count_digits(n):
    if n == 0:
        return 1
    c = 0
    x = abs(n)
    while x > 0:
        x //= 10
        c += 1
    return c`;

export function runCountDigits(n = 7789): ExecutionTimeline {
  const b = new TimelineBuilder();
  let c = 0;
  let x = Math.abs(n);

  const snap = () =>
    structuresOf({
      kind: 'vars',
      label: 'vars',
      entries: { n, x, c },
    });

  if (n === 0) {
    b.at(2, 'n == 0', { event: 'edge', structures: snap() });
    b.at(3, 'return 1', { event: 'done', structures: snap() });
  } else {
    b.at(4, 'c = 0', { event: 'init', structures: snap() });
    b.at(5, `x = abs(${n}) = ${x}`, { event: 'init', structures: snap() });
    while (x > 0) {
      b.at(6, `x(${x}) > 0`, { event: 'loop', structures: snap() });
      x = Math.floor(x / 10);
      b.at(7, `x //= 10 → ${x}`, { event: 'digit', structures: snap() });
      c += 1;
      b.at(8, `c += 1 → ${c}`, { event: 'count', structures: snap() });
    }
    b.at(9, `return ${c}`, { event: 'done', structures: snap() });
  }

  return {
    id: 'count-digits',
    title: 'Count Digits',
    inputSummary: `n=${n}`,
    expectedOutput: String(c || (n === 0 ? 1 : c)),
    source: { language: 'python', title: 'Optimal', code: CODE },
    meta: { visualizationTypes: ['VARS'] },
    steps: b.build(),
  };
}
