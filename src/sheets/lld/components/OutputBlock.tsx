type Props = { output: string; title?: string };

export default function OutputBlock({ output, title = 'Output' }: Props) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-3 py-2 text-xs uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] text-emerald-300/90 whitespace-pre-wrap">
        {output}
      </pre>
    </div>
  );
}
