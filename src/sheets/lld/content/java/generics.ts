import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-generics',
  title: 'Generics',
  section: 'java',
  chapter: 'Exceptions & Generics',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-exceptions'],
  summary:
    'Generics add compile-time type parameters so collections and APIs catch type errors early — with erasure limits at runtime.',
  keywords: ['generics', 'type parameter', 'erasure', 'wildcard', 'PECS'],
  why: 'Pre-generics Java was full of casts and ClassCastException. Generics are mandatory for collections and show up in every typed API design discussion.',
  theory: [
    'List<String> is a parameterized type; <T> on a class/method declares a type parameter.',
    'Erasure: type parameters are removed at runtime for the most part — List<String> and List<Integer> are both List raw at the JVM.',
    'Cannot new T(), create T[], or check instanceof List<String> the way beginners expect — use Class tokens / factories when needed.',
    'Wildcards: List<?> unknown, List<? extends T> producer/covariance, List<? super T> consumer/contravariance.',
    'PECS: Producer Extends, Consumer Super — get from <? extends T>, put into <? super T>.',
    'Bounds: <T extends Number & Comparable<T>> constrain type parameters.',
  ],
  mentalModel:
    'Generics are sticky notes on boxes that the compiler checks: "this box holds only Tickets." At runtime the JVM mostly sees plain boxes (erasure), so you still should not smuggle the wrong item via raw types.',
  moreExamples: [
    {
      title: 'A generic class keeps its value type-safe',
      code: `public class GenericBoxDemo {
    static class Box<T> {
        private T value;

        Box(T value) {
            this.value = value;
        }

        T get() {
            return value;
        }

        void set(T value) {
            this.value = value;
        }
    }

    public static void main(String[] args) {
        Box<String> word = new Box<>("Java");
        Box<Integer> number = new Box<>(21);

        word.set(word.get() + " generics");
        number.set(number.get() * 2);

        System.out.println(word.get());
        System.out.println(number.get());
    }
}`,
      output: `Java generics
42`,
      explain: [
        'T is String for word and Integer for number, so get returns the expected type without caller casts.',
        'Trying word.set(42) is rejected at compile time.',
      ],
    },
    {
      title: 'A generic method with a bounded type parameter',
      code: `public class GenericMethodDemo {
    static <T extends Comparable<? super T>> T max(T left, T right) {
        return left.compareTo(right) >= 0 ? left : right;
    }

    public static void main(String[] args) {
        System.out.println("max int=" + max(7, 4));
        System.out.println("max word=" + max("ant", "bee"));
    }
}`,
      output: `max int=7
max word=bee`,
      explain: [
        'The bound guarantees that T values can be compared.',
        'The compiler infers Integer for the first call and String for the second.',
      ],
    },
    {
      title: 'PECS: read producers and write consumers',
      code: `import java.util.ArrayList;
import java.util.List;

public class PecsDemo {
    static double sum(List<? extends Number> source) {
        double total = 0;
        for (Number value : source) {
            total += value.doubleValue();
        }
        return total;
    }

    static void addDefaults(List<? super Integer> destination) {
        destination.add(10);
        destination.add(20);
    }

    public static void main(String[] args) {
        List<Integer> integers = new ArrayList<>();
        addDefaults(integers);

        List<Number> numbers = new ArrayList<>();
        addDefaults(numbers);
        numbers.add(2.5);

        System.out.println("integers=" + integers);
        System.out.println("integer sum=" + sum(integers));
        System.out.println("number sum=" + sum(numbers));
    }
}`,
      output: `integers=[10, 20]
integer sum=30.0
number sum=32.5`,
      explain: [
        'List<? extends Number> produces Number values and accepts lists of Integer or other Number subtypes.',
        'List<? super Integer> consumes Integer values and can be backed by List<Integer>, List<Number>, or List<Object>.',
      ],
    },
  ],
  mistakes: [
    'Using raw List and then casting — undoes generics safety.',
    'Trying to overload methods that erase to the same signature.',
    'Arrays of parameterized types (new List<String>[10]) — heap pollution.',
  ],
  interviewAsk: 'What is type erasure?',
  interviewAnswer:
    'Java generics are enforced primarily at compile time. The compiler inserts casts and removes most parameter information so the JVM sees raw types. That is why you cannot do new T() or instanceof List<String> as a reified check. Reflection can see limited generic signatures in class metadata, but runtime instances do not carry full reified type arguments like C# does.',
  interviewTraps: [
    'Saying List<String> is a completely different runtime class from List<Integer>.',
    'Claiming wildcards and type parameters are identical.',
  ],
  quiz: {
    question: 'PECS says: if a method only reads T values from a collection parameter, prefer…',
    options: [
      'List<? super T>',
      'List<? extends T>',
      'List<Object> only',
      'Raw List',
    ],
    correctIndex: 1,
    explain: 'Producer Extends — reading produces T (or subtype).',
  },
  practice:
    'Write a generic static method prefer(T a, T b, java.util.Comparator<? super T> cmp) that returns the larger; call it with Strings and with Integers.',
  practiceHints: [
    'Return cmp.compare(a,b) >= 0 ? a : b.',
    'Notice Comparator<? super T> is more flexible than Comparator<T>.',
  ],
});
