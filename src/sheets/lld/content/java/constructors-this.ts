import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-constructors-this',
  title: 'Constructors and this',
  section: 'java',
  chapter: 'Classes & Objects',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-classes-objects'],
  summary:
    'Constructors initialize new instances; this refers to the current object and can chain constructors with this(...).',
  keywords: ['constructor', 'this', 'overload', 'initializer', 'default constructor'],
  why: 'Invariant-enforcing constructors are how you make illegal states unrepresentable — a cornerstone of solid LLD. Misusing this causes shadowing bugs and half-initialized objects.',
  theory: [
    'A constructor has the class name, no return type, and runs during new before the reference is published.',
    'If you write no constructor, the compiler supplies a public no-arg default (when no other constructors exist).',
    'Overload constructors for different creation paths; share logic via this(...) chaining (must be first statement) or a private init method.',
    'this.field = field disambiguates parameter names from instance fields.',
    'Instance initializer blocks run before constructor bodies; field initializers run in order — prefer simple field init + constructors for clarity.',
    'Do not call overridable methods from constructors — subclasses may see uninitialized state.',
  ],
  mentalModel:
    'new is a factory line: allocate raw memory → run constructors to paint a valid object → hand out the reference. this is the object being painted.',
  codeTitle: 'Constructor overloads and this(...) chaining',
  code: `public class ConstructorDemo {
    static class Rectangle {
        private final int width;
        private final int height;

        Rectangle(int size) {
            this(size, size); // must be first — square
        }

        Rectangle(int width, int height) {
            if (width <= 0 || height <= 0) {
                throw new IllegalArgumentException("positive dimensions required");
            }
            this.width = width;
            this.height = height;
        }

        int area() {
            return width * height;
        }

        @Override
        public String toString() {
            return width + "x" + height;
        }
    }

    public static void main(String[] args) {
        Rectangle square = new Rectangle(4);
        Rectangle box = new Rectangle(3, 5);
        System.out.println(square + " area=" + square.area());
        System.out.println(box + " area=" + box.area());
    }
}`,
  output: `4x4 area=16
3x5 area=15`,
  explain: [
    'Rectangle(int) delegates to Rectangle(int,int) via this(...) so validation lives in one place.',
    'this.width = width assigns fields after validation — invalid rectangles never escape.',
    'final fields must be assigned exactly once by the end of every constructor path.',
  ],
  mistakes: [
    'Adding a void return type → creates a method, not a constructor, and the default ctor may still exist.',
    'Calling this(...) after other statements — illegal.',
    'Publishing this to other threads/collections from a constructor (unsafe publication).',
  ],
  interviewAsk: 'Can you call an overridable method from a constructor? Why is it risky?',
  interviewAnswer:
    'You can, but should not. If a subclass overrides the method, that override runs before the subclass constructor body initializes subclass fields — leading to subtle bugs. Prefer private/final methods or post-construct factories for polymorphic setup.',
  interviewTraps: [
    'Saying constructors can be abstract.',
    'Confusing static factory methods with constructors (factories are often better, but different).',
  ],
  quiz: {
    question: 'Where must this(...) appear in a constructor?',
    options: [
      'Anywhere',
      'As the first statement',
      'As the last statement',
      'Only in static constructors',
    ],
    correctIndex: 1,
    explain: 'Constructor chaining via this(...) must be the first statement.',
  },
  practice:
    'Build a User with required email and optional displayName defaulting to the email local-part; use constructor chaining and validate email contains @.',
  practiceHints: [
    'User(String email) → this(email, derivedName).',
    'Throw IllegalArgumentException on bad email.',
  ],
});
