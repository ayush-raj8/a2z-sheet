import { lesson } from '../lessonFactory';

export default lesson({
  id: 'solid-ocp',
  title: 'Open–Closed Principle',
  section: 'solid',
  chapter: 'SOLID Principles',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['solid-srp'],
  summary:
    'Open for extension, closed for modification — add behavior via new types, not endless if/switch edits.',
  keywords: ['OCP', 'SOLID', 'open closed', 'extension', 'strategy'],
  why: `Every new payment method or notification channel that forces you to edit a central switch is an OCP miss. In interviews, showing how polymorphism or strategies let you add a type without touching stable code is a strong signal.`,
  theory: [
    'Open–Closed: software entities should be open for extension but closed for modification of existing, working code.',
    'Extend by adding new classes that implement a stable abstraction; avoid repeatedly editing the same switch.',
    'Techniques: Strategy, Decorator, Template Method, plugin registries, sealed hierarchies with pattern matching (careful — still a closed set).',
    'You cannot close everything. Close the volatile axis (pricing rules, exporters) behind interfaces; keep wiring at the edges.',
    'OCP works with SRP: once responsibilities are split, the stable orchestrator depends on abstractions that new variants satisfy.',
  ],
  mentalModel: `A power strip is closed (you don’t rewire it) yet open (you plug in new devices). OCP is designing sockets, not soldering every gadget into the wall.`,
  codeTitle: 'Switch vs strategy (extend without editing)',
  code: `// BAD — every new shape edits AreaCalc
class BadAreaCalc {
    double area(String type, double a, double b) {
        if (type.equals("rect")) return a * b;
        if (type.equals("circle")) return Math.PI * a * a;
        throw new IllegalArgumentException(type);
    }
}

// GOOD — add Triangle without changing AreaService
interface Shape {
    double area();
}

class Rect implements Shape {
    private final double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
}

class Triangle implements Shape { // extension
    private final double b, h;
    Triangle(double b, double h) { this.b = b; this.h = h; }
    public double area() { return 0.5 * b * h; }
}

class AreaService {
    double total(Shape... shapes) {
        double sum = 0;
        for (Shape s : shapes) sum += s.area();
        return sum;
    }
}

public class Demo {
    public static void main(String[] args) {
        AreaService svc = new AreaService();
        double t = svc.total(new Rect(3, 4), new Circle(1), new Triangle(3, 4));
        System.out.printf(java.util.Locale.US, "%.2f%n", t);
    }
}`,
  output: `17.14`,
  explain: [
    'BadAreaCalc must be modified for every new shape — not closed.',
    'Shape.area() is the extension point; Triangle plugs in without editing AreaService.',
    'Output ≈ 12 + π + 6 ≈ 17.14.',
  ],
  mistakes: [
    'Huge speculative interface hierarchies "just in case" (YAGNI conflict).',
    'Claiming OCP means never changing any file — wiring/main still changes.',
    'Switching on type codes after introducing polymorphism (worst of both worlds).',
  ],
  interviewAsk: 'How do you apply OCP when adding a new payment method?',
  interviewAnswer:
    'Define a PaymentMethod abstraction with pay(). Existing checkout code depends on that interface. Adding UPI means a new class, registered in composition root — not another branch inside a god switch. Modify only the wiring, not the core flow.',
  interviewTraps: [
    'Saying inheritance is the only extension mechanism — composition/strategies count.',
  ],
  quiz: {
    question: 'OCP is best satisfied when a new feature requires:',
    options: [
      'Editing every method of a god class',
      'Adding a new implementing type and wiring it',
      'Copy-pasting the service for each variant',
      'Removing all interfaces',
    ],
    correctIndex: 1,
    explain: 'Extension via new types behind a stable abstraction is the OCP ideal.',
  },
  practice:
    'Replace a switch(format) that exports CSV/JSON with an ExportFormat interface and two implementations. Add XML without editing the exporter loop.',
  practiceHints: [
    'interface ExportFormat { String export(Order o); }',
    'Registry Map<String, ExportFormat> at the edge is fine.',
  ],
});
