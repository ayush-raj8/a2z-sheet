import { useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildBackup, downloadBackup, parseBackup } from '../lib/backup';
import {
  companyIndex,
  companyProgressId,
  difficultyClass,
  loadCompany,
  type CompanyDetail,
  type CompanyProblem,
  type CompanyWindowId,
} from '../lib/companyLoader';
import { compareTopicsA2zOrder, pickCanonicalTopic, secondaryTopics } from '../lib/companyTopics';
import { initStore, persistTopic, replaceUserData } from '../lib/db';
import { DEFAULT_PALETTE } from '../lib/palettes';
import '../styles.css';

const WINDOW_TABS: Array<{ id: CompanyWindowId | 'all'; label: string }> = [
  { id: '30d', label: '30 days' },
  { id: '3m', label: '3 months' },
  { id: '6m', label: '6 months' },
  { id: '6m+', label: '>6 months' },
  { id: 'all', label: 'All' },
];

const DIFF_ORDER: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

function primaryTopic(p: CompanyProblem): string {
  return pickCanonicalTopic(p.topics);
}

function otherTags(p: CompanyProblem): string[] {
  return secondaryTopics(p.topics, primaryTopic(p));
}

function sortProblems(list: CompanyProblem[]): CompanyProblem[] {
  return [...list].sort((a, b) => {
    if (b.frequency !== a.frequency) return b.frequency - a.frequency;
    const da = DIFF_ORDER[a.difficulty] ?? 9;
    const db = DIFF_ORDER[b.difficulty] ?? 9;
    if (da !== db) return da - db;
    return a.title.localeCompare(b.title);
  });
}

type TopicGroup = { topic: string; problems: CompanyProblem[] };

function clubByTopic(problems: CompanyProblem[]): TopicGroup[] {
  const map = new Map<string, CompanyProblem[]>();
  for (const p of problems) {
    const t = primaryTopic(p);
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(p);
  }
  return [...map.entries()]
    .map(([topic, list]) => ({ topic, problems: sortProblems(list) }))
    .sort((a, b) => compareTopicsA2zOrder(a.topic, b.topic));
}

