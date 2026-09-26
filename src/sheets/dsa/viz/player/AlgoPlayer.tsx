import { useEffect, useMemo, useState } from 'react';
import type { ExecutionTimeline } from '../engine/types';
import { CodeViewer, GraphCanvasViewer, StructureStrip } from '../viewers';

function modeTabLabel(title: string): string {
  if (title.includes('FIFO') || title.includes('wrong')) return 'FIFO (wrong)';
  if (title.includes('Priority') || title.includes('correct')) return 'Priority queue';
  if (title.includes('DFS')) return '3-color DFS';
  if (title.includes('Kahn')) return 'Kahn';
  return title;
}

export default function AlgoPlayer({ timelines }: { timelines: ExecutionTimeline[] }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timeline = timelines[Math.min(modeIdx, Math.max(0, timelines.length - 1))] ?? null;

  useEffect(() => {
    setModeIdx(0);
    setIdx(0);
    setPlaying(false);
  }, [timelines]);

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [modeIdx]);

  useEffect(() => {
    if (!playing || !timeline) return;
    if (idx >= timeline.steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setIdx((i) => i + 1), 850);
    return () => window.clearTimeout(t);
  }, [playing, idx, timeline]);

  const step = timeline?.steps[Math.min(idx, (timeline?.steps.length || 1) - 1)];
  const hasCanvas = useMemo(() => {
    const c = step?.canvas;
    return Boolean(c?.nodes?.length || c?.grid?.length);
  }, [step]);

  if (!timeline || !step) return null;

  return (
    <section className="blog-section viz-section">
      <h2>Visualization — {timeline.title}</h2>
      {timelines.length > 1 ? (
        <div className="blog-lang-tabs" role="tablist" aria-label="Algorithm variant">
          {timelines.map((t, i) => (
            <button
              key={t.id || t.title}
              type="button"
              role="tab"
              aria-selected={i === modeIdx}
              className={`blog-lang-tab${i === modeIdx ? ' active' : ''}`}
              onClick={() => setModeIdx(i)}
            >
              {modeTabLabel(t.title)}
            </button>
          ))}
        </div>
      ) : null}

      <p className="viz-input">
        <strong>Default input</strong> (matches optimal signature): <code>{timeline.inputSummary}</code>
      </p>
      <p className="viz-expected">
        <strong>Expected output:</strong> <code>{timeline.expectedOutput}</code>
      </p>

      <div className="viz-player">
        <div className={`viz-layout viz-layout-split`}>
          <div className="viz-code-col">
            <CodeViewer source={timeline.source} line={step.line} event={step.event} />
          </div>
          <div className="viz-stage">
            {hasCanvas ? (
              <GraphCanvasViewer canvas={step.canvas} />
            ) : (
              <div className="viz-empty viz-stage-hint">Structures update below</div>
            )}
          </div>
        </div>

        <p className="viz-caption">{step.caption}</p>

        <StructureStrip structures={step.structures} />

        <div className="viz-controls">
          <button type="button" className="viz-btn" onClick={() => setIdx(0)} disabled={idx === 0}>
            Reset
          </button>
          <button
            type="button"
            className="viz-btn"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            Prev
          </button>
          <button
            type="button"
            className="viz-btn viz-btn-primary"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="viz-btn"
            onClick={() => setIdx((i) => Math.min(timeline.steps.length - 1, i + 1))}
            disabled={idx >= timeline.steps.length - 1}
          >
            Next
          </button>
          <span className="viz-step">
            Step {idx + 1} / {timeline.steps.length}
          </span>
        </div>
      </div>
    </section>
  );
}
