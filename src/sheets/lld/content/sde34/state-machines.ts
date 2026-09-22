import { lesson } from '../lessonFactory';

export default lesson({
  id: 'sde34-state-machines',
  title: 'State Machines at Senior Level',
  section: 'sde34',
  chapter: 'Senior LLD',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['pattern-state', 'sde34-domain-modeling'],
  summary:
    'Explicit state machines for workflows: transition tables, idempotency, timers, and persistence — beyond toy State pattern demos.',
  keywords: ['state machine', 'workflow', 'idempotency', 'transitions', 'sde3'],
  why:
    'Payments, KYC, deliveries, and approvals are long-lived workflows. Seniors make states, events, and side effects explicit so systems stay debuggable and evolvable.',
  theory: [
    'Declare states and events; define a transition function (state, event) → (newState, effects).',
    'Illegal transitions are first-class — never silently ignore without a policy.',
    'Idempotency: replaying the same event with the same key should not double-charge / double-ship.',
    'Timers/SLA: schedule expire/cancel events (reservation TTL, payment timeout).',
    'Persist state + version for optimistic concurrency.',
    'Side effects (email, charge) should be outbox/events after successful transition commit.',
    'Prefer data-driven transition tables when many states; prefer State classes when behavior is heavy per state.',
  ],
  mentalModel:
    'A board-game turn track with cards (events). The token (state) only moves on legal cards. If someone plays “ship” while still on “new,” the referee rejects it. Timers are cards the clock plays for you.',
  codeTitle: 'Transition-table style machine',
  code: `import java.util.*;

enum S { NEW, PAID, SHIPPED, CANCELED }
enum E { PAY, SHIP, CANCEL, PAY_TIMEOUT }

record Transition(S from, E event, S to) {}

class OrderMachine {
    private static final Set<Transition> T = Set.of(
        new Transition(S.NEW, E.PAY, S.PAID),
        new Transition(S.NEW, E.CANCEL, S.CANCELED),
        new Transition(S.NEW, E.PAY_TIMEOUT, S.CANCELED),
        new Transition(S.PAID, E.SHIP, S.SHIPPED),
        new Transition(S.PAID, E.CANCEL, S.CANCELED)
    );

    private S state = S.NEW;
    private int version;

    synchronized S apply(E event) {
        S next = T.stream()
            .filter(t -> t.from() == state && t.event() == event)
            .map(Transition::to)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(state + " + " + event));
        state = next;
        version++;
        return state;
    }

    int version() { return version; }
    S state() { return state; }
}

public class Demo {
    public static void main(String[] args) {
        OrderMachine m = new OrderMachine();
        System.out.println(m.apply(E.PAY));
        try { m.apply(E.PAY); } catch (Exception e) { System.out.println("reject re-pay"); }
        System.out.println(m.apply(E.SHIP));
    }
}`,
  output: `PAID
reject re-pay
SHIPPED`,
  explain: [
    'Transition set makes legal moves visible and reviewable.',
    'Re-PAY from PAID is rejected — hook for idempotent no-op policy if desired.',
    'version supports optimistic locking when persisted.',
  ],
  mermaid: `stateDiagram-v2
    [*] --> NEW
    NEW --> PAID: PAY
    NEW --> CANCELED: CANCEL / PAY_TIMEOUT
    PAID --> SHIPPED: SHIP
    PAID --> CANCELED: CANCEL
    SHIPPED --> [*]`,
  mistakes: [
    'Encoding workflow only in nested ifs across services.',
    'Firing emails before committing state transition.',
    'No answer for duplicate webhook delivery.',
  ],
  interviewAsk: 'How do you design an order workflow that receives duplicate payment webhooks?',
  interviewAnswer:
    'Key events with an idempotency key. Transition PAY from NEW → PAID once; subsequent PAY while PAID returns success without re-running charge side effects (or is a documented no-op). Persist processed keys. Use outbox for emails. Version the aggregate row.',
  interviewTraps: [
    'Only State pattern classes with no persistence/idempotency story.',
  ],
  quiz: {
    question: 'Side effects like email should generally run:',
    options: [
      'Before validating the transition',
      'After the state transition is durably committed (e.g., outbox)',
      'Only in the UI',
      'Never',
    ],
    correctIndex: 1,
    explain: 'Commit then emit avoids lying about state if the process crashes mid-effect.',
  },
  practice:
    'Add DELIVERED state and event DELIVER from SHIPPED. Reject DELIVER from PAID. Print the transition table.',
  practiceHints: [
    'Extend enum and Set.of transitions.',
    'Keep apply() unchanged.',
  ],
});
