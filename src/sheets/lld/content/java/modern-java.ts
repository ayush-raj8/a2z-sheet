import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-modern-java',
  title: 'Modern Java: Records, Sealed, Pattern Matching',
  section: 'java',
  chapter: 'Modern Java',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-java8-streams', 'java-immutability', 'oop-interfaces'],
  summary:
    'Records model immutable data concisely; sealed hierarchies close type families; pattern matching makes instanceof and switch expressive.',
  keywords: ['record', 'sealed', 'permits', 'pattern matching', 'switch expression'],
  why: 'Modern Java features replace boilerplate that used to hide domain models. LLD in 2020s Java should use records for value objects and sealed types for algebraic-style domains.',
  theory: [
    'record Point(int x, int y) {} auto-generates final fields, canonical ctor, accessors, equals, hashCode, toString — ideal value objects.',
    'Records can have compact constructors for validation; cannot extend classes (they implicitly extend Record); can implement interfaces.',
    'sealed interface Shape permits Circle, Rectangle — only listed subtypes may extend/implement; enables exhaustive switches.',
    'Pattern matching for instanceof: if (obj instanceof String s) { ... } binds s after the check.',
    'Switch expressions + pattern switches (recent Java) can match types and records, returning values without fall-through.',
    'Prefer these over hand-written POJOs and open inheritance when the set of variants is known.',
  ],
  mentalModel:
    'Records are stamped value tickets. Sealed types are a guest list: only named subtypes get in, so the compiler can demand you handle every guest in a switch.',
  codeTitle: 'Sealed shapes with record variants and switch',
  code: `public class ModernJavaDemo {
    sealed interface Shape permits Circle, Rect {
        double area();
    }

    record Circle(double r) implements Shape {
        public Circle {
            if (r <= 0) throw new IllegalArgumentException("r");
        }
        public double area() {
            return Math.PI * r * r;
        }
    }

    record Rect(double w, double h) implements Shape {
        public Rect {
            if (w <= 0 || h <= 0) throw new IllegalArgumentException("dims");
        }
        public double area() {
            return w * h;
        }
    }

    static String describe(Shape shape) {
        return switch (shape) {
            case Circle c -> "circle r=" + c.r() + " area=" + c.area();
            case Rect r -> "rect " + r.w() + "x" + r.h() + " area=" + r.area();
        };
    }

    public static void main(String[] args) {
        Shape s1 = new Circle(2);
        Shape s2 = new Rect(3, 4);
        System.out.println(describe(s1));
        System.out.println(describe(s2));
    }
}`,
  output: `circle r=2.0 area=12.566370614359172
rect 3.0x4.0 area=12.0`,
  explain: [
    'Compact constructors validate before assigning record components.',
    'sealed + permits lets the switch be exhaustive without default.',
    'Accessors are r(), w(), h() — not getR().',
  ],
  mistakes: [
    'Using records for mutable entity objects with identity in an ORM without thought — records shine as values.',
    'Leaving hierarchies open when the domain is closed — miss exhaustiveness.',
    'Huge records with behavior-heavy methods — still prefer clear modules.',
  ],
  interviewAsk: 'When would you choose a record over a classic class?',
  interviewAnswer:
    'When the type is primarily transparent immutable data: DTOs, value objects, message payloads, tuple-like returns. Records give correct equality by state and less boilerplate. Prefer a class when you need extensibility, hidden representation, or rich mutable lifecycle/identity separate from state.',
  interviewTraps: [
    'Saying records can extend arbitrary superclasses.',
    'Thinking sealed prevents implementing interfaces outside the file entirely without permits.',
  ],
  quiz: [
    {
      question: 'What does a sealed interface require of its direct subtypes?',
      options: [
        'They must be abstract',
        'They must be listed in permits (and follow nesting/package rules)',
        'They must be records only',
        'They must live in other modules',
      ],
      correctIndex: 1,
      explain: 'The permits clause closes the hierarchy to named subtypes.',
    },
    {
      question: 'Records are…',
      options: [
        'Mutable by default',
        'Implicitly final shallow data carriers with generated accessors/equals',
        'Enums',
        'Interfaces',
      ],
      correctIndex: 1,
      explain: 'Records provide immutable-state value semantics by default.',
    },
  ],
  practice:
    'Model a sealed Expr permits Const, Add, Neg and evaluate with an exhaustive switch; use records for each variant.',
  practiceHints: [
    'Const(int value), Add(Expr left, Expr right), Neg(Expr inner).',
    'Recursive evaluate method with pattern switch.',
  ],
});
