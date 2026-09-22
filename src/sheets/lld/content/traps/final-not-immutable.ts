import { lesson } from '../lessonFactory';

export default lesson({
  id: 'trap-final-not-immutable',
  title: 'Trap: final ≠ Immutable',
  section: 'traps',
  chapter: 'Java Pitfalls',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'final prevents reassignment of a reference, not mutation of the referred object — collections and beans can still change.',
  keywords: ['final', 'immutable', 'defensive copy', 'trap'],
  why:
    'Candidates claim “the list is final so the object is immutable” in LLD designs. Interviewers will mutate the list and break your invariants.',
  theory: [
    'final field: reference cannot be reassigned after construction.',
    'The object pointed to may still be mutable (List.add, setters).',
    'True immutability: all fields final, no setters, defensive copies of mutable inputs/outputs, preferably immutable element types.',
    'Collections.unmodifiableList is a read-only view — backing list can still change unless copied.',
    'Java records give shallow immutability — mutable components remain mutable.',
    'In LLD, prefer returning unmodifiable copies from getters for aggregate roots.',
  ],
  mentalModel:
    'final is a locked GPS pin to a house. You cannot point the pin at a different house, but people can still rearrange furniture inside. Immutability means the furniture is nailed down too (or you only hand out photographs).',
  codeTitle: 'final list still mutates',
  code: `import java.util.*;

class TeamBroken {
    private final List<String> members;
    TeamBroken(List<String> members) { this.members = members; }
    List<String> getMembers() { return members; }
}

class TeamSafe {
    private final List<String> members;
    TeamSafe(List<String> members) {
        this.members = List.copyOf(members); // defensive + unmodifiable
    }
    List<String> getMembers() { return members; }
}

public class Demo {
    public static void main(String[] args) {
        List<String> raw = new ArrayList<>(List.of("A"));
        TeamBroken broken = new TeamBroken(raw);
        raw.add("Hacker");
        broken.getMembers().add("Another");
        System.out.println(broken.getMembers());

        TeamSafe safe = new TeamSafe(new ArrayList<>(List.of("A")));
        try {
            safe.getMembers().add("Nope");
        } catch (UnsupportedOperationException e) {
            System.out.println("safe immutable: " + safe.getMembers());
        }
    }
}`,
  output: `[A, Hacker, Another]
safe immutable: [A]`,
  explain: [
    'TeamBroken’s final field still aliases the caller’s mutable list.',
    'List.copyOf stores an unmodifiable copy — no alias, no mutation.',
    'Getter must not return a live mutable reference.',
  ],
  mistakes: [
    'Believing final implies deep immutability.',
    'Returning Collections.unmodifiableList(internal) without realizing external holders of `internal` can mutate.',
    'Mutable records used as map keys.',
  ],
  interviewAsk: 'Is a final List field immutable?',
  interviewAnswer:
    'No. final only freezes the reference. For immutability, copy inputs, store unmodifiable structures, avoid setters, and do not leak mutable references from getters. Call out shallow vs deep immutability.',
  interviewTraps: [
    'Equating final with const in C++ without nuance.',
  ],
  quiz: {
    question: 'final List<String> names prevents:',
    options: [
      'names.add("x")',
      'Reassigning names to another list',
      'Mutating strings inside if they were mutable',
      'Using the list in a HashSet',
    ],
    correctIndex: 1,
    explain: 'final blocks reassignment, not list mutation.',
  },
  practice:
    'Refactor an Order(List<LineItem> items) class to be deeply safer: copy list, unmodifiable getter, final fields.',
  practiceHints: [
    'List.copyOf(items) in the constructor.',
    'If LineItem is mutable, consider copies or making LineItem immutable.',
  ],
});
