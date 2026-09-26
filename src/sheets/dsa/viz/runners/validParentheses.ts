import { structuresOf, TimelineBuilder } from '../engine/timeline';
import type { ExecutionTimeline } from '../engine/types';

const CODE = `def is_valid(s):
    stack = []
    pair = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        else:
            if not stack or stack[-1] != pair[ch]:
                return False
            stack.pop()
    return not stack`;

export function runValidParentheses(s = '({[]})'): ExecutionTimeline {
  const b = new TimelineBuilder();
  const stack: string[] = [];
  const pair: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const chars = s.split('');

  const snap = (i?: number) =>
    structuresOf(
      {
        kind: 'array',
        label: 's',
        values: chars,
        highlight: i != null ? [i] : [],
        pointers: i != null ? { i } : {},
      },
      { kind: 'stack', label: 'stack', values: [...stack] },
      {
        kind: 'vars',
        label: 'vars',
        entries: { ...(i != null ? { i, ch: chars[i] } : {}) },
      },
    );

  b.at(2, 'stack = []', { event: 'init', structures: snap() });
  b.at(3, 'pair map ready', { event: 'init', structures: snap() });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    b.at(4, `ch = s[${i}] = '${ch}'`, { event: 'iter', structures: snap(i) });
    if ('([{'.includes(ch)) {
      b.at(5, `'${ch}' is opener`, { event: 'branch', structures: snap(i) });
      stack.push(ch);
      b.at(6, `push '${ch}'`, { event: 'push', structures: snap(i) });
    } else {
      b.at(7, `'${ch}' is closer`, { event: 'branch', structures: snap(i) });
      const ok = stack.length > 0 && stack[stack.length - 1] === pair[ch];
      b.at(8, `match top? ${ok}`, { event: 'cmp', structures: snap(i) });
      if (!ok) {
        b.at(9, 'return False', { event: 'done', structures: snap(i) });
        return finish(false);
      }
      stack.pop();
      b.at(10, 'pop()', { event: 'pop', structures: snap(i) });
    }
  }

  const ok = stack.length === 0;
  b.at(11, `return not stack → ${ok}`, { event: 'done', structures: snap() });
  return finish(ok);

  function finish(result: boolean): ExecutionTimeline {
    return {
      id: 'valid-parentheses',
      title: 'Valid Parentheses',
      inputSummary: `s=${JSON.stringify(s)}`,
      expectedOutput: String(result),
      source: { language: 'python', title: 'Optimal', code: CODE },
      meta: { visualizationTypes: ['STRING', 'ARRAY', 'STACK', 'VARS'] },
      steps: b.build(),
    };
  }
}
