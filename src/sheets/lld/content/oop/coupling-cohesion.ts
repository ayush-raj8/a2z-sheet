import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-coupling-cohesion',
  title: 'Coupling and Cohesion',
  section: 'oop',
  chapter: 'Design Quality',
  difficulty: 'intermediate',
  importance: 3,
  order: 1,
  prerequisites: ['oop-composition-vs-inheritance'],
  summary:
    'Low coupling and high cohesion as the compass for modular design — how to recognize and improve both.',
  keywords: [
    'coupling',
    'cohesion',
    'modular design',
    'loose coupling',
    'high cohesion',
  ],
  why: `Every LLD scorecard quietly grades coupling and cohesion. Tight coupling makes change explode across files; low cohesion produces "Utils" god classes that do everything poorly. Naming these smells lets you defend design choices in interviews and PRs.`,
  theory: [
    'Coupling: how much one module knows about another. High coupling = changes ripple. Aim for loose coupling via interfaces, events, and narrow APIs.',
    'Cohesion: how strongly responsibilities inside a module belong together. High cohesion = one clear reason to change.',
    'Types of coupling (worse → better intuition): content/pathological (touching internals), common (shared global data), control (flags dictating behavior), stamp (sharing fat structs), data (sharing only needed params), message (interfaces/events).',
    'Types of cohesion (worse → better): coincidental, logical, temporal, procedural, communicational, sequential, functional (best — one focused task).',
    'DI and interfaces reduce coupling to concretes. Packages/modules with clear boundaries reduce accidental coupling.',
    'Trade-off: zero coupling is impossible in a working system. Optimize for change: couple along stable abstractions.',
    'Concrete follow-up: Law of Demeter (oop-law-of-demeter) is a method-level rule for keeping coupling low — avoid train-wreck getter chains into friends of friends.',
  ],
  mentalModel: `Coupling is how tangled the headphone wires are between boxes. Cohesion is whether each box contains one gadget or a junk drawer. You want separate boxes (low coupling) each with one clear gadget (high cohesion).`,
  codeTitle: 'Loose coupling with cohesive collaborators',
  code: `public class Demo {
    interface OrderRepository {
        void save(Order order);
    }

    interface Notifier {
        void sendReceipt(Order order);
    }

    interface TaxPolicy {
        int taxCents(int subtotalCents);
    }

    static final class Order {
        final String id;
        final int subtotalCents;

        Order(String id, int subtotalCents) {
            this.id = id;
            this.subtotalCents = subtotalCents;
        }
    }

    static final class PlaceOrderService {
        private final OrderRepository repo;
        private final Notifier notifier;
        private final TaxPolicy tax;

        PlaceOrderService(OrderRepository repo, Notifier notifier, TaxPolicy tax) {
            this.repo = repo;
            this.notifier = notifier;
            this.tax = tax;
        }

        int place(Order order) {
            int total = order.subtotalCents + tax.taxCents(order.subtotalCents);
            repo.save(order);
            notifier.sendReceipt(order);
            return total;
        }
    }

    static final class FlatTax implements TaxPolicy {
        public int taxCents(int subtotalCents) {
            return subtotalCents * 18 / 100;
        }
    }

    static final class InMemoryOrders implements OrderRepository {
        public void save(Order order) {
            System.out.println("saved " + order.id);
        }
    }

    static final class ConsoleNotifier implements Notifier {
        public void sendReceipt(Order order) {
            System.out.println("receipt " + order.id);
        }
    }

    public static void main(String[] args) {
        PlaceOrderService svc = new PlaceOrderService(
            new InMemoryOrders(), new ConsoleNotifier(), new FlatTax());
        int total = svc.place(new Order("o1", 1000));
        System.out.println("total=" + total);
    }
}`,
  output: `saved o1
receipt o1
total=1180`,
  explain: [
    'PlaceOrderService has one job: orchestrate placing an order — higher cohesion.',
    'Depending on OrderRepository, Notifier, and TaxPolicy loosens coupling to infrastructure details.',
    'You can test PlaceOrderService with fakes without a real database.',
  ],
  mistakes: [
    'Creating an interface for every class blindly (ceremony) without reducing real coupling.',
    'A "Helper"/"Manager"/"Util" dumping ground — coincidental cohesion.',
    'Passing god objects (huge context blobs) — stamp coupling.',
    'Circular package dependencies — structural high coupling.',
  ],
  interviewAsk: 'What are coupling and cohesion? How do you improve them?',
  interviewAnswer:
    'Coupling is inter-module dependency strength; cohesion is intra-module focus. Improve by giving each class one reason to change, depending on narrow interfaces, injecting collaborators, and avoiding shared mutable globals. Measure by how many files a typical change touches.',
  interviewTraps: [
    'Saying microservices automatically mean low coupling — distributed coupling can be worse.',
    'Confusing cohesion with "lots of methods" — many methods can still be cohesive if they serve one purpose.',
  ],
  quiz: [
    {
      question: 'A class named UserOrderEmailPdfTaxHelper most likely suffers from:',
      options: [
        'High cohesion',
        'Low cohesion (many unrelated responsibilities)',
        'Only inheritance issues',
        'Too much encapsulation',
      ],
      correctIndex: 1,
      explain: 'The name lists unrelated jobs — classic low cohesion / god-helper smell.',
    },
  ],
  practice:
    'Take a ReportGenerator that loads SQL, formats HTML, and emails the result. Split into three cohesive types and a thin orchestrator. List what each depends on.',
  practiceHints: [
    'ReportRepository, ReportFormatter, ReportMailer, GenerateReportService.',
    'Orchestrator depends on abstractions; concretes live at the edges.',
  ],
});
