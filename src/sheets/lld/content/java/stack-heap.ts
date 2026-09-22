import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-stack-heap',
  title: 'Stack and Heap',
  section: 'java',
  chapter: 'Memory & Object Model',
  difficulty: 'intermediate',
  importance: 3,
  prerequisites: ['java-arrays-varargs'],
  summary:
    'Each thread has a stack for frames (locals, partial results); objects and arrays live on the heap and are reclaimed by GC.',
  keywords: ['stack', 'heap', 'gc', 'stack frame', 'escape analysis'],
  why: 'LLD interviews expect you to reason about object lifetime, memory leaks (lingering references), and why recursive designs blow the stack while large graphs live on the heap.',
  theory: [
    'Call stack: each method invocation pushes a frame with local variables and operand stack; return pops the frame.',
    'Primitives and references in locals live in the frame. The objects those references point to live on the heap.',
    'new allocates on the heap (conceptually). Escape analysis may scalar-replace or stack-allocate in optimized cases — do not rely on this in design.',
    'Garbage collection reclaims heap objects that are unreachable from GC roots (stacks, statics, JNI, etc.).',
    'StackOverflowError: too deep recursion / huge frames. OutOfMemoryError: heap (or metaspace) exhausted.',
    'Sharing: multiple stack frames can hold references to the same heap object — mutations are visible across aliases.',
  ],
  mentalModel:
    'Stack is a sticky-note pad per thread (who called whom, with which locals). Heap is the warehouse of objects. Sticky notes hold addresses into the warehouse.',
  moreExamples: [
    {
      title: 'Two local references alias one heap object',
      code: `public class PersonMemoryDemo {
    static class Person {
        String name;
    }

    public static void main(String[] args) {
        Person p1 = new Person();
        p1.name = "Ada";
        Person p2 = p1;

        p2.name = "Grace";

        System.out.println("p1.name=" + p1.name);
        System.out.println("p2.name=" + p2.name);
        System.out.println("same object=" + (p1 == p2));
    }
}`,
      output: `p1.name=Grace
p2.name=Grace
same object=true`,
      explain: [
        'The main stack frame contains local reference variables p1 and p2.',
        'new Person() creates one Person object on the heap; Person p2 = p1 copies the reference, not the object.',
        'Both references point to that same object, so changing p2.name is visible through p1.',
      ],
    },
    {
      title: 'Java passes object references by value',
      code: `public class ReferenceValueDemo {
    static class Box {
        int value;

        Box(int value) {
            this.value = value;
        }
    }

    static void change(Box local) {
        local.value++;
        local = new Box(999);
        System.out.println("inside=" + local.value);
    }

    public static void main(String[] args) {
        Box box = new Box(10);
        change(box);
        System.out.println("outside=" + box.value);
    }
}`,
      output: `inside=999
outside=11`,
      explain: [
        'change receives its own stack-local copy of the reference.',
        'local.value++ mutates the shared heap object, but assigning a new Box to local does not reassign main’s box variable.',
        'The Box(999) object becomes unreachable after change returns and is then eligible for garbage collection.',
      ],
    },
    {
      title: 'Method calls create and remove stack frames',
      code: `public class StackFrameDemo {
    static int doubleValue(int value) {
        int result = value * 2;
        return result;
    }

    static int addDoubled(int left, int right) {
        int first = doubleValue(left);
        int second = doubleValue(right);
        return first + second;
    }

    public static void main(String[] args) {
        int total = addDoubled(3, 4);
        System.out.println("total=" + total);
    }
}`,
      output: `total=14`,
      explain: [
        'main, addDoubled, and doubleValue each get a stack frame while active.',
        'A frame holds that invocation’s primitive locals and references; returning removes the frame.',
        'Deep unbounded recursion can exhaust stack space even when plenty of heap remains.',
      ],
    },
  ],
  mistakes: [
    'Thinking Java is "pass by reference" for objects — references are passed by value.',
    'Holding objects in static collections forever → logical memory leak.',
    'Deep recursion for large inputs instead of an explicit heap-based stack/queue.',
  ],
  interviewAsk: 'Where do objects and local variables live in Java?',
  interviewAnswer:
    'Local variables (primitives and references) live in the stack frame of the method. Objects and arrays created with new live on the heap. The GC frees heap memory when objects become unreachable. Threads do not share stacks; they share the heap.',
  interviewTraps: [
    'Saying all variables live on the heap.',
    'Claiming GC runs on a fixed schedule you can depend on for correctness.',
  ],
  quiz: [
    {
      question: 'Reassigning a parameter reference inside a method affects the caller’s variable?',
      options: [
        'Always yes',
        'No — only mutations of the shared object are visible',
        'Only for primitives',
        'Only if the parameter is final',
      ],
      correctIndex: 1,
      explain:
        'The parameter is a copy of the reference; rebinding it does not change the caller’s sticky note.',
    },
  ],
  practice:
    'Draw (on paper) stack frames for main → bump for the demo above, labeling where x, box, and b live and what they point to before/after b.value++ and after b = new Box(999).',
  practiceHints: [
    'Two sticky notes can point to one Box after the call starts.',
    'After reassignment, bump’s b points to a different Box that becomes unreachable when bump returns.',
  ],
  mermaid: `flowchart TB
    subgraph Stack["Thread stack"]
      mainFrame["main frame: x=5, box→"]
      bumpFrame["bump frame: b→"]
    end
    subgraph Heap["Heap"]
      boxObj["Box value=11"]
    end
    mainFrame --> boxObj
    bumpFrame --> boxObj`,
});
