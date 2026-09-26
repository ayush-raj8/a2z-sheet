import { useEffect, useMemo, useRef } from 'react';
import { formatPcLabel, splitSourceLines } from '../engine/timeline';
import type { TracedSource } from '../engine/types';

export default function CodeViewer({
  source,
  line,
  event,
}: {
  source: TracedSource;
  line: number;
  event?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => splitSourceLines(source.code), [source.code]);
  const label = formatPcLabel(line, event);

  useEffect(() => {
    if (!line || !scrollerRef.current) return;
    const target = scrollerRef.current.querySelector<HTMLElement>(`[data-line="${line}"]`);
    target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [line]);

  return (
    <div className="viz-source">
      {source.title ? <div className="viz-source-title">{source.title}</div> : null}
      <div className="viz-source-scroll" ref={scrollerRef}>
        <pre className="viz-source-pre" data-lang={source.language}>
          <code>
            {lines.map((text, i) => {
              const lineNo = i + 1;
              return (
                <div
                  key={lineNo}
                  data-line={lineNo}
                  className={`viz-source-line${lineNo === line ? ' active' : ''}`}
                >
                  <span className="viz-source-gutter">{lineNo}</span>
                  <span className="viz-source-text">{text.length ? text : ' '}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
      {label ? <div className="viz-source-pc">{label}</div> : null}
    </div>
  );
}
