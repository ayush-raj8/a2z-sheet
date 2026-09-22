import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-composition-vs-inheritance',
  title: 'Composition vs Inheritance',
  section: 'oop',
  chapter: 'Relationships',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-relationships', 'oop-inheritance'],
  summary:
    'When to inherit, when to compose, and why "favor composition over inheritance" is the default advice in LLD.',
  keywords: [
    'composition',
    'inheritance',
    'favor composition',
    'is-a',
    'has-a',
    'fragile base class',
  ],
  why: `Inheritance is the easiest way to reuse code in a hurry — and the hardest to unwind later. Fragile base classes, wrong is-a models, and exploding hierarchies show up constantly in design interviews. Knowing when composition wins is a senior signal.`,
  theory: [
    'Inheritance models specialization (is-a). The subtype must honor the parent’s contract everywhere (Liskov).',
    'Composition models collaboration (has-a / uses-a). You plug in collaborators and delegate.',
    'Favor composition when: behavior varies independently, you need runtime swapping, or reuse is about utilities rather than taxonomy.',
    'Prefer inheritance when: you have a clear stable hierarchy, shared abstract behavior, and subtypes truly substitute for the parent.',
    'Inheritance couples you to the parent’s implementation details (fragile base class). Changing a protected method can break all children.',
    'A practical pattern: extract an interface, implement via composition of strategies/helpers, use inheritance sparingly for shared skeletal implementations (template method).',
  ],
  mentalModel: `Inheritance is adopting a family tree — you inherit furniture and rules. Composition is renting furniture à la carte. Most systems need rented furniture plus a few carefully chosen family ties.`,
  moreExamples: [
    {
      title: 'Bad inheritance vs good composition',
      code: `// BAD: Stack is-a Vector? In early Java yes — but Stack is not a Vector.
// Clients can call Vector methods and break stack discipline.

// BAD for reuse: inheritance of implementation
class Bird {
    void fly() { System.out.println("flying"); }
}
class Penguin extends Bird {
    @Override
    void fly() { throw new UnsupportedOperationException("nope"); } // broken is-a
}

// BETTER: compose behaviors
interface Flyer { void fly(); }
interface Walker { void walk(); }

class WingedFlight implements Flyer {
    public void fly() { System.out.println("flapping"); }
}
class NoFlight implements Flyer {
    public void fly() { throw new UnsupportedOperationException("cannot fly"); }
}
class BipedWalk implements Walker {
    public void walk() { System.out.println("waddling"); }
}

class Animal {
    private final Flyer flyer;
    private final Walker walker;
    Animal(Flyer flyer, Walker walker) {
        this.flyer = flyer;
        this.walker = walker;
    }
    void fly() { flyer.fly(); }
    void walk() { walker.walk(); }
}

public class Demo {
    public static void main(String[] args) {
        Animal eagle = new Animal(new WingedFlight(), new BipedWalk());
        Animal penguin = new Animal(new NoFlight(), new BipedWalk());
        eagle.fly();
        eagle.walk();
        penguin.walk();
        try {
            penguin.fly();
        } catch (UnsupportedOperationException e) {
            System.out.println("penguin: " + e.getMessage());
        }
    }
}`,
      output: `flapping
waddling
waddling
penguin: cannot fly`,
      explain: [
        'Penguin extending Bird that always flies is a classic inheritance abuse — subtypes must honor the parent contract.',
        'Animal holds Flyer and Walker strategies: behaviors mix without a deep class tree.',
        'You can give eagle and penguin different flight policies without overriding and violating expectations.',
        'If you still want inheritance, prefer abstract Animal with protected hooks — but composition of behaviors scales better.',
      ],
    },
    {
      title: 'Delegation wrapper (composition for reuse)',
      code: `import java.util.*;

// Reuse List behavior without extending ArrayList
final class BoundedList<E> {
    private final List<E> inner = new ArrayList<>();
    private final int max;

    BoundedList(int max) { this.max = max; }

    void add(E e) {
        if (inner.size() >= max) throw new IllegalStateException("full");
        inner.add(e);
    }

    int size() { return inner.size(); }
}

public class Demo2 {
    public static void main(String[] args) {
        BoundedList<String> list = new BoundedList<>(1);
        list.add("a");
        try { list.add("b"); } catch (IllegalStateException ex) {
            System.out.println(ex.getMessage());
        }
        System.out.println("size=" + list.size());
    }
}`,
      output: `full
size=1`,
      explain: [
        'Extending ArrayList would inherit dozens of methods you may not want to support.',
        'Composition lets you expose only a safe, intentional API.',
      ],
    },
  ],
  mistakes: [
    'Inheriting only to reuse a few methods (implementation inheritance) instead of extracting shared code.',
    'Deep trees (Base → A → B → C) that nobody can reason about.',
    'Overriding methods to no-op or throw to "disable" parent behavior — a LSP smell.',
    'Using inheritance for "and also has logging/caching" — use decorators/composition.',
  ],
  interviewAsk: 'Why do people say prefer composition over inheritance?',
  interviewAnswer:
    'Composition keeps coupling low, allows runtime swapping of parts, avoids fragile base classes, and does not force an is-a taxonomy when the domain is really has-a. Inheritance is still useful for true specialization and shared abstract contracts, but default to composing collaborators behind interfaces.',
  interviewTraps: [
    'Saying inheritance is always wrong — frameworks and skeletal abstract classes are valid.',
    'Equating composition with aggregation only — ownership can still be strong.',
  ],
  quiz: {
    question: 'Penguin extends Bird and overrides fly() to throw. The main design problem is:',
    options: [
      'Too much encapsulation',
      'Broken is-a / LSP — Penguin is not substitutable as a flying Bird',
      'Missing dependency injection framework',
      'Lack of checked exceptions',
    ],
    correctIndex: 1,
    explain: 'Subtypes must honor the parent contract; throwing where Bird.fly succeeds breaks substitutability.',
  },
  practice:
    'Refactor a class hierarchy LoggedPrinter extends Printer extends Output into a Printer that composes an optional Logger and an Output destination.',
  practiceHints: [
    'Printer(Output out, Logger log) and delegate.',
    'Avoid subclassing just to wrap another call with logging.',
  ],
});
