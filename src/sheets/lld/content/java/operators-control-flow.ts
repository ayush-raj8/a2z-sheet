import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-operators-control-flow',
  title: 'Operators and Control Flow',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-variables-casting'],
  summary:
    'Arithmetic, logical, and relational operators combine with if/switch/loops — short-circuiting and fall-through are the sharp edges.',
  keywords: ['if', 'switch', 'for', 'while', 'short-circuit', 'ternary'],
  why: 'Control flow mistakes cause off-by-one bugs, accidental assignments in conditions, and switch fall-through defects that appear in production only on rare paths.',
  theory: [
    'Arithmetic: + - * / % ; integer division truncates toward zero. Relational: == != < > <= >=. Logical: && || ! short-circuit; & | ^ do not short-circuit on booleans.',
    '++/-- can be prefix or postfix; prefer clear statements over clever expressions.',
    'if / else if / else and the ternary ?: select branches. Braces prevent dangling-else bugs.',
    'switch supports ints, enums, Strings, and (modern Java) pattern switch; classic switch falls through without break.',
    'Loops: while, do-while, for, enhanced for-each. break exits; continue skips to next iteration; labeled break exits outer loops.',
    '&& and || skip evaluating the right operand when the left already decides the result — essential for null-safe checks.',
  ],
  mentalModel:
    'Short-circuit operators are guards: `x != null && x.isReady()` never calls isReady on null because evaluation stops early.',
  codeTitle: 'Short-circuit, loops, and switch',
  code: `public class ControlFlowDemo {
    static boolean isReady(String name) {
        System.out.println("checking " + name);
        return name.length() > 2;
    }

    public static void main(String[] args) {
        String user = null;
        if (user != null && isReady(user)) {
            System.out.println("go");
        } else {
            System.out.println("skip (no NPE, isReady not called)");
        }

        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println("sum=" + sum);

        int day = 2;
        String label = switch (day) {
            case 1 -> "Mon";
            case 2 -> "Tue";
            case 3 -> "Wed";
            default -> "Other";
        };
        System.out.println(label);
    }
}`,
  output: `skip (no NPE, isReady not called)
sum=15
Tue`,
  explain: [
    'user != null is false, so && does not evaluate isReady(user) — avoiding NPE.',
    'Classic for-loop accumulates 1..5 → 15.',
    'Arrow switch (Java 14+) does not fall through and yields a value.',
  ],
  mistakes: [
    'Writing `if (x = true)` — assignment instead of comparison (often a compile error for non-boolean, but deadly for boolean).',
    'Forgetting break in classic switch → unintentional fall-through.',
    'Modifying a collection while for-each iterating → ConcurrentModificationException.',
  ],
  interviewAsk: 'Difference between & and && for booleans?',
  interviewAnswer:
    '&& short-circuits: if the left operand is false, the right is not evaluated. & always evaluates both sides. Prefer && for guards (null checks, cheap reject paths). The same idea applies to || vs |.',
  interviewTraps: [
    'Saying they are identical.',
    'Using & with expressions that have side effects and being surprised both run.',
  ],
  quiz: {
    question: 'Does `false && expensive()` call expensive()?',
    options: ['Yes', 'No', 'Only if expensive returns boolean', 'Only in debug mode'],
    correctIndex: 1,
    explain: '&& short-circuits when the left side is false.',
  },
  practice:
    'Rewrite a classic switch on an enum Status { NEW, PAID, SHIPPED } using a switch expression that returns a shipping message string for each state.',
  practiceHints: [
    'Make the switch exhaustive so you can omit default.',
    'Compare arrow cases vs colon+break style.',
  ],
});
