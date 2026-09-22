import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-variables-casting',
  title: 'Variables and Casting',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-primitives-references'],
  summary:
    'Java is strongly typed: widening conversions are safe and implicit; narrowing needs casts and can lose data.',
  keywords: ['casting', 'widening', 'narrowing', 'var', 'final', 'type conversion'],
  why: 'Silent precision loss and ClassCastException are classic production bugs. Knowing when casts are required — and when they are a design smell — keeps numeric and OOP code honest.',
  theory: [
    'Every variable has a static type checked at compile time (locals, parameters, fields).',
    'Widening (e.g. int → long → float → double) is implicit; no cast needed.',
    'Narrowing (e.g. long → int, double → int) requires an explicit cast and may truncate or overflow bits.',
    'Reference casts check compatibility: upcast to a supertype is safe/implicit; downcast needs (Subtype) and may throw ClassCastException.',
    'final variables cannot be reassigned; for references, the object may still be mutable.',
    'Local-variable type inference (var, Java 10+) still has a concrete static type inferred from the initializer — it is not dynamic typing.',
  ],
  mentalModel:
    'Widening is pouring into a bigger cup. Narrowing is forcing liquid into a smaller cup — you need an explicit shove (cast) and you might spill.',
  codeTitle: 'Numeric and reference casts',
  code: `public class CastingDemo {
    public static void main(String[] args) {
        int n = 150;
        long wide = n;           // widening
        byte narrow = (byte) n;  // narrowing: 150 → -106 (overflow in 8 bits)
        System.out.println("wide=" + wide + ", narrow=" + narrow);

        double price = 19.99;
        int dollars = (int) price; // truncates toward zero
        System.out.println("dollars=" + dollars);

        Object obj = "hello";
        String s = (String) obj;   // downcast OK
        System.out.println(s.toUpperCase());

        Object num = Integer.valueOf(5);
        // String bad = (String) num; // ClassCastException
        if (num instanceof Integer i) { // pattern matching (16+)
            System.out.println("int value=" + i);
        }
    }
}`,
  output: `wide=150, narrow=-106
dollars=19
HELLO
int value=5`,
  explain: [
    '150 does not fit in signed byte (−128..127); casting wraps modulo 256 → −106.',
    '(int) 19.99 drops the fractional part — it does not round.',
    'instanceof with pattern matching binds a typed variable after the check succeeds.',
  ],
  mistakes: [
    'Casting money with float/double and expecting exact cents.',
    'Downcasting without instanceof / pattern match.',
    'Thinking var means the type can change later in the method.',
  ],
  interviewAsk: 'What is the difference between widening and narrowing conversion?',
  interviewAnswer:
    'Widening converts to a type that can represent all values of the source (e.g. int to long) and is implicit. Narrowing may lose magnitude or precision (long to int, double to int) and requires an explicit cast. For references, upcasting is widening-like; downcasting is checked at runtime.',
  interviewTraps: [
    'Saying all casts are free of information loss.',
    'Confusing cast with conversion methods like Integer.parseInt.',
  ],
  quiz: {
    question: 'What is printed by `(int) 9.8`?',
    options: ['10', '9', '9.8', 'Compilation error'],
    correctIndex: 1,
    explain: 'Casting double to int truncates toward zero.',
  },
  practice:
    'Demonstrate overflow: assign Integer.MAX_VALUE + 1 to an int (wrapping) vs use Math.addExact and catch ArithmeticException.',
  practiceHints: [
    'Show both silent wrap and fail-fast addExact.',
    'Print before/after values in hex if you want to see bit wrap clearly.',
  ],
});
