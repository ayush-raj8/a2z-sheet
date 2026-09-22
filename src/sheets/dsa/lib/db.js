import { DEFAULT_PALETTE } from './palettes';

const DB_NAME = 'a2z-dsa-sheet';
const DB_VERSION = 2;
const STORE_PROGRESS = 'progress';
const STORE_NOTES = 'notes';
const STORE_SETTINGS = 'settings';
const LEGACY_STORAGE_KEY = 'dsaRoadmapProgress';
const FALLBACK_KEY = 'dsaRoadmapState';

let dbPromise;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
          db.createObjectStore(STORE_PROGRESS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_NOTES)) {
          db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
  }

  return dbPromise;
}

function waitForTransaction(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function progressRecordsToMap(records) {
  const map = {};
  for (const record of records || []) {
    if (record.completed) map[record.id] = true;
  }
  return map;
}

function notesRecordsToMap(records) {
  const map = {};
  for (const record of records || []) {
    if (record.text) map[record.id] = record.text;
  }
  return map;
}

function emptyState() {
  return { progress: {}, notes: {}, palette: DEFAULT_PALETTE };
}

function readFallbackState() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        progress: parsed?.progress || {},
        notes: parsed?.notes || {},
        palette: parsed?.palette || DEFAULT_PALETTE,
      };
    }
  } catch {
    // Fall through to the older progress-only key.
  }

  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return emptyState();
    return {
      progress: JSON.parse(legacy) || {},
      notes: {},
      palette: DEFAULT_PALETTE,
    };
  } catch {
    return emptyState();
  }
}

function writeFallbackState(state) {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
}

async function loadProgressMap(db) {
  const tx = db.transaction(STORE_PROGRESS, 'readonly');
  const records = await requestToPromise(tx.objectStore(STORE_PROGRESS).getAll());
  return progressRecordsToMap(records);
}

async function loadNotesMap(db) {
  const tx = db.transaction(STORE_NOTES, 'readonly');
  const records = await requestToPromise(tx.objectStore(STORE_NOTES).getAll());
  return notesRecordsToMap(records);
}

async function loadPalette(db) {
  const tx = db.transaction(STORE_SETTINGS, 'readonly');
  const record = await requestToPromise(tx.objectStore(STORE_SETTINGS).get('palette'));
  return record?.value || DEFAULT_PALETTE;
}

async function migrateLegacyProgress(db) {
  let legacy;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;
    legacy = JSON.parse(raw);
  } catch {
    return;
  }
  if (!legacy || typeof legacy !== 'object') return;

  const existing = await loadProgressMap(db);
  if (Object.keys(existing).length > 0) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return;
  }

  const tx = db.transaction(STORE_PROGRESS, 'readwrite');
  const store = tx.objectStore(STORE_PROGRESS);
  const now = Date.now();
  for (const [id, completed] of Object.entries(legacy)) {
    if (completed) store.put({ id, completed: true, updatedAt: now });
  }
  await waitForTransaction(tx);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export async function initStore() {
  try {
    const db = await openDb();
    await migrateLegacyProgress(db);
    const [progress, notes, palette] = await Promise.all([
      loadProgressMap(db),
      loadNotesMap(db),
      loadPalette(db),
    ]);
    return { progress, notes, palette, usingIndexedDb: true };
  } catch (error) {
    console.error('IndexedDB unavailable, falling back to localStorage', error);
    return { ...readFallbackState(), usingIndexedDb: false };
  }
}

export async function persistTopic(id, completed, usingIndexedDb, fallbackState) {
  if (usingIndexedDb) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE_PROGRESS, 'readwrite');
      const store = tx.objectStore(STORE_PROGRESS);
      if (completed) store.put({ id, completed: true, updatedAt: Date.now() });
      else store.delete(id);
      await waitForTransaction(tx);
      return;
    } catch (error) {
      console.error('Failed to save progress to IndexedDB', error);
    }
  }

  try {
    writeFallbackState({
      ...fallbackState,
      progress: completed
        ? { ...fallbackState.progress, [id]: true }
        : Object.fromEntries(Object.entries(fallbackState.progress).filter(([key]) => key !== id)),
    });
  } catch (error) {
    console.error('Failed to save progress to localStorage', error);
  }
}

export async function persistNote(id, text, usingIndexedDb, fallbackState) {
  const trimmed = text.trim();

  if (usingIndexedDb) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      if (trimmed) store.put({ id, text: trimmed, updatedAt: Date.now() });
      else store.delete(id);
      await waitForTransaction(tx);
      return;
    } catch (error) {
      console.error('Failed to save note to IndexedDB', error);
    }
  }

  try {
    const notes = { ...fallbackState.notes };
    if (trimmed) notes[id] = trimmed;
    else delete notes[id];
    writeFallbackState({ ...fallbackState, notes });
  } catch (error) {
    console.error('Failed to save note to localStorage', error);
  }
}

export async function persistPalette(palette, usingIndexedDb, fallbackState) {
  if (usingIndexedDb) {
    try {
      const db = await openDb();
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      tx.objectStore(STORE_SETTINGS).put({ key: 'palette', value: palette });
      await waitForTransaction(tx);
      return;
    } catch (error) {
      console.error('Failed to save palette to IndexedDB', error);
    }
  }

  try {
    writeFallbackState({ ...fallbackState, palette });
  } catch (error) {
    console.error('Failed to save palette to localStorage', error);
  }
}

export async function replaceUserData({ progress, notes }, usingIndexedDb, fallbackState) {
  if (usingIndexedDb) {
    const db = await openDb();
    const tx = db.transaction([STORE_PROGRESS, STORE_NOTES], 'readwrite');
    const progressStore = tx.objectStore(STORE_PROGRESS);
    const notesStore = tx.objectStore(STORE_NOTES);
    progressStore.clear();
    notesStore.clear();
    const now = Date.now();

    for (const [id, completed] of Object.entries(progress)) {
      if (completed) progressStore.put({ id, completed: true, updatedAt: now });
    }
    for (const [id, text] of Object.entries(notes)) {
      if (text) notesStore.put({ id, text, updatedAt: now });
    }

    await waitForTransaction(tx);
    return;
  }

  writeFallbackState({
    ...fallbackState,
    progress,
    notes,
  });
}
