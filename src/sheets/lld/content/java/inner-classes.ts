import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-inner-classes',
  title: 'Inner and Nested Classes',
  section: 'java',
  chapter: 'Inner & Nested Classes',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-constructors-this'],
  summary:
    'Nested classes organize types; inner (non-static) classes hold an implicit Outer.this and can access private members — privacy is at the top-level class boundary.',
  keywords: ['inner class', 'nested class', 'static nested', 'private access', 'outer this'],
  why: 'Builders, iterators, adapters, and event handlers often use nested types. The private-access rule surprises people: nested classes can touch the outer’s private fields, which is intentional and powerful.',
  theory: [
    'Static nested class: like a top-level class namespaced inside Outer — no hidden Outer reference.',
    'Inner class (non-static): each instance is tied to an enclosing Outer instance (Outer.this) and can access its private/instance members.',
    'Local classes are declared inside a method; anonymous classes are one-off inner/local types (lambdas often replace them).',
    'Access control is per top-level class: Outer and its nested classes can access each other’s private members — the JVM may insert synthetic bridge methods.',
    'Prefer static nested unless you truly need the outer instance — accidental inner classes pin the outer in memory (leaks in Android listeners historically).',
    'Generated names: Outer$Inner.class, Outer$1.class for anonymous.',
  ],
  mentalModel:
    'A static nested class is a roommate with a separate lease. An inner class lives inside the outer’s apartment and has keys to every private drawer — privacy walls are around the whole building (top-level class), not between rooms.',
  codeTitle: 'Private access across outer/inner; static vs inner',
  code: `public class InnerClassesDemo {
    static class Outer {
        private int secret = 42;

        static class StaticNested {
            void show(Outer o) {
                // OK: nested types share the top-level class's private access
                System.out.println("static nested sees secret=" + o.secret);
            }
        }

        class Inner {
            void bumpAndShow() {
                secret++; // implicit Outer.this.secret
                System.out.println("inner sees secret=" + secret);
            }
        }

        Inner inner() {
            return this.new Inner();
        }
    }

    public static void main(String[] args) {
        Outer outer = new Outer();
        new Outer.StaticNested().show(outer);

        Outer.Inner inner = outer.inner();
        inner.bumpAndShow();
        System.out.println("outer secret after bump still accessible? via inner only in API");
    }
}`,
  output: `static nested sees secret=42
inner sees secret=43
outer secret after bump still accessible? via inner only in API`,
  explain: [
    'StaticNested needs an Outer reference parameter because it has no Outer.this — yet it may still read private secret.',
    'Inner.bumpAndShow mutates the enclosing instance’s private field without a getter.',
    'This private sharing is at class level: both nested types are inside Outer’s trust boundary.',
  ],
  mistakes: [
    'Making a GUI listener a non-static inner class and leaking the Activity/Fragment.',
    'Expecting private to hide Outer fields from Inner — it does not.',
    'Instantiating Inner without an outer: new Outer().new Inner() is required.',
  ],
  interviewAsk:
    'Can an inner class access private members of its outer class? What about a static nested class?',
  interviewAnswer:
    'Yes for both regarding private access at the top-level class boundary: nested classes are considered part of the enclosing class for access control. A non-static inner class also has an implicit reference to the outer instance and can use its instance members directly. A static nested class does not hold Outer.this and needs an explicit Outer reference to touch instance state.',
  interviewTraps: [
    'Saying private means Inner cannot see Outer’s fields.',
    'Confusing static nested with inner — forgetting the hidden reference and leak risk.',
  ],
  quiz: [
    {
      question: 'What does a non-static inner class hold implicitly?',
      options: [
        'A reference to the Class object only',
        'A reference to an enclosing Outer instance',
        'A copy of all outer fields',
        'Nothing special',
      ],
      correctIndex: 1,
      explain: 'Inner instances are bound to Outer.this.',
    },
    {
      question: 'Who can access Outer’s private fields?',
      options: [
        'Only methods written physically inside Outer’s braces, never nested types',
        'Outer and its nested classes (class-level privacy)',
        'Any class in the same package only',
        'Only subclasses',
      ],
      correctIndex: 1,
      explain:
        'Java access control treats nested classes as part of the same top-level class for private access.',
    },
  ],
  practice:
    'Implement a LinkedList-like Node as a private static nested class inside a SimpleList, and an Iterator as a non-static inner class that can walk private head — demonstrate why Node can be static but Iterator should not be.',
  practiceHints: [
    'Node only needs item/next — no outer list reference required.',
    'Iterator needs cursor state tied to a specific list instance.',
  ],
  deepDive: [
    'javac emits synthetic accessor methods like access$000 when nested classes touch private members — relevant when reading bytecode or thinking about reflection.',
    'Records and enums can also be nested; prefer them for small value types inside a host type.',
  ],
});
