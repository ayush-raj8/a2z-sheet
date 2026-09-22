import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-primitives-references',
  title: 'Primitives vs References',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['java-packages-imports'],
  summary:
    'Primitives hold raw values; reference variables hold pointers to heap objects — mixing them up causes NPEs, equality bugs, and boxing surprises.',
  keywords: ['primitive', 'reference', 'boxing', 'null', 'value type'],
  why: 'Almost every Java bug story — NPE, accidental sharing, Integer cache myths, slow loops — starts with not knowing whether you are holding a value or a reference to an object.',
  theory: [
    'Eight primitives: byte, short, int, long, float, double, char, boolean — stored directly in variables (or fields) as values.',
    'Everything else is a reference type: classes, arrays, interfaces, enums, records. The variable stores a reference (pointer-like) to an object on the heap (or null).',
    'Assigning primitives copies the value; assigning references copies the reference — two variables can alias the same object.',
    'Wrapper types (Integer, Boolean, …) are objects. Autoboxing converts between primitives and wrappers; unboxing a null wrapper throws NPE.',
    'Default field values: numeric primitives 0, boolean false, references null. Local variables have no defaults — must be assigned before use.',
    '== on primitives compares values; == on references compares identity (same object), not semantic equality.',
  ],
  mentalModel:
    'A primitive variable is a labeled box containing the bits. A reference variable is a labeled sticky note with an address — or blank (null).',
  codeTitle: 'Values, aliases, and boxing',
  code: `import java.util.Arrays;

public class PrimRefDemo {
    public static void main(String[] args) {
        int a = 10;
        int b = a;          // copy value
        b = 20;
        System.out.println("a=" + a + ", b=" + b);

        int[] x = {1, 2, 3};
        int[] y = x;        // copy reference — same array
        y[0] = 99;
        System.out.println("x=" + Arrays.toString(x));

        Integer boxed = 42; // autobox
        int raw = boxed;    // unbox
        System.out.println("boxed=" + boxed + ", raw=" + raw);

        Integer missing = null;
        // int boom = missing; // NPE on unboxing
        System.out.println("missing is null? " + (missing == null));
    }
}`,
  output: `a=10, b=20
x=[99, 2, 3]
boxed=42, raw=42
missing is null? true`,
  explain: [
    'Changing b does not change a — ints are copied by value.',
    'x and y point to one array; mutating through y is visible via x.',
    'Unboxing null would throw NullPointerException — always null-check wrappers when unboxing.',
  ],
  mistakes: [
    'Using == to compare Integer/String content (sometimes works via cache/interning — unreliable).',
    'Assuming arrays are passed "by value" meaning deep copy — only the reference is copied.',
    'Storing large amounts of data in wrappers inside hot loops (allocation + cache pressure).',
  ],
  interviewAsk: 'What is the difference between a primitive and a reference in Java?',
  interviewAnswer:
    'A primitive variable holds the actual value. A reference variable holds a reference to an object (or null). Assignment and parameter passing copy the variable’s contents: for primitives that is the value; for references that is the pointer, so callees can mutate the shared object unless the API is immutable.',
  interviewTraps: [
    'Saying Java passes objects by reference (it passes references by value).',
    'Claiming primitives can be null.',
  ],
  quiz: [
    {
      question: 'After `int[] a = {1}; int[] b = a; b[0] = 5;`, what is a[0]?',
      options: ['1', '5', '0', 'Compilation error'],
      correctIndex: 1,
      explain: 'a and b reference the same array object.',
    },
    {
      question: 'What happens when you unbox a null Integer to int?',
      options: [
        'You get 0',
        'NullPointerException',
        'Compilation error always',
        'Optional.empty()',
      ],
      correctIndex: 1,
      explain: 'Unboxing calls intValue() on null → NPE.',
    },
  ],
  practice:
    'Write a method that "tries" to swap two ints and show it fails; then swap via an int[2] or a small holder object and show aliasing works.',
  practiceHints: [
    'swap(int a, int b) cannot affect callers’ locals.',
    'A mutable holder with two fields (or an array) can demonstrate shared mutation.',
  ],
});
