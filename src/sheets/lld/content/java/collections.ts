import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-collections',
  title: 'Collections Framework',
  section: 'java',
  chapter: 'Collections',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-generics'],
  summary:
    'List, Set, Queue, Deque, and Map — choose structures by access pattern, uniqueness, and ordering needs.',
  keywords: ['List', 'Set', 'Map', 'ArrayList', 'HashSet', 'Collection'],
  why: 'Wrong collection choice is a classic LLD failure: O(n) scans, accidental duplicates, unstable iteration order, or concurrent modification. Interviews expect intentional picks.',
  theory: [
    'Collection hierarchy: Collection → List / Set / Queue; Map is separate (key→value).',
    'List: ordered, duplicates OK — ArrayList (random access), LinkedList (rare need), CopyOnWriteArrayList (concurrent reads).',
    'Set: unique elements — HashSet (unordered), LinkedHashSet (insertion order), TreeSet (sorted).',
    'Map: HashMap, LinkedHashMap, TreeMap, ConcurrentHashMap — keys must honor equals/hashCode (or Comparable for Tree*).',
    'Prefer interfaces in variables/APIs: List<String> x = new ArrayList<>();',
    'Fail-fast iterators throw ConcurrentModificationException on structural changes during iteration (most non-concurrent collections).',
  ],
  mentalModel:
    'Pick by questions: Need index? List. Need uniqueness? Set. Need lookup by key? Map. Need sorted order? Tree*. Need concurrency? java.util.concurrent.*',
  codeTitle: 'List, Set, Map in one demo',
  code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class CollectionsDemo {
    public static void main(String[] args) {
        List<String> lineup = new ArrayList<>();
        lineup.add("Ada");
        lineup.add("Grace");
        lineup.add("Ada"); // duplicates allowed
        System.out.println("list=" + lineup);

        Set<String> unique = new HashSet<>(lineup);
        System.out.println("set=" + unique);

        Map<String, Integer> scores = new HashMap<>();
        scores.put("Ada", 10);
        scores.put("Grace", 12);
        scores.put("Ada", 11); // replaces
        System.out.println("Ada=" + scores.get("Ada"));
        System.out.println("keys=" + scores.keySet());
    }
}`,
  output: `list=[Ada, Grace, Ada]
set=[Ada, Grace]
Ada=11
keys=[Ada, Grace]`,
  explain: [
    'List keeps both Ada entries and insertion order.',
    'HashSet collapses duplicates (order not guaranteed — print order may vary).',
    'Map put with existing key replaces the value; get returns the latest.',
  ],
  mistakes: [
    'Using ArrayList.contains in hot paths for large n when a HashSet would be O(1).',
    'Modifying a list while for-each iterating.',
    'Returning null from Map.get and forgetting the key may be missing vs mapped to null.',
  ],
  interviewAsk: 'ArrayList vs LinkedList — which do you pick?',
  interviewAnswer:
    'Almost always ArrayList: contiguous array storage, great random access and iteration locality, amortized O(1) append. LinkedList has O(1) insert given a node but poor locality and O(n) index access; rarely wins in real JVMs. Measure if unsure; default to ArrayList (or ArrayDeque for stack/queue).',
  interviewTraps: [
    'Defaulting to LinkedList because "inserts are O(1)" without context.',
    'Saying HashMap iterates in sorted key order.',
  ],
  quiz: {
    question: 'Which structure forbids duplicate elements by equals/hashCode?',
    options: ['ArrayList', 'HashSet', 'LinkedList', 'ArrayDeque'],
    correctIndex: 1,
    explain: 'Set semantics enforce uniqueness.',
  },
  practice:
    'Build a frequency counter: given List<String>, produce Map<String, Long> counts using a loop (then later redo with streams).',
  practiceHints: [
    'map.merge(word, 1L, Long::sum).',
    'Handle null list by throwing IAE.',
  ],
});
