import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-what-is-java',
  title: 'What Is Java?',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: [],
  summary:
    'Java is a statically typed, object-oriented language that compiles to bytecode and runs on the JVM — write once, run anywhere.',
  keywords: ['java', 'jvm', 'bytecode', 'oop', 'platform independent'],
  why: 'Before you design systems in Java, you need a clear picture of what Java is (and is not): a language + tools + a virtual machine that gives you portability, a huge standard library, and strong typing that catches many mistakes early.',
  theory: [
    'Java is a high-level, statically typed, object-oriented language first released by Sun Microsystems in 1995 (now Oracle).',
    'Source files (.java) compile to platform-neutral bytecode (.class), which the JVM interprets/JITs at runtime.',
    '"Write once, run anywhere" means the same .class files run on any OS that has a compatible JVM.',
    'Java prioritizes safety: no raw pointer arithmetic, automatic memory management (GC), and checked exceptions for many failure modes.',
    'The ecosystem includes the language, JDK tools (compiler, packager), JRE/JVM runtime, and a massive standard library (collections, I/O, concurrency, networking).',
    'Modern Java still looks familiar to C/C++ developers but emphasizes objects, interfaces, and (since Java 8+) functional style via lambdas and streams.',
  ],
  mentalModel:
    'Think of Java as three layers: you write human-readable source → javac produces bytecode → the JVM turns bytecode into native machine behavior on that host.',
  moreExamples: [
    {
      title: 'A complete Java program with static typing',
      code: `public class JavaBasics {
    static int square(int number) {
        return number * number;
    }

    public static void main(String[] args) {
        String language = "Java";
        int version = 21;

        System.out.println(language + " " + version);
        System.out.println("square(6) = " + square(6));
    }
}`,
      output: `Java 21
square(6) = 36`,
      explain: [
        'JavaBasics.java contains the public JavaBasics class; javac JavaBasics.java creates JavaBasics.class.',
        'The compiler checks that version is an int and that square receives and returns int values.',
        'java JavaBasics asks the JVM to invoke the main method.',
      ],
    },
    {
      title: 'One source file, objects, and the standard library',
      code: `import java.util.ArrayList;
import java.util.List;

public class PortableApp {
    static class Task {
        private final String title;

        Task(String title) {
            this.title = title;
        }

        String label() {
            return "[task] " + title;
        }
    }

    public static void main(String[] args) {
        List<Task> tasks = new ArrayList<>();
        tasks.add(new Task("Compile source"));
        tasks.add(new Task("Run bytecode"));

        for (Task task : tasks) {
            System.out.println(task.label());
        }
    }
}`,
      output: `[task] Compile source
[task] Run bytecode`,
      explain: [
        'Task demonstrates object-oriented state and behavior, while List and ArrayList come from Java’s standard library.',
        'The same compiled class files can run on different operating systems when a compatible JVM is installed.',
      ],
    },
  ],
  mistakes: [
    'Confusing the Java language with the JVM — other languages (Kotlin, Scala, Clojure) also target the JVM.',
    'Assuming Java is "interpreted only" — HotSpot JITs hot methods to native code.',
    'Thinking Java is only for enterprise backends — it powers Android (historically), desktop, embedded, and cloud services.',
  ],
  interviewAsk: 'What does "write once, run anywhere" mean for Java, and what actually travels between machines?',
  interviewAnswer:
    'You compile .java to .class bytecode once. Those bytecode files (or a JAR of them) are portable. Each target machine needs a JVM that understands that bytecode version. The JVM maps bytecode to the host OS/CPU. So source and bytecode are portable; native binaries are not what you ship.',
  interviewTraps: [
    'Saying the source code itself is what runs everywhere.',
    'Claiming no JVM is needed on the target machine.',
  ],
  quiz: {
    question: 'What does the Java compiler primarily produce from your .java files?',
    options: [
      'Native machine code for the current OS',
      'Platform-neutral bytecode (.class files)',
      'An executable that embeds the entire JVM',
      'JavaScript that runs in the browser',
    ],
    correctIndex: 1,
    explain:
      'javac emits bytecode. The JVM loads and executes that bytecode (often JIT-compiling hot paths to native code).',
  },
  practice:
    'Install a JDK, create HelloWorld.java, compile with javac, run with java HelloWorld, and print both a greeting and java.home.',
  practiceHints: [
    'Use java -version to confirm the JDK is on PATH.',
    'Run from the directory containing HelloWorld.class (or set classpath).',
  ],
});
