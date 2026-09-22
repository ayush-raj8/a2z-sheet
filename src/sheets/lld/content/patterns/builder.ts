import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-builder',
  title: 'Builder Pattern',
  section: 'patterns',
  chapter: 'Creational',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'Construct complex objects step by step, separating construction from representation — ideal for many optional fields and immutable objects.',
  keywords: ['builder', 'fluent API', 'immutable', 'telescoping constructor'],
  why:
    'Telescoping constructors and bags of setters make objects hard to create correctly. Builder gives readable, validated construction and pairs well with immutability in interview designs (HttpRequest, Query, Pizza).',
  theory: [
    'Intent: separate the construction of a complex object from its representation.',
    'Problem: many optional parameters → constructor explosion or mutable half-built objects.',
    'Classic GoF Builder: Director orchestrates steps; Builder implementations produce different representations.',
    'Modern Java Builder (Effective Java): nested static Builder with fluent withX/setX and build().',
    'Supports immutability: all fields final on the product; Builder holds temporary state.',
    'Validation belongs in build() — fail fast before returning a broken product.',
    'Unlike Factory: Factory focuses on which subtype; Builder focuses on how to assemble one complex instance.',
  ],
  mentalModel:
    'Ordering a custom burger: choose bun, patty, cheese, sauces one by one; the kitchen (builder) assembles and only hands you the finished burger (product). You do not walk out with a bare patty mid-order.',
  codeTitle: 'Immutable HttpRequest Builder',
  code: `import java.util.*;

public final class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;

    private HttpRequest(Builder b) {
        this.url = b.url;
        this.method = b.method;
        this.headers = Collections.unmodifiableMap(new HashMap<>(b.headers));
        this.body = b.body;
    }

    public static class Builder {
        private final String url;
        private String method = "GET";
        private final Map<String, String> headers = new HashMap<>();
        private String body = "";

        public Builder(String url) {
            this.url = Objects.requireNonNull(url);
        }

        public Builder method(String method) {
            this.method = method;
            return this;
        }

        public Builder header(String k, String v) {
            headers.put(k, v);
            return this;
        }

        public Builder body(String body) {
            this.body = body;
            return this;
        }

        public HttpRequest build() {
            if (url.isBlank()) throw new IllegalStateException("url required");
            if ("POST".equals(method) && body.isBlank())
                throw new IllegalStateException("POST needs body");
            return new HttpRequest(this);
        }
    }

    public String summary() {
        return method + " " + url + " headers=" + headers.size();
    }

    public static void main(String[] args) {
        HttpRequest req = new HttpRequest.Builder("https://api.example.com/orders")
            .method("POST")
            .header("Content-Type", "application/json")
            .body("{\\"id\\":1}")
            .build();
        System.out.println(req.summary());
    }
}`,
  output: `POST https://api.example.com/orders headers=1`,
  explain: [
    'Required url is in Builder constructor; optionals are fluent.',
    'Product fields are final; headers copied defensively.',
    'build() centralizes invariants.',
  ],
  mermaid: `sequenceDiagram
    participant C as Client
    participant B as Builder
    participant P as HttpRequest
    C->>B: new Builder(url)
    C->>B: method / header / body
    C->>B: build()
    B->>B: validate
    B->>P: new HttpRequest(this)
    B-->>C: immutable request`,
  mistakes: [
    'Returning the Builder from build() by accident — always return the Product.',
    'Skipping validation in build() and allowing invalid states.',
    'Mutating the product after build (setters on product) — defeats the point of immutable builders.',
    'Using Builder for a 2-field class — overengineering.',
  ],
  interviewAsk: 'When do you prefer Builder over constructors or setters?',
  interviewAnswer:
    'Use Builder when there are many optional parameters, you want immutability, or construction needs multi-step validation. Prefer constructors for few required fields. Avoid setters on domain objects if they allow invalid intermediate states — Builder + final fields is cleaner.',
  interviewTraps: [
    'Implementing Builder but leaving public setters on the product.',
    'Confusing Builder with Factory — different problems.',
  ],
  quiz: {
    question: 'Where should invariant checks typically live in a modern Java Builder?',
    options: [
      'In every setter of the product',
      'In the Builder.build() method',
      'In finalize()',
      'In equals()',
    ],
    correctIndex: 1,
    explain: 'build() is the gate where you validate before constructing the immutable product.',
  },
  practice:
    'Build an immutable SqlQuery with select, from, where, limit via Builder. Reject build() if from is missing.',
  practiceHints: [
    'Store where clauses in a List.',
    'toString() can assemble the SQL for demo purposes.',
  ],
});
