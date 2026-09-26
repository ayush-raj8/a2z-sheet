import type { HeapStructure } from '../engine/types';

export default function HeapViewer({ state }: { state: HeapStructure }) {
  const hi = new Set(state.highlight || []);
  return (
    <div className="viz-struct viz-struct-heap">
      <div className="viz-struct-label">
        {state.label || (state.min === false ? 'max-heap' : 'min-heap')}
      </div>
      <div className="viz-heap-row">
        {!state.values.length ? <div className="viz-struct-empty">∅</div> : null}
        {state.values.map((v, i) => (
          <div key={`${v}-${i}`} className={`viz-heap-cell${hi.has(i) ? ' active' : ''}`}>
            <span className="viz-heap-idx">{i}</span>
            <span>{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
