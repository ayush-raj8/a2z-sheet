/**
 * Core execution model for A2Z visualizations.
 *
 * Architecture:
 *   runners (per-topic) → ExecutionTimeline → AlgoPlayer → reusable viewers
 *
 * Authoring a runner:
 * 1. Write canonical `source.code` (Python preferred).
 * 2. Emit steps with a single `line` (program counter) — one line at a time.
 * 3. Attach `structures` snapshots (array/stack/heap/…) for side panels.
 * 4. Register the runner in runners/index and coverage registry.
 */

export type VisualizationType =
  | 'ARRAY'
  | 'STRING'
  | 'POINTER'
  | 'WINDOW'
  | 'STACK'
  | 'QUEUE'
  | 'DEQUE'
  | 'HEAP'
  | 'LINKED_LIST'
  | 'TREE'
  | 'GRAPH'
  | 'RECURSION'
  | 'CALL_STACK'
  | 'DP_TABLE'
  | 'MATRIX'
  | 'HASH_MAP'
  | 'SET'
  | 'UNION_FIND'
  | 'BITSET'
  | 'VARS'
  | 'CUSTOM';

/** Canonical traced source — kit/runner owned. */
export type TracedSource = {
  language: string;
  title?: string;
  code: string;
};

export type ArrayStructure = {
  kind: 'array';
  id?: string;
  label?: string;
  values: Array<string | number | null>;
  /** highlighted indices */
  highlight?: number[];
  pointers?: Record<string, number>; // name → index
  window?: { lo: number; hi: number };
};

export type StackStructure = {
  kind: 'stack';
  id?: string;
  label?: string;
  values: Array<string | number>;
  /** top is last element */
};

export type QueueStructure = {
  kind: 'queue';
  id?: string;
  label?: string;
  values: Array<string | number>;
  /** front is first */
};

export type HeapStructure = {
  kind: 'heap';
  id?: string;
  label?: string;
  /** min-heap by default; display as flat array + optional tree order */
  values: Array<string | number>;
  min?: boolean;
  highlight?: number[];
};

export type MapStructure = {
  kind: 'map';
  id?: string;
  label?: string;
  entries: Array<[string, string | number]>;
  highlightKeys?: string[];
};

export type SetStructure = {
  kind: 'set';
  id?: string;
  label?: string;
  values: Array<string | number>;
  highlight?: Array<string | number>;
};

export type VarsStructure = {
  kind: 'vars';
  id?: string;
  label?: string;
  entries: Record<string, string | number | boolean | null>;
};

export type CallStackStructure = {
  kind: 'callStack';
  id?: string;
  label?: string;
  frames: string[];
};

export type MatrixStructure = {
  kind: 'matrix';
  id?: string;
  label?: string;
  rows: string[][];
  highlight?: Array<[number, number]>;
};

export type GraphOverlay = {
  kind: 'graph';
  id?: string;
  label?: string;
  /** reuse canvas; overlay is metadata for chips */
  active?: string[];
  visited?: string[];
  activeEdges?: string[];
};

export type StructureState =
  | ArrayStructure
  | StackStructure
  | QueueStructure
  | HeapStructure
  | MapStructure
  | SetStructure
  | VarsStructure
  | CallStackStructure
  | MatrixStructure
  | GraphOverlay;

/** One synchronized tick of the algorithm. */
export type ExecutionStep = {
  /** Human caption */
  caption: string;
  /** 1-indexed primary program counter — ONE line at a time */
  line: number;
  /** Optional short event tag e.g. "relax", "swap" */
  event?: string;
  /** Side-panel structures for this step */
  structures?: StructureState[];
  /** Free-form aux (legacy / chips) */
  aux?: Record<string, string>;
  /** Canvas payload — graph/tree/linked-list nodes (optional) */
  canvas?: {
    nodes?: Array<{ id: string; label: string; sub?: string; x: number; y: number }>;
    edges?: Array<{
      id: string;
      from: string;
      to: string;
      label?: string;
      directed?: boolean;
    }>;
    active?: string[];
    visited?: string[];
    activeEdges?: string[];
    grid?: string[][];
    gridHighlight?: Array<[number, number]>;
    queue?: string[];
    stack?: string[];
    output?: string[];
  };
};

export type AlgorithmMeta = {
  visualizationTypes: VisualizationType[];
  importantVariables?: string[];
  importantEvents?: string[];
  explanationSteps?: string[];
};

export type ExecutionTimeline = {
  id: string;
  title: string;
  inputSummary: string;
  expectedOutput: string;
  source: TracedSource;
  meta: AlgorithmMeta;
  steps: ExecutionStep[];
};

export type AlgorithmRunner = () => ExecutionTimeline | ExecutionTimeline[];

export type CoverageStatus = 'implemented' | 'planned' | 'skip' | 'concept';

export type CoverageEntry = {
  problemId: string;
  topicNumber: number;
  title: string;
  category: string;
  subcategory: string;
  status: CoverageStatus;
  visualizationTypes: VisualizationType[];
  runner?: string;
  reason?: string;
};
