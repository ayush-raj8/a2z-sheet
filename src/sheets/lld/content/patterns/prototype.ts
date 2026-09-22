import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-prototype',
  title: 'Prototype Pattern',
  section: 'patterns',
  chapter: 'Creational',
  difficulty: 'intermediate',
  importance: 2,
  summary:
    'Create new objects by copying a prototype instance — useful when construction is expensive or configuration variants are many.',
  keywords: ['prototype', 'clone', 'deep copy', 'creational'],
  why:
    'When object setup is costly (game entities, document templates, ML model configs) or when you need many similar instances with small tweaks, cloning a prototype beats reconstructing from scratch.',
  theory: [
    'Intent: specify kinds of objects to create using a prototypical instance, and create by copying.',
    'Java: Cloneable + clone() is the classic (flawed) approach; prefer copy constructors or copy factories.',
    'Shallow vs deep copy: shallow shares nested references; deep recursively copies the graph.',
    'Registry of prototypes: store named prototypes and clone on demand.',
    'Avoid Cloneable pitfalls: clone() is not in an interface you control, breaks final fields, easy to get shallow copies wrong.',
    'Prefer: copy constructor Document(Document other) or Document.copy() that you own.',
    'Related: Prototype helps when subclasses are unknown to the client — client clones whatever prototype it holds.',
  ],
  mentalModel:
    'A photocopier: you keep a master resume template (prototype). Each candidate gets a copy you then tweak — faster than writing a resume from a blank page every time. Be careful: if the master has a sticky note attached (nested mutable object), a shallow copy still shares that note.',
  codeTitle: 'Copy constructor Prototype (preferred over Cloneable)',
  code: `import java.util.*;

class Preference {
    String theme;
    Preference(String theme) { this.theme = theme; }
    Preference(Preference other) { this.theme = other.theme; }
}

class UserProfile {
    String name;
    List<String> roles;
    Preference preference;

    UserProfile(String name, List<String> roles, Preference preference) {
        this.name = name;
        this.roles = new ArrayList<>(roles);
        this.preference = preference;
    }

    // Prototype: deep-ish copy
    UserProfile(UserProfile other) {
        this.name = other.name;
        this.roles = new ArrayList<>(other.roles);
        this.preference = new Preference(other.preference);
    }

    UserProfile copy() {
        return new UserProfile(this);
    }
}

public class Demo {
    public static void main(String[] args) {
        UserProfile proto = new UserProfile(
            "guest", List.of("READ"), new Preference("dark"));
        UserProfile u1 = proto.copy();
        u1.name = "ayush";
        u1.roles.add("WRITE");
        u1.preference.theme = "light";

        System.out.println(proto.name + " " + proto.roles + " " + proto.preference.theme);
        System.out.println(u1.name + " " + u1.roles + " " + u1.preference.theme);
    }
}`,
  output: `guest [READ] dark
ayush [READ, WRITE] light`,
  explain: [
    'copy() uses a copy constructor — clearer than Object.clone().',
    'roles and preference are copied so mutations on u1 do not leak to proto.',
    'If Preference were shared (shallow), changing theme would corrupt the prototype.',
  ],
  mermaid: `flowchart LR
    P[Prototype registry]
    P -->|clone| A[Instance A]
    P -->|clone| B[Instance B]
    A -->|mutate fields| A2[Customized A]
    B -->|mutate fields| B2[Customized B]`,
  mistakes: [
    'Using Object.clone() without understanding shallow copy of mutable nested fields.',
    'Mutating the prototype after handing out clones that share nested state.',
    'Implementing Cloneable but forgetting to call super.clone() correctly in subclasses.',
  ],
  interviewAsk: 'How would you implement Prototype safely in Java?',
  interviewAnswer:
    'Avoid Cloneable when possible. Use a copy constructor or copy factory that explicitly deep-copies mutable fields. Document shallow vs deep. For graphs with cycles, use a copy context map. Mention when Prototype wins: expensive setup, many variants from a template.',
  interviewTraps: [
    'Saying clone() is always deep.',
    'Not discussing mutable nested objects.',
  ],
  quiz: {
    question: 'What is the main risk of a shallow copy in Prototype?',
    options: [
      'Slower performance',
      'Shared mutable nested objects between clones',
      'Inability to subclass',
      'Loss of static fields',
    ],
    correctIndex: 1,
    explain: 'Shallow copies share references; mutating nested state affects other clones/prototypes.',
  },
  practice:
    'Implement a Shape prototype registry with Circle and Rectangle. Support register(name, shape) and create(name) that returns a deep copy.',
  practiceHints: [
    'Give Shape a copy() method.',
    'Store prototypes in a Map<String, Shape>.',
  ],
});
