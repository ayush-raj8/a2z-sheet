import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SECTION_LABELS, type SectionId } from '../lib/types';
import { groupBySectionChapter } from '../content';

type Props = {
  completed: Set<string>;
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ completed, open, onClose }: Props) {
  const tree = useMemo(() => groupBySectionChapter(), []);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-zinc-800 px-4 py-3">
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Sheets
          </Link>
          <h1 className="mt-1 text-sm font-semibold tracking-tight text-zinc-100">
            Java → OOP → LLD
          </h1>
          <div className="mt-3 flex gap-2 text-xs">
            <NavLink
              to="/lld"
              end
              className={({ isActive }) =>
                isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }
            >
              Dashboard
            </NavLink>
            <span className="text-zinc-700">·</span>
            <NavLink
              to="/lld/bookmarks"
              className={({ isActive }) =>
                isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }
            >
              Bookmarks
            </NavLink>
            <span className="text-zinc-700">·</span>
            <NavLink
              to="/lld/search"
              className={({ isActive }) =>
                isActive ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }
            >
              Search
            </NavLink>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 text-sm">
          {tree.map(({ section, chapters }) => {
            const sectionKey = `s-${section}`;
            const sectionClosed = collapsed[sectionKey];
            return (
              <div key={section} className="mb-3">
                <button
                  type="button"
                  onClick={() => toggle(sectionKey)}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left font-medium text-zinc-200 hover:bg-zinc-900"
                >
                  <span>{SECTION_LABELS[section as SectionId] || section}</span>
                  <span className="text-zinc-600">{sectionClosed ? '+' : '–'}</span>
                </button>
                {!sectionClosed
                  ? chapters.map(({ chapter, lessons }) => {
                      const chapterKey = `c-${section}-${chapter}`;
                      const chapterClosed = collapsed[chapterKey];
                      return (
                        <div key={chapterKey} className="ml-1 mt-1">
                          <button
                            type="button"
                            onClick={() => toggle(chapterKey)}
                            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs uppercase tracking-wide text-zinc-500 hover:text-zinc-300"
                          >
                            <span className="truncate">{chapter}</span>
                            <span>{chapterClosed ? '+' : '–'}</span>
                          </button>
                          {!chapterClosed ? (
                            <ul className="mt-1 space-y-0.5">
                              {lessons.map((lesson) => {
                                const done = completed.has(lesson.id);
                                return (
                                  <li key={lesson.id}>
                                    <NavLink
                                      to={`/lld/lesson/${lesson.id}`}
                                      onClick={onClose}
                                      className={({ isActive }) =>
                                        `flex items-start gap-2 rounded px-2 py-1.5 text-[13px] leading-snug ${
                                          isActive
                                            ? 'bg-zinc-900 text-zinc-50'
                                            : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                                        }`
                                      }
                                    >
                                      <span
                                        className={`mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                                          done ? 'bg-emerald-400' : 'bg-zinc-700'
                                        }`}
                                      />
                                      <span>{lesson.title}</span>
                                    </NavLink>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </div>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
