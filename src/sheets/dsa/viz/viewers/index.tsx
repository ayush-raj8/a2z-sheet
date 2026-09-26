import type { StructureState } from '../engine/types';
import ArrayViewer from './ArrayViewer';
import CallStackViewer from './CallStackViewer';
import HashMapViewer from './HashMapViewer';
import HeapViewer from './HeapViewer';
import MatrixViewer from './MatrixViewer';
import QueueViewer from './QueueViewer';
import SetViewer from './SetViewer';
import StackViewer from './StackViewer';
import VarsViewer from './VarsViewer';

export function StructureStrip({ structures }: { structures?: StructureState[] }) {
  if (!structures?.length) return null;
  return (
    <div className="viz-structures" aria-label="Algorithm structures">
      {structures.map((s, i) => {
        const key = `${s.kind}-${s.id || s.label || i}`;
        switch (s.kind) {
          case 'array':
            return <ArrayViewer key={key} state={s} />;
          case 'stack':
            return <StackViewer key={key} state={s} />;
          case 'queue':
            return <QueueViewer key={key} state={s} />;
          case 'heap':
            return <HeapViewer key={key} state={s} />;
          case 'map':
            return <HashMapViewer key={key} state={s} />;
          case 'set':
            return <SetViewer key={key} state={s} />;
          case 'vars':
            return <VarsViewer key={key} state={s} />;
          case 'callStack':
            return <CallStackViewer key={key} state={s} />;
          case 'matrix':
            return <MatrixViewer key={key} state={s} />;
          case 'graph':
            return null; // canvas handles graph
          default:
            return null;
        }
      })}
    </div>
  );
}

export { default as CodeViewer } from './CodeViewer';
export { default as GraphCanvasViewer } from './GraphCanvasViewer';
