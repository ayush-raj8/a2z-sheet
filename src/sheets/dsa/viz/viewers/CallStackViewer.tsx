import type { CallStackStructure } from '../engine/types';

export default function CallStackViewer({ state }: { state: CallStackStructure }) {
  return (
    <div className="viz-struct viz-struct-callstack">
      <div className="viz-struct-label">{state.label || 'call stack'}</div>
      <div className="viz-stack-col">
        {!state.frames.length ? <div className="viz-struct-empty">∅</div> : null}
        {[...state.frames].reverse().map((f, i) => (
          <div key={`${f}-${i}`} className={`viz-stack-cell${i === 0 ? ' top' : ''}`}>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
