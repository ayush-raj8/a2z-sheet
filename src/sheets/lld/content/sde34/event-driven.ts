import { lesson } from '../lessonFactory';

export default lesson({
  id: 'sde34-event-driven',
  title: 'Event-Driven LLD',
  section: 'sde34',
  chapter: 'Senior LLD',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['pattern-observer', 'sde34-state-machines'],
  summary:
    'Domain events, outbox, async consumers, and coupling tradeoffs — when to go event-driven inside an LLD and what can go wrong.',
  keywords: ['domain events', 'outbox', 'async', 'coupling', 'sde4'],
  why:
    'Senior designs often need “after order paid, notify, allocate, analytics” without a transaction spanning the world. Events decouple — but introduce eventual consistency you must own in the interview.',
  theory: [
    'Domain event: something meaningful that happened — OrderPaid, SpotFreed — past tense, immutable facts.',
    'In-process: Observer/mediator bus for modular monoliths.',
    'Cross-process: message broker; prefer at-least-once + idempotent consumers.',
    'Transactional outbox: write state change + event row atomically; publisher relays to broker — avoids dual-write bugs.',
    'Consumers must tolerate duplicates and out-of-order (or use partitioning/version checks).',
    'When not to: simple CRUD with one user flow — sync may be clearer.',
    'Sagas/process managers coordinate multi-step workflows with compensating actions.',
  ],
  mentalModel:
    'A newspaper: the printing press (aggregate) records that something happened. Subscribers react on their own schedule. Sometimes the paper is delivered twice — readers (consumers) must not buy two coffees for one coupon (idempotency).',
  codeTitle: 'In-process domain events + simple outbox idea',
  code: `import java.util.*;

interface DomainEvent {
    String name();
}

record OrderPaid(String orderId, int paise) implements DomainEvent {
    public String name() { return "OrderPaid"; }
}

interface Handler {
    void on(DomainEvent e);
}

class EventBus {
    private final List<Handler> handlers = new ArrayList<>();
    void subscribe(Handler h) { handlers.add(h); }
    void publish(DomainEvent e) {
        for (Handler h : List.copyOf(handlers)) h.on(e);
    }
}

class OrderService {
    private final EventBus bus;
    private final List<DomainEvent> outbox = new ArrayList<>();
    OrderService(EventBus bus) { this.bus = bus; }

    void markPaid(String orderId, int paise) {
        // pretend DB transaction begins
        OrderPaid event = new OrderPaid(orderId, paise);
        outbox.add(event); // same TX as state update
        // pretend commit
        flushOutbox();
    }

    private void flushOutbox() {
        for (DomainEvent e : outbox) bus.publish(e);
        outbox.clear();
    }
}

public class Demo {
    public static void main(String[] args) {
        EventBus bus = new EventBus();
        bus.subscribe(e -> System.out.println("analytics " + e.name()));
        bus.subscribe(e -> System.out.println("email " + e.name()));
        new OrderService(bus).markPaid("O1", 500);
    }
}`,
  output: `analytics OrderPaid
email OrderPaid`,
  explain: [
    'Service commits domain change conceptually with outbox, then publishes.',
    'Handlers are decoupled — OrderService does not call EmailClient directly.',
    'Real systems need durable outbox polling and consumer idempotency keys.',
  ],
  mermaid: `sequenceDiagram
    participant OS as OrderService
    participant DB as DB+Outbox
    participant Bus as Broker
    participant Mail as EmailWorker
    OS->>DB: update order + insert outbox
    OS->>DB: commit
    DB->>Bus: publish OrderPaid
    Bus->>Mail: deliver
    Mail->>Mail: idempotent handle`,
  mistakes: [
    'Dual write: update DB then publish without outbox — lost events on crash.',
    'Assuming exactly-once delivery.',
    'Chatty events for every field change without business meaning.',
    'Hidden synchronous RPC inside “async” consumers creating latency chains.',
  ],
  interviewAsk: 'How do you notify inventory after payment without a distributed transaction?',
  interviewAnswer:
    'On successful pay transition, persist OrderPaid via transactional outbox. Inventory service consumes the event idempotently and reserves stock. Discuss eventual consistency UX (pending allocation), retries, and compensation if reservation fails (saga). Avoid 2PC unless constrained.',
  interviewTraps: [
    'Hand-waving Kafka without idempotency.',
    'Using events for every internal method call.',
  ],
  quiz: {
    question: 'Transactional outbox primarily solves:',
    options: [
      'UI styling',
      'Dual-write inconsistency between DB state and published events',
      'Equals/hashCode bugs',
      'Singleton thread safety',
    ],
    correctIndex: 1,
    explain: 'Atomic state+outbox then reliable publish closes the dual-write gap.',
  },
  practice:
    'Design events for parking lot: SpotOccupied, SpotFreed, ReservationExpired. List which consumer reacts to each and one idempotency key per consumer.',
  practiceHints: [
    'Analytics vs billing vs allocation sweeper.',
    'Keys might be ticketId + eventType.',
  ],
  deepDive: [
    'Ordering: partition by aggregate id so an entity’s events stay ordered.',
    'Poison messages: dead-letter queues and operator replay.',
  ],
});
