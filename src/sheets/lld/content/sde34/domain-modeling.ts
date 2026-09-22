import { lesson } from '../lessonFactory';

export default lesson({
  id: 'sde34-domain-modeling',
  title: 'Domain Modeling for SDE-3/4',
  section: 'sde34',
  chapter: 'Senior LLD',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['lld-methodology', 'trap-solid-overengineering'],
  summary:
    'Model invariants, aggregates, and bounded contexts — design for change with ubiquitous language, not anemic DTOs pretending to be a domain.',
  keywords: ['domain modeling', 'aggregates', 'invariants', 'ddd', 'sde3'],
  why:
    'Senior LLD is judged on whether your model protects business rules. If any controller can set order.status = SHIPPED, you do not have a domain — you have a database mirror.',
  theory: [
    'Start from language of the business: Order, PaymentAuthorization, SeatHold — not Table1/Row.',
    'Invariants belong inside aggregates: e.g., Order cannot ship without payment capture.',
    'Aggregate root is the consistency boundary for transactional writes.',
    'Distinguish entities (identity) vs value objects (Money, Email) — value objects immutable.',
    'Anemic domain model anti-pattern: bags of getters/setters + all rules in services.',
    'Rich model: methods express verbs — order.pay(), inventory.reserve().',
    'Bounded contexts: Catalog vs Checkout vs Fulfillment may use different “Product” meanings — do not force one mega model.',
    'Map to persistence last; do not let ORM dictate the model.',
  ],
  mentalModel:
    'A domain model is a rulebook with characters, not a spreadsheet. The Order character refuses illegal plot twists. Services are stage directors — they do not rewrite the rulebook mid-scene.',
  codeTitle: 'Invariant-protecting Order aggregate sketch',
  code: `import java.util.*;

enum OrderStatus { NEW, PAID, SHIPPED, CANCELED }

final class Money {
    final int paise;
    Money(int paise) {
        if (paise < 0) throw new IllegalArgumentException();
        this.paise = paise;
    }
}

class Order {
    private final String id;
    private OrderStatus status = OrderStatus.NEW;
    private final List<String> items;
    private Money paid = new Money(0);

    Order(String id, List<String> items) {
        this.id = id;
        this.items = List.copyOf(items);
        if (items.isEmpty()) throw new IllegalArgumentException("empty");
    }

    void pay(Money amount) {
        if (status != OrderStatus.NEW) throw new IllegalStateException(status.name());
        this.paid = amount;
        this.status = OrderStatus.PAID;
    }

    void ship() {
        if (status != OrderStatus.PAID) throw new IllegalStateException("pay first");
        status = OrderStatus.SHIPPED;
    }

    void cancel() {
        if (status == OrderStatus.SHIPPED) throw new IllegalStateException("shipped");
        status = OrderStatus.CANCELED;
    }

    OrderStatus status() { return status; }
}

public class Demo {
    public static void main(String[] args) {
        Order o = new Order("O1", List.of("sku-1"));
        try { o.ship(); } catch (Exception e) { System.out.println(e.getMessage()); }
        o.pay(new Money(500));
        o.ship();
        System.out.println(o.status());
    }
}`,
  output: `pay first
SHIPPED`,
  explain: [
    'Illegal transitions throw — invariants live on the aggregate.',
    'Money rejects negative values as a value object.',
    'No public setStatus — that would dissolve the model.',
  ],
  mermaid: `classDiagram
    class Order {
      -status
      +pay(money)
      +ship()
      +cancel()
    }
    class Money {
      +paise
    }
    Order --> Money
    note for Order "Aggregate root enforces invariants"`,
  mistakes: [
    'Public setters for every field including status.',
    'One shared “Product” entity across all contexts with conflicting meanings.',
    'Pushing every rule to the database “so we are safe” without a model language.',
  ],
  interviewAsk: 'How do you keep an LLD from becoming an anemic model?',
  interviewAnswer:
    'Identify critical invariants and encode them as methods on aggregate roots. Use value objects for validated quantities. Keep application services for orchestration/transactions, not for rewriting business rules. Show a forbidden operation and how the model rejects it. Mention bounded contexts when the problem spans domains.',
  interviewTraps: [
    'Only drawing tables.',
    'Equating DDD ceremony with usefulness — apply lightly when it pays off.',
  ],
  quiz: {
    question: 'An aggregate root should primarily:',
    options: [
      'Expose all fields publicly',
      'Protect invariants and be the write entry point for its cluster',
      'Replace the need for databases',
      'Be a Singleton',
    ],
    correctIndex: 1,
    explain: 'Consistency boundary and invariant protection define aggregates.',
  },
  practice:
    'Model SeatHold for a ticket booking domain: hold(ttl), confirm(), expire(). Forbid confirm after expire. Write failing calls as test-like main prints.',
  practiceHints: [
    'Store expiresAt Instant.',
    'confirm checks now.isBefore(expiresAt) and status.',
  ],
  deepDive: [
    'Event-carried state transfer between contexts beats shared databases.',
    'Snapshot + event sourcing is optional — do not propose it unless forces demand audit/rebuild.',
  ],
});
