import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import roadmap from '../../../a2z.json';
import { buildBackup, downloadBackup, parseBackup } from './lib/backup';
import { a2zIdsForCompanyFilter, companiesOnA2zSheet } from './lib/companyLoader';
import { initStore, persistNote, persistPalette, persistTopic, replaceUserData } from './lib/db';
import { applyPalette, DEFAULT_PALETTE } from './lib/palettes';
import { collectExpandKeys, countProgress } from './lib/topics';
import NoteEditor from './components/NoteEditor';
import PalettePicker from './components/PalettePicker';
import StepSection from './components/StepSection';
import './styles.css';

export default function DsaSheet() {
  const [progress, setProgress] = useState({});
  const [notes, setNotes] = useState({});
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const [usingIndexedDb, setUsingIndexedDb] = useState(true);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  const [companyFilter, setCompanyFilter] = useState('');
  const fileRef = useRef(null);

  const companyOptions = useMemo(() => companiesOnA2zSheet(), []);
  const topicFilterIds = useMemo(() => {
    if (!companyFilter) return null;
    return a2zIdsForCompanyFilter(companyFilter);
  }, [companyFilter]);

  const stats = useMemo(() => {
    if (!topicFilterIds) return countProgress(roadmap, progress);
    let total = 0;
    let completed = 0;
    for (const id of topicFilterIds) {
      total += 1;
      if (progress[id]) completed += 1;
    }
    return { total, completed };
  }, [progress, topicFilterIds]);

  const rawPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const percentLabel = rawPercent > 0 && rawPercent < 1 ? '<1%' : `${Math.round(rawPercent)}%`;
  const allKeys = useMemo(() => collectExpandKeys(roadmap), []);
  const allExpanded = openKeys.size === allKeys.length && allKeys.length > 0;
  const fallbackState = { progress, notes, palette };

  useEffect(() => {
    applyPalette(DEFAULT_PALETTE);
    let cancelled = false;

    initStore()
      .then((store) => {
        if (cancelled) return;
        setProgress(store.progress);
        setNotes(store.notes);
        setPalette(store.palette || DEFAULT_PALETTE);
        setUsingIndexedDb(store.usingIndexedDb);
        applyPalette(store.palette || DEFAULT_PALETTE);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load saved progress.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!companyFilter) return;
    setOpenKeys(new Set(allKeys));
  }, [companyFilter, allKeys]);

  function toggleOpen(key) {
    setOpenKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setOpenKeys(allExpanded ? new Set() : new Set(allKeys));
  }

  function toggleTopic(id) {
    const nextValue = !progress[id];
    const nextProgress = { ...progress };
    if (nextValue) nextProgress[id] = true;
    else delete nextProgress[id];
    setProgress(nextProgress);
    persistTopic(id, nextValue, usingIndexedDb, { ...fallbackState, progress: nextProgress });
  }

  function saveNote(id, text) {
    const trimmed = text.trim();
    const nextNotes = { ...notes };
    if (trimmed) nextNotes[id] = trimmed;
    else delete nextNotes[id];
    setNotes(nextNotes);
    persistNote(id, trimmed, usingIndexedDb, { ...fallbackState, notes: nextNotes });
  }

  function changePalette(nextPalette) {
    setPalette(nextPalette);
    applyPalette(nextPalette);
    persistPalette(nextPalette, usingIndexedDb, { ...fallbackState, palette: nextPalette });
  }

  function exportProgress() {
    downloadBackup(buildBackup({ progress, notes }));
    setMessage('Backup downloaded.');
  }

  function importProgress() {
    fileRef.current?.click();
  }

  async function onImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = parseBackup(await file.text());
      const confirmed = window.confirm('Replace the progress and notes saved in this browser?');
      if (!confirmed) return;

      await replaceUserData(parsed, usingIndexedDb, { ...fallbackState, ...parsed });
      setProgress(parsed.progress);
      setNotes(parsed.notes);
      const noteCount = Object.keys(parsed.notes).length;
      const doneCount = Object.keys(parsed.progress).length;
      setMessage(`Imported ${doneCount} completed topics and ${noteCount} notes.`);
    } catch (err) {
      setMessage(err.message || 'Could not import that file.');
    }
  }

  if (status === 'loading') {
    return (
      <div className="app">
        <p className="page-status">Loading roadmap…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="app">
        <h1>Could not load the roadmap</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/" className="home-link">
            ← Sheets
          </Link>
          <h1>A2Z DSA Roadmap</h1>
          <p className="storage-note">Progress is saved in this browser.</p>
        </div>
        <div className="topbar-actions">
          <Link to="/dsa/companies" className="ghost-btn">
            Companies
          </Link>
          <PalettePicker value={palette} onChange={changePalette} />
          <button type="button" className="ghost-btn" onClick={exportProgress}>
            Export
          </button>
          <button type="button" className="ghost-btn" onClick={importProgress}>
            Import
          </button>
          <button type="button" className="ghost-btn" onClick={toggleAll}>
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onImportFile}
          />
        </div>
      </header>

      <section className="overview" aria-label="Overall progress">
        <div className="overview-top">
          <span>Overall progress{companyFilter ? ' (filtered)' : ''}</span>
          <span className="overview-count">
            {stats.completed}/{stats.total} · {percentLabel}
          </span>
        </div>
        <div className="overview-bar" aria-hidden="true">
          <div className="overview-bar-fill" style={{ width: `${rawPercent}%` }} />
        </div>
        <div className="company-filter-row">
          <label>
            Company filter
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              aria-label="Filter A2Z topics by company"
            >
              <option value="">All companies</option>
              {companyOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </label>
          {companyFilter ? (
            <Link to={`/dsa/companies/${companyFilter}`} className="company-filter-link">
              Open full company list →
            </Link>
          ) : (
            <span className="company-filter-hint">
              Chips link to company pages · {companyOptions.length} companies overlap A2Z via LC
            </span>
          )}
        </div>
        {message ? <p className="status-message">{message}</p> : null}
      </section>

      <main>
        {roadmap.map((step) => (
          <StepSection
            key={step.step_no}
            step={step}
            openKeys={openKeys}
            progress={progress}
            notes={notes}
            onToggleOpen={toggleOpen}
            onToggleTopic={toggleTopic}
            onEditNote={setEditingTopic}
            topicFilterIds={topicFilterIds}
          />
        ))}
      </main>

      {editingTopic ? (
        <NoteEditor
          topic={editingTopic}
          initialText={notes[editingTopic.id] || ''}
          onSave={saveNote}
          onClose={() => setEditingTopic(null)}
        />
      ) : null}
    </div>
  );
}
