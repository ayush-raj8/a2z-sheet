import type { Lesson, LessonMeta, SectionId } from '../lib/types';
import { CHAPTER_ORDER } from '../lib/types';

const modules = import.meta.glob('./*/*.ts', { eager: true }) as Record<
  string,
  { default: Lesson }
>;

function isLesson(value: unknown): value is Lesson {
  return Boolean(value && typeof value === 'object' && 'id' in (value as object) && 'title' in (value as object));
}

const lessons: Lesson[] = Object.entries(modules)
  .filter(([path]) => !path.includes('lessonFactory'))
  .map(([, mod]) => mod.default)
  .filter(isLesson);

const byId = new Map(lessons.map((l) => [l.id, l]));

export const CURRICULUM_ORDER: SectionId[] = [
  'java',
  'oop',
  'uml',
  'solid',
  'principles',
  'patterns',
  'lld',
  'traps',
  'sde34',
];

export const toc: LessonMeta[] = lessons.map((l) => ({
  id: l.id,
  title: l.title,
  section: l.section,
  chapter: l.chapter,
  difficulty: l.difficulty,
  importance: l.importance,
  order: l.order,
  prerequisites: l.prerequisites,
  summary: l.summary,
  keywords: l.keywords,
}));

function chapterIndex(section: string, chapter: string): number {
  const order = CHAPTER_ORDER[section as SectionId];
  if (!order) return -1;
  const idx = order.indexOf(chapter);
  return idx >= 0 ? idx : order.length;
}

/** Stable reading order: section → chapter → lesson order → title */
export const orderedToc: LessonMeta[] = [...toc].sort((a, b) => {
  const si = CURRICULUM_ORDER.indexOf(a.section as SectionId);
  const sj = CURRICULUM_ORDER.indexOf(b.section as SectionId);
  if (si !== sj) return si - sj;
  if (a.chapter !== b.chapter) {
    const ca = chapterIndex(a.section, a.chapter);
    const cb = chapterIndex(b.section, b.chapter);
    if (ca !== cb) return ca - cb;
    return a.chapter.localeCompare(b.chapter);
  }
  const oa = a.order ?? 999;
  const ob = b.order ?? 999;
  if (oa !== ob) return oa - ob;
  return a.title.localeCompare(b.title);
});

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id);
}

export function getAdjacent(id: string): {
  prev: LessonMeta | null;
  next: LessonMeta | null;
} {
  const idx = orderedToc.findIndex((l) => l.id === id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? orderedToc[idx - 1] : null,
    next: idx < orderedToc.length - 1 ? orderedToc[idx + 1] : null,
  };
}

export function lessonsBySection(section: string): LessonMeta[] {
  return orderedToc.filter((l) => l.section === section);
}

export function groupBySectionChapter(): {
  section: string;
  chapters: { chapter: string; lessons: LessonMeta[] }[];
}[] {
  return CURRICULUM_ORDER.map((section) => {
    const sectionLessons = lessonsBySection(section);
    const chapterMap = new Map<string, LessonMeta[]>();
    for (const lesson of sectionLessons) {
      const list = chapterMap.get(lesson.chapter) || [];
      list.push(lesson);
      chapterMap.set(lesson.chapter, list);
    }
    return {
      section,
      chapters: [...chapterMap.entries()].map(([chapter, lessons]) => ({ chapter, lessons })),
    };
  }).filter((block) => block.chapters.length > 0);
}

export function allLessonIds(): string[] {
  return orderedToc.map((l) => l.id);
}
