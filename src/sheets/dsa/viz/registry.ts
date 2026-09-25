import { buildBellmanFloyd } from './kits/bellmanFloyd';
import { buildBstMutate } from './kits/bstMutate';
import { buildBstWalk } from './kits/bstWalk';
import { buildBridgeScc } from './kits/bridgeScc';
import { buildDijkstra, buildWhyPriorityQueue } from './kits/dijkstra';
import { buildDsu } from './kits/dsu';
import { buildGraphWalk } from './kits/graphWalk';
import { buildGridBfs } from './kits/gridBfs';
import { buildMst } from './kits/mst';
import { buildTopoKahn, buildTopoSortTopic } from './kits/topoKahn';
import { buildTreeBfs } from './kits/treeBfs';
import { buildTreeBuild } from './kits/treeBuild';
import { buildTreeDfs } from './kits/treeDfs';
import { buildTreeMorris } from './kits/treeMorris';
import { buildTreePaths } from './kits/treePaths';
import { buildTreeViews } from './kits/treeViews';
import { buildTrieBinary } from './kits/trieBinary';
import { buildTrieString } from './kits/trieString';
import type { VizSpec } from './types';

type Builder = () => VizSpec | VizSpec[];

/** Topic id → frame builder (default sample data baked into each kit). */
const REGISTRY: Record<string, Builder> = {
  // —— Wave 1 ——
  prrdrtrvrslfbinrytr: () => buildTreeDfs('preorder'),
  itrtivprrdrtrvrslfbinrytr: () => buildTreeDfs('preorder'),
  inrdrtrvrslfbinrytr: () => buildTreeDfs('inorder'),
  itrtivinrdrtrvrslfbinrytr: () => buildTreeDfs('inorder'),
  pstrdrtrvrslfbinrytr: () => buildTreeDfs('postorder'),
  pstrdrtrvrslfbinrytrsing2stck: () => buildTreeDfs('postorder'),
  pstrdrtrvrslfbinrytrsing1stck: () => buildTreeDfs('postorder'),
  binrytrtrvrslsinbinrytr: () => buildTreeDfs('preorder'),

  lvlrdrtrvrsllvlrdrtrvrslinspirlfrm: () => buildTreeBfs(),
  zigzgtrvrslfbinrytr: () => buildTreeBfs(),
  rightlftviwfbinrytr: () => buildTreeBfs(),
  mximmwidthfbinrytr: () => buildTreeBfs(),

  bfs: () => buildGraphWalk('bfs'),
  dfs: () => buildGraphWalk('dfs'),
  cnnctdcmpnntslgicxplntin: () => buildGraphWalk('components'),
  nmbrfprvincsltcd: () => buildGraphWalk('components'),
  cnnctdcmpnntsprblminmtrix: () => buildGraphWalk('components'),
  biprtitgrphdfs: () => buildGraphWalk('bipartite'),
  cycldtctininndirctdgrphdfs: () => buildGraphWalk('dfs'),
  cycldtctininnirctdgrphbfs: () => buildGraphWalk('bfs'),

  rttnrngs: () => buildGridBfs('rotten'),
  fldfill: () => buildGridBfs('flood'),
  '01mtrixbfsprblm': () => buildGridBfs('zeroOne'),
  nmbrfnclvsfldfillimplmnttinmltisrc: () => buildGridBfs('flood'),
  srrnddrginsdfs: () => buildGridBfs('flood'),

  djisktrslgrithm: () => buildDijkstra(),
  whyprirityqissdindjisktrslgrithm: () => buildWhyPriorityQueue(),
  ntwrkdlytim: () => buildDijkstra(),
  pthwithminimmffrt: () => buildDijkstra(),
  shrtstpthingwithnitwights: () => buildGraphWalk('bfs'),

  tpsrt: () => buildTopoSortTopic(),
  khnslgrithm: () => buildTopoKahn('kahn'),
  crsschdli: () => buildTopoKahn('topo'),
  crsschdlii: () => buildTopoKahn('topo'),
  lindictinry: () => buildTopoKahn('topo'),
  findvntlsfstts: () => buildTopoKahn('topo'),
  cycldtctinindirctdgrphbfs: () => buildTopoKahn('cycle'),

  insrtgivnndinbinrysrchtr: () => buildBstMutate('insert'),
  dltndinbinrysrchtr: () => buildBstMutate('delete'),
  srchinbinrysrchtr: () => buildBstMutate('search'),
  findminmxinbst: () => buildBstMutate('search'),

  implmnttriinsrtsrchstrtswith: () => buildTrieString(),
  implmnttri2prfixtr: () => buildTrieString(),
  lngststringwithllprfixs: () => buildTrieString(),

  // —— Wave 2 ——
  tpviwfbinrytr: () => buildTreeViews('top'),
  bttmviwfbinrytr: () => buildTreeViews('bottom'),
  vrticlrdrtrvrslfbinrytr: () => buildTreeViews('vertical'),
  bndrytrvrslfbinrytr: () => buildTreeViews('boundary'),

  rttndpthinbinrytr: () => buildTreePaths('rootToNode'),
  lcinbinrytr: () => buildTreePaths('lca'),
  printllthndstdistncfkinbinrytr: () => buildTreePaths('nodesAtK'),
  minimmtimtkntbrnthbinrytrfrmnd: () => buildTreePaths('burn'),

  cnstrctbinrytrfrminrdrndprrdr: () => buildTreeBuild('inPre'),
  cnstrctthbinrytrfrmpstrdrndinrdrtrvrsl: () => buildTreeBuild('inPost'),
  rqirmntsnddtcnstrctniqbinrytrthry: () => buildTreeBuild('inPre'),

  cilinbinrysrchtr: () => buildBstWalk('ceil'),
  flrinbinrysrchtr: () => buildBstWalk('floor'),
  findkthsmllstlrgstlmntinbst: () => buildBstWalk('kth'),
  chckiftrisbstrbt: () => buildBstWalk('validate'),
  lcinbinrysrchtr: () => buildBstWalk('lca'),
  inrdrsccssrprdcssrinbst: () => buildBstWalk('successor'),
  twsminbstchckifthrxistspirwithsmk: () => buildBstWalk('kth'),

  disjintstninbyrnk: () => buildDsu(),
  disjintstninbysiz: () => buildDsu(),
  nmbrfprtinstmkntwrkcnnctd: () => buildDsu(),
  mststnsrmvdwithsmrwsrclmns: () => buildDsu(),
  ccntsmrg: () => buildDsu(),
  nmbrfislndii: () => buildDsu(),
  mkinglrgislnd: () => buildDsu(),

  minimmspnningtr: () => buildMst('kruskal'),
  krsklslgrithm: () => buildMst('kruskal'),
  primslgrithm: () => buildMst('prim'),

  bitprrqisitsfrtriprblms: () => buildTrieBinary(),
  mximmxrftwnmbrsinnrry: () => buildTrieBinary(),
  mximmxrwithnlmntfrmrry: () => buildTrieBinary(),

  // —— Wave 3 ——
  mrrisinrdrtrvrslfbinrytr: () => buildTreeMorris('inorder'),
  mrrisprrdrtrvrslfbinrytr: () => buildTreeMorris('preorder'),

  bllmnfrdlgrithm: () => buildBellmanFloyd('bellman'),
  flydwrshllgrithm: () => buildBellmanFloyd('floyd'),
  findthcitywiththsmllstnmbrfnighbrsinthrshlddistnc: () => buildBellmanFloyd('floyd'),
  shrtstpthindg: () => buildBellmanFloyd('dagSp'),

  bridgsingrph: () => buildBridgeScc('bridges'),
  rticltinpint: () => buildBridgeScc('articulation'),
  ksrjslgrithm: () => buildBridgeScc('kosaraju'),
};

export function getVizSpecsForTopic(topicId: string): VizSpec[] {
  const build = REGISTRY[topicId];
  if (!build) return [];
  const out = build();
  return Array.isArray(out) ? out : [out];
}

export function getVizForTopic(topicId: string): VizSpec | null {
  return getVizSpecsForTopic(topicId)[0] ?? null;
}

export function vizTopicIds(): string[] {
  return Object.keys(REGISTRY);
}

/** @deprecated use vizTopicIds */
export function wave1TopicIds(): string[] {
  return vizTopicIds();
}
