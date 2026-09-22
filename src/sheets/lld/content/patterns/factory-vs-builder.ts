import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-factory-vs-builder',
  title: 'Factory vs Builder',
  section: 'patterns',
  chapter: 'Comparisons',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-factory-method', 'pattern-builder'],
  summary:
    'Factories decide which type to create; Builders decide how to assemble a complex instance with many optional parts.',
  keywords: ['factory', 'builder', 'creational', 'comparison'],
  why:
    'Candidates often say “use a factory/builder” interchangeably. Precision shows design maturity: subtype selection vs stepwise construction.',
  theory: [
    'Factory (simple/method/abstract): emphasis on polymorphism — which concrete class.',
    'Builder: emphasis on construction process — configuring many fields/parts, often for one type (or related representations).',
    'Factory returns a ready object in one call; Builder accumulates config then build().',
    'Abstract Factory creates families; Builder can still be used inside a factory for complex members.',
    'Immutability: Builder shines for objects with many finals; Factory shines for hiding constructors of subclasses.',
    'Rule of thumb: if the signature would be create(type, a, b, c, d, e, f) with many optionals → Builder. If create(type) switches subclasses → Factory.',
  ],
  mentalModel:
    'Factory is a vending machine button: Cola vs Water — which product. Builder is a Subway sandwich artist: same “sandwich” type, dozens of topping choices assembled step by step.',
  codeTitle: 'Choosing the right creational tool',
  code: `interface Shape { String draw(); }
class Circle implements Shape {
    public String draw() { return "circle"; }
}
class Square implements Shape {
    public String draw() { return "square"; }
}

class ShapeFactory {
    static Shape create(String type) {
        if ("circle".equals(type)) return new Circle();
        if ("square".equals(type)) return new Square();
        throw new IllegalArgumentException(type);
    }
}

final class Sandwich {
    final String bread;
    final boolean cheese;
    final boolean mayo;
    private Sandwich(Builder b) {
        bread = b.bread; cheese = b.cheese; mayo = b.mayo;
    }
    static class Builder {
        private final String bread;
        private boolean cheese;
        private boolean mayo;
        Builder(String bread) { this.bread = bread; }
        Builder cheese(boolean v) { cheese = v; return this; }
        Builder mayo(boolean v) { mayo = v; return this; }
        Sandwich build() { return new Sandwich(this); }
    }
    public String summary() {
        return bread + " cheese=" + cheese + " mayo=" + mayo;
    }
}

public class Demo {
    public static void main(String[] args) {
        System.out.println(ShapeFactory.create("circle").draw());
        Sandwich s = new Sandwich.Builder("wheat").cheese(true).mayo(false).build();
        System.out.println(s.summary());
    }
}`,
  output: `circle
wheat cheese=true mayo=false`,
  explain: [
    'ShapeFactory selects subtype in one shot.',
    'Sandwich.Builder configures one product’s optional parts.',
    'Different questions: which vs how.',
  ],
  mermaid: `flowchart TB
    Q{What is hard?}
    Q -->|Which concrete class?| F[Factory]
    Q -->|Many optional fields / steps?| B[Builder]
    Q -->|Family of related products?| AF[Abstract Factory]`,
  mistakes: [
    'Builder that only wraps `new Foo()` with no optional config — useless ceremony.',
    'Factory method with 12 parameters — should be Builder or config object.',
    'Calling every static `of()` a Builder.',
  ],
  interviewAsk: 'Would you use Factory or Builder for an HTTP client request object?',
  interviewAnswer:
    'Builder (or a fluent request API) fits because URL/method/headers/body are optional configuration of one conceptual type. A factory might still choose RestClient vs WebClient implementations (which), while each client uses a builder for requests (how). Often both appear at different layers.',
  interviewTraps: [
    'Picking Builder for simple subtype switching.',
    'Picking Factory for telescoping constructors without discussing optionals.',
  ],
  quiz: {
    question: 'Many optional fields and immutability requirements point to:',
    options: ['Adapter', 'Builder', 'Observer', 'Proxy'],
    correctIndex: 1,
    explain: 'Builder excels at stepwise construction of immutable complex objects.',
  },
  practice:
    'Design Car creation two ways: CarFactory.create("SUV"|"Sedan") and Car.Builder with engine/color/sunroof. Explain which problem each solves.',
  practiceHints: [
    'Factory returns different subclasses.',
    'Builder configures one Car (or base) instance.',
  ],
});
