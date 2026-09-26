import type { ArrayStructure } from '../engine/types';

export default function ArrayViewer({ state }: { state: ArrayStructure }) {
  const hi = new Set(state.highlight || []);
  const pointers = state.pointers || {};
  const ptrByIndex = new Map<number, string[]>();
  for (const [name, idx] of Object.entries(pointers)) {
    const list = ptrByIndex.get(idx) || [];
    list.push(name);
    ptrByIndex.set(idx, list);
  }
  const win = state.window;

  return (
    <div className="viz-struct viz-struct-array">
      <div className="viz-struct-label">{state.label || 'array'}</div>
      <div className="viz-array-row">
        {state.values.map((v, i) => {
          const inWin = win ? i >= win.lo && i <= win.hi : false;
          return (
            <div
              key={i}
              className={`viz-array-cell${hi.has(i) ? ' active' : ''}${inWin ? ' in-window' : ''}`}
            >
              <div className="viz-array-idx">{i}</div>
              <div className="viz-array-val">{v == null ? '·' : String(v)}</div>
              {ptrByIndex.get(i)?.length ? (
                <div className="viz-array-ptr">{ptrByIndex.get(i)!.join(',')}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
