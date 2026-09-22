import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-java8-streams',
  title: 'Java 8 Streams',
  section: 'java',
  chapter: 'Modern Java',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-collections'],
  summary:
    'Streams express bulk data pipelines: filter, map, reduce — lazy, possibly parallel, without mutating the source by design.',
  keywords: ['stream', 'lambda', 'map', 'filter', 'collect', 'optional'],
  why: 'Modern Java codebases use streams for clarity on collection transforms. Interviews expect you to know laziness, terminal operations, and when a plain loop is clearer.',
  theory: [
    'A Stream is a pipeline on data from a source (collection, array, generator) — not a new storage structure.',
    'Intermediate ops (filter, map, flatMap, sorted, distinct) are lazy; terminal ops (collect, forEach, reduce, count) trigger execution.',
    'Streams are typically single-use; after a terminal op the stream is consumed.',
    'Lambdas/method references power Function, Predicate, Consumer — prefer clarity over clever one-liners.',
    'collect(Collectors.toList/toSet/groupingBy/…) builds results; prefer toList() (Java 16+) when unmodifiable is fine.',
    'parallelStream() can help CPU-bound independent work but hurts with shared mutation / small data / ordering needs.',
  ],
  mentalModel:
    'A stream is an assembly line: stations (map/filter) sit idle until a terminal consumer asks for products. Nothing moves until the end of the line pulls.',
  codeTitle: 'Filter, map, group',
  code: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StreamsDemo {
    record Emp(String dept, String name, int salary) {}

    public static void main(String[] args) {
        List<Emp> emps = List.of(
            new Emp("Eng", "Ada", 120),
            new Emp("Eng", "Grace", 130),
            new Emp("HR", "Lin", 90),
            new Emp("Eng", "Edsger", 110)
        );

        List<String> engNames = emps.stream()
            .filter(e -> e.dept().equals("Eng"))
            .filter(e -> e.salary() >= 120)
            .map(Emp::name)
            .sorted()
            .toList();
        System.out.println(engNames);

        Map<String, Long> countByDept = emps.stream()
            .collect(Collectors.groupingBy(Emp::dept, Collectors.counting()));
        System.out.println(countByDept);

        int payroll = emps.stream().mapToInt(Emp::salary).sum();
        System.out.println("payroll=" + payroll);
    }
}`,
  output: `[Ada, Grace]
{Eng=3, HR=1}
payroll=450`,
  explain: [
    'Two filters narrow Eng employees with salary ≥ 120; map extracts names.',
    'groupingBy builds a Map of department counts in one pass.',
    'mapToInt avoids boxing for the sum terminal reduction.',
  ],
  mistakes: [
    'Side-effecting in map (mutating external lists) — prefer collect.',
    'Calling stream() and forgetting a terminal operation — nothing runs.',
    'Blind parallelStream on tiny lists or synchronized shared state.',
  ],
  interviewAsk: 'Are intermediate stream operations lazy? Why does it matter?',
  interviewAnswer:
    'Yes — filter/map etc. build a pipeline description. Laziness means work runs only when a terminal operation pulls data, enabling fusion and short-circuiting (e.g. findFirst stops early). It also means bugs in intermediate lambdas appear only when a terminal op executes.',
  interviewTraps: [
    'Thinking Stream stores all intermediate lists eagerly always.',
    'Reusing a stream after a terminal operation.',
  ],
  quiz: {
    question: 'Which is a terminal stream operation?',
    options: ['map', 'filter', 'collect', 'sorted'],
    correctIndex: 2,
    explain: 'collect consumes the stream and produces a result.',
  },
  practice:
    'Given List<String> words, produce a Map<Integer, List<String>> grouping words by length, lowercasing them first, ignoring blanks.',
  practiceHints: [
    'filter(s -> !s.isBlank()).map(String::toLowerCase).',
    'Collectors.groupingBy(String::length).',
  ],
});
