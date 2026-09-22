import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-this-and-super',
  title: 'this and super',
  section: 'oop',
  chapter: 'Inheritance',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-inheritance', 'java-constructors-this'],
  summary:
    'this names the current object; super accesses its immediate superclass portion and constructor.',
  keywords: ['this', 'super', 'constructor chaining', 'field hiding', 'Outer.this'],
  why:
    'Constructor chains and inherited behavior depend on this and super. Using them precisely avoids shadowing, recursion, and partially initialized objects.',
  theory: [
    'this refers to the current object; this.field disambiguates an instance field from a parameter or local variable.',
    'this(...) delegates to another constructor in the same class and must be the constructor’s first statement.',
    'super(...) invokes an immediate superclass constructor and must also be the first statement.',
    'A constructor cannot call both this(...) and super(...) directly; a this(...) chain eventually reaches a constructor that calls super(...).',
    'If omitted, the compiler inserts super(); compilation fails if the parent has no accessible no-argument constructor.',
    'super.method(...) deliberately invokes the immediate superclass implementation instead of virtual dispatch to the current override.',
    'Fields are hidden, not overridden: this.field and super.field can name distinct fields, and field access is based on reference context.',
    'Inside a non-static inner class, OuterClass.this refers to the enclosing outer instance.',
    'Neither this nor super is available in a static context because no current instance exists.',
  ],
  mentalModel:
    'An object is a stack of class layers: this means the whole current object, while super opens the immediate parent layer. Outer.this follows the inner object’s tether back to its enclosing object.',
  moreExamples: [
    {
      title: 'Constructor chaining, fields, and parent behavior',
      code: `public class ThisSuperDemo {
    static class Account {
        protected String label = "account";

        Account(String owner) {
            System.out.println("Account for " + owner);
        }

        void describe() {
            System.out.println("base " + label);
        }
    }

    static class Savings extends Account {
        private String label = "savings";
        private final int rate;

        Savings(String owner) {
            this(owner, 5);
        }

        Savings(String owner, int rate) {
            super(owner);
            this.rate = rate;
        }

        @Override
        void describe() {
            super.describe();
            System.out.println(this.label + " rate=" + this.rate);
            System.out.println("parent field=" + super.label);
        }
    }

    public static void main(String[] args) {
        new Savings("Mina").describe();
    }
}`,
      output: `Account for Mina
base account
savings rate=5
parent field=account`,
      explain: [
        'The one-argument constructor delegates with this(...); the target starts with super(...).',
        'super.describe() calls the parent implementation, while this.label and super.label expose hidden fields.',
      ],
    },
    {
      title: 'Outer.this from an inner class',
      code: `public class OuterThisDemo {
    private final String name;

    OuterThisDemo(String name) {
        this.name = name;
    }

    class Member {
        private final String name;

        Member(String name) {
            this.name = name;
        }

        void printNames() {
            System.out.println("inner=" + this.name);
            System.out.println("outer=" + OuterThisDemo.this.name);
        }
    }

    public static void main(String[] args) {
        OuterThisDemo outer = new OuterThisDemo("team");
        Member member = outer.new Member("developer");
        member.printNames();
    }
}`,
      output: `inner=developer
outer=team`,
      explain: [
        'this names the Member instance.',
        'OuterThisDemo.this names the enclosing OuterThisDemo instance.',
      ],
    },
  ],
  mistakes: [
    'Putting work before this(...) or super(...); either constructor invocation must be first.',
    'Trying to call this(...) and super(...) in the same constructor.',
    'Assuming fields override dynamically like methods.',
    'Using this or super in a static method.',
    'Forgetting an explicit super(args) when the parent lacks a no-argument constructor.',
  ],
  interviewAsk: 'Explain this, super, and their constructor first-statement rule.',
  interviewAnswer:
    'this is the current object and this(...) chains within its class. super accesses the immediate parent implementation or invokes a parent constructor. this(...) or super(...) must be first so the superclass portion and one unambiguous constructor chain are established before the body runs. Only one can appear directly.',
  interviewTraps: [
    'Saying super creates a separate parent object.',
    'Claiming super.field performs runtime polymorphism.',
  ],
  quiz: [
    {
      question: 'Can one constructor directly invoke both this(...) and super(...)?',
      options: ['Yes, in any order', 'Yes, if both are first', 'No', 'Only in final classes'],
      correctIndex: 2,
      explain: 'Each must be first, so only one can be direct; this(...) eventually reaches super(...).',
    },
    {
      question: 'What does super.method() do inside an override?',
      options: [
        'Recursively calls the override',
        'Calls the immediate superclass implementation',
        'Calls a static method only',
        'Creates a parent object',
      ],
      correctIndex: 1,
      explain: 'super bypasses the current override to select the immediate parent implementation.',
    },
  ],
  practice:
    'Model Vehicle and ElectricCar with constructor chaining, a hidden type field, an overridden describe method that also calls super.describe(), and an inner Diagnostics class that prints ElectricCar.this state.',
  practiceHints: [
    'Make the final constructor in the this(...) chain call super(...).',
    'Print this.type and super.type to expose field hiding.',
  ],
});
