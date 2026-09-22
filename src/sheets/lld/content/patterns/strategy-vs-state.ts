import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-strategy-vs-state',
  title: 'Strategy vs State',
  section: 'patterns',
  chapter: 'Comparisons',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-strategy', 'pattern-state'],
  summary:
    'Both use composition and a common interface, but Strategy swaps peer algorithms; State models constrained lifecycle transitions.',
  keywords: ['strategy', 'state', 'comparison', 'interview'],
  why:
    'This is a high-frequency interview discriminator. Candidates who only say “both replace if/else” lose marks; you must talk about who chooses the object and whether transitions are free or rule-bound.',
  theory: [
    'Structural similarity: Context → Behavior interface → Concrete behaviors.',
    'Strategy: behaviors are alternative policies selected by client/config; usually no mandated transition graph.',
    'State: behaviors represent lifecycle stages; events cause legal transitions; illegal calls are rejected or no-ops.',
    'Strategy objects are often interchangeable at any time; replacing PaidState with NewState arbitrarily breaks the domain.',
    'Test question: “Can the user freely pick any variant?” → Strategy. “Does the object have a mode that evolves with events?” → State.',
    'You can implement State using Strategy-like classes — naming and transition ownership reveal intent.',
  ],
  mentalModel:
    'Strategy is choosing shoes for a run (trail vs road) — you pick. State is a caterpillar becoming a butterfly — stages follow nature’s rules; you cannot skip to butterfly because it “seems useful.”',
  codeTitle: 'Side-by-side intent',
  code: `// STRATEGY: client chooses algorithm
class Sorter {
    private java.util.Comparator<Integer> strategy;
    void setStrategy(java.util.Comparator<Integer> strategy) {
        this.strategy = strategy;
    }
    void sort(java.util.List<Integer> xs) {
        xs.sort(strategy);
    }
}

// STATE: transitions are constrained
interface DoorState {
    void open(Door d);
    void close(Door d);
}
class Door {
    DoorState state = new Closed();
    void setState(DoorState s) { state = s; }
    void open() { state.open(this); }
    void close() { state.close(this); }
}
class Closed implements DoorState {
    public void open(Door d) {
        System.out.println("Opened");
        d.setState(new Opened());
    }
    public void close(Door d) { System.out.println("Already closed"); }
}
class Opened implements DoorState {
    public void open(Door d) { System.out.println("Already open"); }
    public void close(Door d) {
        System.out.println("Closed");
        d.setState(new Closed());
    }
}

public class Demo {
    public static void main(String[] args) {
        Door door = new Door();
        door.open();
        door.open();
        door.close();
    }
}`,
  output: `Opened
Already open
Closed`,
  explain: [
    'Sorter strategies are peer policies with no “illegal strategy.”',
    'Door states reject illegal events and know next state.',
    'Same mechanical shape; different domain rules.',
  ],
  mermaid: `flowchart TB
    subgraph Strategy
      C1[Context] --> S1[Algo A]
      C1 --> S2[Algo B]
      U[User/Config] -->|selects| C1
    end
    subgraph State
      C2[Context] --> St1[State X]
      St1 -->|event| St2[State Y]
      Ev[Domain events] --> C2
    end`,
  mistakes: [
    'Using Strategy for order lifecycle — missing illegal transitions.',
    'Using State for sort/payment method selection — overkill and odd transitions.',
    'Saying they are “exactly the same pattern.”',
  ],
  interviewAsk: 'Are Strategy and State the same pattern?',
  interviewAnswer:
    'They share a structure but differ in intent. Strategy encapsulates interchangeable algorithms chosen externally. State encapsulates state-specific behavior with a transition graph driven by events. In design talks, draw either a family of policies or a state diagram to show which you mean.',
  interviewTraps: [
    'Only comparing class diagrams.',
    'Ignoring who owns transitions.',
  ],
  quiz: {
    question: 'You are modeling an elevator moving between Idle, Moving, and Maintenance. Which fits better?',
    options: ['Strategy', 'State', 'Adapter', 'Singleton'],
    correctIndex: 1,
    explain: 'Elevator modes form a lifecycle with constrained transitions — classic State.',
  },
  practice:
    'Write two short designs for “shipping”: (1) choose FedEx vs UPS at checkout (Strategy), (2) package lifecycle Created→InTransit→Delivered (State). List illegal operations for (2).',
  practiceHints: [
    'Do not allow Delivered → Created.',
    'Strategy has no illegal carrier — only invalid config.',
  ],
});
