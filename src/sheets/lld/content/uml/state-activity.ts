import { lesson } from '../lessonFactory';

export default lesson({
  id: 'uml-state-activity',
  title: 'State and Activity Diagrams',
  section: 'uml',
  chapter: 'UML Diagrams',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['uml-sequence-diagrams'],
  summary:
    'Model lifecycle with state machines and workflows with activity diagrams — when each shines in LLD.',
  keywords: [
    'state diagram',
    'activity diagram',
    'state machine',
    'lifecycle',
    'workflow',
  ],
  why: `Orders, tickets, connections, and game entities are state machines. Drawing states and legal transitions catches illegal flows early ("refund a cancelled order"). Activity diagrams help when the problem is a workflow with forks, joins, and swimlanes rather than one object’s lifecycle.`,
  theory: [
    'State diagram: states (rounded rects), transitions (arrows) labeled with event [guard] / action. Filled circle = initial; bullseye = final.',
    'Use state diagrams when an entity has a constrained lifecycle (Order: CREATED → PAID → SHIPPED → DELIVERED).',
    'Invalid transitions should be impossible in code (enum + methods), not just "documented".',
    'Activity diagram: flowchart of actions, decisions, forks/joins for parallelism, swimlanes for actors/systems.',
    'Use activity diagrams for business processes spanning multiple objects (fulfillment pipeline).',
    'In interviews, a clean state enum + transition table often beats a huge flowchart.',
  ],
  mentalModel:
    'State diagram = one character mood swings and what events are allowed. Activity diagram = the whole film storyboard with scenes, branches, and parallel cuts.',
  mermaid:
    'stateDiagram-v2\n    [*] --> Created\n    Created --> Paid: pay\n    Created --> Cancelled: cancel\n    Paid --> Shipped: ship\n    Paid --> Cancelled: cancel\n    Shipped --> Delivered: deliver\n    Cancelled --> [*]\n    Delivered --> [*]',
  moreExamples: [
    {
      title: 'Order state machine in Java',
      code: `enum OrderStatus {
    CREATED, PAID, SHIPPED, DELIVERED, CANCELLED
}

final class Order {
    private OrderStatus status = OrderStatus.CREATED;

    OrderStatus status() { return status; }

    void pay() {
        if (status != OrderStatus.CREATED) fail("pay");
        status = OrderStatus.PAID;
        System.out.println("→ PAID");
    }

    void ship() {
        if (status != OrderStatus.PAID) fail("ship");
        status = OrderStatus.SHIPPED;
        System.out.println("→ SHIPPED");
    }

    void deliver() {
        if (status != OrderStatus.SHIPPED) fail("deliver");
        status = OrderStatus.DELIVERED;
        System.out.println("→ DELIVERED");
    }

    void cancel() {
        if (status == OrderStatus.SHIPPED || status == OrderStatus.DELIVERED) fail("cancel");
        if (status == OrderStatus.CANCELLED) return;
        status = OrderStatus.CANCELLED;
        System.out.println("→ CANCELLED");
    }

    private void fail(String action) {
        throw new IllegalStateException("cannot " + action + " from " + status);
    }
}

public class Demo {
    public static void main(String[] args) {
        Order o = new Order();
        o.pay();
        o.ship();
        o.deliver();
        Order c = new Order();
        c.cancel();
        try {
            c.pay();
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
      output: `→ PAID
→ SHIPPED
→ DELIVERED
→ CANCELLED
cannot pay from CANCELLED`,
      explain: [
        'Each mutator encodes allowed transitions — the diagram becomes executable.',
        'Illegal moves fail fast instead of corrupting data.',
        'Cancelled is terminal for this model; pay after cancel is rejected.',
      ],
    },
  ],
  mistakes: [
    'States that are just flags with no transition rules ("isActive boolean soup").',
    'Allowing every method in every state — then the diagram lied.',
    'Using activity diagrams when a simple sequence of three calls would do.',
    'Forgetting terminal states and cancellation paths in interviews.',
  ],
  interviewAsk: 'How do you model an order lifecycle in LLD?',
  interviewAnswer:
    'Define explicit states and legal transitions (state diagram or table). Implement with an enum and methods that guard transitions, or a small state pattern if behavior per state is large. Call out cancellation, refunds, and idempotency. Pair with a sequence diagram for the pay/ship happy path.',
  interviewTraps: [
    'Stringly-typed status fields with no validation.',
    'Mixing payment provider states with domain order states carelessly.',
  ],
  quiz: {
    question: 'Best primary UML tool for "Ticket may be OPEN, IN_PROGRESS, RESOLVED, CLOSED"?',
    options: [
      'Only class diagram',
      'State diagram',
      'Package diagram',
      'ER diagram exclusively',
    ],
    correctIndex: 1,
    explain: 'Constrained lifecycle of one entity is the sweet spot for state diagrams.',
  },
  practice:
    'Design states for a ride-hailing Trip (Requested, Matched, Ongoing, Completed, Cancelled). List illegal transitions and sketch an activity for matching.',
  practiceHints: [
    'Cannot complete from Requested; cannot match after Completed.',
    'Activity: request → find drivers → offer → accept/timeout.',
  ],
});
