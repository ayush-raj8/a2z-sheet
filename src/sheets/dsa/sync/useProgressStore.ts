import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { progressStore } from './progressStore';
import type { ImportMode, ProgressStoreSnapshot, UserDataSnapshot } from './types';

const empty: ProgressStoreSnapshot = {
  progress: {},
  notes: {},
  ready: false,
  usingYjs: false,
  sync: { code: null, role: null, peerCount: 0, status: 'local' },
};

function subscribe(cb: () => void) {
  return progressStore.subscribe(cb);
}

function getSnapshot() {
  return progressStore.getSnapshot();
}

function getServerSnapshot() {
  return empty;
}

/** Shared DSA progress: completion + notes + optional P2P sync status. */
export function useProgressStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [bootError, setBootError] = useState('');

  useEffect(() => {
    let cancelled = false;
    progressStore
      .init()
      .catch((err) => {
        if (!cancelled) setBootError(err instanceof Error ? err.message : 'Failed to load progress.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTopic = useCallback((id: string) => {
    const done = Boolean(progressStore.getSnapshot().progress[id]);
    progressStore.setCompleted(id, !done);
  }, []);

  const setNote = useCallback((id: string, text: string) => {
    progressStore.setNote(id, text);
  }, []);

  const importData = useCallback(async (data: UserDataSnapshot, mode: ImportMode) => {
    await progressStore.importData(data, mode);
  }, []);

  const exportData = useCallback(() => progressStore.getExportData(), []);

  const syncApi = useMemo(
    () => ({
      create: () => progressStore.createSyncSession(),
      join: (code: string) => progressStore.joinSyncSession(code),
      disconnect: () => progressStore.disconnectSync(),
    }),
    [],
  );

  return {
    ...snap,
    bootError,
    toggleTopic,
    setNote,
    importData,
    exportData,
    syncApi,
  };
}
