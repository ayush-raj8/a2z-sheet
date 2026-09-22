import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-singleton',
  title: 'Singleton Pattern',
  section: 'patterns',
  chapter: 'Creational',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'Ensure a class has exactly one instance and provide a global access point — used for shared resources like config, caches, and connection pools.',
  keywords: ['singleton', 'creational', 'thread-safety', 'enum', 'double-checked locking'],
  why:
    'Interviewers love Singleton because it looks simple but hides concurrency, serialization, and testability traps. You will also see it abused as a global variable — knowing when NOT to use it is as important as knowing how.',
  theory: [
    'Intent: one instance of a class, with controlled global access.',
    'Motivation: shared expensive resources (DB pool, logger, app config) where multiple instances would waste memory or corrupt state.',
    'Core pieces: private constructor, private static instance, public static accessor (getInstance).',
    'Eager initialization: create instance at class load — thread-safe by JVM class-loading guarantees, but pays cost even if unused.',
    'Lazy initialization: create on first use — saves memory, but needs synchronization in multi-threaded code.',
    'Double-checked locking: synchronize only on first creation; requires volatile instance field in Java.',
    'Enum singleton (Effective Java): simplest correct form — handles serialization and reflection attacks.',
    'Tradeoff: global mutable state hurts testability and hidden coupling; prefer dependency injection when you can pass the collaborator explicitly.',
  ],
  mentalModel:
    'Think of a city having exactly one mayor office. Everyone who needs city policy goes to that same office — not a new building each time. The office must open safely even if 100 people knock at once (thread safety), and you should not invent a second mayor by cloning or deserializing paperwork (serialization/reflection).',
  codeTitle: 'Thread-safe lazy Singleton (double-checked locking)',
  code: `public class Demo {
    static final class AppConfig {
        private static volatile AppConfig instance;
        private final String env;

        private AppConfig() {
            this.env = "dev";
        }

        static AppConfig getInstance() {
            if (instance == null) {
                synchronized (AppConfig.class) {
                    if (instance == null) {
                        instance = new AppConfig();
                    }
                }
            }
            return instance;
        }

        String getEnv() {
            return env;
        }
    }

    enum Logger {
        INSTANCE;

        void info(String message) {
            System.out.println("[INFO] " + message);
        }
    }

    public static void main(String[] args) {
        AppConfig a = AppConfig.getInstance();
        AppConfig b = AppConfig.getInstance();
        System.out.println(a == b);
        Logger.INSTANCE.info("booted in " + a.getEnv());
    }
}`,
  output: `true
[INFO] booted in dev`,
  explain: [
    'volatile prevents seeing a partially constructed instance across threads.',
    'Outer null check avoids synchronizing on every call after first init.',
    'Enum singleton needs no explicit synchronization and resists reflection/serialization tricks.',
  ],
  mermaid: `classDiagram
    class AppConfig {
      -static volatile AppConfig instance
      -String env
      -AppConfig()
      +static getInstance() AppConfig
      +getEnv() String
    }
    note for AppConfig "Clients always get the same instance"`,
  mistakes: [
    'Using a non-volatile lazy field with double-checked locking — broken under the Java Memory Model.',
    'Making getInstance synchronized on every call — correct but unnecessary contention after init.',
    'Treating Singleton as a dumping ground for all globals — creates hidden dependencies and brittle tests.',
    'Forgetting that clones, reflection, and deserialization can create extra instances unless you defend against them (enum or readResolve).',
  ],
  interviewAsk: 'How do you implement a thread-safe Singleton in Java, and when would you avoid Singleton?',
  interviewAnswer:
    'Prefer enum Singleton for correctness simplicity, or eager static final, or lazy double-checked locking with volatile. Avoid Singleton when the dependency should be injectable for tests, when multiple instances are valid (multi-tenant configs), or when lifecycle should be owned by a DI container. Explain tradeoffs: global access vs coupling and testability.',
  interviewTraps: [
    'Saying "just synchronize getInstance" without discussing performance or enum alternative.',
    'Claiming Singleton is always an anti-pattern — nuance: valid for true single shared resources, harmful as a default.',
  ],
  quiz: {
    question: 'Why must the lazy Singleton instance field be volatile when using double-checked locking?',
    options: [
      'To make the field final',
      'To prevent other threads from seeing a partially constructed object',
      'To allow subclassing',
      'To force eager initialization',
    ],
    correctIndex: 1,
    explain:
      'Without volatile, a thread can observe a non-null reference before the constructor finishes writing fields.',
  },
  practice:
    'Implement a CacheManager Singleton with get/put. Provide both an enum version and a double-checked locking version. Write a short note on which you would ship in production and why.',
  practiceHints: [
    'Start with enum — fewer footguns.',
    'For DCL, mark instance volatile and keep constructor private.',
    'Consider whether CacheManager should really be a Singleton or an injected service.',
  ],
  deepDive: [
    'Bill Pugh holder idiom: private static class Holder { static final T INSTANCE = new T(); } — lazy and thread-safe without explicit locks.',
    'In Spring/Guice, @Singleton (or default scope) is framework-managed; prefer that over hand-rolled Singletons in app code.',
  ],
});
