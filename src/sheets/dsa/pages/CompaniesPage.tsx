import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyIndex } from '../lib/companyLoader';
import '../styles.css';

export default function CompaniesPage() {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'problems' | 'name' | 'a2z'>('problems');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = companyIndex.companies;
    if (needle) {
      list = list.filter(
        (c) => c.name.toLowerCase().includes(needle) || c.slug.includes(needle),
      );
    }
    const sorted = [...list];
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'a2z') sorted.sort((a, b) => b.a2zOverlap - a.a2zOverlap || b.problemCount - a.problemCount);
    else sorted.sort((a, b) => b.problemCount - a.problemCount || a.name.localeCompare(b.name));
    return sorted;
  }, [q, sort]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/" className="home-link">
            ← Sheets
          </Link>
          <h1>Company-wise DSA</h1>
          <p className="storage-note">
            {companyIndex.companyCount} companies · {companyIndex.problemRows.toLocaleString()}{' '}
            problem entries · mapped to A2Z via LeetCode links
          </p>
        </div>
        <div className="topbar-actions">
          <Link to="/dsa" className="ghost-btn">
            A2Z Roadmap
          </Link>
        </div>
      </header>

      <section className="company-toolbar">
        <input
          type="search"
          className="company-search"
          placeholder="Search company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search companies"
        />
        <label className="company-sort">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="problems">Most problems</option>
            <option value="a2z">A2Z overlap</option>
            <option value="name">Name</option>
          </select>
        </label>
        <span className="company-result-count">{filtered.length} shown</span>
      </section>

      <main className="company-grid">
        {filtered.map((c) => (
          <Link key={c.slug} to={`/dsa/companies/${c.slug}`} className="company-card">
            <h2>{c.name}</h2>
            <p>
              <strong>{c.problemCount}</strong> problems
              {c.a2zOverlap > 0 ? (
                <>
                  {' · '}
                  <span className="company-a2z-badge">{c.a2zOverlap} on A2Z</span>
                </>
              ) : null}
            </p>
            <p className="company-windows">
              30d {c.counts['30d'] || 0} · 3m {c.counts['3m'] || 0} · 6m {c.counts['6m'] || 0} · all{' '}
              {c.counts.all || c.problemCount}
            </p>
          </Link>
        ))}
      </main>
    </div>
  );
}
