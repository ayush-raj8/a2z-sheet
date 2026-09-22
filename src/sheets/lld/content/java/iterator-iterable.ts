import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-iterator-iterable',
  title: 'Iterable and Iterator',
  section: 'java',
  chapter: 'Collections',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-collections'],
  summary:
    'Iterable creates iterators; Iterator maintains traversal state and provides the safe mutation path during iteration.',
  keywords: ['Iterable', 'Iterator', 'for-each', 'remove', 'fail-fast', 'ConcurrentModificationException'],
  why:
    'Iteration protocols let custom data structures work with for-each and expose why structural modification during traversal fails.',
  theory: [
    'Iterable<T> represents something traversable and declares iterator(), which returns a fresh Iterator<T>.',
    'Iterator<T> holds traversal state and primarily exposes hasNext() and next().',
    'The enhanced for loop over an Iterable is compiler sugar for obtaining an iterator and repeatedly calling hasNext and next.',
    'next() throws NoSuchElementException when exhausted; callers should normally check hasNext first.',
    'Iterator.remove() removes the last element returned by next and is the supported structural-removal path when implemented.',
    'Calling remove before next or twice after one next typically throws IllegalStateException.',
    'Most standard mutable collection iterators are fail-fast: external structural modification can trigger ConcurrentModificationException.',
    'Fail-fast behavior is best-effort bug detection, not a thread-safety guarantee.',
    'Use concurrent collections, synchronization, or snapshot copies when mutation and traversal truly need to overlap.',
  ],
  mentalModel:
    'Iterable is a book that can issue bookmarks; each Iterator is one bookmark with its own current page. The for-each loop simply moves that bookmark until no pages remain.',
  moreExamples: [
    {
      title: 'A custom Iterable used by for-each',
      code: `import java.util.Iterator;
import java.util.NoSuchElementException;

public class CountdownIterableDemo {
    static class Countdown implements Iterable<Integer> {
        private final int start;

        Countdown(int start) {
            this.start = start;
        }

        @Override
        public Iterator<Integer> iterator() {
            return new Iterator<Integer>() {
                private int current = start;

                public boolean hasNext() {
                    return current >= 1;
                }

                public Integer next() {
                    if (!hasNext()) {
                        throw new NoSuchElementException();
                    }
                    return current--;
                }
            };
        }
    }

    public static void main(String[] args) {
        for (int value : new Countdown(3)) {
            System.out.println(value);
        }
    }
}`,
      output: `3
2
1`,
      explain: [
        'for-each calls iterator once, then loops over hasNext and next.',
        'Each iterator invocation creates independent traversal state.',
      ],
    },
    {
      title: 'Safe removal through Iterator.remove',
      code: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class IteratorRemoveDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5));
        Iterator<Integer> iterator = numbers.iterator();

        while (iterator.hasNext()) {
            if (iterator.next() % 2 == 0) {
                iterator.remove();
            }
        }

        System.out.println(numbers);
    }
}`,
      output: `[1, 3, 5]`,
      explain: [
        'remove updates both the collection and iterator bookkeeping safely.',
        'Removing directly from numbers inside this loop would invalidate the iterator.',
      ],
    },
    {
      title: 'Fail-fast structural modification',
      code: `import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.List;

public class FailFastDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("A", "B", "C"));

        try {
            for (String name : names) {
                if (name.equals("A")) {
                    names.add("D");
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("structural change detected");
        }

        System.out.println(names);
    }
}`,
      output: `structural change detected
[A, B, C, D]`,
      explain: [
        'The hidden iterator notices that ArrayList’s structural modification count changed.',
        'The add succeeds before the next iterator check throws, so D remains in the list.',
      ],
    },
  ],
  mistakes: [
    'Returning the same Iterator instance from iterator(), preventing independent traversals.',
    'Calling next without handling exhaustion.',
    'Removing directly from a collection during iterator traversal.',
    'Assuming fail-fast iterators make concurrent access safe.',
    'Calling Iterator.remove before next or twice for one returned element.',
  ],
  interviewAsk: 'How does for-each use Iterable and why does ConcurrentModificationException occur?',
  interviewAnswer:
    'For an Iterable, for-each obtains an Iterator and repeatedly invokes hasNext and next. Standard mutable iterators commonly capture a structural modification count; changing the collection outside that iterator makes the counts differ and may throw ConcurrentModificationException. Use iterator.remove for supported removal, or an appropriate concurrent/snapshot design.',
  interviewTraps: [
    'Saying Iterable and Iterator are interchangeable.',
    'Describing fail-fast as a guaranteed concurrency mechanism.',
  ],
  quiz: [
    {
      question: 'Which method must an Iterable implement?',
      options: ['next()', 'hasNext()', 'iterator()', 'remove()'],
      correctIndex: 2,
      explain: 'Iterable supplies Iterator instances through iterator().',
    },
    {
      question: 'How should an element be removed during ordinary iterator traversal?',
      options: [
        'Call collection.remove directly',
        'Call iterator.remove after next',
        'Modify a parallel thread',
        'It is never possible',
      ],
      correctIndex: 1,
      explain: 'Iterator.remove is the coordinated structural-removal operation when supported.',
    },
  ],
  practice:
    'Implement a Range that implements Iterable<Integer> with start, end, and step. Create two iterators to prove independence, then filter a mutable list safely with Iterator.remove.',
  practiceHints: [
    'Store traversal state inside the Iterator, not the Iterable.',
    'Throw NoSuchElementException when next is called after exhaustion.',
  ],
});
