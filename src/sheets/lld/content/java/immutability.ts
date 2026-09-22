import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-immutability',
  title: 'Immutability',
  section: 'java',
  chapter: 'Object Model Advanced',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-object-class'],
  summary:
    'Immutable objects never change after construction — safer sharing, simpler reasoning, excellent map keys, and thread-friendly by design.',
  keywords: ['immutable', 'defensive copy', 'value object', 'String', 'record'],
  why: 'Mutable shared state is the root of many concurrency and HashMap key bugs. Value objects (Money, Date ranges, IDs) should usually be immutable in LLD.',
  theory: [
    'Recipe: private final fields; no setters; fail-fast constructors; do not expose mutable internals; class often final (or sealed/record).',
    'If a field is a mutable type (List, Date, array), store a defensive copy and return unmodifiable/copy on read.',
    'String, boxed primitives, and java.time types are immutable — prefer them over Date/Calendar.',
    'Persistent-style updates: withX(...) returns a new instance instead of mutating.',
    'Benefits: thread-safe sharing without locks, reliable hashCode, easier caching, simpler mental model.',
    'Costs: allocation pressure if you create many variants — often fine; profile before micro-optimizing.',
  ],
  mentalModel:
    'An immutable object is a published book: editions are new copies. You never scribble on a shipped page; you print a revised edition.',
  codeTitle: 'Immutable Money with safe "updates"',
  code: `import java.util.Objects;

public class ImmutabilityDemo {
    static final class Money {
        private final String currency;
        private final int cents;

        Money(String currency, int cents) {
            this.currency = Objects.requireNonNull(currency);
            if (cents < 0) throw new IllegalArgumentException("cents");
            this.cents = cents;
        }

        Money plus(Money other) {
            if (!currency.equals(other.currency)) {
                throw new IllegalArgumentException("currency mismatch");
            }
            return new Money(currency, cents + other.cents);
        }

        int cents() { return cents; }
        String currency() { return currency; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Money m)) return false;
            return cents == m.cents && currency.equals(m.currency);
        }

        @Override
        public int hashCode() {
            return Objects.hash(currency, cents);
        }

        @Override
        public String toString() {
            return currency + " " + cents + "c";
        }
    }

    public static void main(String[] args) {
        Money a = new Money("INR", 10000);
        Money b = a.plus(new Money("INR", 2500));
        System.out.println("a=" + a);
        System.out.println("b=" + b);
    }
}`,
  output: `a=INR 10000c
b=INR 12500c`,
  explain: [
    'plus does not mutate a — it returns a new Money.',
    'a remains 10000c after creating b — safe to share a freely.',
    'equals/hashCode make Money a good HashMap key.',
  ],
  mistakes: [
    'Storing a client-supplied ArrayList into a final field without copying.',
    'Mutable java.util.Date fields labeled "immutable object."',
    'Using mutable objects as HashMap keys then changing fields used by hashCode.',
  ],
  interviewAsk: 'How do you make a Java class immutable?',
  interviewAnswer:
    'Make the class final (or otherwise unextendable), mark all fields private final, initialize them in the constructor with validation, perform defensive copies for mutable inputs/outputs, provide no mutators, and ensure methods that "change" state return new instances. Override equals/hashCode/toString appropriately for value types.',
  interviewTraps: [
    'Only adding final to a reference to a List.',
    'Forgetting defensive copies for arrays.',
  ],
  quiz: {
    question: 'Why are immutable objects good HashMap keys?',
    options: [
      'They are always smaller',
      'Their hashCode/equals stay stable while in the map',
      'HashMap rejects mutable keys at compile time',
      'They cannot implement hashCode',
    ],
    correctIndex: 1,
    explain: 'Mutating a key’s equality-relevant state loses it in the map.',
  },
  practice:
    'Implement an immutable Interval(start, end) that rejects end < start and provides overlap(Interval) returning boolean without mutating either instance.',
  practiceHints: [
    'Use int or java.time.Instant.',
    'Add a span() method returning a new duration value.',
  ],
});
