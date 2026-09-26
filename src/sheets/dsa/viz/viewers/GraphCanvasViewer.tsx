import { useMemo } from 'react';
import type { ExecutionStep } from '../engine/types';

type Canvas = NonNullable<ExecutionStep['canvas']>;
type Node = NonNullable<Canvas['nodes']>[number];
type Edge = NonNullable<Canvas['edges']>[number];

function NodeCircle({ n, active, visited }: { n: Node; active: boolean; visited: boolean }) {
  const fill = active ? 'var(--viz-active)' : visited ? 'var(--viz-visited)' : 'var(--viz-node)';
  const stroke = active ? 'var(--viz-active-stroke)' : 'var(--viz-stroke)';
  return (
    <g>
      <circle cx={n.x} cy={n.y} r={18} fill={fill} stroke={stroke} strokeWidth={2} />
      <text
        x={n.x}
        y={n.sub ? n.y - 2 : n.y + 4}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="var(--viz-label)"
      >
        {n.label}
      </text>
      {n.sub ? (
        <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize={9} fill="var(--viz-muted)">
          {n.sub}
        </text>
      ) : null}
    </g>
  );
}

function EdgeLine({
  e,
  nodes,
  active,
}: {
  e: Edge;
  nodes: Map<string, Node>;
  active: boolean;
}) {
  const a = nodes.get(e.from);
  const b = nodes.get(e.to);
  if (!a || !b) return null;
  const stroke = active ? 'var(--viz-active-stroke)' : 'var(--viz-stroke)';
  const r = 18;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const x1 = a.x + ux * r;
  const y1 = a.y + uy * r;
  const x2 = b.x - ux * r;
  const y2 = b.y - uy * r;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={active ? 2.5 : 1.5}
        markerEnd={e.directed ? (active ? 'url(#viz-arrow-active)' : 'url(#viz-arrow)') : undefined}
      />
      {e.label ? (
        <text x={mx} y={my - 6} textAnchor="middle" fontSize={10} fill="var(--viz-muted)">
          {e.label}
        </text>
      ) : null}
    </g>
  );
}

function GridView({ canvas }: { canvas: Canvas }) {
  if (!canvas.grid?.length) return null;
  const hi = new Set((canvas.gridHighlight || []).map(([r, c]) => `${r},${c}`));
  return (
    <div className="viz-grid" role="img" aria-label="Grid visualization">
      {canvas.grid.map((row, r) => (
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

export default function GraphCanvasViewer({ canvas }: { canvas?: Canvas }) {
  const nodeMap = useMemo(
    () => new Map((canvas?.nodes || []).map((n) => [n.id, n])),
    [canvas?.nodes],
  );
  if (!canvas) return <div className="viz-empty">No canvas</div>;
  if (canvas.grid?.length) return <GridView canvas={canvas} />;
  if (!canvas.nodes?.length) return <div className="viz-empty">—</div>;

  const active = new Set(canvas.active || []);
  const visited = new Set(canvas.visited || []);
  const activeEdges = new Set(canvas.activeEdges || []);

  return (
    <svg className="viz-svg" viewBox="0 0 420 280" role="img" aria-label="Algorithm visualization">
      <defs>
        <marker id="viz-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-stroke)" />
        </marker>
        <marker id="viz-arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--viz-active-stroke)" />
        </marker>
      </defs>
      {(canvas.edges || []).map((e) => (
        <EdgeLine key={e.id} e={e} nodes={nodeMap} active={activeEdges.has(e.id)} />
      ))}
      {(canvas.nodes || []).map((n) => (
        <NodeCircle key={n.id} n={n} active={active.has(n.id)} visited={visited.has(n.id)} />
      ))}
    </svg>
  );
}
