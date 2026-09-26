import type { MapStructure } from '../engine/types';

export default function HashMapViewer({ state }: { state: MapStructure }) {
  const hi = new Set(state.highlightKeys || []);
  return (
    <div className="viz-struct viz-struct-map">
      <div className="viz-struct-label">{state.label || 'map'}</div>
      <div className="viz-map-list">
        {!state.entries.length ? <div className="viz-struct-empty">∅</div> : null}
        {state.entries.map(([k, v]) => (
          <div key={k} className={`viz-map-row${hi.has(k) ? ' active' : ''}`}>
            <span className="viz-map-key">{k}</span>
            <span className="viz-map-arrow">→</span>
            <span className="viz-map-val">{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
