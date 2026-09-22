import { Link } from 'react-router-dom';
import { CURRICULUM_ORDER, lessonsBySection, orderedToc } from '../content';
import { sectionProgress } from '../lib/progress';
import { SECTION_LABELS, type SectionId } from '../lib/types';

type Props = {
  completed: string[];
  lastLesson: string | null;
};

function bar(percent: number) {
  const filled = Math.round(percent / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

export default function Dashboard({ completed, lastLesson }: Props) {
  const overall = sectionProgress(
    orderedToc.map((l) => l.id),
    completed
  );
  const continueLesson = lastLesson
    ? orderedToc.find((l) => l.id === lastLesson)
    : orderedToc[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Learning dashboard</h1>
      <p className="mt-2 text-zinc-400">
        Short theory → code → output → interview lens → practice. Progress stays in this browser.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Overall</span>
          <span className="font-mono text-zinc-200">
            {overall.done}/{overall.total} · {overall.percent}%
          </span>
        </div>
        <p className="mt-2 font-mono text-sm tracking-widest text-emerald-400/90">
          {bar(overall.percent)}
        </p>
        {continueLesson ? (
          <Link
            to={`/lld/lesson/${continueLesson.id}`}
            className="mt-4 inline-flex rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-500"
          >
            Continue: {continueLesson.title} →
          </Link>
        ) : null}
      </div>

      <div className="mt-8 space-y-3">
        {CURRICULUM_ORDER.map((section) => {
          const ids = lessonsBySection(section).map((l) => l.id);
          if (!ids.length) return null;
          const stats = sectionProgress(ids, completed);
          return (
            <div
              key={section}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2.5"
            >
              <span className="w-36 text-sm font-medium text-zinc-200">
                {SECTION_LABELS[section as SectionId]}
              </span>
              <span className="flex-1 font-mono text-xs tracking-widest text-zinc-500 sm:text-sm">
                {bar(stats.percent)}
              </span>
              <span className="w-14 text-right font-mono text-sm text-zinc-400">
                {stats.percent}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">Start here</h2>
        <ul className="mt-3 space-y-2">
          {orderedToc.slice(0, 5).map((lesson) => (
            <li key={lesson.id}>
              <Link
                to={`/lld/lesson/${lesson.id}`}
                className="text-sm text-zinc-300 hover:text-white"
              >
                {lesson.title}
                <span className="ml-2 text-zinc-600">{lesson.difficulty}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
