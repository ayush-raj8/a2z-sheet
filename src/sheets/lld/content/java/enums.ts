import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-enums',
  title: 'Enums',
  section: 'java',
  chapter: 'Object Model Advanced',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-immutability'],
  summary:
    'Enums are type-safe singleton constants that can carry fields, methods, and implement interfaces — prefer them over int/String codes.',
  keywords: ['enum', 'ordinal', 'valueOf', 'singleton', 'strategy enum'],
  why: 'Magic numbers and stringly-typed statuses cause silent bugs. Enums make illegal states harder, enable exhaustive switches, and show up constantly in domain modeling.',
  theory: [
    'enum Status { NEW, PAID } declares a class with fixed public static instances.',
    'Enums extend java.lang.Enum implicitly; you cannot extend them, but they can implement interfaces.',
    'Useful APIs: values(), valueOf(String), name(), ordinal() — prefer name over ordinal for persistence.',
    'Enums can have constructors, fields, and methods; each constant can override abstract methods (strategy enum pattern).',
    'Switch on enums is exhaustive in modern Java when all constants are covered.',
    'Serialization and identity: enum singletons are special-cased — == works for identity of constants.',
  ],
  mentalModel:
    'An enum is a tiny closed club of named objects the JVM creates once. You pick members from the club; you do not new them yourself.',
  codeTitle: 'Enum with behavior (strategy-style)',
  code: `public class EnumsDemo {
    enum Shipping {
        STANDARD {
            int feeCents(int weightGrams) {
                return 500 + weightGrams / 100;
            }
        },
        EXPRESS {
            int feeCents(int weightGrams) {
                return 1500 + weightGrams / 50;
            }
        };

        abstract int feeCents(int weightGrams);
    }

    public static void main(String[] args) {
        Shipping mode = Shipping.valueOf("EXPRESS");
        System.out.println(mode.name() + " fee=" + mode.feeCents(1000));
        for (Shipping s : Shipping.values()) {
            System.out.println(s + " ordinal=" + s.ordinal());
        }
    }
}`,
  output: `EXPRESS fee=1520
STANDARD ordinal=0
EXPRESS ordinal=1`,
  explain: [
    'Each constant provides its own feeCents implementation — polymorphism without subclasses.',
    'valueOf uses the exact constant name; bad strings throw IllegalArgumentException.',
    'ordinal reflects declaration order — do not persist it if order may change.',
  ],
  mistakes: [
    'Persisting ordinal to a database then reordering constants.',
    'Using null as a fourth "status" instead of an explicit UNKNOWN or Optional.',
    'Giant enums that become god objects — split by bounded contexts.',
  ],
  interviewAsk: 'Why prefer enums over public static final int constants?',
  interviewAnswer:
    'Enums are type-safe (cannot pass a random int), can carry behavior and data, work cleanly in switches, have defined identity, and fail fast on bad valueOf. Int constants are interchangeable and invite invalid values. Strings are similarly error-prone without a closed set.',
  interviewTraps: [
    'Saying you can extend an enum with subclasses outside the enum body.',
    'Comparing enums with equals only and never mentioning == is safe for constants.',
  ],
  quiz: {
    question: 'What does Shipping.valueOf("express") do if the constant is EXPRESS?',
    options: [
      'Returns EXPRESS (case-insensitive)',
      'Throws IllegalArgumentException',
      'Returns null',
      'Creates a new constant',
    ],
    correctIndex: 1,
    explain: 'valueOf is case-sensitive and must match the identifier exactly.',
  },
  practice:
    'Model OrderStatus { PLACED, SHIPPED, DELIVERED, CANCELLED } with a method canTransitionTo(OrderStatus next) encoding allowed transitions.',
  practiceHints: [
    'Use a switch or a Set of allowed next states per constant.',
    'Reject illegal transitions with IllegalStateException.',
  ],
});
