import type { MatrixStructure } from '../engine/types';

export default function MatrixViewer({ state }: { state: MatrixStructure }) {
  const hi = new Set((state.highlight || []).map(([r, c]) => `${r},${c}`));
  return (
    <div className="viz-struct viz-struct-matrix">
      <div className="viz-struct-label">{state.label || 'matrix'}</div>
      <div className="viz-grid">
        {state.rows.map((row, r) => (
          <div key={r} className="viz-grid-row">
            {row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`viz-cell${hi.has(`${r},${c}`) ? ' viz-cell-active' : ''}`}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
