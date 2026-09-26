import type { StackStructure } from '../engine/types';

export default function StackViewer({ state }: { state: StackStructure }) {
  const values = state.values;
  return (
    <div className="viz-struct viz-struct-stack">
      <div className="viz-struct-label">{state.label || 'stack'} (top↑)</div>
      <div className="viz-stack-col">
        {!values.length ? <div className="viz-struct-empty">∅</div> : null}
        {[...values].reverse().map((v, i) => (
          <div key={`${v}-${i}`} className={`viz-stack-cell${i === 0 ? ' top' : ''}`}>
            {String(v)}
          </div>
        ))}
      </div>
    </div>
  );
}
