import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-factory-method',
  title: 'Factory Method Pattern',
  section: 'patterns',
  chapter: 'Creational',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['pattern-singleton'],
  summary:
    'Defer object creation to subclasses via a creator method so clients depend on product interfaces, not concrete classes.',
  keywords: ['factory method', 'creational', 'open-closed', 'polymorphism'],
  why:
    'Factory Method appears in frameworks (Java Streams collectors, Logger factories) and interview designs where new product types must be added without rewriting client switch statements.',
  theory: [
    'Intent: define an interface for creating an object, but let subclasses decide which class to instantiate.',
    'Problem it solves: client code full of if/else or switch on type strings to new ConcreteX().',
    'Structure: Product interface, ConcreteProducts, Creator with factoryMethod(), ConcreteCreators overriding it.',
    'Simple factory (not GoF): one class with create(type) switch — useful, but not the Factory Method pattern proper.',
    'Factory Method vs Abstract Factory: Factory Method creates one product family member via inheritance; Abstract Factory creates families via composition of factories.',
    'Aligns with Open/Closed: add a new product by adding a ConcreteCreator, not editing existing client logic.',
    'Often combined with Strategy or Template Method when the creator also defines a workflow around the product.',
  ],
  mentalModel:
    'A pizza restaurant chain has a common "order pizza" flow, but each city store decides which dough/sauce recipe object to create. The customer orders "pizza"; the store factory method decides NewYorkStyle vs ChicagoStyle.',
  codeTitle: 'Notification Factory Method',
  code: `interface Notification {
    void send(String to, String body);
}

class EmailNotification implements Notification {
    public void send(String to, String body) {
        System.out.println("Email -> " + to + ": " + body);
    }
}

class SmsNotification implements Notification {
    public void send(String to, String body) {
        System.out.println("SMS -> " + to + ": " + body);
    }
}

abstract class NotificationService {
    // Factory Method
    protected abstract Notification createNotification();

    public void notifyUser(String to, String body) {
        Notification n = createNotification();
        n.send(to, body);
    }
}

class EmailNotificationService extends NotificationService {
    protected Notification createNotification() {
        return new EmailNotification();
    }
}

class SmsNotificationService extends NotificationService {
    protected Notification createNotification() {
        return new SmsNotification();
    }
}

public class Demo {
    public static void main(String[] args) {
        NotificationService email = new EmailNotificationService();
        NotificationService sms = new SmsNotificationService();
        email.notifyUser("a@x.com", "Welcome");
        sms.notifyUser("+91111", "OTP 4242");
    }
}`,
  output: `Email -> a@x.com: Welcome
SMS -> +91111: OTP 4242`,
  explain: [
    'Clients call notifyUser and never mention EmailNotification or SmsNotification.',
    'createNotification is the hook subclasses override — classic Factory Method.',
    'Adding PushNotificationService extends the system without editing existing services.',
  ],
  mermaid: `classDiagram
    class Notification {
      <<interface>>
      +send(to, body)
    }
    class EmailNotification
    class SmsNotification
    class NotificationService {
      <<abstract>>
      #createNotification()* Notification
      +notifyUser(to, body)
    }
    class EmailNotificationService
    class SmsNotificationService
    Notification <|.. EmailNotification
    Notification <|.. SmsNotification
    NotificationService <|-- EmailNotificationService
    NotificationService <|-- SmsNotificationService
    EmailNotificationService ..> EmailNotification : creates
    SmsNotificationService ..> SmsNotification : creates`,
  mistakes: [
    'Calling every static create() a Factory Method — Factory Method specifically uses inheritance/polymorphism.',
    'Putting a giant switch inside the base creator — that is a Simple Factory, and it reintroduces the OCP violation.',
    'Returning concrete types from the factory method — clients should depend on the Product interface.',
  ],
  interviewAsk: 'Explain Factory Method and when you would choose it over a simple static factory.',
  interviewAnswer:
    'Factory Method lets subclasses decide the concrete product while the base class owns the workflow that uses the product. Use it when creation varies by product family/channel and you expect new variants. A static simple factory is fine for a closed, small set of types; switch to Factory Method (or registry) when variants grow and you want Open/Closed.',
  interviewTraps: [
    'Confusing Factory Method with Abstract Factory.',
    'Saying factories are only for hiding constructors — miss the polymorphism/extensibility angle.',
  ],
  quiz: {
    question: 'In classic Factory Method, who decides the concrete product class?',
    options: [
      'The client via new',
      'A subclass of the Creator',
      'The Product interface itself',
      'The JVM',
    ],
    correctIndex: 1,
    explain: 'ConcreteCreator subclasses override factoryMethod() to return a specific ConcreteProduct.',
  },
  practice:
    'Design a DocumentExporter with factory methods for PdfExporter and CsvExporter. The base class should own an exportAll(List) template that calls createExporter().',
  practiceHints: [
    'Keep Product as an interface with export(data).',
    'Do not put if/else on file extension inside the base class.',
  ],
});
