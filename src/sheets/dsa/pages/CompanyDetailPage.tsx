import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  companyIndex,
  difficultyClass,
  loadCompany,
  type CompanyDetail,
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

export default function CompanyDetailPage() {
  const { companySlug = '' } = useParams();
  const [data, setData] = useState<CompanyDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [windowId, setWindowId] = useState<CompanyWindowId | 'all'>('3m');
  const [diff, setDiff] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [q, setQ] = useState('');
  const [a2zOnly, setA2zOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    loadCompany(companySlug)
      .then((c) => {
        if (cancelled) return;
        if (!c) setStatus('error');
        else {
          setData(c);
          setStatus('ready');
          // Prefer 3m if it has problems, else all
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
        if (!p.title.toLowerCase().includes(n) && !p.lcSlug.includes(n)) return false;
      }
      return true;
    });
  }, [data, windowId, diff, q, a2zOnly]);

  const meta = companyIndex.companies.find((c) => c.slug === companySlug);

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

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/dsa/companies" className="home-link">
            ← Companies
          </Link>
          <h1>{data.name}</h1>
          <p className="storage-note">
            {data.problems.length} problems
            {meta?.a2zOverlap ? ` · ${meta.a2zOverlap} also on A2Z roadmap` : ''}
          </p>
        </div>
        <div className="topbar-actions">
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
          placeholder="Search title…"
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
        <label className="company-a2z-toggle">
          <input
            type="checkbox"
            checked={a2zOnly}
            onChange={(e) => setA2zOnly(e.target.checked)}
          />
          On A2Z only
        </label>
        <span className="company-result-count">{filtered.length} shown</span>
      </section>

      <div className="table-container company-table">
        <table>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Diff</th>
              <th>Freq</th>
              <th>Topics</th>
              <th>LC</th>
              <th>A2Z</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.lcSlug} className={difficultyClass(p.difficulty)}>
                <td className="topic-cell">
                  <div className="topic-title">{p.title}</div>
                </td>
                <td>{p.difficulty}</td>
                <td>{p.frequency.toFixed(1)}</td>
                <td className="company-topics-cell" title={p.topics.join(', ')}>
                  {p.topics.slice(0, 3).join(', ')}
                  {p.topics.length > 3 ? '…' : ''}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
