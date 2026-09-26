import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`;

export function runTwoSum(
  nums: number[] = [2, 7, 11, 15],
  target = 9,
): ExecutionTimeline {
  const b = new TimelineBuilder();
  const seen = new Map<number, number>();

  const snap = (i?: number, need?: number) =>
    structuresOf(
      {
        kind: 'array',
        label: 'nums',
        values: nums,
        highlight: i != null ? [i] : [],
        pointers: i != null ? { i } : {},
      },
      {
        kind: 'map',
        label: 'seen',
        entries: [...seen.entries()].map(([k, v]) => [String(k), v]),
        highlightKeys: need != null && seen.has(need) ? [String(need)] : [],
      },
      {
        kind: 'vars',
        label: 'vars',
        entries: {
          target,
          ...(i != null ? { i, x: nums[i] } : {}),
          ...(need != null ? { need } : {}),
        },
      },
    );

  b.at(2, 'seen = {}', { event: 'init', structures: snap() });

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    b.at(3, `i=${i}, x=${x}`, { event: 'iter', structures: snap(i) });
    const need = target - x;
    b.at(4, `need = ${target} - ${x} = ${need}`, { event: 'need', structures: snap(i, need) });
    b.at(5, `need in seen? ${seen.has(need)}`, { event: 'lookup', structures: snap(i, need) });
    if (seen.has(need)) {
      const j = seen.get(need)!;
      b.at(6, `return [${j}, ${i}]`, {
        event: 'done',
        structures: structuresOf(
          {
            kind: 'array',
            label: 'nums',
            values: nums,
            highlight: [j, i],
            pointers: { j, i },
          },
          {
            kind: 'map',
            label: 'seen',
            entries: [...seen.entries()].map(([k, v]) => [String(k), v]),
            highlightKeys: [String(need)],
          },
          { kind: 'vars', label: 'vars', entries: { target, need, j, i } },
        ),
      });
      return {
        id: 'two-sum',
        title: 'Two Sum (hash map)',
        inputSummary: `nums=${JSON.stringify(nums)}, target=${target}`,
        expectedOutput: JSON.stringify([j, i]),
        source: { language: 'python', title: 'Optimal', code: CODE },
        meta: { visualizationTypes: ['ARRAY', 'HASH_MAP', 'POINTER', 'VARS'] },
        steps: b.build(),
      };
    }
    seen.set(x, i);
    b.at(7, `seen[${x}] = ${i}`, { event: 'insert', structures: snap(i) });
  }

  b.at(8, 'return []', { event: 'done', structures: snap() });
  return {
    id: 'two-sum',
    title: 'Two Sum (hash map)',
    inputSummary: `nums=${JSON.stringify(nums)}, target=${target}`,
    expectedOutput: '[]',
    source: { language: 'python', title: 'Optimal', code: CODE },
    meta: { visualizationTypes: ['ARRAY', 'HASH_MAP', 'POINTER', 'VARS'] },
    steps: b.build(),
  };
}
