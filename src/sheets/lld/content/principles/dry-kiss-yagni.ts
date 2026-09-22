import { lesson } from '../lessonFactory';

export default lesson({
  id: 'principles-dry-kiss-yagni',
  title: 'DRY, KISS, and YAGNI',
  section: 'principles',
  chapter: 'Design Principles',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['oop-coupling-cohesion'],
  summary:
    'Don’t Repeat Yourself, Keep It Simple, You Aren’t Gonna Need It — balance duplication, simplicity, and premature features.',
  keywords: ['DRY', 'KISS', 'YAGNI', 'duplication', 'simplicity'],
  why: `These three slogans appear in every design review. Misapplied DRY creates tangled abstractions; ignored DRY creates copy-paste bugs. KISS and YAGNI stop interview solutions from becoming framework demos. Judgment is knowing which slogan wins in the moment.`,
  theory: [
    'DRY: every piece of knowledge should have a single, authoritative representation. Duplicated business rules are the real enemy — not every repeated brace.',
    'AHA (Avoid Hasty Abstractions) tempers DRY: wait until duplication reveals a real shared concept.',
    'KISS: prefer straightforward control flow and names over cleverness. Simple code is easier to debug under interview time pressure.',
    'YAGNI: do not build speculative features, config knobs, or plugin systems for imagined futures.',
    'Tension: DRY wants extraction; YAGNI/KISS resist premature extraction. Resolve by asking “is this the same knowledge?” and “do we have two real callers?”',
    'In LLD: model the asked use cases fully; mention extensions verbally instead of coding them all.',
  ],
  mentalModel: `DRY = one source of truth for a rule. KISS = the boring path a teammate can follow at 2am. YAGNI = don’t pack for a trip you haven’t booked.`,
  moreExamples: [
    {
      title: 'Bad DRY vs good DRY',
      code: `// Coincidence, not knowledge — forcing one function is false DRY
int areaRect(int w, int h) { return w * h; }
int weeklyPay(int hours, int rate) { return hours * rate; } // same shape, different meaning

// Real duplication of knowledge — fix with DRY
class BadShipping {
    int cost(String country) {
        if (country.equals("IN")) return 50;
        if (country.equals("US")) return 200;
        return 100;
    }
    int etaDays(String country) {
        if (country.equals("IN")) return 3;  // country rules repeated
        if (country.equals("US")) return 10;
        return 7;
    }
}

record ShipRule(int cost, int etaDays) {}

class GoodShipping {
    private static final java.util.Map<String, ShipRule> RULES = java.util.Map.of(
        "IN", new ShipRule(50, 3),
        "US", new ShipRule(200, 10)
    );
    private static final ShipRule DEFAULT = new ShipRule(100, 7);

    ShipRule rule(String country) {
        return RULES.getOrDefault(country, DEFAULT);
    }
}

public class Demo {
    public static void main(String[] args) {
        GoodShipping s = new GoodShipping();
        ShipRule r = s.rule("IN");
        System.out.println("cost=" + r.cost() + " eta=" + r.etaDays());
    }
}`,
      output: `cost=50 eta=3`,
      explain: [
        'Multiplying ints in two domains is not automatically DRY violation.',
        'Country shipping policy was duplicated knowledge — one map fixes both cost and ETA.',
      ],
    },
    {
      title: 'YAGNI / KISS — lean vs speculative',
      code: `// YAGNI violation for a kata that only needs in-memory store
interface AbstractFactoryOfRepositoriesForFutureCloudProviders {}

// KISS enough
final class TodoList {
    private final java.util.List<String> items = new java.util.ArrayList<>();
    void add(String item) { items.add(item); }
    int size() { return items.size(); }
}

public class KissDemo {
    public static void main(String[] args) {
        TodoList list = new TodoList();
        list.add("ship MVP");
        System.out.println("n=" + list.size());
    }
}`,
      output: `n=1`,
      explain: [
        'No cloud repository factory until there is a second storage need.',
        'TodoList is obvious — KISS wins for the stated scope.',
      ],
    },
  ],
  mistakes: [
    'DRY by coupling unrelated features into a shared “Util”.',
    'Clever one-liners that fail KISS for readers.',
    'Building feature flags and SPI for a weekend script (YAGNI).',
    'Copy-pasting critical validation in five controllers (true DRY miss).',
  ],
  interviewAsk: 'How do DRY, KISS, and YAGNI interact when you design?',
  interviewAnswer:
    'I remove duplication of business knowledge (DRY) without hasty abstractions. I keep the design boring and readable (KISS). I implement only required use cases and note optional extensions (YAGNI). If a second real variant appears, I extract — not before.',
  interviewTraps: [
    'Treating any similar-looking code as mandatory to merge.',
    'Using YAGNI to skip error handling for required paths.',
  ],
  quiz: {
    question: 'Two methods both multiply two ints for unrelated domain meanings. Best action?',
    options: [
      'Always extract multiply(a,b) immediately',
      'Leave them; shared arithmetic shape ≠ shared knowledge',
      'Delete both methods',
      'Wrap in AbstractFactory',
    ],
    correctIndex: 1,
    explain: 'DRY targets shared knowledge/rules, not coincidental similar code.',
  },
  practice:
    'Find false DRY and real DRY in a snippet that shares a tax rate constant in three places and also shares a loop pattern for printing. What do you extract?',
  practiceHints: [
    'Extract TaxPolicy or a constant for the rate; leave trivial loops alone.',
  ],
});
