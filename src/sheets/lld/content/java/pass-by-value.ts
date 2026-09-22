import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-pass-by-value',
  title: 'Argument Passing — Pass by Value',
  section: 'java',
  chapter: 'Memory & Object Model',
  difficulty: 'beginner',
  importance: 3,
  prerequisites: ['java-primitives-references', 'java-classes-objects'],
  summary:
    'Java always passes arguments by value: primitives copy the bits; references copy the reference — reassigning a parameter never rebinds the caller’s variable.',
  keywords: ['pass by value', 'argument passing', 'reference', 'aliasing', 'methods'],
  why:
    'Interviewers love “does Java pass objects by reference?” The precise answer unlocks why swap(a,b) fails and why mutating fields through a parameter works.',
  theory: [
    'Every method parameter receives a copy of the argument value.',
    'For primitives, that copy is the numeric/boolean bits — changing the parameter does not change the caller’s variable.',
    'For reference types, the copy is the reference (address-like). The parameter aliases the same object; mutating fields is visible to the caller.',
    'Reassigning the parameter (obj = new Something()) only changes the local copy of the reference — the caller still points at the old object.',
    'Arrays are objects: methods can change array[i], but cannot make the caller’s array variable point to a different array by reassignment alone.',
    'There is no C++-style pass-by-reference or out-parameter built into the language.',
  ],
  mentalModel:
    'Hand someone a photocopy of a house key (reference copy). They can unlock and rearrange furniture (mutate). Throwing away their photocopy does not change which key you still hold.',
  codeTitle: 'Mutate vs rebind',
  code: `class Box {
    int value;
    Box(int value) { this.value = value; }
}

public class PassByValueDemo {
    static void bumpPrimitive(int n) {
        n = n + 1; // local copy only
    }

    static void bumpField(Box b) {
        b.value = b.value + 1; // same object as caller
    }

    static void rebind(Box b) {
        b = new Box(999); // rebinds local parameter only
    }

    public static void main(String[] args) {
        int x = 10;
        bumpPrimitive(x);
        System.out.println("x=" + x);

        Box box = new Box(10);
        bumpField(box);
        System.out.println("after bumpField=" + box.value);

        rebind(box);
        System.out.println("after rebind=" + box.value);
    }
}`,
  output: `x=10
after bumpField=11
after rebind=11`,
  explain: [
    'bumpPrimitive changes only the copy of x.',
    'bumpField uses the copied reference to reach the same Box and mutates value to 11.',
    'rebind points the parameter at a new Box(999); the caller’s box still refers to the original object (still 11).',
  ],
  mistakes: [
    'Saying “Java is pass-by-reference” because objects appear shared.',
    'Writing a swap(a,b) that reassigns parameters and expecting callers’ variables to swap.',
    'Confusing mutating an object with rebinding a variable.',
  ],
  interviewAsk: 'Is Java pass-by-reference or pass-by-value?',
  interviewAnswer:
    'Strictly pass-by-value. Object variables hold references; the reference is copied into the parameter. That enables aliasing/mutation but not rebinding the caller’s variable. Saying “pass-by-reference” is imprecise and often marked wrong.',
  interviewTraps: [
    '“Objects are passed by reference” without mentioning the reference itself is copied by value.',
  ],
  quiz: {
    question: 'After rebind(box) in the example, what is box.value?',
    options: ['999', '11', '10', 'Compilation error'],
    correctIndex: 1,
    explain:
      'rebind only changes the local parameter to a new Box(999). The caller’s box still points at the original object, whose value was already bumped to 11.',
  },
  practice:
    'Implement a true swap of two Integer holders using a mutable holder class (or array of length 2). Explain why swap(Integer a, Integer b) cannot swap the caller’s variables.',
  practiceHints: [
    'Integer is immutable — reassignment inside a method cannot update caller bindings.',
    'Use a small class with a mutable field, or int[2].',
  ],
  deepDive: [
    'Historical confusion comes from “reference types” vs “pass-by-reference.” In Java, references are values that get copied.',
  ],
});
