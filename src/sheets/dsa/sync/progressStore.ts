/**
 * Optional P2P progress store.
 *
 * Default path (never enabled sync): existing db.js IndexedDB / localStorage — unchanged.
 * After Create/Join once: Yjs document + y-indexeddb, dual-written back to legacy db.
 * WebRTC (y-webrtc) only while a sync session is active.
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  loadLegacySnapshot,
  mirrorFullToLegacy,
  mirrorNoteToLegacy,
  mirrorTopicToLegacy,
  readSyncMeta,
  writeSyncMeta,
  yjsDatabaseName,
} from './migration';
import { generatePairingCode, normalizePairingCode, roomNameForCode, WEBRTC_CONFIG } from './pairing';
import type {
  ImportMode,
  NotesMap,
  ProgressMap,
  ProgressStoreSnapshot,
  SyncSessionInfo,
  SyncStatus,
  UserDataSnapshot,
} from './types';

type Listener = () => void;

type WebrtcProviderLike = {
  destroy: () => void;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  awareness?: { getStates: () => Map<number, unknown> };
};

let doc: Y.Doc | null = null;
let progressMap: Y.Map<boolean> | null = null;
let notesMap: Y.Map<string> | null = null;
let metaMap: Y.Map<unknown> | null = null;
let idbPersistence: IndexeddbPersistence | null = null;
let webrtc: WebrtcProviderLike | null = null;

let legacyMode = true;
let legacyUsingIndexedDb = true;
let legacyProgress: ProgressMap = {};
let legacyNotes: NotesMap = {};

let syncInfo: SyncSessionInfo = {
  code: null,
  role: null,
  peerCount: 0,
  status: 'local',
};

let ready = false;
let applyingRemote = false;
let syncingTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<Listener>();

/** Cached for useSyncExternalStore — must be referentially stable between emits. */
let cachedSnapshot: ProgressStoreSnapshot | null = null;

function mapsToSnapshot(): UserDataSnapshot {
  if (!legacyMode && progressMap && notesMap) {
    const progress: ProgressMap = {};
    progressMap.forEach((v, k) => {
      if (v) progress[k] = true;
    });
    const notes: NotesMap = {};
    notesMap.forEach((v, k) => {
      if (typeof v === 'string' && v.trim()) notes[k] = v;
    });
    return { progress, notes };
  }
  return { progress: { ...legacyProgress }, notes: { ...legacyNotes } };
}

function buildSnapshot(): ProgressStoreSnapshot {
  const data = mapsToSnapshot();
  return {
    ...data,
    ready,
    usingYjs: !legacyMode,
    sync: { ...syncInfo },
  };
}

function getSnapshot(): ProgressStoreSnapshot {
  if (!cachedSnapshot) cachedSnapshot = buildSnapshot();
  return cachedSnapshot;
}

function emit() {
  cachedSnapshot = buildSnapshot();
  for (const l of listeners) l();
}

function setSyncStatus(status: SyncStatus, patch: Partial<SyncSessionInfo> = {}) {
  syncInfo = { ...syncInfo, ...patch, status };
  emit();
}

function markSyncingBriefly() {
  if (syncInfo.status === 'local' || syncInfo.status === 'disconnected') return;
  setSyncStatus('syncing');
  if (syncingTimer) clearTimeout(syncingTimer);
  syncingTimer = setTimeout(() => {
    if (syncInfo.peerCount > 0) setSyncStatus('synced');
    else if (syncInfo.status === 'syncing') setSyncStatus('connected');
  }, 400);
}

async function ensureYjsSeededFromLegacy(): Promise<void> {
  if (!doc || !progressMap || !notesMap || !metaMap) return;

  const already = metaMap.get('migratedFromLegacy') === true;
  const legacy = await loadLegacySnapshot();
  legacyUsingIndexedDb = legacy.usingIndexedDb;

  // Idempotent union merge — never wipe Yjs with empty legacy or vice versa
  doc.transact(() => {
    for (const [id, done] of Object.entries(legacy.progress)) {
      if (done && !progressMap!.has(id)) progressMap!.set(id, true);
    }
    for (const [id, text] of Object.entries(legacy.notes)) {
      if (text && !notesMap!.has(id)) notesMap!.set(id, text);
    }
    if (!already) {
      metaMap!.set('migratedFromLegacy', true);
      metaMap!.set('migratedAt', new Date().toISOString());
    }
  });

  writeSyncMeta({
    everEnabled: true,
    migratedAt: (metaMap.get('migratedAt') as string) || new Date().toISOString(),
  });
}

