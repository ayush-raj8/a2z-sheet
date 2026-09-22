import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-template-method',
  title: 'Template Method Pattern',
  section: 'patterns',
  chapter: 'Behavioral',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['pattern-strategy'],
  summary:
    'Define the skeleton of an algorithm in a base class, deferring some steps to subclasses — reuse workflow structure while varying details.',
  keywords: ['template method', 'hooks', 'hollywood', 'behavioral'],
  why:
    'Frameworks use Template Method everywhere (JUnit lifecycle, servlets, data parsers). It teaches Hollywood Principle: don’t call us, we’ll call you — and contrasts cleanly with Strategy.',
  theory: [
    'Intent: define algorithm skeleton, let subclasses override steps without changing structure.',
    'Base class implements templateMethod() as final (often) calling overridable steps/hooks.',
    'Invariant steps stay in the base; variant steps are abstract or hook methods with defaults.',
    'Hollywood Principle: base class calls subclass methods.',
    'vs Strategy: Template Method = inheritance + fixed skeleton; Strategy = composition + swappable whole algorithm/policy.',
    'Risk: fragile base class and deep inheritance — prefer Strategy/composition when variation is large.',
  ],
  mentalModel:
    'A cooking show recipe card: “prepare → cook → plate” is fixed. Subclasses fill in prepare for pasta vs salad. Guests always experience the same meal flow; ingredients differ.',
  codeTitle: 'Data parser Template Method',
  code: `import java.util.Arrays;

public class Demo {
    static abstract class DataParser {
        public final void parse(String path) {
            open(path);
            String raw = read();
            String printableData = parsePayload(raw);
            persist(printableData);
            close();
        }

        protected void open(String path) {
            System.out.println("Open " + path);
        }

        protected abstract String read();
        protected abstract String parsePayload(String raw);

        protected void persist(String data) {
            System.out.println("Persist " + data);
        }

        protected void close() {
            System.out.println("Close");
        }
    }

    static final class CsvParser extends DataParser {
        protected String read() {
            return "a,b";
        }

        protected String parsePayload(String raw) {
            return Arrays.toString(raw.split(","));
        }
    }

    static final class JsonParser extends DataParser {
        protected String read() {
            return "{\\"x\\":1}";
        }

        protected String parsePayload(String raw) {
            return "json:" + raw;
        }
    }

    public static void main(String[] args) {
        new CsvParser().parse("f.csv");
        System.out.println("---");
        new JsonParser().parse("f.json");
    }
}`,
  output: `Open f.csv
Persist [a, b]
Close
---
Open f.json
Persist json:{"x":1}
Close`,
  explain: [
    'parse() structure is identical across formats.',
    'read/parsePayload vary; open/persist/close reused.',
    'Arrays.toString converts the CSV array into [a, b] instead of printing an array identity such as [Ljava.lang.String;@....',
    'final parse prevents subclasses from breaking the pipeline order.',
  ],
  mermaid: `flowchart TD
    T[parse template] --> O[open]
    O --> R[read*]
    R --> P[parsePayload*]
    P --> S[persist]
    S --> C[close]`,
  mistakes: [
    'Making every method abstract — no reuse left.',
    'Allowing subclasses to override the template method and skip steps.',
    'Deep inheritance trees where Strategy would be clearer.',
  ],
  interviewAsk: 'Template Method vs Strategy — which would you pick for payment flows?',
  interviewAnswer:
    'If the overall workflow is identical and only steps differ (validate → charge → receipt), Template Method or a pipeline fits. If the entire policy is swappable and you want to avoid inheritance, Strategy/composition is better. Many modern codebases prefer Strategy + functions over subclass templates for testability.',
  interviewTraps: [
    'Saying they are the same pattern.',
    'Forcing Template Method when the skeleton itself varies.',
  ],
  quiz: {
    question: 'Template Method relies primarily on:',
    options: [
      'Composition of strategy objects',
      'Inheritance with an algorithm skeleton calling overridable steps',
      'Adapting interfaces',
      'Object pooling',
    ],
    correctIndex: 1,
    explain: 'The pattern is inheritance-based skeleton with hooks.',
  },
  practice:
    'Create GameAI with template takeTurn(): sense → think → act. Implement AggressiveAI and DefensiveAI varying think/act.',
  practiceHints: [
    'Keep takeTurn final.',
    'Print each phase so the shared order is visible.',
  ],
});
