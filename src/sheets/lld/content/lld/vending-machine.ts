import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-vending-machine',
  title: 'Vending Machine LLD',
  section: 'lld',
  chapter: 'Case Studies',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-state', 'lld-methodology'],
  summary:
    'Classic state-machine LLD: idle → accepting money → dispensing, with inventory, pricing, change, and cancel.',
  keywords: ['vending machine', 'state', 'inventory', 'lld'],
  why:
    'Vending Machine is the poster child for the State pattern in interviews. It forces you to model money, inventory, and illegal operations cleanly.',
  theory: [
    'Clarify: products, prices, coin denominations, change-making, cancel, sold-out behavior.',
    'States typically: Idle, HasMoney, Dispensing (sometimes Maintenance).',
    'Entities: VendingMachine (context), State, Product/Item, Inventory, Coin/CashRegister.',
    'Events: insertCoin, selectProduct, cancel, dispense complete.',
    'Invariants: cannot dispense without enough balance and stock; balance updates atomically with inventory when possible.',
    'Change-making is its own algorithm (greedy or DP) — keep it behind CashRegister.',
  ],
  mentalModel:
    'A finite-state cashier robot: it only understands certain buttons in each mode. Putting a coin in “dispensing” mode should be rejected or queued by design — states make those rules obvious.',
  codeTitle: 'State-based vending machine (simplified)',
  code: `import java.util.*;

class Product {
    final String code;
    final String name;
    final int price;
    Product(String code, String name, int price) {
        this.code = code; this.name = name; this.price = price;
    }
}

interface VmState {
    void insertCoin(VendingMachine vm, int coin);
    void select(VendingMachine vm, String code);
    void cancel(VendingMachine vm);
}

class VendingMachine {
    private VmState state = new IdleState();
    private int balance;
    private final Map<String, Integer> stock = new HashMap<>();
    private final Map<String, Product> catalog = new HashMap<>();

    void setState(VmState state) { this.state = state; }
    int getBalance() { return balance; }
    void addBalance(int c) { balance += c; }
    void clearBalance() { balance = 0; }

    void addProduct(Product p, int qty) {
        catalog.put(p.code, p);
        stock.put(p.code, qty);
    }

    Product product(String code) { return catalog.get(code); }
    int stockOf(String code) { return stock.getOrDefault(code, 0); }
    void consume(String code) { stock.put(code, stockOf(code) - 1); }

    public void insertCoin(int coin) { state.insertCoin(this, coin); }
    public void select(String code) { state.select(this, code); }
    public void cancel() { state.cancel(this); }
}

class IdleState implements VmState {
    public void insertCoin(VendingMachine vm, int coin) {
        vm.addBalance(coin);
        vm.setState(new HasMoneyState());
        System.out.println("Balance=" + vm.getBalance());
    }
    public void select(VendingMachine vm, String code) {
        System.out.println("Insert money first");
    }
    public void cancel(VendingMachine vm) {
        System.out.println("Nothing to cancel");
    }
}

class HasMoneyState implements VmState {
    public void insertCoin(VendingMachine vm, int coin) {
        vm.addBalance(coin);
        System.out.println("Balance=" + vm.getBalance());
    }
    public void select(VendingMachine vm, String code) {
        Product p = vm.product(code);
        if (p == null) { System.out.println("Unknown"); return; }
        if (vm.stockOf(code) <= 0) { System.out.println("Sold out"); return; }
        if (vm.getBalance() < p.price) { System.out.println("Need more money"); return; }
        vm.consume(code);
        int change = vm.getBalance() - p.price;
        vm.clearBalance();
        System.out.println("Dispensed " + p.name + " change=" + change);
        vm.setState(new IdleState());
    }
    public void cancel(VendingMachine vm) {
        System.out.println("Refund=" + vm.getBalance());
        vm.clearBalance();
        vm.setState(new IdleState());
    }
}

public class Demo {
    public static void main(String[] args) {
        VendingMachine vm = new VendingMachine();
        vm.addProduct(new Product("A1", "Chips", 50), 2);
        vm.select("A1");
        vm.insertCoin(20);
        vm.insertCoin(50);
        vm.select("A1");
    }
}`,
  output: `Insert money first
Balance=20
Balance=70
Dispensed Chips change=20`,
  explain: [
    'Idle rejects select without money.',
    'HasMoney accepts more coins, select, or cancel.',
    'After dispense, machine returns to Idle with balance cleared.',
  ],
  mermaid: `stateDiagram-v2
    [*] --> Idle
    Idle --> HasMoney: insertCoin
    HasMoney --> HasMoney: insertCoin
    HasMoney --> Idle: select success / cancel
    HasMoney --> HasMoney: select insufficient/soldout`,
  mistakes: [
    'Giant switch on enum without isolating behavior — gets messy fast.',
    'Allowing negative stock.',
    'Forgetting cancel/refund path.',
    'Mixing change-making complexity into UI code.',
  ],
  interviewAsk: 'Design a vending machine.',
  interviewAnswer:
    'Clarify products, coins, change, cancel. Draw a state diagram. Implement State pattern or transition table. Separate Inventory and CashRegister. Walk through sold-out and insufficient funds. Mention concurrency if multiple knocks on the glass — usually single consumer hardware, but software APIs may still need locks.',
  interviewTraps: [
    'No state model.',
    'Only happy path dispense.',
  ],
  quiz: {
    question: 'Which pattern most naturally fits vending machine modes?',
    options: ['Singleton', 'State', 'Adapter', 'Prototype'],
    correctIndex: 1,
    explain: 'Modes and constrained transitions map to State.',
  },
  practice:
    'Add a MaintenanceState where only an admin can restock; all customer ops print “Unavailable”.',
  practiceHints: [
    'Add enterMaintenance/exitMaintenance on the machine.',
    'Reject coins in maintenance.',
  ],
});
