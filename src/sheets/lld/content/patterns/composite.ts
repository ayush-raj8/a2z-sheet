import { lesson } from '../lessonFactory';

export default lesson({
  id: 'pattern-composite',
  title: 'Composite Pattern',
  section: 'patterns',
  chapter: 'Structural',
  difficulty: 'intermediate',
  importance: 2,
  summary:
    'Compose objects into tree structures and treat individual leaves and whole composites uniformly through a shared component interface.',
  keywords: ['composite', 'tree', 'hierarchy', 'uniform interface'],
  why:
    'File systems, UI view trees, org charts, and nested menu structures all need “same operation on node or whole tree.” Composite is the clean LLD answer.',
  theory: [
    'Intent: compose objects into trees; let clients treat leaf and composite uniformly.',
    'Structure: Component interface (operation, add/remove/getChild optional), Leaf, Composite holding children.',
    'Client code calls operation() on root; recursion handles the tree.',
    'Transparency vs safety: putting add() on Component is transparent but allows add on leaves; safer designs put child management only on Composite.',
    'Works with Iterator/Visitor for traversal and cross-cutting ops.',
    'Watch for shared subtrees (DAG) — ownership and double-counting costs matter.',
  ],
  mentalModel:
    'Boxes inside boxes: a gift box can contain toys or more boxes. “Total weight” works the same whether you weigh one toy or a nested set of boxes — the interface is uniform.',
  codeTitle: 'File system Composite',
  code: `import java.util.*;

interface FileSystemNode {
    String name();
    int size(); // bytes
}

class FileLeaf implements FileSystemNode {
    private final String name;
    private final int size;
    FileLeaf(String name, int size) {
        this.name = name;
        this.size = size;
    }
    public String name() { return name; }
    public int size() { return size; }
}

class Directory implements FileSystemNode {
    private final String name;
    private final List<FileSystemNode> children = new ArrayList<>();
    Directory(String name) { this.name = name; }
    public void add(FileSystemNode node) { children.add(node); }
    public String name() { return name; }
    public int size() {
        int total = 0;
        for (FileSystemNode n : children) total += n.size();
        return total;
    }
}

public class Demo {
    public static void main(String[] args) {
        Directory root = new Directory("root");
        Directory docs = new Directory("docs");
        docs.add(new FileLeaf("a.txt", 10));
        docs.add(new FileLeaf("b.txt", 20));
        root.add(docs);
        root.add(new FileLeaf("readme.md", 5));
        System.out.println(root.size());
    }
}`,
  output: `35`,
  explain: [
    'Directory.size() sums children recursively.',
    'Client only needs FileSystemNode — no special-case for files vs dirs when computing size.',
    'add stays on Directory (safer composite).',
  ],
  mermaid: `classDiagram
    class FileSystemNode {
      <<interface>>
      +name()
      +size()
    }
    class FileLeaf
    class Directory
    FileSystemNode <|.. FileLeaf
    FileSystemNode <|.. Directory
    Directory o--> FileSystemNode : children`,
  mistakes: [
    'Forcing add/remove on leaves leading to UnsupportedOperationException everywhere — design the API carefully.',
    'Mutating the tree while iterating children without care.',
    'Using Composite for flat lists — overkill.',
  ],
  interviewAsk: 'How do you design Component so clients stay simple but leaves stay safe?',
  interviewAnswer:
    'Prefer the safety design: child management methods only on Composite. Clients that need to build trees depend on Directory/Composite type for structure, while operations like size/render stay on the common Component. Discuss transparency tradeoff if interviewer pushes for uniform add().',
  interviewTraps: [
    'Always putting add on the interface without mentioning UnsupportedOperationException smells.',
  ],
  quiz: {
    question: 'Composite lets clients:',
    options: [
      'Treat leaf and composite objects uniformly via a shared interface',
      'Guarantee thread safety automatically',
      'Replace SQL databases',
      'Avoid all recursion',
    ],
    correctIndex: 0,
    explain: 'Uniform treatment of tree nodes is the defining benefit.',
  },
  practice:
    'Model a UI View hierarchy: Label (leaf) and Panel (composite). Implement render() that prints indentation by depth.',
  practiceHints: [
    'Pass depth into render(int depth).',
    'Panel iterates children with depth+1.',
  ],
});
