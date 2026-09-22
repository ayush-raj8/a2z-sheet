import type { Difficulty, Lesson, LessonTable, Quiz } from '../lib/types';

type Draft = {
  id: string;
  title: string;
  section: string;
  chapter: string;
  difficulty?: Difficulty;
  importance?: 1 | 2 | 3;
  order?: number;
  prerequisites?: string[];
  summary: string;
  keywords?: string[];
  why: string;
  theory: string[];
  mentalModel?: string;
  tables?: LessonTable[];
  code?: string;
  codeTitle?: string;
  output?: string;
  explain?: string[];
  moreExamples?: Lesson['codeExamples'];
  mistakes?: string[];
  interviewAsk?: string;
  interviewAnswer?: string;
  interviewTraps?: string[];
  quiz?: Omit<Quiz, 'id'> | Omit<Quiz, 'id'>[];
  practice?: string;
  practiceHints?: string[];
  deepDive?: string[];
  mermaid?: string;
};

export function lesson(d: Draft): Lesson {
  const quizzes = (Array.isArray(d.quiz) ? d.quiz : d.quiz ? [d.quiz] : []).map((q, i) => ({
    ...q,
    id: `${d.id}-q${i + 1}`,
  }));

  const codeExamples =
    d.moreExamples ??
    (d.code
      ? [
          {
            title: d.codeTitle || 'Example',
            code: d.code,
            output: d.output,
            explain: d.explain,
          },
        ]
      : []);

  return {
    id: d.id,
    title: d.title,
    section: d.section,
    chapter: d.chapter,
    difficulty: d.difficulty || 'beginner',
    importance: d.importance || 2,
    order: d.order,
    prerequisites: d.prerequisites || [],
    summary: d.summary,
    keywords: d.keywords,
    why: d.why,
    theory: d.theory,
    mentalModel: d.mentalModel,
    tables: d.tables,
    codeExamples,
    mistakes: d.mistakes,
    interview:
      d.interviewAsk && d.interviewAnswer
        ? [
            {
              ask: d.interviewAsk,
              strongAnswer: d.interviewAnswer,
              traps: d.interviewTraps,
            },
          ]
        : undefined,
    quizzes,
    practice: d.practice
      ? { prompt: d.practice, hints: d.practiceHints }
      : undefined,
    deepDive: d.deepDive,
    mermaid: d.mermaid,
  };
}
