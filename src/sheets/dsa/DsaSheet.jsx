import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import roadmap from '../../../a2z.json';
import { buildBackup, downloadBackup, parseBackup } from './lib/backup';
import { a2zIdsForCompanyFilter, companiesOnA2zSheet } from './lib/companyLoader';
import { initStore, persistPalette } from './lib/db';
import { applyPalette, DEFAULT_PALETTE } from './lib/palettes';
import { collectExpandKeys, countProgress, progressTierClass } from './lib/topics';
import { useProgressStore } from './sync';
import NoteEditor from './components/NoteEditor';
import PalettePicker from './components/PalettePicker';
import StepSection from './components/StepSection';
import SyncDialog from './components/SyncDialog';
import SyncIndicator from './components/SyncIndicator';
import './styles.css';

const OPEN_KEYS_STORAGE = 'a2z-dsa-open-keys';

function readOpenKeys() {
  try {
    const raw = sessionStorage.getItem(OPEN_KEYS_STORAGE);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function askImportMode() {
  const merge = window.confirm(
    'Merge imported progress with what is already saved on this device?\n\nOK = Merge (additive)\nCancel = Replace or abort',
  );
  if (merge) return 'additive';
  const replace = window.confirm(
    'Replace ALL progress and notes in this browser with the file?\n\nOK = Replace\nCancel = Abort import',
  );
  return replace ? 'replace' : null;
}

export default function DsaSheet() {
  const {
    progress,
    notes,
    ready,
    bootError,
    sync,
    toggleTopic,
    setNote,
    importData,
    exportData,
    syncApi,
  } = useProgressStore();

  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [usingIndexedDb, setUsingIndexedDb] = useState(true);
  const [openKeys, setOpenKeys] = useState(readOpenKeys);
  const [message, setMessage] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  const [companyFilter, setCompanyFilter] = useState('');
  const [syncOpen, setSyncOpen] = useState(false);
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

  useEffect(() => {
    applyPalette(DEFAULT_PALETTE);
    let cancelled = false;
    initStore()
      .then((store) => {
        if (cancelled) return;
        setPalette(store.palette || DEFAULT_PALETTE);
        setUsingIndexedDb(store.usingIndexedDb);
        applyPalette(store.palette || DEFAULT_PALETTE);
      })
      .catch(() => {
        /* palette optional */
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
    try {
      sessionStorage.setItem(OPEN_KEYS_STORAGE, JSON.stringify([...openKeys]));
    } catch {
      /* ignore */
    }
  }, [openKeys]);

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

  function saveNote(id, text) {
    setNote(id, text);
  }

  function changePalette(nextPalette) {
    setPalette(nextPalette);
    applyPalette(nextPalette);
    persistPalette(nextPalette, usingIndexedDb, { progress, notes, palette: nextPalette });
  }

  function exportProgress() {
    const data = exportData();
    downloadBackup(buildBackup(data));
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
      const mode = askImportMode();
      if (!mode) {
        setMessage('Import cancelled.');
        return;
      }

      await importData(parsed, mode);
      const noteCount = Object.keys(parsed.notes).length;
      const doneCount = Object.keys(parsed.progress).length;
      setMessage(
        mode === 'additive'
          ? `Merged ${doneCount} completed topics and ${noteCount} notes from file.`
          : `Replaced with ${doneCount} completed topics and ${noteCount} notes.`,
      );
    } catch (err) {
      setMessage(err.message || 'Could not import that file.');
    }
  }

  if (bootError) {
    return (
      <div className="app">
        <h1>Could not load progress</h1>
        <p>{bootError}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="app">
        <p className="page-status">Loading roadmap…</p>
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
          <p className="storage-note">Progress is saved in this browser. Sync is optional.</p>
        </div>
        <div className="topbar-actions">
          <Link to="/dsa/companies" className="ghost-btn">
            Companies
          </Link>
          <SyncIndicator status={sync.status} peerCount={sync.peerCount} onClick={() => setSyncOpen(true)} />
          <PalettePicker value={palette} onChange={changePalette} />
          <button type="button" className="ghost-btn" onClick={exportProgress}>
            Export
          </button>
          <button type="button" className="ghost-btn" onClick={importProgress}>
            Import
          </button>
          <button type="button" className="ghost-btn" onClick={() => setSyncOpen(true)}>
            Sync
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
          <div
            className={`overview-bar-fill ${progressTierClass(rawPercent)}`}
            style={{ width: `${rawPercent}%` }}
          />
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

      <SyncDialog
        open={syncOpen}
        onClose={() => setSyncOpen(false)}
        sync={sync}
        onCreate={syncApi.create}
        onJoin={syncApi.join}
        onDisconnect={syncApi.disconnect}
      />
    </div>
  );
}
