import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-program-structure-main',
  title: 'Program Structure and main',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-compilation-bytecode'],
  summary:
    'A Java app is classes in packages; execution starts at a public static void main(String[] args) entry point.',
  keywords: ['main', 'class', 'public', 'entry point', 'args'],
  why: 'Every runnable Java lesson and interview whiteboard demo starts with a correct main signature and file layout. Small mistakes here waste time before you even discuss design.',
  theory: [
    'A compilation unit is a .java file: optional package declaration, imports, then type declarations (class/interface/enum/record).',
    'At most one public top-level type per file, and its name must match the filename.',
    'The JVM entry point is public static void main(String[] args) — public so the launcher can call it, static so no instance is required, void because it returns no value to the launcher.',
    'args holds command-line arguments as strings (even numbers arrive as text until you parse them).',
    'You can overload main, but only the canonical signature is the application entry point.',
    'From main you construct objects, start frameworks (Spring Boot), or launch threads — main itself is just the bootstrap.',
  ],
  mentalModel:
    'Treat main as a thin fuse: parse args, wire dependencies, start the real application object. Fat main methods become untestable blobs.',
  moreExamples: [
    {
      title: 'A thin main method bootstraps an object',
      code: `public class GreeterApp {
    static class Greeter {
        String greet(String name) {
            return "Hello, " + name + "!";
        }
    }

    public static void main(String[] args) {
        String name = args.length == 0 ? "world" : args[0];
        Greeter greeter = new Greeter();
        System.out.println(greeter.greet(name));
    }
}`,
      output: `Hello, world!`,
      explain: [
        'Running java GreeterApp with no arguments produces the shown output; java GreeterApp Ada prints Hello, Ada!.',
        'main chooses input and wires the object, while Greeter owns the application behavior.',
      ],
    },
    {
      title: 'Parse command-line arguments safely',
      code: `public class SumApp {
    public static void main(String[] args) {
        if (args.length != 2) {
            System.out.println("Usage: java SumApp <a> <b>");
            return;
        }

        try {
            int left = Integer.parseInt(args[0]);
            int right = Integer.parseInt(args[1]);
            System.out.println("sum=" + (left + right));
        } catch (NumberFormatException error) {
            System.out.println("Both arguments must be integers.");
        }
    }
}`,
      output: `Usage: java SumApp <a> <b>`,
      explain: [
        'The output is for java SumApp with no arguments; java SumApp 8 4 prints sum=12.',
        'All command-line values arrive as String values and must be parsed before numeric use.',
      ],
    },
    {
      title: 'Only the canonical main is the entry point',
      code: `public class MainOverloadDemo {
    static void main(int value) {
        System.out.println("overload=" + value);
    }

    public static void main(String[] args) {
        System.out.println("launcher entry");
        main(42);
    }
}`,
      output: `launcher entry
overload=42`,
      explain: [
        'The launcher selects public static void main(String[] args).',
        'The int overload is an ordinary method and runs only because the canonical main calls it.',
      ],
    },
  ],
  mistakes: [
    'Wrong signature: static public void Main(...), missing String[], or non-static main.',
    'Public class name ≠ filename → compiler error.',
    'Assuming args includes the program name (unlike C’s argv[0] convention for the binary).',
  ],
  interviewAsk: 'Why must main be public and static?',
  interviewAnswer:
    'static: the JVM needs to invoke it without constructing an instance of the class (and construction might need args/config you do not have yet). public: accessibility from the launcher outside the package. The exact descriptor must match what the launcher looks up.',
  interviewTraps: [
    'Saying main returns int like C.',
    'Claiming any method named main starts the app.',
  ],
  quiz: {
    question: 'Which is a valid application entry point?',
    options: [
      'public void main(String[] args)',
      'public static void main(String[] args)',
      'private static void main(String[] args)',
      'public static int main(String[] args)',
    ],
    correctIndex: 1,
    explain:
      'The launcher requires public static void main(String[] args) (String... args is also accepted).',
  },
  practice:
    'Write an app that reads two CLI integers, prints their sum, and exits with a clear message if args are missing or not numbers.',
  practiceHints: [
    'Integer.parseInt throws NumberFormatException — catch and print usage.',
    'System.exit(1) is optional; printing an error may be enough for learning.',
  ],
});
