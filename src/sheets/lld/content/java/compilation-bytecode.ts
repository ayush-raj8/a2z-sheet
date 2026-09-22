import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-compilation-bytecode',
  title: 'Compilation and Bytecode',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-jvm-jdk-jre'],
  summary:
    'javac turns source into bytecode; the JVM verifies, interprets, and JIT-compiles hot code — bytecode is the portable contract.',
  keywords: ['javac', 'bytecode', 'class file', 'jit', 'verification'],
  why: 'Understanding the compile → verify → execute pipeline explains class-version errors, why decompilers work, and how performance improves after warm-up.',
  theory: [
    'javac parses .java, type-checks, and emits .class files containing bytecode instructions (not CPU opcodes).',
    'A .class file has a fixed format: magic number 0xCAFEBABE, version, constant pool, fields, methods, attributes.',
    'At load time the JVM verifies bytecode (stack discipline, type safety) before it may run — this is a key security/reliability feature.',
    'Early execution is often interpreted; HotSpot’s JIT compiles frequently used methods to native code (tiered compilation).',
    'One .java file can produce multiple .class files (nested/inner/anonymous/local classes get names like Outer$Inner.class).',
    'Tools: javap -c disassembles bytecode; jdeps analyzes dependencies; jlink builds custom runtimes.',
  ],
  mentalModel:
    'Source is for humans. Bytecode is the portable IR. Native code is an optimization the JVM may create later for hot paths — you usually ship bytecode, not those native blobs.',
  moreExamples: [
    {
      title: 'Compile, run, and inspect a method',
      code: `public class BytecodeAdd {
    static int add(int left, int right) {
        return left + right;
    }

    public static void main(String[] args) {
        int result = add(7, 5);
        System.out.println("result=" + result);
    }
}`,
      output: `result=12`,
      explain: [
        'Save as BytecodeAdd.java, then run javac BytecodeAdd.java and java BytecodeAdd.',
        'javap -c BytecodeAdd shows iload instructions, iadd, and ireturn for add; those are JVM bytecode instructions, not CPU instructions.',
      ],
    },
    {
      title: 'A nested class produces another class file',
      code: `public class ClassFileDemo {
    static class Counter {
        private int value;

        void increment() {
            value++;
        }

        int value() {
            return value;
        }
    }

    public static void main(String[] args) {
        Counter counter = new Counter();
        counter.increment();
        counter.increment();
        System.out.println("count=" + counter.value());
    }
}`,
      output: `count=2`,
      explain: [
        'Compiling creates ClassFileDemo.class and ClassFileDemo$Counter.class.',
        'Both files contain portable bytecode; the JVM verifies and loads each class when needed.',
      ],
    },
    {
      title: 'Bytecode still preserves Java behavior',
      code: `public class BranchBytecode {
    static String parity(int number) {
        if (number % 2 == 0) {
            return "even";
        }
        return "odd";
    }

    public static void main(String[] args) {
        for (int number = 1; number <= 3; number++) {
            System.out.println(number + " is " + parity(number));
        }
    }
}`,
      output: `1 is odd
2 is even
3 is odd`,
      explain: [
        'javac translates the loop and if statement into labels and conditional branch bytecodes.',
        'A hot parity method may later be JIT-compiled into native code without changing its Java result.',
      ],
    },
  ],
  mistakes: [
    'Editing .java and forgetting to recompile — java runs stale .class files.',
    'Shipping source instead of compiled artifacts (or vice versa when source maps matter).',
    'Assuming javap output is what the CPU executes — it is the bytecode layer.',
  ],
  interviewAsk: 'What is bytecode, and how does JIT relate to it?',
  interviewAnswer:
    'Bytecode is the portable instruction set in .class files. The JVM interprets it and/or JIT-compiles hot methods to native machine code for the current CPU. Verification happens on bytecode before execution. Performance often improves after warm-up because more methods get compiled.',
  interviewTraps: [
    'Saying Java has no compilation step.',
    'Claiming bytecode is the same as x86 assembly.',
  ],
  quiz: {
    question: 'Why might a long-running Java service get faster after a few minutes?',
    options: [
      'The .java files keep recompiling automatically',
      'The JIT compiles hot methods to native code over time',
      'The GC permanently disables itself',
      'Bytecode is rewritten into JavaScript',
    ],
    correctIndex: 1,
    explain:
      'HotSpot’s tiered compilation optimizes frequently executed methods after profiling.',
  },
  practice:
    'Write a tiny class with a loop summing integers. Run javap -c on it and identify iload/iadd/istore (or iinc). Then run with -XX:+PrintCompilation if available and watch methods get compiled.',
  practiceHints: [
    'Keep the method hot: many iterations in a loop.',
    'Compare bytecode for int vs Integer (boxing shows up as method calls).',
  ],
});
