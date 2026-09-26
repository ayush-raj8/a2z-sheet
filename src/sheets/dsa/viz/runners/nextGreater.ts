import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def next_greater(a):
    n = len(a)
    ans = [-1] * n
    st = []  # indices, decreasing values
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:
            ans[st.pop()] = x
        st.append(i)
    return ans`;

export function runNextGreaterElement(
  a: number[] = [4, 5, 2, 10, 8],
): ExecutionTimeline {
  const b = new TimelineBuilder();
  const n = a.length;
  const ans = Array(n).fill(-1);
  const st: number[] = [];

  const snap = (i?: number) =>
    structuresOf(
      {
        kind: 'array',
        label: 'a',
        values: a,
        highlight: i != null ? [i, ...(st.length ? [st[st.length - 1]] : [])] : [],
        pointers: i != null ? { i } : {},
      },
      { kind: 'array', label: 'ans', values: [...ans], highlight: [] },
      { kind: 'stack', label: 'st (indices)', values: st.map((idx) => `${idx}:${a[idx]}`) },
      {
        kind: 'vars',
        label: 'vars',
        entries: i != null ? { i, x: a[i] } : {},
      },
    );

  b.at(2, `n = ${n}`, { event: 'init', structures: snap() });
  b.at(3, 'ans = [-1]*n', { event: 'init', structures: snap() });
  b.at(4, 'st = []', { event: 'init', structures: snap() });

  for (let i = 0; i < n; i++) {
    const x = a[i];
    b.at(5, `i=${i}, x=${x}`, { event: 'iter', structures: snap(i) });
    while (st.length && a[st[st.length - 1]] < x) {
      b.at(6, `a[st.top]=${a[st[st.length - 1]]} < ${x} — pop`, {
        event: 'while',
        structures: snap(i),
      });
      const j = st.pop()!;
      ans[j] = x;
      b.at(7, `ans[${j}] = ${x}`, { event: 'assign', structures: snap(i) });
    }
    st.push(i);
    b.at(8, `st.append(${i})`, { event: 'push', structures: snap(i) });
  }

  b.at(9, `return ${JSON.stringify(ans)}`, { event: 'done', structures: snap() });
  return {
    id: 'nge',
    title: 'Next Greater Element',
    inputSummary: `a=${JSON.stringify(a)}`,
    expectedOutput: JSON.stringify(ans),
    source: { language: 'python', title: 'Optimal (monotonic stack)', code: CODE },
    meta: {
      visualizationTypes: ['ARRAY', 'STACK', 'POINTER', 'VARS'],
      importantEvents: ['iter', 'while', 'assign', 'push'],
    },
    steps: b.build(),
  };
}
