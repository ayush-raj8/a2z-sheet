import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-facade',
  title: 'Facade Pattern',
  section: 'patterns',
  chapter: 'Structural',
  difficulty: 'beginner',
  importance: 2,
  summary:
    'Provide a simplified unified interface to a complex subsystem — hide wiring of many classes behind a clean entry point.',
  keywords: ['facade', 'subsystem', 'api design', 'structural'],
  why:
    'LLD interviews reward clean boundaries. Facade shows you can hide inventory, payment, shipping orchestration behind PlaceOrderService without dumping complexity on controllers.',
  theory: [
    'Intent: provide a unified interface to a set of interfaces in a subsystem.',
    'Facade does not add new capability — it simplifies access and reduces coupling to internals.',
    'Clients talk to Facade; subsystem classes still exist and can be used advancedly if needed.',
    'Unlike Adapter: no interface translation of one class; orchestration/simplification of many.',
    'Unlike Mediator: Facade is a one-way simplification for clients; Mediator centralizes peer communication.',
    'Good facades are thin: validate, call collaborators in order, map errors — business rules stay in domain services.',
    'Layered architectures often expose application-service facades over domain + infrastructure.',
  ],
  mentalModel:
    'A hotel concierge: you say "plan my evening" instead of separately calling restaurant, taxi, and theater. The concierge knows the subsystem; you get one simple conversation.',
  codeTitle: 'HomeTheater Facade',
  code: `class Amplifier {
    void on() { System.out.println("Amp on"); }
    void setVolume(int v) { System.out.println("Vol " + v); }
}
class Projector {
    void on() { System.out.println("Projector on"); }
    void wideScreen() { System.out.println("Wide screen"); }
}
class StreamingPlayer {
    void on() { System.out.println("Player on"); }
    void play(String movie) { System.out.println("Playing " + movie); }
}

class HomeTheaterFacade {
    private final Amplifier amp;
    private final Projector projector;
    private final StreamingPlayer player;

    HomeTheaterFacade(Amplifier amp, Projector projector, StreamingPlayer player) {
        this.amp = amp;
        this.projector = projector;
        this.player = player;
    }

    void watchMovie(String movie) {
        projector.on();
        projector.wideScreen();
        amp.on();
        amp.setVolume(5);
        player.on();
        player.play(movie);
    }
}

public class Demo {
    public static void main(String[] args) {
        HomeTheaterFacade theater = new HomeTheaterFacade(
            new Amplifier(), new Projector(), new StreamingPlayer());
        theater.watchMovie("Inception");
    }
}`,
  output: `Projector on
Wide screen
Amp on
Vol 5
Player on
Playing Inception`,
  explain: [
    'Client calls one method instead of six.',
    'Subsystem classes remain independently usable.',
    'Facade owns the happy-path choreography.',
  ],
  mermaid: `flowchart TB
    Client --> Facade
    Facade --> Amp
    Facade --> Projector
    Facade --> Player`,
  mistakes: [
    'God Facade that knows every detail of the company — split by bounded context.',
    'Putting all business logic only in the Facade and anemic domain objects.',
    'Calling everything a Facade when it is really just a random util class.',
  ],
  interviewAsk: 'When is Facade the right answer in an LLD interview?',
  interviewAnswer:
    'When the client (controller/UI) would otherwise depend on many subsystem classes and a stable, coarse API improves clarity. Show the facade method sequence and clarify it does not replace domain modeling — it orchestrates. Contrast with Adapter if the question is about interface mismatch.',
  interviewTraps: [
    'Using Facade to hide a poor design forever instead of fixing boundaries.',
    'Equating Facade with Microservice API Gateway without nuance.',
  ],
  quiz: {
    question: 'A Facade primarily:',
    options: [
      'Changes an interface to another incompatible one',
      'Simplifies access to a complex subsystem',
      'Ensures only one instance exists',
      'Adds behavior while keeping the same interface',
    ],
    correctIndex: 1,
    explain: 'Simplification/orchestration is the Facade job; Adapter/Decorator/Singleton are different concerns.',
  },
  practice:
    'Design OrderFacade.placeOrder(cartId, userId) that coordinates InventoryService, PaymentService, and ShippingService. Sketch failure handling if payment fails after inventory reserve.',
  practiceHints: [
    'Reserve → pay → ship; compensate/release on failure.',
    'Keep domain rules inside services; facade orchestrates.',
  ],
});
