import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-c-vs-java',
  title: 'C vs Java — What Changes',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 1,
  prerequisites: ['java-what-is-java', 'java-compilation-bytecode'],
  summary:
    'Java keeps C-like syntax but removes pointer arithmetic, adds GC, a real object model, and a portable JVM — knowing the differences prevents “C habits” bugs.',
  keywords: ['c vs java', 'pointers', 'garbage collection', 'oop', 'portability'],
  why:
    'Many CS students learn C first. OOP courses (and interviews) assume you stop thinking in malloc/free and start thinking in objects, references, and the JVM.',
  theory: [
    'Syntax looks familiar (braces, for/while, operators) but Java is not “C with classes.”',
    'No pointer arithmetic, no manual free, no header files — memory is managed by GC; structure is packages/classes.',
    'Everything object-related lives on the heap; you manipulate references, not raw addresses.',
    'Java is strongly typed with a single inheritance tree rooted at Object; arrays are objects; strings are immutable objects.',
    'Compilation targets bytecode for the JVM (write once, run anywhere) instead of a single native ABI.',
    'Exceptions, interfaces, and a huge standard library replace many ad-hoc C patterns (error codes, custom containers).',
  ],
  mentalModel:
    'C hands you the machine’s memory and says “be careful.” Java hands you a managed runtime and says “model the world with objects; we’ll clean up unreachable ones.”',
  codeTitle: 'Same idea, different model',
  code: `// C-style thinking (not valid Java): malloc a struct, free it later
// Java: create an object; drop references when done — GC reclaims it

public class Point {
    public final int x;
    public final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public static void main(String[] args) {
        Point p = new Point(3, 4); // heap object + reference
        System.out.println(p.x + "," + p.y);
        p = null; // eligible for GC when unreachable
    }
}`,
  output: `3,4`,
  explain: [
    'new Point(...) allocates on the heap; p holds a reference, not the struct bits themselves.',
    'Setting p = null does not instantly free memory; it makes the object unreachable so GC may reclaim it later.',
    'There is no free(p) and no p->x pointer syntax — use p.x on a non-null reference.',
  ],
  mistakes: [
    'Expecting pointer arithmetic or sizeof-style layout control.',
    'Forgetting that Java arrays and strings are objects (with length methods / fields), not bare buffers.',
    'Assuming stack-allocated “objects” like C++ locals — Java objects from new live on the heap.',
  ],
  interviewAsk: 'Coming from C, what is the biggest mental shift in Java?',
  interviewAnswer:
    'You stop managing raw memory and start modeling with objects and references on a garbage-collected heap, running portable bytecode on a JVM. Equality, null, and sharing are reference problems — not address arithmetic.',
  interviewTraps: [
    'Saying Java is slower so it’s “worse C” — different goals: safety, portability, ecosystem.',
  ],
  quiz: {
    question: 'Which statement is true?',
    options: [
      'Java supports pointer arithmetic like C',
      'Java programmers typically call free() on objects they new',
      'Java object variables hold references; unused objects may be garbage-collected',
      'Java compiles only to a single OS-native binary format',
    ],
    correctIndex: 2,
    explain:
      'Java hides pointers as references and uses GC. No pointer arithmetic; no free(); bytecode targets the JVM.',
  },
  practice:
    'List five C habits that would be wrong or impossible in Java, and what you do instead in Java for each.',
  practiceHints: [
    'Think: pointers, malloc/free, headers, error codes, fixed-size char arrays as strings.',
  ],
});
