import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-wrappers-autoboxing',
  title: 'Wrappers and Autoboxing',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-primitives-references'],
  summary:
    'Wrapper classes box primitives as objects; autoboxing/unboxing hides the conversion — and creates Integer cache surprises and NPEs on null unboxing.',
  keywords: ['wrapper', 'autoboxing', 'unboxing', 'Integer', 'cache', 'null'],
  why:
    'Collections need objects, generics erase to Object, and APIs often take Integer. Understanding boxing prevents “why is == true for 127 but false for 128?” interview traps.',
  theory: [
    'Each primitive has a wrapper: Integer, Long, Double, Boolean, Character, …',
    'Autoboxing converts int → Integer automatically when an object is required; unboxing converts Integer → int.',
    'Unboxing null throws NullPointerException.',
    'Integer.valueOf(int) caches at least −128..127; a JVM may cache a wider range. Therefore, identity behavior for 128 is not portable.',
    'Prefer equals() or intValue() comparison for numeric equality of wrappers.',
    'Boxing in hot loops can allocate and hurt performance; prefer primitives in tight numeric code.',
  ],
  mentalModel:
    'A primitive is cash in your pocket. A wrapper is cash sealed in an envelope (an object). Autoboxing stuffs cash into envelopes; unboxing opens them — opening an empty envelope (null) crashes.',
  codeTitle: 'Cache, equals, and null unboxing',
  code: `public class BoxingDemo {
    public static void main(String[] args) {
        Integer a = 127;
        Integer b = 127;
        Integer c = 128;
        Integer d = 128;

        System.out.println("127 identity: " + (a == b));
        System.out.println("128 equals: " + c.equals(d));
        System.out.println("Use equals for wrapper values");

        Integer maybe = null;
        try {
            int x = maybe; // unboxing null
            System.out.println(x);
        } catch (NullPointerException e) {
            System.out.println("NPE on unboxing");
        }
    }
}`,
  output: `127 identity: true
128 equals: true
Use equals for wrapper values
NPE on unboxing`,
  explain: [
    'The standard cache includes −128..127, so the two boxed 127 values share an instance.',
    '128 is typically outside the cache, but a JVM may extend the cache; the example deliberately does not claim a portable result for c == d.',
    'equals compares the numeric values and is true regardless of wrapper identity.',
    'Unboxing maybe forces a read of the wrapped int — null has none → NPE.',
  ],
  mistakes: [
    'Using == to compare Integer values for numeric equality.',
    'Storing null in Integer fields and later doing math (implicit unboxing).',
    'Assuming boxing is free in every loop.',
  ],
  interviewAsk: 'Why can Integer a = 127; Integer b = 127; print a == b as true, but 128 as false?',
  interviewAnswer:
    'Integer.valueOf caches at least −128..127 and may cache more, so 127 references are shared while the identity result for 128 is not portable. == compares references; always use equals (or compare intValue) for numeric equality.',
  interviewTraps: [
    'Claiming the language specification guarantees cache for all values — the cache range has a minimum required range but can be larger.',
  ],
  quiz: {
    question: 'What happens when you unbox a null Integer?',
    options: [
      'Gets 0',
      'NullPointerException',
      'Compilation error always',
      'Returns Integer.MIN_VALUE',
    ],
    correctIndex: 1,
    explain: 'Unboxing reads the primitive inside the wrapper; null has no wrapper instance.',
  },
  practice:
    'Write a method int sum(Integer... nums) that safely sums values and treats null entries as 0 without throwing NPE.',
});
