import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-abstraction',
  title: 'When Abstract Class vs Interface',
  section: 'oop',
  chapter: 'Abstraction',
  difficulty: 'intermediate',
  importance: 3,
  order: 3,
  prerequisites: ['oop-abstract-classes', 'oop-interfaces'],
  summary:
    'Abstraction is the design goal of hiding detail behind a stable surface. Abstract classes and interfaces are the two Java tools — knowing when to pick which is the interview skill.',
  keywords: [
    'abstraction',
    'abstract class vs interface',
    'contract',
    'skeletal implementation',
    'default methods',
  ],
  why:
    'Almost every LLD discussion ends at “program to an interface” vs “share a base class.” This lesson locks the decision table after you have already studied abstract classes and interfaces on their own.',
  theory: [
    'Abstraction = expose essentials, hide machinery. Clients call save()/pay()/area() without knowing HashMap, card rails, or π formulas.',
    'interface = capability / role contract. Implement many. No instance fields. Default methods allowed since Java 8.',
    'abstract class = partial implementation for one inheritance family. Fields, constructors, concrete + abstract methods. Extend only one.',
    'Decision rule: need shared state or constructor invariants → abstract class. Need a role across unrelated types → interface. Often both: interface for the API, abstract class for a skeletal default.',
    'Default methods narrowed the gap, but shared mutable state and constructors still favor abstract classes.',
    'Leaky abstractions fail when the “simple” surface forces clients to know internals anyway — keep contracts honest.',
  ],
  mentalModel:
    'Pedals in a car abstract the drivetrain. The pedal board is the interface (what every car must offer). A shared chassis kit is the abstract class (common parts you extend). Drivers only touch pedals.',
  moreExamples: [
    {
      title: '1) Same problem — interface for the API, abstract class for shared guts',
      code: `import java.util.HashMap;
import java.util.Map;

public class AbstractionChoice {
    interface Store {
        void save(String id, String payload);
        String load(String id);
    }

    abstract static class MemoryStore implements Store {
        protected abstract Map<String, String> map();

        @Override
        public void save(String id, String payload) {
            map().put(id, payload);
        }

        @Override
        public String load(String id) {
            return map().get(id);
        }
    }

    static class HashStore extends MemoryStore {
        private final Map<String, String> data = new HashMap<>();

        @Override
        protected Map<String, String> map() {
            return data;
        }
    }

    public static void main(String[] args) {
        Store store = new HashStore();
        store.save("u1", "Ada");
        System.out.println(store.load("u1"));
    }
}`,
      output: `Ada`,
      explain: [
        'Clients depend on Store (interface) — the abstraction boundary.',
        'MemoryStore (abstract class) owns the shared save/load algorithm.',
        'HashStore only plugs in the map — Template Method / skeletal style.',
      ],
    },
    {
      title: '2) Quick decision table in code comments',
      code: `public class WhenWhich {
    // Capability across unrelated types → INTERFACE
    interface Payable {
        String pay(int cents);
    }

    // Family with shared fields + forced hook → ABSTRACT CLASS
    abstract static class Shape {
        final String name;

        Shape(String name) {
            this.name = name;
        }

        abstract double area();
    }

    static class Card implements Payable {
        public String pay(int cents) {
            return "card:" + cents;
        }
    }

    static class Circle extends Shape {
        final double r;

        Circle(double r) {
            super("circle");
            this.r = r;
        }

        double area() {
            return Math.PI * r * r;
        }
    }

    public static void main(String[] args) {
        Payable p = new Card();
        Shape s = new Circle(1);
        System.out.println(p.pay(100));
        System.out.println(s.name + "=" + (int) s.area());
    }
}`,
      output: `card:100
circle=3`,
      explain: [
        'Payable is a role — Card could also be Auditable, Serializable, etc.',
        'Shape is a family — name + constructor + abstract area().',
        'Do not force Shape into an interface if you need the field and constructor.',
      ],
    },
  ],
  mistakes: [
    'Picking abstract class only because it “feels more OOP.”',
    'Fat interfaces that force empty stubs (ISP smell).',
    'Abstract class as a bag of constants — use interface constants or an enum.',
  ],
  interviewAsk: 'Abstract class vs interface — when to use which?',
  interviewAnswer:
    'Interface for a capability/role that unrelated classes can share (multiple allowed; no instance state). Abstract class when subclasses share code and/or state under single inheritance. Common combo: public API is an interface; provide an abstract skeletal base for the common case. Default methods help evolution, but constructors and protected fields still live on classes.',
  interviewTraps: [
    '“Interfaces cannot have method bodies” (outdated since default methods).',
    'Claiming abstract classes are obsolete after Java 8.',
  ],
  quiz: [
    {
      question: 'You need shared mutable fields + a constructor invariant for a family of types. Prefer:',
      options: [
        'A pure interface with public static fields',
        'An abstract class',
        'Multiple concrete classes with copy-pasted fields',
        'An enum of method names',
      ],
      correctIndex: 1,
      explain: 'Shared instance state and constructors are the classic abstract-class job.',
    },
    {
      question: 'A type can extend how many classes and implement how many interfaces?',
      options: [
        'Many classes, one interface',
        'One class, many interfaces',
        'Many of both freely',
        'One of each only',
      ],
      correctIndex: 1,
      explain: 'Single class inheritance; any number of interfaces.',
    },
  ],
  practice:
    'Design a Logger API: interface Logger with log(String). Provide abstract class PrefixedLogger that stores a prefix and implements log by calling abstract write(String). Concrete ConsoleLogger prints to stdout. Clients should only see Logger.',
});
