import { lesson } from '../lessonFactory';

export default lesson({
  id: 'trap-private-nested-access',
  title: 'Trap: Nested Classes Access Private Members',
  section: 'traps',
  chapter: 'Java Pitfalls',
  difficulty: 'intermediate',
  importance: 2,
  summary:
    'Inner/nested classes can access private members of the enclosing class (and vice versa) — encapsulation boundaries are not what many expect.',
  keywords: ['inner class', 'private', 'nested', 'encapsulation', 'trap'],
  why:
    'Builders and State nested types often sit inside the outer class. Understanding access rules avoids surprise coupling and helps you design intentional nesting vs package-private types.',
  theory: [
    'Java private is per top-level class boundary for access checking involving nests — nested classes are compiled with accessor bridges.',
    'Non-static inner class holds an implicit reference to the outer instance — can cause memory leaks if published.',
    'Static nested class does not hold outer this — prefer for Builder, utilities.',
    'Private members of outer are accessible from nested and the reverse.',
    'This is legal and used by Builder patterns; still avoid nested classes becoming a backdoor for everything.',
  ],
  mentalModel:
    'A house (outer class) with a workshop room (nested class). “Private” means keep strangers out of the house — but rooms inside can still open each other’s drawers. Static nested workshops do not drag the whole house with them when moved.',
  codeTitle: 'Nested access and inner reference',
  code: `class BankAccount {
    private int balance;

    BankAccount(int balance) { this.balance = balance; }

    class Auditor {
        int peek() { return balance; } // accesses private
        void set(int v) { balance = v; }
    }

    static class Snapshot {
        private final int balance;
        Snapshot(BankAccount acc) { this.balance = acc.balance; }
        int get() { return balance; }
    }

    Auditor auditor() { return new Auditor(); }
}

public class Demo {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount(100);
        BankAccount.Auditor a = acc.auditor();
        System.out.println(a.peek());
        a.set(50);
        System.out.println(new BankAccount.Snapshot(acc).get());
    }
}`,
  output: `100
50`,
  explain: [
    'Auditor reads/writes private balance legally.',
    'Snapshot is static nested — no hidden outer reference.',
    'Prefer static nested Builder/Snapshot to avoid retaining outer accidentally.',
  ],
  mistakes: [
    'Using non-static inner classes for Builders — needless outer reference.',
    'Assuming private blocks nested access.',
    'Publishing an inner class instance that pins a large outer object in memory.',
  ],
  interviewAsk: 'Should a Builder be static nested or inner?',
  interviewAnswer:
    'Almost always static nested (or a separate top-level). A non-static inner Builder would require an outer instance first — awkward — and retains a hidden reference. Nested Builder may access private constructors of the product, which is a feature.',
  interviewTraps: [
    'Saying nested classes cannot access private fields.',
  ],
  quiz: {
    question: 'A non-static inner class always:',
    options: [
      'Is identical to a static nested class',
      'Holds an implicit reference to an enclosing instance',
      'Cannot access private fields',
      'Must be public',
    ],
    correctIndex: 1,
    explain: 'Inner classes are tied to an outer instance.',
  },
  practice:
    'Convert a non-static inner Builder that mistakenly needs Outer.this into a static nested Builder with a private Product constructor.',
  practiceHints: [
    'Add static to Builder.',
    'Product constructor private; Builder in the same top-level class.',
  ],
});
