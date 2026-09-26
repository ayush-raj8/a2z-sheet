import type { QueueStructure } from '../engine/types';

export default function QueueViewer({ state }: { state: QueueStructure }) {
  return (
    <div className="viz-struct viz-struct-queue">
      <div className="viz-struct-label">{state.label || 'queue'} (front→)</div>
      <div className="viz-queue-row">
        {!state.values.length ? <div className="viz-struct-empty">∅</div> : null}
        {state.values.map((v, i) => (
          <div key={`${v}-${i}`} className={`viz-queue-cell${i === 0 ? ' front' : ''}`}>
            {String(v)}
          </div>
        ))}
      </div>
    </div>
  );
}
