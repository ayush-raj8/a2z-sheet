import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-wait-notify',
  title: 'wait, notify, and notifyAll',
  section: 'java',
  chapter: 'Threads',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['java-threads-basics', 'lld-concurrency-basics'],
  summary:
    'Object monitors let threads wait for state changes and signal one another while coordinating access to shared state.',
  keywords: ['wait', 'notify', 'notifyAll', 'monitor', 'producer consumer', 'spurious wakeup'],
  why:
    'Low-level coordination explains how blocking abstractions work and why condition checks, monitor ownership, and visibility must be treated as one protocol.',
  theory: [
    'wait(), notify(), and notifyAll() are Object methods associated with an object’s intrinsic monitor.',
    'A thread must own that same monitor, normally inside synchronized(lock), or IllegalMonitorStateException is thrown.',
    'wait() atomically releases the monitor and suspends the thread; before returning it reacquires the monitor.',
    'notify() wakes one arbitrary waiter; notifyAll() wakes all waiters, which then compete to reacquire the monitor.',
    'Always test the condition in a while loop because wakeups can be spurious or another thread can consume the condition first.',
    'Change shared state and signal while holding the same monitor so visibility and condition transitions stay coordinated.',
    'Waiting is different from sleep(): sleep does not release a monitor and is time-based rather than condition-based.',
    'InterruptedException is a cancellation signal; code should propagate it or restore interruption instead of silently swallowing it.',
    'Prefer higher-level utilities such as BlockingQueue, CountDownLatch, or Condition in production when they express the protocol directly.',
  ],
  mentalModel:
    'A monitor is a locked meeting room with a waiting lobby. wait() records “my condition is false,” leaves the key, and enters the lobby; a notifier changes the whiteboard, rings the bell, and waiters re-check it after regaining the key.',
  moreExamples: [
    {
      title: 'Complete bounded producer-consumer',
      code: `import java.util.ArrayDeque;
import java.util.Queue;

public class ProducerConsumerDemo {
    static class Buffer {
        private final Queue<Integer> queue = new ArrayDeque<>();
        private final int capacity;

        Buffer(int capacity) {
            this.capacity = capacity;
        }

        synchronized void put(int value) throws InterruptedException {
            while (queue.size() == capacity) {
                wait();
            }
            queue.add(value);
            System.out.println("produced " + value);
            notifyAll();
        }

        synchronized int take() throws InterruptedException {
            while (queue.isEmpty()) {
                wait();
            }
            int value = queue.remove();
            System.out.println("consumed " + value);
            notifyAll();
            return value;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Buffer buffer = new Buffer(1);
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    buffer.put(i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 3; i++) {
                    buffer.take();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("done");
    }
}`,
      output: `produced 1
consumed 1
produced 2
consumed 2
produced 3
consumed 3
done`,
      explain: [
        'Capacity one forces each production to alternate with consumption, making this output deterministic.',
        'Both methods synchronize, check conditions with while, mutate state, and notify all waiters.',
      ],
    },
    {
      title: 'One-shot gate with a guarded wait',
      code: `public class WaitNotifyGate {
    static class Gate {
        private boolean open;

        synchronized void awaitOpen() throws InterruptedException {
            while (!open) {
                wait();
            }
            System.out.println("worker passed");
        }

        synchronized void open() {
            open = true;
            System.out.println("gate opened");
            notifyAll();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Gate gate = new Gate();
        Thread worker = new Thread(() -> {
            try {
                gate.awaitOpen();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        worker.start();
        Thread.sleep(50);
        gate.open();
        worker.join();
        System.out.println("finished");
    }
}`,
      output: `gate opened
worker passed
finished`,
      explain: [
        'awaitOpen releases the Gate monitor while waiting and reacquires it before printing.',
        'The boolean condition makes an early notification harmless: a later caller sees open immediately.',
      ],
    },
  ],
  mistakes: [
    'Calling wait or notify without owning the target object’s monitor.',
    'Using if instead of while around wait.',
    'Synchronizing on one object but waiting or notifying on another.',
    'Using notify when multiple conditions or waiter roles can cause the wrong thread to wake.',
    'Swallowing InterruptedException and losing cancellation.',
  ],
  interviewAsk: 'Why must wait be called in a while loop while holding a monitor?',
  interviewAnswer:
    'Monitor ownership makes checking state, releasing the lock, and later reacquiring it part of one synchronization protocol. The while loop rechecks the predicate because wakeups may be spurious, notify does not reserve the condition, and another awakened thread may change state before this thread reacquires the monitor.',
  interviewTraps: [
    'Saying wait keeps the monitor locked.',
    'Assuming notify immediately transfers monitor ownership to a waiter.',
  ],
  quiz: [
    {
      question: 'What happens to a held monitor when wait() is called correctly?',
      options: ['It remains held', 'It is released, then reacquired before return', 'It is destroyed', 'notify owns it'],
      correctIndex: 1,
      explain: 'wait atomically releases the monitor and reacquires it before returning.',
    },
    {
      question: 'Why prefer while (!condition) wait() over if?',
      options: [
        'while is faster',
        'To handle spurious or stale wakeups',
        'if cannot compile',
        'notifyAll requires while syntax',
      ],
      correctIndex: 1,
      explain: 'A wakeup is permission to check again, not proof that the condition is still true.',
    },
  ],
  practice:
    'Implement a capacity-two blocking message queue with put and take, then run two producers and two consumers. Add a closed flag so waiting consumers can terminate cleanly.',
  practiceHints: [
    'Guard full, empty, and closed predicates with the same monitor.',
    'Use notifyAll because producers and consumers wait for different conditions.',
  ],
});
