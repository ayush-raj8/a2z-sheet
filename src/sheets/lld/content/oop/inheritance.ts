import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-inheritance',
  title: 'Inheritance',
  section: 'oop',
  chapter: 'Inheritance',
  difficulty: 'intermediate',
  importance: 3,
  order: 1,
  prerequisites: ['oop-access-modifiers', 'java-classes-objects'],
  summary:
    'extends creates an is-a relationship: subclass inherits members, may override methods, and chains constructors with super(...). Know the types Java supports, and always separate reference type from object type.',
  keywords: [
    'extends',
    'super',
    'override',
    'is-a',
    'single inheritance',
    'multilevel',
    'hierarchical',
    'reference type',
    'runtime type',
  ],
  why: 'Inheritance is powerful and dangerous. LLD interviews expect is-a judgment, constructor chaining, types of inheritance in Java, and a clear mental model of reference type vs actual object type.',
  theory: [
    'Inheritance: a subclass reuses and specializes a superclass via extends — true is-a (Dog is an Animal).',
    'Java: single class inheritance (one extends) + multiple interface implementation. No multiple class inheritance.',
    'Types you will be asked: single, multilevel, hierarchical. “Multiple” inheritance of classes is not allowed; interfaces give multiple inheritance of type. Hybrid = combination of the supported forms.',
    'Reference type (compile-time) = the variable’s declared type. Object type (runtime) = the real instance created with new. Method calls on instance methods use the object type (dynamic dispatch).',
    'Constructors are not inherited — subclass constructors call super(...).',
    '@Override documents replacing a superclass method; return types may be covariant.',
    'final classes cannot be extended; final methods cannot be overridden.',
    'Prefer composition when you need reuse without substitutability (HAS-A vs IS-A).',
  ],
  mentalModel:
    'Inheritance is taxonomy: Dog is an Animal. The variable’s type is the label on the leash (Animal); the object is the actual dog on the leash. Commands go to the dog — not the label.',
  tables: [
    {
      title: 'Types of inheritance (Java)',
      headers: ['Type', 'Shape', 'Java support', 'Example'],
      rows: [
        ['Single', 'A → B', 'Yes (classes)', 'Dog extends Animal'],
        ['Multilevel', 'A → B → C', 'Yes (classes)', 'Puppy extends Dog extends Animal'],
        ['Hierarchical', 'A → B and A → C', 'Yes (classes)', 'Dog and Cat both extend Animal'],
        [
          'Multiple (classes)',
          'B extends A and C',
          'No',
          'Illegal for classes — diamond ambiguity',
        ],
        [
          'Multiple (interfaces)',
          'B implements X, Y',
          'Yes',
          'ArrayList implements List, RandomAccess, …',
        ],
        [
          'Hybrid',
          'Mix of above',
          'Partial',
          'Class hierarchy + multiple interfaces',
        ],
      ],
      caption:
        'When someone says “Java has no multiple inheritance,” they mean multiple class inheritance. Interfaces still allow multiple inheritance of type.',
    },
    {
      title: 'Reference type vs object type',
      headers: ['Idea', 'Means', 'Decides'],
      rows: [
        [
          'Reference type',
          'Type of the variable / parameter (Animal a)',
          'What members you can call without casting (compile-time)',
        ],
        [
          'Object type',
          'Actual class of the instance (new Dog())',
          'Which override runs for instance methods (runtime)',
        ],
        [
          'Upcast',
          'Dog → Animal (implicit)',
          'Safe; narrows the visible API',
        ],
        [
          'Downcast',
          'Animal → Dog (explicit cast)',
          'May fail with ClassCastException',
        ],
      ],
    },
  ],
  moreExamples: [
    {
      title: '1) Single inheritance — top-level classes (not nested static)',
      code: `class Employee {
    private final String name;

    Employee(String name) {
        this.name = name;
    }

    String name() {
        return name;
    }

    int payCents() {
        return 0;
    }

    @Override
    public String toString() {
        return name + " pay=" + payCents();
    }
}

class SalariedEmployee extends Employee {
    private final int monthlyCents;

    SalariedEmployee(String name, int monthlyCents) {
        super(name); // initialize superclass first
        this.monthlyCents = monthlyCents;
    }

    @Override
    int payCents() {
        return monthlyCents;
    }
}

public class SingleInheritanceDemo {
    public static void main(String[] args) {
        SalariedEmployee ada = new SalariedEmployee("Ada", 500_000);
        System.out.println(ada);
    }
}`,
      output: `Ada pay=500000`,
      explain: [
        'Ordinary top-level classes: SalariedEmployee extends Employee (single inheritance).',
        'super(name) runs Employee’s constructor before subclass fields initialize.',
        'Nested static class demos are fine for one-file snippets, but real designs use top-level types like this.',
      ],
    },
    {
      title: '2) Reference type vs object type',
      code: `class Animal {
    String speak() {
        return "…";
    }
}

class Dog extends Animal {
    @Override
    String speak() {
        return "woof";
    }

    void fetch() {
        System.out.println("fetching");
    }
}

public class RefVsObjectDemo {
    public static void main(String[] args) {
        // reference type = Animal; object type = Dog
        Animal a = new Dog();

        System.out.println("speak() -> " + a.speak()); // Dog override (object type)
        System.out.println("runtime class -> " + a.getClass().getSimpleName());

        // a.fetch(); // COMPILE ERROR — fetch not on Animal (reference type)

        Dog d = (Dog) a; // downcast: tell the compiler the object type
        d.fetch();

        Animal plain = new Animal();
        try {
            Dog wrong = (Dog) plain; // object is Animal, not Dog
            wrong.fetch();
        } catch (ClassCastException e) {
            System.out.println("bad downcast: " + e.getClass().getSimpleName());
        }
    }
}`,
      output: `speak() -> woof
runtime class -> Dog
fetching
bad downcast: ClassCastException`,
      explain: [
        'Animal a = new Dog(): left side is reference type; right side creates the object type.',
        'a.speak() uses the Dog override because dispatch follows the object.',
        'a.fetch() fails to compile — the reference type does not declare fetch.',
        'Casting does not change the object; a wrong cast fails at runtime.',
      ],
    },
    {
      title: '3) Multilevel inheritance (A → B → C)',
      code: `class Animal {
    String kind() {
        return "animal";
    }
}

class Dog extends Animal {
    @Override
    String kind() {
        return "dog";
    }
}

class Puppy extends Dog {
    @Override
    String kind() {
        return "puppy";
    }
}

public class MultilevelDemo {
    public static void main(String[] args) {
        Animal a = new Puppy(); // ref: Animal, object: Puppy
        Dog d = new Puppy();    // ref: Dog,    object: Puppy
        Puppy p = new Puppy();  // ref: Puppy,  object: Puppy

        System.out.println(a.kind());
        System.out.println(d.kind());
        System.out.println(p.kind());
        System.out.println(a instanceof Dog);
        System.out.println(a instanceof Puppy);
    }
}`,
      output: `puppy
puppy
puppy
true
true`,
      explain: [
        'Puppy extends Dog extends Animal — multilevel chain.',
        'All three references point at one Puppy object; kind() always resolves to Puppy.',
        'instanceof checks the object type against a type in the hierarchy.',
      ],
    },
    {
      title: '4) Hierarchical inheritance (one parent, many children)',
      code: `class Animal {
    String speak() {
        return "…";
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

public class HierarchicalDemo {
    static void chorus(Animal animal) {
        // parameter reference type = Animal; object type varies
        System.out.println(animal.speak());
    }

    public static void main(String[] args) {
        chorus(new Dog());
        chorus(new Cat());
        chorus(new Animal());
    }
}`,
      output: `woof
meow
…`,
      explain: [
        'Dog and Cat both extend Animal — hierarchical inheritance.',
        'chorus takes an Animal reference; each call passes a different object type.',
        'Same method name, different runtime behavior — foundation for polymorphism.',
      ],
    },
    {
      title: '5) Multiple inheritance of classes is illegal — use interfaces for roles',
      code: `interface Audible {
    String sound();
}

interface Trackable {
    String id();
}

class Sensor implements Audible, Trackable {
    @Override
    public String sound() {
        return "beep";
    }

    @Override
    public String id() {
        return "S-1";
    }
}

public class MultipleViaInterfaces {
    public static void main(String[] args) {
        Sensor sensor = new Sensor();
        Audible audible = sensor;     // ref type Audible, object Sensor
        Trackable trackable = sensor; // ref type Trackable, object Sensor
        System.out.println(audible.sound());
        System.out.println(trackable.id());
        // class A extends B, C {}  // COMPILE ERROR — no multiple class inheritance
    }
}`,
      output: `beep
S-1`,
      explain: [
        'One class implements many interfaces — multiple inheritance of type, not of class state.',
        'Each variable shows a different reference type for the same object.',
        'This is how Java avoids the diamond problem for classes.',
      ],
    },
  ],
  mistakes: [
    'Deep inheritance trees for code reuse only (fragile base class problem).',
    'Forgetting super(...) when no default superclass constructor exists.',
    'Confusing reference type with object type (“a is Animal so speak cannot be woof”).',
    'Assuming Java allows class C extends A, B.',
    'Overriding equals carelessly across inheritance hierarchies.',
  ],
  interviewAsk: 'Inheritance vs composition — when do you choose which?',
  interviewAnswer:
    'Use inheritance when there is a true subtype relationship and clients should program to the superclass/interface substitutably (LSP). Use composition when you want to reuse behavior without exposing is-a, or when behavior should be swapped at runtime. Favor composition by default for flexibility; inherit carefully from types you control.',
  interviewTraps: [
    'Always inheriting for reuse (e.g. Stack extends Vector historically — bad).',
    'Saying Java supports multiple class inheritance.',
    'Claiming the variable’s declared type is the only type that matters at runtime.',
  ],
  quiz: [
    {
      question: 'Are constructors inherited by subclasses?',
      options: [
        'Yes, all of them',
        'No — subclasses define their own and call super(...)',
        'Only public constructors',
        'Only if marked @Inherited',
      ],
      correctIndex: 1,
      explain: 'Constructors are not inherited; chaining via super is required.',
    },
    {
      question: 'Animal a = new Dog();  What is the reference type and object type?',
      options: [
        'Both Animal',
        'Reference Animal, object Dog',
        'Reference Dog, object Animal',
        'Both Dog',
      ],
      correctIndex: 1,
      explain: 'Left side declares the reference type; new creates the object type.',
    },
    {
      question: 'Which inheritance form can Java classes not express directly?',
      options: [
        'Single',
        'Multilevel',
        'Hierarchical',
        'Multiple class inheritance (one class extends two classes)',
      ],
      correctIndex: 3,
      explain: 'Classes have single inheritance; multiple roles come from interfaces.',
    },
  ],
  practice:
    'Model Shape with area(); Circle and Rectangle extend it. Put them in a List<Shape> (Shape = reference type) and sum areas — print each object’s runtime class with getClass(). Then note why class FlyingCar extends Car, Airplane would be illegal.',
  practiceHints: [
    'Keep fields private in subclasses.',
    'Try to break LSP intentionally (Square extends Rectangle mutating width) and discuss the smell.',
  ],
});
