import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-polymorphism',
  title: 'Polymorphism',
  section: 'oop',
  chapter: 'Polymorphism',
  difficulty: 'intermediate',
  importance: 3,
  order: 3,
  prerequisites: ['oop-method-overriding'],
  summary:
    'Polymorphism lets one interface/supertype reference drive different runtime behaviors via dynamic dispatch — built on method overriding.',
  keywords: ['polymorphism', 'dynamic dispatch', 'override', 'subtype', 'LSP', 'upcast'],
  why:
    'Strategy, Template Method, and most clean LLD designs rely on polymorphic calls. After you understand overriding, polymorphism is how you use it at scale: one API, many implementations.',
  theory: [
    'Subtype polymorphism: a subclass/interface implementor can be used wherever the supertype is expected.',
    'Upcasting is implicit (Dog → Animal); downcasting needs a cast and is often a design smell if overused.',
    'Dynamic dispatch (from overriding) is the engine: instance method calls select the override by runtime type.',
    'Overloading is compile-time polymorphism — different mechanism; see Method Overriding lesson for the contrast.',
    'Program to interfaces: List<PaymentMethod> / PaymentMethod p = new CardPayment().',
    'LSP: subtypes must honor the contract; surprising overrides break clients (see SOLID LSP).',
    'final / private / static are not dynamically dispatched as overrides.',
  ],
  mentalModel:
    'A playlist of remotes: each entry is typed Remote, but items are TV/AC/Projector remotes. Pressing power() on each entry runs that device’s override — one loop, many behaviors.',
  moreExamples: [
    {
      title: '1) Interface-typed collection (Strategy in miniature)',
      code: `import java.util.ArrayList;
import java.util.List;

public class PolymorphismDemo {
    interface PaymentMethod {
        String pay(int cents);
    }

    static class CardPayment implements PaymentMethod {
        public String pay(int cents) {
            return "card charged " + cents;
        }
    }

    static class UpiPayment implements PaymentMethod {
        public String pay(int cents) {
            return "upi transferred " + cents;
        }
    }

    static void checkout(PaymentMethod method, int cents) {
        System.out.println(method.pay(cents));
    }

    public static void main(String[] args) {
        List<PaymentMethod> methods = new ArrayList<>();
        methods.add(new CardPayment());
        methods.add(new UpiPayment());
        for (PaymentMethod m : methods) {
            checkout(m, 2599);
        }
    }
}`,
      output: `card charged 2599
upi transferred 2599`,
      explain: [
        'checkout depends only on PaymentMethod — open for new payment types.',
        'Loop variable m has static type PaymentMethod; runtime type picks Card vs Upi.',
        'This is polymorphism applied: overriding + upcast references.',
      ],
    },
    {
      title: '2) Upcast vs downcast',
      code: `class Vehicle {
    String move() { return "moving"; }
}

class Bike extends Vehicle {
    @Override String move() { return "pedaling"; }
    void ringBell() { System.out.println("ring"); }
}

public class CastDemo {
    public static void main(String[] args) {
        Vehicle v = new Bike();          // upcast — always safe
        System.out.println(v.move());    // pedaling (override)

        // v.ringBell();                 // COMPILE ERROR — not on Vehicle

        if (v instanceof Bike b) {       // pattern matching instanceof (modern Java)
            b.ringBell();                // downcast / narrow — use sparingly
        }
    }
}`,
      output: `pedaling
ring`,
      explain: [
        'Upcast lets you treat Bike as Vehicle for polymorphic APIs.',
        'Subtype-only methods require a checked narrow (instanceof / cast).',
        'Prefer pushing behavior into overrides over downcasting in client code.',
      ],
    },
  ],
  mistakes: [
    'Giant switch on type codes instead of polymorphism.',
    'Overloading when you meant overriding.',
    'Downcasting everywhere — a sign the abstraction is wrong.',
  ],
  interviewAsk: 'How does polymorphism relate to overriding?',
  interviewAnswer:
    'Runtime polymorphism in Java is primarily subtype polymorphism powered by method overriding and dynamic dispatch. You hold a supertype reference; the JVM invokes the override for the runtime type. Overloading is a separate, compile-time mechanism.',
  interviewTraps: [
    'Equating polymorphism only with overloading.',
    'Ignoring LSP when inventing overrides.',
  ],
  quiz: [
    {
      question: 'Employee e = new SalariedEmployee(...); e.payCents(); which method runs if Salaried overrides?',
      options: [
        'Always Employee.payCents',
        'SalariedEmployee.payCents',
        'Both always',
        'Compile error',
      ],
      correctIndex: 1,
      explain: 'Instance overrides use dynamic dispatch on the runtime type.',
    },
    {
      question: 'Best description of upcasting?',
      options: [
        'Forcing a parent reference into a child type unsafely',
        'Treating a subclass instance as its superclass/interface type',
        'Only allowed with interfaces',
        'Disabled when methods are overridden',
      ],
      correctIndex: 1,
      explain: 'Upcasting is the safe widening used for polymorphic APIs.',
    },
  ],
  practice:
    'Add WalletPayment without changing checkout — only registration in main. Then add a printReceipt(PaymentMethod) helper that only uses the interface.',
  practiceHints: [
    'Implement PaymentMethod.',
    'Avoid editing checkout’s signature.',
  ],
});
