import type { ExecutionStep, StructureState, TracedSource } from './types';

/** Split source into 1-indexed display lines. */
export function splitSourceLines(code: string): string[] {
  if (!code) return [];
  const normalized = code.replace(/\r\n/g, '\n').replace(/\n$/, '');
  return normalized.length ? normalized.split('\n') : [];
}

export function formatPcLabel(line: number, event?: string): string {
  if (!line && !event) return '';
  if (line && event) return `L${line} · ${event}`;
  if (line) return `L${line}`;
  return event || '';
}

/** Tiny builder to keep runners readable. */
export class TimelineBuilder {
  private steps: ExecutionStep[] = [];

  step(partial: ExecutionStep): this {
    this.steps.push(partial);
    return this;
  }

  /** Emit one step at a single source line with shared structures/canvas. */
  at(
    line: number,
    caption: string,
    extras: Omit<ExecutionStep, 'line' | 'caption'> = {},
  ): this {
    return this.step({ line, caption, ...extras });
  }

  build(): ExecutionStep[] {
    return this.steps;
  }
}

export function structuresOf(
  ...parts: Array<StructureState | null | undefined | false>
): StructureState[] {
  return parts.filter(Boolean) as StructureState[];
}

export function assertSourceLine(source: TracedSource, line: number): void {
  const n = splitSourceLines(source.code).length;
  if (line < 1 || line > n) {
    // Soft warning in dev — don't throw in production UI
    if (typeof console !== 'undefined') {
      console.warn(`[viz] line ${line} out of range 1..${n} for ${source.title || 'source'}`);
    }
  }
}
