export type BlogLang = 'python' | 'cpp' | 'java' | 'go';

export type ComplexityFlag = 'TLE' | 'MLE' | 'RE' | 'WA';

export type ApproachBlock = {
  title: string;
  idea: string;
  algorithm?: string[];
  /** Primary interview language — Python by default */
  code?: string;
  language?: BlogLang;
  time: string;
  space: string;
  /** Clarify aux vs input / recursion stack when relevant */
  spaceNote?: string;
  limitations?: string[];
  whyWorks?: string;
  dryRun?: string;
  /** When this approach typically fails under contest/interview constraints */
  flags?: ComplexityFlag[];
};

export type SpecialTechnique = {
  title: string;
  body: string;
};

export type RelatedTopic = {
  id: string;
  title: string;
};

/**
 * v2 interview-oriented blog.
 * Older scaffold blogs may only fill a subset of fields; the UI renders what exists.
 */
export type DsaBlog = {
  version?: 1 | 2;
  id: string;
  title: string;
  topicNumber?: number;
  stepTitle: string;
  subStepTitle: string;
  category?: string;
  subcategory?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topicType?:
    | 'concept'
    | 'coding-problem'
    | 'algorithm'
    | 'data-structure'
    | 'pattern'
    | 'math'
    | 'interview-problem';
  tags?: string[];
  pattern?: string;
  sourceUrl?: string | null;
  quality?: 'scaffold' | 'reviewed';

  /** Problem / overview */
  problemStatement?: string;
  example?: string;
  intro?: string;
  intuition: string;

  approaches?: ApproachBlock[];

  specialTechnique?: SpecialTechnique;
  whyWorks?: string;

  complexity?: {
    time: string;
    space: string;
    auxSpace?: string;
    recursionStack?: string;
  };

  edgeCases?: string[];
  commonMistakes?: string[];
  /** @deprecated use commonMistakes */
  pitfalls?: string[];
  patternRecognition?: string[];
  followUps?: string[];
  interviewInsight?: string;
  related?: RelatedTopic[];

  /** v1 multi-language scaffold (still rendered if present) */
  approach?: string[];
  languages?: Partial<
    Record<
      BlogLang,
      {
        code: string;
        notes?: string;
      }
    >
  >;
};

export const BLOG_LANG_LABELS: Record<BlogLang, string> = {
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
  go: 'Go',
};

export const BLOG_LANG_ORDER: BlogLang[] = ['python', 'cpp', 'java', 'go'];
