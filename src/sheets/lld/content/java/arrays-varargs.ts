import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-arrays-varargs',
  title: 'Arrays and Varargs',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-operators-control-flow'],
  summary:
    'Arrays are fixed-length objects on the heap; varargs (T...) is syntactic sugar for a T[] parameter at the end of a method.',
  keywords: ['array', 'varargs', 'length', 'multidimensional', 'Arrays'],
  why: 'Arrays underpin many APIs and interview problems. Varargs appear all over logging and utility methods — misuse causes heap pollution warnings and subtle overload bugs.',
  theory: [
    'Declare with int[] a or int a[]; prefer int[] a. Create with new int[n] (zeros) or {1,2,3} initializers.',
    'array.length is a final field (not a method). Indexes are 0..length-1; out of range → ArrayIndexOutOfBoundsException.',
    'Every array has a fixed length chosen at creation. To grow dynamically, use a collection such as ArrayList.',
    'Array elements receive defaults: numeric values become 0, boolean becomes false, and references become null.',
    'Arrays are objects: a variable holds a reference, assigning one array variable to another creates an alias, and clone() creates a separate shallow copy.',
    'Multidimensional arrays are arrays of arrays — rows can have different lengths (ragged arrays).',
    'Varargs: void log(String msg, Object... details) lets callers pass 0..n trailing args; inside the method details is an Object[].',
    'A method may have only one varargs parameter, and it must be the final parameter.',
    'Callers may pass separate values or an existing compatible array; passing no values creates an empty array.',
    'java.util.Arrays provides sort, binarySearch, equals, copyOf, asList (fixed-size backed by array — not a true resizable ArrayList).',
    'Generic varargs can trigger heap-pollution warnings because arrays are reified while generic type arguments are erased.',
  ],
  mentalModel:
    'An array is a numbered parking lot of fixed size. Varargs is a valet that packs the leftover cars into one lot before calling your method.',
  moreExamples: [
    {
      title: 'Array defaults, mutation, and copying',
      code: `import java.util.Arrays;

public class ArrayCopyDemo {
    public static void main(String[] args) {
        int[] values = new int[3];
        values[0] = 7;

        int[] alias = values;
        alias[1] = 8;

        int[] copy = values.clone();
        copy[2] = 9;

        System.out.println("values=" + Arrays.toString(values));
        System.out.println("copy=" + Arrays.toString(copy));
        System.out.println("same array=" + (values == alias));
    }
}`,
      output: `values=[7, 8, 0]
copy=[7, 8, 9]
same array=true`,
      explain: [
        'new int[3] initializes every element to zero.',
        'alias refers to the same array; clone creates another primitive array with copied values.',
      ],
    },
    {
      title: 'Ragged multidimensional arrays',
      code: `import java.util.Arrays;

public class RaggedArrayDemo {
    public static void main(String[] args) {
        int[][] rows = {
            {1, 2, 3},
            {4},
            {5, 6}
        };

        for (int row = 0; row < rows.length; row++) {
            System.out.println(row + ": " + Arrays.toString(rows[row]));
        }
    }
}`,
      output: `0: [1, 2, 3]
1: [4]
2: [5, 6]`,
      explain: [
        'int[][] is an array whose elements are int[] references.',
        'Each nested array is independent, so row lengths need not match.',
      ],
    },
    {
      title: 'Varargs accepts values or an existing array',
      code: `public class VarargsDemo {
    static int sum(String label, int... values) {
        int total = 0;
        for (int value : values) {
            total += value;
        }
        System.out.println(label + " count=" + values.length);
        return total;
    }

    public static void main(String[] args) {
        System.out.println("first=" + sum("separate", 2, 3, 4));

        int[] scores = {10, 20};
        System.out.println("second=" + sum("array", scores));
        System.out.println("empty=" + sum("none"));
    }
}`,
      output: `separate count=3
first=9
array count=2
second=30
none count=0
empty=0`,
      explain: [
        'Inside sum, values is always int[].',
        'The varargs parameter is last; separate arguments are packed into an array, while scores is passed directly.',
      ],
    },
  ],
  mistakes: [
    'Calling scores.length() — length is not a method on arrays.',
    'Assuming Arrays.asList(...).add(...) always works — fixed-size list backed by array.',
    'Overloading methods with T and T... in confusing ways (ambiguity).',
  ],
  interviewAsk: 'How do varargs work under the hood?',
  interviewAnswer:
    'A varargs parameter is compiled as an array of that component type. Call sites that pass discrete arguments get an implicit array creation. You may also pass an existing array. Only one varargs parameter is allowed, and it must be last. Prefer overloads carefully to avoid ambiguity.',
  interviewTraps: [
    'Saying varargs creates a List.',
    'Placing varargs anywhere but the last parameter.',
  ],
  quiz: {
    question: 'What is the type of `nums` inside `void f(int... nums)`?',
    options: ['List<Integer>', 'int[]', 'Integer[]', 'Object'],
    correctIndex: 1,
    explain: 'Varargs of int become an int[] parameter.',
  },
  practice:
    'Implement max(int first, int... rest) that returns the maximum, requiring at least one argument, and compare it to max(int... all) which must handle the empty case.',
  practiceHints: [
    'first + rest guarantees ≥1 value.',
    'Document empty-varargs behavior (exception vs OptionalInt).',
  ],
});
