import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def lcs(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`;

export function runLcs(s = 'abcde', t = 'ace'): ExecutionTimeline {
  const b = new TimelineBuilder();
  const m = s.length;
  const n = t.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  const matrix = () =>
    dp.map((row) => row.map((v) => String(v)));

  const snap = (i?: number, j?: number) =>
    structuresOf(
      {
        kind: 'array',
        label: 's',
        values: s.split(''),
        highlight: i != null && i > 0 ? [i - 1] : [],
      },
      {
        kind: 'array',
        label: 't',
        values: t.split(''),
        highlight: j != null && j > 0 ? [j - 1] : [],
      },
      {
        kind: 'matrix',
        label: 'dp',
        rows: matrix(),
        highlight: i != null && j != null ? [[i, j]] : [],
      },
      {
        kind: 'vars',
        label: 'vars',
        entries: {
          ...(i != null ? { i, 's[i-1]': i > 0 ? s[i - 1] : '—' } : {}),
          ...(j != null ? { j, 't[j-1]': j > 0 ? t[j - 1] : '—' } : {}),
        },
      },
    );

  b.at(2, `m=${m}, n=${n}`, { event: 'init', structures: snap() });
  b.at(3, 'dp = zeros', { event: 'init', structures: snap() });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      b.at(4, `cell (${i},${j})`, { event: 'cell', structures: snap(i, j) });
      b.at(5, `i-loop / j-loop`, { event: 'cell', structures: snap(i, j) });
      if (s[i - 1] === t[j - 1]) {
        b.at(6, `'${s[i - 1]}' == '${t[j - 1]}'`, { event: 'match', structures: snap(i, j) });
        dp[i][j] = 1 + dp[i - 1][j - 1];
        b.at(7, `dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`, {
          event: 'write',
          structures: snap(i, j),
        });
      } else {
        b.at(8, `'${s[i - 1]}' != '${t[j - 1]}'`, { event: 'miss', structures: snap(i, j) });
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        b.at(9, `dp[${i}][${j}] = max(...) = ${dp[i][j]}`, {
          event: 'write',
          structures: snap(i, j),
        });
      }
    }
  }

  b.at(10, `return dp[${m}][${n}] = ${dp[m][n]}`, {
    event: 'done',
    structures: snap(m, n),
  });

  return {
    id: 'lcs',
    title: 'Longest Common Subsequence',
    inputSummary: `s=${JSON.stringify(s)}, t=${JSON.stringify(t)}`,
    expectedOutput: String(dp[m][n]),
    source: { language: 'python', title: 'Optimal (2D DP)', code: CODE },
    meta: { visualizationTypes: ['STRING', 'ARRAY', 'DP_TABLE', 'MATRIX', 'VARS'] },
    steps: b.build(),
  };
}
