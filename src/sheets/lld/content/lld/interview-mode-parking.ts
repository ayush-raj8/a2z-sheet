import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-interview-mode-parking',
  title: 'Interview Mode: Parking Lot Follow-ups',
  section: 'lld',
  chapter: 'Interview Prep',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['lld-parking-lot', 'lld-concurrency-basics'],
  summary:
    'SDE-2/3/4 style follow-up drill on parking lot: concurrency, pricing, EV/reserved spots, payments, multi-gate, and distribution.',
  keywords: ['interview', 'parking lot', 'follow-up', 'sde3', 'sde4'],
  why:
    'Senior interviews rarely stop at the basic lot. This lesson trains you to answer escalating follow-ups with clear assumptions, incremental design changes, and honest tradeoffs.',
  theory: [
    'SDE-2: solid entities, Strategy for allocation/fees, basic concurrency answer, clean diagrams.',
    'SDE-3: multi-gate throughput, pricing rules engine, reservation holds, observability, failure modes, schema sketch.',
    'SDE-4: multi-lot tenancy, consistency boundaries, payment ledger, SLA, rollout/migration, abuse prevention.',
    'Always restate the new requirement, say what stays unchanged, and point to the module you open/extend.',
    'Prefer evolving interfaces (FeeCalculator, AllocationStrategy, SpotFilter) over rewriting ParkingLot.',
    'When distributed: define source of truth for spot occupancy (DB row version / lease) — in-memory locks do not span nodes.',
  ],
  mentalModel:
    'Treat follow-ups like Jira tickets arriving mid-design. You do not redesign the mall; you add a module (payments), a policy (EV filter), or a consistency story (reservation TTL) and explain blast radius.',
  codeTitle: 'Extension points interviewers look for',
  code: `import java.time.*;
import java.util.function.Predicate;

interface SpotFilter extends Predicate<ParkingSpotView> {}

record ParkingSpotView(String id, String type, boolean ev, boolean reserved, boolean free) {}

interface FeeCalculator {
    int fee(TicketView ticket, Instant exitTime);
}

record TicketView(String id, String spotType, boolean ev, Instant entry) {}

class EvAwareFee implements FeeCalculator {
    private final FeeCalculator base;
    EvAwareFee(FeeCalculator base) { this.base = base; }
    public int fee(TicketView ticket, Instant exitTime) {
        int f = base.fee(ticket, exitTime);
        return ticket.ev() ? (int)(f * 0.8) : f;
    }
}

class HourlyFee implements FeeCalculator {
    public int fee(TicketView ticket, Instant exitTime) {
        long hours = Math.max(1, Duration.between(ticket.entry(), exitTime).toHours());
        return (int) hours * 30;
    }
}

public class Demo {
    public static void main(String[] args) {
        FeeCalculator fee = new EvAwareFee(new HourlyFee());
        TicketView t = new TicketView("T1", "CAR", true, Instant.now().minusSeconds(7200));
        System.out.println(fee.fee(t, Instant.now()));
    }
}`,
  output: `48`,
  explain: [
    'Decorator-style fee stacking (EV discount over hourly) answers “add pricing rules” without rewriting exit().',
    'SpotFilter is how you add reserved/EV constraints to allocation.',
    'Records stand in for immutable views in an interview sketch.',
  ],
  mermaid: `flowchart TB
    F1[SDE2: core lot] --> F2[Concurrency on allocate]
    F2 --> F3[Pricing rules / EV]
    F3 --> F4[Reservations + TTL]
    F4 --> F5[Payments + invoice]
    F5 --> F6[Multi-node source of truth]`,
  mistakes: [
    'Answering a distributed follow-up by only saying synchronized.',
    'Rewriting the whole design for each new requirement.',
    'Ignoring money/ledger consistency when payments appear.',
    'Not asking clarifying questions on the follow-up itself.',
  ],
  interviewAsk: 'Parking lot follow-ups at SDE-3/4 — how do you handle reserved spots with a 15-minute hold and two concurrent entries?',
  interviewAnswer:
    'Introduce Reservation with status HOLD/ACTIVE/EXPIRED and TTL. Allocation can mark HOLD with expiresAt; a sweeper or lazy check frees expired holds. Enter either consumes a reservation token or allocates a free spot. Concurrency: transactional update WHERE status=FREE → HOLD with version check. Multi-gate: same source of truth. Mention idempotent enter(reservationId) to avoid double allocate on retries.',
  interviewTraps: [
    'Hand-wavy “use Kafka” without a spot ownership story.',
    'No TTL/expiry for holds.',
    'Fee discounts hardcoded in exit with nested ifs.',
  ],
  quiz: [
    {
      question: 'Best first response when interviewer adds “EV discounts”?',
      options: [
        'Rewrite ParkingLot from scratch',
        'Extend FeeCalculator (compose rules) and keep exit() orchestration',
        'Make Vehicle a Singleton',
        'Remove tickets',
      ],
      correctIndex: 1,
      explain: 'Open existing pricing extension point; minimize blast radius.',
    },
    {
      question: 'Why is synchronized alone insufficient for a multi-node parking service?',
      options: [
        'Because synchronized is illegal in Java',
        'Locks are per JVM; nodes need a shared source of truth/lease',
        'Because parking lots cannot be distributed',
        'Because AtomicInteger replaces databases',
      ],
      correctIndex: 1,
      explain: 'Intrinsic locks do not coordinate across processes.',
    },
  ],
  practice:
    'Write an interview script: 8 follow-up questions you expect on parking lot, and a 2–3 sentence answer bullet for each (concurrency, EV, reservation, payment failure after allocate, analytics, multi-lot, surge pricing, admin override).',
  practiceHints: [
    'For each, name the module you change.',
    'State one tradeoff explicitly.',
  ],
  deepDive: [
    'Payment failure after spot allocate: saga/compensation — free spot, void ticket, alert.',
    'Analytics: emit domain events SpotOccupied/SpotFreed; do not block exit on analytics IO.',
    'SDE-4: discuss tenant isolation, audit logs, and pricing config as data not code.',
  ],
});
