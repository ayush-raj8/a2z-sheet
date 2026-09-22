import { lesson } from '../lessonFactory';

export default lesson({
  id: 'oop-access-modifiers',
  title: 'Access Modifiers',
  section: 'oop',
  chapter: 'Encapsulation',
  difficulty: 'intermediate',
  importance: 3,
  order: 2,
  prerequisites: ['oop-encapsulation', 'java-classes-objects'],
  summary:
    'private, default (package), protected, and public control who can see types and members — encapsulation starts here.',
  keywords: ['private', 'protected', 'public', 'package-private', 'encapsulation'],
  why: 'Package boundaries and member visibility are how LLD hides invariants. Wrong visibility either leaks internals or forces awkward workarounds and reflection hacks.',
  theory: [
    'private: same top-level class only (including nested types).',
    'default / package-private (no modifier): same package only — not subclasses in other packages.',
    'protected: package + subclasses (even outside the package), with subclass-access nuances for instance members.',
    'public: everywhere.',
    'Top-level classes are only public or package-private; nested types can be private/protected.',
    'Design rule: start private; widen deliberately. Modules (JPMS) can hide public packages from the outside world.',
  ],
  mentalModel:
    'Visibility is a series of fences: private = room, package = floor, protected = family bloodline across buildings, public = city street.',
  codeTitle: 'Runnable visibility demo with nested types',
  code: `public class Demo {
    static class Animal {
        private final String dna = "secret";
        final String packageNick = "buddy"; // no modifier: package-private
        protected final int legs = 4;
        public final String name = "animal";

        public void showPrivateThroughOwner() {
            System.out.println("private via Animal: " + dna);
        }
    }

    static class SamePackageFriend {
        void inspect(Animal animal) {
            // animal.dna would be private to Animal in separate top-level code.
            System.out.println("package: " + animal.packageNick);
            System.out.println("protected in package: " + animal.legs);
            System.out.println("public: " + animal.name);
        }
    }

    static class Dog extends Animal {
        void inspectInheritedMembers() {
            System.out.println("protected in subclass: " + legs);
            System.out.println("public in subclass: " + name);
            // In a genuinely different package, packageNick is not accessible.
        }
    }

    public static void main(String[] args) {
        Animal animal = new Animal();
        animal.showPrivateThroughOwner();
        new SamePackageFriend().inspect(animal);
        new Dog().inspectInheritedMembers();
    }
}`,
  output: `private via Animal: secret
package: buddy
protected in package: 4
public: animal
protected in subclass: 4
public in subclass: animal`,
  explain: [
    'This is one runnable source file, so nested types demonstrate the access syntax and inheritance behavior.',
    'A single source file cannot honestly place nested classes in different packages. The commented cross-package restriction must be tested with separate package files.',
    'In ordinary separate top-level classes, SamePackageFriend can read package-private, protected, and public members, but not private dna.',
    'A subclass in another package inherits protected access, but not package-private access.',
  ],
  mistakes: [
    'Leaving domain fields public "just for now."',
    'Assuming protected == package-private.',
    'Making everything public because Spring/Jackson need access — prefer getters or proper module config.',
  ],
  interviewAsk: 'Difference between protected and default access?',
  interviewAnswer:
    'Default (no modifier) is package-only. protected is package-only plus subclasses in other packages (for inherited access). A subclass outside the package cannot access protected members through an arbitrary superclass reference as freely as you might expect — access is tied to the inheritance relationship.',
  interviewTraps: [
    'Saying private members are invisible to nested classes.',
    'Claiming protected is visible to the whole world.',
  ],
  quiz: {
    question: 'A subclass in another package can access which of these outer-field styles?',
    options: [
      'private fields of the superclass',
      'package-private fields of the superclass',
      'protected members of the superclass (via inheritance)',
      'None of the above',
    ],
    correctIndex: 2,
    explain: 'protected crosses package borders for subclasses; package-private does not.',
  },
  practice:
    'Design a package `bank` with Account (private balance, public API) and a package-private InterestCalculator in the same package that can adjust balance — then try (and fail) to use InterestCalculator from another package.',
  practiceHints: [
    'Keep InterestCalculator without public modifier.',
    'Account can offer package-private applyInterest for the calculator.',
  ],
});
