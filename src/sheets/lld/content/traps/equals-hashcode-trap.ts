import { lesson } from '../lessonFactory';

export default lesson({
  id: 'trap-equals-hashcode',
  title: 'Trap: equals/hashCode Contract',
  section: 'traps',
  chapter: 'Java Pitfalls',
  difficulty: 'intermediate',
  importance: 3,
  summary:
    'If you override equals you must override hashCode — break the contract and HashMap/HashSet silently misbehave.',
  keywords: ['equals', 'hashCode', 'hashmap', 'contract', 'trap'],
  why:
    'This trap shows up in LLD when you put domain objects in sets/maps (Users, Spots, Tickets). Interviews love a quick “what’s wrong with this equals?” puzzle.',
  theory: [
    'Contract: equal objects must have equal hashCodes; unequal objects should preferably have different hashCodes.',
    'equals must be reflexive, symmetric, transitive, consistent, and false for null.',
    'Default Object equals is reference identity; default hashCode is identity-based.',
    'Breaking only equals → two logical equals land in different hash buckets and HashSet allows “duplicates.”',
    'Mutable fields used in equals/hashCode → object lost in HashMap if mutated after insert.',
    'Prefer Objects.equals, Objects.hash, or records which generate both.',
  ],
  mentalModel:
    'HashMap is a building of numbered rooms (buckets). hashCode picks the room; equals checks who is already inside. If twins claim different room numbers, the front desk never realizes they are the same person.',
  codeTitle: 'Broken hashCode → duplicate logic',
  code: `import java.util.*;

class UserBroken {
    final String id;
    UserBroken(String id) { this.id = id; }
    public boolean equals(Object o) {
        return o instanceof UserBroken u && id.equals(u.id);
    }
    // hashCode NOT overridden — trap
}

class UserOk {
    final String id;
    UserOk(String id) { this.id = id; }
    public boolean equals(Object o) {
        return o instanceof UserOk u && id.equals(u.id);
    }
    public int hashCode() { return id.hashCode(); }
}

public class Demo {
    public static void main(String[] args) {
        Set<UserBroken> bad = new HashSet<>();
        bad.add(new UserBroken("1"));
        bad.add(new UserBroken("1"));
        System.out.println("broken size=" + bad.size());

        Set<UserOk> ok = new HashSet<>();
        ok.add(new UserOk("1"));
        ok.add(new UserOk("1"));
        System.out.println("ok size=" + ok.size());
    }
}`,
  output: `broken size=2
ok size=1`,
  explain: [
    'Both UserBroken instances are equal but different hashCodes (identity) → both enter the set.',
    'UserOk shares hashCode with equals fields → set dedupes.',
    'Same bug appears as “cannot find key I just put” in HashMap.',
  ],
  mistakes: [
    'Overriding equals alone.',
    'Using mutable fields in hashCode and mutating after insert.',
    'Asymmetric equals with inheritance (instanceof vs getClass debates) — know the tradeoff.',
  ],
  interviewAsk: 'What happens if equals is overridden but not hashCode?',
  interviewAnswer:
    'You violate the contract. Hash-based collections may store multiple logical duplicates or fail to find keys. Always override both, using the same significant fields. Mention records and caution with mutability.',
  interviewTraps: [
    'Saying “HashMap will throw” — it usually fails silently.',
  ],
  quiz: {
    question: 'Equal objects must:',
    options: [
      'Be the same reference',
      'Have the same hashCode',
      'Have different hashCodes',
      'Be Serializable',
    ],
    correctIndex: 1,
    explain: 'The equals/hashCode contract requires equal objects → equal hashCodes.',
  },
  practice:
    'Implement Money(amount, currency) as a value object with correct equals/hashCode. Show it works as a HashMap key.',
  practiceHints: [
    'Include both fields in equals and hashCode.',
    'Keep fields final.',
  ],
});
