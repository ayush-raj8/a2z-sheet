type Props = {
  title?: string;
  children: React.ReactNode;
  tone?: 'default' | 'warn' | 'tip' | 'interview';
};

const tones = {
  default: 'border-zinc-800 bg-zinc-950',
  warn: 'border-amber-900/60 bg-amber-950/20',
  tip: 'border-emerald-900/50 bg-emerald-950/20',
  interview: 'border-sky-900/50 bg-sky-950/20',
};

export default function Callout({ title, children, tone = 'default' }: Props) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${tones[tone]}`}>
      {title ? <p className="mb-1 text-sm font-medium text-zinc-200">{title}</p> : null}
      <div className="text-sm leading-relaxed text-zinc-300">{children}</div>
    </div>
  );
}
