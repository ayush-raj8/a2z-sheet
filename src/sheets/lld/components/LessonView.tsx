import { Suspense, lazy } from 'react';
import type { Lesson } from '../lib/types';
import Callout from './Callout';
import CodeBlock from './CodeBlock';
import LessonHeader from './LessonHeader';
import LessonNav from './LessonNav';
import OutputBlock from './OutputBlock';
import QuizCard from './QuizCard';

const MermaidDiagram = lazy(() => import('./MermaidDiagram'));

type Props = {
  lesson: Lesson;
  completed: boolean;
  bookmarked: boolean;
  quizAnswers: Record<string, number>;
  prev?: { id: string; title: string } | null;
  next?: { id: string; title: string } | null;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-medium text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}

export default function LessonView({
  lesson,
  completed,
  bookmarked,
  quizAnswers,
  prev,
  next,
  onToggleComplete,
  onToggleBookmark,
}: Props) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <LessonHeader
        title={lesson.title}
        difficulty={lesson.difficulty}
        importance={lesson.importance}
        completed={completed}
        bookmarked={bookmarked}
        onToggleComplete={onToggleComplete}
        onToggleBookmark={onToggleBookmark}
      />

      <Section title="A. Why does this exist?">
        <p className="text-zinc-300 leading-relaxed">{lesson.why}</p>
      </Section>

      <Section title="B. Core idea">
        <ul className="list-disc space-y-2 pl-5 text-zinc-300">
          {lesson.theory.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      {lesson.mentalModel ? (
        <Section title="C. Mental model">
          <Callout tone="tip">{lesson.mentalModel}</Callout>
        </Section>
      ) : null}

      {lesson.tables?.length ? (
        <Section title="Access summary">
          <div className="space-y-6">
            {lesson.tables.map((table) => (
              <div key={table.title || table.headers.join('|')} className="overflow-x-auto">
                {table.title ? (
                  <h3 className="mb-2 text-base font-medium text-zinc-200">{table.title}</h3>
                ) : null}
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      {table.headers.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 font-medium text-zinc-200 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row.join('|')} className="border-b border-zinc-800">
                        {row.map((cell, i) => (
                          <td
                            key={`${row[0]}-${i}`}
                            className={`px-3 py-2 whitespace-nowrap ${
                              i === 0 ? 'font-medium text-zinc-200' : 'text-zinc-400'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {table.caption ? (
                  <p className="mt-2 text-xs text-zinc-500">{table.caption}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {lesson.mermaid ? (
        <Section title="Diagram">
          <Suspense fallback={<p className="text-sm text-zinc-500">Loading diagram…</p>}>
            <MermaidDiagram chart={lesson.mermaid} />
          </Suspense>
        </Section>
      ) : null}

      {lesson.codeExamples.length ? (
        <Section title="D–F. Code, output, and line notes">
          <div className="space-y-8">
            {lesson.codeExamples.map((example) => (
              <div key={example.title} className="space-y-3">
                <h3 className="text-base font-medium text-zinc-200">{example.title}</h3>
                <CodeBlock title={example.title} code={example.code} />
                {example.output ? <OutputBlock output={example.output} /> : null}
                {example.explain?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    {example.explain.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {lesson.mistakes?.length ? (
        <Section title="G. Common mistakes">
          <Callout tone="warn" title="Watch out">
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {lesson.mistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Callout>
        </Section>
      ) : null}

      {lesson.interview?.length ? (
        <Section title="H. Interview perspective">
          <div className="space-y-3">
            {lesson.interview.map((item) => (
              <Callout key={item.ask} tone="interview" title={item.ask}>
                <p className="mt-1">
                  <span className="text-zinc-400">Strong answer:</span> {item.strongAnswer}
                </p>
                {item.traps?.length ? (
                  <ul className="mt-2 list-disc pl-4 text-zinc-400">
                    {item.traps.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                ) : null}
              </Callout>
            ))}
          </div>
        </Section>
      ) : null}

      {lesson.quizzes.length ? (
        <Section title="I. Quick check">
          <div className="space-y-4">
            {lesson.quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} savedAnswer={quizAnswers[quiz.id]} />
            ))}
          </div>
        </Section>
      ) : null}

      {lesson.practice ? (
        <Section title="J. Practice">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-200">{lesson.practice.prompt}</p>
            {lesson.practice.hints?.length ? (
              <details className="mt-3 text-sm text-zinc-400">
                <summary className="cursor-pointer text-zinc-300">Hints</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {lesson.practice.hints.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        </Section>
      ) : null}

      {lesson.deepDive?.length ? (
        <details className="mb-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <summary className="cursor-pointer text-sm font-medium text-zinc-200">
            Advanced / Interview Deep Dive
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-400">
            {lesson.deepDive.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <LessonNav prev={prev} next={next} />
    </article>
  );
}
