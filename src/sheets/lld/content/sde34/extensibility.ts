import { lesson } from '../lessonFactory';

export default lesson({
  id: 'sde34-extensibility',
  title: 'Designing for Extensibility',
  section: 'sde34',
  chapter: 'Senior LLD',
  difficulty: 'advanced',
  importance: 3,
  prerequisites: ['trap-solid-overengineering', 'pattern-strategy'],
  summary:
    'Extension points, plugin seams, and versioning — open systems for change without painting yourself into abstraction corners.',
  keywords: ['extensibility', 'open-closed', 'plugins', 'versioning', 'sde4'],
  why:
    'SDE-3/4 interviews ask “how does this evolve in a year?” You must show deliberate seams: policies, ports, and feature flags — not infinite interfaces.',
  theory: [
    'Find axes of change: pricing, allocation, payment providers, notification channels.',
    'Put seams where change is proven or contractually expected; YAGNI elsewhere.',
    'Preferred tools: Strategy, Decorator, ports/adapters (hexagonal), registry/plugins.',
    'Config as data: fee rules tables beat redeploys for business knobs.',
    'API versioning and compatibility: additive changes, deprecate carefully.',
    'Feature flags for gradual rollout of behavior variants.',
    'Measure extensibility by blast radius of a new requirement — fewer modules touched is better.',
  ],
  mentalModel:
    'Build a power strip with a few well-labeled sockets (seams), not a wall of unlabeled adapters. When the business brings a new appliance (requirement), you plug in — you do not rewire the house.',
  codeTitle: 'Registry-based notification plugins',
  code: `import java.util.*;

interface Notifier {
    String channel();
    void send(String userId, String msg);
}

class EmailNotifier implements Notifier {
    public String channel() { return "email"; }
    public void send(String userId, String msg) {
        System.out.println("email:" + userId + ":" + msg);
    }
}

class SmsNotifier implements Notifier {
    public String channel() { return "sms"; }
    public void send(String userId, String msg) {
        System.out.println("sms:" + userId + ":" + msg);
    }
}

class NotificationBus {
    private final Map<String, Notifier> byChannel = new HashMap<>();

    void register(Notifier n) { byChannel.put(n.channel(), n); }

    void publish(String channel, String userId, String msg) {
        Notifier n = byChannel.get(channel);
        if (n == null) throw new IllegalArgumentException(channel);
        n.send(userId, msg);
    }
}

public class Demo {
    public static void main(String[] args) {
        NotificationBus bus = new NotificationBus();
        bus.register(new EmailNotifier());
        bus.register(new SmsNotifier());
        bus.publish("email", "u1", "hi");
        // PushNotifier can be registered later without editing bus
    }
}`,
  output: `email:u1:hi`,
  explain: [
    'NotificationBus is closed for modification, open for new Notifiers via register.',
    'Registry is a pragmatic plugin seam for interviews.',
    'Do not invent a full OSGi story unless asked.',
  ],
  mermaid: `flowchart LR
    App --> Port[Notifier port]
    Port --> Email
    Port --> SMS
    Port --> Push[Future plugin]`,
  mistakes: [
    'Abstracting every class “for SOLID.”',
    'Hard switch statements that grow forever with no exit plan.',
    'Breaking existing clients when adding fields — ignore versioning.',
  ],
  interviewAsk: 'Where would you place extension points in a payments service?',
  interviewAnswer:
    'PaymentProvider port (Strategy/Adapter per PSP), FraudPolicy, RetryPolicy, and Notification. Keep PaymentOrchestrator stable. Config for timeouts/limits. Version the public API. Explain what you would not abstract on day one (e.g., rare admin reports).',
  interviewTraps: [
    'Infinite indirection.',
    'No story for compatibility.',
  ],
  quiz: {
    question: 'A healthy extension point usually:',
    options: [
      'Requires editing 12 modules for each new variant',
      'Lets you add a variant by plugging a new implementation at a stable seam',
      'Means every field is an interface',
      'Eliminates all if-statements forever',
    ],
    correctIndex: 1,
    explain: 'Low blast radius at a stable seam is the goal.',
  },
  practice:
    'Take parking FeeCalculator and design a rule registry that can load HourlyRule and SurgeRule from a list without changing exit().',
  practiceHints: [
    'Composite FeeCalculator summing/maxing rules — or chain of responsibility.',
    'Register rules at startup.',
  ],
});
