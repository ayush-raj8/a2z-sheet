import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  companyIndex,
  difficultyClass,
  loadCompany,
  type CompanyDetail,
  type CompanyProblem,
  type CompanyWindowId,
} from '../lib/companyLoader';
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
  return p.topics?.[0]?.trim() || 'Untagged';
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
    .sort((a, b) => b.problems.length - a.problems.length || a.topic.localeCompare(b.topic));
}

function ProblemTable({ problems }: { problems: CompanyProblem[] }) {
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
          </tr>
        </thead>
        <tbody>
          {problems.map((p) => {
            const extra = (p.topics || []).slice(1);
            return (
              <tr key={p.lcSlug} className={difficultyClass(p.difficulty)}>
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

  // Open all topic sections when filters change (so results aren't hidden)
  useEffect(() => {
    setOpenTopics(new Set(visibleGroups.map((g) => g.topic)));
  }, [visibleGroups]);

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

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/dsa/companies" className="home-link">
            ← Companies
          </Link>
          <h1>{data.name}</h1>
          <p className="storage-note">
            {data.problems.length} problems · grouped by primary LC topic
            {meta?.a2zOverlap ? ` · ${meta.a2zOverlap} on A2Z` : ''}
          </p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="ghost-btn" onClick={allOpen ? collapseAllTopics : expandAllTopics}>
            {allOpen ? 'Collapse topics' : 'Expand topics'}
          </button>
          <Link to="/dsa" className="ghost-btn">
            A2Z Roadmap
          </Link>
        </div>
      </header>

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
            return (
              <section key={g.topic} className="company-topic-section">
                <button
                  type="button"
                  className={`sub-collapsible company-topic-header${open ? ' active' : ''}`}
                  onClick={() => toggleTopic(g.topic)}
                  aria-expanded={open}
                >
                  <span className="collapsible-title">{g.topic}</span>
                  <span className="collapsible-meta">
                    <span className="progress-counter">{g.problems.length}</span>
                    <span className="collapsible-icon" aria-hidden="true">
                      {open ? '–' : '+'}
                    </span>
                  </span>
                </button>
                {open ? (
                  <div className="content-inner">
                    <ProblemTable problems={g.problems} />
                  </div>
                ) : null}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
