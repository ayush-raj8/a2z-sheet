/** Human-readable pairing codes like ABCD-7291 → room id for y-webrtc. */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O
const DIGITS = '23456789'; // no 0/1

function pick(alphabet: string, n: number, rand: () => number): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += alphabet[Math.floor(rand() * alphabet.length)]!;
  }
  return out;
}

export function generatePairingCode(): string {
  const rand = () => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0]! / 0x100000000;
    }
    return Math.random();
  };
  return `${pick(LETTERS, 4, rand)}-${pick(DIGITS, 4, rand)}`;
}

/** Normalize user input: trim, upper-case, insert dash if missing. */
export function normalizePairingCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length !== 8) return null;
  const letters = cleaned.slice(0, 4);
  const digits = cleaned.slice(4);
  if (!/^[A-Z]{4}$/.test(letters) || !/^[0-9]{4}$/.test(digits)) return null;
  return `${letters}-${digits}`;
}

/**
 * Room name for y-webrtc. Prefix isolates us on public signaling;
 * code itself is random — not derived from user identity or progress.
 */
export function roomNameForCode(code: string): string {
  return `a2z-dsa-sheet-${code}`;
}

/** Optional signaling / TURN knobs — swap later without rewriting the store. */
export const WEBRTC_CONFIG = {
  /** Public y-webrtc signaling (peer discovery only — not a progress DB). */
  signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com'],
  /** Password not used; room secrecy = knowledge of the pairing code. */
  maxConns: 4,
  filterBcConns: true,
  peerOpts: undefined as RTCConfiguration | undefined,
};
