import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-strategy',
  title: 'Strategy Pattern',
  section: 'patterns',
  chapter: 'Behavioral',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'Define a family of interchangeable algorithms, encapsulate each one, and make them swappable at runtime — replace conditionals with composition.',
  keywords: ['strategy', 'policy', 'behavioral', 'open-closed'],
  why:
    'Strategy is the workhorse of clean LLD: payment methods, pricing rules, sort orders, retry policies. Interviewers expect you to extract if/else algorithm families into Strategy objects.',
  theory: [
    'Intent: encapsulate algorithms behind a common interface; context delegates to a strategy.',
    'Replaces large conditional blocks that select behavior.',
    'Context holds a Strategy reference; can change strategy at runtime.',
    'Aligns with Open/Closed and Prefer Composition over Inheritance.',
    'Functional version in Java: pass a lambda/method reference as the strategy.',
    'vs State: Strategy is chosen by the client/context for an algorithm; State transitions are driven by internal lifecycle. Strategies are usually peer alternatives; states form a graph.',
    'vs Template Method: Strategy uses delegation/composition; Template Method uses inheritance hooks.',
  ],
  mentalModel:
    'GPS navigation: the trip context is “get me there.” Strategies are Car, Bike, Transit routes. You can switch mode mid-plan without rewriting the trip object — only the routing algorithm changes.',
  codeTitle: 'Checkout pricing Strategy',
  code: `interface PricingStrategy {
    int quote(int basePaise);
}

class RegularPricing implements PricingStrategy {
    public int quote(int basePaise) { return basePaise; }
}

class MemberPricing implements PricingStrategy {
    public int quote(int basePaise) { return (int)(basePaise * 0.9); }
}

class FestivalPricing implements PricingStrategy {
    public int quote(int basePaise) { return (int)(basePaise * 0.8); }
}

class Cart {
    private PricingStrategy pricing = new RegularPricing();
    private int basePaise;

    Cart(int basePaise) { this.basePaise = basePaise; }

    void setPricing(PricingStrategy pricing) {
        this.pricing = pricing;
    }

    int total() {
        return pricing.quote(basePaise);
    }
}

public class Demo {
    public static void main(String[] args) {
        Cart cart = new Cart(10000);
        System.out.println(cart.total());
        cart.setPricing(new MemberPricing());
        System.out.println(cart.total());
        cart.setPricing(new FestivalPricing());
        System.out.println(cart.total());
    }
}`,
  output: `10000
9000
8000`,
  explain: [
    'Cart does not contain discount if/else — it delegates.',
    'New pricing schemes are new classes (or lambdas).',
    'Runtime swap via setPricing.',
  ],
  mermaid: `classDiagram
    class Cart {
      -PricingStrategy pricing
      +setPricing(s)
      +total()
    }
    class PricingStrategy {
      <<interface>>
      +quote(base)
    }
    Cart --> PricingStrategy
    PricingStrategy <|.. RegularPricing
    PricingStrategy <|.. MemberPricing
    PricingStrategy <|.. FestivalPricing`,
  mistakes: [
    'Creating a strategy interface with only one implementation forever — YAGNI.',
    'Putting context-specific state into strategies incorrectly so they become unreusable.',
    'Strategy explosion for tiny one-line differences — a function parameter may suffice.',
  ],
  interviewAsk: 'Show how Strategy removes conditionals and when you would still use a switch.',
  interviewAnswer:
    'Extract each algorithm branch into a Strategy implementation; context depends on the interface. Keep a simple switch/factory to select the strategy from config/enum if the set is closed and small. Prefer registry/DI when strategies are pluggable. Contrast with State if behavior changes are lifecycle-driven.',
  interviewTraps: [
    'Confusing Strategy with State.',
    'Over-abstracting a single algorithm.',
  ],
  quiz: {
    question: 'Strategy’s key idea is:',
    options: [
      'One global instance of an algorithm',
      'Interchangeable algorithms behind a shared interface',
      'Building objects step by step',
      'Adapting incompatible interfaces',
    ],
    correctIndex: 1,
    explain: 'Interchangeable encapsulated algorithms are the point of Strategy.',
  },
  practice:
    'Implement CompressionStrategy with Zip and Gzip. A FileUploader accepts a strategy and prints which algorithm ran.',
  practiceHints: [
    'Uploader.compressAndUpload(bytes) delegates to strategy.compress.',
    'Try swapping strategies without changing Uploader.',
  ],
});
