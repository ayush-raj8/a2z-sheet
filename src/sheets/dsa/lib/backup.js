export const BACKUP_APP = 'a2z-dsa-sheet';
export const BACKUP_VERSION = 1;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function buildBackup({ progress, notes }) {
  const completedIds = Object.keys(progress).filter((id) => progress[id]);
  const noteEntries = Object.entries(notes)
    .filter(([, text]) => typeof text === 'string' && text.trim())
    .map(([id, text]) => ({ id, text }));

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress: completedIds,
    notes: noteEntries,
  };
}

function normalizeProgress(progress) {
  const map = {};

  if (Array.isArray(progress)) {
    for (const item of progress) {
      if (typeof item === 'string' && item) map[item] = true;
      else if (item && typeof item.id === 'string' && item.completed !== false) map[item.id] = true;
    }
    return map;
  }

  if (isPlainObject(progress)) {
    for (const [id, value] of Object.entries(progress)) {
      if (value) map[id] = true;
    }
  }

  return map;
}

function normalizeNotes(notes) {
  const map = {};

  if (Array.isArray(notes)) {
    for (const item of notes) {
      if (!item || typeof item.id !== 'string') continue;
      const text = typeof item.text === 'string' ? item.text : '';
      if (text.trim()) map[item.id] = text;
    }
    return map;
  }

  if (isPlainObject(notes)) {
    for (const [id, value] of Object.entries(notes)) {
      if (typeof value === 'string' && value.trim()) map[id] = value;
      else if (value && typeof value.text === 'string' && value.text.trim()) map[id] = value.text;
    }
  }

  return map;
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (!isPlainObject(data)) {
    throw new Error('That backup file is empty or invalid.');
  }

  return {
    progress: normalizeProgress(data.progress),
    notes: normalizeNotes(data.notes),
  };
}

export function backupFilename(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10);
  return `a2z-progress-${stamp}.json`;
}

export function downloadBackup(backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFilename();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
