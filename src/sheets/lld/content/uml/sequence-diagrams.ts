import { lesson } from '../lessonFactory';

export default lesson({
  id: 'uml-sequence-diagrams',
  title: 'UML Sequence Diagrams',
  section: 'uml',
  chapter: 'UML Diagrams',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['uml-class-diagrams'],
  summary:
    'Show runtime collaboration with lifelines, messages, returns, and activation — the diagram interviewers use for "walk me through the flow".',
  keywords: [
    'sequence diagram',
    'lifeline',
    'message',
    'activation',
    'UML interaction',
  ],
  why: `Class diagrams show structure; sequence diagrams show behavior over time. When an interviewer asks "what happens when the user clicks checkout?", a sequence sketch proves you understand call order, failures, and which object owns the orchestration.`,
  theory: [
    'Participants (lifelines) are vertical dashed lines. Time flows top → bottom.',
    'Synchronous message: solid arrow with filled head; return: dashed arrow (optional if obvious).',
    'Activation bars show when an object is busy processing.',
    'create / destroy can be shown; loops and alternatives use combined fragments (loop, alt, opt) in full UML — in interviews, verbalize branches clearly.',
    'Keep actors on the left (User, API client). External systems (DB, payment) on the right.',
    'Good sequence diagrams answer: who calls whom, in what order, and what data returns — not every getter.',
  ],
  mentalModel: `A sequence diagram is a comic strip of method calls. Each character has a vertical timeline; speech bubbles are messages flying left to right and down the page.`,
  mermaid: `sequenceDiagram
    actor User
    participant API as CheckoutAPI
    participant Cart as CartService
    participant Pay as PaymentGateway
    participant DB as OrderRepository

    User->>API: POST /checkout
    API->>Cart: getItems(userId)
    Cart-->>API: items
    API->>Pay: charge(total)
    alt payment ok
      Pay-->>API: success
      API->>DB: save(order)
      DB-->>API: orderId
      API-->>User: 200 OK
    else payment failed
      Pay-->>API: decline
      API-->>User: 402 Payment Required
    end`,
  codeTitle: 'Code whose flow matches the sequence',
  code: `import java.util.*;

record Item(String sku, int cents) {}

class CartService {
    List<Item> getItems(String userId) {
        return List.of(new Item("book", 500), new Item("pen", 100));
    }
}

class PaymentGateway {
    boolean charge(int total) {
        System.out.println("charging " + total);
        return total > 0 && total < 10_000;
    }
}

class OrderRepository {
    String save(String userId, List<Item> items, int total) {
        String id = "ord-" + userId;
        System.out.println("saved " + id + " total=" + total);
        return id;
    }
}

class CheckoutAPI {
    private final CartService cart;
    private final PaymentGateway pay;
    private final OrderRepository db;

    CheckoutAPI(CartService cart, PaymentGateway pay, OrderRepository db) {
        this.cart = cart; this.pay = pay; this.db = db;
    }

    String checkout(String userId) {
        List<Item> items = cart.getItems(userId);
        int total = items.stream().mapToInt(Item::cents).sum();
        if (!pay.charge(total)) {
            return "402";
        }
        String orderId = db.save(userId, items, total);
        return "200 " + orderId;
    }
}

public class Demo {
    public static void main(String[] args) {
        CheckoutAPI api = new CheckoutAPI(
            new CartService(), new PaymentGateway(), new OrderRepository());
        System.out.println(api.checkout("ada"));
    }
}`,
  output: `charging 600
saved ord-ada total=600
200 ord-ada`,
  explain: [
    'User → API starts the interaction; API orchestrates collaborators.',
    'Cart returns items before payment — order matters for correctness.',
    'alt fragment covers success vs decline; interviews expect you to mention failure paths.',
    'Repository is called only after successful charge in this simplified happy-path policy.',
  ],
  mistakes: [
    'Drawing sequences that contradict the class model (calls that cannot exist).',
    'Showing only the happy path when failure handling is the interesting part.',
    'Too many participants — merge internals or zoom out.',
    'Confusing sequence (runtime) with class (static structure) diagrams.',
  ],
  interviewAsk: 'When would you use a sequence diagram instead of a class diagram?',
  interviewAnswer:
    'Use class diagrams for types and relationships; use sequence diagrams to explain a use case’s call flow over time — especially orchestration, external I/O, and error branches. In LLD, often sketch both: structure first, then one critical flow.',
  interviewTraps: [
    'Spending the whole interview on UML notation trivia instead of design trade-offs.',
    'Async/message queues drawn as sync calls without saying so.',
  ],
  quiz: {
    question: 'In a sequence diagram, time generally progresses:',
    options: [
      'Right to left',
      'Bottom to top',
      'Top to bottom along lifelines',
      'Only inside class compartments',
    ],
    correctIndex: 2,
    explain: 'Messages are ordered from top to bottom; each lifeline is a vertical timeline.',
  },
  practice:
    'Sketch a sequence for "user logs in": Client → AuthController → UserRepo → TokenService → Client. Include an alt for invalid password.',
  practiceHints: [
    'Show return of 401 vs 200 + token.',
    'TokenService should run only after credential check succeeds.',
  ],
});
