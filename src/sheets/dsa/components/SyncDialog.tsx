import { useEffect, useState, type FormEvent } from 'react';
import type { SyncSessionInfo } from '../sync/types';

type Props = {
  open: boolean;
  onClose: () => void;
  sync: SyncSessionInfo;
  onCreate: () => Promise<string>;
  onJoin: (code: string) => Promise<string>;
  onDisconnect: () => Promise<void>;
};

export default function SyncDialog({ open, onClose, sync, onCreate, onJoin, onDisconnect }: Props) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [joinInput, setJoinInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMode('menu');
      setJoinInput('');
      setError('');
      setBusy(false);
      setCreatedCode(sync.code);
    } else {
      setCreatedCode(sync.code);
      if (sync.code && sync.status !== 'local') setMode(sync.role === 'guest' ? 'join' : 'create');
    }
  }, [open, sync.code, sync.role, sync.status]);

  if (!open) return null;

  async function handleCreate() {
    setBusy(true);
    setError('');
    try {
      const code = await onCreate();
      setCreatedCode(code);
      setMode('create');
    } catch {
      setError('Could not start a sync session. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const code = await onJoin(joinInput);
      setCreatedCode(code);
      setMode('join');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join. Check the code and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    setError('');
    try {
      await onDisconnect();
      setCreatedCode(null);
      setMode('menu');
    } catch {
      setError('Could not disconnect cleanly. You can close this dialog.');
    } finally {
      setBusy(false);
    }
  }

  const connected = sync.peerCount > 0;
  const inSession = sync.status !== 'local' && Boolean(sync.code || createdCode);
  const displayCode = createdCode || sync.code;

  return (
    <div className="sync-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sync-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sync-modal-header">
          <h2 id="sync-modal-title">Sync Across Devices</h2>
          <button type="button" className="ghost-btn sync-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <p className="sync-modal-lead">
          Optional peer-to-peer sync between two browsers. No account, no Google login, no cloud database —
          progress stays on your devices. Signaling is only used to find peers; your checklist is not stored
          on a server.
        </p>

        {inSession ? (
          <div className="sync-session-panel">
            <p className="sync-code-display">
              Code: <strong>{displayCode}</strong>
            </p>
            <ul className="sync-status-list">
              <li>
                {connected ? '🟢' : sync.status === 'connecting' || sync.status === 'reconnecting' ? '🟡' : '⚪'}{' '}
                {connected
                  ? `Device connected (${sync.peerCount})`
                  : sync.status === 'connecting' || sync.status === 'reconnecting'
                    ? 'Waiting for the other device…'
                    : 'No peer yet — open this page on your other laptop and enter the code'}
              </li>
              <li>
                {sync.status === 'synced' || sync.status === 'syncing'
                  ? '🟢 Progress synchronized'
                  : sync.status === 'connected'
                    ? '🟡 Connected — waiting to sync'
                    : '⚪ Not synced yet'}
              </li>
            </ul>
            <button type="button" className="ghost-btn" disabled={busy} onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        ) : null}

        {!inSession && mode === 'menu' ? (
          <div className="sync-actions">
            <button type="button" className="sync-primary-btn" disabled={busy} onClick={handleCreate}>
              Create Sync Session
            </button>
            <button type="button" className="sync-primary-btn" disabled={busy} onClick={() => setMode('join')}>
              Join Sync Session
            </button>
          </div>
        ) : null}

        {!inSession && mode === 'create' ? (
          <div className="sync-session-panel">
            <p>Your pairing code:</p>
            <p className="sync-code-display sync-code-large">
              <strong>{displayCode || '……'}</strong>
            </p>
            <p className="sync-modal-hint">Open this page on your other device and enter this code.</p>
            {busy ? <p className="sync-modal-hint">Starting…</p> : null}
          </div>
        ) : null}

        {!inSession && mode === 'join' ? (
          <form className="sync-join-form" onSubmit={handleJoin}>
            <label>
              Pairing code
              <input
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                placeholder="ABCD-7291"
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
              />
            </label>
            <div className="sync-actions-row">
              <button type="button" className="ghost-btn" disabled={busy} onClick={() => setMode('menu')}>
                Back
              </button>
              <button type="submit" className="sync-primary-btn" disabled={busy || !joinInput.trim()}>
                Join
              </button>
            </div>
          </form>
        ) : null}

        {error ? <p className="sync-modal-error">{error}</p> : null}

        <footer className="sync-modal-footer">
          <p>
            Restrictive networks may block direct P2P; a future TURN relay can be added without changing how
            progress is stored. Export/Import remains the reliable backup.
          </p>
        </footer>
      </div>
    </div>
  );
}
