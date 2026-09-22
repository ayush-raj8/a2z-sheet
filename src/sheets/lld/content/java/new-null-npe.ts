import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-new-null-npe',
  title: 'new, null, and NullPointerException',
  section: 'java',
  chapter: 'Memory & Object Model',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['java-stack-heap'],
  summary:
    'new allocates and constructs objects; null means "no object"; dereferencing null throws NullPointerException — the most common Java runtime failure.',
  keywords: ['new', 'null', 'npe', 'optional', 'constructor'],
  why: 'NPE is still a top production exception. Design that makes null impossible (or explicit) is a core LLD skill — factories, Optional, null-object, and validation at boundaries.',
  theory: [
    'new Type(args) allocates heap memory, runs constructors, and returns a reference to the new instance.',
    'null is a valid value for any reference type meaning "refers to no object." Primitives cannot be null.',
    'NPE occurs when you use . or [] on a null reference: field access, method call, unboxing, synchronized(null), throwing null, etc.',
    'Fields default to null for references; locals must be definitely assigned — the compiler prevents some, not all, NPEs.',
    'Defenses: null checks, Objects.requireNonNull, Optional for return values, annotations (@Nullable/@NonNull), and failing fast at API boundaries.',
    'Prefer not returning null from collections APIs — return empty lists; reserve Optional for "value may be absent" scalar results.',
  ],
  mentalModel:
    'Calling a method is knocking on a door. null means there is no house — you get NPE. Optional is a labeled parcel that may be empty without lying that a house exists.',
  moreExamples: [
    {
      title: 'new constructs an independent object',
      code: `public class NewObjectDemo {
    static class Counter {
        int value;

        Counter(int value) {
            this.value = value;
        }
    }

    public static void main(String[] args) {
        Counter first = new Counter(1);
        Counter second = new Counter(1);
        first.value++;

        System.out.println("first=" + first.value);
        System.out.println("second=" + second.value);
        System.out.println("same object=" + (first == second));
    }
}`,
      output: `first=2
second=1
same object=false`,
      explain: [
        'Each new Counter(...) expression allocates and initializes a distinct object.',
        'first and second are non-null references to different heap objects.',
      ],
    },
    {
      title: 'Fail fast instead of storing invalid null state',
      code: `import java.util.Objects;

public class RequireNonNullDemo {
    static class User {
        private final String name;

        User(String name) {
            this.name = Objects.requireNonNull(name, "name must not be null");
        }

        String greeting() {
            return "Hello, " + name;
        }
    }

    public static void main(String[] args) {
        User user = new User("Ada");
        System.out.println(user.greeting());

        try {
            new User(null);
        } catch (NullPointerException error) {
            System.out.println(error.getMessage());
        }
    }
}`,
      output: `Hello, Ada
name must not be null`,
      explain: [
        'The constructor validates its boundary, so every successfully constructed User has a usable name.',
        'Catching the exception here only demonstrates the message; production code should normally prevent or reject invalid input earlier.',
      ],
    },
    {
      title: 'Model an absent return value with Optional',
      code: `import java.util.List;
import java.util.Optional;

public class OptionalLookupDemo {
    static Optional<String> findName(List<String> names, String prefix) {
        for (String name : names) {
            if (name.startsWith(prefix)) {
                return Optional.of(name);
            }
        }
        return Optional.empty();
    }

    public static void main(String[] args) {
        List<String> names = List.of("Ada", "Grace");

        String found = findName(names, "G").orElse("unknown");
        String missing = findName(names, "Z").orElse("unknown");

        System.out.println("found=" + found);
        System.out.println("missing=" + missing);
    }
}`,
      output: `found=Grace
missing=unknown`,
      explain: [
        'The return type explicitly tells callers that lookup may not find a value.',
        'orElse handles absence without dereferencing null or calling Optional.get blindly.',
      ],
    },
  ],
  mistakes: [
    'Catching NPE as normal control flow instead of fixing the root cause.',
    'Optional.of(null) — use ofNullable; of(null) throws NPE.',
    'Using Optional as a field everywhere — it is mainly for return types.',
  ],
  interviewAsk: 'How do you design APIs to reduce NullPointerException?',
  interviewAnswer:
    'Validate at boundaries with requireNonNull, prefer empty collections over null, use Optional for maybe-absent return values, document nullability, and avoid returning null from new code. Inside the domain, make illegal states unrepresentable — e.g. constructors that refuse null dependencies.',
  interviewTraps: [
    'Saying Optional replaces all null checks including fields and parameters casually.',
    'Returning null and documenting "please check" as sufficient design.',
  ],
  quiz: {
    question: 'Which expression is most likely to throw NPE?',
    options: [
      'int x = 0;',
      'String s = null; int n = s.length();',
      'Optional.empty()',
      'new Object()',
    ],
    correctIndex: 1,
    explain: 'Calling length() on a null String dereferences null.',
  },
  practice:
    'Refactor a method that returns null on miss to return Optional<T>, and update the caller to use orElseThrow with a meaningful exception.',
  practiceHints: [
    'Do not call get() without isPresent — prefer orElse/orElseThrow/map.',
    'Keep Optional off mutable fields for this exercise.',
  ],
});
