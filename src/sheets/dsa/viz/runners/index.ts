/**
 * Topic id → algorithm runner(s).
 * New runners live under ./ ; legacy kits are adapted via legacyAdapter.
 */
import { legacySpecsToTimelines } from '../engine/legacyAdapter';
import type { AlgorithmRunner, ExecutionTimeline } from '../engine/types';
import { getVizSpecsForTopic as getLegacySpecs } from '../registry';
import { runBellmanFord } from './bellmanFord';
import { runBinarySearch } from './binarySearch';
import { runCountDigits } from './countDigits';
import { runDagShortest } from './dagShortest';
import { runDijkstra, runWhyPriorityQueue } from './dijkstra';
import { runLcs } from './lcs';
import { runNextGreaterElement } from './nextGreater';
import { runSlidingWindowK } from './slidingWindow';
import { runTopoDfs } from './topoDfs';
import { runUnitWeightShortest } from './unitWeightBfs';
import { runTwoSum } from './twoSum';
import { runValidParentheses } from './validParentheses';

type Runner = AlgorithmRunner;

/** First-class runners (new engine, line-by-line + structures). */
const RUNNERS: Record<string, Runner> = {
  // Maths
  cntdigits: () => runCountDigits(),

  // Graphs — shortest paths
  djisktrslgrithm: () => runDijkstra(),
  whyprirityqissdindjisktrslgrithm: () => runWhyPriorityQueue(),
  ntwrkdlytim: () => runDijkstra(),
  pthwithminimmffrt: () => runDijkstra(),
  bllmnfrdlgrithm: () => runBellmanFord(),
  shrtstpthindg: () => runDagShortest(),
  shrtstpthingwithnitwights: () => runUnitWeightShortest(),

  // Graphs — topo (3-color DFS)
  tpsrt: () => runTopoDfs(),

  // Binary search family (shared runner)
  binrysrchtfindxinsrtdrry: () => runBinarySearch(),
  implmntlwrbnd: () => runBinarySearch([1, 2, 2, 3, 3, 5], 3),
  implmntpprbnd: () => runBinarySearch([1, 2, 2, 3, 3, 5], 3),
  srchinrttdsrtdrryi: () => runBinarySearch([4, 5, 6, 7, 0, 1, 2], 0),
  srchinrttdsrtdrryii: () => runBinarySearch([2, 5, 6, 0, 0, 1, 2], 0),
  findminimminrttdsrtdrry: () => runBinarySearch([3, 4, 5, 1, 2], 1),
  findpklmnt: () => runBinarySearch([1, 2, 3, 1], 3),

  // Arrays / hash
  '2smprblm': () => runTwoSum(),

  // Stack / monotonic
  vlidprnthsischckr: () => runValidParentheses(),
  nxtgrtrlmnt: () => runNextGreaterElement(),
  nxtgrtrlmnt2: () => runNextGreaterElement([1, 2, 1]),
  slidingwindwmximm: () => runSlidingWindowK([1, 3, -1, -3, 5, 3, 6, 7], 3),

  // DP
  lngstcmmnsbsqncdp25: () => runLcs(),
  printlngstcmmnsbsqncdp26: () => runLcs(),
};

function normalize(out: ExecutionTimeline | ExecutionTimeline[]): ExecutionTimeline[] {
  return Array.isArray(out) ? out : [out];
}

/**
 * Resolve timelines for a topic:
 * 1) First-class runner if present
 * 2) Else legacy VizSpec kit adapted into ExecutionTimeline
 */
export function getTimelinesForTopic(topicId: string): ExecutionTimeline[] {
  const runner = RUNNERS[topicId];
  if (runner) return normalize(runner());

  const legacy = getLegacySpecs(topicId);
  if (!legacy.length) return [];
  return legacySpecsToTimelines(legacy.length === 1 ? legacy[0] : legacy);
}

export function runnerTopicIds(): string[] {
  return Object.keys(RUNNERS);
}

export function hasFirstClassRunner(topicId: string): boolean {
  return Boolean(RUNNERS[topicId]);
}

/** Exported for coverage generator sync checks. */
export function firstClassRunnerIds(): string[] {
  return Object.keys(RUNNERS);
}
