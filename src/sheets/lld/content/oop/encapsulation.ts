import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-encapsulation',
  title: 'Encapsulation',
  section: 'oop',
  chapter: 'Encapsulation',
  difficulty: 'intermediate',
  importance: 3,
  order: 1,
  prerequisites: ['oop-core-pillars'],
  summary:
    'Encapsulation bundles state with the methods that guard it — hide fields, expose a small valid API, protect invariants. Data hiding is one technique; encapsulation is the full design practice.',
  keywords: [
    'encapsulation',
    'data hiding',
    'invariant',
    'getter',
    'setter',
    'information hiding',
  ],
  why: 'Without encapsulation, every client becomes responsible for your invariants — and will break them. LLD quality is mostly about what you refuse to expose, and how you let others interact safely.',
  theory: [
    'Encapsulation = put data and the operations that protect it in one unit (the class), and expose only a small, safe API.',
    'Data hiding = make representation private (or package-private) so outsiders cannot touch fields directly. Hiding is necessary for encapsulation, but not sufficient by itself.',
    'How to encapsulate in practice: (1) fields private, (2) validate in constructors/factories, (3) expose behavior methods not raw state, (4) never return live mutable internals, (5) widen visibility only when needed.',
    'Invariants are facts that must always stay true (balance ≥ 0, email contains @). Enforce them at every mutation path.',
    'Setters should validate or not exist. A setX that accepts anything is data hiding without encapsulation. Immutable objects often need neither getters-for-mutation nor setters for many fields.',
    'Getters are not automatically good — returning a live List leaks the capsule. Prefer unmodifiable views or copies.',
    'Tell, Don’t Ask: prefer account.withdraw(x) over reading balance and mutating from outside.',
  ],
  mentalModel:
    'A capsule medicine: the shell hides the powder (data hiding); the prescribed dose API is how you take it safely (encapsulation). Ripping the shell open (public fields) lets anyone overdose the object.',
  tables: [
    {
      title: 'Encapsulation vs data hiding',
      headers: ['', 'Data hiding', 'Encapsulation'],
      rows: [
        [
          'What it is',
          'Restrict direct access to fields (private / package)',
          'Hide representation AND expose controlled operations that keep objects valid',
        ],
        [
          'Focus',
          'Visibility of state',
          'Safe API + invariants + bundling data with behavior',
        ],
        [
          'Enough alone?',
          'No — private fields + public setters that accept anything still break design',
          'Yes — this is the design goal; data hiding is one tool inside it',
        ],
        [
          'Example smell',
          'public int balance;',
          'private int balance; + setBalance(-999) with no checks',
        ],
        [
          'Good example',
          'private int balance;',
          'withdraw(amount) validates and updates balance inside the class',
        ],
      ],
      caption:
        'Interview line: “Data hiding is about access; encapsulation is about protecting meaning.”',
    },
    {
      title: 'How to encapsulate (checklist)',
      headers: ['Step', 'Do this', 'Avoid'],
      rows: [
        ['1. Hide state', 'private fields (sometimes package-private helpers)', 'public / protected fields for domain data'],
        ['2. Guard creation', 'Validate in constructor or factory', 'Half-built objects callers must “finish”'],
        ['3. Expose behavior', 'deposit(), withdraw(), addItem()', 'Blind setBalance() / setItems()'],
        ['4. Setters (if any)', 'Validate, preserve invariants, or omit', 'setX for every field “for frameworks”'],
        ['5. Seal returns', 'Unmodifiable view / copy / primitive', 'return items; // live ArrayList'],
        ['6. Narrow API', 'Only methods callers truly need', 'Getter+setter bean for every field'],
      ],
    },
  ],
  moreExamples: [
    {
      title: '1) How to encapsulate — private state + validating API',
      code: `public class HowToEncapsulate {
    static class BankAccount {
        private int balanceCents;

        public BankAccount(int openingCents) {
            if (openingCents < 0) {
                throw new IllegalArgumentException("opening balance");
            }
            this.balanceCents = openingCents;
        }

        public int balanceCents() {
            return balanceCents;
        }

        public void deposit(int amountCents) {
            if (amountCents <= 0) {
                throw new IllegalArgumentException("deposit");
            }
            balanceCents += amountCents;
        }

        public void withdraw(int amountCents) {
            if (amountCents <= 0) {
                throw new IllegalArgumentException("withdraw");
            }
            if (amountCents > balanceCents) {
                throw new IllegalStateException("insufficient funds");
            }
            balanceCents -= amountCents;
        }
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000);
        account.deposit(500);
        account.withdraw(200);
        System.out.println("balance=" + account.balanceCents());
        try {
            account.withdraw(10_000);
        } catch (IllegalStateException e) {
            System.out.println("blocked: " + e.getMessage());
        }
    }
}`,
      output: `balance=1300
blocked: insufficient funds`,
      explain: [
        'Field is private — outside code cannot write balanceCents = -1.',
        'All changes go through methods that enforce rules.',
        'This is encapsulation: hidden data + behavior that protects invariants.',
      ],
    },
    {
      title: '2) Data hiding alone ≠ encapsulation (setters must validate or not exist)',
      code: `public class HidingVsEncapsulation {
    // BAD: hidden field + unrestricted setter = weak encapsulation
    static class WeakAccount {
        private int balance;

        public void setBalance(int balance) {
            this.balance = balance; // accepts -999 — setter should not exist like this
        }

        public int getBalance() {
            return balance;
        }
    }

    // BETTER: setter exists only because mutation is required — and it validates
    static class ValidatedAccount {
        private int balance;

        public ValidatedAccount(int opening) {
            setBalance(opening); // reuse the same rules
        }

        public int getBalance() {
            return balance;
        }

        public void setBalance(int balance) {
            if (balance < 0) {
                throw new IllegalArgumentException("balance");
            }
            this.balance = balance;
        }
    }

    // BEST for many domains: no setter — only meaningful operations
    static class StrongAccount {
        private int balance;

        public StrongAccount(int opening) {
            if (opening < 0) throw new IllegalArgumentException("opening");
            this.balance = opening;
        }

        public int getBalance() {
            return balance;
        }

        public void credit(int amount) {
            if (amount <= 0) throw new IllegalArgumentException("amount");
            balance += amount;
        }
    }

    public static void main(String[] args) {
        WeakAccount weak = new WeakAccount();
        weak.setBalance(-999);
        System.out.println("weak (hidden but broken)=" + weak.getBalance());

        ValidatedAccount validated = new ValidatedAccount(100);
        try {
            validated.setBalance(-1);
        } catch (IllegalArgumentException e) {
            System.out.println("validated setter blocked: " + e.getMessage());
        }

        StrongAccount strong = new StrongAccount(100);
        strong.credit(50);
        System.out.println("strong (no setter)=" + strong.getBalance());
    }
}`,
      output: `weak (hidden but broken)=-999
validated setter blocked: balance
strong (no setter)=150`,
      explain: [
        'Both Weak and Validated hide the field (data hiding).',
        'Rule: setters should validate or not exist — Weak breaks it; Validated follows it.',
        'StrongAccount often wins: prefer credit/withdraw over setBalance when the domain allows.',
        'Immutable types go further: final fields, constructor/factory only, no setters at all.',
      ],
    },
    {
      title: '3) Do not leak mutable internals',
      code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SealTheReturn {
    static class Order {
        private final List<String> items = new ArrayList<>();
        private int totalCents;

        public void addItem(String sku, int priceCents) {
            if (sku == null || sku.isBlank()) throw new IllegalArgumentException("sku");
            if (priceCents <= 0) throw new IllegalArgumentException("price");
            items.add(sku);
            totalCents += priceCents;
        }

        public int totalCents() {
            return totalCents;
        }

        public List<String> items() {
            return Collections.unmodifiableList(items);
        }
    }

    public static void main(String[] args) {
        Order order = new Order();
        order.addItem("BOOK", 1200);
        order.addItem("PEN", 200);
        System.out.println("total=" + order.totalCents());
        System.out.println("items=" + order.items());
        try {
            order.items().add("HACK");
        } catch (UnsupportedOperationException e) {
            System.out.println("encapsulation held: " + e.getClass().getSimpleName());
        }
    }
}`,
      output: `total=1400
items=[BOOK, PEN]
encapsulation held: UnsupportedOperationException`,
      explain: [
        'addItem is the only mutation path — total and items stay in sync.',
        'items() returns an unmodifiable view so callers cannot corrupt the list.',
        'return items; would undo encapsulation even with a private field.',
      ],
    },
  ],
  mistakes: [
    'public List<String> getItems() { return items; } — leakage.',
    'Thinking private fields alone mean “we encapsulated.”',
    'Anemic models: getters/setters everywhere, logic only in services.',
    'Validating only in the UI, never in the domain object.',
  ],
  interviewAsk: 'Encapsulation vs data hiding — are they the same?',
  interviewAnswer:
    'No. Data hiding restricts direct access to representation (usually private fields). Encapsulation is broader: the class owns its state and exposes only operations that keep invariants true. You can hide data and still break encapsulation with naive setters or by returning live mutable collections.',
  interviewTraps: [
    'Equating JavaBeans getters/setters with good encapsulation always.',
    'Saying private fields alone are enough even if you return mutable internals.',
  ],
  quiz: [
    {
      question: 'Returning the live internal ArrayList from a getter typically…',
      options: [
        'Improves performance only',
        'Breaks encapsulation because callers can mutate internals',
        'Is required by the language',
        'Makes the list immutable automatically',
      ],
      correctIndex: 1,
      explain: 'Callers can add/remove and violate invariants — the private field did not save you.',
    },
    {
      question: 'Which best describes data hiding vs encapsulation?',
      options: [
        'They are identical terms',
        'Data hiding = access control; encapsulation = access control + safe operations/invariants',
        'Encapsulation is only about inheritance',
        'Data hiding requires public fields',
      ],
      correctIndex: 1,
      explain: 'Hiding is the visibility part; encapsulation also designs the API that protects meaning.',
    },
  ],
  practice:
    'Build a Temperature class storing Celsius privately with factory fromFahrenheit, getters asC/asF, and no setter that can set impossible absolute temperatures below 0 K.',
  practiceHints: [
    'Validate in the private constructor.',
    'Conversion math lives inside the class.',
  ],
});
