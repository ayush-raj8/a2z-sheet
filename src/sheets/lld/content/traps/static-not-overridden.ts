import { lesson } from '../lessonFactory';

export default lesson({
  id: 'trap-static-not-overridden',
  title: 'Trap: static Methods Are Not Overridden',
  section: 'traps',
  chapter: 'Java Pitfalls',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['oop-method-overriding', 'java-static-members'],
  summary:
    'static methods are hidden, not overridden — call resolution uses the compile-time type, breaking polymorphic expectations.',
  keywords: ['static', 'override', 'hide', 'polymorphism', 'trap'],
  why:
    'A common quiz and a real bug when “factory” methods are static on base/subclass and invoked via base references.',
  theory: [
    'Instance method dispatch is virtual (runtime type).',
    'static method dispatch is compile-time (reference type) — method hiding.',
    '@Override on a static method is a compile error in intent — you cannot override static.',
    'Prefer instance Factory Method pattern or separate factory objects for polymorphic creation.',
    'static is fine for true utilities with no subtype specialization.',
  ],
  mentalModel:
    'Instance methods are a phone call to whoever is actually holding the phone (runtime object). static methods are dialing a landline number printed on the business card type you wrote at compile time — subclasses may have a different landline, but you did not dial it.',
  codeTitle: 'Hiding vs overriding',
  code: `class Parent {
    static String id() { return "parent"; }
    String kind() { return "parent-instance"; }
}

class Child extends Parent {
    static String id() { return "child"; }
    @Override String kind() { return "child-instance"; }
}

public class Demo {
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.id());    // static — Parent
        System.out.println(p.kind());  // instance — Child
        System.out.println(Child.id());
    }
}`,
  output: `parent
child-instance
child`,
  explain: [
    'p.id() binds to Parent.id despite runtime Child.',
    'p.kind() correctly uses Child override.',
    'Call static methods via class name to avoid confusion.',
  ],
  mistakes: [
    'Expecting polymorphic static factories via base references.',
    'Using static for behavior that must vary by subtype.',
    'Quietly hiding static methods and causing subtle bugs.',
  ],
  interviewAsk: 'Can you override a static method in Java?',
  interviewAnswer:
    'No. You can hide it with the same signature in a subclass, but invocation depends on the compile-time type. For polymorphic behavior use instance methods. For polymorphic creation use Factory Method/Abstract Factory instances, not statics on a hierarchy.',
  interviewTraps: [
    'Saying static methods are overridden.',
  ],
  quiz: {
    question: 'Parent p = new Child(); p.staticMethod() calls:',
    options: [
      'Always Child’s static method',
      'The static method based on Parent compile-time type',
      'A random method',
      'Neither — it does not compile if Child hides it',
    ],
    correctIndex: 1,
    explain: 'Static resolution uses the reference’s declared type.',
  },
  practice:
    'Refactor a static Shape.create() hierarchy into an instance-based ShapeFactory with CircleFactory/SquareFactory.',
  practiceHints: [
    'Interface ShapeFactory { Shape create(); }',
    'Client depends on ShapeFactory, not statics.',
  ],
});
