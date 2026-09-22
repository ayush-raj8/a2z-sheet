import { Link } from 'react-router-dom';
import type { Difficulty } from '../lib/types';

const diffLabel: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const diffColor: Record<Difficulty, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-rose-400',
};

type Props = {
  title: string;
  difficulty: Difficulty;
  importance: 1 | 2 | 3;
  completed: boolean;
  bookmarked: boolean;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
};

export default function LessonHeader({
  title,
  difficulty,
  importance,
  completed,
  bookmarked,
  onToggleComplete,
  onToggleBookmark,
}: Props) {
  return (
    <div className="mb-6 border-b border-zinc-800 pb-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <Link to="/lld" className="hover:text-zinc-300">
          Dashboard
        </Link>
        <span>/</span>
        <span>Lesson</span>
      </div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            <span className={diffColor[difficulty]}>{diffLabel[difficulty]}</span>
            <span className="mx-2 text-zinc-700">·</span>
            Interview importance:{' '}
            <span className="text-zinc-200">{'●'.repeat(importance)}{'○'.repeat(3 - importance)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleBookmark}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-500"
          >
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button
            type="button"
            onClick={onToggleComplete}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-500"
          >
            {completed ? 'Completed' : 'Mark done'}
          </button>
        </div>
      </div>
    </div>
  );
}
