import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-decorator',
  title: 'Decorator Pattern',
  section: 'patterns',
  chapter: 'Structural',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-adapter'],
  summary:
    'Attach additional responsibilities to an object dynamically by wrapping it with same-interface decorators — compose behaviors without subclass explosion.',
  keywords: ['decorator', 'wrapper', 'open-closed', 'java io'],
  why:
    'Subclassing for every combo (CompressedEncryptedLoggedStream) explodes. Decorator lets you stack behaviors at runtime — Java I/O streams are the textbook example interviewers expect.',
  theory: [
    'Intent: add responsibilities without altering the original class or interface.',
    'Structure: Component interface, ConcreteComponent, Decorator base holding a Component, ConcreteDecorators add behavior before/after delegate calls.',
    'Preserves interface — clients still see Component.',
    'Composition over inheritance for cross-cutting features: logging, caching, retry, compression.',
    'Order of wrapping matters: Encrypt(Compress(x)) ≠ Compress(Encrypt(x)).',
    'java.io: InputStream → BufferedInputStream → GZIPInputStream chains.',
    'Differs from Proxy: Proxy controls access; Decorator adds features. Differs from Adapter: same interface vs different interface.',
  ],
  mentalModel:
    'Coffee shop: Espresso is the base drink. Milk, Mocha, Whip are wrappers that each add cost and description but are still a Beverage. You stack toppings without inventing MochaWhipMilkEspresso subclasses.',
  codeTitle: 'Beverage Decorator',
  code: `interface Beverage {
    String description();
    int cost(); // paise
}

class Espresso implements Beverage {
    public String description() { return "Espresso"; }
    public int cost() { return 10000; }
}

abstract class BeverageDecorator implements Beverage {
    protected final Beverage inner;
    BeverageDecorator(Beverage inner) { this.inner = inner; }
}

class Milk extends BeverageDecorator {
    Milk(Beverage inner) { super(inner); }
    public String description() { return inner.description() + ", Milk"; }
    public int cost() { return inner.cost() + 2000; }
}

class Mocha extends BeverageDecorator {
    Mocha(Beverage inner) { super(inner); }
    public String description() { return inner.description() + ", Mocha"; }
    public int cost() { return inner.cost() + 3000; }
}

public class Demo {
    public static void main(String[] args) {
        Beverage b = new Mocha(new Milk(new Espresso()));
        System.out.println(b.description() + " = " + b.cost());
    }
}`,
  output: `Espresso, Milk, Mocha = 15000`,
  explain: [
    'Each decorator implements Beverage and delegates to inner.',
    'Stacking creates combinations without new subclasses per combo.',
    'Cost/description accumulate outward.',
  ],
  mermaid: `flowchart LR
    C[Client] --> M[Mocha]
    M --> L[Milk]
    L --> E[Espresso]`,
  mistakes: [
    'Decorators that change the interface — that becomes Adapter.',
    'Forgetting to delegate to inner for methods you do not override.',
    'Creating a decorator for a one-off change better done as a simple subclass or function.',
    'Huge decorator chains that obscure debugging — document order and keep each decorator focused.',
  ],
  interviewAsk: 'Where have you seen Decorator in the JDK, and how is it different from inheritance?',
  interviewAnswer:
    'java.io stream wrappers and java.util Collections.unmodifiable*/synchronized* wrappers. Inheritance bakes combinations at compile time; Decorator composes at runtime while preserving the type. Mention Open/Closed: extend behavior by wrapping, not editing the base class.',
  interviewTraps: [
    'Confusing with Adapter because both wrap.',
    'Ignoring wrapping order side effects.',
  ],
  quiz: {
    question: 'Decorator differs from Adapter mainly because Decorator:',
    options: [
      'Always uses inheritance from adaptee',
      'Keeps the same interface and adds behavior',
      'Must be a Singleton',
      'Cannot nest',
    ],
    correctIndex: 1,
    explain: 'Decorator enhances while preserving the Component contract; Adapter translates contracts.',
  },
  practice:
    'Wrap a DataSource with LoggingDataSource and CachingDataSource decorators. Show read() hitting cache on second call.',
  practiceHints: [
    'Both decorators implement DataSource.',
    'Caching decorator holds a Map and delegates on miss.',
  ],
});
