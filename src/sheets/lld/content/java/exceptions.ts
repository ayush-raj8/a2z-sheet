import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-exceptions',
  title: 'Exceptions',
  section: 'java',
  chapter: 'Exceptions & Generics',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-enums'],
  summary:
    'Checked vs unchecked exceptions, try/catch/finally, try-with-resources, and designing failure as part of your API.',
  keywords: ['checked', 'unchecked', 'try-with-resources', 'throw', 'Exception', 'Error'],
  why: 'APIs that lie about failure modes create silent data loss. Knowing when to catch, wrap, declare, or crash is essential for robust services and clean LLD.',
  theory: [
    'Throwable → Error (usually non-recoverable: OOM, StackOverflow) and Exception.',
    'Checked exceptions (Exception minus RuntimeException) must be caught or declared with throws — e.g. IOException.',
    'Unchecked: RuntimeException and subclasses (NPE, IAE, IllegalState) — not required to declare.',
    'try/catch/finally: finally always runs (except JVM death / killed thread extremes). Prefer try-with-resources for AutoCloseable.',
    'Wrap with cause: new ServiceException("...", e) to preserve stack traces.',
    'Design: use exceptions for exceptional failure; for expected absence prefer Optional/empty; do not use exceptions for normal control flow.',
  ],
  mentalModel:
    'A thrown exception is an emergency flare up the call stack until someone competent handles it — or the thread dies. Checked flares are legally required to be acknowledged at compile time.',
  codeTitle: 'Checked handling and try-with-resources',
  code: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

public class ExceptionsDemo {
    static int parsePositive(String raw) {
        try {
            int n = Integer.parseInt(raw);
            if (n <= 0) throw new IllegalArgumentException("must be positive: " + raw);
            return n;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("not a number: " + raw, e);
        }
    }

    static String firstLine(String text) throws IOException {
        try (BufferedReader br = new BufferedReader(new StringReader(text))) {
            return br.readLine();
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println(parsePositive("42"));
        try {
            parsePositive("0");
        } catch (IllegalArgumentException e) {
            System.out.println("caught: " + e.getMessage());
        }
        System.out.println(firstLine("hello\\nworld"));
    }
}`,
  output: `42
caught: must be positive: 0
hello`,
  explain: [
    'NumberFormatException is wrapped to add domain context while keeping the cause.',
    'IllegalArgumentException is unchecked — callers may still catch it.',
    'try-with-resources closes BufferedReader automatically even if readLine fails.',
  ],
  mistakes: [
    'catch (Exception e) {} empty swallow.',
    'throwing bare Exception everywhere — loses meaning.',
    'Using checked exceptions deep inside for failures callers cannot recover from — causes throws pollution.',
  ],
  interviewAsk: 'Checked vs unchecked exceptions — when do you use each?',
  interviewAnswer:
    'Checked exceptions force callers to confront recoverable, external-world failures (I/O, certain protocols) when acknowledgment matters. Unchecked exceptions signal programming bugs or failures that most callers cannot meaningfully handle (null, invalid args, illegal state). Many modern APIs prefer unchecked + clear docs for service boundaries, but I/O libraries still use checked. Never ignore checked by empty catch.',
  interviewTraps: [
    'Catching Error to "keep the server up" after OOM.',
    'Saying RuntimeException must be declared with throws.',
  ],
  quiz: [
    {
      question: 'IOException is…',
      options: ['An Error', 'A checked Exception', 'A RuntimeException', 'Not a Throwable'],
      correctIndex: 1,
      explain: 'IOException extends Exception and is checked.',
    },
  ],
  practice:
    'Write a method readFirstLine(Path) using Files.newBufferedReader and try-with-resources; wrap IOException in an unchecked DomainIOException with cause.',
  practiceHints: [
    'DomainIOException extends RuntimeException.',
    'Always pass the original exception as cause.',
  ],
});
