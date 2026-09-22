import { lesson } from '../lessonFactory';

export default lesson({
  id: 'solid-isp',
  title: 'Interface Segregation Principle',
  section: 'solid',
  chapter: 'SOLID Principles',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['solid-lsp'],
  summary:
    'Prefer small, focused interfaces so clients are not forced to depend on methods they do not use.',
  keywords: ['ISP', 'interface segregation', 'SOLID', 'fat interface'],
  why: `Fat interfaces force classes to implement empty methods and force callers to depend on junk they never call. That coupling shows up as brittle mocks and “UnsupportedOperationException” stubs — an interview red flag.`,
  theory: [
    'Interface Segregation: many client-specific interfaces are better than one general-purpose interface.',
    'Clients should not be forced to depend on methods they do not use — dependency is contagious.',
    'Smell: Machine with print/fax/staple and SimplePrinter implements fax by throwing.',
    'Segregate by client needs (Printer, Fax, Scanner), not by random method count.',
    'ISP pairs with LSP: skinny interfaces make contracts easier to honor.',
    'Do not explode into one-method interfaces blindly — segregate where clients actually diverge.',
  ],
  mentalModel: `Don’t hand every diner a 40-page menu of industrial kitchen controls. Give cooks the grill panel and guests the food menu — ISP is role-appropriate remotes.`,
  codeTitle: 'Fat interface vs segregated interfaces',
  code: `// BAD fat interface
interface MultiFunctionDevice {
    void print(String doc);
    void fax(String doc);
    void scan(String doc);
}

class CheapPrinter implements MultiFunctionDevice {
    public void print(String doc) { System.out.println("print " + doc); }
    public void fax(String doc) { throw new UnsupportedOperationException(); }
    public void scan(String doc) { throw new UnsupportedOperationException(); }
}

// GOOD — clients depend only on what they need
interface Printer { void print(String doc); }
interface Fax { void fax(String doc); }
interface Scanner { void scan(String doc); }

class OfficePrinter implements Printer {
    public void print(String doc) { System.out.println("print " + doc); }
}

class AllInOne implements Printer, Fax, Scanner {
    public void print(String doc) { System.out.println("print " + doc); }
    public void fax(String doc) { System.out.println("fax " + doc); }
    public void scan(String doc) { System.out.println("scan " + doc); }
}

class PrintService {
    void run(Printer p, String doc) { p.print(doc); } // no fax dependency
}

public class Demo {
    public static void main(String[] args) {
        new PrintService().run(new OfficePrinter(), "invoice");
        new PrintService().run(new AllInOne(), "memo");
        new AllInOne().scan("passport");
    }
}`,
  output: `print invoice
print memo
scan passport`,
  explain: [
    'CheapPrinter was forced to stub fax/scan — fat interface smell.',
    'PrintService depends only on Printer; it will not break if Fax changes.',
    'AllInOne implements multiple small interfaces — capability mix without forcing others.',
  ],
  mistakes: [
    'One giant “IService” with dozens of methods for a whole microservice.',
    'Segregating into useless fragments that always move together.',
    'Using default methods in interfaces to hide ISP problems with empty stubs.',
  ],
  interviewAsk: 'What is ISP? How does it relate to fat interfaces?',
  interviewAnswer:
    'ISP says depend only on the methods you need. A fat MultiFunctionDevice forces simple printers to stub fax/scan and forces print-only clients to “know” about fax. Split into Printer/Fax/Scanner so implementations and callers stay lean and substitutable.',
  interviewTraps: [
    'Claiming every interface must have exactly one method.',
  ],
  quiz: {
    question: 'Implementing fax() by throwing in a print-only class usually indicates:',
    options: [
      'Perfect OCP',
      'ISP (and often LSP) violation from a fat interface',
      'Good encapsulation',
      'Required by the JVM',
    ],
    correctIndex: 1,
    explain: 'Forced unused methods are the ISP smell; throwing also risks LSP.',
  },
  practice:
    'Refactor a Worker interface with work()/eat()/getPaid() so Robot workers are not forced to eat. Propose interface split.',
  practiceHints: [
    'Workable, Eater, Payable — Robot implements Workable (+ maybe Payable).',
  ],
});
