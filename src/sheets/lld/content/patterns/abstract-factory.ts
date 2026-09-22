import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-abstract-factory',
  title: 'Abstract Factory Pattern',
  section: 'patterns',
  chapter: 'Creational',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-factory-method'],
  summary:
    'Provide an interface for creating families of related products without specifying concrete classes — keep UI themes, cloud providers, or DB dialects consistent.',
  keywords: ['abstract factory', 'product family', 'creational', 'consistency'],
  why:
    'When products must match as a set (DarkButton + DarkCheckbox, or AwsQueue + AwsStorage), Abstract Factory prevents mismatched combinations and centralizes environment-specific wiring.',
  theory: [
    'Intent: create families of related objects without coupling to concretes.',
    'Structure: AbstractFactory with createX/createY methods; ConcreteFactories per family; Abstract Products + Concrete Products.',
    'Client depends only on abstract factory and product interfaces.',
    'Guarantees consistency: a WindowsFactory always returns WindowsButton + WindowsCheckbox together.',
    'Differs from Factory Method: focuses on multiple related products via composition (a factory object), not one product via subclassing.',
    'Often configured once at startup (DI container binds AwsFactory or GcpFactory) and injected everywhere.',
    'Cost: many interfaces/classes; overkill when you only have one product type.',
  ],
  mentalModel:
    'A furniture store sells Modern or Victorian sets. You never mix a Modern chair with a Victorian sofa. The "ModernFactory" stamps out matching pieces; switching the factory switches the whole look.',
  codeTitle: 'UI theme Abstract Factory',
  code: `interface Button { void paint(); }
interface Checkbox { void paint(); }

class DarkButton implements Button {
    public void paint() { System.out.println("Dark Button"); }
}
class DarkCheckbox implements Checkbox {
    public void paint() { System.out.println("Dark Checkbox"); }
}
class LightButton implements Button {
    public void paint() { System.out.println("Light Button"); }
}
class LightCheckbox implements Checkbox {
    public void paint() { System.out.println("Light Checkbox"); }
}

interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class DarkUIFactory implements UIFactory {
    public Button createButton() { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

class LightUIFactory implements UIFactory {
    public Button createButton() { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}

class Application {
    private final Button button;
    private final Checkbox checkbox;

    Application(UIFactory factory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }

    void render() {
        button.paint();
        checkbox.paint();
    }
}

public class Demo {
    public static void main(String[] args) {
        UIFactory factory = args.length > 0 && args[0].equals("light")
            ? new LightUIFactory() : new DarkUIFactory();
        new Application(factory).render();
    }
}`,
  output: `Dark Button
Dark Checkbox`,
  explain: [
    'Application never mentions Dark* or Light* types.',
    'Swapping UIFactory swaps the entire product family consistently.',
    'Adding a HighContrastFactory requires new product classes + one factory — clients stay closed.',
  ],
  mermaid: `classDiagram
    class UIFactory {
      <<interface>>
      +createButton() Button
      +createCheckbox() Checkbox
    }
    class DarkUIFactory
    class LightUIFactory
    class Button {
      <<interface>>
    }
    class Checkbox {
      <<interface>>
    }
    UIFactory <|.. DarkUIFactory
    UIFactory <|.. LightUIFactory
    DarkUIFactory ..> DarkButton : creates
    DarkUIFactory ..> DarkCheckbox : creates
    LightUIFactory ..> LightButton : creates
    LightUIFactory ..> LightCheckbox : creates`,
  mistakes: [
    'Using Abstract Factory when a single Factory Method would suffice — unnecessary complexity.',
    'Letting clients cast products to concretes — breaks the abstraction.',
    'Growing the factory interface every week with unrelated createZ methods — violates ISP; split factories.',
  ],
  interviewAsk: 'Difference between Abstract Factory and Factory Method?',
  interviewAnswer:
    'Factory Method uses inheritance: a creator subclass decides one product. Abstract Factory uses composition: a factory object creates a family of related products. Choose Abstract Factory when products must be consistent as a set and the family is selected at runtime/config.',
  interviewTraps: [
    'Treating them as synonyms.',
    'Forgetting the "family consistency" motivation.',
  ],
  quiz: {
    question: 'Abstract Factory primarily helps you:',
    options: [
      'Make a class immutable',
      'Create matching families of related products',
      'Replace inheritance with callbacks',
      'Serialize objects',
    ],
    correctIndex: 1,
    explain: 'The pattern exists to produce cohesive product sets without mixing families.',
  },
  practice:
    'Model PaymentGatewayFactory with createProcessor() and createRefundService() for Stripe vs Razorpay families. Show how checkout code stays gateway-agnostic.',
  practiceHints: [
    'Two abstract products, two concrete factories.',
    'Inject the factory into CheckoutService.',
  ],
});
