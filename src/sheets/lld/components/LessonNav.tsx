import { Link } from 'react-router-dom';

type Props = {
  prev?: { id: string; title: string } | null;
  next?: { id: string; title: string } | null;
};

export default function LessonNav({ prev, next }: Props) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
      {prev ? (
        <Link to={`/lld/lesson/${prev.id}`} className="text-sm text-zinc-400 hover:text-zinc-200">
          ← {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/lld/lesson/${next.id}`} className="text-sm text-zinc-400 hover:text-zinc-200">
          {next.title} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
