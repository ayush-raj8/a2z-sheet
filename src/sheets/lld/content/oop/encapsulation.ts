import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-encapsulation',
  title: 'Encapsulation',
  section: 'oop',
  chapter: 'Encapsulation',
  difficulty: 'intermediate',
  importance: 3,
  order: 1,
  prerequisites: ['oop-core-pillars'],
  summary:
    'Encapsulation bundles state with the methods that guard it — hide fields, expose a small valid API, protect invariants.',
  keywords: ['encapsulation', 'invariant', 'getter', 'setter', 'information hiding'],
  why: 'Without encapsulation, every client becomes responsible for your invariants — and will break them. LLD quality is mostly about what you refuse to expose.',
  theory: [
    'Encapsulation = information hiding + controlled access. Fields private; behavior public.',
    'Invariants are facts that must always be true (balance ≥ 0, email contains @). Enforce them in constructors and mutators.',
    'Getters are not automatically good — returning a live mutable List leaks encapsulation. Prefer defensive copies or unmodifiable views.',
    'Setters should validate or not exist; immutable objects need neither for many fields.',
    'Access modifiers are the language mechanism; package design and modules strengthen boundaries.',
    'Tell, Don’t Ask: prefer account.withdraw(x) over reading balance and mutating from outside.',
  ],
  mentalModel:
    'A capsule medicine: the shell hides the powder; you interact through a prescribed dose API. Ripping the shell open (public fields) lets anyone overdose the object.',
  codeTitle: 'Invariant-preserving account API',
  code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EncapsulationDemo {
    static class Order {
        private final List<String> items = new ArrayList<>();
        private int totalCents;

        public void addItem(String sku, int priceCents) {
            if (sku == null || sku.isBlank()) throw new IllegalArgumentException("sku");
            if (priceCents <= 0) throw new IllegalArgumentException("price");
            items.add(sku);
            totalCents += priceCents;
        }

        public int totalCents() {
            return totalCents;
        }

        public List<String> items() {
            return Collections.unmodifiableList(items);
        }
    }

    public static void main(String[] args) {
        Order order = new Order();
        order.addItem("BOOK", 1200);
        order.addItem("PEN", 200);
        System.out.println("total=" + order.totalCents());
        System.out.println("items=" + order.items());
        try {
            order.items().add("HACK");
        } catch (UnsupportedOperationException e) {
            System.out.println("encapsulation held: " + e.getClass().getSimpleName());
        }
    }
}`,
  output: `total=1400
items=[BOOK, PEN]
encapsulation held: UnsupportedOperationException`,
  explain: [
    'addItem is the only way to change state — total and items stay in sync.',
    'items() returns an unmodifiable view so callers cannot corrupt the list.',
    'No public fields; no setter for totalCents.',
  ],
  mistakes: [
    'public List<String> getItems() { return items; } — leakage.',
    'Anemic domain models: bags of getters/setters with all logic in services.',
    'Validating only in the UI, never in the domain object.',
  ],
  interviewAsk: 'Is providing getters and setters for every field encapsulation?',
  interviewAnswer:
    'Not really — that often exposes the same state with extra ceremony. Real encapsulation exposes meaningful operations that preserve invariants and hides representation. Sometimes you need getters; rarely do you need unrestricted setters for every field.',
  interviewTraps: [
    'Equating JavaBeans property patterns with good design always.',
    'Saying private fields alone are enough even if you return mutable internals.',
  ],
  quiz: {
    question: 'Returning the live internal ArrayList from a getter typically…',
    options: [
      'Improves performance only',
      'Breaks encapsulation because callers can mutate internals',
      'Is required by the language',
      'Makes the list immutable automatically',
    ],
    correctIndex: 1,
    explain: 'Callers can add/remove and violate invariants.',
  },
  practice:
    'Build a Temperature class storing Celsius privately with factory fromFahrenheit, getter asC/asF, and no setter that can set impossible absolute temperatures below 0 K.',
  practiceHints: [
    'Validate in the private constructor.',
    'Conversion math lives inside the class.',
  ],
});
