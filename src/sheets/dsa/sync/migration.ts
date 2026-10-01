import { initStore, persistNote, persistTopic, replaceUserData } from '../lib/db';
import { DEFAULT_PALETTE } from '../lib/palettes';
import type { NotesMap, ProgressMap, UserDataSnapshot } from './types';

const META_KEY = 'a2z-dsa-sync-meta-v1';
const YJS_DB_NAME = 'a2z-dsa-yjs';

export type SyncMeta = {
  /** User has enabled Create/Join at least once → prefer Yjs on next load */
  everEnabled: boolean;
  migratedAt?: string;
};

export function readSyncMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { everEnabled: false };
    const parsed = JSON.parse(raw) as SyncMeta;
    return { everEnabled: Boolean(parsed?.everEnabled), migratedAt: parsed?.migratedAt };
  } catch {
    return { everEnabled: false };
  }
}

export function writeSyncMeta(patch: Partial<SyncMeta>): SyncMeta {
  const next = { ...readSyncMeta(), ...patch };
  localStorage.setItem(META_KEY, JSON.stringify(next));
  return next;
}

export function yjsDatabaseName(): string {
  return YJS_DB_NAME;
}

/** Load logical progress/notes from the existing IndexedDB / localStorage path. */
export async function loadLegacySnapshot(): Promise<UserDataSnapshot & { usingIndexedDb: boolean }> {
  const store = await initStore();
  return {
    progress: store.progress as ProgressMap,
    notes: store.notes as NotesMap,
    usingIndexedDb: store.usingIndexedDb,
  };
}

/** Dual-write into legacy storage so Export and non-Yjs remounts stay consistent. */
export async function mirrorTopicToLegacy(
  id: string,
  completed: boolean,
  snapshot: UserDataSnapshot,
  usingIndexedDb: boolean,
): Promise<void> {
  await persistTopic(id, completed, usingIndexedDb, {
    progress: snapshot.progress,
    notes: snapshot.notes,
    palette: DEFAULT_PALETTE,
  });
}

export async function mirrorNoteToLegacy(
  id: string,
  text: string,
  snapshot: UserDataSnapshot,
  usingIndexedDb: boolean,
): Promise<void> {
  await persistNote(id, text, usingIndexedDb, {
    progress: snapshot.progress,
    notes: snapshot.notes,
    palette: DEFAULT_PALETTE,
  });
}

export async function mirrorFullToLegacy(
  data: UserDataSnapshot,
  usingIndexedDb: boolean,
): Promise<void> {
  await replaceUserData(data, usingIndexedDb, {
    progress: data.progress,
    notes: data.notes,
    palette: DEFAULT_PALETTE,
  });
}
