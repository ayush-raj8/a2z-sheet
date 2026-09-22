import { Link } from 'react-router-dom';
import { orderedToc } from '../content';

type Props = { bookmarks: string[] };

export default function BookmarksPage({ bookmarks }: Props) {
  const items = orderedToc.filter((l) => bookmarks.includes(l.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Bookmarks</h1>
      <p className="mt-2 text-zinc-400">Lessons you marked for later review.</p>
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">No bookmarks yet.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map((lesson) => (
            <li key={lesson.id}>
              <Link
                to={`/lld/lesson/${lesson.id}`}
                className="block rounded-lg border border-zinc-800 px-3 py-2 hover:border-zinc-600"
              >
                <span className="text-sm text-zinc-100">{lesson.title}</span>
                <span className="mt-1 block text-xs text-zinc-500">
                  {lesson.section} · {lesson.chapter}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
