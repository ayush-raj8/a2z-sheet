import { useState } from 'react';

type Props = {
  title?: string;
  code: string;
  language?: string;
};

export default function CodeBlock({ title, code, language = 'java' }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = code.split('\n').length;
  const collapsed = !expanded && lines > 18;
  const shown = collapsed ? code.split('\n').slice(0, 14).join('\n') + '\n…' : code;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#0a0a0a]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 uppercase tracking-wide text-zinc-300">
            {language}
          </span>
          {title ? <span className="truncate">{title}</span> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {lines > 18 ? (
            <button type="button" className="hover:text-zinc-200" onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          ) : null}
          <button type="button" className="hover:text-zinc-200" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed text-zinc-200">
        <code>{shown}</code>
      </pre>
    </div>
  );
}
