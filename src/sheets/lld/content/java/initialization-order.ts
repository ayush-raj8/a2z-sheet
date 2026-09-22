import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-initialization-order',
  title: 'Java Initialization Order',
  section: 'java',
  chapter: 'Classes & Objects',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-static-members', 'java-constructors-this'],
  summary:
    'Java initializes classes and objects in a precise order: class state once, then inherited and instance state for every object.',
  keywords: ['initialization order', 'static block', 'instance initializer', 'constructor', 'superclass'],
  why:
    'Initialization bugs often appear as default values, unexpected side effects, or constructor-time failures. Knowing the order makes those results predictable.',
  theory: [
    'A class initializes when first actively used; its static field initializers and static blocks run once in textual order.',
    'Before a subclass initializes, its superclass is initialized, so superclass static work precedes subclass static work.',
    'Creating an object begins by invoking the superclass construction chain before the subclass portion is initialized.',
    'Within each class, instance field initializers and instance initializer blocks run in textual order before that class constructor body.',
    'The practical sequence is superclass instance fields/blocks/constructor, then subclass instance fields/blocks/constructor.',
    'Fields first contain Java default values; an initializer can observe an earlier initialized field but not a later field’s eventual value.',
    'this(...) delegates to another constructor in the same class without repeating that class’s instance initialization.',
    'Calling overridable methods during initialization is dangerous because subclass fields may still hold default values.',
  ],
  mentalModel:
    'Building a subclass object is like opening a building: power up the parent wing and child wing once (static), then construct each floor from the foundation upward, furnishing fields and blocks before signing that floor’s constructor.',
  moreExamples: [
    {
      title: 'Static, instance, and constructor order',
      code: `public class InitializationTrace {
    static int first = mark("static field");

    static {
        mark("static block");
    }

    int value = mark("instance field");

    {
        mark("instance block");
    }

    InitializationTrace() {
        mark("constructor");
    }

    static int mark(String step) {
        System.out.println(step);
        return 1;
    }

    public static void main(String[] args) {
        System.out.println("main");
        new InitializationTrace();
        new InitializationTrace();
    }
}`,
      output: `static field
static block
main
instance field
instance block
constructor
instance field
instance block
constructor`,
      explain: [
        'Static initialization completes once before main because the containing class must initialize.',
        'Instance field, block, and constructor repeat for each object.',
      ],
    },
    {
      title: 'Superclass always initializes before subclass',
      code: `public class InheritanceInitialization {
    static class Parent {
        static int ps = log("Parent static");
        int pi = log("Parent field");

        Parent() {
            log("Parent constructor");
        }
    }

    static class Child extends Parent {
        static int cs = log("Child static");
        int ci = log("Child field");

        {
            log("Child block");
        }

        Child() {
            log("Child constructor");
        }
    }

    static int log(String text) {
        System.out.println(text);
        return 0;
    }

    public static void main(String[] args) {
        new Child();
    }
}`,
      output: `Parent static
Child static
Parent field
Parent constructor
Child field
Child block
Child constructor`,
      explain: [
        'Parent and Child static initialization happen once, parent first.',
        'For the object, the complete Parent portion is initialized before the Child portion.',
      ],
    },
  ],
  mistakes: [
    'Assuming static blocks run for every object.',
    'Expecting the subclass constructor body before the superclass constructor.',
    'Ignoring textual order among fields and initializer blocks in the same class.',
    'Calling overridable methods from constructors and reading uninitialized subclass state.',
    'Using complex initializer side effects that make construction hard to reason about.',
  ],
  interviewAsk: 'What is the initialization order when creating a subclass object?',
  interviewAnswer:
    'On first active use, superclass static fields/blocks run in textual order, then subclass static fields/blocks. For each object, superclass instance fields and blocks run in textual order, then its constructor; afterward the subclass instance fields and blocks run, then the subclass constructor.',
  interviewTraps: [
    'Forgetting class initialization is once while instance initialization is per object.',
    'Saying all fields initialize before all blocks regardless of textual order.',
  ],
  quiz: [
    {
      question: 'Which runs first when a subclass is actively used for the first time?',
      options: ['Subclass static block', 'Superclass static initialization', 'Subclass constructor', 'Instance block'],
      correctIndex: 1,
      explain: 'A superclass initializes before its subclass.',
    },
    {
      question: 'Within one class, when does an instance initializer block run?',
      options: [
        'After the constructor',
        'Before field initializers',
        'In textual order with field initializers, before constructor body',
        'Only once',
      ],
      correctIndex: 2,
      explain: 'Instance fields and blocks follow textual order before the constructor body.',
    },
  ],
  practice:
    'Create Grandparent, Parent, and Child classes with labeled static fields, static blocks, instance fields, instance blocks, and constructors. Instantiate Child twice and write the exact output before running it.',
  practiceHints: [
    'Separate once-per-class output from per-object output.',
    'Trace each class from superclass to subclass.',
  ],
});
