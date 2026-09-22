import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-splitwise',
  title: 'Splitwise-like Expense Sharing LLD',
  section: 'lld',
  chapter: 'Case Studies',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['lld-methodology'],
  summary:
    'Users, groups, expenses, split strategies, and balance sheets — simplify debts with a netting algorithm.',
  keywords: ['splitwise', 'expenses', 'balances', 'simplify', 'lld'],
  why:
    'Expense sharing combines Strategy (equal/exact/percent splits) with a graph/balance problem (minimize transactions). It is a favorite medium LLD interview.',
  theory: [
    'Clarify: groups vs friends, split types, settle-up, simplify debts, currencies, concurrent edits.',
    'Entities: User, Group, Expense, Split, BalanceSheet/Ledger, Settlement.',
    'Core invariant: for every expense, sum(splits) == expense.amount (within epsilon for percent).',
    'Balances: directed owed amounts; store net pairwise balances to avoid noise.',
    'Simplify: reduce cash-flow graph to min transfers (greedy with max debtor/creditor heaps is a common interview approach; optimal is more graph-theoretic).',
    'Strategy: EqualSplit, ExactSplit, PercentSplit.',
  ],
  mentalModel:
    'A shared spreadsheet of who paid and who owes. Each expense updates running nets between people. “Simplify” is cleaning the spreadsheet into the fewest repayments that leave everyone even.',
  codeTitle: 'Balances + equal split',
  code: `import java.util.*;

public class Demo {
    static final class BalanceBook {
        // A positive value at net[from][to] means "from owes to".
        private final Map<String, Map<String, Integer>> net = new HashMap<>();

        private void addDebt(String from, String to, int amount) {
            if (from.equals(to) || amount == 0) return;
            net.computeIfAbsent(from, key -> new HashMap<>())
               .merge(to, amount, Integer::sum);
            net.computeIfAbsent(to, key -> new HashMap<>())
               .merge(from, -amount, Integer::sum);
        }

        void equalExpense(String payer, List<String> users, int amount) {
            if (users.isEmpty() || !users.contains(payer) || amount < 0) {
                throw new IllegalArgumentException("Invalid equal expense");
            }

            int baseShare = amount / users.size();
            int remainder = amount % users.size();

            for (int i = 0; i < users.size(); i++) {
                // The first 'remainder' participants absorb one extra cent.
                int share = baseShare + (i < remainder ? 1 : 0);
                addDebt(users.get(i), payer, share);
            }
        }

        int owes(String from, String to) {
            return net.getOrDefault(from, Collections.emptyMap())
                      .getOrDefault(to, 0);
        }
    }

    public static void main(String[] args) {
        BalanceBook book = new BalanceBook();
        book.equalExpense("A", List.of("A", "B", "C"), 100);
        System.out.println("B owes A: " + book.owes("B", "A"));
        System.out.println("C owes A: " + book.owes("C", "A"));
        System.out.println("A owes B: " + book.owes("A", "B"));
    }
}`,
  output: `B owes A: 33
C owes A: 33
A owes B: -33`,
  explain: [
    'The shares are A=34, B=33, and C=33, totaling exactly 100 cents.',
    'Because A paid, only B and C create debts; A does not owe itself.',
    'Pairwise nets store both directions as negatives for easy queries.',
    'Next step: PercentSplit validation and simplify().',
  ],
  mermaid: `classDiagram
    class Expense {
      +amount
      +payer
      +splits
    }
    class SplitStrategy {
      <<interface>>
      +validate()
      +computeShares()
    }
    class BalanceBook
    Expense --> SplitStrategy
    Expense --> BalanceBook : updates`,
  mistakes: [
    'Not validating that splits sum to total.',
    'Storing only a list of expenses without aggregated balances — slow queries.',
    'Simplify that breaks already-settled semantics without care.',
  ],
  interviewAsk: 'How do you simplify debts among n users?',
  interviewAnswer:
    'Compute net balance per user (creditors positive, debtors negative). Use two heaps or sorted lists to repeatedly match the largest debtor with largest creditor and create a settlement edge for min(abs amounts). Mention this minimizes transactions heuristically; proving global minimum is harder. Persist settlements as first-class records.',
  interviewTraps: [
    'Ignoring remainder cents in equal split.',
    'No validation on percent splits.',
  ],
  quiz: {
    question: 'What must always hold for a valid expense split?',
    options: [
      'Every user pays equally always',
      'Sum of split amounts equals the expense total',
      'Only two users can participate',
      'Balances must be stored in a blockchain',
    ],
    correctIndex: 1,
    explain: 'Conservation of money in the expense is the key invariant.',
  },
  practice:
    'Implement PercentSplit and reject expenses where percents do not total 100. Update BalanceBook accordingly.',
  practiceHints: [
    'Validate before mutating balances.',
    'Convert percent to integer minor units carefully.',
  ],
});
