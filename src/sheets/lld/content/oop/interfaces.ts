import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-interfaces',
  title: 'Interfaces',
  section: 'oop',
  chapter: 'Abstraction',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-polymorphism'],
  summary:
    'An interface declares a capability contract: classes implement it, callers depend on it, and a type may implement many interfaces.',
  keywords: [
    'interface',
    'implements',
    'default method',
    'multiple inheritance of type',
    'contract',
  ],
  why:
    'Almost every clean Java design programs to interfaces (List, Runnable, Comparator, repository ports). Interviews expect you to explain implements, multiple interfaces, and default methods without confusing them with abstract classes.',
  theory: [
    'interface defines abstract instance methods (implicitly public) that implementors must provide.',
    'A class implements one or more interfaces — multiple inheritance of type, not of state.',
    'Interface references enable polymorphism: PaymentMethod p = new UpiPayment().',
    'Since Java 8: default methods (instance methods with a body) and static methods on interfaces.',
    'Since Java 9: private methods in interfaces to share code between defaults.',
    'Fields in interfaces are public static final constants — not instance state.',
    'Functional interfaces (one abstract method) enable lambdas — e.g. Comparator, Runnable.',
    'Prefer interfaces for roles/capabilities across unrelated classes (Serializable, Comparable, AutoCloseable).',
  ],
  mentalModel:
    'A job description: “must be able to pay.” Cards, UPI, wallets all implement that job. HR (your service) only cares that pay() exists — not which company badge the worker wears.',
  moreExamples: [
    {
      title: '1) Contract + multiple implementations',
      code: `public class InterfaceBasics {
    interface PaymentMethod {
        String pay(int cents);
    }

    static class CardPayment implements PaymentMethod {
        @Override
        public String pay(int cents) {
            return "card:" + cents;
        }
    }

    static class UpiPayment implements PaymentMethod {
        @Override
        public String pay(int cents) {
            return "upi:" + cents;
        }
    }

    static void checkout(PaymentMethod method) {
        System.out.println(method.pay(500));
    }

    public static void main(String[] args) {
        checkout(new CardPayment());
        checkout(new UpiPayment());
    }
}`,
      output: `card:500
upi:500`,
      explain: [
        'checkout depends only on PaymentMethod.',
        'New payment types require no change to checkout — Open/Closed.',
        'implements lists the contract; @Override documents the method fulfills it.',
      ],
    },
    {
      title: '2) A class implementing two interfaces',
      code: `public class MultiInterfaceDemo {
    interface Audible {
        String sound();
    }

    interface Trackable {
        String id();
    }

    static class Sensor implements Audible, Trackable {
        @Override
        public String sound() {
            return "beep";
        }

        @Override
        public String id() {
            return "S-1";
        }
    }

    public static void main(String[] args) {
        Sensor s = new Sensor();
        Audible a = s;
        Trackable t = s;
        System.out.println(a.sound());
        System.out.println(t.id());
    }
}`,
      output: `beep
S-1`,
      explain: [
        'One object can be viewed through multiple interface lenses.',
        'This is multiple inheritance of type — still one class inheritance chain.',
        'Useful for ISP: split fat roles into narrow interfaces.',
      ],
    },
    {
      title: '3) Default method on an interface',
      code: `public class DefaultMethodDemo {
    interface Greeter {
        String name();

        default String greet() {
            return "hello " + name();
        }
    }

    static class User implements Greeter {
        private final String name;

        User(String name) {
            this.name = name;
        }

        @Override
        public String name() {
            return name;
        }
    }

    public static void main(String[] args) {
        Greeter g = new User("Ada");
        System.out.println(g.greet());
    }
}`,
      output: `hello Ada`,
      explain: [
        'default greet() provides reusable behavior without an abstract class.',
        'Implementors can override greet() if needed.',
        'Diamond conflicts with two defaults of the same signature must be resolved explicitly.',
      ],
    },
    {
      title: '4) Interface inheritance — extends one or many (legal for interfaces)',
      code: `public class InterfaceExtendsDemo {
    interface Named {
        String name();
    }

    interface Aged {
        int age();
    }

    // Interface may extend one parent
    interface Person extends Named {
        String greet();
    }

    // Interface may extend MANY parents — illegal for classes (see Inheritance)
    interface Citizen extends Named, Aged {
        String id();
    }

    static class User implements Citizen {
        private final String name;
        private final int age;
        private final String id;

        User(String name, int age, String id) {
            this.name = name;
            this.age = age;
            this.id = id;
        }

        public String name() { return name; }
        public int age() { return age; }
        public String id() { return id; }
    }

    public static void main(String[] args) {
        Citizen c = new User("Ada", 36, "X-1");
        Named n = c; // upcast along interface inheritance
        System.out.println(n.name() + " age=" + c.age() + " id=" + c.id());
        // class Bad extends Named, Aged {} // COMPILE ERROR — classes cannot multi-extend
    }
}`,
      output: `Ada age=36 id=X-1`,
      explain: [
        'interface Person extends Named — single interface inheritance.',
        'interface Citizen extends Named, Aged — multiple inheritance of interface contracts is legal.',
        'Contrast with Inheritance (oop-inheritance): a class cannot extends two classes.',
      ],
    },
    {
      title: '5) @FunctionalInterface + lambda',
      code: `public class FunctionalInterfaceDemo {
    @FunctionalInterface
    interface Validator {
        boolean test(int value);
        // only one abstract method — lambdas allowed
    }

    static boolean accepts(Validator v, int value) {
        return v.test(value);
    }

    public static void main(String[] args) {
        Validator positive = v -> v > 0;
        Validator even = v -> v % 2 == 0;
        System.out.println(accepts(positive, 3));
        System.out.println(accepts(even, 3));
        System.out.println(accepts(v -> v < 10, 3));
    }
}`,
      output: `true
false
true`,
      explain: [
        '@FunctionalInterface documents the single-abstract-method contract (SAM).',
        'positive / even are lambdas implementing Validator — no named class needed.',
        'Same idea as Comparator, Runnable, Predicate in the JDK.',
      ],
    },
  ],
  mistakes: [
    'Putting mutable instance fields on an “interface” — you cannot; use a class.',
    'Fat interfaces that force empty method stubs (ISP smell).',
    'Using an abstract class when only a pure contract is needed.',
  ],
  interviewAsk: 'Why prefer coding to an interface?',
  interviewAnswer:
    'Callers depend on a stable capability, not a concrete class. You can swap implementations, test with fakes, and avoid cascading change. Combine with dependency injection: pass PaymentMethod, not CardPayment.',
  interviewTraps: [
    '“Interfaces cannot have method bodies” (outdated since default methods).',
    'Creating an interface for every class with a single implementation forever — ceremony without benefit.',
  ],
  quiz: [
    {
      question: 'How many interfaces can a Java class implement?',
      options: ['Zero or one', 'Exactly one', 'Any number (including zero)', 'Only if it extends Object'],
      correctIndex: 2,
      explain: 'A class may implement many interfaces.',
    },
    {
      question: 'Interface fields are:',
      options: [
        'Protected instance fields',
        'Public static final constants',
        'Package-private mutable fields',
        'Only allowed on abstract interfaces',
      ],
      correctIndex: 1,
      explain: 'Interface fields are implicitly public static final.',
    },
  ],
  practice:
    'Define Notifier with notify(String msg). Implement EmailNotifier and SmsNotifier. Build NotificationService(Notifier n) that only calls the interface.',
});
