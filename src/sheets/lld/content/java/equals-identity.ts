import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-equals-identity',
  title: 'equals vs Identity (==)',
  section: 'java',
  chapter: 'Memory & Object Model',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-new-null-npe'],
  summary:
    '== compares primitive values or reference identity; equals defines logical equality — override equals and hashCode together.',
  keywords: ['equals', 'hashCode', 'identity', '==', 'contract'],
  why: 'Broken equals/hashCode causes HashMap/HashSet bugs that look like "random" lost entries. Interviewers probe this relentlessly because it reveals object-model maturity.',
  theory: [
    'For primitives, == compares values. For references, == asks "same object in memory?"',
    'Object.equals(Object) default is identity (==). Many classes override for value equality (String, Integer, List, records).',
    'equals contract: reflexive, symmetric, transitive, consistent, and false for null.',
    'If you override equals, you must override hashCode so equal objects have equal hash codes — required by HashMap/HashSet.',
    'Prefer Objects.equals(a,b) for null-safe equality. For sorting, Comparable/Comparator is a separate story from equals (but consistency is desirable).',
    'String pool: literals may be interned so == sometimes looks equal — never rely on == for String content.',
  ],
  mentalModel:
    '== is "same sticky note address." equals is "same meaning according to the class." Hash-based collections trust your hashCode to match that meaning.',
  codeTitle: 'Identity vs equality and the hash contract',
  code: `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class EqualsDemo {
    static class Money {
        final String currency;
        final int cents;

        Money(String currency, int cents) {
            this.currency = currency;
            this.cents = cents;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Money m)) return false;
            return cents == m.cents && Objects.equals(currency, m.currency);
        }

        @Override
        public int hashCode() {
            return Objects.hash(currency, cents);
        }
    }

    public static void main(String[] args) {
        Money a = new Money("USD", 500);
        Money b = new Money("USD", 500);
        System.out.println("== " + (a == b));
        System.out.println("equals " + a.equals(b));

        Set<Money> set = new HashSet<>();
        set.add(a);
        System.out.println("contains b? " + set.contains(b));

        String s1 = "hi";
        String s2 = new String("hi");
        System.out.println("String == " + (s1 == s2));
        System.out.println("String equals " + s1.equals(s2));
    }
}`,
  output: `== false
equals true
contains b? true
String == false
String equals true`,
  explain: [
    'a and b are distinct objects (different identity) but equal by value.',
    'HashSet.find uses hashCode then equals — without a correct pair, contains(b) would fail.',
    'new String("hi") bypasses sharing with the literal; content equals still holds.',
  ],
  mistakes: [
    'Overriding equals but not hashCode (or using mutable fields in both while keys sit in a HashMap).',
    'Using == for Integer outside the cached range (−128..127) and thinking values always match.',
    'Asymmetric equals with inheritance (instanceof pitfalls) — prefer composition or careful designs.',
  ],
  interviewAsk: 'What is the equals/hashCode contract?',
  interviewAnswer:
    'If a.equals(b) then a.hashCode() == b.hashCode(). Unequal objects may share a hash (collision). equals must be an equivalence relation and handle null. Hash-based collections rely on this; breaking it causes lost or duplicate logical entries.',
  interviewTraps: [
    'Implementing equals with == only and calling it value equality.',
    'Using float fields carelessly (NaN) or mutable keys in HashMap.',
  ],
  quiz: [
    {
      question: 'Two distinct Money objects with same fields — a == b?',
      options: ['true', 'false', 'Depends on hashCode', 'Compilation error'],
      correctIndex: 1,
      explain: '== is identity; distinct new instances are not the same object.',
    },
    {
      question: 'You override equals but forget hashCode. What breaks?',
      options: [
        'Nothing ever',
        'HashMap/HashSet logical lookup may fail',
        'The compiler rejects the class',
        'Only TreeMap',
      ],
      correctIndex: 1,
      explain: 'Hash containers bucket by hashCode before equals.',
    },
  ],
  practice:
    'Create a PhoneNumber class with area+line; put instances in a HashSet; prove that equals/hashCode make duplicates collapse; then break hashCode intentionally and observe contains fail.',
  practiceHints: [
    'Use Objects.hash for a correct implementation first.',
    'Return a constant hashCode as the broken version to see bucket behavior still work but note performance; better: return random/unstable hash for drama.',
  ],
});
