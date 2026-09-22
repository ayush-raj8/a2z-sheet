import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-comparable-comparator',
  title: 'Comparable and Comparator',
  section: 'java',
  chapter: 'Collections',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-collections'],
  summary:
    'Comparable defines a type’s natural order; Comparator supplies reusable external orders for sorting and sorted collections.',
  keywords: ['Comparable', 'Comparator', 'natural order', 'TreeSet', 'thenComparing'],
  why:
    'Ordering powers sorting, range operations, TreeSet, and TreeMap. A poor comparison can silently drop elements or violate collection contracts.',
  theory: [
    'Comparable<T> defines a natural order inside the type through compareTo(T), such as chronological order for dates.',
    'Comparator<T> is external and supports multiple context-specific orders without changing the compared class.',
    'A comparison returns a negative number, zero, or a positive number; do not require exactly -1 or 1.',
    'Use Integer.compare, Long.compare, or comparator factories instead of subtraction, which can overflow.',
    'Comparator.comparing and primitive variants build key-based orders; thenComparing adds deterministic tie-breakers.',
    'TreeSet and TreeMap use comparison equality (compare returns zero), not equals, to decide whether keys are duplicates.',
    'Natural ordering should ideally be consistent with equals: compareTo returns zero exactly when equals is true.',
    'Comparators should be antisymmetric, transitive, and stable about equality; broken contracts can corrupt sorted behavior.',
  ],
  mentalModel:
    'Comparable is a default sorting label printed on every object; Comparator is a detachable lens that lets a caller view the same objects by price, name, or priority.',
  moreExamples: [
    {
      title: 'Natural order with Comparable and TreeSet',
      code: `import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public class ComparableDemo {
    static class Ticket implements Comparable<Ticket> {
        final int number;
        final String owner;

        Ticket(int number, String owner) {
            this.number = number;
            this.owner = owner;
        }

        @Override
        public int compareTo(Ticket other) {
            return Integer.compare(number, other.number);
        }

        @Override
        public boolean equals(Object object) {
            return object instanceof Ticket && number == ((Ticket) object).number;
        }

        @Override
        public int hashCode() {
            return Objects.hash(number);
        }

        @Override
        public String toString() {
            return number + ":" + owner;
        }
    }

    public static void main(String[] args) {
        Set<Ticket> tickets = new TreeSet<>();
        tickets.add(new Ticket(20, "Zoe"));
        tickets.add(new Ticket(10, "Ana"));
        tickets.add(new Ticket(20, "Other"));
        System.out.println(tickets);
    }
}`,
      output: `[10:Ana, 20:Zoe]`,
      explain: [
        'Ticket’s natural order and equality both use number, so their notions of identity agree.',
        'TreeSet rejects the second number 20 because compareTo returns zero.',
      ],
    },
    {
      title: 'External orders with comparing and thenComparing',
      code: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class ComparatorDemo {
    static class Product {
        final String name;
        final int price;

        Product(String name, int price) {
            this.name = name;
            this.price = price;
        }

        @Override
        public String toString() {
            return name + "=" + price;
        }
    }

    public static void main(String[] args) {
        List<Product> products = new ArrayList<>(List.of(
            new Product("Pen", 20),
            new Product("Book", 50),
            new Product("Bag", 50)
        ));

        Comparator<Product> byPriceThenName =
            Comparator.comparingInt((Product p) -> p.price)
                      .thenComparing(p -> p.name);
        products.sort(byPriceThenName);
        System.out.println(products);

        products.sort(Comparator.comparing((Product p) -> p.name).reversed());
        System.out.println(products);
    }
}`,
      output: `[Pen=20, Bag=50, Book=50]
[Pen=20, Book=50, Bag=50]`,
      explain: [
        'thenComparing orders equal-price products by name.',
        'A separate reversed name comparator provides another ordering without modifying Product.',
      ],
    },
  ],
  mistakes: [
    'Returning a - b from compare methods and risking integer overflow.',
    'Treating compare(x, y) == 0 as harmless when TreeSet must retain both objects.',
    'Defining a non-transitive comparator.',
    'Embedding every possible business ordering in Comparable.',
    'Omitting a tie-breaker when deterministic output or uniqueness is required.',
  ],
  interviewAsk: 'When should you use Comparable versus Comparator, and why does consistency with equals matter?',
  interviewAnswer:
    'Comparable expresses one intrinsic natural order in the class. Comparator expresses external or multiple orders and composes with comparing/thenComparing. Sorted sets and maps treat comparison zero as key equality, so an ordering inconsistent with equals can make apparently unequal values disappear or make collection behavior surprising.',
  interviewTraps: [
    'Saying TreeSet always uses equals to detect duplicates.',
    'Implementing compareTo with subtraction.',
  ],
  quiz: [
    {
      question: 'How does TreeSet decide that two elements are duplicates?',
      options: ['Same hash code', 'equals only', 'Comparison returns zero', 'Same reference'],
      correctIndex: 2,
      explain: 'TreeSet uniqueness is based on its natural order or supplied comparator.',
    },
    {
      question: 'What does thenComparing do?',
      options: [
        'Reverses the first comparator',
        'Applies a tie-breaker when the first comparison is zero',
        'Mutates objects',
        'Tests equals first',
      ],
      correctIndex: 1,
      explain: 'It composes a secondary comparison for ties.',
    },
  ],
  practice:
    'Create Employee values and sort them by natural employee ID, then by department/name, and then salary descending/name ascending. Put them in TreeSet under each order and inspect duplicate behavior.',
  practiceHints: [
    'Use Integer.compare or comparingInt for numeric keys.',
    'Add thenComparing(Employee::getName) for deterministic ties.',
  ],
});
