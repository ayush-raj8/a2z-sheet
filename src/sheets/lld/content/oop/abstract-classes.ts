import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-abstract-classes',
  title: 'Abstract Classes',
  section: 'oop',
  chapter: 'Abstraction',
  difficulty: 'intermediate',
  importance: 3,
  order: 1,
  prerequisites: ['oop-inheritance', 'oop-method-overriding'],
  summary:
    'An abstract class is a partial implementation: it can hold state, constructors, and concrete methods, and force subclasses to fill in abstract methods.',
  keywords: ['abstract class', 'abstract method', 'extends', 'template', 'skeletal implementation'],
  why:
    'Abstract classes power Template Method and shared hierarchies (AbstractList, InputStream). Interviews ask when to use them instead of interfaces — and what you cannot do with them.',
  theory: [
    'Declare with abstract class. You cannot new an abstract class directly.',
    'Abstract methods have no body and must be implemented by concrete subclasses (unless those subclasses are also abstract).',
    'Abstract classes may include fields, constructors, concrete methods, and static members — shared code and state for a family of types.',
    'A class extends at most one abstract (or concrete) class — single inheritance of implementation.',
    'Constructors run in the normal chain: subclass → super(...) → abstract class initialization.',
    'Use when subclasses share algorithm structure or fields and form a true is-a family.',
    'Prefer interfaces when you only need a capability contract across unrelated types.',
  ],
  mentalModel:
    'An unfinished house blueprint: walls and plumbing are already drawn (concrete methods/state); each builder must finish the kitchen layout (abstract methods) their own way — but everyone still lives in the same house family.',
  moreExamples: [
    {
      title: '1) Abstract shape with shared state + forced area()',
      code: `public class AbstractClassDemo {
    abstract static class Shape {
        private final String name;

        Shape(String name) {
            this.name = name;
        }

        String name() {
            return name;
        }

        abstract double area();

        String describe() {
            return name + " area=" + area();
        }
    }

    static class Circle extends Shape {
        private final double r;

        Circle(double r) {
            super("circle");
            this.r = r;
        }

        @Override
        double area() {
            return Math.PI * r * r;
        }
    }

    static class Rectangle extends Shape {
        private final double w;
        private final double h;

        Rectangle(double w, double h) {
            super("rect");
            this.w = w;
            this.h = h;
        }

        @Override
        double area() {
            return w * h;
        }
    }

    public static void main(String[] args) {
        Shape a = new Circle(2);
        Shape b = new Rectangle(3, 4);
        System.out.println(a.describe());
        System.out.println(b.describe());
        // Shape s = new Shape("x"); // COMPILE ERROR — abstract
    }
}`,
      output: `circle area=12.566370614359172
rect area=12.0`,
      explain: [
        'Shape holds shared field name and concrete describe().',
        'area() is abstract — Circle and Rectangle must implement it.',
        'You cannot instantiate Shape itself.',
      ],
    },
    {
      title: '2) Skeletal template — shared algorithm, custom step',
      code: `import java.util.Locale;

public class AbstractTemplateDemo {
    abstract static class Report {
        final String build() {
            return header() + "\\n" + body() + "\\n" + footer();
        }

        String header() {
            return "REPORT";
        }

        abstract String body();

        String footer() {
            return "END";
        }
    }

    static class SalesReport extends Report {
        @Override
        String body() {
            return "sales=42";
        }
    }

    public static void main(String[] args) {
        Report r = new SalesReport();
        System.out.println(r.build().toLowerCase(Locale.ROOT));
    }
}`,
      output: `report
sales=42
end`,
      explain: [
        'build() is the template; subclasses only override body().',
        'This is the Template Method pattern using an abstract class.',
        'Shared header/footer stay in one place — high cohesion for the algorithm.',
      ],
    },
  ],
  mistakes: [
    'Creating an abstract class that has zero abstract methods and zero shared code — usually an interface would do.',
    'Trying to extend two abstract classes.',
    'Forgetting that abstract class constructors exist and must be chained with super(...).',
  ],
  interviewAsk: 'What can an abstract class have that a pre-Java-8 interface could not?',
  interviewAnswer:
    'Instance fields, constructors, and arbitrary concrete instance methods with shared mutable state. Even today, abstract classes are the tool when subclasses need protected state and a constructor-enforced invariant. Interfaces are for capabilities; abstract classes are for partial implementations in one hierarchy.',
  interviewTraps: [
    'Saying abstract classes are obsolete because of default methods.',
  ],
  quiz: [
    {
      question: 'Which is true?',
      options: [
        'You can new an abstract class if it has no abstract methods',
        'A concrete subclass must implement all inherited abstract methods',
        'A class can extend multiple abstract classes',
        'Abstract methods may be private',
      ],
      correctIndex: 1,
      explain: 'Concrete types must implement every abstract method from parents. Abstract classes cannot be instantiated. Private abstract methods are illegal.',
    },
  ],
  practice:
    'Create abstract class Employee with name + abstract pay(). Implement SalariedEmployee and HourlyEmployee. Print a payroll list typed as List<Employee>.',
});
