import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-method-overriding',
  title: 'Method Overriding',
  section: 'oop',
  chapter: 'Polymorphism',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-inheritance', 'oop-method-overloading'],
  summary:
    'A subclass replaces a superclass instance method with the same signature; calls dispatch on the runtime type — the core of runtime polymorphism.',
  keywords: [
    'overriding',
    'overloading vs overriding',
    '@Override',
    'dynamic dispatch',
    'signature',
    'covariant return',
    'super',
  ],
  why:
    'If you cannot predict which method runs for Animal a = new Dog(); a.speak(); you will fail polymorphism, Strategy, Template Method, and most LLD follow-ups. Overriding deserves its own lesson — not a footnote inside “polymorphism.”',
  theory: [
    'Overriding: subclass provides a new implementation of an inherited instance method with the same name, parameter types, and compatible return type.',
    'Use @Override so the compiler checks you actually override (typos become errors).',
    'Dynamic dispatch: the JVM picks the override based on the runtime type of the receiver, not the compile-time reference type.',
    'Access: override cannot be more restrictive (e.g. public → protected is illegal).',
    'Return type may be covariant (subtype of the original return type).',
    'Cannot override: static methods (they hide), private methods (not visible), final methods, constructors.',
    'Exceptions: overridden method cannot throw broader checked exceptions than the superclass method.',
    'Call the parent implementation with super.method(...) when you want to extend, not fully replace, behavior.',
    'Overloading ≠ overriding: overloading = same name, different parameter lists, resolved at compile time.',
  ],
  mentalModel:
    'The remote is typed Remote. The device in your hand is a TV or AC. power() is declared on Remote but the actual button behavior comes from the concrete device — that selection at press-time is overriding + dynamic dispatch.',
  mermaid: `sequenceDiagram
    participant Main
    participant Ref as Animal ref
    participant Dog as Dog instance
    Main->>Ref: Animal a = new Dog()
    Note over Ref,Dog: static type Animal, runtime type Dog
    Main->>Ref: a.speak()
    Ref->>Dog: dispatch speak()
    Dog-->>Main: "woof"`,
  moreExamples: [
    {
      title: '1) Classic: same call site, different runtime type',
      code: `class Animal {
    String speak() {
        return "...";
    }
}

class Dog extends Animal {
    @Override
    String speak() {
        return "woof";
    }
}

class Cat extends Animal {
    @Override
    String speak() {
        return "meow";
    }
}

public class OverrideBasics {
    static void chorus(Animal a) {
        // compile-time type: Animal
        // runtime type: Dog or Cat → override chosen here
        System.out.println(a.speak());
    }

    public static void main(String[] args) {
        chorus(new Dog());
        chorus(new Cat());

        Animal a = new Dog();
        System.out.println(a.speak()); // woof, not "..."
    }
}`,
      output: `woof
meow
woof`,
      explain: [
        'chorus only knows Animal — new animals plug in without editing chorus.',
        'a.speak() uses Dog’s override because the object’s runtime type is Dog.',
        '@Override protects you from “speak(String)” accidentally becoming an overload.',
      ],
    },
    {
      title: '2) super.method — extend instead of erase parent behavior',
      code: `class Notifier {
    String notifyUser(String msg) {
        return "base:" + msg;
    }
}

class EmailNotifier extends Notifier {
    @Override
    String notifyUser(String msg) {
        String base = super.notifyUser(msg); // keep parent work
        return base + "|email-sent";
    }
}

public class SuperOverride {
    public static void main(String[] args) {
        Notifier n = new EmailNotifier();
        System.out.println(n.notifyUser("hello"));
    }
}`,
      output: `base:hello|email-sent`,
      explain: [
        'super.notifyUser(...) calls the superclass implementation explicitly.',
        'Static type is Notifier; runtime type EmailNotifier → override still runs.',
        'Template Method / hooks often combine super calls with subclass additions.',
      ],
    },
    {
      title: '3) Rules that break overriding (and what happens instead)',
      code: `class Parent {
    void instanceOk() { System.out.println("Parent.instanceOk"); }
    static void staticHide() { System.out.println("Parent.staticHide"); }
    private void secret() { System.out.println("Parent.secret"); }
    final void locked() { System.out.println("Parent.locked"); }
}

class Child extends Parent {
    @Override
    void instanceOk() { System.out.println("Child.instanceOk"); }

    // NOT an override — hides static method
    static void staticHide() { System.out.println("Child.staticHide"); }

    // NOT an override — new private method in Child
    private void secret() { System.out.println("Child.secret"); }

    // @Override void locked() { } // COMPILE ERROR — final
}

public class OverrideRules {
    public static void main(String[] args) {
        Parent p = new Child();
        p.instanceOk();          // Child — true override
        p.staticHide();          // Parent — static binds to reference type
        // p.secret();           // private — not callable here
        p.locked();              // Parent.locked
    }
}`,
      output: `Child.instanceOk
Parent.staticHide
Parent.locked`,
      explain: [
        'Only instanceOk is a real override with dynamic dispatch.',
        'staticHide is hiding: call uses compile-time type Parent.',
        'private methods are not overridden; final methods cannot be overridden.',
      ],
    },
    {
      title: '4) Overloading vs overriding side-by-side',
      code: `class Printer {
    void print(String s) {
        System.out.println("String:" + s);
    }

    // OVERLOAD — different parameter list, compile-time choice
    void print(int n) {
        System.out.println("int:" + n);
    }
}

class FancyPrinter extends Printer {
    // OVERRIDE — same signature as print(String)
    @Override
    void print(String s) {
        System.out.println("Fancy:" + s);
    }
}

public class OverloadVsOverride {
    public static void main(String[] args) {
        Printer p = new FancyPrinter();
        p.print("hi"); // override → Fancy
        p.print(7);    // overload chosen by argument type at compile time
    }
}`,
      output: `Fancy:hi
int:7`,
      explain: [
        'print(String) is overridden — runtime type FancyPrinter wins.',
        'print(int) is an overload on Printer — resolved from the static call signature.',
        'Interview one-liner: override = same signature + runtime; overload = different params + compile time.',
      ],
    },
  ],
  mistakes: [
    'Changing parameter types slightly and thinking you overrode (you overloaded).',
    'Forgetting @Override and shipping a silent overload bug.',
    'Expecting static or private methods to dispatch polymorphically.',
    'Making the override more private than the parent method.',
    'Throwing broader checked exceptions in the override than the parent allows.',
  ],
  interviewAsk: 'What is method overriding? Rules? Overloading vs overriding?',
  interviewAnswer:
    'Overriding is replacing an inherited instance method with the same signature so calls dispatch on the runtime type. Rules: compatible return (covariant OK), non-weaker access, no broader checked exceptions, not final/static/private. Overloading uses the same name with different parameter lists and is resolved at compile time. Demonstrate with Animal a = new Dog(); a.speak();',
  interviewTraps: [
    'Calling both overloading and overriding “runtime polymorphism.”',
    'Saying “Java is pass-by-reference so overrides work” — unrelated.',
  ],
  quiz: [
    {
      question: 'Animal a = new Dog(); a.speak(); which speak() runs if Dog overrides it?',
      options: ['Animal.speak only', 'Dog.speak', 'Both always', 'Compile error'],
      correctIndex: 1,
      explain: 'Instance overrides use dynamic dispatch on the runtime type (Dog).',
    },
    {
      question: 'Parent p = new Child(); p.staticMethod(); if both define staticMethod, which runs?',
      options: [
        'Child — static methods override',
        'Parent — static resolution uses reference type',
        'Random',
        'Compile error',
      ],
      correctIndex: 1,
      explain: 'static methods are hidden, not overridden; the compile-time type Parent wins.',
    },
    {
      question: 'Which cannot be overridden?',
      options: [
        'A public instance method',
        'A protected instance method',
        'A final instance method',
        'A method with covariant return type',
      ],
      correctIndex: 2,
      explain: 'final methods are locked against overriding.',
    },
  ],
  practice:
    'Model Shape with area(). Override in Circle and Rectangle. Store them in List<Shape> and print areas. Then intentionally “override” with a different parameter list and show with @Override that it fails to compile — fix it into a true override.',
  practiceHints: [
    'Same name + same parameter types = override candidate.',
    'Add @Override first; let the compiler guide you.',
  ],
  deepDive: [
    'Bridge methods: the compiler may insert synthetic methods for generics/covariant returns — relevant when reading bytecode.',
    'Calling overridable methods from constructors is dangerous — subclass overrides can run before subclass fields init.',
  ],
});