async function activateYjs(): Promise<void> {
  if (!legacyMode && doc) return;

  const ydoc = new Y.Doc();
  const pMap = ydoc.getMap<boolean>('progress');
  const nMap = ydoc.getMap<string>('notes');
  const mMap = ydoc.getMap('meta');

  const persistence = new IndexeddbPersistence(yjsDatabaseName(), ydoc);
  await new Promise<void>((resolve) => {
    const done = () => resolve();
    persistence.once('synced', done);
    // Safety: some browsers never fire if empty
    setTimeout(done, 1500);
  });

  doc = ydoc;
  progressMap = pMap;
  notesMap = nMap;
  metaMap = mMap;
  idbPersistence = persistence;
  legacyMode = false;

  // Seed from in-memory legacy first (covers unsynced ticks), then IDB union
  ydoc.transact(() => {
    for (const [id, done] of Object.entries(legacyProgress)) {
      if (done) pMap.set(id, true);
    }
    for (const [id, text] of Object.entries(legacyNotes)) {
      if (text && !nMap.has(id)) nMap.set(id, text);
    }
  });

  await ensureYjsSeededFromLegacy();

  // Also push current Y state back to legacy (dual-write baseline)
  await mirrorFullToLegacy(mapsToSnapshot(), legacyUsingIndexedDb);

  const onY = () => {
    if (applyingRemote) return;
    markSyncingBriefly();
    const snap = mapsToSnapshot();
    void mirrorFullToLegacy(snap, legacyUsingIndexedDb);
    emit();
  };
  pMap.observe(onY);
  nMap.observe(onY);

  emit();
}

async function destroyWebrtc() {
  if (webrtc) {
    try {
      webrtc.destroy();
    } catch {
      /* ignore */
    }
    webrtc = null;
  }
}

async function connectWebrtc(code: string, role: 'host' | 'guest') {
  if (!doc) await activateYjs();
  if (!doc) throw new Error('Could not start sync document.');

  await destroyWebrtc();
  setSyncStatus('connecting', { code, role, peerCount: 0 });

  const { WebrtcProvider } = await import('y-webrtc');
  const room = roomNameForCode(code);

  const provider = new WebrtcProvider(room, doc, {
    signaling: WEBRTC_CONFIG.signaling,
    maxConns: WEBRTC_CONFIG.maxConns,
    filterBcConns: WEBRTC_CONFIG.filterBcConns,
    peerOpts: WEBRTC_CONFIG.peerOpts,
  }) as unknown as WebrtcProviderLike;

  webrtc = provider;

  const refreshPeers = () => {
    let count = 0;
    try {
      // y-webrtc room.peers is internal; awareness states ≈ connected peers
      const states = provider.awareness?.getStates?.();
      if (states) count = Math.max(0, states.size - 1);
    } catch {
      count = syncInfo.peerCount;
    }
    syncInfo = { ...syncInfo, peerCount: count };
    if (count > 0) setSyncStatus('synced', { peerCount: count });
    else if (syncInfo.status === 'synced' || syncInfo.status === 'connected') {
      setSyncStatus('connected', { peerCount: 0 });
    } else {
      emit();
    }
  };

  provider.on('status', (event: unknown) => {
    const connected = Boolean((event as { connected?: boolean })?.connected);
    if (connected) {
      setSyncStatus(syncInfo.peerCount > 0 ? 'synced' : 'connected');
    } else if (syncInfo.status !== 'local') {
      setSyncStatus('reconnecting');
    }
  });

  provider.on('peers', (event: unknown) => {
    const e = event as { webrtcPeers?: string[]; bcPeers?: string[] };
    const count = (e.webrtcPeers?.length || 0) + (e.bcPeers?.length || 0);
    syncInfo = { ...syncInfo, peerCount: count };
    if (count > 0) setSyncStatus('synced', { peerCount: count });
    else setSyncStatus('connected', { peerCount: 0 });
  });

  // Fallback peer probe
  window.setTimeout(refreshPeers, 800);
  window.setTimeout(refreshPeers, 2500);
}

async function init(): Promise<ProgressStoreSnapshot> {
  if (ready) return getSnapshot();

  const meta = readSyncMeta();
  if (meta.everEnabled) {
    await activateYjs();
  } else {
    const legacy = await loadLegacySnapshot();
    legacyProgress = legacy.progress;
    legacyNotes = legacy.notes;
    legacyUsingIndexedDb = legacy.usingIndexedDb;
    legacyMode = true;
  }

  ready = true;
  emit();
  return getSnapshot();
}

