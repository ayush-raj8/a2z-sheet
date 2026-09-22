import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-object-class',
  title: 'The Object Class',
  section: 'java',
  chapter: 'Object Model Advanced',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-final-keyword'],
  summary:
    'Every class extends Object — the root API for identity, equality, hashing, string form, monitoring, and cloning pitfalls.',
  keywords: ['Object', 'toString', 'equals', 'hashCode', 'getClass', 'clone'],
  why: 'Collections, logging, debuggers, and monitors all assume Object’s contracts. Knowing what to override (and what to avoid) is table stakes for Java LLD.',
  theory: [
    'Implicit superclass of all classes: java.lang.Object.',
    'Key methods: equals, hashCode, toString, getClass, wait/notify/notifyAll, clone, finalize (deprecated).',
    'Default toString is ClassName@hexHash — override for readable logs.',
    'getClass() returns the runtime Class; useful for reflection and pattern matching; prefer polymorphism over class checks.',
    'clone() is protected and awkward (Cloneable marker) — prefer copy constructors or factories.',
    'wait/notify require holding the monitor lock; prefer higher-level concurrency utilities (Lock, Condition, concurrent collections).',
  ],
  mentalModel:
    'Object is the universal adapter plug: every instance can be stored in Object references, printed, compared (by identity by default), and synchronized upon.',
  codeTitle: 'Meaningful toString and getClass',
  code: `public class ObjectClassDemo {
    static class Player {
        private final String name;
        private final int score;

        Player(String name, int score) {
            this.name = name;
            this.score = score;
        }

        @Override
        public String toString() {
            return "Player{name='" + name + "', score=" + score + "}";
        }
    }

    public static void main(String[] args) {
        Object p = new Player("Neo", 9000);
        System.out.println(p.toString());
        System.out.println("class=" + p.getClass().getName());
        System.out.println("identityHash=" + System.identityHashCode(p));
        System.out.println("default-like would be: Player@" + Integer.toHexString(System.identityHashCode(p)));
    }
}`,
  output: `Player{name='Neo', score=9000}
class=ObjectClassDemo$Player
identityHash=12345678
default-like would be: Player@bc614e`,
  explain: [
    'Overridden toString is used even through an Object reference (dynamic dispatch).',
    'getClass().getName() reveals the runtime type, including nested naming ($).',
    'identityHashCode relates to default Object.toString’s hex suffix, not your equals-based hashCode.',
  ],
  mistakes: [
    'Relying on default toString in production logs.',
    'Implementing clone without understanding shallow vs deep copy.',
    'Using finalize for resource cleanup — use try-with-resources.',
  ],
  interviewAsk: 'Which Object methods should you usually override together?',
  interviewAnswer:
    'equals and hashCode must be overridden together when you define value equality. toString is strongly recommended for debuggability. clone is usually avoided. Do not override wait/notify. getClass is final — you call it, you do not override it.',
  interviewTraps: [
    'Overriding hashCode alone.',
    'Using getClass() in equals vs instanceof without understanding Liskov implications.',
  ],
  quiz: {
    question: 'What is the default equals behavior in Object?',
    options: [
      'Deep field comparison',
      'Reference identity (==)',
      'Compares toString()',
      'Always false',
    ],
    correctIndex: 1,
    explain: 'Object.equals is identity unless overridden.',
  },
  practice:
    'Override toString, equals, and hashCode for a Coordinate(x,y) and put duplicates into a HashSet to verify set size is 1.',
  practiceHints: [
    'Use Objects.equals / Objects.hash.',
    'Print the set to see your toString.',
  ],
});
