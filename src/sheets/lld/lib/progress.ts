const PROGRESS_KEY = 'lld.progress';
const BOOKMARKS_KEY = 'lld.bookmarks';
const QUIZ_KEY = 'lld.quiz';
const LAST_KEY = 'lld.lastLesson';

export type ProgressState = {
  completed: string[];
};

export type QuizAnswers = Record<string, number>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProgress(): ProgressState {
  const data = readJson<ProgressState>(PROGRESS_KEY, { completed: [] });
  return { completed: Array.isArray(data.completed) ? data.completed : [] };
}

export function saveProgress(state: ProgressState) {
  writeJson(PROGRESS_KEY, state);
}

export function toggleCompleted(id: string): ProgressState {
  const current = loadProgress();
  const set = new Set(current.completed);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const next = { completed: [...set] };
  saveProgress(next);
  return next;
}

export function markCompleted(id: string): ProgressState {
  const current = loadProgress();
  if (current.completed.includes(id)) return current;
  const next = { completed: [...current.completed, id] };
  saveProgress(next);
  return next;
}

export function loadBookmarks(): string[] {
  return readJson<string[]>(BOOKMARKS_KEY, []);
}

export function toggleBookmark(id: string): string[] {
  const set = new Set(loadBookmarks());
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const next = [...set];
  writeJson(BOOKMARKS_KEY, next);
  return next;
}

export function loadQuizAnswers(): QuizAnswers {
  return readJson<QuizAnswers>(QUIZ_KEY, {});
}

export function saveQuizAnswer(quizId: string, optionIndex: number): QuizAnswers {
  const next = { ...loadQuizAnswers(), [quizId]: optionIndex };
  writeJson(QUIZ_KEY, next);
  return next;
}

export function loadLastLesson(): string | null {
  return localStorage.getItem(LAST_KEY);
}

export function saveLastLesson(id: string) {
  localStorage.setItem(LAST_KEY, id);
}

export function sectionProgress(
  lessonIds: string[],
  completed: string[]
): { done: number; total: number; percent: number } {
  const total = lessonIds.length;
  const done = lessonIds.filter((id) => completed.includes(id)).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
