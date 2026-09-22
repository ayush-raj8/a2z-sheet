import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-tell-dont-ask',
  title: "Tell, Don't Ask",
  section: 'oop',
  chapter: 'Design Quality',
  difficulty: 'intermediate',
  importance: 2,
  order: 3,
  prerequisites: ['oop-encapsulation'],
  summary:
    'Prefer telling an object what to do (account.withdraw(x)) over asking for its state and deciding outside. Tell-Don’t-Ask is encapsulation expressed as method design.',
  keywords: [
    'tell dont ask',
    'encapsulation',
    'invariant',
    'anemic domain',
    'information hiding',
  ],
  why: `Ask-style code scatters invariants across callers: if (account.getBalance() >= x) account.setBalance(...). One forgetful caller empties the account into negatives. Tell-style APIs make illegal states harder to express — the same goal as encapsulation, at the call site.`,
  theory: [
    'Tell, Don’t Ask: command the object (account.withdraw(x)) instead of querying its guts and mutating from outside.',
    'Ask-style: read state → decide in the caller → write state back. Logic and invariants leak out of the class.',
    'Tell-style: the object owns the decision and the update together — same place encapsulation already put the data.',
    'Relationship to encapsulation: Tell-Don’t-Ask is what encapsulation looks like in method design, not a new OOP pillar. Private fields without tell-style operations still invite ask/set abuse.',
    'Pairs with Law of Demeter: telling the immediate collaborator beats asking through a chain of getters.',
    'Do not over-apply to pure data / value objects (Point, Money DTO, JSON models) where ask-style getters are expected and fine.',
  ],
  mentalModel:
    'Don’t ask the chef for the fridge inventory and then cook on their counter. Tell the chef “make pasta” — they own ingredients and rules.',
  moreExamples: [
    {
      title: '1) Ask vs tell — BankAccount continuation from encapsulation',
      code: `public class TellDontAskDemo {
    // Same shape as the encapsulation lesson's account — ask-style abuse
    static class AskAccount {
        private int balanceCents;

        AskAccount(int openingCents) {
            this.balanceCents = openingCents;
        }

        public int getBalance() {
            return balanceCents;
        }

        public void setBalance(int balanceCents) {
            this.balanceCents = balanceCents; // no invariant
        }
    }

    // Tell-style: withdraw owns the check + update (encapsulation as API)
    static class TellAccount {
        private int balanceCents;

        TellAccount(int openingCents) {
            if (openingCents < 0) throw new IllegalArgumentException("opening");
            this.balanceCents = openingCents;
        }

        public int balanceCents() {
            return balanceCents;
        }

        public void withdraw(int amountCents) {
            if (amountCents <= 0) throw new IllegalArgumentException("amount");
            if (amountCents > balanceCents) {
                throw new IllegalStateException("insufficient funds");
            }
            balanceCents -= amountCents;
        }
    }

    static void payAsk(AskAccount account, int priceCents) {
        // Caller must remember the rule — easy to forget
        if (account.getBalance() >= priceCents) {
            account.setBalance(account.getBalance() - priceCents);
        }
    }

    static void payAskBroken(AskAccount account, int priceCents) {
        // Forgot the check — invariant dies outside the class
        account.setBalance(account.getBalance() - priceCents);
    }

    static void payTell(TellAccount account, int priceCents) {
        account.withdraw(priceCents); // tell — illegal paths throw inside
    }

    public static void main(String[] args) {
        AskAccount ask = new AskAccount(1000);
        payAsk(ask, 200);
        System.out.println("ask after careful pay=" + ask.getBalance());
        payAskBroken(ask, 5000);
        System.out.println("ask after forgotten check=" + ask.getBalance());

        TellAccount tell = new TellAccount(1000);
        payTell(tell, 200);
        System.out.println("tell after pay=" + tell.balanceCents());
        try {
            payTell(tell, 5000);
        } catch (IllegalStateException e) {
            System.out.println("tell blocked: " + e.getMessage());
            System.out.println("tell still=" + tell.balanceCents());
        }
    }
}`,
      output: `ask after careful pay=800
ask after forgotten check=-4200
tell after pay=800
tell blocked: insufficient funds
tell still=800`,
      explain: [
        'AskAccount hides the field but still exposes setBalance — encapsulation without Tell-Don’t-Ask.',
        'One forgotten check leaves balance negative; the class cannot stop it.',
        'TellAccount.withdraw makes the bad path impossible without going through validation.',
        'This continues the encapsulation BankAccount story: tell-style methods are how you finish the job.',
      ],
    },
    {
      title: '2) Where ask-style is fine — value objects / DTOs',
      code: `public class AskIsOkForValues {
    static final class Point {
        private final int x;
        private final int y;

        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }

        int x() {
            return x;
        }

        int y() {
            return y;
        }
    }

    static int manhattan(Point a, Point b) {
        // Asking pure values is normal — no hidden invariant to steal
        return Math.abs(a.x() - b.x()) + Math.abs(a.y() - b.y());
    }

    public static void main(String[] args) {
        System.out.println(manhattan(new Point(0, 0), new Point(3, 4)));
    }
}`,
      output: `7`,
      explain: [
        'Point is a value — getters are the API; there is no rich behavior to “tell.”',
        'Forcing point.moveToward(other) everywhere would be dogma, not design.',
        'Apply Tell-Don’t-Ask to behavioral domain types; relax it for DTOs and values.',
      ],
    },
  ],
  mistakes: [
    'Private fields + public getters/setters for every attribute, with all rules in services (anemic domain).',
    'Duplicating the same if (balance >= x) check in five callers.',
    'Banning getters entirely — reads for display/reporting are fine; mutation paths are the danger.',
  ],
  interviewAsk: 'What is Tell, Don’t Ask? How does it relate to encapsulation?',
  interviewAnswer:
    'Prefer commanding an object to perform a meaningful operation rather than querying its state and deciding externally. It is encapsulation at the call site: the type that owns the data owns the rules. Use it for behavioral domain objects; do not over-apply to DTOs and simple value types where ask-style access is expected.',
  interviewTraps: [
    'Over-applying it to pure data/value objects (structs like Point, DTOs) where ask-style access is fine and expected.',
    'Claiming getters are always a design smell.',
  ],
  quiz: [
    {
      question: 'Which is Tell, Don’t Ask?',
      options: [
        'if (account.getBalance() >= x) account.setBalance(account.getBalance() - x);',
        'account.withdraw(x);',
        'account.balance = account.balance - x;',
        'Reading account.getBalance() only to display it in a UI label',
      ],
      correctIndex: 1,
      explain: 'withdraw tells the object to perform the operation and enforce rules.',
    },
    {
      question: 'Tell-Don’t-Ask is best described as:',
      options: [
        'A fifth OOP pillar',
        'Encapsulation expressed as method/API design',
        'A replacement for interfaces',
        'A JVM memory model rule',
      ],
      correctIndex: 1,
      explain: 'It is how you design methods once state is already hidden.',
    },
    {
      question: 'Ask-style access is usually appropriate for:',
      options: [
        'BankAccount withdraw rules',
        'Order.place() checkout invariants',
        'A Point or DTO used as pure data',
        'Any class with private fields',
      ],
      correctIndex: 2,
      explain: 'Value objects and DTOs are meant to be queried; rich domain types should be told.',
    },
  ],
  practice:
    'Take AskAccount from this lesson and remove setBalance. Add deposit/withdraw that preserve balance ≥ 0. Write a Checkout service that only tells the account what to do — no get/set arithmetic in Checkout.',
  practiceHints: [
    'Checkout.charge(account, price) → account.withdraw(price).',
    'Catch IllegalStateException and map it to “payment failed.”',
  ],
});
