export type ProgressMap = Record<string, boolean>;
export type NotesMap = Record<string, string>;

export type UserDataSnapshot = {
  progress: ProgressMap;
  notes: NotesMap;
};

/** Import merge strategy — asked at import time. */
export type ImportMode = 'replace' | 'additive';

/**
 * Sync connection lifecycle shown in the UI.
 * Never expose raw WebRTC errors to end users.
 */
export type SyncStatus =
  | 'local' // never connected / disconnected by choice
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'synced'
  | 'disconnected'
  | 'reconnecting';

export type SyncSessionInfo = {
  code: string | null;
  role: 'host' | 'guest' | null;
  peerCount: number;
  status: SyncStatus;
};

export type ProgressStoreSnapshot = UserDataSnapshot & {
  ready: boolean;
  /** true once Yjs path is active (after first sync enable or remount with everEnabled) */
  usingYjs: boolean;
  sync: SyncSessionInfo;
};
