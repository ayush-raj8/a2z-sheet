import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-adapter-vs-decorator',
  title: 'Adapter vs Decorator',
  section: 'patterns',
  chapter: 'Comparisons',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['pattern-adapter', 'pattern-decorator'],
  summary:
    'Both wrap objects, but Adapter changes the interface to match the client; Decorator keeps the interface and adds behavior.',
  keywords: ['adapter', 'decorator', 'comparison', 'wrapper'],
  why:
    'Interviewers specifically probe wrapper patterns. If you cannot state the interface question clearly, you will muddle LLD integration answers.',
  theory: [
    'Shared idea: composition — a wrapper holds another object.',
    'Adapter: Target interface ≠ Adaptee interface. Translation is the point.',
    'Decorator: Component interface = decorated object interface. Enhancement is the point.',
    'Adapter often wraps a foreign/legacy type; Decorator wraps your own hierarchy to stack features.',
    'You can decorate an adapter result if you need both translation and added behavior — keep responsibilities split across classes.',
    'Proxy also wraps with same interface but for access/lifecycle — third sibling in interviews.',
  ],
  mentalModel:
    'Adapter = travel plug (shape change). Decorator = phone case with extra battery (same ports, more features). You would not call a battery pack a “plug adapter.”',
  codeTitle: 'Same wrap, different contracts',
  code: `// ADAPTER: different interface
interface JsonLogger { void logJson(String json); }
class LegacyLogger { void log(String line) { System.out.println(line); } }
class LoggerAdapter implements JsonLogger {
    private final LegacyLogger legacy;
    LoggerAdapter(LegacyLogger legacy) { this.legacy = legacy; }
    public void logJson(String json) { legacy.log("JSON:" + json); }
}

// DECORATOR: same interface
interface JsonLogger2 { void logJson(String json); }
class ConsoleJsonLogger implements JsonLogger2 {
    public void logJson(String json) { System.out.println(json); }
}
class TimestampLogger implements JsonLogger2 {
    private final JsonLogger2 inner;
    TimestampLogger(JsonLogger2 inner) { this.inner = inner; }
    public void logJson(String json) {
        inner.logJson(System.currentTimeMillis() + " " + json);
    }
}

public class Demo {
    public static void main(String[] args) {
        JsonLogger adapted = new LoggerAdapter(new LegacyLogger());
        adapted.logJson("{\\"ok\\":true}");

        JsonLogger2 decorated = new TimestampLogger(new ConsoleJsonLogger());
        decorated.logJson("{\\"ok\\":true}");
    }
}`,
  output: `JSON:{"ok":true}
<timestamp> {"ok":true}`,
  explain: [
    'Adapter presents JsonLogger while LegacyLogger only has log(String).',
    'Decorator still is JsonLogger2 and adds timestamp behavior.',
    'Note: timestamp in output is illustrative — actual millis vary.',
  ],
  mermaid: `flowchart LR
    subgraph Adapter
      Client1 --> Target
      Target --> Adaptee
    end
    subgraph Decorator
      Client2 --> D1[Decorator]
      D1 --> D0[Component]
    end`,
  mistakes: [
    'Naming a class Adapter when it only adds logging on the same interface — that is Decorator.',
    'Changing method names in a Decorator — accidental Adapter.',
    'One mega-wrapper that both translates and adds five features — split types.',
  ],
  interviewAsk: 'How do you tell Adapter and Decorator apart in a code review?',
  interviewAnswer:
    'Ask: does the wrapper implement a different interface than the wrapped object? If yes, Adapter. If it implements the same interface and forwards while adding behavior, Decorator. Also ask intent: integration vs feature stacking. Mention Proxy if access control/laziness appears.',
  interviewTraps: [
    '“Both are wrappers so they are the same.”',
    'Ignoring the Proxy third option.',
  ],
  quiz: {
    question: 'You need your app’s NotificationSender.send(msg) to call VendorSdk.push(payloadMap). Which pattern?',
    options: ['Decorator', 'Adapter', 'State', 'Singleton'],
    correctIndex: 1,
    explain: 'Interface mismatch with a vendor SDK is classic Adapter.',
  },
  practice:
    'Given Readable.readChar() and your app needing Reader.readLine(), implement an Adapter. Then wrap that Reader with a CountingReader Decorator that counts lines.',
  practiceHints: [
    'Two classes, two intents.',
    'CountingReader implements Reader, not Readable.',
  ],
});
