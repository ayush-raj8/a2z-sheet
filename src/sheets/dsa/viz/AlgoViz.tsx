import { useEffect, useMemo, useState } from 'react';
import { getVizForTopic } from './registry';
import type { VizEdge, VizFrame, VizNode } from './types';

function NodeCircle({
  n,
  active,
  visited,
}: {
  n: VizNode;
  active: boolean;
  visited: boolean;
}) {
  const fill = active ? 'var(--viz-active)' : visited ? 'var(--viz-visited)' : 'var(--viz-node)';
  const stroke = active ? 'var(--viz-active-stroke)' : 'var(--viz-stroke)';
  return (
    <g>
      <circle cx={n.x} cy={n.y} r={16} fill={fill} stroke={stroke} strokeWidth={2} />
      <text
        x={n.x}
        y={n.y + 4}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="var(--viz-label)"
      >
        {n.label}
      </text>
    </g>
  );
}

function EdgeLine({
  e,
  nodes,
  active,
}: {
  e: VizEdge;
  nodes: Map<string, VizNode>;
  active: boolean;
}) {
  const a = nodes.get(e.from);
  const b = nodes.get(e.to);
  if (!a || !b) return null;
  const stroke = active ? 'var(--viz-active-stroke)' : 'var(--viz-stroke)';
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return (
    <g>
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={stroke}
        strokeWidth={active ? 2.5 : 1.5}
        markerEnd={e.directed ? 'url(#viz-arrow)' : undefined}
      />
      {e.label ? (
        <text x={mx} y={my - 6} textAnchor="middle" fontSize={10} fill="var(--viz-muted)">
          {e.label}
        </text>
      ) : null}
    </g>
  );
}

function GridView({ frame }: { frame: VizFrame }) {
  if (!frame.grid?.length) return null;
  const hi = new Set((frame.gridHighlight || []).map(([r, c]) => `${r},${c}`));
  return (
    <div className="viz-grid" role="img" aria-label="Grid visualization">
      {frame.grid.map((row, r) => (
        <div key={r} className="viz-grid-row">
          {row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`viz-cell${hi.has(`${r},${c}`) ? ' viz-cell-active' : ''}${
                cell === '2' ? ' viz-cell-rotten' : ''
              }${cell === '0' ? ' viz-cell-empty' : ''}`}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function GraphCanvas({ frame }: { frame: VizFrame }) {
  const nodeMap = useMemo(() => new Map((frame.nodes || []).map((n) => [n.id, n])), [frame.nodes]);
  const active = new Set(frame.active || []);
  const visited = new Set(frame.visited || []);
  const activeEdges = new Set(frame.activeEdges || []);

  if (frame.grid?.length) return <GridView frame={frame} />;
  if (!frame.nodes?.length) {
    if (frame.aux && Object.keys(frame.aux).length) {
      return (
        <div className="viz-aux-only">
          {Object.entries(frame.aux).map(([k, v]) => (
            <div key={k}>
              <strong>{k}:</strong> {v}
            </div>
          ))}
        </div>
      );
    }
    return <div className="viz-empty">Empty structure</div>;
  }

  return (
    <svg className="viz-svg" viewBox="0 0 420 280" role="img" aria-label="Algorithm visualization">
      <defs>
        <marker id="viz-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-stroke)" />
        </marker>
      </defs>
      {(frame.edges || []).map((e) => (
        <EdgeLine key={e.id} e={e} nodes={nodeMap} active={activeEdges.has(e.id)} />
      ))}
      {(frame.nodes || []).map((n) => (
        <NodeCircle key={n.id} n={n} active={active.has(n.id)} visited={visited.has(n.id)} />
      ))}
    </svg>
  );
}

function ChipRow({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="viz-chips">
      <span className="viz-chips-label">{label}</span>
      {items.map((x, i) => (
        <span key={`${label}-${i}-${x}`} className="viz-chip">
          {x}
        </span>
      ))}
    </div>
  );
}

export default function AlgoViz({ topicId }: { topicId: string }) {
  const spec = useMemo(() => getVizForTopic(topicId), [topicId]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [topicId]);

  useEffect(() => {
    if (!playing || !spec) return;
    if (idx >= spec.frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setIdx((i) => i + 1), 900);
    return () => window.clearTimeout(t);
  }, [playing, idx, spec]);

  if (!spec) return null;
  const frame = spec.frames[Math.min(idx, spec.frames.length - 1)];

  return (
    <section className="blog-section viz-section">
      <h2>Visualization — {spec.title}</h2>
      <p className="viz-input">
        <strong>Default input</strong> (matches optimal signature):{' '}
        <code>{spec.inputSummary}</code>
      </p>
      <p className="viz-expected">
        <strong>Expected output:</strong> <code>{spec.expectedOutput}</code>
      </p>

      <div className="viz-player">
        <div className="viz-stage">
          <GraphCanvas frame={frame} />
        </div>
        <p className="viz-caption">{frame.caption}</p>

        <ChipRow label="queue" items={frame.queue} />
        <ChipRow label="stack" items={frame.stack} />
        <ChipRow label="output" items={frame.output} />
        {frame.aux ? (
          <div className="viz-aux">
            {Object.entries(frame.aux).map(([k, v]) => (
              <span key={k}>
                <strong>{k}:</strong> {v}
              </span>
            ))}
          </div>
        ) : null}

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
          <button type="button" className="viz-btn viz-btn-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="viz-btn"
            onClick={() => setIdx((i) => Math.min(spec.frames.length - 1, i + 1))}
            disabled={idx >= spec.frames.length - 1}
          >
            Next
          </button>
          <span className="viz-step">
            Step {idx + 1} / {spec.frames.length}
          </span>
        </div>
      </div>
    </section>
  );
}
