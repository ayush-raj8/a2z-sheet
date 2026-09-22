import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-relationships',
  title: 'Object Relationships',
  section: 'oop',
  chapter: 'Relationships',
  difficulty: 'beginner',
  importance: 3,
  order: 1,
  prerequisites: ['oop-core-pillars'],
  summary:
    'Association, aggregation, composition, and dependency — how objects relate, who owns whom, and what that means for lifecycle and UML.',
  keywords: [
    'association',
    'aggregation',
    'composition',
    'dependency',
    'has-a',
    'uses-a',
  ],
  why: `LLD interviews draw boxes and arrows for a reason: ownership and lifetime decide whether deleting one object orphans another, whether cycles form, and how hard testing becomes. Mixing up aggregation and composition is a classic trap — and it shows up in bugs when you dispose the wrong thing.`,
  theory: [
    'Association: a general "knows about / connects to" link. Example: Teacher ↔ Student. Either side can exist independently; multiplicity may be 1–1, 1–N, or N–N.',
    'Aggregation: a weak whole–part ("has-a"). The part can outlive the whole. Example: Department has Professors; professors still exist if the department is dissolved.',
    'Composition: a strong whole–part. Parts are created/owned by the whole and typically die with it. Example: House has Rooms; destroy the house and rooms go with it.',
    'Dependency: a uses-a / depends-on relationship, often short-lived. Example: OrderService uses PaymentGateway in a method parameter or local variable — no long-term field ownership.',
    'In code: composition often means the whole constructs and holds private final parts; aggregation holds references injected or shared; dependency may be a method arg or static utility call.',
    'Prefer the weakest relationship that still expresses the domain. Strong ownership (composition) is powerful but couples lifecycles.',
  ],
  mentalModel: `Association = friends who know each other. Aggregation = a club that lists members (members live on). Composition = a body and its organs (organs don't wander off). Dependency = borrowing a tool for one job.`,
  mermaid: `classDiagram
    Teacher "1" --> "*" Student : association
    Department "1" o-- "*" Professor : aggregation
    House "1" *-- "*" Room : composition
    OrderService ..> PaymentGateway : dependency`,
  codeTitle: 'Relationships in Java',
  code: `import java.util.*;

// Association: bidirectional "knows"
class Student {
    final String name;
    Teacher teacher; // may be null / change over time
    Student(String name) { this.name = name; }
}

class Teacher {
    final String name;
    final List<Student> students = new ArrayList<>();
    Teacher(String name) { this.name = name; }
    void enroll(Student s) {
        students.add(s);
        s.teacher = this;
    }
}

// Aggregation: Department holds Professors that can exist elsewhere
class Professor {
    final String name;
    Professor(String name) { this.name = name; }
}

class Department {
    final String name;
    private final List<Professor> faculty = new ArrayList<>();
    Department(String name) { this.name = name; }
    void add(Professor p) { faculty.add(p); } // does not create Professor
}

// Composition: House owns Rooms; rooms are not shared
class Room {
    final String label;
    Room(String label) { this.label = label; }
}

class House {
    private final List<Room> rooms = new ArrayList<>();
    House() {
        rooms.add(new Room("kitchen"));
        rooms.add(new Room("bedroom"));
    }
    int roomCount() { return rooms.size(); }
}

// Dependency: short-lived use
class PaymentGateway {
    boolean charge(int cents) { return cents > 0; }
}

class OrderService {
    boolean checkout(int cents, PaymentGateway gateway) { // dependency via param
        return gateway.charge(cents);
    }
}

public class Demo {
    public static void main(String[] args) {
        Teacher t = new Teacher("Ada");
        Student s = new Student("Lin");
        t.enroll(s);
        System.out.println(s.teacher.name + " teaches " + t.students.get(0).name);

        Professor p = new Professor("Grace");
        Department cs = new Department("CS");
        cs.add(p);
        System.out.println("Professor still exists: " + p.name);

        House h = new House();
        System.out.println("rooms=" + h.roomCount());

        boolean ok = new OrderService().checkout(100, new PaymentGateway());
        System.out.println("charged=" + ok);
    }
}`,
  output: `Ada teaches Lin
Professor still exists: Grace
rooms=2
charged=true`,
  explain: [
    'Teacher–Student is association: both can exist alone; enroll wires the link.',
    'Department.add(Professor) is aggregation: the professor was created outside and can outlive the department.',
    'House constructs Rooms internally — composition / strong ownership.',
    'OrderService.checkout takes PaymentGateway as a parameter — dependency, not a stored field.',
  ],
  mistakes: [
    'Calling every has-a "composition" when the part is shared or long-lived independently (that is aggregation).',
    'Leaking composed parts via public getters that return the live mutable list.',
    'Using static utility calls everywhere and pretending there is "no dependency" — there still is a hard dependency on that type.',
    'Bidirectional associations without a clear owning side → memory leaks / inconsistent links.',
  ],
  interviewAsk: 'Difference between aggregation and composition? Give a Java example.',
  interviewAnswer:
    'Both are whole–part. In aggregation the part can live independently (Department holds Professor references created elsewhere). In composition the whole owns the part’s lifecycle (House creates and exclusively owns Room instances). In UML, aggregation is hollow diamond, composition is filled diamond.',
  interviewTraps: [
    'Saying aggregation means "no reference" — both usually hold references; lifecycle differs.',
    'Claiming Java GC makes composition meaningless — ownership still matters for APIs and correctness.',
  ],
  quiz: {
    question: 'OrderService receives PaymentGateway only as a method argument. This is best classified as:',
    options: ['Composition', 'Aggregation', 'Dependency', 'Inheritance'],
    correctIndex: 2,
    explain: 'A short-lived uses-a relationship without owning the gateway is dependency.',
  },
  practice:
    'Model a Car with Engine (composition) and a list of Driver licenses associated with people who may drive many cars (association). Sketch which objects create which.',
  practiceHints: [
    'Car constructor should new Engine(...).',
    'Person and Car can reference each other without either creating the other.',
  ],
});
