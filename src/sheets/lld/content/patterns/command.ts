import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-command',
  title: 'Command Pattern',
  section: 'patterns',
  chapter: 'Behavioral',
  difficulty: 'intermediate',
  importance: 3,
  summary:
    'Encapsulate a request as an object — enabling parameterization, queuing, logging, and undo/redo of operations.',
  keywords: ['command', 'undo', 'queue', 'macro', 'behavioral'],
  why:
    'Editors, smart-home remotes, job queues, and transactional workflows use Command. Undo stacks and delayed execution are classic interview follow-ups.',
  theory: [
    'Intent: encapsulate a request as an object, thereby letting you parameterize clients with different requests, queue them, and support undo.',
    'Roles: Command interface (execute/undo), ConcreteCommand binds receiver + action, Invoker stores/runs commands, Receiver does the real work.',
    'Decouples the object that invokes from the object that performs.',
    'Macro command: composite of commands executed as one.',
    'Useful for audit logs, transactional scripts, and CQRS-style write intents.',
    'Java: Runnable/Callable are lightweight command-like; richer domains add undo and metadata.',
  ],
  mentalModel:
    'A restaurant order ticket: the waiter (invoker) does not cook. The ticket (command) says “make pasta” and points at the kitchen (receiver). Tickets can be queued, canceled, or replayed.',
  codeTitle: 'Light remote with undo',
  code: `interface Command {
    void execute();
    void undo();
}

class Light {
    void on() { System.out.println("Light ON"); }
    void off() { System.out.println("Light OFF"); }
}

class LightOnCommand implements Command {
    private final Light light;
    LightOnCommand(Light light) { this.light = light; }
    public void execute() { light.on(); }
    public void undo() { light.off(); }
}

class LightOffCommand implements Command {
    private final Light light;
    LightOffCommand(Light light) { this.light = light; }
    public void execute() { light.off(); }
    public void undo() { light.on(); }
}

class Remote {
    private Command slot;
    private Command last;

    void setCommand(Command command) { this.slot = command; }

    void press() {
        slot.execute();
        last = slot;
    }

    void pressUndo() {
        if (last != null) last.undo();
    }
}

public class Demo {
    public static void main(String[] args) {
        Light light = new Light();
        Remote remote = new Remote();
        remote.setCommand(new LightOnCommand(light));
        remote.press();
        remote.pressUndo();
        remote.setCommand(new LightOffCommand(light));
        remote.press();
    }
}`,
  output: `Light ON
Light OFF
Light OFF`,
  explain: [
    'Remote depends on Command, not Light methods directly.',
    'undo reverses the last execute.',
    'You could store a Stack<Command> for multi-level undo.',
  ],
  mermaid: `classDiagram
    class Command {
      <<interface>>
      +execute()
      +undo()
    }
    class Remote {
      +setCommand(c)
      +press()
      +pressUndo()
    }
    class LightOnCommand
    class Light
    Remote --> Command
    LightOnCommand ..|> Command
    LightOnCommand --> Light`,
  mistakes: [
    'Commands that are anemic wrappers with no benefit over direct method calls.',
    'Undo that does not capture enough prior state (especially for set-value commands).',
    'Fat commands that contain all business logic instead of delegating to domain receivers.',
  ],
  interviewAsk: 'How would you design undo/redo for a text editor using Command?',
  interviewAnswer:
    'Each edit is a Command capturing enough state to execute and undo (or store inverse). Invoker keeps undo and redo stacks. execute pushes to undo and clears redo; undo pops, calls undo, pushes to redo. For complex docs, prefer storing reverse operations or immutable document snapshots for coarse undo.',
  interviewTraps: [
    'Only implementing execute without discussing state needed for undo.',
    'Confusing Command with Strategy — Strategy is replaceable algorithm; Command is a reified request with invoker/history semantics.',
  ],
  quiz: {
    question: 'Which capability is a hallmark of Command?',
    options: [
      'Making interfaces compatible',
      'Queuing/logging/undoing requests as objects',
      'Creating families of widgets',
      'Ensuring one instance',
    ],
    correctIndex: 1,
    explain: 'Reifying requests enables queue, macro, undo, and logging.',
  },
  practice:
    'Implement DepositCommand and WithdrawCommand on a BankAccount with an undo stack in TellersInvoker.',
  practiceHints: [
    'Withdraw undo should deposit the same amount.',
    'Reject withdraw execute if balance insufficient — do not push to undo stack.',
  ],
});
