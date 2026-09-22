import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-observer',
  title: 'Observer Pattern',
  section: 'patterns',
  chapter: 'Behavioral',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'Define a one-to-many dependency so when one object changes state, all dependents are notified automatically — the backbone of event-driven UI and messaging.',
  keywords: ['observer', 'pub-sub', 'events', 'listener'],
  why:
    'Stock tickers, UI listeners, domain events, and webhook fan-out are Observer variants. You must discuss coupling, notification order, and memory leaks (forgotten unsubscribe).',
  theory: [
    'Intent: notify multiple dependents of state changes without tight coupling to concrete subscribers.',
    'Subject (Observable) maintains a list of Observers; notify() calls update on each.',
    'Push model: subject sends data in update(data). Pull model: observers query subject after notification.',
    'Java: historically java.util.Observable (legacy); today prefer listeners, PropertyChangeSupport, reactive streams, or explicit domain events.',
    'Pub/Sub brokers generalize Observer across processes.',
    'Risks: surprising notification cascades, re-entrancy, and dangling references preventing GC.',
    'vs Mediator: Observer is broadcast of state; Mediator centralizes interaction rules among peers.',
  ],
  mentalModel:
    'YouTube channel: subscribers register interest. When a video uploads (state change), all subscribers get a notification. Creators do not hard-code each fan’s phone number into their upload code — the subscribe list handles fan-out.',
  codeTitle: 'Weather station Observer',
  code: `import java.util.*;

interface Observer {
    void update(float tempC);
}

interface Subject {
    void attach(Observer o);
    void detach(Observer o);
    void notifyObservers();
}

class WeatherStation implements Subject {
    private final List<Observer> observers = new ArrayList<>();
    private float tempC;

    public void attach(Observer o) { observers.add(o); }
    public void detach(Observer o) { observers.remove(o); }

    public void setTemperature(float tempC) {
        this.tempC = tempC;
        notifyObservers();
    }

    public void notifyObservers() {
        for (Observer o : List.copyOf(observers)) {
            o.update(tempC);
        }
    }
}

class PhoneDisplay implements Observer {
    public void update(float tempC) {
        System.out.println("Phone: " + tempC + "C");
    }
}

class LoggerDisplay implements Observer {
    public void update(float tempC) {
        System.out.println("Log temp=" + tempC);
    }
}

public class Demo {
    public static void main(String[] args) {
        WeatherStation station = new WeatherStation();
        station.attach(new PhoneDisplay());
        station.attach(new LoggerDisplay());
        station.setTemperature(28.5f);
    }
}`,
  output: `Phone: 28.5C
Log temp=28.5`,
  explain: [
    'Station knows Observer interface only — not PhoneDisplay concretely.',
    'List.copyOf avoids ConcurrentModification if an observer detaches during notify.',
    'Push model sends tempC directly.',
  ],
  mermaid: `sequenceDiagram
    participant S as WeatherStation
    participant P as PhoneDisplay
    participant L as LoggerDisplay
    S->>S: setTemperature
    S->>P: update(temp)
    S->>L: update(temp)`,
  mistakes: [
    'Forgetting unsubscribe → memory leaks in long-lived subjects.',
    'Observers doing heavy work synchronously on the notify thread — use queues/async when needed.',
    'Subjects exposing mutable internal collections of observers.',
    'Notification order assumptions — keep observers independent.',
  ],
  interviewAsk: 'How do you avoid cascading updates and coupling in Observer?',
  interviewAnswer:
    'Keep observer callbacks thin; prefer emitting immutable events; avoid observers mutating the subject in ways that re-notify unboundedly. Consider event bus with topics, async dispatch, and clear subscribe lifecycle. Mention push vs pull and why java.util.Observable is outdated.',
  interviewTraps: [
    'Ignoring unsubscribe/lifecycle.',
    'Hard-coding concrete observer types in the subject.',
  ],
  quiz: {
    question: 'Observer mainly enables:',
    options: [
      'Strict single-threaded execution',
      'One-to-many notifications on state change',
      'Binary serialization',
      'Compile-time dependency injection only',
    ],
    correctIndex: 1,
    explain: 'Fan-out notification is the core of Observer.',
  },
  practice:
    'Build an OrderService that notifies EmailNotifier and AnalyticsNotifier when an order is placed. Support detach.',
  practiceHints: [
    'Define OrderEvent with orderId and amount.',
    'Use copy-on-iterate when notifying.',
  ],
});
