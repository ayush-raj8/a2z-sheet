import { lesson } from '../lessonFactory';

export default lesson({
  id: 'solid-srp',
  title: 'Single Responsibility Principle',
  section: 'solid',
  chapter: 'SOLID Principles',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['oop-coupling-cohesion'],
  summary:
    'A module should have one reason to change — split mixed concerns with a clear before/after design.',
  keywords: ['SRP', 'SOLID', 'single responsibility', 'reasons to change'],
  why: `SRP is the gateway SOLID principle. Classes that print reports, send email, and talk to SQL change for unrelated reasons and become untestable. Interviews love a "bad then good" SRP refactor.`,
  theory: [
    'Single Responsibility: a class/module should have one reason to change — one axis of responsibility, not literally one method.',
    'Responsibilities are about actors/stakeholders: policy change vs formatting change vs persistence change.',
    'Fat services and "Manager" classes usually violate SRP by coordinating + implementing every detail.',
    'Splitting too early can create needless indirection — apply when reasons to change actually diverge.',
    'High cohesion is SRP’s friend; low cohesion is the smell.',
  ],
  mentalModel: `One employee, one job description. When HR, finance, and facilities all rewrite the same person’s duties, you have an SRP violation.`,
  moreExamples: [
    {
      title: 'Bad: one class, many reasons to change',
      code: `import java.util.*;

// BAD — changes for: employee fields, pay policy, AND report format
class Employee {
    String name;
    double hours;
    double rate;

    double pay() { return hours * rate; } // payroll policy

    String htmlReport() { // presentation
        return "<h1>" + name + "</h1><p>pay=" + pay() + "</p>";
    }

    void save() { // persistence
        System.out.println("SQL INSERT " + name + " " + pay());
    }
}

public class BadDemo {
    public static void main(String[] args) {
        Employee e = new Employee();
        e.name = "Ada"; e.hours = 40; e.rate = 50;
        System.out.println(e.htmlReport());
        e.save();
    }
}`,
      output: `<h1>Ada</h1><p>pay=2000.0</p>
SQL INSERT Ada 2000.0`,
      explain: [
        'Payroll rules, HTML, and SQL all live together — three stakeholders can force edits.',
        'You cannot reuse pay calculation without dragging report/DB code.',
      ],
    },
    {
      title: 'Good: split by reason to change',
      code: `final class Employee {
    private final String name;
    private final double hours;
    private final double rate;

    Employee(String name, double hours, double rate) {
        this.name = name; this.hours = hours; this.rate = rate;
    }
    String name() { return name; }
    double hours() { return hours; }
    double rate() { return rate; }
}

final class PayCalculator {
    double pay(Employee e) { return e.hours() * e.rate(); }
}

final class EmployeeReporter {
    String html(Employee e, double pay) {
        return "<h1>" + e.name() + "</h1><p>pay=" + pay + "</p>";
    }
}

final class EmployeeRepository {
    void save(Employee e, double pay) {
        System.out.println("SQL INSERT " + e.name() + " " + pay);
    }
}

public class GoodDemo {
    public static void main(String[] args) {
        Employee e = new Employee("Ada", 40, 50);
        PayCalculator calc = new PayCalculator();
        double pay = calc.pay(e);
        System.out.println(new EmployeeReporter().html(e, pay));
        new EmployeeRepository().save(e, pay);
    }
}`,
      output: `<h1>Ada</h1><p>pay=2000.0</p>
SQL INSERT Ada 2000.0`,
      explain: [
        'Pay policy can change without touching HTML or SQL.',
        'Each type is independently testable and reusable.',
        'Employee is now mostly data/invariants — domain core stays thin.',
      ],
    },
  ],
  mistakes: [
    'Interpreting SRP as "only one method per class".',
    'Splitting into micro-classes that always change together (over-fragmentation).',
    'Keeping orchestration + infrastructure in one "Service" forever without seams.',
  ],
  interviewAsk: 'Explain SRP with an example of a violation and a fix.',
  interviewAnswer:
    'SRP means one reason to change. An Employee that calculates pay, renders HTML, and saves to SQL changes for payroll, UI, and DB reasons. Split into PayCalculator, EmployeeReporter, and EmployeeRepository so each axis evolves independently while a thin use-case wires them.',
  interviewTraps: [
    'Equating SRP with microservices.',
    'Saying any class with two methods violates SRP.',
  ],
  quiz: {
    question: 'Which is the best SRP smell?',
    options: [
      'A class with two private helpers for one use case',
      'A class edited by payroll, UI, and DBA teams for unrelated reasons',
      'Using interfaces',
      'Immutable fields',
    ],
    correctIndex: 1,
    explain: 'Multiple unrelated reasons/actors forcing change is the classic SRP signal.',
  },
  practice:
    'Refactor a UserController that validates input, hashes passwords, writes SQL, and sends welcome email into cohesive types. Name each responsibility.',
  practiceHints: [
    'Validator, PasswordHasher, UserRepository, WelcomeMailer, RegisterUserService.',
  ],
});
