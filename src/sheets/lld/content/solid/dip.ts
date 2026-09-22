import { lesson } from '../lessonFactory';

export default lesson({
  id: 'solid-dip',
  title: 'Dependency Inversion Principle',
  section: 'solid',
  chapter: 'SOLID Principles',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['solid-isp'],
  summary:
    'High-level modules should depend on abstractions, not low-level details — invert the ownership of interfaces.',
  keywords: [
    'DIP',
    'dependency inversion',
    'dependency injection',
    'SOLID',
    'abstractions',
  ],
  why: `When domain services new up MySqlRepository and SmtpClient, business logic cannot be tested or reused. DIP + injection is how you keep use cases stable while infrastructure churns — a staple of clean architecture talk in senior interviews.`,
  theory: [
    'Dependency Inversion: (1) High-level modules should not depend on low-level modules; both should depend on abstractions. (2) Abstractions should not depend on details; details depend on abstractions.',
    'The interface belongs with the consumer (policy), not buried inside the database driver library.',
    'Dependency Injection is a technique to realize DIP (constructor/param injection). DI ≠ DIP, but they collaborate.',
    'Composition root (main/Spring config) wires concretes; domain stays pure.',
    'Over-abstracting stable stdlib calls (e.g., wrapping String) is ceremony — invert volatile boundaries (DB, HTTP, clock, randomness).',
  ],
  mentalModel: `Policy is a boss who writes a job description (interface). Workers (MySQL, Redis) apply to that description. The boss never walks into the server room to rewire cables — that’s DIP.`,
  moreExamples: [
    {
      title: 'Bad: high-level depends on concrete low-level',
      code: `class MySqlUserDb {
    String findEmail(String id) {
        return id + "@db.example"; // pretend SQL
    }
}

class WelcomeService { // high-level glued to MySQL
    void welcome(String userId) {
        MySqlUserDb db = new MySqlUserDb();
        System.out.println("Welcome " + db.findEmail(userId));
    }
}

public class BadDemo {
    public static void main(String[] args) {
        new WelcomeService().welcome("ada");
    }
}`,
      output: `Welcome ada@db.example`,
      explain: [
        'WelcomeService cannot run without MySQL semantics.',
        'Testing requires a database or rewriting the class.',
      ],
    },
    {
      title: 'Good: both depend on abstraction',
      code: `interface UserDirectory { // owned by the policy side
    String findEmail(String id);
}

class MySqlUserDirectory implements UserDirectory {
    public String findEmail(String id) { return id + "@db.example"; }
}

class InMemoryUserDirectory implements UserDirectory {
    public String findEmail(String id) { return id + "@mem.test"; }
}

class WelcomeService {
    private final UserDirectory users;
    WelcomeService(UserDirectory users) { this.users = users; }
    void welcome(String userId) {
        System.out.println("Welcome " + users.findEmail(userId));
    }
}

public class GoodDemo {
    public static void main(String[] args) {
        new WelcomeService(new MySqlUserDirectory()).welcome("ada");
        new WelcomeService(new InMemoryUserDirectory()).welcome("ada");
    }
}`,
      output: `Welcome ada@db.example
Welcome ada@mem.test`,
      explain: [
        'WelcomeService depends only on UserDirectory.',
        'MySQL and in-memory details both depend on that abstraction.',
        'Tests inject InMemoryUserDirectory — DIP in action.',
      ],
    },
  ],
  mistakes: [
    'new Concrete() deep inside domain methods.',
    'Service locators / global registries hiding dependencies.',
    'Interfaces defined in the infrastructure jar that the domain must import (wrong ownership).',
    'Injecting everything including immutable config strings via heavy frameworks without need.',
  ],
  interviewAsk: 'Difference between Dependency Inversion and Dependency Injection?',
  interviewAnswer:
    'DIP is a design rule: depend on abstractions, and keep those abstractions owned by high-level policy. Dependency Injection is a mechanism for supplying concrete implementations (constructors, containers). You can inject concretes and still violate DIP if there is no abstraction; you can use DIP with manual wiring and no Spring.',
  interviewTraps: [
    'Equating DIP with “use Spring”.',
    'Saying low-level modules should never be referenced even at the composition root.',
  ],
  quiz: {
    question: 'Where should the UserRepository interface usually live in a DIP-friendly layout?',
    options: [
      'Inside the JDBC driver package only',
      'With the high-level domain/application that needs it',
      'Only as a private inner class of MySqlUserRepository',
      'In the UI CSS bundle',
    ],
    correctIndex: 1,
    explain: 'Abstractions belong with the consumer/policy; details implement them.',
  },
  practice:
    'Refactor an OrderService that news StripeClient and PostgresOrderDao to depend on PaymentGateway and OrderRepository abstractions. Show a main() composition root.',
  practiceHints: [
    'Constructor injection of interfaces.',
    'main wires StripeClient and PostgresOrderDao.',
  ],
});
