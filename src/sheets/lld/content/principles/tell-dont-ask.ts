import { lesson } from '../lessonFactory';

export default lesson({
  id: 'principles-tell-dont-ask',
  title: 'Tell, Don’t Ask',
  section: 'principles',
  chapter: 'Design Principles',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['principles-law-of-demeter'],
  summary:
    'Command objects to do work instead of querying their state and making decisions for them — keep behavior with data.',
  keywords: [
    'tell dont ask',
    'anemic domain',
    'information hiding',
    'encapsulation',
  ],
  why: `Procedural OOP queries every field and decides outside the object — anemic domain models. “Tell, Don’t Ask” restores encapsulation, reduces Demeter violations, and makes invariants enforceable in one place. Interviewers listen for this when you place methods on entities.`,
  theory: [
    'Tell, Don’t Ask: send commands that express intent (account.withdraw(100)) rather than asking for data and acting externally (if account.balance() >= 100) account.setBalance(...)).',
    'Asking leads to logic scattered across callers; invariants become optional.',
    'Telling keeps rules next to state — SRP for the decision still may live in a domain service when coordinating multiple aggregates.',
    'Not every getter is evil: reporting/UI/queries need reads. The smell is making business decisions on asked-for guts.',
    'Combines with LoD: tell your friend; don’t interrogate their friends.',
    'Watch for feature envy: a method more interested in another type’s data than its own — move it.',
  ],
  mentalModel: `Don’t ask a chef for the fridge inventory and cook in their kitchen yourself. Tell the chef “make pasta for two” and let them handle stock and recipes.`,
  moreExamples: [
    {
      title: 'Ask (anemic) vs Tell (encapsulated)',
      code: `class BadAccount {
    int balance;
}

class BadBankService {
    void withdraw(BadAccount a, int amount) {
        if (a.balance >= amount) { // ask + decide outside
            a.balance -= amount;
        } else {
            throw new IllegalStateException("insufficient");
        }
    }
}

class GoodAccount {
    private int balance;
    GoodAccount(int balance) { this.balance = balance; }
    int balance() { return balance; } // ok for queries/reports

    void withdraw(int amount) { // tell — object enforces rules
        if (amount <= 0) throw new IllegalArgumentException("amount");
        if (amount > balance) throw new IllegalStateException("insufficient");
        balance -= amount;
    }
}

public class Demo {
    public static void main(String[] args) {
        BadAccount bad = new BadAccount();
        bad.balance = 100;
        new BadBankService().withdraw(bad, 40);
        System.out.println("bad=" + bad.balance);

        GoodAccount good = new GoodAccount(100);
        good.withdraw(40);
        System.out.println("good=" + good.balance());
        try {
            good.withdraw(1000);
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }
    }
}`,
      output: `bad=60
good=60
insufficient`,
      explain: [
        'BadAccount lets any caller mutate balance and re-implement rules.',
        'GoodAccount.withdraw encapsulates the policy; callers tell it what they want.',
        'balance() remains for display — telling targets decisionful logic.',
      ],
    },
  ],
  mistakes: [
    'Anemic entities + fat services that only get/set fields.',
    'Public setters for every field “for frameworks” without protecting invariants.',
    'Moving everything into entities including multi-aggregate workflows that belong in domain services.',
    'Avoiding all queries — reporting still needs asks.',
  ],
  interviewAsk: 'What does Tell, Don’t Ask mean in object design?',
  interviewAnswer:
    'Prefer commanding an object to perform a meaningful action so it can enforce its own invariants, instead of pulling its state out and deciding elsewhere. It fights anemic models and complements encapsulation and the Law of Demeter. Use queries for reporting; use tells for business decisions.',
  interviewTraps: [
    'Saying getters are always wrong.',
    'Putting cross-aggregate transactions entirely inside one entity.',
  ],
  quiz: {
    question: 'Which style best matches Tell, Don’t Ask for a purchase?',
    options: [
      'if (cart.getItems().isEmpty()) ... else order.setItems(cart.getItems())',
      'cart.checkout(orderService)',
      'Reading every field in the UI layer to recompute discounts already owned by Cart',
      'Making all Cart fields public',
    ],
    correctIndex: 1,
    explain: 'checkout tells Cart/OrderService to perform the use case with rules inside the domain.',
  },
  practice:
    'Refactor code that does if (door.isClosed()) door.setClosed(false); else ... into door.open() / door.close() with guards.',
  practiceHints: [
    'Illegal transitions throw or return false; state stays private.',
  ],
});
