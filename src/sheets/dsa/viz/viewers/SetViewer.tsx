import type { SetStructure } from '../engine/types';

export default function SetViewer({ state }: { state: SetStructure }) {
  const hi = new Set((state.highlight || []).map(String));
  return (
    <div className="viz-struct viz-struct-set">
      <div className="viz-struct-label">{state.label || 'set'}</div>
      <div className="viz-set-row">
        {!state.values.length ? <div className="viz-struct-empty">∅</div> : null}
        {state.values.map((v) => (
          <span key={String(v)} className={`viz-set-chip${hi.has(String(v)) ? ' active' : ''}`}>
            {String(v)}
          </span>
        ))}
      </div>
    </div>
  );
}
