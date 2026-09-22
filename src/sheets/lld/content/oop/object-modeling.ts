import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-object-modeling',
  title: 'Object Modeling from Requirements',
  section: 'oop',
  chapter: 'Design Quality',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-coupling-cohesion'],
  summary:
    'Turn a problem statement into nouns, verbs, responsibilities, and a first-cut class model you can defend in an LLD interview.',
  keywords: [
    'object modeling',
    'CRC',
    'responsibilities',
    'nouns verbs',
    'domain model',
    'LLD',
  ],
  why: `Interview LLD starts with a blank board. Candidates who jump to Singleton and HashMap without modeling the domain get lost. A repeatable modeling process — identify actors, entities, relationships, invariants — turns vague requirements into a design you can iterate.`,
  theory: [
    'Extract nouns → candidate entities/value objects (Book, Member, Loan). Extract verbs → behaviors/services (borrow, return, reserve).',
    'Separate entities (identity + lifecycle) from value objects (immutable, equality by value: Money, ISBN) from services (orchestration without heavy state).',
    'Assign responsibilities with CRC thinking: Class – Responsibility – Collaborators. Each class should have few responsibilities.',
    'Capture invariants early: "a copy cannot be loaned twice", "balance never negative". Encode them in the owning entity, not in random controllers.',
    'Start with a coarse model, then refine: what needs persistence? what is transient? where are concurrency boundaries?',
    'Prefer domain language over technical names (LendingService beats ManagerImpl1).',
  ],
  mentalModel: `Requirements are a story. Objects are the cast and props. Responsibilities are each character's job. Collaborators are who they talk to. If two characters share one job, rewrite the script.`,
  mermaid: `classDiagram
    class Library {
      +borrow(memberId, copyId)
      +returnCopy(copyId)
    }
    class Member {
      +id
      +name
      +canBorrow()
    }
    class Book {
      +isbn
      +title
    }
    class BookCopy {
      +id
      +status
      +markLoaned()
      +markAvailable()
    }
    class Loan {
      +id
      +dueAt
      +close()
    }
    Library --> Member
    Library --> BookCopy
    Library --> Loan
    BookCopy --> Book
    Loan --> Member
    Loan --> BookCopy`,
  codeTitle: 'Library borrow — first-cut model',
  code: `import java.time.*;
import java.util.*;

enum CopyStatus { AVAILABLE, LOANED }

final class Book {
    final String isbn;
    final String title;
    Book(String isbn, String title) { this.isbn = isbn; this.title = title; }
}

final class BookCopy {
    final String id;
    final Book book;
    private CopyStatus status = CopyStatus.AVAILABLE;

    BookCopy(String id, Book book) { this.id = id; this.book = book; }
    CopyStatus status() { return status; }

    void markLoaned() {
        if (status != CopyStatus.AVAILABLE) throw new IllegalStateException("busy");
        status = CopyStatus.LOANED;
    }

    void markAvailable() { status = CopyStatus.AVAILABLE; }
}

final class Member {
    final String id;
    final String name;
    private int activeLoans;

    Member(String id, String name) { this.id = id; this.name = name; }

    boolean canBorrow(int limit) { return activeLoans < limit; }
    void openLoan() { activeLoans++; }
    void closeLoan() { activeLoans--; }
}

final class Loan {
    final String id;
    final Member member;
    final BookCopy copy;
    final Instant dueAt;
    private boolean open = true;

    Loan(String id, Member member, BookCopy copy, Instant dueAt) {
        this.id = id; this.member = member; this.copy = copy; this.dueAt = dueAt;
    }

    void close() {
        if (!open) return;
        open = false;
        copy.markAvailable();
        member.closeLoan();
    }
}

final class Library {
    private final Map<String, Member> members = new HashMap<>();
    private final Map<String, BookCopy> copies = new HashMap<>();
    private final int loanLimit;

    Library(int loanLimit) { this.loanLimit = loanLimit; }

    void register(Member m) { members.put(m.id, m); }
    void addCopy(BookCopy c) { copies.put(c.id, c); }

    Loan borrow(String memberId, String copyId) {
        Member m = Objects.requireNonNull(members.get(memberId), "member");
        BookCopy c = Objects.requireNonNull(copies.get(copyId), "copy");
        if (!m.canBorrow(loanLimit)) throw new IllegalStateException("limit");
        c.markLoaned();
        m.openLoan();
        Loan loan = new Loan(UUID.randomUUID().toString(), m, c,
            Instant.now().plus(Duration.ofDays(14)));
        System.out.println(m.name + " borrowed " + c.book.title);
        return loan;
    }
}

public class Demo {
    public static void main(String[] args) {
        Library lib = new Library(2);
        Book ddd = new Book("978-0321125217", "DDD");
        BookCopy copy = new BookCopy("c1", ddd);
        Member ada = new Member("m1", "Ada");
        lib.register(ada);
        lib.addCopy(copy);
        Loan loan = lib.borrow("m1", "c1");
        loan.close();
        System.out.println("copy=" + copy.status());
    }
}`,
  output: `Ada borrowed DDD
copy=AVAILABLE`,
  explain: [
    'Book is a catalog concept; BookCopy is the physical instance you loan — splitting nouns that share a name in English.',
    'Invariants live on BookCopy and Member (cannot loan twice; enforce borrow limit).',
    'Library orchestrates; it does not own every rule inside one mega-method without domain types.',
    'Loan closes by coordinating copy + member — collaborators are explicit.',
  ],
  mistakes: [
    'Anemic domain: entities with only getters/setters and all logic in a Service god class.',
    'Modeling screens/DB tables instead of domain concepts (UserDTO as the core model).',
    'Missing the "copy vs title" distinction in inventory domains.',
    'Putting every method on Library until it becomes a monolith.',
  ],
  interviewAsk: 'Walk me through how you would model a parking lot or library in an LLD round.',
  interviewAnswer:
    'Clarify actors and use cases, list nouns/verbs, separate entities vs value objects, define invariants and relationships (composition vs association), sketch classes with responsibilities, then choose data structures and concurrency. Iterate with the interviewer instead of coding frameworks first.',
  interviewTraps: [
    'Jumping to design patterns before entities exist.',
    'Ignoring edge cases (limits, double borrow) until the end.',
  ],
  quiz: {
    question: 'In a library domain, why model Book and BookCopy as separate types?',
    options: [
      'Java requires it for HashMap',
      'Catalog identity (ISBN/title) differs from loanable physical instances',
      'They are the same; separation is always over-engineering',
      'Only for UML aesthetics',
    ],
    correctIndex: 1,
    explain: 'Many copies share one catalog book; loans attach to copies, not the abstract title.',
  },
  practice:
    'Write nouns/verbs and a CRC list for "ride hailing: rider requests trip, driver accepts, trip starts/ends, fare calculated". Identify at least one value object.',
  practiceHints: [
    'Entities: Rider, Driver, Trip. Value object: Money or GeoPoint.',
    'Service: TripMatchingService or FareCalculator.',
  ],
});
