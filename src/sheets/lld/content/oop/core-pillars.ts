import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-core-pillars',
  title: 'Four Pillars of OOP',
  section: 'oop',
  chapter: 'Foundations',
  difficulty: 'beginner',
  importance: 3,
  order: 1,
  prerequisites: [],
  summary:
    'Encapsulation, abstraction, inheritance, and polymorphism — what each means, why it matters, and how they work together in Java.',
  keywords: [
    'encapsulation',
    'abstraction',
    'inheritance',
    'polymorphism',
    'OOP pillars',
  ],
  why: `Interviewers and code reviews treat the four pillars as table stakes. Without a clear mental model you will confuse "hiding fields" with encapsulation, treat inheritance as the default design tool, and miss when polymorphism is already solving your problem. These four ideas are how we control complexity: hide details, share behavior carefully, and swap implementations without rewriting callers.`,
  theory: [
    'Encapsulation: bundle state with the methods that own it, and expose a small API. Private fields + public methods is the common Java shape — the goal is protecting invariants, not just using the private keyword.',
    'Abstraction: show what something does, hide how. Interfaces and abstract classes let callers depend on capabilities ("can pay", "can notify") instead of concrete classes.',
    'Inheritance: a subtype is-a specialized version of a parent. It reuses and extends behavior, but creates a tight hierarchical coupling that is hard to reverse.',
    'Polymorphism: one interface, many implementations. Overriding and interface-typed references let the same call site behave differently based on the runtime type.',
    'They compose: encapsulation protects data, abstraction defines contracts, inheritance/interfaces enable polymorphism, and polymorphism makes systems extensible.',
    'Prefer "is-a" for inheritance and "has-a" / "can-do" for composition and interfaces. If you cannot defend the is-a relationship, do not inherit.',
  ],
  mentalModel: `Think of a TV remote: encapsulation is the sealed circuitry; abstraction is the labeled buttons; inheritance is a "smart remote" that is still a remote; polymorphism is pressing Power on any remote brand and getting the right behavior.`,
  codeTitle: 'Pillars in one small Java example',
  code: `// Abstraction: what a payment can do
interface PaymentMethod {
    boolean pay(int amountCents);
}

// Encapsulation: balance is private; only deposit/withdraw mutate it
class Wallet {
    private int balanceCents;

    Wallet(int opening) {
        if (opening < 0) throw new IllegalArgumentException("negative");
        this.balanceCents = opening;
    }

    int balance() { return balanceCents; }

    void deposit(int cents) {
        if (cents <= 0) throw new IllegalArgumentException("cents");
        balanceCents += cents;
    }

    boolean withdraw(int cents) {
        if (cents <= 0 || cents > balanceCents) return false;
        balanceCents -= cents;
        return true;
    }
}

// Inheritance + Polymorphism: CardWallet is-a Wallet and is-a PaymentMethod
class CardWallet extends Wallet implements PaymentMethod {
    private final String last4;

    CardWallet(int opening, String last4) {
        super(opening);
        this.last4 = last4;
    }

    @Override
    public boolean pay(int amountCents) {
        System.out.println("Charging card ****" + last4);
        return withdraw(amountCents);
    }
}

class UpiWallet implements PaymentMethod {
    private final Wallet wallet;

    UpiWallet(Wallet wallet) { this.wallet = wallet; }

    @Override
    public boolean pay(int amountCents) {
        System.out.println("UPI debit");
        return wallet.withdraw(amountCents);
    }
}

public class Demo {
    static void checkout(PaymentMethod method, int amount) {
        // Polymorphic call — same code, different runtime behavior
        boolean ok = method.pay(amount);
        System.out.println(ok ? "paid" : "failed");
    }

    public static void main(String[] args) {
        checkout(new CardWallet(5000, "4242"), 1200);
        checkout(new UpiWallet(new Wallet(500)), 1200);
    }
}`,
  output: `Charging card ****4242
paid
UPI debit
failed`,
  explain: [
    'Wallet encapsulates balanceCents; callers cannot set it to an invalid value directly.',
    'PaymentMethod abstracts "pay" — checkout does not care about cards vs UPI.',
    'CardWallet uses inheritance (is-a Wallet) plus implements PaymentMethod; UpiWallet prefers composition (has-a Wallet).',
    'checkout(PaymentMethod, …) is polymorphism: one call site, two behaviors.',
  ],
  mistakes: [
    'Calling getters/setters for every field "encapsulation" while leaving invariants unprotected.',
    'Deep inheritance trees for reuse when composition or a shared utility would be clearer.',
    'Confusing method overloading (compile-time) with overriding (runtime polymorphism).',
    'Exposing mutable internals (returning the live List field) and breaking encapsulation silently.',
  ],
  interviewAsk: 'Explain the four pillars of OOP with a concrete Java example for each.',
  interviewAnswer:
    'Encapsulation keeps Wallet.balance private and mutates it only via deposit/withdraw. Abstraction is PaymentMethod.pay. Inheritance is CardWallet extending Wallet. Polymorphism is checkout accepting PaymentMethod and calling pay on CardWallet or UpiWallet without knowing the concrete type.',
  interviewTraps: [
    'Listing the four words without explaining trade-offs of inheritance.',
    'Saying polymorphism is only overloading.',
    'Equating abstraction with abstract class only — interfaces count.',
  ],
  quiz: [
    {
      question: 'Which pillar best describes "callers depend on PaymentMethod, not CardWallet"?',
      options: ['Encapsulation', 'Abstraction', 'Inheritance', 'Only composition'],
      correctIndex: 1,
      explain:
        'Depending on a capability/contract instead of a concrete type is abstraction (often via interfaces).',
    },
    {
      question: 'Runtime choice of pay() implementation based on the actual object type is:',
      options: [
        'Encapsulation',
        'Compile-time overloading only',
        'Polymorphism (dynamic dispatch)',
        'Package private access',
      ],
      correctIndex: 2,
      explain: 'Overriding + interface/base reference → runtime polymorphism.',
    },
  ],
  practice:
    'Model a NotificationSender interface with EmailSender and SmsSender. Keep credentials private. Write a notifyUser(NotificationSender, String) method and show both implementations being passed in.',
  practiceHints: [
    'Interface = abstraction; private fields = encapsulation; notifyUser = polymorphism.',
    'Avoid inheritance unless you truly have an is-a hierarchy to reuse.',
  ],
});
