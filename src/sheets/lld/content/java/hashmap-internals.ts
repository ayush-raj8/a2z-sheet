import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-hashmap-internals',
  title: 'HashMap Internals',
  section: 'java',
  chapter: 'Collections',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['java-collections', 'java-equals-identity'],
  summary:
    'HashMap buckets keys by hash, resolves collisions with lists/trees, and resizes by load factor — equals/hashCode correctness is mandatory.',
  keywords: ['HashMap', 'bucket', 'hash', 'collision', 'treeify', 'load factor'],
  why: 'Senior interviews dig into HashMap: hashing, collisions, resize, null key, and why mutable keys break maps. This is high-signal advanced Java for LLD-minded engineers.',
  theory: [
    'HashMap stores Entry/Node objects in an array of buckets. index ≈ (n - 1) & hash.',
    'hash() mixes key.hashCode() (spreads bits) so poor hashCodes still distribute better.',
    'Collisions: multiple keys in one bucket form a linked list; at thresholds (Java 8+) long bins treeify into red-black trees when keys are Comparable.',
    'Load factor default 0.75: when size > capacity * loadFactor, the table resizes (power-of-two growth) and rebins.',
    'One null key allowed; null values allowed. Iteration order is undefined (use LinkedHashMap for insertion order).',
    'Not thread-safe; ConcurrentHashMap for concurrency. Concurrent modification during iterate → fail-fast CME on wrappers/iterators.',
  ],
  mentalModel:
    'A HashMap is a hallway of numbered lockers (buckets). hashCode picks a locker; equals finds the right coat on the hook. Too many coats on one hook → messy list, then a sorted tree. When the hallway overflows, build a bigger hallway and rehang coats.',
  codeTitle: 'Custom key proving hashCode/equals matter',
  code: `import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class HashMapInternalsDemo {
    static class UserId {
        final int id;
        UserId(int id) { this.id = id; }

        @Override
        public boolean equals(Object o) {
            return o instanceof UserId u && u.id == id;
        }

        @Override
        public int hashCode() {
            return Objects.hash(id);
        }

        @Override
        public String toString() {
            return "UserId(" + id + ")";
        }
    }

    public static void main(String[] args) {
        Map<UserId, String> map = new HashMap<>();
        UserId a = new UserId(7);
        map.put(a, "Ada");
        System.out.println(map.get(new UserId(7))); // logical same key
        System.out.println("size=" + map.size());

        // Collision demo with deliberately weak hash (educational only)
        Map<Integer, String> toy = new HashMap<>(4, 0.75f);
        for (int i = 0; i < 8; i++) {
            toy.put(i * 4, "v" + i); // many share low bits → more collisions
        }
        System.out.println("toy size=" + toy.size());
    }
}`,
  output: `Ada
size=1
toy size=8`,
  explain: [
    'get(new UserId(7)) succeeds because equals/hashCode define value identity for keys.',
    'Without those overrides, get would return null — different instance, default identity equality.',
    'Resizing and bin layout are internal; your contract is correct hashCode/equals and immutability of key fields.',
  ],
  mistakes: [
    'Using mutable keys and changing fields after put.',
    'Assuming HashMap is sorted or concurrent.',
    'Implementing hashCode as a constant — correctness OK-ish, performance dies (one giant bucket).',
  ],
  interviewAsk: 'Explain how HashMap get works and what happens on hash collisions.',
  interviewAnswer:
    'Compute the key’s mixed hash, index into the table, then scan the bin: for a list, walk nodes comparing hash then equals; for a tree bin, use hash/comparable ordering then equals. If the table exceeds the load-factor threshold, it resizes to a larger power-of-two capacity and redistributes nodes. Collisions are expected; good hashCodes keep bins short.',
  interviewTraps: [
    'Saying HashMap uses open addressing only (Java’s is separate chaining / tree bins).',
    'Claiming equals is not needed if hashCodes match.',
  ],
  quiz: [
    {
      question: 'Default HashMap load factor is…',
      options: ['0.25', '0.5', '0.75', '1.0'],
      correctIndex: 2,
      explain: '0.75 balances space and collision frequency.',
    },
    {
      question: 'Why can HashMap degrade if hashCode is always 42?',
      options: [
        'It will not compile',
        'All keys land in one bucket — lookups become linear/tree-heavy',
        'equals is ignored',
        'null keys become forbidden',
      ],
      correctIndex: 1,
      explain: 'Distribution fails; every get may scan a huge bin.',
    },
  ],
  practice:
    'Write two versions of a key class — good equals/hashCode vs broken hashCode — put 10_000 entries and compare get timing roughly with System.nanoTime.',
  practiceHints: [
    'Broken: return 1; from hashCode.',
    'Warm up a bit before measuring.',
  ],
  deepDive: [
    'Java 8 treeify threshold is 8 nodes in a bin (and untreeify on shrink) — details evolve; speak to the idea in interviews.',
    'HashMap capacity is always a power of two so index can use bit mask instead of modulo.',
  ],
});
