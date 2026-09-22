import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-concurrency-basics',
  title: 'Concurrency Basics for LLD',
  section: 'lld',
  chapter: 'Concurrency',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['lld-methodology', 'java-threads-basics'],
  summary:
    'Interview-ready concurrency: races, locks, synchronized, volatile, concurrent collections, and how to discuss thread safety in LLD designs.',
  keywords: ['concurrency', 'synchronized', 'race', 'deadlock', 'concurrent hashmap'],
  why:
    'Almost every strong LLD follow-up is “what if two threads?” You need vocabulary and simple, correct patterns — not a PhD in the Java Memory Model.',
  theory: [
    'Race condition: outcome depends on timing of concurrent accesses to shared mutable state.',
    'Critical section: code that must appear atomic — protect with locks or use lock-free concurrent structures.',
    'synchronized method/block: intrinsic lock; reentrant; provides mutual exclusion + memory visibility.',
    'volatile: visibility of a single field’s reads/writes, not atomic compound actions (i++ still unsafe).',
    'Prefer java.util.concurrent: ConcurrentHashMap, AtomicInteger, Semaphore, ReentrantLock, ReadWriteLock.',
    'Deadlock: circular wait — prevent with lock ordering, tryLock timeouts, or fewer locks.',
    'In LLD: identify shared state, make operations idempotent where possible, document granularity of locks (per spot vs whole lot).',
    'Do not over-synchronize: coarse locks hurt throughput; overly fine locks risk deadlock/complexity.',
  ],
  mentalModel:
    'Two cashiers updating the same spreadsheet cell. Without rules, both read 5, both write 6, and one sale vanishes. A lock is a talking stick; AtomicInteger is a special cell that increments itself safely; ConcurrentHashMap is a spreadsheet with row-level care.',
  codeTitle: 'Race vs synchronized vs AtomicInteger',
  code: `import java.util.concurrent.atomic.AtomicInteger;

class Counter {
    private int unsafe;
    private int safe;
    private final AtomicInteger atomic = new AtomicInteger();

    void bumpUnsafe() { unsafe++; }

    synchronized void bumpSafe() { safe++; }

    void bumpAtomic() { atomic.incrementAndGet(); }

    public static void main(String[] args) throws Exception {
        Counter c = new Counter();
        Thread t1 = new Thread(() -> { for (int i = 0; i < 100000; i++) {
            c.bumpUnsafe(); c.bumpSafe(); c.bumpAtomic();
        }});
        Thread t2 = new Thread(() -> { for (int i = 0; i < 100000; i++) {
            c.bumpUnsafe(); c.bumpSafe(); c.bumpAtomic();
        }});
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println("unsafe=" + c.unsafe);
        System.out.println("safe=" + c.safe);
        System.out.println("atomic=" + c.atomic.get());
    }
}`,
  output: `unsafe=<often less than 200000>
safe=200000
atomic=200000`,
  explain: [
    'unsafe++ is read-modify-write — races lose updates.',
    'synchronized makes the increment atomic for that counter.',
    'AtomicInteger uses CPU-level CAS — good for simple counters.',
  ],
  mermaid: `flowchart TB
    Q[Shared mutable state?] -->|no| OK[Likely fine]
    Q -->|yes| A[Compound action?]
    A -->|yes| L[Lock or atomic API]
    A -->|single field visibility| V[volatile maybe]
    L --> G[Choose granularity]`,
  mistakes: [
    'Calling ConcurrentHashMap thread-safe for any compound check-then-act without care (need compute/merge).',
    'Using volatile for counters.',
    'Synchronizing on exposed objects clients can lock (this escape / public locks).',
    'Ignoring visibility: one thread’s writes may be invisible without sync/volatile/concurrent utils.',
  ],
  interviewAsk: 'How would you make parking spot allocation thread-safe?',
  interviewAnswer:
    'Identify the critical section: selecting a free spot and marking it occupied. Options: synchronize the allocator; use tryOccupy with synchronized per spot plus careful double-check; or DB unique constraint / transactional update. Prefer minimal lock scope. Discuss throughput: per-floor locks vs global lock. Mention idempotent tickets and retries if compare-and-set fails.',
  interviewTraps: [
    '“Just use synchronized everywhere.”',
    'Claiming ConcurrentHashMap alone fixes check-then-act.',
  ],
  quiz: {
    question: 'volatile alone makes which safe?',
    options: [
      'i++ on an int counter',
      'Visibility of the latest write to that single field',
      'Deadlock impossible',
      'All ConcurrentHashMap compound operations',
    ],
    correctIndex: 1,
    explain: 'volatile helps visibility, not atomicity of compound actions.',
  },
  practice:
    'Implement a thread-safe TicketBooth.issue() that generates unique ticket IDs using either AtomicLong or synchronized. Spawn two threads and assert no duplicates.',
  practiceHints: [
    'Store issued IDs in a ConcurrentHashMap.newKeySet().',
    'Join threads before asserting size.',
  ],
});
