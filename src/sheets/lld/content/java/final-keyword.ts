import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-final-keyword',
  title: 'The final Keyword',
  section: 'java',
  chapter: 'Object Model Advanced',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['oop-encapsulation'],
  summary:
    'final freezes variables’ bindings, prevents method overrides, and seals classes from extension — different meanings in each context.',
  keywords: ['final', 'immutable binding', 'final class', 'final method', 'blank final'],
  why: 'final communicates intent: this reference will not be retargeted; this algorithm step is not a customization point; this type is not a superclass. Interviewers test whether you confuse final with immutability.',
  theory: [
    'final variable: the binding cannot be reassigned after initialization (blank finals assigned once in ctor/static block).',
    'final reference ≠ immutable object — the object’s fields may still change unless the type is immutable.',
    'final method: cannot be overridden (still inherited). Useful to lock invariants in a template.',
    'final class: cannot be extended (String, Integer are final). Enables security and stronger reasoning.',
    'final parameters: cannot reassign the parameter inside the method (rarely critical, sometimes style).',
    'Effectively final locals matter for lambdas/anonymous classes — they must not be reassigned.',
  ],
  mentalModel:
    'final on a variable glues the sticky note to one address. It does not freeze the warehouse contents unless those contents are themselves immutable.',
  codeTitle: 'final bindings vs mutable state',
  code: `import java.util.ArrayList;
import java.util.List;

public class FinalDemo {
    static final class Config {
        private final String env;
        private final List<String> flags = new ArrayList<>();

        Config(String env) {
            this.env = env;
        }

        void addFlag(String flag) {
            flags.add(flag);
        }

        List<String> flags() {
            return List.copyOf(flags);
        }

        String env() {
            return env;
        }
    }

    public static void main(String[] args) {
        final Config cfg = new Config("prod");
        // cfg = new Config("dev"); // illegal — final binding
        cfg.addFlag("feature-x");   // legal — object mutates
        System.out.println(cfg.env() + " " + cfg.flags());
    }
}`,
  output: `prod [feature-x]`,
  explain: [
    'cfg cannot point to another Config, but addFlag still mutates the list inside.',
    'env is a final field set once in the constructor.',
    'final class Config prevents subclassing.',
  ],
  mistakes: [
    'Assuming final makes objects immutable.',
    'Overusing final classes when extension is part of the design (prefer sealed carefully).',
    'Forgetting blank finals must be assigned on every constructor path.',
  ],
  interviewAsk: 'Does declaring a reference final make the object immutable?',
  interviewAnswer:
    'No. final prevents reassignment of the variable. The object can still expose mutators. Immutability requires all state to be unchangeable after construction (private final fields of immutable types, no mutators, safe publication).',
  interviewTraps: [
    'Equating final with const in C++ in all senses.',
    'Saying final methods cannot be inherited.',
  ],
  quiz: {
    question: 'What does `final class A {}` prevent?',
    options: [
      'Creating instances of A',
      'Extending A',
      'Calling methods on A',
      'Importing A',
    ],
    correctIndex: 1,
    explain: 'final classes cannot be subclasses.',
  },
  practice:
    'Refactor a mutable Point with public x,y into an immutable Point with final fields and withX/withY returning new instances.',
  practiceHints: [
    'No setters.',
    'equals/hashCode based on coordinates.',
  ],
});
