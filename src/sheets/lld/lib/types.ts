export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type CodeExample = {
  title: string;
  code: string;
  output?: string;
  explain?: string[];
};

export type InterviewQuestion = {
  ask: string;
  strongAnswer: string;
  traps?: string[];
};

export type Quiz = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explain: string;
};

export type Exercise = {
  prompt: string;
  hints?: string[];
};

export type LessonMeta = {
  id: string;
  title: string;
  section: string;
  chapter: string;
  difficulty: Difficulty;
  importance: 1 | 2 | 3;
  /** Optional sort key within a chapter (lower first). */
  order?: number;
  prerequisites: string[];
  summary: string;
  keywords?: string[];
};

export type Lesson = LessonMeta & {
  why: string;
  theory: string[];
  mentalModel?: string;
  codeExamples: CodeExample[];
  mistakes?: string[];
  interview?: InterviewQuestion[];
  quizzes: Quiz[];
  practice?: Exercise;
  deepDive?: string[];
  mermaid?: string;
};

export type SectionId =
  | 'java'
  | 'oop'
  | 'uml'
  | 'solid'
  | 'principles'
  | 'patterns'
  | 'lld'
  | 'traps'
  | 'sde34';

export const SECTION_LABELS: Record<SectionId, string> = {
  java: 'Java',
  oop: 'OOPs',
  uml: 'UML',
  solid: 'SOLID',
  principles: 'Design Principles',
  patterns: 'Design Patterns',
  lld: 'LLD',
  traps: 'Interview Traps',
  sde34: 'SDE-3/4',
};

/** Preferred chapter order within a section (fallback: alphabetical). */
export const CHAPTER_ORDER: Partial<Record<SectionId, string[]>> = {
  oop: [
    'Foundations',
    'Encapsulation',
    'Inheritance',
    'Polymorphism',
    'Abstraction',
    'Relationships',
    'Design Quality',
  ],
};
