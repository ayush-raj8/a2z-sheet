/**
 * Bridge legacy VizSpec kits → ExecutionTimeline so existing wave kits keep working
 * while runners migrate to the new model.
 */
import { splitSourceLines } from './timeline';
import type { ExecutionStep, ExecutionTimeline, StructureState, VisualizationType } from './types';
import type { VizFrame, VizSpec } from '../types';

function inferTypes(spec: VizSpec): VisualizationType[] {
  const types = new Set<VisualizationType>();
  const f0 = spec.frames[0];
  if (f0?.nodes?.length) {
    if (f0.edges?.some((e) => e.directed) || /graph|dijkstra|topo|bellman|floyd|mst|dsu|bridge/i.test(spec.kit)) {
      types.add('GRAPH');
    } else if (/tree|bst|trie/i.test(spec.kit)) {
      types.add('TREE');
    } else {
      types.add('GRAPH');
    }
  }
  if (f0?.grid?.length) types.add('MATRIX');
  if (f0?.queue?.length || spec.frames.some((f) => f.queue?.length)) types.add('QUEUE');
  if (f0?.stack?.length || spec.frames.some((f) => f.stack?.length)) types.add('STACK');
  if (spec.source) types.add('VARS');
  if (!types.size) types.add('CUSTOM');
  return [...types];
}

function structuresFromFrame(frame: VizFrame): StructureState[] {
  const out: StructureState[] = [];
  if (frame.queue?.length) {
    out.push({ kind: 'queue', label: 'queue', values: frame.queue });
  }
  if (frame.stack?.length) {
    out.push({ kind: 'stack', label: 'stack', values: frame.stack });
  }
  if (frame.output?.length) {
    out.push({ kind: 'array', label: 'output', values: frame.output });
  }
  if (frame.aux && Object.keys(frame.aux).length) {
    const entries: Record<string, string> = {};
    for (const [k, v] of Object.entries(frame.aux)) entries[k] = v;
    out.push({ kind: 'vars', label: 'state', entries });
  }
  return out;
}

/** Map a legacy frame to a single PC line (prefer explicit line, else step mid, else 1). */
function primaryLine(spec: VizSpec, frame: VizFrame): number {
  if (frame.lines?.length) return frame.lines[0];
  if (frame.step && spec.source?.steps?.[frame.step] != null) {
    const r = spec.source.steps[frame.step];
    return typeof r === 'number' ? r : r[0];
  }
  return 1;
}

export function legacySpecToTimeline(spec: VizSpec, id: string = spec.kit): ExecutionTimeline {
  const code = spec.source?.code || `# ${spec.title}\n# (no traced source yet)\npass`;
  const source = {
    language: spec.source?.language || 'python',
    title: spec.source?.title || spec.title,
    code,
  };
  const lineCount = splitSourceLines(code).length || 1;

  const steps: ExecutionStep[] = spec.frames.map((frame) => {
    const line = Math.min(Math.max(1, primaryLine(spec, frame)), lineCount);
    return {
      caption: frame.caption,
      line,
      event: frame.step,
      structures: structuresFromFrame(frame),
      aux: frame.aux,
      canvas: {
        nodes: frame.nodes,
        edges: frame.edges,
        active: frame.active,
        visited: frame.visited,
        activeEdges: frame.activeEdges,
        grid: frame.grid,
        gridHighlight: frame.gridHighlight,
        queue: frame.queue,
        stack: frame.stack,
        output: frame.output,
      },
    };
  });

  return {
    id,
    title: spec.title,
    inputSummary: spec.inputSummary,
    expectedOutput: spec.expectedOutput,
    source,
    meta: { visualizationTypes: inferTypes(spec) },
    steps,
  };
}

export function legacySpecsToTimelines(specs: VizSpec | VizSpec[]): ExecutionTimeline[] {
  const list = Array.isArray(specs) ? specs : [specs];
  return list.map((s, i) => legacySpecToTimeline(s, `${s.kit}-${i}`));
}
