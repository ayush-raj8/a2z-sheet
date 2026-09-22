import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-state',
  title: 'State Pattern',
  section: 'patterns',
  chapter: 'Behavioral',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-strategy'],
  summary:
    'Let an object alter its behavior when its internal state changes — appear to change class by delegating to state objects that own transitions.',
  keywords: ['state', 'state machine', 'transitions', 'behavioral'],
  why:
    'Vending machines, orders, TCP connections, and elevators are state machines. Encoding transitions in scattered if/else is brittle; State pattern localizes behavior per state — critical for LLD case studies.',
  theory: [
    'Intent: allow an object to alter behavior when internal state changes.',
    'Context holds current State; delegates requests; states may trigger transitions on the context.',
    'Each State class implements behavior for one state and knows legal next states.',
    'Eliminates giant switch(state) blocks that grow with every feature.',
    'Explicit state machines (enums + transition tables) are sometimes clearer than full State pattern classes — choose based on complexity.',
    'vs Strategy: client usually selects Strategy; State transitions are internal and constrained. States are not freely interchangeable peers.',
  ],
  mentalModel:
    'A traffic light: Red, Yellow, Green are states. The same “tick” event means different things depending on current color, and each color knows what comes next. You do not ask the driver to pick Green as a “strategy” for fun — transitions follow rules.',
  codeTitle: 'Order lifecycle State',
  code: `interface OrderState {
    void pay(Order ctx);
    void ship(Order ctx);
    void cancel(Order ctx);
}

class Order {
    private OrderState state = new NewState();
    void setState(OrderState state) { this.state = state; }
    void pay() { state.pay(this); }
    void ship() { state.ship(this); }
    void cancel() { state.cancel(this); }
}

class NewState implements OrderState {
    public void pay(Order ctx) {
        System.out.println("Paid");
        ctx.setState(new PaidState());
    }
    public void ship(Order ctx) {
        System.out.println("Cannot ship before pay");
    }
    public void cancel(Order ctx) {
        System.out.println("Canceled");
        ctx.setState(new CanceledState());
    }
}

class PaidState implements OrderState {
    public void pay(Order ctx) { System.out.println("Already paid"); }
    public void ship(Order ctx) {
        System.out.println("Shipped");
        ctx.setState(new ShippedState());
    }
    public void cancel(Order ctx) {
        System.out.println("Refund & cancel");
        ctx.setState(new CanceledState());
    }
}

class ShippedState implements OrderState {
    public void pay(Order ctx) { System.out.println("Already paid"); }
    public void ship(Order ctx) { System.out.println("Already shipped"); }
    public void cancel(Order ctx) { System.out.println("Cannot cancel shipped"); }
}

class CanceledState implements OrderState {
    public void pay(Order ctx) { System.out.println("Canceled"); }
    public void ship(Order ctx) { System.out.println("Canceled"); }
    public void cancel(Order ctx) { System.out.println("Already canceled"); }
}

public class Demo {
    public static void main(String[] args) {
        Order order = new Order();
        order.ship();
        order.pay();
        order.ship();
        order.cancel();
    }
}`,
  output: `Cannot ship before pay
Paid
Shipped
Cannot cancel shipped`,
  explain: [
    'Illegal transitions are handled inside the current state.',
    'Order API stays stable: pay/ship/cancel.',
    'Adding DeliveredState means new class + transitions from Shipped — not rewriting a mega-switch.',
  ],
  mermaid: `stateDiagram-v2
    [*] --> New
    New --> Paid: pay
    New --> Canceled: cancel
    Paid --> Shipped: ship
    Paid --> Canceled: cancel
    Shipped --> [*]`,
  mistakes: [
    'Letting every state transition to every other state — model the real domain graph.',
    'Duplicating shared behavior across states — use abstract base or helpers carefully.',
    'Using State pattern for a boolean flag with two trivial behaviors.',
  ],
  interviewAsk: 'When do you use State pattern vs an enum + switch?',
  interviewAnswer:
    'Enum + switch/table is fine for small, stable machines and is easy to visualize. State pattern shines when per-state behavior is substantial, polymorphic, and frequently extended. In interviews, draw the state diagram first, then choose implementation. Stress illegal transitions and idempotency.',
  interviewTraps: [
    'Treating State and Strategy as identical.',
    'Skipping the state diagram and diving into classes.',
  ],
  quiz: {
    question: 'In the State pattern, who typically decides the next state?',
    options: [
      'A random number generator',
      'The current state object (and/or context rules) based on events',
      'The garbage collector',
      'The Adapter',
    ],
    correctIndex: 1,
    explain: 'Transitions are domain rules usually triggered from the current state’s event handlers.',
  },
  practice:
    'Model a TCP-like connection with states Closed, Listen, Established. Implement connect/close events with illegal-transition messages.',
  practiceHints: [
    'Draw the diagram before coding.',
    'Established.close → Closed.',
  ],
});