function setCompleted(id: string, completed: boolean) {
  if (!ready) return;

  if (legacyMode) {
    if (completed) legacyProgress = { ...legacyProgress, [id]: true };
    else {
      const next = { ...legacyProgress };
      delete next[id];
      legacyProgress = next;
    }
    void mirrorTopicToLegacy(id, completed, mapsToSnapshot(), legacyUsingIndexedDb);
    emit();
    return;
  }

  if (!progressMap || !doc) return;
  applyingRemote = true;
  doc.transact(() => {
    if (completed) progressMap!.set(id, true);
    else progressMap!.delete(id);
  });
  applyingRemote = false;
  const snap = mapsToSnapshot();
  void mirrorTopicToLegacy(id, completed, snap, legacyUsingIndexedDb);
  markSyncingBriefly();
  emit();
}

function setNote(id: string, text: string) {
  if (!ready) return;
  const trimmed = text.trim();

  if (legacyMode) {
    const next = { ...legacyNotes };
    if (trimmed) next[id] = trimmed;
    else delete next[id];
    legacyNotes = next;
    void mirrorNoteToLegacy(id, trimmed, mapsToSnapshot(), legacyUsingIndexedDb);
    emit();
    return;
  }

  if (!notesMap || !doc) return;
  applyingRemote = true;
  doc.transact(() => {
    if (trimmed) notesMap!.set(id, trimmed);
    else notesMap!.delete(id);
  });
  applyingRemote = false;
  void mirrorNoteToLegacy(id, trimmed, mapsToSnapshot(), legacyUsingIndexedDb);
  markSyncingBriefly();
  emit();
}

async function importData(data: UserDataSnapshot, mode: ImportMode) {
  if (!ready) await init();

  if (mode === 'replace') {
    if (legacyMode) {
      legacyProgress = { ...data.progress };
      legacyNotes = { ...data.notes };
      await mirrorFullToLegacy(data, legacyUsingIndexedDb);
      emit();
      return;
    }
    if (!doc || !progressMap || !notesMap) return;
    applyingRemote = true;
    doc.transact(() => {
      // Clear then set
      Array.from(progressMap!.keys()).forEach((k) => progressMap!.delete(k));
      Array.from(notesMap!.keys()).forEach((k) => notesMap!.delete(k));
      for (const [id, done] of Object.entries(data.progress)) {
        if (done) progressMap!.set(id, true);
      }
      for (const [id, text] of Object.entries(data.notes)) {
        if (text) notesMap!.set(id, text);
      }
    });
    applyingRemote = false;
    await mirrorFullToLegacy(mapsToSnapshot(), legacyUsingIndexedDb);
    emit();
    return;
  }

  // additive: union progress; notes — keep existing unless missing, else prefer incoming if non-empty
  if (legacyMode) {
    legacyProgress = { ...legacyProgress };
    for (const [id, done] of Object.entries(data.progress)) {
      if (done) legacyProgress[id] = true;
    }
    legacyNotes = { ...legacyNotes };
    for (const [id, text] of Object.entries(data.notes)) {
      if (text && !legacyNotes[id]) legacyNotes[id] = text;
    }
    await mirrorFullToLegacy(mapsToSnapshot(), legacyUsingIndexedDb);
    emit();
    return;
  }

  if (!doc || !progressMap || !notesMap) return;
  applyingRemote = true;
  doc.transact(() => {
    for (const [id, done] of Object.entries(data.progress)) {
      if (done) progressMap!.set(id, true);
    }
    for (const [id, text] of Object.entries(data.notes)) {
      if (text && !notesMap!.has(id)) notesMap!.set(id, text);
    }
  });
  applyingRemote = false;
  await mirrorFullToLegacy(mapsToSnapshot(), legacyUsingIndexedDb);
  emit();
}

async function createSyncSession(): Promise<string> {
  await activateYjs();
  const code = generatePairingCode();
  writeSyncMeta({ everEnabled: true });
  await connectWebrtc(code, 'host');
  return code;
}

async function joinSyncSession(rawCode: string): Promise<string> {
  const code = normalizePairingCode(rawCode);
  if (!code) throw new Error('Enter a code like ABCD-7291.');
  await activateYjs();
  writeSyncMeta({ everEnabled: true });
  await connectWebrtc(code, 'guest');
  return code;
}

async function disconnectSync() {
  await destroyWebrtc();
  setSyncStatus('local', { code: null, role: null, peerCount: 0 });
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSyncStatus(): SyncSessionInfo {
  return { ...syncInfo };
}

export const progressStore = {
  init,
  getSnapshot,
  subscribe,
  setCompleted,
  setNote,
  importData,
  createSyncSession,
  joinSyncSession,
  disconnectSync,
  getSyncStatus,
  /** Logical snapshot for Export — never Yjs binary */
  getExportData: (): UserDataSnapshot => mapsToSnapshot(),
};

export type ProgressStore = typeof progressStore;
