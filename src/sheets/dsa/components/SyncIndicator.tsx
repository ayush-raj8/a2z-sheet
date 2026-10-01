import type { SyncStatus } from '../sync/types';

const LABEL: Record<SyncStatus, string> = {
  local: 'Local only',
  connecting: 'Connecting',
  connected: 'Connected',
  syncing: 'Syncing',
  synced: 'Synced',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting',
};

const DOT: Record<SyncStatus, string> = {
  local: 'sync-dot-local',
  connecting: 'sync-dot-connecting',
  connected: 'sync-dot-connected',
  syncing: 'sync-dot-syncing',
  synced: 'sync-dot-synced',
  disconnected: 'sync-dot-disconnected',
  reconnecting: 'sync-dot-reconnecting',
};

type Props = {
  status: SyncStatus;
  peerCount?: number;
  onClick: () => void;
};

export default function SyncIndicator({ status, peerCount = 0, onClick }: Props) {
  const title =
    status === 'synced' && peerCount > 0
      ? `Synced · ${peerCount} device${peerCount === 1 ? '' : 's'} connected`
      : LABEL[status];

  return (
    <button
      type="button"
      className="sync-indicator ghost-btn"
      onClick={onClick}
      title={`${title} — click for Sync Across Devices`}
      aria-label={`Sync status: ${title}. Open sync dialog.`}
    >
      <span className={`sync-dot ${DOT[status]}`} aria-hidden="true" />
      <span className="sync-indicator-label">{LABEL[status]}</span>
    </button>
  );
}
