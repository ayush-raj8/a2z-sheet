import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-static-members',
  title: 'Static Members',
  section: 'java',
  chapter: 'Access & Static',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['oop-access-modifiers'],
  summary:
    'static fields and methods belong to the class, not an instance — shared state and utilities, with careful initialization order.',
  keywords: ['static', 'class variable', 'static method', 'singleton', 'static block'],
  why: 'Static state is shared global-ish memory inside a classloader. Used well for constants and pure utilities; used poorly it creates hidden coupling, test hell, and concurrency bugs.',
  theory: [
    'static fields: one copy per Class (per classloader), shared by all instances.',
    'static methods: no this; can only directly access static members (unless given an instance).',
    'static final primitives/Strings are compile-time constants when initialized with constant expressions.',
    'Static initializer blocks run once when the class is initialized (lazy, on first active use).',
    'main is static so the JVM can start without an instance.',
    'Overuse of mutable statics ≈ disguised globals. Prefer dependency injection for services.',
  ],
  mentalModel:
    'Instance fields are each object’s backpack. Static fields are a locker in the classroom labeled with the class name — everyone shares it.',
  codeTitle: 'Shared counter vs instance id',
  code: `public class StaticDemo {
    static class Session {
        private static int created;
        private final int id;

        Session() {
            created++;
            this.id = created;
        }

        static int createdCount() {
            return created;
        }

        int id() {
            return id;
        }
    }

    public static void main(String[] args) {
        Session a = new Session();
        Session b = new Session();
        System.out.println("a.id=" + a.id() + ", b.id=" + b.id());
        System.out.println("created=" + Session.createdCount());
        // System.out.println(a.createdCount()); // works but prefer Class.method
    }
}`,
  output: `a.id=1, b.id=2
created=2`,
  explain: [
    'created is shared — both constructions increment the same field.',
    'id is per instance, captured at construction.',
    'Call static methods via the class name for readability.',
  ],
  mistakes: [
    'Mutable public static fields as configuration without synchronization.',
    'Assuming static means "singleton forever" across all classloaders (app servers have many).',
    'Static methods that secretly depend on thread-local / global state — hard to test.',
  ],
  interviewAsk: 'Can a static method be overridden?',
  interviewAnswer:
    'No — static methods are hidden (redeclared), not dispatched polymorphically. Calling Super.staticMethod vs Sub.staticMethod is resolved by the compile-time type (reference type), not the runtime instance type. Instance methods override; static methods hide.',
  interviewTraps: [
    'Saying static methods participate in dynamic dispatch like instance methods.',
    'Using instance references to call static methods and thinking it is polymorphic.',
  ],
  quiz: {
    question: 'How many copies of a non-final static field exist for a class loaded once?',
    options: [
      'One per instance',
      'One per class (per classloader)',
      'One per method call',
      'None — static forbids fields',
    ],
    correctIndex: 1,
    explain: 'Static fields are class-level shared state.',
  },
  practice:
    'Implement a simple ID generator with a private static AtomicInteger and a static nextId() method; explain why AtomicInteger matters if used from multiple threads.',
  practiceHints: [
    'import java.util.concurrent.atomic.AtomicInteger;',
    'getAndIncrement() is atomic; ++ on int static is not.',
  ],
});
