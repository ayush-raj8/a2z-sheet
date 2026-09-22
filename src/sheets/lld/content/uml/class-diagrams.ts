import { lesson } from '../lessonFactory';

export default lesson({
  id: 'uml-class-diagrams',
  title: 'UML Class Diagrams',
  section: 'uml',
  chapter: 'UML Diagrams',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['oop-relationships'],
  summary:
    'Read and draw class diagrams: classes, visibility, associations, aggregation, composition, generalization, and realization.',
  keywords: [
    'UML',
    'class diagram',
    'association',
    'generalization',
    'realization',
    'multiplicity',
  ],
  why: `In LLD interviews you communicate structure with boxes and arrows. Class diagrams are the shared language: interviewers sketch them, and you must read multiplicity, diamonds, and hollow triangles without freezing.`,
  theory: [
    'A class box has three compartments: name, attributes, operations (methods). Prefixes: + public, - private, # protected, ~ package.',
    'Association: solid line; multiplicity like 1, 0..1, *, 1..*. Roles can be named on either end.',
    'Aggregation: hollow diamond on the whole. Composition: filled diamond on the whole (strong ownership).',
    'Generalization (inheritance): solid line with hollow triangle pointing to the parent.',
    'Realization (implements interface): dashed line with hollow triangle pointing to the interface.',
    'Dependency: dashed arrow toward the type you use transiently. Keep diagrams focused — omit getters noise unless asked.',
  ],
  mentalModel: `A class diagram is a city map of types. Roads = relationships. Diamonds = ownership strength. Triangles = taxonomy (extends/implements). Multiplicity is the traffic capacity of each road.`,
  mermaid: `classDiagram
    direction TB
    class PaymentProcessor {
      <<interface>>
      +charge(amountCents) boolean
    }
    class StripeProcessor {
      -apiKey: String
      +charge(amountCents) boolean
    }
    class Order {
      -id: String
      -totalCents: int
      +checkout(processor) boolean
    }
    class OrderLine {
      -sku: String
      -qty: int
    }
    class Customer {
      -id: String
      -email: String
    }
    PaymentProcessor <|.. StripeProcessor : realization
    Order --> PaymentProcessor : dependency
    Customer "1" --> "*" Order : places
    Order "1" *-- "*" OrderLine : composition`,
  codeTitle: 'Java that matches the diagram',
  code: `import java.util.*;

interface PaymentProcessor {
    boolean charge(int amountCents);
}

class StripeProcessor implements PaymentProcessor {
    private final String apiKey;
    StripeProcessor(String apiKey) { this.apiKey = apiKey; }
    public boolean charge(int amountCents) {
        System.out.println("stripe keyLen=" + apiKey.length() + " amount=" + amountCents);
        return amountCents > 0;
    }
}

class OrderLine {
    private final String sku;
    private final int qty;
    OrderLine(String sku, int qty) { this.sku = sku; this.qty = qty; }
    int lineTotal(int unitCents) { return unitCents * qty; }
}

class Customer {
    private final String id;
    private final String email;
    Customer(String id, String email) { this.id = id; this.email = email; }
    String email() { return email; }
}

class Order {
    private final String id;
    private final Customer customer; // association
    private final List<OrderLine> lines = new ArrayList<>(); // composition
    private int totalCents;

    Order(String id, Customer customer) {
        this.id = id;
        this.customer = customer;
    }

    void addLine(String sku, int qty, int unitCents) {
        OrderLine line = new OrderLine(sku, qty); // owned by Order
        lines.add(line);
        totalCents += line.lineTotal(unitCents);
    }

    boolean checkout(PaymentProcessor processor) { // dependency
        System.out.println("customer=" + customer.email());
        return processor.charge(totalCents);
    }
}

public class Demo {
    public static void main(String[] args) {
        Customer c = new Customer("u1", "ada@ex.com");
        Order o = new Order("o1", c);
        o.addLine("book", 2, 500);
        boolean ok = o.checkout(new StripeProcessor("sk_test"));
        System.out.println("ok=" + ok);
    }
}`,
  output: `customer=ada@ex.com
stripe keyLen=7 amount=1000
ok=true`,
  explain: [
    'StripeProcessor realizes PaymentProcessor (dashed triangle in UML).',
    'Order *-- OrderLine: lines are created and owned by Order (composition).',
    'Customer → Order association: customer exists independently.',
    'checkout(PaymentProcessor) is a dependency on the interface, not a stored field in this sketch.',
  ],
  mistakes: [
    'Drawing every field and getter — diagrams become unreadable.',
    'Using filled diamond for shared/reusable parts (should be aggregation or association).',
    'Forgetting multiplicity — "Order has Customer" without 1 vs * confuses the model.',
    'Mixing sequence-diagram timing into class diagrams.',
  ],
  interviewAsk: 'On a class diagram, what do hollow vs filled diamonds mean?',
  interviewAnswer:
    'Both sit on the whole side of a whole–part relationship. Hollow diamond = aggregation (weak ownership; parts may outlive the whole). Filled diamond = composition (strong ownership; parts belong to the whole). A hollow triangle denotes generalization/realization depending on solid vs dashed line.',
  interviewTraps: [
    'Swapping diamond meanings.',
    'Saying interfaces use solid generalization — realization is dashed.',
  ],
  quiz: {
    question: 'A dashed line with a hollow triangle pointing to Printable means:',
    options: [
      'Class extends Printable',
      'Class realizes/implements Printable',
      'Composition of Printable',
      'Package dependency only',
    ],
    correctIndex: 1,
    explain: 'Dashed + hollow triangle = realization (implements an interface).',
  },
  practice:
    'Draw (or describe) a class diagram for a blogging system: User, Post, Comment, Tag. Mark composition vs association and multiplicities.',
  practiceHints: [
    'Post *-- Comment is often composition; Post → Tag often many-to-many association.',
    'User 1 --> * Post.',
  ],
});
