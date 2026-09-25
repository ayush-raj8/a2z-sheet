import indexData from '../content/companies/index.json';
import bridgeData from '../content/companies/bridge.json';

export type CompanyWindowId = '30d' | '3m' | '6m' | '6m+' | 'all';

export type CompanyIndexEntry = {
  slug: string;
  name: string;
  problemCount: number;
  counts: Record<string, number>;
  a2zOverlap: number;
};

export type CompanyProblem = {
  title: string;
  difficulty: string;
  frequency: number;
  acceptance: number;
  lcSlug: string;
  lcUrl: string;
  topics: string[];
  windows: string[];
  a2zIds: string[];
};

export type CompanyDetail = {
  slug: string;
  name: string;
  counts: Record<string, number>;
  problems: CompanyProblem[];
};

export type A2zCompanyTag = {
  slug: string;
  name: string;
  frequency: number;
};

type BridgeFile = {
  generatedAt: string;
  a2zWithCompanies: number;
  lcSlugsMappedToA2z: number;
  byA2zId: Record<string, A2zCompanyTag[]>;
  /** Full reverse index: company slug → A2Z topic ids */
  byCompanySlug?: Record<string, string[]>;
  byLcSlug: Record<
    string,
    { a2zIds: string[]; companies: A2zCompanyTag[] }
  >;
};

type IndexFile = {
  generatedAt: string;
  companyCount: number;
  problemRows: number;
  windows: Array<{ id: string; label: string; order: number }>;
  companies: CompanyIndexEntry[];
};

export const companyIndex = indexData as IndexFile;
export const companyBridge = bridgeData as BridgeFile;

const companyLoaders = import.meta.glob('../content/companies/by-slug/*.json') as Record<
  string,
  () => Promise<{ default: CompanyDetail } | CompanyDetail>
>;

export function getCompaniesForA2z(topicId: string): A2zCompanyTag[] {
  return companyBridge.byA2zId[topicId] || [];
}

export function a2zIdsForCompanyFilter(companySlug: string): Set<string> {
  const fromIndex = companyBridge.byCompanySlug?.[companySlug];
  if (fromIndex?.length) return new Set(fromIndex);
  const ids = new Set<string>();
  for (const [a2zId, list] of Object.entries(companyBridge.byA2zId)) {
    if (list.some((c) => c.slug === companySlug)) ids.add(a2zId);
  }
  return ids;
}

/** Companies that appear on at least one A2Z-mapped problem — for sheet filter. */
export function companiesOnA2zSheet(): Array<{ slug: string; name: string; count: number }> {
  if (companyBridge.byCompanySlug) {
    const nameBySlug = new Map(companyIndex.companies.map((c) => [c.slug, c.name]));
    return Object.entries(companyBridge.byCompanySlug)
      .map(([slug, ids]) => ({
        slug,
        name: nameBySlug.get(slug) || slug,
        count: ids.length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
  const counts = new Map<string, { name: string; count: number }>();
  for (const list of Object.values(companyBridge.byA2zId)) {
    for (const c of list) {
      const prev = counts.get(c.slug);
      if (prev) prev.count += 1;
      else counts.set(c.slug, { name: c.name, count: 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function loadCompany(slug: string): Promise<CompanyDetail | null> {
  const key = `../content/companies/by-slug/${slug}.json`;
  const loader = companyLoaders[key];
  if (!loader) return null;
  const mod = await loader();
  return ('default' in mod ? mod.default : mod) as CompanyDetail;
}

export function difficultyClass(diff: string): string {
  const d = (diff || '').toUpperCase();
  if (d === 'EASY') return 'diff-easy';
  if (d === 'HARD') return 'diff-hard';
  if (d === 'MEDIUM') return 'diff-medium';
  return '';
}

/**
 * Progress key shared with A2Z sheet IndexedDB / import-export.
 * Prefer A2Z topic id when mapped so both pages stay in sync; otherwise `lc:<slug>`.
 */
export function companyProgressId(p: Pick<CompanyProblem, 'lcSlug' | 'a2zIds'>): string {
  return p.a2zIds?.[0] || `lc:${p.lcSlug}`;
}

/**
 * Progress key shared with A2Z IndexedDB / import-export.
 * Prefer A2Z topic id when mapped so sheet + company stay in sync;
 * otherwise `lc:{slug}` for company-only problems.
 */
export function companyProblemProgressId(p: Pick<CompanyProblem, 'lcSlug' | 'a2zIds'>): string {
  return p.a2zIds?.[0] || `lc:${p.lcSlug}`;
}
