import { lesson } from '../lessonFactory';

export default lesson({
  id: 'principles-law-of-demeter',
  title: 'Law of Demeter',
  section: 'principles',
  chapter: 'Design Principles',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['oop-coupling-cohesion', 'principles-dry-kiss-yagni'],
  summary:
    'Talk only to your immediate friends — avoid long getter chains that reach into distant objects.',
  keywords: [
    'Law of Demeter',
    'LoD',
    'train wreck',
    'coupling',
    'tell dont ask',
  ],
  why: `a.getB().getC().getD().doThing() — the “train wreck” — couples you to an entire object graph. Refactors deep inside break distant callers. Law of Demeter keeps knowledge local and shows up in code-review and LLD feedback.`,
  theory: [
    'Law of Demeter (LoD): a method m of object O may only call methods of: O itself, m’s parameters, objects created inside m, O’s direct components, and (sometimes) globals — not “friends of friends”.',
    'Practical rule: avoid chains of getters that dig into alien structure.',
    'Fix by pushing behavior closer to the data (Tell, Don’t Ask) or by offering a higher-level method on the immediate collaborator.',
    'LoD reduces coupling to object graph shape — enabling deeper refactors.',
    'Not absolute: fluent builders (sb.append().append()) intentionally return this; fluent APIs are a deliberate exception.',
    'DTOs mapped across layers may use short chains; still avoid business logic navigating deep graphs.',
  ],
  mentalModel: `Ask your roommate to turn down their speaker. Don’t walk into their room, open their drawer, rewire their amp, and twist a hidden knob — that’s Demeter violation as lifestyle.`,
  moreExamples: [
    {
      title: 'Train wreck vs LoD-friendly API',
      code: `class Wallet {
    private int cents;
    Wallet(int cents) { this.cents = cents; }
    int cents() { return cents; }
    boolean withdraw(int amount) {
        if (amount > cents) return false;
        cents -= amount;
        return true;
    }
}

class Customer {
    private final Wallet wallet;
    Customer(Wallet wallet) { this.wallet = wallet; }
    Wallet wallet() { return wallet; } // tempting to leak
    boolean pay(int amount) { return wallet.withdraw(amount); } // better facade
}

class Order {
    private final Customer customer;
    Order(Customer customer) { this.customer = customer; }

    boolean checkoutBad(int total) {
        // train wreck — Order knows Customer has Wallet with cents
        return customer.wallet().cents() >= total
            && customer.wallet().withdraw(total);
    }

    boolean checkoutGood(int total) {
        return customer.pay(total); // only talks to Customer
    }
}

public class Demo {
    public static void main(String[] args) {
        Order o = new Order(new Customer(new Wallet(1000)));
        System.out.println(o.checkoutGood(400));
        System.out.println(o.checkoutBad(400)); // still "works" but brittle
    }
}`,
      output: `true
true`,
      explain: [
        'checkoutBad couples Order to Wallet’s structure and methods.',
        'checkoutGood only knows Customer.pay — Customer owns wallet interaction.',
        'If Wallet is replaced by Ledger, only Customer changes.',
      ],
    },
  ],
  mistakes: [
    'Exposing getX().getY() in public APIs for convenience.',
    'Applying LoD so rigidly that you create endless one-line delegators with no benefit.',
    'Confusing LoD with “never use getters”.',
  ],
  interviewAsk: 'What is the Law of Demeter? Why avoid method chains?',
  interviewAnswer:
    'LoD says talk only to immediate collaborators, not to their internals via getter chains. Long chains couple you to foreign structure and break when the graph changes. Prefer methods that tell a neighbor to do a job, encapsulating the navigation inside that neighbor.',
  interviewTraps: [
    'Banning all fluent APIs.',
    'Equating LoD with no dependencies at all.',
  ],
  quiz: {
    question: 'Which call best follows LoD?',
    options: [
      'order.getCustomer().getWallet().withdraw(10)',
      'order.getCustomer().getWallet().getCents()',
      'customer.pay(10) from order',
      'wallet.getOwner().getOrder().getCustomer().pay(10)',
    ],
    correctIndex: 2,
    explain: 'Order talks only to Customer; Customer handles wallet details.',
  },
  practice:
    'Refactor engine.getCar().getDriver().getName() usage in a Logger into something LoD-friendly without leaking the whole graph.',
  practiceHints: [
    'car.driverName() or driver.displayName() accessed via car.logContext().',
  ],
});
