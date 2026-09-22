import { lesson } from '../lessonFactory';

export default lesson({
  id: 'trap-solid-overengineering',
  title: 'Trap: SOLID Overengineering',
  section: 'traps',
  chapter: 'Design Pitfalls',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['lld-methodology'],
  summary:
    'SOLID and patterns are tools, not scorecards — over-abstracting a simple LLD wastes time and confuses interviewers.',
  keywords: ['solid', 'yagni', 'overengineering', 'patterns', 'trap'],
  why:
    'Junior-to-mid candidates sprinkle AbstractFactorySingletonDecorators on Tic-Tac-Toe. Seniors apply the simplest design that meets stated requirements and show where they would extend later.',
  theory: [
    'YAGNI: do not build speculative extension points for requirements nobody stated.',
    'SOLID guides change — if nothing will change, a clear concrete class beats five interfaces.',
    'Pattern density is not a performance metric; readability and correct invariants are.',
    'Good interview move: “I’d introduce Strategy when a second pricing rule appears; for now a method is enough.”',
    'Overengineering smells: interfaces with one implementation forever, deep inheritance, premature microservices, config for imaginary tenants.',
    'Underengineering smells: god classes, copy-paste conditionals you already know will grow — strike a balance.',
  ],
  mentalModel:
    'Packing for a day hike with a parachute, harpoon, and portable forge “just in case.” SOLID is a packing checklist — useful, but you still pack for the trip you are taking.',
  codeTitle: 'Simple vs overbuilt fee calculation',
  code: `// Enough for one known rule in a 45-min interview:
class FeeService {
    int fee(long hours) {
        return (int) Math.max(1, hours) * 20;
    }
}

// Introduce Strategy WHEN a second rule is required:
interface FeeRule { int fee(long hours); }
class HourlyRule implements FeeRule {
    public int fee(long hours) { return (int) Math.max(1, hours) * 20; }
}
class FeeService2 {
    private final FeeRule rule;
    FeeService2(FeeRule rule) { this.rule = rule; }
    int fee(long hours) { return rule.fee(hours); }
}

public class Demo {
    public static void main(String[] args) {
        System.out.println(new FeeService().fee(3));
        System.out.println(new FeeService2(new HourlyRule()).fee(3));
    }
}`,
  output: `60
60`,
  explain: [
    'Both compute the same fee; the Strategy version pays for future rules.',
    'Start simple; extract when the interviewer adds WeekendFee.',
    'Narrate the evolution — that is senior communication.',
  ],
  mistakes: [
    'AbstractFactory for two nearly identical classes.',
    'Seven-layer clean architecture for an in-memory tic-tac-toe.',
    'Refusing to use a pattern when the problem is clearly a state machine with growing transitions.',
  ],
  interviewAsk: 'How do you decide whether to introduce a design pattern mid-interview?',
  interviewAnswer:
    'Introduce a pattern when it reduces real complexity from stated or highly likely requirements (second algorithm, lifecycle, integration mismatch). Otherwise keep concrete code and say how you would open it later. Optimize for clarity, correct edge cases, and time. Patterns should be consequences of forces, not decorations.',
  interviewTraps: [
    'Pattern bingo.',
    'Dogmatic “never use if/else.”',
  ],
  quiz: {
    question: 'Best default for a first pricing rule in a timed LLD?',
    options: [
      'Abstract Factory of Factories of FeeStrategies',
      'A clear concrete method/class, with a note on extracting Strategy later',
      'Microservices per currency',
      'No fee logic until production',
    ],
    correctIndex: 1,
    explain: 'Simplest correct design first; evolve on demand.',
  },
  practice:
    'Take your parking lot design and list 3 abstractions you would NOT introduce until a follow-up names them. List 2 you would introduce immediately and why.',
  practiceHints: [
    'Immediate: Ticket, Spot occupancy invariant.',
    'Deferred: multi-currency pricing rules engine.',
  ],
});
