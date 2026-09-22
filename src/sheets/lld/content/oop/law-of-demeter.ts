import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-law-of-demeter',
  title: 'Law of Demeter',
  section: 'oop',
  chapter: 'Design Quality',
  difficulty: 'intermediate',
  importance: 2,
  order: 2,
  prerequisites: ['oop-coupling-cohesion'],
  summary:
    'Only talk to your immediate friends — a method should not dig through returned objects (train wrecks). LoD is a concrete coupling rule, not a separate pillar.',
  keywords: [
    'Law of Demeter',
    'LoD',
    'train wreck',
    'coupling',
    'delegation',
    'Principle of Least Knowledge',
  ],
  why: `a.getB().getC().doThing() couples your code to an entire object graph. One refactor deep inside breaks distant callers. Law of Demeter keeps knowledge local — it is how low coupling looks in method bodies.`,
  theory: [
    'Law of Demeter (LoD): a method of object O may call methods on (1) O itself, (2) its parameters, (3) objects it creates, (4) O’s direct fields/components — not on objects returned by those calls (“friends of friends”).',
    'Train wreck smell: customer.getWallet().getCards().get(0).charge(amount) — the caller knows Wallet, Cards, and Card internals.',
    'Fix: push the behavior onto the immediate collaborator (customer.charge(amount) → wallet → card) so the caller talks only to Customer.',
    'Connection to coupling: every hop in a getter chain is a dependency on structure. LoD is a practical rule for keeping coupling low — not a fifth OOP pillar.',
    'Guideline, not a hard law. Fluent builders (sb.append().append()) return this on purpose. Short chains into immutable value objects / DTOs are often fine.',
    'Rigid LoD that wraps every hop in a one-line forwarding method creates wrapper bloat — apply where structure churn hurts.',
  ],
  mentalModel:
    'Ask your roommate to turn the music down. Do not walk into their room, open their drawer, rewire the amp, and twist a hidden knob — that lifestyle is a Demeter violation.',
  moreExamples: [
    {
      title: '1) Train wreck vs delegate to an immediate friend',
      code: `class Card {
    private int limitCents;

    Card(int limitCents) {
        this.limitCents = limitCents;
    }

    boolean charge(int amountCents) {
        if (amountCents > limitCents) return false;
        limitCents -= amountCents;
        return true;
    }

    int limitCents() {
        return limitCents;
    }
}

class Wallet {
    private final Card primary;

    Wallet(Card primary) {
        this.primary = primary;
    }

    Card primary() {
        return primary;
    }

    // LoD-friendly: Wallet owns the card hop
    boolean chargePrimary(int amountCents) {
        return primary.charge(amountCents);
    }
}

class Customer {
    private final Wallet wallet;

    Customer(Wallet wallet) {
        this.wallet = wallet;
    }

    Wallet wallet() {
        return wallet;
    }

    boolean pay(int amountCents) {
        return wallet.chargePrimary(amountCents);
    }
}

public class LodDemo {
    public static void main(String[] args) {
        Customer customer = new Customer(new Wallet(new Card(5000)));

        // TRAIN WRECK — caller depends on Customer → Wallet → Card shape
        boolean wreck = customer.wallet().primary().charge(1200);
        System.out.println("train wreck ok=" + wreck);

        // FIXED — caller talks only to Customer (immediate friend)
        boolean clean = customer.pay(800);
        System.out.println("delegated ok=" + clean);
        System.out.println("left=" + customer.wallet().primary().limitCents());
    }
}`,
      output: `train wreck ok=true
delegated ok=true
left=3000`,
      explain: [
        'customer.wallet().primary().charge(...) reaches through returned objects — high structural coupling.',
        'customer.pay(...) tells the immediate collaborator; Wallet/Card hops stay inside the graph.',
        'Note: the final limitCents() print still peeks for the demo — in real code prefer a balance query on Customer if callers need it often.',
      ],
    },
    {
      title: '2) LoD vs coupling — what the wreck actually depends on',
      code: `class Engine {
    void start() {
        System.out.println("engine start");
    }
}

class Car {
    private final Engine engine = new Engine();

    Engine engine() {
        return engine;
    }

    void start() {
        engine.start(); // Car may talk to its direct field
    }
}

class Driver {
    void goBad(Car car) {
        car.engine().start(); // depends on Car AND Engine
    }

    void goGood(Car car) {
        car.start(); // depends only on Car
    }
}

public class LodCoupling {
    public static void main(String[] args) {
        Driver driver = new Driver();
        Car car = new Car();
        driver.goBad(car);
        driver.goGood(car);
    }
}`,
      output: `engine start
engine start`,
      explain: [
        'goBad is coupled to Engine’s API even though Driver’s friend is Car.',
        'goGood couples only to Car — if Engine is renamed or replaced, Driver does not change.',
        'That is LoD as a coupling tool: fewer types in the caller’s knowledge set.',
      ],
    },
  ],
  mistakes: [
    'Blindly wrapping every getter hop until you drown in one-line forwarders.',
    'Treating fluent builder chains as LoD violations.',
    'Putting business navigation of deep graphs into UI/controllers instead of the owning aggregate.',
  ],
  interviewAsk: 'What is the Law of Demeter, and how does it relate to coupling?',
  interviewAnswer:
    'A method should only talk to immediate friends — itself, its parameters, objects it creates, and its direct components — not objects returned by those calls. Each train-wreck hop couples you to another type’s structure. Fix by delegating (“tell” the collaborator). It is a guideline for low coupling, not an absolute law; DTO/value-object reads and fluent APIs are common exceptions.',
  interviewTraps: [
    '“LoD is a hard law, never break it” — it is a guideline; getter chains into value objects/DTOs are often fine, and rigid application creates wrapper-method bloat.',
    'Confusing LoD with “never use getters.”',
  ],
  quiz: [
    {
      question: 'Which call most clearly violates Law of Demeter?',
      options: [
        'this.save()',
        'param.validate()',
        'order.customer().address().city()',
        'new Tax().compute(order)',
      ],
      correctIndex: 2,
      explain: 'Reaching through returned objects (friends of friends) is the classic train wreck.',
    },
    {
      question: 'LoD mainly helps you reduce:',
      options: [
        'Cohesion inside a method',
        'Structural coupling to an object graph',
        'The need for interfaces',
        'Garbage collection pressure',
      ],
      correctIndex: 1,
      explain: 'Fewer hops means fewer types whose shape you depend on.',
    },
    {
      question: 'A reasonable LoD exception is:',
      options: [
        'Business logic that digs five layers into aggregates from a controller',
        'StringBuilder.append(...).append(...) fluent chaining',
        'Public fields instead of methods',
        'Circular package imports',
      ],
      correctIndex: 1,
      explain: 'Fluent APIs intentionally return this; that is not accidental graph navigation.',
    },
  ],
  practice:
    'Refactor order.getCustomer().getAddress().getZip() used inside ShippingService into a design where ShippingService only talks to Order (e.g. order.shippingZip() or order.shipWith(policy)). List which types each version couples to.',
  practiceHints: [
    'Move the zip lookup behind Order or Customer.',
    'Count the types mentioned in the shipping method before vs after.',
  ],
});
