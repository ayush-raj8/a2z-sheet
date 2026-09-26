import type { VarsStructure } from '../engine/types';

export default function VarsViewer({ state }: { state: VarsStructure }) {
  const entries = Object.entries(state.entries);
  return (
    <div className="viz-struct viz-struct-vars">
      <div className="viz-struct-label">{state.label || 'vars'}</div>
      <div className="viz-vars-list">
        {!entries.length ? <div className="viz-struct-empty">—</div> : null}
        {entries.map(([k, v]) => (
          <div key={k} className="viz-var-row">
            <strong>{k}</strong>
            <span>{v == null ? 'null' : String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
