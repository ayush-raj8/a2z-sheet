import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-string-class',
  title: 'String, StringBuilder, and StringBuffer',
  section: 'java',
  chapter: 'Strings',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['java-equals-identity', 'java-immutability'],
  summary:
    'String is immutable and heavily optimized; use StringBuilder for mutable concatenation in loops — StringBuffer is the older synchronized variant.',
  keywords: ['String', 'StringBuilder', 'StringBuffer', 'immutability', 'string pool'],
  why:
    'Strings show up in every codebase. Knowing immutability, equality, and when to use StringBuilder avoids quadratic loops and == bugs.',
  theory: [
    'String objects are immutable: methods like concat/substring return new strings (conceptually), they don’t edit the original characters.',
    'String literals may be interned in the string pool; == may work for literals but equals is the correct equality check.',
    'Common APIs: length(), charAt(), substring(), indexOf(), equals(), equalsIgnoreCase(), split(), strip() / trim().',
    'StringBuilder is a mutable character sequence — append in loops without creating many intermediate String objects.',
    'StringBuffer is like StringBuilder but synchronized (thread-safe, usually slower) — prefer StringBuilder unless you need the sync.',
    'Never build large strings with s = s + x inside hot loops without a builder.',
  ],
  mentalModel:
    'String is a sealed letter — to “change” it you write a new letter. StringBuilder is a whiteboard you erase and rewrite. StringBuffer is a whiteboard with a lock on the marker.',
  moreExamples: [
    {
      title: 'Immutability and content equality',
      code: `public class StringIdentityDemo {
    public static void main(String[] args) {
        String original = "java";
        String upper = original.toUpperCase();
        String copied = new String("java");

        System.out.println("original=" + original);
        System.out.println("upper=" + upper);
        System.out.println("same reference=" + (original == copied));
        System.out.println("same content=" + original.equals(copied));
    }
}`,
      output: `original=java
upper=JAVA
same reference=false
same content=true`,
      explain: [
        'toUpperCase returns another String; it cannot modify original.',
        '== compares references, while equals compares character content.',
      ],
    },
    {
      title: 'Build a result efficiently with StringBuilder',
      code: `public class BuilderDemo {
    static String joinWords(String[] words) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            if (i > 0) {
                builder.append(" | ");
            }
            builder.append(words[i].strip());
        }
        return builder.toString();
    }

    public static void main(String[] args) {
        String[] words = {" Java ", "JVM", " bytecode "};
        System.out.println(joinWords(words));
    }
}`,
      output: `Java | JVM | bytecode`,
      explain: [
        'The builder mutates one expandable buffer during the loop.',
        'toString creates the immutable String returned to the caller.',
      ],
    },
    {
      title: 'StringBuffer exposes synchronized mutations',
      code: `public class BufferDemo {
    public static void main(String[] args) {
        StringBuffer buffer = new StringBuffer("start");
        buffer.append('-');
        buffer.append(10);
        buffer.reverse();

        System.out.println(buffer);
        System.out.println("length=" + buffer.length());
    }
}`,
      output: `01-trats
length=8`,
      explain: [
        'StringBuffer has a mutable API similar to StringBuilder, but its mutation methods are synchronized.',
        'For thread-confined construction, StringBuilder is normally preferable because locking is unnecessary.',
      ],
    },
  ],
  mistakes: [
    'Using == to compare String content from user input or files.',
    'Repeated s += x in large loops without StringBuilder.',
    'Assuming StringBuffer is required “because threads exist somewhere” — sync only the shared mutable builder if needed.',
  ],
  interviewAsk: 'Why is String immutable, and when do you use StringBuilder?',
  interviewAnswer:
    'Immutability enables safe sharing, caching/interning, and simpler reasoning about security and concurrency. Use StringBuilder when constructing strings incrementally, especially in loops. Prefer equals over == for content.',
  interviewTraps: [
    '“StringBuffer is always better because it’s thread-safe” — usually you don’t share builders across threads.',
  ],
  quiz: {
    question: 'Best tool for building a string in a tight loop?',
    options: ['Repeated s = s + chunk', 'StringBuilder', 'Always StringBuffer', 'String.intern() each step'],
    correctIndex: 1,
    explain: 'StringBuilder avoids creating many intermediate immutable Strings. Use StringBuffer only if the builder itself is shared concurrently.',
  },
  practice:
    'Implement a method that reverses words in a sentence using StringBuilder (e.g. "oop lab" → "lab oop").',
  practiceHints: ['split on spaces, append words in reverse order with spaces carefully.'],
});
