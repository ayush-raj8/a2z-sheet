import { lesson } from '../lessonFactory';

export default lesson({
  id: 'solid-tradeoffs',
  title: 'SOLID Trade-offs — When Not to Over-Apply',
  section: 'solid',
  chapter: 'SOLID Principles',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['solid-dip'],
  summary:
    'SOLID is guidance, not dogma — recognize ceremony, premature abstraction, and when a simple module beats a principle shrine.',
  keywords: [
    'SOLID tradeoffs',
    'over-engineering',
    'YAGNI',
    'pragmatism',
    'complexity',
  ],
  why: `Senior interviews probe judgment: “Would you always split this?” Blind SOLID produces interface forests, unreadable call graphs, and slow delivery. Knowing when not to apply a principle is part of applying it well.`,
  theory: [
    'Principles reduce change cost when volatility is real. If requirements are stable and local, indirection is pure cost.',
    'SRP over-applied → class explosion; related tiny types that always change together should stay together.',
    'OCP over-applied → speculative generalization (“plugin architecture” for a one-off script).',
    'LSP anxiety → fear of any inheritance; sometimes a small hierarchy is clear and correct.',
    'ISP over-applied → dozens of one-liner interfaces with no distinct clients.',
    'DIP over-applied → interfaces around String, Clock wrappers everywhere, DI container for a 50-line tool.',
    'Prefer: start simple, extract abstractions at the second real variant or across a true boundary (I/O, vendor, test seam).',
  ],
  mentalModel: `SOLID is a seatbelt, not a parachute for every walk to the kitchen. Wear it when speed and traffic demand it; don’t duct-tape belts onto a parked chair.`,
  codeTitle: 'Simple code vs premature SOLID',
  code: `// Often enough for a stable, single-format report in one service
final class DailyReport {
    String render(int orders, int revenueCents) {
        return "orders=" + orders + ", revenue=" + revenueCents;
    }
}

// Premature: 5 types for one string format with no second variant
interface ReportData {}
interface ReportFormatter {}
interface ReportRenderer {}
interface ReportExporter {}
interface ReportFacade {}
// ... wiring ceremony with zero business gain

public class Demo {
    public static void main(String[] args) {
        System.out.println(new DailyReport().render(3, 1500));
        System.out.println("Extract Strategy only when CSV + PDF both appear.");
    }
}`,
  output: `orders=3, revenue=1500
Extract Strategy only when CSV + PDF both appear.`,
  explain: [
    'DailyReport is cohesive and fine until a second format or destination appears.',
    'Inventing five interfaces early violates YAGNI and obscures the domain.',
    'When PDF arrives, introduce ReportFormatter — that is timely OCP, not cargo cult.',
  ],
  mistakes: [
    'Cargo-cult SOLID checklists in code review without naming the change risk.',
    'Equating “more interfaces” with “better design”.',
    'Refusing to ever use a concrete type inside a module boundary.',
    'Rewriting working code purely to “be SOLID” with no upcoming change.',
  ],
  interviewAsk: 'When would you intentionally not apply OCP or DIP?',
  interviewAnswer:
    'If there is only one implementation, no test seam pain, and low likelihood of variants, I keep a concrete class. I introduce abstractions at module boundaries or when a second real implementation/vendor appears. Principles exist to manage change; without change pressure, simplicity wins.',
  interviewTraps: [
    'Absolutist “always/never” answers.',
    'Defending a 15-type hierarchy for a CRUD homework.',
  ],
  quiz: {
    question: 'Best time to introduce a PaymentGateway interface?',
    options: [
      'Before writing any payment code, always',
      'When you have (or imminently need) multiple gateways or a test seam across that boundary',
      'Never — interfaces are over-engineering',
      'Only after microservices are mandatory',
    ],
    correctIndex: 1,
    explain: 'Abstract at real volatility or testing boundaries, not on day-zero speculation.',
  },
  practice:
    'Review a codebase sketch with Interface for every entity and a DI graph of 30 bindings for a CLI converter. List three abstractions to delete and one to keep.',
  practiceHints: [
    'Keep the file I/O boundary mockable; delete unused strategy interfaces.',
  ],
  deepDive: [
    '“Architecture astronaut” vs “big ball of mud” — both are failure modes; steer with expected change vectors.',
    'Rule of three: first duplicate may be coincidence; second/third suggests extract.',
    'In interviews, narrate trade-offs: “I’d keep this concrete until a second provider lands.”',
  ],
});
