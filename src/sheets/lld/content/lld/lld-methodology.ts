import { lesson } from '../lessonFactory';

export default lesson({
  id: 'lld-methodology',
  title: 'LLD Methodology',
  section: 'lld',
  chapter: 'Foundations',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'A repeatable interview workflow: clarify requirements → identify entities → draw diagrams → code core flows → discuss tradeoffs and extensions.',
  keywords: ['lld', 'methodology', 'interview', 'requirements', 'tradeoffs'],
  why:
    'Strong LLD is less about memorizing patterns and more about a calm process under time pressure. This checklist keeps you from coding too early or designing endlessly.',
  theory: [
    'Step 1 — Clarify: actors, functional requirements, out of scope, scale assumptions (users, QPS, data size — even if rough).',
    'Step 2 — Use cases: list primary flows (happy path) and critical edge cases (failures, concurrency, idempotency).',
    'Step 3 — Entities & relationships: nouns → classes; verbs → methods; watch for aggregation vs composition.',
    'Step 4 — APIs: public methods of services/controllers; define inputs/outputs and error cases.',
    'Step 5 — Diagrams: class diagram for structure; sequence diagram for the hardest flow; state diagram if lifecycle-heavy.',
    'Step 6 — Code: implement the core path end-to-end before polishing every class.',
    'Step 7 — Tradeoffs: extensibility vs complexity, consistency vs availability, sync vs async, in-memory vs DB.',
    'Step 8 — Extensions: interviewer follow-ups (multi-floor, payments, distributed locks) — show where the design bends.',
    'Speak assumptions aloud; write them down. Silence is how designs go off-track.',
  ],
  mentalModel:
    'Treat LLD like explaining a recipe on a whiteboard: confirm the dish (requirements), list ingredients (entities), sketch plating (diagrams), cook the main course (core code), then discuss substitutions (tradeoffs).',
  codeTitle: 'Interview checklist as a tiny driver',
  code: `import java.util.*;

public class LldSessionChecklist {
    public static void main(String[] args) {
        List<String> steps = List.of(
            "1. Clarify actors, scope, constraints",
            "2. List use cases + edge cases",
            "3. Identify entities & relationships",
            "4. Define service APIs",
            "5. Class + sequence (+ state) diagrams",
            "6. Code happy path",
            "7. Concurrency, failures, persistence",
            "8. Tradeoffs & extensions"
        );
        steps.forEach(System.out::println);
    }
}`,
  output: `1. Clarify actors, scope, constraints
2. List use cases + edge cases
3. Identify entities & relationships
4. Define service APIs
5. Class + sequence (+ state) diagrams
6. Code happy path
7. Concurrency, failures, persistence
8. Tradeoffs & extensions`,
  explain: [
    'Use this order in interviews even if you skip some depth.',
    'Diagrams before code prevent thrashing.',
    'Always leave time for tradeoffs — seniors are graded on judgment.',
  ],
  mermaid: `flowchart LR
    R[Requirements] --> E[Entities]
    E --> D[Diagrams]
    D --> C[Code core]
    C --> T[Tradeoffs]
    T --> X[Extensions]`,
  mistakes: [
    'Jumping into class definitions before confirming requirements.',
    'Designing a microservice mesh for a parking-lot toy problem.',
    'Never stating assumptions about single-machine vs distributed.',
    'Ignoring failure paths until the interviewer forces them.',
  ],
  interviewAsk: 'How do you approach an LLD problem in 45 minutes?',
  interviewAnswer:
    'Spend ~5–8 min clarifying scope and use cases, ~10 min on entities/APIs/diagrams, ~20 min coding the main flow with clean interfaces, ~5–10 min on concurrency/failures/extensions. Narrate tradeoffs continuously. Prefer boring clear designs over clever ones.',
  interviewTraps: [
    'Pattern-name dropping without mapping to requirements.',
    'Perfect UML, zero working flow.',
  ],
  quiz: {
    question: 'What should come before writing implementation code in an LLD interview?',
    options: [
      'Microservices and Kubernetes',
      'Clarified requirements, entities, and at least one diagram/API sketch',
      'Premature optimization of hash functions',
      'Choosing a database vendor logo',
    ],
    correctIndex: 1,
    explain: 'Alignment and structure first; code second.',
  },
  practice:
    'Pick “URL shortener LLD.” Write a 10-line requirement clarification script (questions you would ask) and a list of 6 entities you expect.',
  practiceHints: [
    'Ask about custom aliases, expiry, analytics, auth.',
    'Entities might include User, UrlMapping, ClickEvent, etc.',
  ],
  deepDive: [
    'For SDE-3/4, emphasize domain invariants, consistency boundaries, and evolution (versioned APIs, feature flags).',
    'Map non-functionals early: latency, durability, multi-tenancy — they change the design.',
  ],
});
