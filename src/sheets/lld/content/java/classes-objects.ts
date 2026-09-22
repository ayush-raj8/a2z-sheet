import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-classes-objects',
  title: 'Classes and Objects',
  section: 'java',
  chapter: 'Classes & Objects',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['java-equals-identity'],
  summary:
    'A class is a blueprint of state (fields) and behavior (methods); an object is a concrete instance created with new.',
  keywords: ['class', 'object', 'field', 'method', 'instance', 'encapsulation'],
  why: 'LLD is about carving the right classes. You need fluency in how instances carry state, how methods use this, and how multiple objects collaborate without sharing mutable state accidentally.',
  theory: [
    'Class = type definition: fields, constructors, methods, nested types. Object = runtime instance of a class.',
    'Instance fields differ per object; methods define behavior that usually reads/writes that object’s state via this.',
    'Members have access levels (private/package/protected/public) that shape encapsulation — details in a later lesson.',
    'Objects collaborate by invoking methods and passing references; prefer telling objects to do work over grabbing all their fields.',
    'Class loading creates Class metadata; new creates instances. Many instances share the same method bytecode.',
    'Good classes have a clear responsibility (SRP). God classes with dozens of unrelated fields are an LLD smell.',
  ],
  mentalModel:
    'A class is the cookie cutter; objects are the cookies. Each cookie has its own icing (field values) but the same shape of behavior.',
  codeTitle: 'Two bank accounts — separate state, shared behavior',
  code: `public class ClassesObjectsDemo {
    static class BankAccount {
        private final String id;
        private int balanceCents;

        BankAccount(String id, int openingBalanceCents) {
            this.id = id;
            this.balanceCents = openingBalanceCents;
        }

        void deposit(int cents) {
            if (cents <= 0) throw new IllegalArgumentException("cents");
            balanceCents += cents;
        }

        boolean withdraw(int cents) {
            if (cents <= 0 || cents > balanceCents) return false;
            balanceCents -= cents;
            return true;
        }

        int balanceCents() { return balanceCents; }

        @Override
        public String toString() {
            return id + "=" + balanceCents + "c";
        }
    }

    public static void main(String[] args) {
        BankAccount a = new BankAccount("A1", 1000);
        BankAccount b = new BankAccount("B1", 500);
        a.deposit(200);
        b.withdraw(100);
        System.out.println(a);
        System.out.println(b);
    }
}`,
  output: `A1=1200c
B1=400c`,
  explain: [
    'a and b are distinct objects — depositing into a does not change b.',
    'Methods encapsulate rules (no negative deposit; withdraw fails instead of going negative).',
    'toString helps debugging; balance is read via a method, not a public field.',
  ],
  mistakes: [
    'Making all fields public and mutating them from everywhere.',
    'One giant class that models the entire system.',
    'Confusing static utility bags with proper domain objects.',
  ],
  interviewAsk: 'What is the difference between a class and an object?',
  interviewAnswer:
    'A class is the static blueprint defining fields and methods. An object is a runtime instance with its own field values. Many objects can be created from one class; they share method code but not instance state (unless static).',
  interviewTraps: [
    'Saying class and object are synonyms.',
    'Claiming methods are copied per instance in memory as separate source.',
  ],
  quiz: {
    question: 'Two BankAccount instances — do they share the same balanceCents field storage?',
    options: [
      'Yes, always',
      'No — each instance has its own balanceCents',
      'Only if they have the same id',
      'Only on the stack',
    ],
    correctIndex: 1,
    explain: 'Instance fields are per-object on the heap.',
  },
  practice:
    'Model a Book (isbn, title) and Library that can add/find books by isbn. Ensure Book equality is by isbn so a Set of books de-duplicates.',
  practiceHints: [
    'Override equals/hashCode on Book by isbn.',
    'Library holds a Map<String, Book> or Set<Book>.',
  ],
});