function TopicDistribution({
  groups,
  total,
  onJumpTopic,
}: {
  groups: TopicGroup[];
  total: number;
  onJumpTopic: (topic: string) => void;
}) {
  if (!groups.length || total === 0) return null;
  const maxCount = Math.max(...groups.map((g) => g.problems.length));
  const top = [...groups].sort((a, b) => b.problems.length - a.problems.length).slice(0, 5);

  const diffCounts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const g of groups) {
    for (const p of g.problems) {
      const d = (p.difficulty || '').toUpperCase();
      if (d === 'EASY' || d === 'MEDIUM' || d === 'HARD') diffCounts[d] += 1;
    }
  }

  return (
    <section className="company-distribution" aria-label="Topic distribution">
      <h2>Topic distribution</h2>
      <p className="company-distribution-blurb">
        Each problem counts once. DP / Graph / Tree / BST / Binary Search / Recursion
        own the problem even when LC also tags Array — Array here is the residual only.
        Focus teaching on: <strong>{top.map((t) => t.topic).join(' · ')}</strong>
        {top[0] ? (
          <>
            {' '}
            ({top[0].topic} is {Math.round((top[0].problems.length / total) * 100)}%).
          </>
        ) : null}
      </p>

      <div className="company-diff-dist">
        {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => {
          const n = diffCounts[d];
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <div key={d} className={`company-diff-pill diff-${d.toLowerCase()}`}>
              <span>{d}</span>
              <strong>
                {n} · {pct}%
              </strong>
            </div>
          );
        })}
      </div>

      <ul className="company-dist-bars">
        {groups.map((g) => {
          const pct = total ? (g.problems.length / total) * 100 : 0;
          const width = maxCount ? (g.problems.length / maxCount) * 100 : 0;
          return (
            <li key={g.topic}>
              <button
                type="button"
                className="company-dist-row"
                onClick={() => onJumpTopic(g.topic)}
                title={`Filter to ${g.topic}`}
              >
                <span className="company-dist-label">{g.topic}</span>
                <span className="company-dist-track" aria-hidden="true">
                  <span className="company-dist-fill" style={{ width: `${width}%` }} />
                </span>
                <span className="company-dist-meta">
                  {g.problems.length}
                  <span className="company-dist-pct">{pct >= 1 ? `${Math.round(pct)}%` : '<1%'}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ProblemTable({
  problems,
  progress,
  onToggle,
}: {
  problems: CompanyProblem[];
  progress: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="table-container company-table">
      <table>
        <thead>
          <tr>
            <th>Problem</th>
            <th>Diff</th>
            <th>Freq</th>
            <th>Also tagged</th>
            <th>LC</th>
            <th>A2Z</th>
            <th>Done</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((p) => {
            const extra = otherTags(p);
            const id = companyProgressId(p);
            const completed = Boolean(progress[id]);
            const rowClass = [difficultyClass(p.difficulty), completed ? 'completed' : '']
              .filter(Boolean)
              .join(' ');
            return (
              <tr key={p.lcSlug} className={rowClass}>
                <td className="topic-cell">
                  <div className="topic-title">{p.title}</div>
                </td>
                <td>{p.difficulty}</td>
                <td>{p.frequency.toFixed(1)}</td>
                <td className="company-topics-cell" title={extra.join(', ')}>
                  {extra.length ? extra.slice(0, 3).join(', ') + (extra.length > 3 ? '…' : '') : '—'}
                </td>
                <td className="link-cell">
                  <a href={p.lcUrl} target="_blank" rel="noopener noreferrer">
                    LC
                  </a>
                </td>
                <td className="link-cell">
                  {p.a2zIds[0] ? (
                    <Link to={`/dsa/blog/${p.a2zIds[0]}`} title="Open A2Z blog">
                      Blog
                    </Link>
                  ) : (
                    <span className="na-cell">—</span>
                  )}
                </td>
                <td className="status-cell" onClick={() => onToggle(id)}>
                  <input
                    type="checkbox"
                    className="status-checkbox"
                    checked={completed}
                    readOnly
                    aria-label={`Mark ${p.title} as done`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CompanyDetailPage() {
  const { companySlug = '' } = useParams();
  const [data, setData] = useState<CompanyDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [windowId, setWindowId] = useState<CompanyWindowId | 'all'>('3m');
  const [diff, setDiff] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [q, setQ] = useState('');
  const [a2zOnly, setA2zOnly] = useState(false);
  const [topicFilter, setTopicFilter] = useState('');
  const [openTopics, setOpenTopics] = useState<Set<string>>(() => new Set());
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [usingIndexedDb, setUsingIndexedDb] = useState(true);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    initStore()
      .then((store) => {
        if (cancelled) return;
        setProgress(store.progress);
        setUsingIndexedDb(store.usingIndexedDb);
      })
      .catch(() => {
        /* sheet still usable without persist */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setTopicFilter('');
    setOpenTopics(new Set());
    loadCompany(companySlug)
      .then((c) => {
        if (cancelled) return;
        if (!c) setStatus('error');
        else {
          setData(c);
          setStatus('ready');
          if ((c.counts['3m'] || 0) > 0) setWindowId('3m');
          else setWindowId('all');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [companySlug]);

  useEffect(() => {
    if (!message) return undefined;
    const t = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(t);
  }, [message]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.problems.filter((p) => {
      if (windowId !== 'all' && !p.windows.includes(windowId)) return false;
      if (diff !== 'ALL' && p.difficulty !== diff) return false;
      if (a2zOnly && !p.a2zIds.length) return false;
      if (q.trim()) {
        const n = q.trim().toLowerCase();
        if (
          !p.title.toLowerCase().includes(n) &&
          !p.lcSlug.includes(n) &&
          !(p.topics || []).some((t) => t.toLowerCase().includes(n))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [data, windowId, diff, q, a2zOnly]);

  const groups = useMemo(() => clubByTopic(filtered), [filtered]);

  const visibleGroups = useMemo(() => {
    if (!topicFilter) return groups;
    return groups.filter((g) => g.topic === topicFilter);
  }, [groups, topicFilter]);

  useEffect(() => {
    setOpenTopics(new Set(visibleGroups.map((g) => g.topic)));
  }, [visibleGroups]);

  const overallStats = useMemo(() => {
    const ids = filtered.map(companyProgressId);
    const unique = [...new Set(ids)];
    const completed = unique.filter((id) => progress[id]).length;
    return { completed, total: unique.length };
  }, [filtered, progress]);

  const meta = companyIndex.companies.find((c) => c.slug === companySlug);

  function toggleTopic(topic: string) {
    setOpenTopics((cur) => {
      const next = new Set(cur);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function expandAllTopics() {
    setOpenTopics(new Set(visibleGroups.map((g) => g.topic)));
  }

  function collapseAllTopics() {
    setOpenTopics(new Set());
  }

  function toggleDone(id: string) {
    const nextValue = !progress[id];
    const nextProgress = { ...progress };
    if (nextValue) nextProgress[id] = true;
    else delete nextProgress[id];
    setProgress(nextProgress);
    persistTopic(id, nextValue, usingIndexedDb, {
      progress: nextProgress,
      notes: {},
      palette: DEFAULT_PALETTE,
    });
  }

  function exportProgress() {
    downloadBackup(buildBackup({ progress, notes: {} }));
    setMessage('Backup downloaded (includes A2Z + company progress).');
  }

  function importProgress() {
    fileRef.current?.click();
  }

  async function onImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = parseBackup(await file.text());
      const confirmed = window.confirm(
        'Replace all progress saved in this browser (A2Z + company)? Notes on A2Z are kept unless the backup includes notes.',
      );
      if (!confirmed) return;
      // Keep existing notes from store — re-init notes from current if backup empty
      const store = await initStore();
      const nextProgress = parsed.progress as Record<string, boolean>;
      const notes = (Object.keys(parsed.notes).length ? parsed.notes : store.notes) as Record<
        string,
        string
      >;
      await replaceUserData(
        { progress: nextProgress, notes },
        usingIndexedDb,
        { progress: nextProgress, notes, palette: store.palette },
      );
      setProgress(nextProgress);
      setMessage(`Imported ${Object.keys(nextProgress).length} completed items.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not import that file.');
    }
  }

  if (status === 'loading') {
    return (
      <div className="app">
        <p className="page-status">Loading company…</p>
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <div className="app">
        <header className="topbar">
          <div className="topbar-copy">
            <Link to="/dsa/companies" className="home-link">
              ← Companies
            </Link>
            <h1>Company not found</h1>
          </div>
        </header>
      </div>
    );
  }

  const allOpen =
    visibleGroups.length > 0 && visibleGroups.every((g) => openTopics.has(g.topic));
  const pct =
    overallStats.total > 0 ? Math.round((overallStats.completed / overallStats.total) * 100) : 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/dsa/companies" className="home-link">
            ← Companies
          </Link>
          <h1>{data.name}</h1>
          <p className="storage-note">
            Progress saved in this browser (same store as A2Z · import/export) ·
            grouped by strongest topic (DP/Graph/Tree beat Array)
            {meta?.a2zOverlap ? ` · ${meta.a2zOverlap} overlap A2Z` : ''}
          </p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="ghost-btn" onClick={exportProgress}>
            Export
          </button>
          <button type="button" className="ghost-btn" onClick={importProgress}>
            Import
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={allOpen ? collapseAllTopics : expandAllTopics}
          >
            {allOpen ? 'Collapse topics' : 'Expand topics'}
          </button>
          <Link to="/dsa" className="ghost-btn">
            A2Z Roadmap
          </Link>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onImportFile}
          />
        </div>
      </header>

      <section className="overview" aria-label="Company progress">
        <div className="overview-top">
          <span>Filtered progress</span>
          <span className="overview-count">
            {overallStats.completed}/{overallStats.total} · {pct}%
          </span>
        </div>
        <div className="overview-bar" aria-hidden="true">
          <div className="overview-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {message ? <p className="status-message">{message}</p> : null}
      </section>

      <section className="company-toolbar company-toolbar-wrap">
        <div className="company-window-tabs" role="tablist" aria-label="Time window">
          {WINDOW_TABS.map((tab) => {
            const count =
              tab.id === 'all' ? data.problems.length : data.counts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={windowId === tab.id}
                className={`company-window-tab${windowId === tab.id ? ' active' : ''}`}
                onClick={() => setWindowId(tab.id)}
              >
                {tab.label}
                <span className="company-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
        <input
          type="search"
          className="company-search"
          placeholder="Search title or topic…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="company-diff-select"
          value={diff}
          onChange={(e) => setDiff(e.target.value as typeof diff)}
          aria-label="Difficulty"
        >
          <option value="ALL">All difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          className="company-diff-select"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          aria-label="Topic"
        >
          <option value="">All topics ({groups.length})</option>
          {groups.map((g) => (
            <option key={g.topic} value={g.topic}>
              {g.topic} ({g.problems.length})
            </option>
          ))}
        </select>
        <label className="company-a2z-toggle">
          <input
            type="checkbox"
            checked={a2zOnly}
            onChange={(e) => setA2zOnly(e.target.checked)}
          />
          On A2Z only
        </label>
        <span className="company-result-count">
          {filtered.length} problems · {visibleGroups.length} topics
        </span>
      </section>

      <main className="company-topic-groups">
        {visibleGroups.length === 0 ? (
          <p className="page-status">No problems match these filters.</p>
        ) : (
          visibleGroups.map((g) => {
            const open = openTopics.has(g.topic);
            const done = g.problems.filter((p) => progress[companyProgressId(p)]).length;
            return (
              <section key={g.topic} className="company-topic-section" id={`topic-${encodeURIComponent(g.topic)}`}>
                <button
                  type="button"
                  className={`sub-collapsible company-topic-header${open ? ' active' : ''}${
                    done === g.problems.length && g.problems.length > 0 ? ' completed' : ''
                  }`}
                  style={{
                    '--progress-width': `${
                      g.problems.length ? (done / g.problems.length) * 100 : 0
                    }%`,
                  } as CSSProperties}
                  onClick={() => toggleTopic(g.topic)}
                  aria-expanded={open}
                >
                  <span className="collapsible-title">{g.topic}</span>
                  <span className="collapsible-meta">
                    <span className="progress-counter">
                      {done}/{g.problems.length}
                    </span>
                    <span className="collapsible-icon" aria-hidden="true">
                      {open ? '–' : '+'}
                    </span>
                  </span>
                </button>
                {open ? (
                  <div className="content-inner">
                    <ProblemTable problems={g.problems} progress={progress} onToggle={toggleDone} />
                  </div>
                ) : null}
              </section>
            );
          })
        )}
      </main>

      <TopicDistribution
        groups={groups}
        total={filtered.length}
        onJumpTopic={(topic) => {
          setTopicFilter(topic);
          window.requestAnimationFrame(() => {
            document
              .getElementById(`topic-${encodeURIComponent(topic)}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }}
      />
    </div>
  );
}
