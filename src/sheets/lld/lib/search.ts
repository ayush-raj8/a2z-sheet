import type { LessonMeta } from './types';

export function searchLessons(toc: LessonMeta[], query: string): LessonMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  return toc
    .map((lesson) => {
      const hay = [
        lesson.title,
        lesson.summary,
        lesson.section,
        lesson.chapter,
        ...(lesson.keywords || []),
        ...lesson.prerequisites,
      ]
        .join(' ')
        .toLowerCase();
      const score = terms.reduce((acc, term) => (hay.includes(term) ? acc + 1 : acc), 0);
      return { lesson, score };
    })
    .filter((row) => row.score === terms.length)
    .sort((a, b) => b.score - a.score || a.lesson.title.localeCompare(b.lesson.title))
    .map((row) => row.lesson);
}
