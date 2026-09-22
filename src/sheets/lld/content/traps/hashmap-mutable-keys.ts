import { lesson } from '../lessonFactory';

export default lesson({
  id: 'trap-hashmap-mutable-keys',
  title: 'Trap: Mutable Keys in HashMap',
  section: 'traps',
  chapter: 'Java Pitfalls',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['trap-equals-hashcode'],
  summary:
    'Mutating fields that participate in hashCode/equals after inserting a key corrupts the map — lookups fail mysteriously.',
  keywords: ['hashmap', 'mutable key', 'hashCode', 'trap'],
  why:
    'Domain objects used as map keys (SessionId wrappers, composite keys) are dangerous if mutable. This trap pairs with equals/hashCode and shows up in caching designs.',
  theory: [
    'HashMap places keys into buckets by hashCode at insert time.',
    'If key mutation changes hashCode, the map looks in a different bucket on get — entry appears lost.',
    'equals may also change meaning mid-life — broken identity.',
    'Rule: map keys should be immutable value objects.',
    'If you must use mutable objects, never mutate key fields while the entry is in the map (or remove-then-reinsert).',
    'records with final components are good key candidates if components are immutable.',
  ],
  mentalModel:
    'You check a coat (value) into a locker numbered by your name tag’s hash. Mid-day you rewrite your name tag. When you return, you look in a different locker and think the coat vanished — it is still in the old locker.',
  codeTitle: 'Lost entry after mutating key',
  code: `import java.util.*;

class MutableKey {
    int id;
    MutableKey(int id) { this.id = id; }
    public boolean equals(Object o) {
        return o instanceof MutableKey k && id == k.id;
    }
    public int hashCode() { return id; }
}

public class Demo {
    public static void main(String[] args) {
        Map<MutableKey, String> map = new HashMap<>();
        MutableKey key = new MutableKey(1);
        map.put(key, "alpha");
        System.out.println("before=" + map.get(key));
        key.id = 2; // mutates hashCode
        System.out.println("after get mutated=" + map.get(key));
        System.out.println("get with id1=" + map.get(new MutableKey(1)));
        System.out.println("contains value=" + map.containsValue("alpha"));
    }
}`,
  output: `before=alpha
after get mutated=null
get with id1=null
contains value=true`,
  explain: [
    'Value still in map, but not findable by new hash.',
    'Looking up MutableKey(1) also fails — bucket no longer matches.',
    'containsValue proves data is not deleted — only unreachable via key.',
  ],
  mistakes: [
    'Using entities with setters as keys.',
    'Including mutable collections in key hashCode.',
    'Fixing symptoms by only calling clear() periodically.',
  ],
  interviewAsk: 'Why should HashMap keys be immutable?',
  interviewAnswer:
    'Because bucket location depends on hashCode at insertion. Mutating key fields used in hashCode/equals breaks retrieval. Use immutable key types; treat entities carefully — prefer IDs as keys.',
  interviewTraps: [
    'Blaming HashMap as buggy.',
  ],
  quiz: {
    question: 'After mutating a key’s hashCode fields in place, map.get(key) often returns:',
    options: ['The value', 'null / miss', 'Always throws', 'Deletes all entries'],
    correctIndex: 1,
    explain: 'Lookup uses the new hash bucket; the entry remains stranded.',
  },
  practice:
    'Replace MutableKey with a record Key(int id) and show stable lookups. Then list 3 domain fields that should never be part of a key.',
  practiceHints: [
    'Avoid timestamps, counters, mutable status enums in keys.',
    'Prefer stable business identifiers.',
  ],
});
