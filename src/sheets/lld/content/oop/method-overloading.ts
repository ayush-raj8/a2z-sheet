import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-method-overloading',
  title: 'Method Overloading',
  section: 'oop',
  chapter: 'Polymorphism',
  difficulty: 'intermediate',
  importance: 3,
  order: 1,
  prerequisites: ['java-classes-objects', 'oop-core-pillars'],
  summary:
    'Overloading gives one method name multiple parameter lists; the compiler selects the most specific applicable overload.',
  keywords: ['overloading', 'overload resolution', 'widening', 'boxing', 'varargs', 'ambiguity'],
  why:
    'APIs such as println and valueOf feel consistent because overloads offer type-safe variants under one name. Correct resolution rules prevent surprising calls and interview mistakes.',
  theory: [
    'Overloaded methods share a name but have different parameter lists (number, types, or order); return type alone cannot distinguish them.',
    'Overload resolution happens at compile time using the declared argument types, not the runtime type of an object.',
    'The compiler first finds applicable methods, then chooses the most specific one; an exact match is normally preferred.',
    'For a primitive argument, primitive widening is preferred over boxing, and both fixed-arity choices are preferred over varargs.',
    'A varargs parameter behaves like an array and is considered only after applicable fixed-arity overloads.',
    'Passing null can be ambiguous when unrelated reference overloads, such as String and Integer, are equally specific.',
    'Overloading is compile-time polymorphism; overriding keeps the same signature in a subclass and dispatches at runtime.',
    'Checked exceptions, access modifiers, static, and instance status do not by themselves create a distinct overload signature.',
  ],
  mentalModel:
    'Think of the compiler as a receptionist routing a call by the labels visible on the arguments: exact desk first, then a compatible wider desk, then a boxed desk, and finally the catch-all varargs desk.',
  moreExamples: [
    {
      title: 'Resolution priority: widening, boxing, then varargs',
      code: `public class OverloadPriority {
    static void pick(long value) {
        System.out.println("long");
    }

    static void pick(Integer value) {
        System.out.println("Integer");
    }

    static void pick(int... values) {
        System.out.println("varargs length=" + values.length);
    }

    public static void main(String[] args) {
        pick(7);
        pick(Integer.valueOf(8));
        pick(1, 2, 3);
    }
}`,
      output: `long
Integer
varargs length=3`,
      explain: [
        'The int literal widens to long instead of boxing to Integer.',
        'An Integer argument exactly matches the wrapper overload.',
        'Multiple int arguments leave only the varargs overload applicable.',
      ],
    },
    {
      title: 'Compile-time overloading versus runtime overriding',
      code: `public class OverloadAndOverride {
    static class Animal {}
    static class Dog extends Animal {}

    static class Greeter {
        void greet(Animal animal) {
            System.out.println("Greeter Animal");
        }

        void greet(Dog dog) {
            System.out.println("Greeter Dog");
        }
    }

    static class FriendlyGreeter extends Greeter {
        @Override
        void greet(Animal animal) {
            System.out.println("Friendly Animal");
        }
    }

    public static void main(String[] args) {
        Animal pet = new Dog();
        Greeter greeter = new FriendlyGreeter();
        greeter.greet(pet);
        greeter.greet(new Dog());
    }
}`,
      output: `Friendly Animal
Greeter Dog`,
      explain: [
        'pet is declared Animal, so greet(Animal) is selected at compile time; its override dispatches at runtime.',
        'new Dog() selects greet(Dog), which FriendlyGreeter did not override.',
      ],
    },
    {
      title: 'Null specificity and avoiding ambiguity',
      code: `public class NullOverload {
    static void show(Object value) {
        System.out.println("Object");
    }

    static void show(String value) {
        System.out.println("String");
    }

    public static void main(String[] args) {
        show(null);
        show((Object) null);
        // Adding show(Integer) would make show(null) ambiguous:
        // String and Integer are unrelated.
    }
}`,
      output: `String
Object`,
      explain: [
        'String is more specific than Object, so bare null selects show(String).',
        'A cast supplies the compile-time type and selects show(Object).',
      ],
    },
  ],
  mistakes: [
    'Trying to overload only by changing the return type.',
    'Expecting the runtime type of an argument to choose an overload.',
    'Assuming boxing beats primitive widening.',
    'Adding unrelated reference overloads without checking null-call ambiguity.',
    'Using many subtly different overloads when distinct method names would be clearer.',
  ],
  interviewAsk:
    'How does Java resolve overloaded methods, and how does overloading differ from overriding?',
  interviewAnswer:
    'The compiler gathers applicable overloads and chooses the most specific using compile-time argument types. Exact/fixed-arity conversions are preferred; primitive widening beats boxing, and varargs is the fallback. Overloading changes parameter lists and is compile-time selection, while overriding keeps a signature in a subclass and dispatches on runtime receiver type.',
  interviewTraps: [
    'Claiming return type participates in overload selection.',
    'Claiming an object argument’s runtime subtype selects the overload.',
  ],
  quiz: [
    {
      question: 'Given f(long), f(Integer), and f(int...), which handles f(1)?',
      options: ['f(long)', 'f(Integer)', 'f(int...)', 'Ambiguous'],
      correctIndex: 0,
      explain: 'Primitive widening to long is preferred over boxing and varargs.',
    },
    {
      question: 'Why can call(null) be ambiguous with call(String) and call(Integer)?',
      options: [
        'null cannot be passed',
        'Both are unrelated equally specific reference types',
        'Return types differ',
        'Varargs always wins',
      ],
      correctIndex: 1,
      explain: 'Neither String nor Integer is more specific than the other.',
    },
  ],
  practice:
    'Create a Logger with log(String), log(Object), and log(String, Object...) overloads. Predict and verify calls with a string, an integer, null with casts, and format arguments.',
  practiceHints: [
    'Write your prediction before compiling.',
    'Use explicit casts to demonstrate how compile-time types steer selection.',
  ],
});
