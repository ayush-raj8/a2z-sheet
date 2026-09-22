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
    'extends creates an is-a relationship: subclass inherits members, may override methods, and chains constructors with super(...).',
  keywords: ['extends', 'super', 'override', 'is-a', 'single inheritance'],
  why: 'Inheritance is powerful and dangerous. LLD interviews expect you to know when is-a holds, how constructor chaining works, and why composition often beats deep hierarchies.',
  theory: [
    'Java allows single class inheritance (one extends) plus multiple interface implementation.',
    'Subclass inherits accessible instance members; constructors are not inherited — subclass constructors call super(...).',
    '@Override documents that a method replaces a superclass method with the same signature; return types may be covariant.',
    'protected/public members are visible to subclasses; private are not (except via nested access tricks).',
    'final classes cannot be extended; final methods cannot be overridden.',
    'Prefer composition/delegation when you need reuse without substitutability (HAS-A vs IS-A).',
  ],
  mentalModel:
    'Inheritance is taxonomy: Dog is an Animal. If you cannot honestly say "every Sub is a Super in all contexts," do not extends — compose instead.',
  codeTitle: 'extends, super, and override',
  code: `public class InheritanceDemo {
    static class Employee {
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

    static class SalariedEmployee extends Employee {
        private final int monthlyCents;

        SalariedEmployee(String name, int monthlyCents) {
            super(name); // must initialize superclass first
            this.monthlyCents = monthlyCents;
        }

        @Override
        int payCents() {
            return monthlyCents;
        }
    }

    public static void main(String[] args) {
        Employee e = new SalariedEmployee("Ada", 500_000);
        System.out.println(e);
        System.out.println("runtime class=" + e.getClass().getSimpleName());
    }
}`,
  output: `Ada pay=500000
runtime class=SalariedEmployee`,
  explain: [
    'super(name) runs Employee’s constructor before subclass fields initialize.',
    'e is typed as Employee but holds a SalariedEmployee — payCents() dispatches to the override.',
    'toString in Employee calls payCents() polymorphically.',
  ],
  mistakes: [
    'Deep inheritance trees for code reuse only (fragile base class problem).',
    'Forgetting super(...) when no default superclass ctor exists.',
    'Overriding equals carelessly across inheritance hierarchies.',
  ],
  interviewAsk: 'Inheritance vs composition — when do you choose which?',
  interviewAnswer:
    'Use inheritance when there is a true subtype relationship and clients should program to the superclass/interface substitutably (LSP). Use composition when you want to reuse behavior without exposing is-a, or when behavior should be swapped at runtime. Favor composition by default for flexibility; inherit carefully from types you control.',
  interviewTraps: [
    'Always inheriting for reuse (e.g. Stack extends Vector historically — bad).',
    'Saying Java supports multiple class inheritance.',
  ],
  quiz: {
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
  practice:
    'Model Shape with area(); Circle and Rectangle extend it. Store them in a List<Shape> and sum areas — then rewrite using composition with a Shape interface if you prefer.',
  practiceHints: [
    'Keep fields private in subclasses.',
    'Try to break LSP intentionally (Square extends Rectangle mutating width) and discuss the smell.',
  ],
});
