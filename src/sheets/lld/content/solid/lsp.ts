import { lesson } from '../lessonFactory';

export default lesson({
  id: 'solid-lsp',
  title: 'Liskov Substitution Principle',
  section: 'solid',
  chapter: 'SOLID Principles',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['solid-ocp', 'oop-composition-vs-inheritance'],
  summary:
    'Subtypes must be substitutable for their base types without breaking callers’ expectations.',
  keywords: ['LSP', 'Liskov', 'substitutability', 'SOLID', 'inheritance'],
  why: `The Rectangle/Square problem and “override to throw UnsupportedOperationException” are interview classics. LSP failures look like polymorphism but explode at runtime. Understanding contracts — preconditions, postconditions, invariants — separates junior from senior OOP.`,
  theory: [
    'Liskov Substitution: if S is a subtype of T, then objects of type T may be replaced with objects of type S without altering desirable properties of the program.',
    'Do not strengthen preconditions (require more from callers) or weaken postconditions (promise less) in overrides.',
    'Invariants of the base type must hold for subtypes. Behavioral compatibility matters more than signature compatibility.',
    'Classic violation: Square extends Rectangle but setWidth changes height — breaks code that assumes independent sides.',
    'If you need to disable parent behavior, you likely should not inherit — use composition or split interfaces.',
    'Java’s type system cannot enforce LSP; tests and careful contracts do.',
  ],
  mentalModel: `A spare tire must work wherever the car expects a tire. If your “tire” only works on sunny days and explodes otherwise, it is not substitutable — even if it bolts on.`,
  moreExamples: [
    {
      title: 'Violation: Square as Rectangle',
      code: `class Rectangle {
    protected int w, h;
    void setWidth(int w) { this.w = w; }
    void setHeight(int h) { this.h = h; }
    int area() { return w * h; }
}

class Square extends Rectangle {
    @Override void setWidth(int w) { this.w = this.h = w; }
    @Override void setHeight(int h) { this.w = this.h = h; }
}

public class Demo {
    static void stretch(Rectangle r) {
        r.setWidth(5);
        r.setHeight(4);
        System.out.println("expected 20, got " + r.area());
    }
    public static void main(String[] args) {
        stretch(new Rectangle());
        stretch(new Square()); // blows the expectation
    }
}`,
      output: `expected 20, got 20
expected 20, got 16`,
      explain: [
        'Callers of Rectangle assume width and height are independent.',
        'Square breaks that contract — LSP violation despite successful compilation.',
      ],
    },
    {
      title: 'Fix: separate types / shared abstraction',
      code: `interface Shape {
    int area();
}

final class Rectangle implements Shape {
    private final int w, h;
    Rectangle(int w, int h) { this.w = w; this.h = h; }
    public int area() { return w * h; }
}

final class Square implements Shape {
    private final int side;
    Square(int side) { this.side = side; }
    public int area() { return side * side; }
}

public class Demo2 {
    public static void main(String[] args) {
        Shape r = new Rectangle(5, 4);
        Shape s = new Square(4);
        System.out.println(r.area());
        System.out.println(s.area());
    }
}`,
      output: `20
16`,
      explain: [
        'Both are Shapes for area; neither pretends to be a mutable Rectangle.',
        'Immutability avoids awkward setters that fight the model.',
      ],
    },
  ],
  mistakes: [
    'Overriding to throw or no-op “because subclass does not support it”.',
    'Narrowing accepted inputs in subclasses (stronger preconditions).',
    'Using inheritance for marketing names (“PremiumUser extends User”) when behavior contracts diverge wildly.',
  ],
  interviewAsk: 'What is LSP? Give a violation example.',
  interviewAnswer:
    'LSP requires subtypes to honor the base type’s behavioral contract so callers are not surprised. Square extending mutable Rectangle violates LSP because changing width unexpectedly changes height, breaking code that assumes independent dimensions. Prefer a common Shape abstraction or composition instead of forced is-a.',
  interviewTraps: [
    'Reducing LSP to “override methods correctly” without mentioning contracts.',
  ],
  quiz: {
    question: 'A subtype that throws where the base method always succeeds usually violates:',
    options: ['SRP only', 'LSP', 'DIP only', 'Encapsulation syntax'],
    correctIndex: 1,
    explain: 'Weakening the promise of success breaks substitutability — an LSP issue.',
  },
  practice:
    'Critique a ReadOnlyList extends ArrayList that overrides add to throw. Propose a better design with interfaces.',
  practiceHints: [
    'Split List into ReadableList and WritableList, or expose unmodifiable views.',
  ],
});
