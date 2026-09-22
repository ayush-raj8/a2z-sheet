import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-packages-imports',
  title: 'Packages and Imports',
  section: 'java',
  chapter: 'Java Fundamentals',
  difficulty: 'beginner',
  importance: 2,
  prerequisites: ['java-program-structure-main'],
  summary:
    'Packages namespace types and map to directories; imports are compile-time shortcuts, not copies of code.',
  keywords: ['package', 'import', 'classpath', 'namespace', 'fully qualified name'],
  why: 'LLD and large codebases live or die by package boundaries. Wrong packaging creates cyclic messes; misunderstanding imports causes "works in IDE, fails in jar" confusion.',
  theory: [
    'package com.example.app; declares the namespace for types in that file; directory layout should mirror the package.',
    'Fully qualified name (FQN) is package + type, e.g. java.util.ArrayList.',
    'import java.util.List; is syntactic sugar so you can write List instead of the FQN — it does not load classes at runtime by itself.',
    'import java.util.*; imports types in that package only (not subpackages). Static imports pull static members: import static java.lang.Math.max;',
    'java.lang is auto-imported (String, Object, System, …).',
    'Modules (JPMS) add stronger encapsulation on top of packages; classic apps still rely heavily on package + classpath.',
  ],
  mentalModel:
    'A package is a folder in the design of your system. An import is just an alias in the source file — the classpath/module path decides what actually gets loaded.',
  codeTitle: 'Packages, imports, and FQN clash resolution',
  code: `package com.shop.cart;

import java.util.ArrayList;
import java.util.List;
import java.util.Date; // util.Date

public class Cart {
    private final List<String> items = new ArrayList<>();

    public void add(String sku) {
        items.add(sku);
    }

    public void printReceipt() {
        // Disambiguate with FQN when two types share a simple name
        java.sql.Date sqlDate = new java.sql.Date(System.currentTimeMillis());
        Date utilDate = new Date();
        System.out.println("Items: " + items);
        System.out.println("util.Date: " + utilDate);
        System.out.println("sql.Date : " + sqlDate);
    }

    public static void main(String[] args) {
        Cart cart = new Cart();
        cart.add("SKU-100");
        cart.printReceipt();
    }
}`,
  output: `Items: [SKU-100]
util.Date: Mon Sep 21 21:44:00 IST 2026
sql.Date : 2026-09-21`,
  explain: [
    'Cart lives in package com.shop.cart → path .../com/shop/cart/Cart.java.',
    'List/ArrayList come from java.util via imports.',
    'java.util.Date and java.sql.Date collide on simple name — use FQN for one of them.',
  ],
  mistakes: [
    'Creating packages that do not match folder structure → runtime ClassNotFound / IDE red ink.',
    'Believing import copies source into your file.',
    'Wildcard-importing everything and then fighting ambiguous names.',
  ],
  interviewAsk: 'Do import statements affect runtime performance?',
  interviewAnswer:
    'No meaningful runtime cost. Imports are resolved at compile time to FQNs in the bytecode’s constant pool. Loading cost depends on which classes you actually use, not how many import lines you wrote. Style and clarity matter more than micro-performance here.',
  interviewTraps: [
    'Saying unused imports slow the JVM at startup significantly.',
    'Claiming import loads the class immediately when the file is parsed.',
  ],
  quiz: {
    question: 'What does `import java.util.*;` import?',
    options: [
      'All types in java.util and all subpackages like java.util.concurrent',
      'Only top-level types in the java.util package',
      'All static methods in the JDK',
      'Nothing — wildcards are illegal',
    ],
    correctIndex: 1,
    explain: 'Star imports do not recurse into subpackages.',
  },
  practice:
    'Create package com.demo.util with a Helper class and com.demo.app with App that imports Helper. Compile from the source root using javac with correct directories and run with java com.demo.app.App.',
  practiceHints: [
    'javac com/demo/util/Helper.java com/demo/app/App.java from the root that contains com/.',
    'java com.demo.app.App — use the FQN of the main class.',
  ],
});
