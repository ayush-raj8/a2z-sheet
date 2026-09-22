import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-access-modifiers',
  title: 'Access Modifiers',
  section: 'oop',
  chapter: 'Encapsulation',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-encapsulation', 'java-classes-objects'],
  summary:
    'private, default (package), protected, and public control who can see types and members — encapsulation starts here.',
  keywords: ['private', 'protected', 'public', 'package-private', 'default', 'encapsulation'],
  why: 'Package boundaries and member visibility are how LLD hides invariants. Wrong visibility either leaks internals or forces awkward workarounds and reflection hacks.',
  theory: [
    'private: visible only inside the same top-level class (nested types in that class can see it too).',
    'default / package-private (no modifier written): same package only — subclasses in other packages do not get it.',
    'protected: same package + subclasses in other packages (via inheritance).',
    'public: visible everywhere the type itself is visible.',
    'Top-level classes/interfaces are only public or package-private; nested types can also be private or protected.',
    'Design rule: start private; widen deliberately. Prefer getters over public fields.',
  ],
  mentalModel:
    'Visibility is a series of fences: private = your room, default = your floor (package), protected = family bloodline across buildings, public = city street.',
  tables: [
    {
      title: 'Who can access a member?',
      headers: [
        'Modifier',
        'Same class',
        'Same package',
        'Subclass (other package)',
        'Everywhere else',
      ],
      rows: [
        ['private', 'Yes', 'No', 'No', 'No'],
        ['default (no modifier)', 'Yes', 'Yes', 'No', 'No'],
        ['protected', 'Yes', 'Yes', 'Yes', 'No'],
        ['public', 'Yes', 'Yes', 'Yes', 'Yes'],
      ],
      caption:
        'Read left → right: each row is more open than the one above. “default” means you write no keyword.',
    },
  ],
  moreExamples: [
    {
      title: '1) private — same class only',
      code: `public class PrivateDemo {
    static class BankAccount {
        private int balance = 100;

        public int getBalance() {
            return balance; // OK — same class
        }

        public void deposit(int amount) {
            if (amount > 0) {
                balance += amount; // OK — same class
            }
        }
    }

    static class Auditor {
        void peek(BankAccount account) {
            // System.out.println(account.balance); // COMPILE ERROR — private
            System.out.println("visible via getter: " + account.getBalance());
        }
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount();
        account.deposit(50);
        new Auditor().peek(account);
    }
}`,
      output: `visible via getter: 150`,
      explain: [
        'balance is private — only BankAccount methods may touch it.',
        'Auditor must go through the public getter; direct field access does not compile.',
        'This is the default starting point for encapsulation.',
      ],
    },
    {
      title: '2) default (package-private) — same package only',
      code: `// Imagine both classes live in package bank;
// no access modifier on the field = package-private.

public class DefaultDemo {
    static class Account {
        int balance = 100; // default / package-private

        public int getBalance() {
            return balance;
        }
    }

    // Same package (here: same outer class) → allowed
    static class InterestCalculator {
        void apply(Account account, int interest) {
            account.balance += interest; // OK — same package
            System.out.println("after interest: " + account.balance);
        }
    }

    public static void main(String[] args) {
        Account account = new Account();
        new InterestCalculator().apply(account, 10);
        // From another package, account.balance would be a COMPILE ERROR.
    }
}`,
      output: `after interest: 110`,
      explain: [
        'Writing no modifier means package-private — not “default public.”',
        'Same-package helpers (InterestCalculator) can read/write the field.',
        'A class in a different package cannot — that is the limitation vs protected/public.',
      ],
    },
    {
      title: '3) protected — package + subclasses',
      code: `public class ProtectedDemo {
    static class Animal {
        protected String sound = "generic";

        protected void speak() {
            System.out.println(sound);
        }
    }

    static class Dog extends Animal {
        void bark() {
            sound = "woof"; // OK — subclass can use protected members
            speak();        // OK
        }
    }

    static class ZooKeeper {
        void listen(Animal animal) {
            // Same package → protected is visible
            System.out.println("keeper hears: " + animal.sound);
        }
    }

    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.bark();
        new ZooKeeper().listen(dog);
        // Unrelated class in another package: animal.sound → COMPILE ERROR
    }
}`,
      output: `woof
keeper hears: woof`,
      explain: [
        'Subclasses inherit protected members even across packages.',
        'Unrelated classes in other packages cannot touch protected members.',
        'Same package still sees protected — it is wider than default, not narrower.',
      ],
    },
    {
      title: '4) public — visible everywhere',
      code: `public class PublicDemo {
    public static class Clock {
        public final String timezone;

        public Clock(String timezone) {
            this.timezone = timezone;
        }

        public String nowLabel() {
            return "now@" + timezone;
        }
    }

    public static void main(String[] args) {
        Clock clock = new Clock("UTC");
        // Any class in any package can use public members of a public type:
        System.out.println(clock.timezone);
        System.out.println(clock.nowLabel());
    }
}`,
      output: `UTC
now@UTC`,
      explain: [
        'public members are part of the type’s API surface.',
        'Prefer public methods over public mutable fields so you can change internals later.',
        'A public field on a non-public type is still limited by the type’s own visibility.',
      ],
    },
    {
      title: '5) All four side-by-side (what each caller can see)',
      code: `public class AllModifiersDemo {
    static class Box {
        private String priv = "private";
        String pack = "package";      // default
        protected String prot = "protected";
        public String pub = "public";

        void showOwn() {
            System.out.println(priv + " / " + pack + " / " + prot + " / " + pub);
        }
    }

    static class SamePackage {
        void inspect(Box box) {
            // box.priv; // COMPILE ERROR
            System.out.println("same package sees: " + box.pack + ", " + box.prot + ", " + box.pub);
        }
    }

    static class SubBox extends Box {
        void inspectInherited() {
            // priv; // COMPILE ERROR — not inherited for access
            System.out.println("subclass sees: " + pack + ", " + prot + ", " + pub);
        }
    }

    public static void main(String[] args) {
        Box box = new Box();
        box.showOwn();
        new SamePackage().inspect(box);
        new SubBox().inspectInherited();
    }
}`,
      output: `private / package / protected / public
same package sees: package, protected, public
subclass sees: package, protected, public`,
      explain: [
        'Same class: all four.',
        'Same package (non-subclass): default + protected + public — not private.',
        'Subclass here shares the package, so it also sees default. In another package a subclass would see only protected + public.',
      ],
    },
  ],
  mistakes: [
    'Leaving domain fields public “just for now.”',
    'Assuming protected == package-private (protected is wider).',
    'Thinking “default” means public — it means package-private.',
    'Making everything public because a framework needs access — prefer getters or proper config.',
  ],
  interviewAsk: 'Difference between protected and default access?',
  interviewAnswer:
    'Default (no modifier) is package-only. protected is package-only plus subclasses in other packages. A subclass outside the package gets protected members through inheritance, but package-private members stay invisible across that package border.',
  interviewTraps: [
    'Saying private members are invisible to nested classes in the same top-level class.',
    'Claiming protected is visible to the whole world.',
    'Calling the no-modifier level “default public.”',
  ],
  quiz: [
    {
      question: 'A subclass in another package can access which superclass member style?',
      options: [
        'private fields of the superclass',
        'package-private fields of the superclass',
        'protected members of the superclass (via inheritance)',
        'None of the above',
      ],
      correctIndex: 2,
      explain: 'protected crosses package borders for subclasses; package-private does not.',
    },
    {
      question: 'What does writing no access modifier on a field mean?',
      options: [
        'public',
        'private',
        'package-private (same package only)',
        'protected',
      ],
      correctIndex: 2,
      explain: 'No keyword = package-private. Only same-package code can see it.',
    },
  ],
  practice:
    'Design a package bank with Account (private balance, public API) and a package-private InterestCalculator in the same package that can adjust balance — then try (and fail) to use InterestCalculator from another package.',
  practiceHints: [
    'Keep InterestCalculator without a public modifier.',
    'Account can offer package-private applyInterest for the calculator.',
  ],
});
