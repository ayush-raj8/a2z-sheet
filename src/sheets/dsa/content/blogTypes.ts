export type BlogLang = 'cpp' | 'java' | 'python' | 'go';

export type BlogCode = {
  code: string;
  notes?: string;
};

export type DsaBlog = {
  id: string;
  title: string;
  stepTitle: string;
  subStepTitle: string;
  sourceUrl?: string | null;
  intro: string;
  intuition: string;
  approach: string[];
  complexity: { time: string; space: string };
  pitfalls: string[];
  languages: Record<BlogLang, BlogCode>;
};

export const BLOG_LANG_LABELS: Record<BlogLang, string> = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  go: 'Go',
};

export const BLOG_LANG_ORDER: BlogLang[] = ['cpp', 'java', 'python', 'go'];
