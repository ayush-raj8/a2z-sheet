import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-garbage-collection',
  title: 'Garbage Collection & Reachability',
  section: 'java',
  chapter: 'Memory & Object Model',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-stack-heap', 'java-new-null-npe'],
  summary:
    'GC reclaims heap objects that are unreachable from GC roots — you don’t free(), you drop references and understand reachability.',
  keywords: ['garbage collection', 'reachability', 'gc roots', 'heap', 'memory leak'],
  why:
    'You rarely tune collectors in early interviews, but you must explain why memory grows (lingering references) and why nulling or scoping matters.',
  theory: [
    'Java has no free/delete for ordinary objects — the garbage collector reclaims unreachable heap memory.',
    'Reachability: an object is live if it can be reached from GC roots (stack locals, static fields, JNI refs, etc.) via references.',
    'Making an object unreachable (end of scope, null assignment, clearing collections) makes it eligible for collection — not synchronously collected.',
    'Memory “leaks” in Java are usually unintended retained references (caches, static lists, listeners, ThreadLocals).',
    'finalize() is deprecated / discouraged — prefer try-with-resources for native/cleanup needs.',
    'Different JVMs/collectors exist (G1, ZGC, …); for OOP courses, focus on reachability first.',
  ],
  mentalModel:
    'The heap is a warehouse of boxes. GC starts from labeled doors (roots) and follows strings (references). Boxes with no path from any door can be recycled.',
  codeTitle: 'Eligibility vs immediate free',
  code: `import java.util.ArrayList;
import java.util.List;

public class GcEligibility {
    static List<byte[]> cache = new ArrayList<>();

    static void temporary() {
        byte[] blob = new byte[1_000_000];
        System.out.println("temp length=" + blob.length);
        // blob becomes unreachable when temporary() returns
    }

    public static void main(String[] args) {
        temporary();

        cache.add(new byte[1_000_000]); // still reachable via static cache
        System.out.println("cache size=" + cache.size());

        cache.clear(); // now those arrays may become unreachable
        System.out.println("cleared");
    }
}`,
  output: `temp length=1000000
cache size=1
cleared`,
  explain: [
    'The array inside temporary() is eligible for GC after the method returns.',
    'The array in cache stays live while referenced from the static list.',
    'clear() removes references so those objects can become unreachable.',
  ],
  mistakes: [
    'Assuming System.gc() reliably frees memory on demand.',
    'Holding objects in static collections “for later” and wondering why memory grows.',
    'Relying on finalize() for correctness.',
  ],
  interviewAsk: 'When is a Java object garbage-collected?',
  interviewAnswer:
    'After it becomes unreachable from GC roots. Eligibility is not the same as “immediately freed.” Unintended retained references are the usual cause of Java memory leaks.',
  interviewTraps: [
    '“GC runs every time I null a reference.”',
  ],
  quiz: {
    question: 'What typically makes a heap object eligible for GC?',
    options: [
      'Calling free(obj)',
      'It becomes unreachable from GC roots',
      'Leaving the main method of any class',
      'Declaring it final',
    ],
    correctIndex: 1,
    explain: 'GC cares about reachability, not final or explicit free.',
  },
  practice:
    'Describe a listener/callback registration pattern that leaks memory, and how to fix it (unregister, weak refs, or scoped lifetime).',
  deepDive: [
    'Soft/weak/phantom references change reachability strength for caches and cleanup — advanced interview topic.',
  ],
});
