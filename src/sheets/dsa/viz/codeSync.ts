/**
 * Viz ↔ code program-counter helpers.
 *
 * Authoring (per kit):
 * 1. Paste the optimal function into `source.code`.
 * 2. Name logical phases in `source.steps` (1-indexed line or [start, end]).
 * 3. Set `frame.step` when pushing frames.
 * 4. If you edit code, update line ranges in `steps` only — frames keep the same step ids.
 */
import type { VizFrame, VizSource, VizSpec } from './types';

export function splitSourceLines(code: string): string[] {
  if (!code) return [];
  const normalized = code.replace(/\r\n/g, '\n').replace(/\n$/, '');
  return normalized.length ? normalized.split('\n') : [];
}

function expandStepRange(range: [number, number] | number | undefined): number[] {
  if (range == null) return [];
  if (typeof range === 'number') return range > 0 ? [range] : [];
  const [a, b] = range;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (lo <= 0) return [];
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

/** Resolve 1-indexed active lines for a frame from step map and/or explicit lines. */
export function resolveFrameLines(
  source: VizSource | undefined,
  frame: VizFrame,
): number[] {
  const fromStep =
    source && frame.step ? expandStepRange(source.steps[frame.step]) : [];
  const fromLines = (frame.lines || []).filter((n) => n > 0);
  const seen = new Set<number>();
  const out: number[] = [];
  for (const n of [...fromStep, ...fromLines]) {
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out.sort((a, b) => a - b);
}

export function formatLineLabel(lines: number[], step?: string): string {
  if (!lines.length && !step) return '';
  let range = '';
  if (lines.length === 1) range = `L${lines[0]}`;
  else if (lines.length > 1) {
    const lo = lines[0];
    const hi = lines[lines.length - 1];
    const contiguous = lines.every((n, i) => i === 0 || n === lines[i - 1] + 1);
    range = contiguous ? `L${lo}–${hi}` : `L${lines.join(',')}`;
  }
  if (range && step) return `${range} · ${step}`;
  return range || step || '';
}

export function resolveFrameLinesFromSpec(spec: VizSpec, frame: VizFrame): number[] {
  return resolveFrameLines(spec.source, frame);
}
