import type { DsaBlog } from './blogTypes';

/** Non-eager glob → one network chunk per topic, loaded only when opened. */
const blogModules = import.meta.glob('./blogs/*.json') as Record<
  string,
  () => Promise<{ default: DsaBlog }>
>;

export function hasBlog(id: string): boolean {
  return Boolean(blogModules[`./blogs/${id}.json`]);
}

export async function loadBlog(id: string): Promise<DsaBlog | null> {
  const loader = blogModules[`./blogs/${id}.json`];
  if (!loader) return null;
  const mod = await loader();
  return mod.default;
}

export function blogIds(): string[] {
  return Object.keys(blogModules).map((path) => path.replace('./blogs/', '').replace('.json', ''));
}
