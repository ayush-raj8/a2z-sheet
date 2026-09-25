export type VizKitId =
  | 'treeDfs'
  | 'treeBfs'
  | 'graphWalk'
  | 'gridBfs'
  | 'dijkstra'
  | 'topoKahn'
  | 'bstMutate'
  | 'trieString'
  | 'treeViews'
  | 'treePaths'
  | 'treeBuild'
  | 'bstWalk'
  | 'dsu'
  | 'mst'
  | 'trieBinary'
  | 'treeMorris'
  | 'bellmanFloyd'
  | 'bridgeScc';

export type TreeMode = 'preorder' | 'inorder' | 'postorder';
export type GraphMode = 'bfs' | 'dfs' | 'bipartite' | 'components';
export type GridMode = 'rotten' | 'flood' | 'zeroOne';
export type BstMode = 'insert' | 'delete' | 'search';
export type TreeViewMode = 'top' | 'bottom' | 'vertical' | 'boundary';
export type TreePathMode = 'rootToNode' | 'lca' | 'nodesAtK' | 'burn';
export type TreeBuildMode = 'inPre' | 'inPost';
export type BstWalkMode = 'ceil' | 'floor' | 'kth' | 'validate' | 'lca' | 'successor';
export type MstMode = 'prim' | 'kruskal';
export type MorrisMode = 'inorder' | 'preorder';
export type BellmanFloydMode = 'bellman' | 'floyd' | 'dagSp';
export type BridgeSccMode = 'bridges' | 'articulation' | 'kosaraju';

export type VizNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type VizEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  directed?: boolean;
};

export type VizFrame = {
  caption: string;
  nodes?: VizNode[];
  edges?: VizEdge[];
  /** node ids */
  active?: string[];
  visited?: string[];
  /** edge ids */
  activeEdges?: string[];
  queue?: string[];
  stack?: string[];
  output?: string[];
  /** key-value strip under the canvas */
  aux?: Record<string, string>;
  /** optional grid overlay (cell values as strings) */
  grid?: string[][];
  gridHighlight?: Array<[number, number]>;
};

export type VizSpec = {
  kit: VizKitId;
  title: string;
  /** Human-readable default input matching optimal code signatures */
  inputSummary: string;
  /** Expected result from running optimal algo on the default input */
  expectedOutput: string;
  frames: VizFrame[];
};
