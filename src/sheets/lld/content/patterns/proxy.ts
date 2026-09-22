import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-proxy',
  title: 'Proxy Pattern',
  section: 'patterns',
  chapter: 'Structural',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-decorator'],
  summary:
    'Provide a surrogate that controls access to a real object — lazy loading, access control, remote calls, logging, and caching at the boundary.',
  keywords: ['proxy', 'virtual proxy', 'protection proxy', 'remote proxy'],
  why:
    'Proxies show up as ORM lazy loading, API gateways, security wrappers, and RPC stubs. Interviewers ask you to distinguish Proxy from Decorator — both wrap, different intent.',
  theory: [
    'Intent: control access to an object via a stand-in with the same interface.',
    'Virtual proxy: lazy-create expensive objects on first use.',
    'Protection proxy: enforce authz before forwarding.',
    'Remote proxy: local representative for an object in another address space (RMI/gRPC stubs).',
    'Smart reference: reference counting, locking, logging, caching.',
    'Same interface as Subject — client cannot tell it is talking to a proxy.',
    'vs Decorator: Proxy controls access/lifecycle; Decorator adds responsibilities. Implementation can look similar; intent differs.',
    'Java dynamic proxies (java.lang.reflect.Proxy) and Spring AOP often generate proxies at runtime.',
  ],
  mentalModel:
    'A celebrity’s bodyguard: fans talk to the bodyguard first. Same “person interface” for signing autographs, but access is gated, and the celebrity may not even be present until needed (lazy).',
  codeTitle: 'Virtual + protection Image Proxy',
  code: `interface Image {
    void display();
}

class RealImage implements Image {
    private final String path;
    RealImage(String path) {
        this.path = path;
        loadFromDisk();
    }
    private void loadFromDisk() {
        System.out.println("Loading " + path);
    }
    public void display() {
        System.out.println("Displaying " + path);
    }
}

class ImageProxy implements Image {
    private final String path;
    private final boolean canView;
    private RealImage real;

    ImageProxy(String path, boolean canView) {
        this.path = path;
        this.canView = canView;
    }

    public void display() {
        if (!canView) {
            System.out.println("Access denied");
            return;
        }
        if (real == null) real = new RealImage(path);
        real.display();
    }
}

public class Demo {
    public static void main(String[] args) {
        Image img = new ImageProxy("/cat.png", true);
        img.display(); // loads then displays
        img.display(); // no reload
        Image secret = new ImageProxy("/secret.png", false);
        secret.display();
    }
}`,
  output: `Loading /cat.png
Displaying /cat.png
Displaying /cat.png
Access denied`,
  explain: [
    'RealImage construction (expensive load) deferred until first authorized display.',
    'Second display reuses the cached RealImage.',
    'Protection check happens before any load.',
  ],
  mermaid: `sequenceDiagram
    participant C as Client
    participant P as ImageProxy
    participant R as RealImage
    C->>P: display()
    P->>P: auth check
    alt first time
      P->>R: new RealImage
      R-->>P: loaded
    end
    P->>R: display()
    R-->>C: pixels`,
  mistakes: [
    'Using Proxy when you only want to add features without access control — Decorator may be clearer.',
    'Leaking RealSubject type to clients.',
    'Forgetting thread-safety when lazy-initing the real subject under concurrency.',
  ],
  interviewAsk: 'Proxy vs Decorator — same code shape, how do you explain the difference?',
  interviewAnswer:
    'Both implement the same interface and wrap an object. Proxy’s purpose is access control, laziness, remoting, or lifecycle. Decorator’s purpose is to add optional behaviors composably. In review, name the intent; do not rely on class names alone.',
  interviewTraps: [
    'Saying they are identical.',
    'Ignoring remote/virtual/protection variants.',
  ],
  quiz: {
    question: 'A virtual proxy is mainly used to:',
    options: [
      'Change an interface',
      'Defer creation of an expensive object until needed',
      'Guarantee a single instance process-wide',
      'Replace inheritance',
    ],
    correctIndex: 1,
    explain: 'Virtual proxies lazy-load the real subject.',
  },
  practice:
    'Implement a BankAccountProxy that checks a role before allowing withdraw(). Deny with a message for non-OWNER roles without touching the real account.',
  practiceHints: [
    'Same Account interface on RealAccount and Proxy.',
    'Hold role on the proxy, not the real account.',
  ],
});
