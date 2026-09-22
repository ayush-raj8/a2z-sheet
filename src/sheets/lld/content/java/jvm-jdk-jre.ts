import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-jvm-jdk-jre',
  title: 'JVM, JDK, and JRE',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['java-what-is-java'],
  summary:
    'JDK ⊃ JRE ⊃ JVM: the kit builds apps, the runtime runs them, the virtual machine executes bytecode — know which install you need and why versions break.',
  keywords: ['jvm', 'jdk', 'jre', 'hotspot', 'classpath', 'javac', 'venn', 'containment'],
  why:
    'Interviewers ask this on day one. Getting it wrong means installing the wrong package in CI, shipping jars that cannot run, or not knowing who actually executes your code.',
  theory: [
    'JVM (Java Virtual Machine): loads .class files, verifies bytecode, manages heap/GC/stacks, and executes methods (interpreter + JIT).',
    'JRE (Java Runtime Environment): historically “everything needed to run” — JVM + core class libraries (rt.jar / modules). No compiler.',
    'JDK (Java Development Kit): full development kit — runtime + tools: javac, jar, javadoc, jdb, jlink, jpackage, …',
    'Containment (the diagram people call a Venn): JDK contains JRE capabilities; JRE contains a JVM. You almost always install a JDK today.',
    'HotSpot is the mainstream OpenJDK/Oracle JVM; others exist (OpenJ9, GraalVM). Android uses a different runtime lineage (ART).',
    'Bytecode version must be ≤ JVM version or you get UnsupportedClassVersionError.',
    'JAVA_HOME and PATH must agree: wrong java on PATH with a different JAVA_HOME is a common “it works on my machine” bug.',
  ],
  mentalModel:
    'Workshop metaphor: JDK = whole workshop (tools + power). JRE = power outlet + machine so finished products run. JVM = the motor that spins when you press start on a .class/.jar.',
  mermaid: `flowchart TB
  subgraph JDK["JDK — Java Development Kit"]
    direction TB
    Tools["Tools: javac · jar · javadoc · jlink · debugger"]
    subgraph JRE["JRE — Java Runtime Environment"]
      direction TB
      Libs["Core libraries / modules<br/>java.lang · java.util · java.io · …"]
      subgraph JVM["JVM — Java Virtual Machine"]
        Exec["Class loading · bytecode verify<br/>Heap + GC · Interpreter + JIT"]
      end
    end
  end
  Source[".java source"] -->|javac| Bytecode[".class bytecode"]
  Bytecode -->|java| Exec
  Tools --- JRE`,
  moreExamples: [
    {
      title: '1) What each piece does in the build → run pipeline',
      code: `/*
  Developer machine (needs JDK):
    Hello.java  --javac-->  Hello.class  --jar-->  app.jar

  Any machine with a compatible runtime (JRE/JDK providing a JVM):
    java -jar app.jar
         ^
         JVM loads classes, runs main
*/

public class Hello {
    public static void main(String[] args) {
        System.out.println("Executed by the JVM");
        System.out.println("java.home = " + System.getProperty("java.home"));
        System.out.println("vm.name   = " + System.getProperty("java.vm.name"));
        System.out.println("vm.vendor = " + System.getProperty("java.vm.vendor"));
    }
}`,
      output: `Executed by the JVM
java.home = /Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
vm.name   = OpenJDK 64-Bit Server VM
vm.vendor = Eclipse Adoptium`,
      explain: [
        'javac is a JDK tool — it is not part of a pure “runtime only” mental model.',
        'java launches a JVM process; properties reveal which install and VM implementation you actually got.',
        'Today java.home often sits inside a JDK folder even when you only “run” an app.',
      ],
    },
    {
      title: '2) Detect mismatch: compile with 21, run with older JVM',
      code: `// Compile targeting a newer bytecode, then run on an older java:
//   javac --release 21 App.java
//   /path/to/java11/bin/java App
//
// Typical failure:
//   UnsupportedClassVersionError: App has been compiled by a more
//   recent version of the Java Runtime (class file version 65.0),
//   this version of the Java Runtime only recognizes class file
//   versions up to 55.0
//
// class file major versions (examples):
//   55 = Java 11, 61 = Java 17, 65 = Java 21

public class App {
    public static void main(String[] args) {
        System.out.println(Runtime.version());
    }
}`,
      output: `UnsupportedClassVersionError: App has been compiled by a more recent
version of the Java Runtime (class file version 65.0), this version
only recognizes class file versions up to 55.0`,
      explain: [
        'The JVM does not execute “Java source”; it executes a class-file format with a version number.',
        'CI must compile with a --release (or toolchain) compatible with production JVMs.',
        'Runtime.version() on a successful run prints the executing JVM’s version — useful in support logs.',
      ],
    },
    {
      title: '3) JDK tools vs JVM process — jar + classpath sketch',
      code: `// With a JDK you can package:
//   jar --create --file demo.jar --main-class RuntimeInfo RuntimeInfo.class
//   java -jar demo.jar
//
// Or run unpackaged with an explicit classpath:
//   java -cp out:lib/* com.example.Main

public class RuntimeInfo {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        System.out.println("Processors : " + rt.availableProcessors());
        System.out.println("Max heap MB: " + rt.maxMemory() / (1024 * 1024));
        System.out.println("classpath  : " + System.getProperty("java.class.path"));
    }
}`,
      output: `Processors : 8
Max heap MB: 4096
classpath  : demo.jar`,
      explain: [
        'jar is a JDK packaging tool; the JVM still does the executing.',
        'maxMemory() is the configured heap limit for this JVM process, not total machine RAM.',
        'classpath/module-path tell the JVM where to find classes — wrong path → ClassNotFoundException.',
      ],
    },
  ],
  mistakes: [
    'Saying JDK and JVM are the same thing.',
    'Installing only a JRE-style runtime in CI when the pipeline must compile (need JDK / javac).',
    'Compiling on JDK 21 and deploying to a Java 11 server without --release 11.',
    'Assuming JAVA_HOME and the java on PATH always point at the same install.',
  ],
  interviewAsk: 'Difference between JDK, JRE, and JVM? Draw the relationship.',
  interviewAnswer:
    'JVM executes bytecode. JRE is the runtime bundle (JVM + standard libraries) historically used to run apps. JDK includes the runtime plus development tools (javac, jar, …). Relationship is nested containment: JDK ⊃ JRE ⊃ JVM. Developers install a JDK; production needs a compatible JVM/runtime capable of loading your class-file version.',
  interviewTraps: [
    'Drawing three overlapping circles with no nesting — the relationship is containment, not three peer sets.',
    'Claiming every laptop that runs a JAR must have a full JDK with javac.',
  ],
  quiz: [
    {
      question: 'Which statement matches the standard containment model?',
      options: [
        'JVM contains the JDK',
        'JDK contains JRE/runtime pieces, which include a JVM',
        'JRE compiles .java files',
        'javac is part of the JVM specification only',
      ],
      correctIndex: 1,
      explain: 'JDK is the outer kit; inside you find runtime libraries and a JVM that executes bytecode.',
    },
    {
      question: 'Which component actually executes .class bytecode?',
      options: ['javac', 'javadoc', 'JVM', 'jar tool'],
      correctIndex: 2,
      explain: 'Tools prepare artifacts; the JVM runs them.',
    },
    {
      question: 'You need to compile in CI. What should the image provide?',
      options: [
        'Only a JRE',
        'A JDK (javac + matching runtime)',
        'Only Maven with no JDK',
        'Only a text editor',
      ],
      correctIndex: 1,
      explain: 'Compilation requires JDK tools such as javac.',
    },
  ],
  practice:
    '1) Print java.version, java.home, java.vm.name, java.class.path.\n2) Compile with javac --release 21 and attempt to run with an older java if available; paste the UnsupportedClassVersionError.\n3) Sketch JDK ⊃ JRE ⊃ JVM from memory and label where javac vs java sit.',
  practiceHints: [
    'On macOS/Linux: /usr/libexec/java_home -V lists installs.',
    'Note class file major numbers: 55→11, 61→17, 65→21.',
  ],
  deepDive: [
    'jlink can produce a custom runtime image with only the modules you need — modern replacement for “ship a fat JRE.”',
    'Class loading: bootstrap → platform → application loaders; modules (JPMS) change visibility rules vs the old flat classpath.',
  ],
});
