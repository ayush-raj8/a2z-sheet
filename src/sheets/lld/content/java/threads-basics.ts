import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-threads-basics',
  title: 'Threads — Runnable, Thread, join',
  section: 'java',
  chapter: 'Threads',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-classes-objects', 'oop-interfaces'],
  summary:
    'Create threads by implementing Runnable (preferred) or extending Thread; start() schedules run(); join/isAlive wait for completion — foundation before LLD concurrency.',
  keywords: ['Thread', 'Runnable', 'start', 'run', 'join', 'isAlive', 'sleep'],
  why:
    'Academic OOP courses teach Thread/Runnable first. LLD interviews then ask about races and locks — you need both the API basics and the safety model.',
  theory: [
    'A thread is an independent path of execution inside a process (JVM).',
    'Two creation styles: implement Runnable and pass it to new Thread(...), or extend Thread and override run().',
    'Prefer Runnable so your class can still extend something else; extend Thread only when specializing Thread itself.',
    'start() tells the JVM to begin the new thread; calling run() directly executes on the current thread (no parallelism).',
    'sleep(ms) pauses the current thread; may throw InterruptedException.',
    'isAlive() checks if a thread has not yet terminated; join() waits until that thread finishes.',
    'The main thread is just another thread — you can rename it, sleep it, or join children from it.',
  ],
  mentalModel:
    'start() is hiring a worker and saying “begin.” run() is the job description. join() is waiting at the door until that worker clocks out.',
  codeTitle: 'Runnable + join',
  code: `public class ThreadBasics {
    static class Task implements Runnable {
        private final String name;

        Task(String name) { this.name = name; }

        @Override
        public void run() {
            for (int i = 1; i <= 3; i++) {
                System.out.println(name + " step " + i);
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(new Task("A"));
        Thread t2 = new Thread(new Task("B"));
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("both done, alive=" + t1.isAlive());
    }
}`,
  output: `A step 1
B step 1
A step 2
B step 2
A step 3
B step 3
both done, alive=false`,
  explain: [
    'Task implements Runnable; Thread objects receive the task.',
    'start() begins concurrent execution — output order of A/B can interleave.',
    'join() makes main wait until both finish; afterward isAlive() is false.',
  ],
  mistakes: [
    'Calling run() instead of start() and thinking you created a new thread.',
    'Extending Thread by default when Runnable is enough.',
    'Swallowing InterruptedException without restoring interrupt status.',
  ],
  interviewAsk: 'Runnable vs extending Thread — which do you prefer and why?',
  interviewAnswer:
    'Prefer implementing Runnable (or better, use Executors). Extending Thread uses up your single inheritance and couples your type to Thread. Always start() to actually spawn; use join when the caller must wait.',
  interviewTraps: [
    'Stopping at Thread API without mentioning shared-state races — next lesson/LLD covers that.',
  ],
  quiz: {
    question: 'What does thread.run() do if called directly?',
    options: [
      'Always starts a new OS thread',
      'Executes run() on the current thread',
      'Same as start()',
      'Compiles only inside Thread subclass',
    ],
    correctIndex: 1,
    explain: 'run() is a normal method call. Only start() arranges concurrent execution.',
  },
  practice:
    'Spawn three threads that each print their name 5 times with a short sleep; main should join all three before printing "done".',
  deepDive: [
    'Modern code prefers ExecutorService over raw new Thread for pooling and lifecycle.',
    'Next: shared mutable state → synchronized / concurrent collections (see LLD Concurrency Basics).',
  ],
});
