import coverageData from './registry.json';
import type { CoverageEntry } from '../engine/types';

export type CoverageFile = {
  generatedAt: string;
  summary: {
    total: number;
    implemented: number;
    planned: number;
    skip: number;
    firstClass: number;
    legacyKit: number;
  };
  entries: CoverageEntry[];
};

export const vizCoverage = coverageData as CoverageFile;

export function coverageFor(problemId: string): CoverageEntry | undefined {
  return vizCoverage.entries.find((e) => e.problemId === problemId);
}

export function coverageSummary() {
  return vizCoverage.summary;
}
