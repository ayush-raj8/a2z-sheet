import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toc } from '../content';
import { searchLessons } from '../lib/search';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchLessons(toc, query), [query]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Search</h1>
      <p className="mt-2 text-zinc-400">Search lessons, concepts, and keywords.</p>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. inner class, HashMap, SOLID…"
        className="mt-6 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        autoFocus
      />
      <ul className="mt-6 space-y-2">
        {results.map((lesson) => (
          <li key={lesson.id}>
            <Link
              to={`/lld/lesson/${lesson.id}`}
              className="block rounded-lg border border-zinc-800 px-3 py-2 hover:border-zinc-600"
            >
              <span className="text-sm text-zinc-100">{lesson.title}</span>
              <span className="mt-1 block text-xs text-zinc-500">{lesson.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      {query && results.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No matches.</p>
      ) : null}
    </div>
  );
}
