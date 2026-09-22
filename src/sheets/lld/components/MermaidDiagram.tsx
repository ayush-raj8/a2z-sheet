import { useEffect, useRef } from 'react';

type Props = { chart: string };

export default function MermaidDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!ref.current) return;
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
      });
      const id = `mmd-${Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, chart);
      if (!cancelled && ref.current) ref.current.innerHTML = svg;
    }

    render().catch(() => {
      if (ref.current) ref.current.textContent = 'Diagram failed to render.';
    });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div ref={ref} className="flex justify-center text-zinc-300" />
    </div>
  );
}
