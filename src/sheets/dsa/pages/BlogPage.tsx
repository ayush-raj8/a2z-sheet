import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import roadmapData from '../../../../a2z.json';
import { hasBlog, loadBlog } from '../content/blogLoader';
import type { BlogLang, DsaBlog } from '../content/blogTypes';
import { BLOG_LANG_LABELS, BLOG_LANG_ORDER } from '../content/blogTypes';
import '../styles.css';

type RoadmapTopic = {
  id: string;
  question_title: string;
};

type RoadmapStep = {
  step_title: string;
  sub_steps?: { sub_step_title: string; topics?: RoadmapTopic[] }[];
};

const roadmap = roadmapData as RoadmapStep[];

function findTopic(id: string) {
  for (const step of roadmap) {
    for (const sub of step.sub_steps || []) {
      for (const topic of sub.topics || []) {
        if (topic.id === id) return { topic, step, sub };
      }
    }
  }
  return null;
}

function BlogBody({ blog }: { blog: DsaBlog }) {
  const [lang, setLang] = useState<BlogLang>('cpp');
  const sample = blog.languages[lang];

  return (
    <article className="blog-article">
      <header className="blog-header">
        <p className="blog-crumb">
          {blog.stepTitle} · {blog.subStepTitle}
        </p>
        <h1>{blog.title}</h1>
        <p className="blog-intro">{blog.intro}</p>
      </header>

      <section className="blog-section">
        <h2>Intuition</h2>
        <p>{blog.intuition}</p>
      </section>

      <section className="blog-section">
        <h2>Approach</h2>
        <ol>
          {blog.approach.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="blog-section">
        <h2>Complexity</h2>
        <p>
          <strong>Time:</strong> {blog.complexity.time}
          {' · '}
          <strong>Space:</strong> {blog.complexity.space}
        </p>
      </section>

      <section className="blog-section">
        <div className="blog-lang-tabs" role="tablist" aria-label="Language">
          {BLOG_LANG_ORDER.map((key) => (
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
        <pre className="blog-code">
          <code>{sample.code}</code>
        </pre>
        {sample.notes ? <p className="blog-code-notes">{sample.notes}</p> : null}
      </section>

      <section className="blog-section">
        <h2>Common pitfalls</h2>
        <ul>
          {blog.pitfalls.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function BlogLoader({ id }: { id: string }) {
  const [blog, setBlog] = useState<DsaBlog | null | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setBlog(undefined);
    setError('');
    loadBlog(id)
      .then((data) => {
        if (!cancelled) setBlog(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load blog');
          setBlog(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (blog === undefined) {
    return <p className="page-status">Loading lesson…</p>;
  }
  if (error) {
    return <p className="page-status">{error}</p>;
  }
  if (!blog) {
    return <p className="page-status">No blog found for this topic.</p>;
  }
  return <BlogBody blog={blog} />;
}

export default function BlogPage() {
  const { topicId = '' } = useParams();
  const meta = findTopic(topicId);

  if (!topicId || !hasBlog(topicId)) {
    return (
      <div className="app blog-page">
        <header className="topbar">
          <div className="topbar-copy">
            <Link to="/dsa" className="home-link">
              ← Back to sheet
            </Link>
            <h1>Blog not found</h1>
          </div>
        </header>
        <p className="page-status">
          {meta ? `No first-party blog for “${meta.topic.question_title}” yet.` : 'Unknown topic.'}
        </p>
      </div>
    );
  }

  return (
    <div className="app blog-page">
      <header className="topbar">
        <div className="topbar-copy">
          <Link to="/dsa" className="home-link">
            ← Back to sheet
          </Link>
          <p className="storage-note">First-party notes · C++ · Java · Python · Go</p>
        </div>
      </header>
      <BlogLoader id={topicId} />
    </div>
  );
}
