import { useEffect, useMemo, useRef, useState } from 'react';
import roadmap from '../a2z.json';
import { buildBackup, downloadBackup, parseBackup } from './lib/backup';
import { initStore, persistNote, persistPalette, persistTopic, replaceUserData } from './lib/db';
import { applyPalette, DEFAULT_PALETTE } from './lib/palettes';
import { collectExpandKeys, countProgress } from './lib/topics';
import NoteEditor from './components/NoteEditor';
import PalettePicker from './components/PalettePicker';
import StepSection from './components/StepSection';

export default function App() {
  const [progress, setProgress] = useState({});
  const [notes, setNotes] = useState({});
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [openKeys, setOpenKeys] = useState(() => new Set());
  const [usingIndexedDb, setUsingIndexedDb] = useState(true);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  const fileRef = useRef(null);

  const stats = useMemo(() => countProgress(roadmap, progress), [progress]);
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
          <h1>A2Z DSA Roadmap</h1>
          <p className="storage-note">Progress is saved in this browser.</p>
        </div>
        <div className="topbar-actions">
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
          <span>Overall progress</span>
          <span className="overview-count">
            {stats.completed}/{stats.total} · {percentLabel}
          </span>
        </div>
        <div className="overview-bar" aria-hidden="true">
          <div className="overview-bar-fill" style={{ width: `${rawPercent}%` }} />
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
