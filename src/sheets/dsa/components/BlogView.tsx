import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApproachBlock, BlogLang, DsaBlog } from '../content/blogTypes';
import { BLOG_LANG_LABELS, BLOG_LANG_ORDER } from '../content/blogTypes';
import inventoryData from '../content/topicInventory.json';
import AlgoViz from '../viz/AlgoViz';

type InventoryTopic = {
  topicNumber: number;
  id: string;
  title: string;
};

const inventoryTopics = (inventoryData as { topics: InventoryTopic[] }).topics;

function adjacent(id: string) {
  const idx = inventoryTopics.findIndex((t) => t.id === id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? inventoryTopics[idx - 1] : null,
    next: idx < inventoryTopics.length - 1 ? inventoryTopics[idx + 1] : null,
  };
}

function FlagBadges({ flags }: { flags?: ApproachBlock['flags'] }) {
  if (!flags?.length) return null;
  return (
    <span className="blog-flags">
      {flags.map((f) => (
        <span key={f} className={`blog-flag blog-flag-${f.toLowerCase()}`}>
          {f}
        </span>
      ))}
    </span>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <pre className="blog-code" data-lang={language || 'python'}>
      <code>{code}</code>
    </pre>
  );
}

function ApproachSection({ block }: { block: ApproachBlock }) {
  return (
    <div className="blog-approach">
      <h3>
        {block.title} <FlagBadges flags={block.flags} />
      </h3>
      <p>{block.idea}</p>
      {block.algorithm?.length ? (
        <ol>
          {block.algorithm.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      ) : null}
      {block.code ? <CodeBlock code={block.code} language={block.language || 'python'} /> : null}
      <p className="blog-complexity-line">
        <strong>Time:</strong> {block.time}
        {' · '}
        <strong>Space:</strong> {block.space}
        {block.spaceNote ? ` (${block.spaceNote})` : ''}
      </p>
      {block.whyWorks ? (
        <p>
          <strong>Why it works:</strong> {block.whyWorks}
        </p>
      ) : null}
      {block.dryRun ? (
        <div className="blog-dryrun">
          <strong>Dry run</strong>
          <pre>{block.dryRun}</pre>
        </div>
      ) : null}
      {block.limitations?.length ? (
        <ul>
          {block.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LegacyLanguageTabs({ blog }: { blog: DsaBlog }) {
  const available = BLOG_LANG_ORDER.filter((k) => blog.languages?.[k]?.code);
  const preferred = available.includes('python') ? 'python' : available[0];
  const [lang, setLang] = useState<BlogLang>(preferred || 'python');
  if (!available.length) return null;
  const sample = blog.languages?.[lang];
  if (!sample) return null;

  return (
    <section className="blog-section">
      <h2>Code</h2>
      <div className="blog-lang-tabs" role="tablist" aria-label="Language">
        {available.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={lang === key}
            className={`blog-lang-tab${lang === key ? ' active' : ''}`}
            onClick={() => setLang(key)}
          >
            {BLOG_LANG_LABELS[key]}
          </button>
        ))}
      </div>
      <CodeBlock code={sample.code} language={lang} />
      {sample.notes ? <p className="blog-code-notes">{sample.notes}</p> : null}
    </section>
  );
}

export default function BlogView({ blog }: { blog: DsaBlog }) {
  const { prev, next } = useMemo(() => adjacent(blog.id), [blog.id]);
  const mistakes = blog.commonMistakes?.length ? blog.commonMistakes : blog.pitfalls || [];
  const isReviewed = blog.quality === 'reviewed' || blog.version === 2;

  return (
    <article className="blog-article">
      <header className="blog-header">
        <p className="blog-crumb">
          <Link to="/dsa">DSA Sheet</Link>
          {' · '}
          {blog.category || blog.stepTitle}
          {' · '}
          {blog.subcategory || blog.subStepTitle}
        </p>
        <h1>
          {blog.topicNumber != null ? (
            <span className="blog-num">#{blog.topicNumber} </span>
          ) : null}
          {blog.title}
        </h1>
        <div className="blog-meta">
          {blog.topicType ? <span className="blog-pill">{blog.topicType}</span> : null}
          {blog.difficulty ? <span className="blog-pill">{blog.difficulty}</span> : null}
          {blog.pattern ? <span className="blog-pill">{blog.pattern}</span> : null}
          {!isReviewed ? <span className="blog-pill blog-pill-warn">scaffold</span> : null}
        </div>
        {blog.problemStatement ? <p className="blog-intro">{blog.problemStatement}</p> : null}
        {!blog.problemStatement && blog.intro ? <p className="blog-intro">{blog.intro}</p> : null}
        {blog.example ? (
          <pre className="blog-example">{blog.example}</pre>
        ) : null}
      </header>

      <section className="blog-section">
        <h2>Intuition</h2>
        <p>{blog.intuition}</p>
      </section>

      {blog.approaches?.map((block) => (
        <section key={block.title} className="blog-section">
          <ApproachSection block={block} />
        </section>
      ))}

      <AlgoViz topicId={blog.id} />

      {!blog.approaches?.length && blog.approach?.length ? (
        <section className="blog-section">
          <h2>Approach</h2>
          <ol>
            {blog.approach.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {blog.specialTechnique ? (
        <section className="blog-section">
          <h2>{blog.specialTechnique.title}</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{blog.specialTechnique.body}</p>
        </section>
      ) : null}

      {blog.whyWorks ? (
        <section className="blog-section">
          <h2>Why it works</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{blog.whyWorks}</p>
        </section>
      ) : null}

      {blog.complexity ? (
        <section className="blog-section">
          <h2>Complexity</h2>
          <ul>
            <li>
              <strong>Time:</strong> {blog.complexity.time}
            </li>
            <li>
              <strong>Space:</strong> {blog.complexity.space}
            </li>
            {blog.complexity.auxSpace ? (
              <li>
                <strong>Auxiliary:</strong> {blog.complexity.auxSpace}
              </li>
            ) : null}
            {blog.complexity.recursionStack ? (
              <li>
                <strong>Recursion stack:</strong> {blog.complexity.recursionStack}
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <LegacyLanguageTabs blog={blog} />

      {blog.edgeCases?.length ? (
        <section className="blog-section">
          <h2>Edge cases</h2>
          <ul>
            {blog.edgeCases.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {mistakes.length ? (
        <section className="blog-section">
          <h2>Common mistakes</h2>
          <ul>
            {mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {blog.patternRecognition?.length ? (
        <section className="blog-section">
          <h2>How to recognize this pattern</h2>
          <ul>
            {blog.patternRecognition.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {blog.followUps?.length ? (
        <section className="blog-section">
          <h2>Interview follow-ups</h2>
          <ul>
            {blog.followUps.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {blog.interviewInsight ? (
        <section className="blog-section">
          <h2>Interview insight</h2>
          <p>{blog.interviewInsight}</p>
        </section>
      ) : null}

      {blog.related?.length ? (
        <section className="blog-section">
          <h2>Related problems</h2>
          <ul>
            {blog.related.map((r) => (
              <li key={r.id}>
                <Link to={`/dsa/blog/${r.id}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="blog-nav">
        {prev ? (
          <Link to={`/dsa/blog/${prev.id}`} className="blog-nav-link">
            ← #{prev.topicNumber} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/dsa/blog/${next.id}`} className="blog-nav-link blog-nav-next">
            #{next.topicNumber} {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
