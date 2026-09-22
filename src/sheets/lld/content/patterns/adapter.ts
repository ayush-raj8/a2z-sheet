import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-adapter',
  title: 'Adapter Pattern',
  section: 'patterns',
  chapter: 'Structural',
  difficulty: 'beginner',
  importance: 3,
  summary:
    'Convert one interface into another clients expect — integrate legacy APIs, third-party SDKs, and mismatched contracts without rewriting callers.',
  keywords: ['adapter', 'wrapper', 'structural', 'legacy integration'],
  why:
    'Real systems constantly glue mismatched APIs. Adapter lets you keep clean domain interfaces while translating to ugly vendor or legacy shapes — a staple LLD interview answer for "how do you integrate X?"',
  theory: [
    'Intent: convert the interface of a class into another interface clients expect.',
    'Object adapter (preferred): composition — Adapter holds Adaptee and implements Target.',
    'Class adapter: inheritance from Adaptee + Target (Java: single inheritance limits this).',
    'Client depends on Target; never on Adaptee.',
    'Two-way adapters exist but increase complexity; prefer unidirectional.',
    'Differs from Facade: Adapter makes incompatible interfaces work together; Facade simplifies a subsystem.',
    'Differs from Decorator: Adapter changes interface; Decorator keeps interface and adds behavior.',
  ],
  mentalModel:
    'A travel plug adapter: your laptop expects Type-C; the hotel wall is Type-A. The adapter does not add battery life (that is Decorator) — it only makes the shapes fit.',
  codeTitle: 'Payment gateway Adapter',
  code: `interface PaymentProcessor {
    boolean pay(int amountInPaise, String currency);
}

// Legacy / third-party SDK we cannot change
class StripeSdk {
    public String chargeDollars(double dollars) {
        return "stripe_ok:" + dollars;
    }
}

class StripePaymentAdapter implements PaymentProcessor {
    private final StripeSdk stripe;

    StripePaymentAdapter(StripeSdk stripe) {
        this.stripe = stripe;
    }

    public boolean pay(int amountInPaise, String currency) {
        if (!"INR".equals(currency)) return false;
        double dollars = amountInPaise / 100.0 / 83.0; // demo FX
        String result = stripe.chargeDollars(dollars);
        return result.startsWith("stripe_ok");
    }
}

public class Demo {
    public static void main(String[] args) {
        PaymentProcessor processor = new StripePaymentAdapter(new StripeSdk());
        System.out.println(processor.pay(8300, "INR"));
    }
}`,
  output: `true`,
  explain: [
    'Domain uses paise + currency; StripeSdk wants dollars — Adapter translates.',
    'Checkout code depends only on PaymentProcessor.',
    'Swapping to Razorpay means a new adapter, not rewriting checkout.',
  ],
  mermaid: `classDiagram
    class PaymentProcessor {
      <<interface>>
      +pay(amount, currency)
    }
    class StripePaymentAdapter
    class StripeSdk
    class Checkout
    PaymentProcessor <|.. StripePaymentAdapter
    StripePaymentAdapter --> StripeSdk : adaptee
    Checkout --> PaymentProcessor`,
  mistakes: [
    'Putting business rules inside Adapter until it becomes a God object — keep adaptation thin.',
    'Exposing Adaptee types through Adapter methods — leaks the thing you wrapped.',
    'Confusing Adapter with Decorator because both wrap objects.',
  ],
  interviewAsk: 'Adapter vs Facade vs Decorator — how do you choose?',
  interviewAnswer:
    'Adapter: make an existing interface match what the client needs (translation). Facade: give a simple API over a complex subsystem (simplification, same goal interface). Decorator: add responsibilities while preserving the same interface (enhancement). Choose based on whether the problem is mismatch, complexity, or added behavior.',
  interviewTraps: [
    'Saying they are the same because all wrap objects.',
    'Building a huge Adapter that also orchestrates the whole subsystem (that is Facade territory).',
  ],
  quiz: {
    question: 'Adapter primarily changes:',
    options: [
      'Runtime performance only',
      'The interface so a client can use an incompatible class',
      'The inheritance hierarchy of the client',
      'Garbage collection behavior',
    ],
    correctIndex: 1,
    explain: 'Adapter exists to reconcile interface mismatch.',
  },
  practice:
    'You have XmlReportGenerator.generateXml(). Your app needs ReportExporter.exportJson(). Write an Adapter that converts XML to JSON (stub the conversion) behind ReportExporter.',
  practiceHints: [
    'Target = ReportExporter, Adaptee = XmlReportGenerator.',
    'Keep conversion logic inside the adapter or a dedicated mapper.',
  ],
});
